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

    default:
      throw new Error(`Unknown write tool: ${name}`);
  }
}

