import { createHash } from 'crypto';
import { z } from 'zod';
import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { MailchimpClient } from '../lib/mailchimp-client.js';

// Mailchimp IDs are alphanumeric with hyphens, typically 10-40 chars
const mailchimpIdRegex = /^[a-zA-Z0-9-]{1,64}$/;

const mailchimpIdSchema = z.string().min(1).max(64).regex(mailchimpIdRegex, {
  message: 'Invalid Mailchimp ID format',
});

export function createReadTools(client: MailchimpClient): Tool[] {
  return [
    {
      name: 'mc_ping',
      description: 'Test connection to Mailchimp MCP server. Returns { ok: true }.',
      inputSchema: {
        type: 'object',
        properties: {},
      },
    },
    {
      name: 'mc_listAudiences',
      description: 'List all Mailchimp audiences (lists). Returns audience IDs, names, member counts, and creation dates. Use this to find audience IDs before querying members.',
      inputSchema: {
        type: 'object',
        properties: {
          count: {
            type: 'number',
            description: 'Number of records to return (default: 10, max: 1000)',
          },
          offset: {
            type: 'number',
            description: 'Number of records from a collection to skip (default: 0)',
          },
        },
      },
    },
    {
      name: 'mc_getAudience',
      description: 'Get detailed information about a specific audience/list including member count, stats, and settings. Requires audienceId.',
      inputSchema: {
        type: 'object',
        properties: {
          audienceId: {
            type: 'string',
            description: 'The unique ID for the audience (list)',
          },
        },
        required: ['audienceId'],
      },
    },
    {
      name: 'mc_listMembers',
      description: 'List members in an audience. Useful for browsing subscribers, checking member status, and finding email addresses. Supports filtering by status.',
      inputSchema: {
        type: 'object',
        properties: {
          audienceId: {
            type: 'string',
            description: 'The unique ID for the audience (list)',
          },
          status: {
            type: 'string',
            enum: ['subscribed', 'unsubscribed', 'cleaned', 'pending', 'transactional'],
            description: 'Filter by member status',
          },
          count: {
            type: 'number',
            description: 'Number of records to return (default: 10, max: 1000)',
          },
          offset: {
            type: 'number',
            description: 'Number of records from a collection to skip (default: 0)',
          },
        },
        required: ['audienceId'],
      },
    },
    {
      name: 'mc_getMember',
      description: 'Get detailed information about a specific member in an audience by email address. Returns subscription status, signup date, location, and merge fields.',
      inputSchema: {
        type: 'object',
        properties: {
          audienceId: {
            type: 'string',
            description: 'The unique ID for the audience (list)',
          },
          email: {
            type: 'string',
            description: 'The member\'s email address',
          },
        },
        required: ['audienceId', 'email'],
      },
    },
    {
      name: 'mc_listCampaigns',
      description: 'List Mailchimp campaigns with optional filters. Returns campaign details including subject, status, send time, and recipient counts. Use status filter to find sent, scheduled, or draft campaigns.',
      inputSchema: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            enum: ['save', 'paused', 'schedule', 'sending', 'sent'],
            description: 'Filter by campaign status',
          },
          since_send_time: {
            type: 'string',
            description: 'Restrict response to campaigns sent after a set time (ISO 8601 format)',
          },
          count: {
            type: 'number',
            description: 'Number of records to return (default: 10, max: 1000)',
          },
          offset: {
            type: 'number',
            description: 'Number of records from a collection to skip (default: 0)',
          },
        },
      },
    },
    {
      name: 'mc_getCampaign',
      description: 'Get detailed information about a specific campaign including settings, recipients, send time, and tracking options.',
      inputSchema: {
        type: 'object',
        properties: {
          campaignId: {
            type: 'string',
            description: 'The unique ID for the campaign',
          },
        },
        required: ['campaignId'],
      },
    },
    {
      name: 'mc_getCampaignReport',
      description: 'Get analytics report for a sent campaign including opens, clicks, bounces, unsubscribes, and engagement statistics.',
      inputSchema: {
        type: 'object',
        properties: {
          campaignId: {
            type: 'string',
            description: 'The unique ID for the campaign',
          },
        },
        required: ['campaignId'],
      },
    },
    {
      name: 'mc_getAccount',
      description: 'Get account information including account name, username, email, and timezone.',
      inputSchema: {
        type: 'object',
        properties: {},
      },
    },
  ];
}

export async function handleReadTool(
  name: string,
  args: unknown,
  client: MailchimpClient
): Promise<unknown> {
  switch (name) {
    case 'mc_ping':
      return { ok: true };

    case 'mc_listAudiences': {
      const schema = z.object({
        count: z.number().int().min(1).max(1000).optional(),
        offset: z.number().int().min(0).optional(),
      });
      const params = schema.parse(args);
      // Default to reasonable limit to prevent large responses
      const count = params.count ?? 50;
      const queryParams = new URLSearchParams();
      queryParams.append('count', count.toString());
      if (params.offset !== undefined) {
        queryParams.append('offset', params.offset.toString());
      }
      const query = queryParams.toString();
      const path = `/lists${query ? `?${query}` : ''}`;
      return await client.get(path);
    }

    case 'mc_getAudience': {
      const schema = z.object({
        audienceId: mailchimpIdSchema,
      });
      const params = schema.parse(args);
      return await client.get(`/lists/${params.audienceId}`);
    }

    case 'mc_listMembers': {
      const schema = z.object({
        audienceId: mailchimpIdSchema,
        status: z.enum(['subscribed', 'unsubscribed', 'cleaned', 'pending', 'transactional']).optional(),
        count: z.number().int().min(1).max(1000).optional(),
        offset: z.number().int().min(0).optional(),
      });
      const params = schema.parse(args);
      // Default to 50 members to prevent overly large responses
      const count = params.count ?? 50;
      const queryParams = new URLSearchParams();
      if (params.status) {
        queryParams.append('status', params.status);
      }
      queryParams.append('count', count.toString());
      if (params.offset !== undefined) {
        queryParams.append('offset', params.offset.toString());
      }
      const query = queryParams.toString();
      const path = `/lists/${params.audienceId}/members${query ? `?${query}` : ''}`;
      return await client.get(path);
    }

    case 'mc_listCampaigns': {
      const schema = z.object({
        status: z.enum(['save', 'paused', 'schedule', 'sending', 'sent']).optional(),
        since_send_time: z.string().optional(),
        count: z.number().int().min(1).max(1000).optional(),
        offset: z.number().int().min(0).optional(),
      });
      const params = schema.parse(args);
      // Default to reasonable limit to prevent large responses
      const count = params.count ?? 50;
      const queryParams = new URLSearchParams();
      if (params.status) {
        queryParams.append('status', params.status);
      }
      if (params.since_send_time) {
        queryParams.append('since_send_time', params.since_send_time);
      }
      queryParams.append('count', count.toString());
      if (params.offset !== undefined) {
        queryParams.append('offset', params.offset.toString());
      }
      const query = queryParams.toString();
      const path = `/campaigns${query ? `?${query}` : ''}`;
      return await client.get(path);
    }

    case 'mc_getCampaign': {
      const schema = z.object({
        campaignId: mailchimpIdSchema,
      });
      const params = schema.parse(args);
      return await client.get(`/campaigns/${params.campaignId}`);
    }

    case 'mc_getCampaignReport': {
      const schema = z.object({
        campaignId: mailchimpIdSchema,
      });
      const params = schema.parse(args);
      return await client.get(`/reports/${params.campaignId}`);
    }

    case 'mc_getMember': {
      const schema = z.object({
        audienceId: mailchimpIdSchema,
        email: z.string().email(),
      });
      const params = schema.parse(args);
      const emailHash = createHash('md5')
        .update(params.email.toLowerCase().trim())
        .digest('hex');
      return await client.get(`/lists/${params.audienceId}/members/${emailHash}`);
    }

    case 'mc_getAccount': {
      return await client.get('/');
    }

    default:
      throw new Error(`Unknown read tool: ${name}`);
  }
}

