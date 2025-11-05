import { z } from 'zod';
import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { MailchimpClient } from '../lib/mailchimp-client.js';

export function createWriteTools(client: MailchimpClient): Tool[] {
  return [
    {
      name: 'mc_createCampaign',
      description: 'Create a new Mailchimp campaign. Requires type, recipients, and settings.',
      inputSchema: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            enum: ['regular', 'plaintext', 'absplit', 'rss', 'variate'],
            description: 'Campaign type',
          },
          recipients: {
            type: 'object',
            description: 'Recipients for the campaign',
            properties: {
              list_id: {
                type: 'string',
                description: 'The unique ID for the audience (list)',
              },
            },
            required: ['list_id'],
          },
          settings: {
            type: 'object',
            description: 'Campaign settings',
            properties: {
              subject_line: {
                type: 'string',
                description: 'The subject line for the campaign',
              },
              from_name: {
                type: 'string',
                description: 'The \'from\' name for the campaign',
              },
              reply_to: {
                type: 'string',
                description: 'The reply-to email address for the campaign',
              },
              title: {
                type: 'string',
                description: 'The title of the campaign',
              },
            },
          },
        },
        required: ['type', 'recipients', 'settings'],
      },
    },
    {
      name: 'mc_setCampaignContent',
      description: 'Set the content for a campaign. Requires campaignId and either plain_text or html.',
      inputSchema: {
        type: 'object',
        properties: {
          campaignId: {
            type: 'string',
            description: 'The unique ID for the campaign',
          },
          plain_text: {
            type: 'string',
            description: 'Plain text version of the campaign',
          },
          html: {
            type: 'string',
            description: 'HTML version of the campaign',
          },
        },
        required: ['campaignId'],
      },
    },
    {
      name: 'mc_sendCampaign',
      description: 'Send a campaign immediately. Requires CONFIRM_SEND=I_KNOW_WHAT_IM_DOING environment variable.',
      inputSchema: {
        type: 'object',
        properties: {
          campaignId: {
            type: 'string',
            description: 'The unique ID for the campaign to send',
          },
        },
        required: ['campaignId'],
      },
    },
  ];
}

export async function handleWriteTool(
  name: string,
  args: unknown,
  client: MailchimpClient,
  confirmSend: string
): Promise<unknown> {
  switch (name) {
    case 'mc_createCampaign': {
      const schema = z.object({
        type: z.enum(['regular', 'plaintext', 'absplit', 'rss', 'variate']),
        recipients: z.object({
          list_id: z.string().min(1),
        }),
        settings: z.object({
          subject_line: z.string().optional(),
          from_name: z.string().optional(),
          reply_to: z.string().email().optional(),
          title: z.string().optional(),
        }),
      });
      const params = schema.parse(args);
      return await client.post('/campaigns', {
        type: params.type,
        recipients: params.recipients,
        settings: params.settings,
      });
    }

    case 'mc_setCampaignContent': {
      const schema = z.object({
        campaignId: z.string().min(1),
        plain_text: z.string().optional(),
        html: z.string().optional(),
      });
      const params = schema.parse(args);
      if (!params.plain_text && !params.html) {
        throw new Error('Either plain_text or html must be provided');
      }
      const content: { plain_text?: string; html?: string } = {};
      if (params.plain_text) {
        content.plain_text = params.plain_text;
      }
      if (params.html) {
        content.html = params.html;
      }
      return await client.put(`/campaigns/${params.campaignId}/content`, content);
    }

    case 'mc_sendCampaign': {
      if (confirmSend !== 'I_KNOW_WHAT_IM_DOING') {
        throw new Error(
          'Sending campaigns requires CONFIRM_SEND=I_KNOW_WHAT_IM_DOING environment variable'
        );
      }
      const schema = z.object({
        campaignId: z.string().min(1),
      });
      const params = schema.parse(args);
      return await client.post(`/campaigns/${params.campaignId}/actions/send`, {});
    }

    default:
      throw new Error(`Unknown write tool: ${name}`);
  }
}

