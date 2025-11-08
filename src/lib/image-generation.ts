/**
 * Image Generation Client
 * 
 * Supports multiple image generation providers:
 * - OpenAI DALL-E 3
 * - Stability AI (Stable Diffusion)
 * - Replicate (various models)
 * 
 * Automatically handles image generation and conversion to base64 for Mailchimp upload.
 */

export interface ImageGenerationOptions {
  prompt: string;
  provider: 'openai' | 'stability' | 'replicate';
  size?: '1024x1024' | '1024x1792' | '1792x1024' | '512x512' | '768x768';
  style?: 'vivid' | 'natural';
  model?: string; // For Replicate
}

export interface GeneratedImage {
  url?: string; // Temporary URL (if provided by API)
  base64: string; // Base64 encoded image data
  width: number;
  height: number;
  format: string;
}

/**
 * Generate image using OpenAI DALL-E 3
 */
async function generateWithOpenAI(
  prompt: string,
  options: { size?: string; style?: string },
  apiKey: string
): Promise<GeneratedImage> {
  const size = options.size || '1024x1024';
  const style = options.style || 'vivid';

  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size,
      quality: 'standard',
      style,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
  }

  const data = await response.json();
  const imageUrl = data.data[0].url;

  // Download image and convert to base64
  const imageResponse = await fetch(imageUrl);
  const imageBuffer = await imageResponse.arrayBuffer();
  const base64 = Buffer.from(imageBuffer).toString('base64');

  // Parse dimensions from size string
  const [width, height] = size.split('x').map(Number);

  return {
    url: imageUrl,
    base64,
    width,
    height,
    format: 'png',
  };
}

/**
 * Generate image using Stability AI
 */
async function generateWithStability(
  prompt: string,
  options: { size?: string },
  apiKey: string
): Promise<GeneratedImage> {
  const size = options.size || '1024x1024';
  const [width, height] = size.split('x').map(Number);

  const response = await fetch(
    'https://api.stability.ai/v2beta/stable-image/generate/core',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'image/*',
      },
      body: JSON.stringify({
        prompt,
        output_format: 'png',
        width,
        height,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Stability AI API error: ${error || response.statusText}`);
  }

  const imageBuffer = await response.arrayBuffer();
  const base64 = Buffer.from(imageBuffer).toString('base64');

  return {
    base64,
    width,
    height,
    format: 'png',
  };
}

/**
 * Generate image using Replicate
 */
async function generateWithReplicate(
  prompt: string,
  options: { model?: string },
  apiKey: string
): Promise<GeneratedImage> {
  const model = options.model || 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b';

  // Create prediction
  const createResponse = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      'Authorization': `Token ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      version: model.split(':')[1] || model,
      input: {
        prompt,
        width: 1024,
        height: 1024,
      },
    }),
  });

  if (!createResponse.ok) {
    const error = await createResponse.json().catch(() => ({}));
    throw new Error(`Replicate API error: ${error.detail || createResponse.statusText}`);
  }

  const prediction = await createResponse.json();
  let predictionId = prediction.id;

  // Poll for completion
  let attempts = 0;
  const maxAttempts = 60; // 5 minutes max

  while (attempts < maxAttempts) {
    const statusResponse = await fetch(
      `https://api.replicate.com/v1/predictions/${predictionId}`,
      {
        headers: {
          'Authorization': `Token ${apiKey}`,
        },
      }
    );

    const status = await statusResponse.json();

    if (status.status === 'succeeded') {
      const imageUrl = Array.isArray(status.output) ? status.output[0] : status.output;

      // Download image and convert to base64
      const imageResponse = await fetch(imageUrl);
      const imageBuffer = await imageResponse.arrayBuffer();
      const base64 = Buffer.from(imageBuffer).toString('base64');

      return {
        url: imageUrl,
        base64,
        width: 1024,
        height: 1024,
        format: 'png',
      };
    }

    if (status.status === 'failed' || status.status === 'canceled') {
      throw new Error(`Replicate generation failed: ${status.error || 'Unknown error'}`);
    }

    // Wait before polling again
    await new Promise(resolve => setTimeout(resolve, 5000));
    attempts++;
  }

  throw new Error('Replicate generation timed out');
}

/**
 * Generate an image using the specified provider
 */
export async function generateImage(
  options: ImageGenerationOptions,
  apiKeys: {
    openai?: string;
    stability?: string;
    replicate?: string;
  }
): Promise<GeneratedImage> {
  const { provider, prompt, size, style, model } = options;

  switch (provider) {
    case 'openai': {
      if (!apiKeys.openai) {
        throw new Error('OpenAI API key not configured. Set OPENAI_API_KEY environment variable.');
      }
      return generateWithOpenAI(prompt, { size, style }, apiKeys.openai);
    }

    case 'stability': {
      if (!apiKeys.stability) {
        throw new Error('Stability AI API key not configured. Set STABILITY_API_KEY environment variable.');
      }
      return generateWithStability(prompt, { size }, apiKeys.stability);
    }

    case 'replicate': {
      if (!apiKeys.replicate) {
        throw new Error('Replicate API key not configured. Set REPLICATE_API_KEY environment variable.');
      }
      return generateWithReplicate(prompt, { model }, apiKeys.replicate);
    }

    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}

/**
 * Get recommended image size for email templates
 */
export function getEmailImageSize(aspectRatio: 'square' | 'wide' | 'tall' = 'square'): string {
  switch (aspectRatio) {
    case 'square':
      return '1024x1024';
    case 'wide':
      return '1792x1024';
    case 'tall':
      return '1024x1792';
    default:
      return '1024x1024';
  }
}

