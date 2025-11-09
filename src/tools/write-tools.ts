import { createHash } from 'crypto';
import { z } from 'zod';
import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { MailchimpClient } from '../lib/mailchimp-client.js';
import { validateMTLTemplate } from '../lib/mtl-validation.js';

// Mailchimp IDs are alphanumeric with hyphens, typically 10-40 chars
const mailchimpIdRegex = /^[a-zA-Z0-9-]{1,64}$/;

const mailchimpIdSchema = z.string().min(1).max(64).regex(mailchimpIdRegex, {
  message: 'Invalid Mailchimp ID format',
});

export function createWriteTools(
  client: MailchimpClient
): Tool[] {
  return [
    {
      name: 'mc_createCampaign',
      description: 'Create a new Mailchimp campaign',
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
      description: 'Set campaign content',
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
      description: 'Send a campaign immediately',
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
    {
      name: 'mc_createTemplate',
      description: 'Create template with MTL validation',
      inputSchema: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'The name of the template',
          },
          html: {
            type: 'string',
            description: 'The HTML content of the template. Should include MTL attributes like mc:edit for editable content areas.',
          },
          folder_id: {
            type: 'string',
            description: 'Optional: The folder ID to place the template in',
          },
        },
        required: ['name', 'html'],
      },
    },
    {
      name: 'mc_updateTemplate',
      description: 'Update template',
      inputSchema: {
        type: 'object',
        properties: {
          templateId: {
            type: 'string',
            description: 'The unique ID for the template',
          },
          name: {
            type: 'string',
            description: 'The new name for the template',
          },
          html: {
            type: 'string',
            description: 'The updated HTML content of the template',
          },
        },
        required: ['templateId'],
      },
    },
    {
      name: 'mc_deleteTemplate',
      description: 'Delete template',
      inputSchema: {
        type: 'object',
        properties: {
          templateId: {
            type: 'string',
            description: 'The unique ID for the template to delete',
          },
        },
        required: ['templateId'],
      },
    },
    {
      name: 'mc_uploadFile',
      description: 'Upload file to File Manager',
      inputSchema: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'The name of the file',
          },
          file_data: {
            type: 'string',
            description: 'Base64-encoded file data',
          },
          folder_id: {
            type: 'string',
            description: 'Optional: The folder ID to place the file in',
          },
        },
        required: ['name', 'file_data'],
      },
    },
    {
      name: 'mc_createTemplateFolder',
      description: 'Create template folder',
      inputSchema: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'The name of the folder',
          },
        },
        required: ['name'],
      },
    },
    {
      name: 'mc_createFileFolder',
      description: 'Create file folder',
      inputSchema: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'The name of the folder',
          },
        },
        required: ['name'],
      },
    },
    {
      name: 'mc_createAudience',
      description: 'Create a new Mailchimp audience',
      inputSchema: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'The name of the audience',
          },
          contact: {
            type: 'object',
            description: 'Contact information for the audience',
            properties: {
              company: {
                type: 'string',
                description: 'Company name',
              },
              address1: {
                type: 'string',
                description: 'Street address',
              },
              city: {
                type: 'string',
                description: 'City',
              },
              state: {
                type: 'string',
                description: 'State or province',
              },
              zip: {
                type: 'string',
                description: 'ZIP or postal code',
              },
              country: {
                type: 'string',
                description: 'Two-letter ISO 3166-1 country code (e.g., US, CA, GB)',
              },
            },
            required: ['company', 'address1', 'city', 'state', 'zip', 'country'],
          },
          permission_reminder: {
            type: 'string',
            description: 'Reminder for contacts about how they joined your list',
          },
          campaign_defaults: {
            type: 'object',
            description: 'Default values for campaigns sent to this audience',
            properties: {
              from_name: {
                type: 'string',
                description: 'Default from name for campaigns',
              },
              from_email: {
                type: 'string',
                description: 'Default from email address for campaigns',
              },
              subject: {
                type: 'string',
                description: 'Default subject line for campaigns',
              },
              language: {
                type: 'string',
                description: 'Default language code (e.g., EN_US)',
              },
            },
            required: ['from_name', 'from_email', 'subject', 'language'],
          },
          email_type_option: {
            type: 'boolean',
            description: 'Whether to allow contacts to choose between HTML and plain-text emails',
          },
        },
        required: ['name', 'contact', 'permission_reminder', 'campaign_defaults', 'email_type_option'],
      },
    },
    {
      name: 'mc_updateAudience',
      description: 'Update audience settings',
      inputSchema: {
        type: 'object',
        properties: {
          audienceId: {
            type: 'string',
            description: 'The unique ID for the audience (list) to update',
          },
          name: {
            type: 'string',
            description: 'The new name of the audience',
          },
          contact: {
            type: 'object',
            description: 'Contact information for the audience (all fields optional)',
            properties: {
              company: {
                type: 'string',
                description: 'Company name',
              },
              address1: {
                type: 'string',
                description: 'Street address',
              },
              city: {
                type: 'string',
                description: 'City',
              },
              state: {
                type: 'string',
                description: 'State or province',
              },
              zip: {
                type: 'string',
                description: 'ZIP or postal code',
              },
              country: {
                type: 'string',
                description: 'Two-letter ISO 3166-1 country code (e.g., US, CA, GB)',
              },
            },
          },
          permission_reminder: {
            type: 'string',
            description: 'Reminder for contacts about how they joined your list',
          },
          campaign_defaults: {
            type: 'object',
            description: 'Default values for campaigns sent to this audience (all fields optional)',
            properties: {
              from_name: {
                type: 'string',
                description: 'Default from name for campaigns',
              },
              from_email: {
                type: 'string',
                description: 'Default from email address for campaigns',
              },
              subject: {
                type: 'string',
                description: 'Default subject line for campaigns',
              },
              language: {
                type: 'string',
                description: 'Default language code (e.g., EN_US)',
              },
            },
          },
          email_type_option: {
            type: 'boolean',
            description: 'Whether to allow contacts to choose between HTML and plain-text emails',
          },
        },
        required: ['audienceId'],
      },
    },
    {
      name: 'mc_createSegment',
      description: 'Create segment',
      inputSchema: {
        type: 'object',
        properties: {
          audienceId: {
            type: 'string',
            description: 'The unique ID for the audience (list)',
          },
          name: {
            type: 'string',
            description: 'The name of the segment',
          },
          static_segment: {
            type: 'array',
            description: 'For static segments: Array of email addresses to include. Leave empty for saved segments.',
            items: {
              type: 'string',
            },
          },
          conditions: {
            type: 'array',
            description: 'For saved segments: Array of condition objects. Each condition has field, op (operator), and value.',
            items: {
              type: 'object',
            },
          },
        },
        required: ['audienceId', 'name'],
      },
    },
    {
      name: 'mc_addTagToMember',
      description: 'Add or remove tags from member',
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
          tags: {
            type: 'array',
            description: 'Array of tag objects with name and status (active to add, inactive to remove)',
            items: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  description: 'The name of the tag',
                },
                status: {
                  type: 'string',
                  enum: ['active', 'inactive'],
                  description: 'active to add the tag, inactive to remove it',
                },
              },
              required: ['name', 'status'],
            },
          },
        },
        required: ['audienceId', 'email', 'tags'],
      },
    },
    {
      name: 'mc_createMergeField',
      description: 'Create merge field',
      inputSchema: {
        type: 'object',
        properties: {
          audienceId: {
            type: 'string',
            description: 'The unique ID for the audience (list)',
          },
          name: {
            type: 'string',
            description: 'The name of the merge field (e.g., "Birthday", "Company Name")',
          },
          type: {
            type: 'string',
            enum: ['text', 'number', 'address', 'phone', 'date', 'url', 'imageurl', 'radio', 'dropdown', 'birthday', 'zip'],
            description: 'The data type of the merge field',
          },
          tag: {
            type: 'string',
            description: 'The tag used in Mailchimp templates (e.g., "BIRTHDAY", "COMPANY"). Must be uppercase, alphanumeric, and max 10 characters',
          },
          required: {
            type: 'boolean',
            description: 'Whether this field is required when adding members',
          },
          public: {
            type: 'boolean',
            description: 'Whether this field is visible to members in their preferences',
          },
          default_value: {
            type: 'string',
            description: 'Default value for the field',
          },
          options: {
            type: 'object',
            description: 'Options for dropdown, radio, or other field types',
            properties: {
              choices: {
                type: 'array',
                description: 'Array of choice strings for dropdown/radio fields',
                items: {
                  type: 'string',
                },
              },
            },
          },
        },
        required: ['audienceId', 'name', 'type', 'tag'],
      },
    },
    {
      name: 'mc_updateCampaign',
      description: 'Update campaign settings',
      inputSchema: {
        type: 'object',
        properties: {
          campaignId: {
            type: 'string',
            description: 'The unique ID for the campaign',
          },
          settings: {
            type: 'object',
            description: 'Campaign settings to update',
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
        required: ['campaignId'],
      },
    },
    {
      name: 'mc_deleteCampaign',
      description: 'Delete a campaign',
      inputSchema: {
        type: 'object',
        properties: {
          campaignId: {
            type: 'string',
            description: 'The unique ID for the campaign to delete',
          },
        },
        required: ['campaignId'],
      },
    },
    {
      name: 'mc_createMember',
      description: 'Add a member to an audience',
      inputSchema: {
        type: 'object',
        properties: {
          audienceId: {
            type: 'string',
            description: 'The unique ID for the audience (list)',
          },
          email_address: {
            type: 'string',
            description: 'The member\'s email address',
          },
          status: {
            type: 'string',
            enum: ['subscribed', 'unsubscribed', 'cleaned', 'pending', 'transactional'],
            description: 'Subscription status for the member',
          },
          merge_fields: {
            type: 'object',
            description: 'Merge fields for the member',
          },
          tags: {
            type: 'array',
            description: 'Tags to apply to the member',
            items: {
              type: 'string',
            },
          },
        },
        required: ['audienceId', 'email_address', 'status'],
      },
    },
    {
      name: 'mc_updateMember',
      description: 'Update member information',
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
          email_address: {
            type: 'string',
            description: 'New email address (if changing)',
          },
          status: {
            type: 'string',
            enum: ['subscribed', 'unsubscribed', 'cleaned', 'pending', 'transactional'],
            description: 'Subscription status',
          },
          merge_fields: {
            type: 'object',
            description: 'Merge fields to update',
          },
        },
        required: ['audienceId', 'email'],
      },
    },
    {
      name: 'mc_deleteMember',
      description: 'Delete a member from an audience',
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
      name: 'mc_deleteAudience',
      description: 'Delete an audience',
      inputSchema: {
        type: 'object',
        properties: {
          audienceId: {
            type: 'string',
            description: 'The unique ID for the audience to delete',
          },
        },
        required: ['audienceId'],
      },
    },
    {
      name: 'mc_updateSegment',
      description: 'Update a segment',
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
          name: {
            type: 'string',
            description: 'New name for the segment',
          },
          conditions: {
            type: 'array',
            description: 'Updated conditions for saved segments',
            items: {
              type: 'object',
              properties: {
                field: {
                  type: 'string',
                },
                op: {
                  type: 'string',
                },
                value: {
                  type: 'string',
                },
              },
            },
          },
        },
        required: ['audienceId', 'segmentId'],
      },
    },
    {
      name: 'mc_deleteSegment',
      description: 'Delete a segment',
      inputSchema: {
        type: 'object',
        properties: {
          audienceId: {
            type: 'string',
            description: 'The unique ID for the audience (list)',
          },
          segmentId: {
            type: 'string',
            description: 'The unique ID for the segment to delete',
          },
        },
        required: ['audienceId', 'segmentId'],
      },
    },
    {
      name: 'mc_createTag',
      description: 'Create a tag',
      inputSchema: {
        type: 'object',
        properties: {
          audienceId: {
            type: 'string',
            description: 'The unique ID for the audience (list)',
          },
          name: {
            type: 'string',
            description: 'The name of the tag',
          },
        },
        required: ['audienceId', 'name'],
      },
    },
    {
      name: 'mc_deleteTag',
      description: 'Delete a tag',
      inputSchema: {
        type: 'object',
        properties: {
          audienceId: {
            type: 'string',
            description: 'The unique ID for the audience (list)',
          },
          tagId: {
            type: 'string',
            description: 'The unique ID for the tag to delete',
          },
        },
        required: ['audienceId', 'tagId'],
      },
    },
    {
      name: 'mc_updateMergeField',
      description: 'Update a merge field',
      inputSchema: {
        type: 'object',
        properties: {
          audienceId: {
            type: 'string',
            description: 'The unique ID for the audience (list)',
          },
          mergeFieldId: {
            type: 'string',
            description: 'The unique ID for the merge field',
          },
          name: {
            type: 'string',
            description: 'New name for the merge field',
          },
          required: {
            type: 'boolean',
            description: 'Whether this field is required',
          },
          public: {
            type: 'boolean',
            description: 'Whether this field is visible to members',
          },
          default_value: {
            type: 'string',
            description: 'Default value for the field',
          },
          options: {
            type: 'object',
            description: 'Options for dropdown, radio, or other field types',
            properties: {
              choices: {
                type: 'array',
                description: 'Array of choice strings',
                items: {
                  type: 'string',
                },
              },
            },
          },
        },
        required: ['audienceId', 'mergeFieldId'],
      },
    },
    {
      name: 'mc_deleteMergeField',
      description: 'Delete a merge field',
      inputSchema: {
        type: 'object',
        properties: {
          audienceId: {
            type: 'string',
            description: 'The unique ID for the audience (list)',
          },
          mergeFieldId: {
            type: 'string',
            description: 'The unique ID for the merge field to delete',
          },
        },
        required: ['audienceId', 'mergeFieldId'],
      },
    },
    {
      name: 'mc_deleteFile',
      description: 'Delete a file from File Manager',
      inputSchema: {
        type: 'object',
        properties: {
          fileId: {
            type: 'string',
            description: 'The unique ID for the file to delete',
          },
        },
        required: ['fileId'],
      },
    },
    {
      name: 'mc_deleteTemplateFolder',
      description: 'Delete a template folder',
      inputSchema: {
        type: 'object',
        properties: {
          folderId: {
            type: 'string',
            description: 'The unique ID for the template folder to delete',
          },
        },
        required: ['folderId'],
      },
    },
    {
      name: 'mc_deleteFileFolder',
      description: 'Delete a file folder',
      inputSchema: {
        type: 'object',
        properties: {
          folderId: {
            type: 'string',
            description: 'The unique ID for the file folder to delete',
          },
        },
        required: ['folderId'],
      },
    },
    {
      name: 'mc_createVerifiedDomain',
      description: 'Add a domain for verification',
      inputSchema: {
        type: 'object',
        properties: {
          domain: {
            type: 'string',
            description: 'The domain name to verify (e.g., example.com). Can also be an email address (e.g., user@example.com) - the domain will be extracted automatically.',
          },
          verification_email: {
            type: 'string',
            description: 'Email address to send verification to (required by Mailchimp API). If not provided and domain is an email, will use the email address.',
          },
        },
        required: ['domain'],
      },
    },
    {
      name: 'mc_deleteVerifiedDomain',
      description: 'Delete a verified domain. Use the exact domain name as returned by mc_listVerifiedDomains or mc_getVerifiedDomain.',
      inputSchema: {
        type: 'object',
        properties: {
          domainName: {
            type: 'string',
            description: 'The exact domain name to delete (use domain from mc_listVerifiedDomains for exact format)',
          },
        },
        required: ['domainName'],
      },
    },
    {
      name: 'mc_sendDomainVerificationEmail',
      description: 'Send domain verification email',
      inputSchema: {
        type: 'object',
        properties: {
          domainName: {
            type: 'string',
            description: 'The domain name to verify (e.g., example.com)',
          },
          email: {
            type: 'string',
            description: 'Email address to send verification to',
          },
        },
        required: ['domainName', 'email'],
      },
    },
    {
      name: 'mc_deleteStore',
      description: 'Delete an e-commerce store',
      inputSchema: {
        type: 'object',
        properties: {
          storeId: {
            type: 'string',
            description: 'The unique ID for the store to delete',
          },
        },
        required: ['storeId'],
      },
    },
  ];
}

export async function handleWriteTool(
  name: string,
  args: unknown,
  client: MailchimpClient
): Promise<unknown> {
  switch (name) {
    case 'mc_createCampaign': {
      const schema = z.object({
        type: z.enum(['regular', 'plaintext', 'absplit', 'rss', 'variate']),
        recipients: z.object({
          list_id: mailchimpIdSchema,
        }),
        settings: z.object({
          subject_line: z.string().optional(),
          from_name: z.string().optional(),
          reply_to: z.string().email().max(254).optional(), // RFC 5321 maximum email length
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
        campaignId: mailchimpIdSchema,
        plain_text: z.string().max(1000000).optional(), // ~1MB limit
        html: z.string().max(1000000).optional(), // ~1MB limit
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
        // Note: HTML content is not sanitized - ensure it's safe before sending
        content.html = params.html;
      }
      return await client.put(`/campaigns/${params.campaignId}/content`, content);
    }

    case 'mc_sendCampaign': {
      const schema = z.object({
        campaignId: mailchimpIdSchema,
      });
      const params = schema.parse(args);
      return await client.post(`/campaigns/${params.campaignId}/actions/send`, {});
    }

    case 'mc_createTemplate': {
      const schema = z.object({
        name: z.string().min(1).max(100),
        html: z.string().min(1).max(1000000), // ~1MB limit
        folder_id: mailchimpIdSchema.optional(),
      });
      const params = schema.parse(args);
      
      // Validate MTL compliance
      const validation = validateMTLTemplate(params.html);
      if (!validation.isValid) {
        throw new Error(
          `MTL validation failed: ${validation.errors.join('; ')}. Warnings: ${validation.warnings.join('; ')}`
        );
      }
      
      // Log warnings but don't fail
      if (validation.warnings.length > 0) {
        console.warn('MTL validation warnings:', validation.warnings);
      }
      
      const body: {
        name: string;
        html: string;
        folder_id?: string;
      } = {
        name: params.name,
        html: params.html,
      };
      
      if (params.folder_id) {
        body.folder_id = params.folder_id;
      }
      
      return await client.post('/templates', body);
    }

    case 'mc_updateTemplate': {
      const schema = z.object({
        templateId: mailchimpIdSchema,
        name: z.string().min(1).max(100).optional(),
        html: z.string().min(1).max(1000000).optional(),
      });
      const params = schema.parse(args);
      
      if (!params.name && !params.html) {
        throw new Error('Either name or html must be provided');
      }
      
      const body: {
        name?: string;
        html?: string;
      } = {};
      
      if (params.name) {
        body.name = params.name;
      }
      
      if (params.html) {
        // Validate MTL compliance
        const validation = validateMTLTemplate(params.html);
        if (!validation.isValid) {
          throw new Error(
            `MTL validation failed: ${validation.errors.join('; ')}. Warnings: ${validation.warnings.join('; ')}`
          );
        }
        
        if (validation.warnings.length > 0) {
          console.warn('MTL validation warnings:', validation.warnings);
        }
        
        body.html = params.html;
      }
      
      return await client.patch(`/templates/${params.templateId}`, body);
    }

    case 'mc_deleteTemplate': {
      const schema = z.object({
        templateId: mailchimpIdSchema,
      });
      const params = schema.parse(args);
      return await client.delete(`/templates/${params.templateId}`);
    }

    case 'mc_uploadFile': {
      const schema = z.object({
        name: z.string().min(1).max(255),
        file_data: z.string().min(1), // Base64 encoded
        folder_id: mailchimpIdSchema.optional(),
      });
      const params = schema.parse(args);
      
      // Validate base64 format
      const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
      if (!base64Regex.test(params.file_data)) {
        throw new Error('Invalid base64 file data format');
      }
      
      // Check file size (base64 is ~33% larger than original)
      const estimatedSize = (params.file_data.length * 3) / 4;
      if (estimatedSize > 10 * 1024 * 1024) { // 10MB limit
        throw new Error('File size exceeds 10MB limit');
      }
      
      const body: {
        name: string;
        file_data: string;
        folder_id?: string;
      } = {
        name: params.name,
        file_data: params.file_data,
      };
      
      if (params.folder_id) {
        body.folder_id = params.folder_id;
      }
      
      return await client.post('/file-manager/files', body);
    }

    case 'mc_createTemplateFolder': {
      const schema = z.object({
        name: z.string().min(1).max(100),
      });
      const params = schema.parse(args);
      return await client.post('/template-folders', { name: params.name });
    }

    case 'mc_createFileFolder': {
      const schema = z.object({
        name: z.string().min(1).max(100),
      });
      const params = schema.parse(args);
      return await client.post('/file-manager/folders', { name: params.name });
    }

    case 'mc_createAudience': {
      const schema = z.object({
        name: z.string().min(1).max(100),
        contact: z.object({
          company: z.string().min(1).max(100),
          address1: z.string().min(1).max(100),
          city: z.string().min(1).max(50),
          state: z.string().min(1).max(50),
          zip: z.string().min(1).max(20),
          country: z.string().length(2).regex(/^[A-Z]{2}$/, {
            message: 'Country must be a two-letter ISO 3166-1 code (e.g., US, CA, GB)',
          }),
        }),
        permission_reminder: z.string().min(1).max(500),
        campaign_defaults: z.object({
          from_name: z.string().min(1).max(100),
          from_email: z.string().email().max(254),
          subject: z.string().min(1).max(200),
          language: z.string().min(2).max(10),
        }),
        email_type_option: z.boolean(),
      });
      const params = schema.parse(args);
      return await client.post('/lists', {
        name: params.name,
        contact: params.contact,
        permission_reminder: params.permission_reminder,
        campaign_defaults: params.campaign_defaults,
        email_type_option: params.email_type_option,
      });
    }

    case 'mc_updateAudience': {
      const schema = z.object({
        audienceId: mailchimpIdSchema,
        name: z.string().min(1).max(100).optional(),
        contact: z.object({
          company: z.string().min(1).max(100).optional(),
          address1: z.string().min(1).max(100).optional(),
          city: z.string().min(1).max(50).optional(),
          state: z.string().min(1).max(50).optional(),
          zip: z.string().min(1).max(20).optional(),
          country: z.string().length(2).regex(/^[A-Z]{2}$/, {
            message: 'Country must be a two-letter ISO 3166-1 code (e.g., US, CA, GB)',
          }).optional(),
        }).optional(),
        permission_reminder: z.string().min(1).max(500).optional(),
        campaign_defaults: z.object({
          from_name: z.string().min(1).max(100).optional(),
          from_email: z.string().email().max(254).optional(),
          subject: z.string().min(1).max(200).optional(),
          language: z.string().min(2).max(10).optional(),
        }).optional(),
        email_type_option: z.boolean().optional(),
      });
      const params = schema.parse(args);
      
      // Validate that at least one field is being updated
      if (!params.name && !params.contact && !params.permission_reminder && 
          !params.campaign_defaults && params.email_type_option === undefined) {
        throw new Error('At least one field must be provided to update (name, contact, permission_reminder, campaign_defaults, or email_type_option)');
      }
      
      const body: {
        name?: string;
        contact?: {
          company?: string;
          address1?: string;
          city?: string;
          state?: string;
          zip?: string;
          country?: string;
        };
        permission_reminder?: string;
        campaign_defaults?: {
          from_name?: string;
          from_email?: string;
          subject?: string;
          language?: string;
        };
        email_type_option?: boolean;
      } = {};
      
      if (params.name) {
        body.name = params.name;
      }
      if (params.contact) {
        body.contact = params.contact;
      }
      if (params.permission_reminder) {
        body.permission_reminder = params.permission_reminder;
      }
      if (params.campaign_defaults) {
        body.campaign_defaults = params.campaign_defaults;
      }
      if (params.email_type_option !== undefined) {
        body.email_type_option = params.email_type_option;
      }
      
      return await client.patch(`/lists/${params.audienceId}`, body);
    }

    case 'mc_createSegment': {
      const schema = z.object({
        audienceId: mailchimpIdSchema,
        name: z.string().min(1).max(100),
        static_segment: z.array(z.string().email()).optional(),
        conditions: z.array(z.object({
          field: z.string(),
          op: z.string(),
          value: z.union([z.string(), z.number()]),
        })).optional(),
      });
      const params = schema.parse(args);
      
      // Must have either static_segment or conditions, but not both
      if (!params.static_segment && !params.conditions) {
        throw new Error('Either static_segment or conditions must be provided');
      }
      if (params.static_segment && params.conditions) {
        throw new Error('Cannot provide both static_segment and conditions. Use static_segment for static segments (tags) or conditions for saved segments.');
      }
      
      const body: {
        name: string;
        static_segment?: string[];
        conditions?: Array<{ field: string; op: string; value: string | number }>;
      } = {
        name: params.name,
      };
      
      if (params.static_segment) {
        body.static_segment = params.static_segment;
      } else if (params.conditions) {
        body.conditions = params.conditions;
      }
      
      return await client.post(`/lists/${params.audienceId}/segments`, body);
    }

    case 'mc_addTagToMember': {
      const schema = z.object({
        audienceId: mailchimpIdSchema,
        email: z.string().email().max(254),
        tags: z.array(z.object({
          name: z.string().min(1).max(100),
          status: z.enum(['active', 'inactive']),
        })).min(1),
      });
      const params = schema.parse(args);
      
      // Calculate subscriber hash (MD5 of lowercase email)
      const emailHash = createHash('md5').update(params.email.toLowerCase()).digest('hex');
      
      return await client.post(`/lists/${params.audienceId}/members/${emailHash}/tags`, {
        tags: params.tags,
      });
    }

    case 'mc_createMergeField': {
      const schema = z.object({
        audienceId: mailchimpIdSchema,
        name: z.string().min(1).max(100),
        type: z.enum(['text', 'number', 'address', 'phone', 'date', 'url', 'imageurl', 'radio', 'dropdown', 'birthday', 'zip']),
        tag: z.string().min(1).max(10).regex(/^[A-Z0-9_]+$/, {
          message: 'Tag must be uppercase alphanumeric with underscores, max 10 characters',
        }),
        required: z.boolean().optional(),
        public: z.boolean().optional(),
        default_value: z.string().optional(),
        options: z.object({
          choices: z.array(z.string()).optional(),
        }).optional(),
      });
      const params = schema.parse(args);
      
      const body: {
        name: string;
        type: string;
        tag: string;
        required?: boolean;
        public?: boolean;
        default_value?: string;
        options?: { choices?: string[] };
      } = {
        name: params.name,
        type: params.type,
        tag: params.tag,
      };
      
      if (params.required !== undefined) {
        body.required = params.required;
      }
      if (params.public !== undefined) {
        body.public = params.public;
      }
      if (params.default_value !== undefined) {
        body.default_value = params.default_value;
      }
      if (params.options) {
        body.options = params.options;
      }
      
      return await client.post(`/lists/${params.audienceId}/merge-fields`, body);
    }

    case 'mc_updateCampaign': {
      const schema = z.object({
        campaignId: mailchimpIdSchema,
        settings: z.object({
          subject_line: z.string().optional(),
          from_name: z.string().optional(),
          reply_to: z.string().email().max(254).optional(),
          title: z.string().optional(),
        }).optional(),
      });
      const params = schema.parse(args);
      
      if (!params.settings) {
        throw new Error('Settings must be provided to update campaign');
      }
      
      return await client.patch(`/campaigns/${params.campaignId}`, {
        settings: params.settings,
      });
    }

    case 'mc_deleteCampaign': {
      const schema = z.object({
        campaignId: mailchimpIdSchema,
      });
      const params = schema.parse(args);
      return await client.delete(`/campaigns/${params.campaignId}`);
    }

    case 'mc_createMember': {
      const schema = z.object({
        audienceId: mailchimpIdSchema,
        email_address: z.string().email().max(254),
        status: z.enum(['subscribed', 'unsubscribed', 'cleaned', 'pending', 'transactional']),
        merge_fields: z.record(z.unknown()).optional(),
        tags: z.array(z.string()).optional(),
      });
      const params = schema.parse(args);
      
      const body: {
        email_address: string;
        status: string;
        merge_fields?: Record<string, unknown>;
        tags?: string[];
      } = {
        email_address: params.email_address,
        status: params.status,
      };
      
      if (params.merge_fields) {
        body.merge_fields = params.merge_fields;
      }
      if (params.tags) {
        body.tags = params.tags;
      }
      
      // Calculate subscriber hash (MD5 of lowercase email)
      const emailHash = createHash('md5').update(params.email_address.toLowerCase()).digest('hex');
      return await client.put(`/lists/${params.audienceId}/members/${emailHash}`, body);
    }

    case 'mc_updateMember': {
      const schema = z.object({
        audienceId: mailchimpIdSchema,
        email: z.string().email().max(254),
        email_address: z.string().email().max(254).optional(),
        status: z.enum(['subscribed', 'unsubscribed', 'cleaned', 'pending', 'transactional']).optional(),
        merge_fields: z.record(z.unknown()).optional(),
      });
      const params = schema.parse(args);
      
      // Calculate subscriber hash (MD5 of lowercase email)
      const emailHash = createHash('md5').update(params.email.toLowerCase()).digest('hex');
      
      const body: {
        email_address?: string;
        status?: string;
        merge_fields?: Record<string, unknown>;
      } = {};
      
      if (params.email_address) {
        body.email_address = params.email_address;
      }
      if (params.status) {
        body.status = params.status;
      }
      if (params.merge_fields) {
        body.merge_fields = params.merge_fields;
      }
      
      if (Object.keys(body).length === 0) {
        throw new Error('At least one field must be provided to update (email_address, status, or merge_fields)');
      }
      
      return await client.patch(`/lists/${params.audienceId}/members/${emailHash}`, body);
    }

    case 'mc_deleteMember': {
      const schema = z.object({
        audienceId: mailchimpIdSchema,
        email: z.string().email().max(254),
      });
      const params = schema.parse(args);
      
      // Calculate subscriber hash (MD5 of lowercase email)
      const emailHash = createHash('md5').update(params.email.toLowerCase()).digest('hex');
      return await client.delete(`/lists/${params.audienceId}/members/${emailHash}`);
    }

    case 'mc_deleteAudience': {
      const schema = z.object({
        audienceId: mailchimpIdSchema,
      });
      const params = schema.parse(args);
      return await client.delete(`/lists/${params.audienceId}`);
    }

    case 'mc_updateSegment': {
      const schema = z.object({
        audienceId: mailchimpIdSchema,
        segmentId: mailchimpIdSchema,
        name: z.string().min(1).max(100).optional(),
        conditions: z.array(z.object({
          field: z.string(),
          op: z.string(),
          value: z.union([z.string(), z.number()]),
        })).optional(),
      });
      const params = schema.parse(args);
      
      if (!params.name && !params.conditions) {
        throw new Error('Either name or conditions must be provided');
      }
      
      const body: {
        name?: string;
        conditions?: Array<{ field: string; op: string; value: string | number }>;
      } = {};
      
      if (params.name) {
        body.name = params.name;
      }
      if (params.conditions) {
        body.conditions = params.conditions;
      }
      
      return await client.patch(`/lists/${params.audienceId}/segments/${params.segmentId}`, body);
    }

    case 'mc_deleteSegment': {
      const schema = z.object({
        audienceId: mailchimpIdSchema,
        segmentId: mailchimpIdSchema,
      });
      const params = schema.parse(args);
      return await client.delete(`/lists/${params.audienceId}/segments/${params.segmentId}`);
    }

    case 'mc_createTag': {
      const schema = z.object({
        audienceId: mailchimpIdSchema,
        name: z.string().min(1).max(100),
      });
      const params = schema.parse(args);
      return await client.post(`/lists/${params.audienceId}/segments`, {
        name: params.name,
        static_segment: [],
      });
    }

    case 'mc_deleteTag': {
      const schema = z.object({
        audienceId: mailchimpIdSchema,
        tagId: mailchimpIdSchema,
      });
      const params = schema.parse(args);
      return await client.delete(`/lists/${params.audienceId}/segments/${params.tagId}`);
    }

    case 'mc_updateMergeField': {
      const schema = z.object({
        audienceId: mailchimpIdSchema,
        mergeFieldId: mailchimpIdSchema,
        name: z.string().min(1).max(100).optional(),
        required: z.boolean().optional(),
        public: z.boolean().optional(),
        default_value: z.string().optional(),
        options: z.object({
          choices: z.array(z.string()).optional(),
        }).optional(),
      });
      const params = schema.parse(args);
      
      if (!params.name && params.required === undefined && params.public === undefined && 
          !params.default_value && !params.options) {
        throw new Error('At least one field must be provided to update');
      }
      
      const body: {
        name?: string;
        required?: boolean;
        public?: boolean;
        default_value?: string;
        options?: { choices?: string[] };
      } = {};
      
      if (params.name) {
        body.name = params.name;
      }
      if (params.required !== undefined) {
        body.required = params.required;
      }
      if (params.public !== undefined) {
        body.public = params.public;
      }
      if (params.default_value !== undefined) {
        body.default_value = params.default_value;
      }
      if (params.options) {
        body.options = params.options;
      }
      
      return await client.patch(`/lists/${params.audienceId}/merge-fields/${params.mergeFieldId}`, body);
    }

    case 'mc_deleteMergeField': {
      const schema = z.object({
        audienceId: mailchimpIdSchema,
        mergeFieldId: mailchimpIdSchema,
      });
      const params = schema.parse(args);
      return await client.delete(`/lists/${params.audienceId}/merge-fields/${params.mergeFieldId}`);
    }

    case 'mc_deleteFile': {
      const schema = z.object({
        fileId: mailchimpIdSchema,
      });
      const params = schema.parse(args);
      return await client.delete(`/file-manager/files/${params.fileId}`);
    }

    case 'mc_deleteTemplateFolder': {
      const schema = z.object({
        folderId: mailchimpIdSchema,
      });
      const params = schema.parse(args);
      return await client.delete(`/template-folders/${params.folderId}`);
    }

    case 'mc_deleteFileFolder': {
      const schema = z.object({
        folderId: mailchimpIdSchema,
      });
      const params = schema.parse(args);
      return await client.delete(`/file-manager/folders/${params.folderId}`);
    }

    case 'mc_createVerifiedDomain': {
      const schema = z.object({
        domain: z.string().min(1).max(255),
        verification_email: z.string().email().max(254).optional(),
      });
      const params = schema.parse(args);
      
      // Extract domain from email if provided (e.g., "user@example.com" -> "example.com")
      let inputDomain = params.domain.trim();
      let verificationEmail = params.verification_email;
      
      // If input looks like an email, extract domain and use email as verification_email
      if (inputDomain.includes('@')) {
        const emailParts = inputDomain.split('@');
        if (emailParts.length === 2) {
          verificationEmail = verificationEmail || inputDomain; // Use the email as verification_email if not provided
          inputDomain = emailParts[1]; // Extract domain part
        }
      }
      
      // Clean up domain: remove protocol, www, paths, query strings
      let domain = inputDomain;
      domain = domain.replace(/^https?:\/\//i, '');
      domain = domain.replace(/^www\./i, '');
      domain = domain.split('/')[0];
      domain = domain.split('?')[0];
      domain = domain.split('#')[0];
      
      // Validate domain format
      const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
      if (!domainRegex.test(domain)) {
        throw new Error(`Invalid domain format: ${domain}. Domain must be a valid domain name (e.g., example.com)`);
      }
      
      // Mailchimp API: POST /verified-domains with body { domain: "example.com", verification_email: "user@example.com" }
      // The verification_email parameter is required by the API
      if (!verificationEmail) {
        throw new Error(
          `verification_email is required. ` +
          `Please provide an email address for domain verification (e.g., admin@${domain}). ` +
          `You can either pass it as the verification_email parameter, or provide an email address as the domain parameter.`
        );
      }
      
      // Validate verification email format
      if (!z.string().email().safeParse(verificationEmail).success) {
        throw new Error(`Invalid verification_email format: ${verificationEmail}. Must be a valid email address.`);
      }
      
      try {
        // Try with verification_email first (most likely field name)
        return await client.post('/verified-domains', {
          domain: domain,
          verification_email: verificationEmail,
        });
      } catch (error) {
        // If verification_email doesn't work, try with 'email' field name
        if (error instanceof Error && error.message.includes('400')) {
          try {
            return await client.post('/verified-domains', {
              domain: domain,
              email: verificationEmail,
            });
          } catch (error2) {
            // Both field names failed, show the actual error
            throw new Error(
              `Domain creation failed. ` +
              `Mailchimp API error: ${error2 instanceof Error ? error2.message : String(error2)}. ` +
              `Request sent: domain="${domain}", verification_email="${verificationEmail}". ` +
              `Common issues: domain already exists, invalid format, incorrect field name, or account restrictions. ` +
              `Try checking if the domain already exists with mc_listVerifiedDomains.`
            );
          }
        }
        throw error;
      }
    }

    case 'mc_deleteVerifiedDomain': {
      const schema = z.object({
        domainName: z.string().min(1).max(255),
      });
      const params = schema.parse(args);
      
      // Clean up domain: remove protocol, www, paths, query strings
      let domain = params.domainName.trim();
      domain = domain.replace(/^https?:\/\//i, '');
      domain = domain.replace(/^www\./i, '');
      domain = domain.split('/')[0];
      domain = domain.split('?')[0];
      domain = domain.split('#')[0];
      
      // According to Mailchimp API docs: DELETE /verified-domains/{domain_name}
      // The domain should be URL encoded in the path
      // However, some APIs are picky - try both encoded and unencoded
      const encodedDomain = encodeURIComponent(domain);
      
      try {
        // Try with URL encoding first (standard approach)
        return await client.delete(`/verified-domains/${encodedDomain}`);
      } catch (error) {
        // If 404 with encoding, try without encoding (some APIs don't like it)
        if (error instanceof Error && error.message.includes('404')) {
          try {
            return await client.delete(`/verified-domains/${domain}`);
          } catch (error2) {
            // If still 404, provide helpful error message
            throw new Error(
              `Domain not found or cannot be deleted. ` +
              `Ensure the domain name matches exactly as returned by mc_listVerifiedDomains. ` +
              `Domain attempted: ${domain}. ` +
              `The domain must exist and be in a deletable state.`
            );
          }
        }
        throw error;
      }
    }

    case 'mc_sendDomainVerificationEmail': {
      const schema = z.object({
        domainName: z.string().min(1).max(255).regex(/^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/i, {
          message: 'Invalid domain name format',
        }),
        email: z.string().email().max(254).optional(),
      });
      const params = schema.parse(args);
      
      // Clean up domain: remove protocol, www, paths, query strings
      let domain = params.domainName.trim();
      domain = domain.replace(/^https?:\/\//i, '');
      domain = domain.replace(/^www\./i, '');
      domain = domain.split('/')[0];
      domain = domain.split('?')[0];
      domain = domain.split('#')[0];
      
      // Mailchimp API: POST /verified-domains/{domain_name}/actions/verify
      // According to docs, this endpoint may not require a body, or may require different structure
      const encodedDomain = encodeURIComponent(domain);
      
      // Try with email in body if provided, otherwise empty body
      const body = params.email ? { code: params.email } : {};
      return await client.post(`/verified-domains/${encodedDomain}/actions/verify`, body);
    }

    case 'mc_deleteStore': {
      const schema = z.object({
        storeId: mailchimpIdSchema,
      });
      const params = schema.parse(args);
      
      // Mailchimp Stores API is read-only as of August 19, 2021
      // Stores cannot be deleted via API - they must be deleted through the web interface
      // or by disconnecting the integration platform
      throw new Error(
        'Mailchimp Stores API is read-only. E-commerce stores cannot be deleted via the API. ' +
        'To delete a store, you must:\n' +
        '1. Go to your Mailchimp dashboard\n' +
        '2. Navigate to Integrations or E-commerce section\n' +
        '3. Find the store and disconnect/delete it from there\n\n' +
        'Alternatively, disconnect the store from your e-commerce platform (WooCommerce, Shopify, etc.) ' +
        'and it will be automatically removed from Mailchimp.'
      );
    }

    default:
      throw new Error(`Unknown write tool: ${name}`);
  }
}

