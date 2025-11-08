# Image Generation Integration Guide

This guide explains how to integrate AI image generation with Mailchimp MCP for creating images directly in Claude and automatically uploading them to Mailchimp.

## Overview

The `mc_generateAndUploadImage` tool allows you to:
1. Generate images using AI (OpenAI DALL-E, Stability AI, or Replicate)
2. Automatically upload generated images to Mailchimp File Manager
3. Get Mailchimp file URLs ready for use in email templates

## Supported Providers

### 1. OpenAI DALL-E 3
- **Best for:** High-quality, creative images
- **API:** https://platform.openai.com/api-keys
- **Cost:** Pay-per-image (~$0.04-0.12 per image)
- **Quality:** Excellent
- **Speed:** Fast (~10-20 seconds)

### 2. Stability AI (Stable Diffusion)
- **Best for:** Cost-effective, customizable images
- **API:** https://platform.stability.ai/account/api-keys
- **Cost:** Pay-per-image (~$0.01-0.04 per image)
- **Quality:** Very good
- **Speed:** Fast (~5-15 seconds)

### 3. Replicate
- **Best for:** Access to multiple models, flexible
- **API:** https://replicate.com/account/api-tokens
- **Cost:** Varies by model
- **Quality:** Depends on model
- **Speed:** Varies (some models can take 30-60 seconds)

## Setup

### 1. Get API Keys

**OpenAI:**
1. Go to https://platform.openai.com/api-keys
2. Create a new API key
3. Copy the key

**Stability AI:**
1. Go to https://platform.stability.ai/account/api-keys
2. Create a new API key
3. Copy the key

**Replicate:**
1. Go to https://replicate.com/account/api-tokens
2. Create a new API token
3. Copy the token

### 2. Configure Environment Variables

Add to your `.env` file:

```bash
# Image Generation API Keys (at least one required)
OPENAI_API_KEY=sk-...
STABILITY_API_KEY=sk-...
REPLICATE_API_KEY=r8_...

# Mailchimp Configuration (required)
MAILCHIMP_API_KEY=your-mailchimp-api-key-us9
MAILCHIMP_SERVER_PREFIX=us9
MAILCHIMP_READONLY=false
```

**Note:** You only need to set the API key for the provider(s) you want to use. You can use multiple providers and choose which one to use per request.

## Usage in Claude

### Basic Example

```
Generate an image of a modern office workspace with plants and natural lighting, 
then upload it to Mailchimp. Use OpenAI DALL-E.
```

### With Specific Size

```
Create a wide banner image (1792x1024) of a sunset over mountains 
using Stability AI, and upload it to my Mailchimp File Manager.
```

### Complete Workflow: Generate Image and Create Template

```
1. Generate a hero image: "A professional business person working on a laptop, 
   modern office background, high quality" using OpenAI
   
2. Create a newsletter template that uses this image in the header section
```

## Tool Parameters

### Required Parameters
- `prompt` (string): Description of the image to generate
- `provider` (string): `openai`, `stability`, or `replicate`

### Optional Parameters
- `name` (string): Filename in Mailchimp (auto-generated if not provided)
- `size` (string): Image dimensions (`1024x1024`, `1024x1792`, `1792x1024`, etc.)
- `aspectRatio` (string): Email-optimized ratio (`square`, `wide`, `tall`)
- `folder_id` (string): Mailchimp folder ID to organize files
- `model` (string): Specific Replicate model (e.g., `stability-ai/sdxl`)

## Image Sizes for Email

### Recommended Sizes:
- **Square (1024x1024):** Product images, logos, icons
- **Wide (1792x1024):** Hero banners, headers
- **Tall (1024x1792):** Mobile-optimized, vertical layouts

### Size Guidelines:
- **Maximum width:** 1200px for email clients
- **File size:** Keep under 1MB for fast loading
- **Format:** PNG or JPG (PNG recommended for transparency)

## Example Workflows

### Workflow 1: Generate Hero Image for Campaign

```javascript
// Step 1: Generate image
const image = await mc_generateAndUploadImage({
  prompt: "Modern tech startup office with team collaboration, bright and professional",
  provider: "openai",
  aspectRatio: "wide",
  name: "hero-office.png"
});

// Step 2: Use in template
const template = await mc_createTemplate({
  name: "Tech Newsletter",
  html: `
    <div mc:edit="header">
      <img src="${image.url}" alt="Office" style="width: 100%; max-width: 1200px;" />
    </div>
    <div mc:edit="body">
      <h1>Welcome to Our Newsletter</h1>
    </div>
  `
});
```

### Workflow 2: Generate Multiple Product Images

```javascript
const products = [
  "Modern wireless headphones, white, minimalist design",
  "Smartwatch with fitness tracking, black, sleek",
  "Laptop computer, silver, professional"
];

const images = [];
for (const prompt of products) {
  const image = await mc_generateAndUploadImage({
    prompt,
    provider: "stability",
    aspectRatio: "square",
    folder_id: "product-images-folder-id"
  });
  images.push(image);
}
```

### Workflow 3: Screenshot-to-Template with Generated Images

```
1. Generate a hero image based on a description
2. Generate supporting images for the template
3. Create template with all generated images
4. Use template in campaign
```

## Best Practices

### Prompts
- **Be specific:** Include style, colors, mood, composition
- **Email context:** Mention "email-friendly", "web-safe colors"
- **Size awareness:** Consider how image will look at email width (600-1200px)

### Performance
- **Caching:** Reuse generated images when possible
- **Batch generation:** Generate multiple images in parallel
- **Provider selection:** Use Stability AI for cost, OpenAI for quality

### Cost Management
- **OpenAI DALL-E 3:** ~$0.04-0.12 per image
- **Stability AI:** ~$0.01-0.04 per image
- **Replicate:** Varies by model
- **Monitor usage:** Check API usage dashboards regularly

### Image Quality
- **Resolution:** Higher resolution = better quality but larger files
- **Format:** PNG for transparency, JPG for photos
- **Optimization:** Images are automatically converted to base64 for Mailchimp

## Troubleshooting

### Error: "Image generation API keys not configured"
**Solution:** Add at least one API key to `.env` file:
- `OPENAI_API_KEY=...`
- `STABILITY_API_KEY=...`
- `REPLICATE_API_KEY=...`

### Error: "OpenAI API error: Rate limit exceeded"
**Solution:** 
- Wait a few minutes
- Check your OpenAI usage limits
- Consider using a different provider

### Error: "Replicate generation timed out"
**Solution:**
- Some models take longer (30-60 seconds)
- Try a faster model
- Check Replicate status page

### Image too large for email
**Solution:**
- Use smaller size (512x512 or 768x768)
- Compress image before upload
- Consider using JPG instead of PNG

## Advanced Usage

### Custom Replicate Models

```javascript
mc_generateAndUploadImage({
  prompt: "Futuristic cityscape",
  provider: "replicate",
  model: "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
  size: "1024x1024"
});
```

### Organizing Generated Images

```javascript
// Create folder first
const folder = await mc_createFileFolder({
  name: "AI Generated Images"
});

// Generate images in folder
const image = await mc_generateAndUploadImage({
  prompt: "Product image",
  provider: "openai",
  folder_id: folder.id
});
```

## Integration with Template Creation

The image generation feature works seamlessly with template creation:

1. **Generate images** → Get Mailchimp URLs
2. **Create template** → Use URLs in HTML
3. **Use template** → Images automatically available

Example:
```
Generate a hero image of a coffee shop interior, then create a newsletter 
template that uses this image in a wide banner format.
```

## Security Considerations

- **API Keys:** Never commit API keys to version control
- **Rate Limits:** Be aware of API rate limits
- **Costs:** Monitor API usage to avoid unexpected charges
- **Content Policy:** Ensure generated images comply with provider content policies

## Cost Estimates

### Typical Campaign (5 images):
- **OpenAI:** ~$0.20-0.60
- **Stability AI:** ~$0.05-0.20
- **Replicate:** Varies

### Monthly Usage (100 images):
- **OpenAI:** ~$4-12/month
- **Stability AI:** ~$1-4/month
- **Replicate:** Varies by model

## Next Steps

1. **Set up API keys** for your preferred provider
2. **Test generation** with a simple prompt
3. **Create templates** using generated images
4. **Optimize workflow** for your use case

## Support

For issues or questions:
- Check provider API documentation
- Review Mailchimp File Manager limits
- Test with simple prompts first

