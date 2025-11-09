/**
 * Structured Logging with Pino
 *
 * Provides centralized logging configuration for the Mailchimp MCP server.
 * Logs are structured in JSON format for easy parsing and analysis.
 */

import pino from 'pino';

// Determine log level from environment
const LOG_LEVEL = process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug');

// Determine if we're in development mode
const isDevelopment = process.env.NODE_ENV !== 'production';

/**
 * Create configured logger instance
 */
export const logger = pino({
  level: LOG_LEVEL,
  // In development, use pretty printing. In production, use JSON.
  transport: isDevelopment
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
  // Base fields included in every log
  base: {
    service: 'mailchimp-mcp',
    version: '0.2.0',
  },
  // Redact sensitive data
  redact: {
    paths: [
      'apiKey',
      'api_key',
      'authorization',
      'password',
      'token',
      'secret',
      '*.apiKey',
      '*.api_key',
      '*.password',
      '*.token',
    ],
    censor: '[REDACTED]',
  },
});

/**
 * Create a child logger with additional context
 */
export function createLogger(context: Record<string, any>) {
  return logger.child(context);
}

/**
 * Log levels:
 * - trace: Very detailed debugging (not typically used)
 * - debug: Detailed debugging information
 * - info: General informational messages
 * - warn: Warning messages (something unexpected but not an error)
 * - error: Error messages (something failed)
 * - fatal: Fatal messages (application cannot continue)
 */

export default logger;
