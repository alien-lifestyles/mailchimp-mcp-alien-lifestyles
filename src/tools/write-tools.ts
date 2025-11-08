import { createHash } from 'crypto';
import { z } from 'zod';
import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { MailchimpClient } from '../lib/mailchimp-client.js';
import { validateMTLTemplate } from '../lib/mtl-validation.js';
import { generateImage, getEmailImageSize } from '../lib/image-generation.js';

// Mailchimp IDs are alphanumeric with hyphens, typically 10-40 chars
const mailchimpIdRegex = /^[a-zA-Z0-9-]{1,64}$/;

const mailchimpIdSchema = z.string().min(1).max(64).regex(mailchimpIdRegex, {
  message: 'Invalid Mailchimp ID format',
});

export function createWriteTools(
  client: MailchimpClient,
  imageGenApiKeys?: {
    openai?: string;
    stability?: string;
    replicate?: string;
  }
): Tool[] {
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
    {
      name: 'mc_createTemplate',
      description: 'Create a new custom-coded template in Mailchimp. Validates HTML for MTL (Mailchimp Template Language) compliance. See: https://mailchimp.com/help/getting-started-with-mailchimps-template-language/',
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
      description: 'Update an existing template. Validates HTML for MTL compliance.',
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
      description: 'Delete a template from Mailchimp.',
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
      description: 'Upload a file (image, PDF, etc.) to Mailchimp\'s File Manager. Returns file URL for use in templates.',
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
      description: 'Create a folder for organizing templates.',
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
      description: 'Create a folder in Mailchimp\'s File Manager for organizing files.',
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
      name: 'mc_generateAndUploadImage',
      description: 'Generate an image using AI (OpenAI DALL-E, Stability AI, or Replicate) and automatically upload it to Mailchimp File Manager. Returns the Mailchimp file URL for use in templates.',
      inputSchema: {
        type: 'object',
        properties: {
          prompt: {
            type: 'string',
            description: 'The image generation prompt describing what image to create',
          },
          provider: {
            type: 'string',
            enum: ['openai', 'stability', 'replicate'],
            description: 'Image generation provider: openai (DALL-E 3), stability (Stable Diffusion), or replicate (various models)',
          },
          name: {
            type: 'string',
            description: 'Name for the uploaded file in Mailchimp (default: generated from prompt)',
          },
          size: {
            type: 'string',
            enum: ['1024x1024', '1024x1792', '1792x1024', '512x512', '768x768'],
            description: 'Image size. For email templates, use 1024x1024 (square), 1792x1024 (wide), or 1024x1792 (tall)',
          },
          aspectRatio: {
            type: 'string',
            enum: ['square', 'wide', 'tall'],
            description: 'Email-optimized aspect ratio (overrides size if provided)',
          },
          folder_id: {
            type: 'string',
            description: 'Optional: The folder ID to place the file in',
          },
          model: {
            type: 'string',
            description: 'Optional: Specific model for Replicate (e.g., stability-ai/sdxl)',
          },
        },
        required: ['prompt', 'provider'],
      },
    },
    {
      name: 'mc_createAudience',
      description: 'Create a new Mailchimp audience (list). Requires name, contact information, permission reminder, and campaign defaults.',
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
      description: 'Update an existing Mailchimp audience (list). Update name, contact information, permission reminder, campaign defaults, or email type option. All fields are optional - only include fields you want to update.',
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
      description: 'Create a new segment for an audience. Can create static segments (tag-like) or saved segments (with conditions).',
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
      description: 'Add or remove tags from a member. Tags help organize and segment your audience members.',
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
      description: 'Create a new merge field (custom field) for an audience. Merge fields store additional information about members.',
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
  ];
}

export async function handleWriteTool(
  name: string,
  args: unknown,
  client: MailchimpClient,
  confirmSend: string,
  imageGenApiKeys?: {
    openai?: string;
    stability?: string;
    replicate?: string;
  }
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
      if (confirmSend !== 'I_KNOW_WHAT_IM_DOING') {
        throw new Error(
          'Sending campaigns requires CONFIRM_SEND=I_KNOW_WHAT_IM_DOING environment variable'
        );
      }
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

    case 'mc_generateAndUploadImage': {
      if (!imageGenApiKeys) {
        throw new Error('Image generation API keys not configured. Set OPENAI_API_KEY, STABILITY_API_KEY, or REPLICATE_API_KEY environment variables.');
      }

      const schema = z.object({
        prompt: z.string().min(1).max(1000),
        provider: z.enum(['openai', 'stability', 'replicate']),
        name: z.string().min(1).max(255).optional(),
        size: z.enum(['1024x1024', '1024x1792', '1792x1024', '512x512', '768x768']).optional(),
        aspectRatio: z.enum(['square', 'wide', 'tall']).optional(),
        folder_id: mailchimpIdSchema.optional(),
        model: z.string().optional(),
      });
      const params = schema.parse(args);

      // Determine image size
      let size = params.size;
      if (params.aspectRatio && !size) {
        size = getEmailImageSize(params.aspectRatio) as any;
      }
      size = size || '1024x1024';

      // Generate image
      const generatedImage = await generateImage(
        {
          prompt: params.prompt,
          provider: params.provider,
          size: size as any,
          model: params.model,
        },
        imageGenApiKeys
      );

      // Generate filename if not provided
      const filename = params.name || 
        `${params.prompt.slice(0, 50).replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${Date.now()}.${generatedImage.format}`;

      // Upload to Mailchimp
      const uploadBody: {
        name: string;
        file_data: string;
        folder_id?: string;
      } = {
        name: filename,
        file_data: generatedImage.base64,
      };

      if (params.folder_id) {
        uploadBody.folder_id = params.folder_id;
      }

      const uploadResult = await client.post('/file-manager/files', uploadBody);

      // Return combined result with generation info
      return {
        ...uploadResult,
        generation_info: {
          prompt: params.prompt,
          provider: params.provider,
          size: `${generatedImage.width}x${generatedImage.height}`,
          format: generatedImage.format,
        },
      };
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

    default:
      throw new Error(`Unknown write tool: ${name}`);
  }
}

