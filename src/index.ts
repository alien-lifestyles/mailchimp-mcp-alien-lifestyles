import 'dotenv/config';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { MailchimpClient } from './lib/mailchimp-client.js';
import { createReadTools, handleReadTool } from './tools/read-tools.js';
import { createWriteTools, handleWriteTool } from './tools/write-tools.js';
import { createMailchimpPrompts, getPromptTemplate } from './prompts/mailchimp-prompts.js';

const API_KEY = process.env.MAILCHIMP_API_KEY;
// Validate server prefix to prevent SSRF
const VALID_PREFIXES = ['us1', 'us2', 'us3', 'us4', 'us5', 'us6', 'us7', 'us8', 'us9', 'us10', 'us11', 'us12', 'us13', 'us14', 'us15', 'us16', 'us17', 'us18', 'us19', 'us20', 'us21'];
const SERVER_PREFIX_INPUT = process.env.MAILCHIMP_SERVER_PREFIX || 'us21';
const SERVER_PREFIX = VALID_PREFIXES.includes(SERVER_PREFIX_INPUT.toLowerCase()) 
  ? SERVER_PREFIX_INPUT.toLowerCase() 
  : 'us21';
const READONLY = process.env.MAILCHIMP_READONLY !== 'false';
const CONFIRM_SEND = process.env.CONFIRM_SEND || '';
const TRANSPORT_MODE = process.env.TRANSPORT_MODE || 'stdio';
const MASK_PII = process.env.MAILCHIMP_MASK_PII === 'true';

// Image generation API keys (optional)
const IMAGE_GEN_API_KEYS = {
  openai: process.env.OPENAI_API_KEY,
  stability: process.env.STABILITY_API_KEY,
  replicate: process.env.REPLICATE_API_KEY,
};

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
      prompts: {},
    },
  }
);

const readTools = createReadTools(client);
const writeTools = READONLY ? [] : createWriteTools(client, IMAGE_GEN_API_KEYS);
const allTools = [...readTools, ...writeTools];
const prompts = createMailchimpPrompts();

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: allTools,
  };
});

server.setRequestHandler(ListPromptsRequestSchema, async () => {
  return {
    prompts,
  };
});

server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  const prompt = prompts.find(p => p.name === name);
  if (!prompt) {
    throw new Error(`Unknown prompt: ${name}`);
  }

  const template = getPromptTemplate(name);
  
  return {
    messages: [
      {
        role: 'user',
        content: {
          type: 'text',
          text: template,
        },
      },
    ],
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
      const result = await handleWriteTool(name, args, client, CONFIRM_SEND, IMAGE_GEN_API_KEYS);
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

async function main() {
  if (TRANSPORT_MODE !== 'stdio') {
    console.error(`❌ Invalid TRANSPORT_MODE: ${TRANSPORT_MODE}. Only 'stdio' mode is supported.`);
    process.exit(1);
  }
  
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('✅ Mailchimp MCP server running via stdio.');
}

main().catch((error) => {
  console.error('Fatal error in main():', error);
  process.exit(1);
});

