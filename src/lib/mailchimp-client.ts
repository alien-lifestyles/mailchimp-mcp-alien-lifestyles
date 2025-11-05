import { z } from 'zod';

const RateLimitError = z.object({
  status: z.literal(429),
  title: z.string(),
  detail: z.string(),
});

const ServerError = z.object({
  status: z.number().min(500).max(599),
});

type RetryConfig = {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
};

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
};

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function calculateBackoff(attempt: number, config: RetryConfig): number {
  const delay = Math.min(
    config.initialDelayMs * Math.pow(2, attempt),
    config.maxDelayMs
  );
  return delay;
}

export class MailchimpClient {
  private baseUrl: string;
  private apiKey: string;
  private retryConfig: RetryConfig;

  constructor(apiKey: string, serverPrefix: string) {
    this.apiKey = apiKey;
    this.baseUrl = `https://${serverPrefix}.api.mailchimp.com/3.0`;
    this.retryConfig = DEFAULT_RETRY_CONFIG;
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const auth = Buffer.from(`${this.apiKey}:${this.apiKey}`).toString('base64');

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        const response = await fetch(url, {
          method,
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json',
          },
          body: body ? JSON.stringify(body) : undefined,
        });

        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After');
          const delay = retryAfter
            ? parseInt(retryAfter, 10) * 1000
            : calculateBackoff(attempt, this.retryConfig);

          if (attempt < this.retryConfig.maxRetries) {
            await sleep(delay);
            continue;
          }

          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            `Rate limit exceeded: ${JSON.stringify(errorData)}`
          );
        }

        if (response.status >= 500 && response.status < 600) {
          if (attempt < this.retryConfig.maxRetries) {
            const delay = calculateBackoff(attempt, this.retryConfig);
            await sleep(delay);
            continue;
          }

          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            `Server error ${response.status}: ${JSON.stringify(errorData)}`
          );
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            `API error ${response.status}: ${JSON.stringify(errorData)}`
          );
        }

        return await response.json();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (attempt < this.retryConfig.maxRetries) {
          const delay = calculateBackoff(attempt, this.retryConfig);
          await sleep(delay);
        }
      }
    }

    throw lastError || new Error('Request failed after retries');
  }

  async get<T>(path: string): Promise<T> {
    return this.request<T>('GET', path);
  }

  async post<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>('POST', path, body);
  }

  async put<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>('PUT', path, body);
  }

  async patch<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>('PATCH', path, body);
  }
}

