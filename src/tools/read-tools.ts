import { createHash } from 'crypto';
import { z } from 'zod';
import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { MailchimpClient } from '../lib/mailchimp-client.js';
import { maskPIIInObject } from '../lib/pii-masking.js';

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
    {
      name: 'mc_listSegments',
      description: 'List segments for an audience. Segments allow you to filter and organize your audience members. Supports static and saved segments.',
      inputSchema: {
        type: 'object',
        properties: {
          audienceId: {
            type: 'string',
            description: 'The unique ID for the audience (list)',
          },
          type: {
            type: 'string',
            enum: ['static', 'saved'],
            description: 'Filter by segment type (static or saved)',
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
      name: 'mc_getSegment',
      description: 'Get detailed information about a specific segment including member count and segment conditions.',
      inputSchema: {
        type: 'object',
        properties: {
          audienceId: {
            type: 'string',
            description: 'The unique ID for the audience (list)',
          },
          segmentId: {
            type: 'string',
            description: 'The unique ID for the segment',
          },
        },
        required: ['audienceId', 'segmentId'],
      },
    },
    {
      name: 'mc_listSegmentMembers',
      description: 'List members in a specific segment. Useful for viewing which members match segment criteria.',
      inputSchema: {
        type: 'object',
        properties: {
          audienceId: {
            type: 'string',
            description: 'The unique ID for the audience (list)',
          },
          segmentId: {
            type: 'string',
            description: 'The unique ID for the segment',
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
        required: ['audienceId', 'segmentId'],
      },
    },
    {
      name: 'mc_listTags',
      description: 'List tags for an audience. Tags are used to organize and segment members.',
      inputSchema: {
        type: 'object',
        properties: {
          audienceId: {
            type: 'string',
            description: 'The unique ID for the audience (list)',
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
      name: 'mc_getTag',
      description: 'Get information about a specific tag including member count.',
      inputSchema: {
        type: 'object',
        properties: {
          audienceId: {
            type: 'string',
            description: 'The unique ID for the audience (list)',
          },
          tagId: {
            type: 'string',
            description: 'The unique ID for the tag',
          },
        },
        required: ['audienceId', 'tagId'],
      },
    },
    {
      name: 'mc_listMergeFields',
      description: 'List merge fields for an audience. Merge fields are custom fields that store additional member data.',
      inputSchema: {
        type: 'object',
        properties: {
          audienceId: {
            type: 'string',
            description: 'The unique ID for the audience (list)',
          },
          type: {
            type: 'string',
            enum: ['text', 'number', 'address', 'phone', 'date', 'url', 'imageurl', 'radio', 'dropdown', 'birthday', 'zip'],
            description: 'Filter by merge field type',
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
      name: 'mc_getMergeField',
      description: 'Get detailed information about a specific merge field including field type, options, and default value.',
      inputSchema: {
        type: 'object',
        properties: {
          audienceId: {
            type: 'string',
            description: 'The unique ID for the audience (list)',
          },
          mergeFieldId: {
            type: 'string',
            description: 'The unique ID for the merge field (often the tag name)',
          },
        },
        required: ['audienceId', 'mergeFieldId'],
      },
    },
    {
      name: 'mc_listInterestCategories',
      description: 'List interest categories for an audience. Interest categories organize interests into groups.',
      inputSchema: {
        type: 'object',
        properties: {
          audienceId: {
            type: 'string',
            description: 'The unique ID for the audience (list)',
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
      name: 'mc_getInterestCategory',
      description: 'Get detailed information about a specific interest category.',
      inputSchema: {
        type: 'object',
        properties: {
          audienceId: {
            type: 'string',
            description: 'The unique ID for the audience (list)',
          },
          interestCategoryId: {
            type: 'string',
            description: 'The unique ID for the interest category',
          },
        },
        required: ['audienceId', 'interestCategoryId'],
      },
    },
    {
      name: 'mc_listInterests',
      description: 'List interests within an interest category. Interests are sub-segments within categories.',
      inputSchema: {
        type: 'object',
        properties: {
          audienceId: {
            type: 'string',
            description: 'The unique ID for the audience (list)',
          },
          interestCategoryId: {
            type: 'string',
            description: 'The unique ID for the interest category',
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
        required: ['audienceId', 'interestCategoryId'],
      },
    },
    {
      name: 'mc_getInterest',
      description: 'Get detailed information about a specific interest including member count.',
      inputSchema: {
        type: 'object',
        properties: {
          audienceId: {
            type: 'string',
            description: 'The unique ID for the audience (list)',
          },
          interestCategoryId: {
            type: 'string',
            description: 'The unique ID for the interest category',
          },
          interestId: {
            type: 'string',
            description: 'The unique ID for the interest',
          },
        },
        required: ['audienceId', 'interestCategoryId', 'interestId'],
      },
    },
    {
      name: 'mc_listTemplates',
      description: 'List email templates. Templates are reusable email designs for campaigns.',
      inputSchema: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            enum: ['user', 'gallery', 'base'],
            description: 'Filter by template type (user, gallery, or base)',
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
      name: 'mc_getTemplate',
      description: 'Get detailed information about a specific template including HTML content and thumbnail.',
      inputSchema: {
        type: 'object',
        properties: {
          templateId: {
            type: 'string',
            description: 'The unique ID for the template',
          },
        },
        required: ['templateId'],
      },
    },
    {
      name: 'mc_listTemplateFolders',
      description: 'List template folders. Folders help organize templates.',
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
      name: 'mc_getTemplateFolder',
      description: 'Get detailed information about a specific template folder.',
      inputSchema: {
        type: 'object',
        properties: {
          folderId: {
            type: 'string',
            description: 'The unique ID for the template folder',
          },
        },
        required: ['folderId'],
      },
    },
    {
      name: 'mc_listAutomations',
      description: 'List automation workflows. Automations are triggered email sequences.',
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
      name: 'mc_getAutomation',
      description: 'Get detailed information about a specific automation workflow including status and settings.',
      inputSchema: {
        type: 'object',
        properties: {
          workflowId: {
            type: 'string',
            description: 'The unique ID for the automation workflow',
          },
        },
        required: ['workflowId'],
      },
    },
    {
      name: 'mc_listAutomationEmails',
      description: 'List emails in an automation workflow. Returns all emails in the automation sequence.',
      inputSchema: {
        type: 'object',
        properties: {
          workflowId: {
            type: 'string',
            description: 'The unique ID for the automation workflow',
          },
        },
        required: ['workflowId'],
      },
    },
    {
      name: 'mc_getAutomationEmail',
      description: 'Get detailed information about a specific email in an automation workflow.',
      inputSchema: {
        type: 'object',
        properties: {
          workflowId: {
            type: 'string',
            description: 'The unique ID for the automation workflow',
          },
          workflowEmailId: {
            type: 'string',
            description: 'The unique ID for the automation email',
          },
        },
        required: ['workflowId', 'workflowEmailId'],
      },
    },
    {
      name: 'mc_listReports',
      description: 'List all campaign reports. Returns a summary of all sent campaigns with basic statistics.',
      inputSchema: {
        type: 'object',
        properties: {
          since_send_time: {
            type: 'string',
            description: 'Restrict response to campaigns sent after a set time (ISO 8601 format)',
          },
          before_send_time: {
            type: 'string',
            description: 'Restrict response to campaigns sent before a set time (ISO 8601 format)',
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
      name: 'mc_listBatchOperations',
      description: 'List batch operations. Batch operations are asynchronous bulk operations like bulk member updates.',
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
      name: 'mc_getBatchOperation',
      description: 'Get detailed information about a specific batch operation including status, progress, and results.',
      inputSchema: {
        type: 'object',
        properties: {
          batchId: {
            type: 'string',
            description: 'The unique ID for the batch operation',
          },
        },
        required: ['batchId'],
      },
    },
    {
      name: 'mc_listConversations',
      description: 'List conversations. Conversations are email threads between your audience and your brand.',
      inputSchema: {
        type: 'object',
        properties: {
          has_unread: {
            type: 'boolean',
            description: 'Filter conversations by unread status',
          },
          list_id: {
            type: 'string',
            description: 'Filter conversations by audience (list) ID',
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
      name: 'mc_getConversation',
      description: 'Get detailed information about a specific conversation including all messages.',
      inputSchema: {
        type: 'object',
        properties: {
          conversationId: {
            type: 'string',
            description: 'The unique ID for the conversation',
          },
        },
        required: ['conversationId'],
      },
    },
    {
      name: 'mc_listConversationMessages',
      description: 'List messages in a conversation. Returns all messages in the conversation thread.',
      inputSchema: {
        type: 'object',
        properties: {
          conversationId: {
            type: 'string',
            description: 'The unique ID for the conversation',
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
        required: ['conversationId'],
      },
    },
    {
      name: 'mc_listAudienceActivity',
      description: 'List activity feed for an audience. Returns recent activity including subscribes, unsubscribes, and profile updates.',
      inputSchema: {
        type: 'object',
        properties: {
          audienceId: {
            type: 'string',
            description: 'The unique ID for the audience (list)',
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
      name: 'mc_listStores',
      description: 'List e-commerce stores connected to your Mailchimp account.',
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
      name: 'mc_getStore',
      description: 'Get detailed information about a specific e-commerce store.',
      inputSchema: {
        type: 'object',
        properties: {
          storeId: {
            type: 'string',
            description: 'The unique ID for the store',
          },
        },
        required: ['storeId'],
      },
    },
    {
      name: 'mc_listStoreProducts',
      description: 'List products in an e-commerce store.',
      inputSchema: {
        type: 'object',
        properties: {
          storeId: {
            type: 'string',
            description: 'The unique ID for the store',
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
        required: ['storeId'],
      },
    },
    {
      name: 'mc_getStoreProduct',
      description: 'Get detailed information about a specific product in a store.',
      inputSchema: {
        type: 'object',
        properties: {
          storeId: {
            type: 'string',
            description: 'The unique ID for the store',
          },
          productId: {
            type: 'string',
            description: 'The unique ID for the product',
          },
        },
        required: ['storeId', 'productId'],
      },
    },
    {
      name: 'mc_listStoreOrders',
      description: 'List orders from an e-commerce store.',
      inputSchema: {
        type: 'object',
        properties: {
          storeId: {
            type: 'string',
            description: 'The unique ID for the store',
          },
          customer_id: {
            type: 'string',
            description: 'Filter orders by customer ID',
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
        required: ['storeId'],
      },
    },
    {
      name: 'mc_getStoreOrder',
      description: 'Get detailed information about a specific order including line items and customer details.',
      inputSchema: {
        type: 'object',
        properties: {
          storeId: {
            type: 'string',
            description: 'The unique ID for the store',
          },
          orderId: {
            type: 'string',
            description: 'The unique ID for the order',
          },
        },
        required: ['storeId', 'orderId'],
      },
    },
    {
      name: 'mc_listStoreCustomers',
      description: 'List customers from an e-commerce store.',
      inputSchema: {
        type: 'object',
        properties: {
          storeId: {
            type: 'string',
            description: 'The unique ID for the store',
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
        required: ['storeId'],
      },
    },
    {
      name: 'mc_getStoreCustomer',
      description: 'Get detailed information about a specific customer including order history.',
      inputSchema: {
        type: 'object',
        properties: {
          storeId: {
            type: 'string',
            description: 'The unique ID for the store',
          },
          customerId: {
            type: 'string',
            description: 'The unique ID for the customer',
          },
        },
        required: ['storeId', 'customerId'],
      },
    },
  ];
}

export async function handleReadTool(
  name: string,
  args: unknown,
  client: MailchimpClient,
  maskPII: boolean = false
): Promise<unknown> {
  switch (name) {
    case 'mc_ping':
      return { ok: true };

    case 'mc_listAudiences': {
      const schema = z.object({
        count: z.number().int().min(1).max(1000).optional(),
        offset: z.number().int().min(0).max(100000).optional(), // Limit to prevent excessive pagination
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
        offset: z.number().int().min(0).max(100000).optional(), // Limit to prevent excessive pagination
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
      const result = await client.get(path);
      return maskPIIInObject(result, maskPII);
    }

    case 'mc_listCampaigns': {
      const schema = z.object({
        status: z.enum(['save', 'paused', 'schedule', 'sending', 'sent']).optional(),
        since_send_time: z.string().optional(),
        count: z.number().int().min(1).max(1000).optional(),
        offset: z.number().int().min(0).max(100000).optional(), // Limit to prevent excessive pagination
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
        email: z.string().email().max(254), // RFC 5321 maximum email length
      });
      const params = schema.parse(args);
      const emailHash = createHash('md5')
        .update(params.email.toLowerCase().trim())
        .digest('hex');
      const result = await client.get(`/lists/${params.audienceId}/members/${emailHash}`);
      return maskPIIInObject(result, maskPII);
    }

    case 'mc_getAccount': {
      const result = await client.get('/');
      return maskPIIInObject(result, maskPII);
    }

    case 'mc_listSegments': {
      const schema = z.object({
        audienceId: mailchimpIdSchema,
        type: z.enum(['static', 'saved']).optional(),
        count: z.number().int().min(1).max(1000).optional(),
        offset: z.number().int().min(0).max(100000).optional(), // Limit to prevent excessive pagination
      });
      const params = schema.parse(args);
      const count = params.count ?? 50;
      const queryParams = new URLSearchParams();
      if (params.type) {
        queryParams.append('type', params.type);
      }
      queryParams.append('count', count.toString());
      if (params.offset !== undefined) {
        queryParams.append('offset', params.offset.toString());
      }
      const query = queryParams.toString();
      return await client.get(`/lists/${params.audienceId}/segments${query ? `?${query}` : ''}`);
    }

    case 'mc_getSegment': {
      const schema = z.object({
        audienceId: mailchimpIdSchema,
        segmentId: mailchimpIdSchema,
      });
      const params = schema.parse(args);
      return await client.get(`/lists/${params.audienceId}/segments/${params.segmentId}`);
    }

    case 'mc_listSegmentMembers': {
      const schema = z.object({
        audienceId: mailchimpIdSchema,
        segmentId: mailchimpIdSchema,
        count: z.number().int().min(1).max(1000).optional(),
        offset: z.number().int().min(0).max(100000).optional(), // Limit to prevent excessive pagination
      });
      const params = schema.parse(args);
      const count = params.count ?? 50;
      const queryParams = new URLSearchParams();
      queryParams.append('count', count.toString());
      if (params.offset !== undefined) {
        queryParams.append('offset', params.offset.toString());
      }
      const query = queryParams.toString();
      const result = await client.get(`/lists/${params.audienceId}/segments/${params.segmentId}/members${query ? `?${query}` : ''}`);
      return maskPIIInObject(result, maskPII);
    }

    case 'mc_listTags': {
      const schema = z.object({
        audienceId: mailchimpIdSchema,
        count: z.number().int().min(1).max(1000).optional(),
        offset: z.number().int().min(0).max(100000).optional(), // Limit to prevent excessive pagination
      });
      const params = schema.parse(args);
      const count = params.count ?? 50;
      const queryParams = new URLSearchParams();
      queryParams.append('type', 'static');
      queryParams.append('count', count.toString());
      if (params.offset !== undefined) {
        queryParams.append('offset', params.offset.toString());
      }
      const query = queryParams.toString();
      return await client.get(`/lists/${params.audienceId}/segments?${query}`);
    }

    case 'mc_getTag': {
      const schema = z.object({
        audienceId: mailchimpIdSchema,
        tagId: mailchimpIdSchema,
      });
      const params = schema.parse(args);
      return await client.get(`/lists/${params.audienceId}/segments/${params.tagId}`);
    }

    case 'mc_listMergeFields': {
      const schema = z.object({
        audienceId: mailchimpIdSchema,
        type: z.enum(['text', 'number', 'address', 'phone', 'date', 'url', 'imageurl', 'radio', 'dropdown', 'birthday', 'zip']).optional(),
        count: z.number().int().min(1).max(1000).optional(),
        offset: z.number().int().min(0).max(100000).optional(), // Limit to prevent excessive pagination
      });
      const params = schema.parse(args);
      const count = params.count ?? 50;
      const queryParams = new URLSearchParams();
      if (params.type) {
        queryParams.append('type', params.type);
      }
      queryParams.append('count', count.toString());
      if (params.offset !== undefined) {
        queryParams.append('offset', params.offset.toString());
      }
      const query = queryParams.toString();
      return await client.get(`/lists/${params.audienceId}/merge-fields${query ? `?${query}` : ''}`);
    }

    case 'mc_getMergeField': {
      const schema = z.object({
        audienceId: mailchimpIdSchema,
        mergeFieldId: mailchimpIdSchema,
      });
      const params = schema.parse(args);
      return await client.get(`/lists/${params.audienceId}/merge-fields/${params.mergeFieldId}`);
    }

    case 'mc_listInterestCategories': {
      const schema = z.object({
        audienceId: mailchimpIdSchema,
        count: z.number().int().min(1).max(1000).optional(),
        offset: z.number().int().min(0).max(100000).optional(), // Limit to prevent excessive pagination
      });
      const params = schema.parse(args);
      const count = params.count ?? 50;
      const queryParams = new URLSearchParams();
      queryParams.append('count', count.toString());
      if (params.offset !== undefined) {
        queryParams.append('offset', params.offset.toString());
      }
      const query = queryParams.toString();
      return await client.get(`/lists/${params.audienceId}/interest-categories${query ? `?${query}` : ''}`);
    }

    case 'mc_getInterestCategory': {
      const schema = z.object({
        audienceId: mailchimpIdSchema,
        interestCategoryId: mailchimpIdSchema,
      });
      const params = schema.parse(args);
      return await client.get(`/lists/${params.audienceId}/interest-categories/${params.interestCategoryId}`);
    }

    case 'mc_listInterests': {
      const schema = z.object({
        audienceId: mailchimpIdSchema,
        interestCategoryId: mailchimpIdSchema,
        count: z.number().int().min(1).max(1000).optional(),
        offset: z.number().int().min(0).max(100000).optional(), // Limit to prevent excessive pagination
      });
      const params = schema.parse(args);
      const count = params.count ?? 50;
      const queryParams = new URLSearchParams();
      queryParams.append('count', count.toString());
      if (params.offset !== undefined) {
        queryParams.append('offset', params.offset.toString());
      }
      const query = queryParams.toString();
      return await client.get(`/lists/${params.audienceId}/interest-categories/${params.interestCategoryId}/interests${query ? `?${query}` : ''}`);
    }

    case 'mc_getInterest': {
      const schema = z.object({
        audienceId: mailchimpIdSchema,
        interestCategoryId: mailchimpIdSchema,
        interestId: mailchimpIdSchema,
      });
      const params = schema.parse(args);
      return await client.get(`/lists/${params.audienceId}/interest-categories/${params.interestCategoryId}/interests/${params.interestId}`);
    }

    case 'mc_listTemplates': {
      const schema = z.object({
        type: z.enum(['user', 'gallery', 'base']).optional(),
        count: z.number().int().min(1).max(1000).optional(),
        offset: z.number().int().min(0).max(100000).optional(), // Limit to prevent excessive pagination
      });
      const params = schema.parse(args);
      const count = params.count ?? 50;
      const queryParams = new URLSearchParams();
      if (params.type) {
        queryParams.append('type', params.type);
      }
      queryParams.append('count', count.toString());
      if (params.offset !== undefined) {
        queryParams.append('offset', params.offset.toString());
      }
      const query = queryParams.toString();
      return await client.get(`/templates${query ? `?${query}` : ''}`);
    }

    case 'mc_getTemplate': {
      const schema = z.object({
        templateId: mailchimpIdSchema,
      });
      const params = schema.parse(args);
      return await client.get(`/templates/${params.templateId}`);
    }

    case 'mc_listTemplateFolders': {
      const schema = z.object({
        count: z.number().int().min(1).max(1000).optional(),
        offset: z.number().int().min(0).max(100000).optional(), // Limit to prevent excessive pagination
      });
      const params = schema.parse(args);
      const count = params.count ?? 50;
      const queryParams = new URLSearchParams();
      queryParams.append('count', count.toString());
      if (params.offset !== undefined) {
        queryParams.append('offset', params.offset.toString());
      }
      const query = queryParams.toString();
      return await client.get(`/template-folders${query ? `?${query}` : ''}`);
    }

    case 'mc_getTemplateFolder': {
      const schema = z.object({
        folderId: mailchimpIdSchema,
      });
      const params = schema.parse(args);
      return await client.get(`/template-folders/${params.folderId}`);
    }

    case 'mc_listAutomations': {
      const schema = z.object({
        count: z.number().int().min(1).max(1000).optional(),
        offset: z.number().int().min(0).max(100000).optional(), // Limit to prevent excessive pagination
      });
      const params = schema.parse(args);
      const count = params.count ?? 50;
      const queryParams = new URLSearchParams();
      queryParams.append('count', count.toString());
      if (params.offset !== undefined) {
        queryParams.append('offset', params.offset.toString());
      }
      const query = queryParams.toString();
      return await client.get(`/automations${query ? `?${query}` : ''}`);
    }

    case 'mc_getAutomation': {
      const schema = z.object({
        workflowId: mailchimpIdSchema,
      });
      const params = schema.parse(args);
      return await client.get(`/automations/${params.workflowId}`);
    }

    case 'mc_listAutomationEmails': {
      const schema = z.object({
        workflowId: mailchimpIdSchema,
      });
      const params = schema.parse(args);
      return await client.get(`/automations/${params.workflowId}/emails`);
    }

    case 'mc_getAutomationEmail': {
      const schema = z.object({
        workflowId: mailchimpIdSchema,
        workflowEmailId: mailchimpIdSchema,
      });
      const params = schema.parse(args);
      return await client.get(`/automations/${params.workflowId}/emails/${params.workflowEmailId}`);
    }

    case 'mc_listReports': {
      const schema = z.object({
        since_send_time: z.string().optional(),
        before_send_time: z.string().optional(),
        count: z.number().int().min(1).max(1000).optional(),
        offset: z.number().int().min(0).max(100000).optional(), // Limit to prevent excessive pagination
      });
      const params = schema.parse(args);
      const count = params.count ?? 50;
      const queryParams = new URLSearchParams();
      if (params.since_send_time) {
        queryParams.append('since_send_time', params.since_send_time);
      }
      if (params.before_send_time) {
        queryParams.append('before_send_time', params.before_send_time);
      }
      queryParams.append('count', count.toString());
      if (params.offset !== undefined) {
        queryParams.append('offset', params.offset.toString());
      }
      const query = queryParams.toString();
      return await client.get(`/reports${query ? `?${query}` : ''}`);
    }

    case 'mc_listBatchOperations': {
      const schema = z.object({
        count: z.number().int().min(1).max(1000).optional(),
        offset: z.number().int().min(0).max(100000).optional(), // Limit to prevent excessive pagination
      });
      const params = schema.parse(args);
      const count = params.count ?? 50;
      const queryParams = new URLSearchParams();
      queryParams.append('count', count.toString());
      if (params.offset !== undefined) {
        queryParams.append('offset', params.offset.toString());
      }
      const query = queryParams.toString();
      return await client.get(`/batches${query ? `?${query}` : ''}`);
    }

    case 'mc_getBatchOperation': {
      const schema = z.object({
        batchId: mailchimpIdSchema,
      });
      const params = schema.parse(args);
      return await client.get(`/batches/${params.batchId}`);
    }

    case 'mc_listConversations': {
      const schema = z.object({
        has_unread: z.boolean().optional(),
        list_id: mailchimpIdSchema.optional(),
        count: z.number().int().min(1).max(1000).optional(),
        offset: z.number().int().min(0).max(100000).optional(), // Limit to prevent excessive pagination
      });
      const params = schema.parse(args);
      const count = params.count ?? 50;
      const queryParams = new URLSearchParams();
      if (params.has_unread !== undefined) {
        queryParams.append('has_unread', params.has_unread.toString());
      }
      if (params.list_id) {
        queryParams.append('list_id', params.list_id);
      }
      queryParams.append('count', count.toString());
      if (params.offset !== undefined) {
        queryParams.append('offset', params.offset.toString());
      }
      const query = queryParams.toString();
      const result = await client.get(`/conversations${query ? `?${query}` : ''}`);
      return maskPIIInObject(result, maskPII);
    }

    case 'mc_getConversation': {
      const schema = z.object({
        conversationId: mailchimpIdSchema,
      });
      const params = schema.parse(args);
      const result = await client.get(`/conversations/${params.conversationId}`);
      return maskPIIInObject(result, maskPII);
    }

    case 'mc_listConversationMessages': {
      const schema = z.object({
        conversationId: mailchimpIdSchema,
        count: z.number().int().min(1).max(1000).optional(),
        offset: z.number().int().min(0).max(100000).optional(), // Limit to prevent excessive pagination
      });
      const params = schema.parse(args);
      const count = params.count ?? 50;
      const queryParams = new URLSearchParams();
      queryParams.append('count', count.toString());
      if (params.offset !== undefined) {
        queryParams.append('offset', params.offset.toString());
      }
      const query = queryParams.toString();
      const result = await client.get(`/conversations/${params.conversationId}/messages${query ? `?${query}` : ''}`);
      return maskPIIInObject(result, maskPII);
    }

    case 'mc_listAudienceActivity': {
      const schema = z.object({
        audienceId: mailchimpIdSchema,
        count: z.number().int().min(1).max(1000).optional(),
        offset: z.number().int().min(0).max(100000).optional(), // Limit to prevent excessive pagination
      });
      const params = schema.parse(args);
      const count = params.count ?? 50;
      const queryParams = new URLSearchParams();
      queryParams.append('count', count.toString());
      if (params.offset !== undefined) {
        queryParams.append('offset', params.offset.toString());
      }
      const query = queryParams.toString();
      return await client.get(`/lists/${params.audienceId}/activity${query ? `?${query}` : ''}`);
    }

    case 'mc_listStores': {
      const schema = z.object({
        count: z.number().int().min(1).max(1000).optional(),
        offset: z.number().int().min(0).max(100000).optional(), // Limit to prevent excessive pagination
      });
      const params = schema.parse(args);
      const count = params.count ?? 50;
      const queryParams = new URLSearchParams();
      queryParams.append('count', count.toString());
      if (params.offset !== undefined) {
        queryParams.append('offset', params.offset.toString());
      }
      const query = queryParams.toString();
      return await client.get(`/ecommerce/stores${query ? `?${query}` : ''}`);
    }

    case 'mc_getStore': {
      const schema = z.object({
        storeId: mailchimpIdSchema,
      });
      const params = schema.parse(args);
      return await client.get(`/ecommerce/stores/${params.storeId}`);
    }

    case 'mc_listStoreProducts': {
      const schema = z.object({
        storeId: mailchimpIdSchema,
        count: z.number().int().min(1).max(1000).optional(),
        offset: z.number().int().min(0).max(100000).optional(), // Limit to prevent excessive pagination
      });
      const params = schema.parse(args);
      const count = params.count ?? 50;
      const queryParams = new URLSearchParams();
      queryParams.append('count', count.toString());
      if (params.offset !== undefined) {
        queryParams.append('offset', params.offset.toString());
      }
      const query = queryParams.toString();
      return await client.get(`/ecommerce/stores/${params.storeId}/products${query ? `?${query}` : ''}`);
    }

    case 'mc_getStoreProduct': {
      const schema = z.object({
        storeId: mailchimpIdSchema,
        productId: mailchimpIdSchema,
      });
      const params = schema.parse(args);
      return await client.get(`/ecommerce/stores/${params.storeId}/products/${params.productId}`);
    }

    case 'mc_listStoreOrders': {
      const schema = z.object({
        storeId: mailchimpIdSchema,
        customer_id: z.string().optional(),
        count: z.number().int().min(1).max(1000).optional(),
        offset: z.number().int().min(0).max(100000).optional(), // Limit to prevent excessive pagination
      });
      const params = schema.parse(args);
      const count = params.count ?? 50;
      const queryParams = new URLSearchParams();
      if (params.customer_id) {
        queryParams.append('customer_id', params.customer_id);
      }
      queryParams.append('count', count.toString());
      if (params.offset !== undefined) {
        queryParams.append('offset', params.offset.toString());
      }
      const query = queryParams.toString();
      return await client.get(`/ecommerce/stores/${params.storeId}/orders${query ? `?${query}` : ''}`);
    }

    case 'mc_getStoreOrder': {
      const schema = z.object({
        storeId: mailchimpIdSchema,
        orderId: mailchimpIdSchema,
      });
      const params = schema.parse(args);
      return await client.get(`/ecommerce/stores/${params.storeId}/orders/${params.orderId}`);
    }

    case 'mc_listStoreCustomers': {
      const schema = z.object({
        storeId: mailchimpIdSchema,
        count: z.number().int().min(1).max(1000).optional(),
        offset: z.number().int().min(0).max(100000).optional(), // Limit to prevent excessive pagination
      });
      const params = schema.parse(args);
      const count = params.count ?? 50;
      const queryParams = new URLSearchParams();
      queryParams.append('count', count.toString());
      if (params.offset !== undefined) {
        queryParams.append('offset', params.offset.toString());
      }
      const query = queryParams.toString();
      return await client.get(`/ecommerce/stores/${params.storeId}/customers${query ? `?${query}` : ''}`);
    }

    case 'mc_getStoreCustomer': {
      const schema = z.object({
        storeId: mailchimpIdSchema,
        customerId: mailchimpIdSchema,
      });
      const params = schema.parse(args);
      return await client.get(`/ecommerce/stores/${params.storeId}/customers/${params.customerId}`);
    }

    default:
      throw new Error(`Unknown read tool: ${name}`);
  }
}

