/**
 * Application Constants
 */

export const MAILCHIMP_BRAND = {
  primaryColor: '#FFE01B',
  secondaryColor: '#000000',
};

export const PROMPT_PREFIX = `Use Mailchimp yellow (#FFE01B) as primary color in charts. Keep responses friendly and concise.`;

// API Configuration
export const DEFAULT_PAGE_SIZE = 50;
export const MAX_PAGE_SIZE = 1000;
export const MAX_PAGINATION_OFFSET = 100000;

// Retry Configuration
export const DEFAULT_RETRY_CONFIG = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
};

// Valid Mailchimp Server Prefixes (for SSRF prevention)
export const VALID_SERVER_PREFIXES = [
  'us1', 'us2', 'us3', 'us4', 'us5', 'us6', 'us7', 'us8', 'us9', 'us10',
  'us11', 'us12', 'us13', 'us14', 'us15', 'us16', 'us17', 'us18', 'us19', 'us20', 'us21'
] as const;

// File Upload Limits
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
export const MAX_HTML_SIZE_BYTES = 1 * 1024 * 1024; // 1MB

// Validation Limits
export const MAX_EMAIL_LENGTH = 254; // RFC 5321
export const MAX_MAILCHIMP_ID_LENGTH = 64;

