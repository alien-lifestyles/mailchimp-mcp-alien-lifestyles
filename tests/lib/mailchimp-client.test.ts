import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { MailchimpClient } from '../../src/lib/mailchimp-client.js';

describe('MailchimpClient', () => {
  let client: MailchimpClient;
  const API_KEY = 'test-api-key-us9';
  const SERVER_PREFIX = 'us9';

  beforeEach(() => {
    client = new MailchimpClient(API_KEY, SERVER_PREFIX);
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with correct baseUrl', () => {
      expect(client['baseUrl']).toBe('https://us9.api.mailchimp.com/3.0');
    });

    it('should store API key', () => {
      expect(client['apiKey']).toBe(API_KEY);
    });
  });

  describe('GET requests', () => {
    it('should make successful GET request', async () => {
      const mockResponse = { data: 'test' };
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const result = await client.get('/test');
      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://us9.api.mailchimp.com/3.0/test',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('should include Authorization header', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({}),
      });

      await client.get('/test');

      const call = (global.fetch as any).mock.calls[0][1];
      expect(call.headers.Authorization).toMatch(/^Basic [A-Za-z0-9+/]+=*$/);
    });
  });

  describe('POST requests', () => {
    it('should make successful POST request with body', async () => {
      const mockBody = { name: 'Test' };
      const mockResponse = { id: '123' };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => mockResponse,
      });

      const result = await client.post('/test', mockBody);
      expect(result).toEqual(mockResponse);

      const call = (global.fetch as any).mock.calls[0];
      expect(call[1].method).toBe('POST');
      expect(call[1].body).toBe(JSON.stringify(mockBody));
    });
  });

  describe('PUT requests', () => {
    it('should make successful PUT request', async () => {
      const mockBody = { name: 'Updated' };
      const mockResponse = { id: '123', name: 'Updated' };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const result = await client.put('/test/123', mockBody);
      expect(result).toEqual(mockResponse);
      expect((global.fetch as any).mock.calls[0][1].method).toBe('PUT');
    });
  });

  describe('PATCH requests', () => {
    it('should make successful PATCH request', async () => {
      const mockBody = { name: 'Patched' };
      const mockResponse = { id: '123', name: 'Patched' };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const result = await client.patch('/test/123', mockBody);
      expect(result).toEqual(mockResponse);
      expect((global.fetch as any).mock.calls[0][1].method).toBe('PATCH');
    });
  });

  describe('DELETE requests', () => {
    it('should make successful DELETE request', async () => {
      const mockResponse = {};

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 204,
        json: async () => mockResponse,
      });

      const result = await client.delete('/test/123');
      expect(result).toEqual(mockResponse);
      expect((global.fetch as any).mock.calls[0][1].method).toBe('DELETE');
    });
  });

  // Note: Error handling and retry logic tests are complex due to timing
  // and require integration tests or fake timers. Basic functionality is tested above.
});
