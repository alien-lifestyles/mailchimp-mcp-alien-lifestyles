import 'dotenv/config';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { MailchimpClient } from './lib/mailchimp-client.js';
import { createReadTools, handleReadTool } from './tools/read-tools.js';
import { createWriteTools, handleWriteTool } from './tools/write-tools.js';
import http from 'http';

const API_KEY = process.env.MAILCHIMP_API_KEY;
// Validate server prefix to prevent SSRF
const VALID_PREFIXES = ['us1', 'us2', 'us3', 'us4', 'us5', 'us6', 'us7', 'us8', 'us9', 'us10', 'us11', 'us12', 'us13', 'us14', 'us15', 'us16', 'us17', 'us18', 'us19', 'us20', 'us21'];
const SERVER_PREFIX_INPUT = process.env.MAILCHIMP_SERVER_PREFIX || 'us21';
const SERVER_PREFIX = VALID_PREFIXES.includes(SERVER_PREFIX_INPUT.toLowerCase()) 
  ? SERVER_PREFIX_INPUT.toLowerCase() 
  : 'us21';
const READONLY = process.env.MAILCHIMP_READONLY !== 'false';
const CONFIRM_SEND = process.env.CONFIRM_SEND || '';
const PORT = parseInt(process.env.PORT || '3000', 10);
const TRANSPORT_MODE = process.env.TRANSPORT_MODE || 'stdio';
const MASK_PII = process.env.MAILCHIMP_MASK_PII === 'true';
// CORS configuration - allow specific origins or default to localhost only
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS?.split(',').map(o => o.trim()).filter(Boolean) || [];
// HTTP mode security limits
const MAX_REQUEST_BODY_SIZE = 10 * 1024 * 1024; // 10MB limit for HTTP requests

if (!API_KEY) {
  console.error('❌ MAILCHIMP_API_KEY environment variable is required');
  process.exit(1);
}

const client = new MailchimpClient(API_KEY, SERVER_PREFIX);

const server = new Server(
  {
    name: 'mailchimp-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const readTools = createReadTools(client);
const writeTools = READONLY ? [] : createWriteTools(client);
const allTools = [...readTools, ...writeTools];

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: allTools,
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    const isReadTool = readTools.some(tool => tool.name === name);
    
    if (isReadTool) {
      const result = await handleReadTool(name, args, client, MASK_PII);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result), // Compact JSON to reduce response size
          },
        ],
      };
    }

    const isWriteTool = writeTools.some(tool => tool.name === name);
    if (isWriteTool) {
      const result = await handleWriteTool(name, args, client, CONFIRM_SEND);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result), // Compact JSON to reduce response size
          },
        ],
      };
    }

    throw new Error(`Unknown tool: ${name}`);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              error: errorMessage,
            },
            null,
            2
          ),
        },
      ],
      isError: true,
    };
  }
});

async function handleHttpRequest(req: http.IncomingMessage, res: http.ServerResponse) {
  /**
   * Validate if origin is a valid localhost origin
   * Uses URL parsing to prevent subdomain attacks (e.g., evillocalhost.com)
   */
  const isValidLocalhost = (origin: string): boolean => {
    try {
      const url = new URL(origin);
      // Allow localhost, 127.0.0.1, and IPv6 localhost
      return url.hostname === 'localhost' || 
             url.hostname === '127.0.0.1' ||
             url.hostname === '[::1]' ||
             url.hostname === '::1';
    } catch {
      return false;
    }
  };

  /**
   * Set CORS headers with security restrictions
   * Default: Only allow localhost origins for security
   * Override: Set ALLOWED_ORIGINS environment variable with comma-separated origins
   */
  const setCors = () => {
    const origin = req.headers.origin;
    
    // If ALLOWED_ORIGINS is configured, use it
    if (ALLOWED_ORIGINS.length > 0) {
      if (origin && ALLOWED_ORIGINS.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
      }
      // If origin not in allowed list, don't set CORS header (browser will block)
    } else {
      // Default: Only allow localhost for development (with strict validation)
      if (origin && isValidLocalhost(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
      }
    }
    
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
  };

  /**
   * Set security headers to prevent common attacks
   */
  const setSecurityHeaders = () => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    // Only set HSTS if using HTTPS (skip for local development)
    if (req.headers['x-forwarded-proto'] === 'https') {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }
  };

  if (req.method === 'OPTIONS') {
    setCors();
    setSecurityHeaders();
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.method === 'GET' && (req.url === '/' || req.url === '/health')) {
    setCors();
    setSecurityHeaders();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        status: 'ok',
        service: 'mailchimp-mcp',
        version: '1.0.0',
        protocol: 'mcp',
        endpoint: '/sse',
        capabilities: ['tools'],
      })
    );
    return;
  }

  if ((req.method === 'GET' || req.method === 'POST') && req.url === '/sse') {
    setCors();
    setSecurityHeaders();
    
    // Immediately send headers to establish connection
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    });

    const sendSSEMessage = (data: string) => {
      try {
        res.write(`data: ${data}\n\n`);
      } catch (error) {
        // Connection closed
      }
    };

    const handleMCPMessage = async (mcpMessage: any) => {
      try {
        if (!mcpMessage.jsonrpc || mcpMessage.jsonrpc !== '2.0') {
          sendSSEMessage(
            JSON.stringify({
              jsonrpc: '2.0',
              id: mcpMessage.id || null,
              error: { code: -32600, message: 'Invalid Request' },
            })
          );
          return;
        }

        let response: unknown;

        if (mcpMessage.method === 'tools/list') {
          response = {
            jsonrpc: '2.0',
            id: mcpMessage.id,
            result: {
              tools: allTools,
            },
          };
        } else if (mcpMessage.method === 'tools/call') {
          const { name, arguments: args } = mcpMessage.params || {};

          const isReadTool = readTools.some(tool => tool.name === name);
          const isWriteTool = writeTools.some(tool => tool.name === name);

          if (!isReadTool && !isWriteTool) {
            response = {
              jsonrpc: '2.0',
              id: mcpMessage.id,
              error: {
                code: -32601,
                message: `Unknown tool: ${name}`,
              },
            };
          } else {
            try {
              let result: unknown;
              if (isReadTool) {
                result = await handleReadTool(name, args, client, MASK_PII);
              } else {
                result = await handleWriteTool(name, args, client, CONFIRM_SEND);
              }

              response = {
                jsonrpc: '2.0',
                id: mcpMessage.id,
                result: {
                  content: [
                    {
                      type: 'text',
                      text: JSON.stringify(result, null, 2),
                    },
                  ],
                },
              };
            } catch (error) {
              response = {
                jsonrpc: '2.0',
                id: mcpMessage.id,
                error: {
                  code: -32603,
                  message: error instanceof Error ? error.message : String(error),
                },
              };
            }
          }
        } else if (mcpMessage.method === 'initialize') {
          response = {
            jsonrpc: '2.0',
            id: mcpMessage.id,
            result: {
              protocolVersion: '2024-11-05',
              capabilities: {
                tools: {},
              },
              serverInfo: {
                name: 'mailchimp-mcp',
                version: '1.0.0',
              },
            },
          };
        } else {
          response = {
            jsonrpc: '2.0',
            id: mcpMessage.id,
            error: {
              code: -32601,
              message: `Method not found: ${mcpMessage.method}`,
            },
          };
        }

        sendSSEMessage(JSON.stringify(response));
      } catch (error) {
        sendSSEMessage(
          JSON.stringify({
            jsonrpc: '2.0',
            id: mcpMessage?.id || null,
            error: {
              code: -32603,
              message: error instanceof Error ? error.message : String(error),
            },
          })
        );
      }
    };

    // Send initial ping to establish connection
    sendSSEMessage(JSON.stringify({
      jsonrpc: '2.0',
      method: 'ping',
    }));

    if (req.method === 'POST') {
      let body = '';
      let bodySize = 0;
      
      req.on('data', (chunk) => {
        bodySize += chunk.length;
        // Enforce maximum request body size to prevent DoS attacks
        if (bodySize > MAX_REQUEST_BODY_SIZE) {
          req.destroy(); // Stop reading
          sendSSEMessage(
            JSON.stringify({
              jsonrpc: '2.0',
              id: null,
              error: {
                code: -32600,
                message: `Request body too large. Maximum size: ${MAX_REQUEST_BODY_SIZE / 1024 / 1024}MB`,
              },
            })
          );
          return;
        }
        body += chunk.toString();
      });
      
      req.on('end', async () => {
        // Double-check size after all data is received
        if (bodySize > MAX_REQUEST_BODY_SIZE) {
          sendSSEMessage(
            JSON.stringify({
              jsonrpc: '2.0',
              id: null,
              error: {
                code: -32600,
                message: `Request body too large. Maximum size: ${MAX_REQUEST_BODY_SIZE / 1024 / 1024}MB`,
              },
            })
          );
          return;
        }
        try {
          if (body.trim()) {
            const lines = body.split('\n');
            let foundMessage = false;
            
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const mcpMessage = JSON.parse(line.slice(6));
                  await handleMCPMessage(mcpMessage);
                  foundMessage = true;
                } catch (error) {
                  sendSSEMessage(
                    JSON.stringify({
                      jsonrpc: '2.0',
                      id: null,
                      error: {
                        code: -32700,
                        message: 'Parse error',
                      },
                    })
                  );
                }
              }
            }
            
            if (!foundMessage) {
              try {
                const mcpMessage = JSON.parse(body);
                await handleMCPMessage(mcpMessage);
              } catch (error) {
                sendSSEMessage(
                  JSON.stringify({
                    jsonrpc: '2.0',
                    id: null,
                    error: {
                      code: -32700,
                      message: 'Parse error',
                    },
                  })
                );
              }
            }
          }
        } catch (error) {
          sendSSEMessage(
            JSON.stringify({
              jsonrpc: '2.0',
              id: null,
              error: {
                code: -32700,
                message: 'Parse error',
              },
            })
          );
        }
      });
    } else {
      // For GET requests, send initialize notification
      sendSSEMessage(
        JSON.stringify({
          jsonrpc: '2.0',
          method: 'initialize',
          params: {
            protocolVersion: '2024-11-05',
            capabilities: {
              tools: {},
            },
            serverInfo: {
              name: 'mailchimp-mcp',
              version: '1.0.0',
            },
          },
        })
      );
    }

    const keepAlive = setInterval(() => {
      try {
        res.write(': keepalive\n\n');
      } catch (error) {
        clearInterval(keepAlive);
      }
    }, 15000);

    req.on('close', () => {
      clearInterval(keepAlive);
      try {
        res.end();
      } catch (error) {
        // Already closed
      }
    });

    req.on('error', () => {
      clearInterval(keepAlive);
      try {
        res.end();
      } catch (error) {
        // Already closed
      }
    });

    return;
  }

  setCors();
  setSecurityHeaders();
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
}

async function main() {
  if (TRANSPORT_MODE === 'http') {
    const httpServer = http.createServer(handleHttpRequest);

    httpServer.listen(PORT, () => {
      console.error(`✅ Mailchimp MCP server running on http://localhost:${PORT}`);
      console.error(`   SSE endpoint: http://localhost:${PORT}/sse`);
    });
  } else {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('✅ Mailchimp MCP server running via stdio.');
  }
}

main().catch((error) => {
  console.error('Fatal error in main():', error);
  process.exit(1);
});

