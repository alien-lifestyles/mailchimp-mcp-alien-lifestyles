# Mailchimp MCP Server

A Model Context Protocol (MCP) server for integrating Mailchimp with Claude Desktop and other MCP-compatible clients.

## ⚠️ Security & Privacy Notice

**IMPORTANT:** This MCP server exposes personal data to Claude AI and Claude Desktop:

- **Email addresses and member information** are sent to Claude AI via tool responses
- **Claude Desktop stores conversation history** locally on your device (including API responses)
- **Use only with accounts containing non-sensitive data**
- **Enable PII masking** (`MAILCHIMP_MASK_PII=true`) to protect personal information
- **Review [SECURITY.md](./SECURITY.md)** for detailed security information and compliance considerations

**Before using in production:**
- Review data handling practices
- Understand compliance requirements (GDPR, CCPA, HIPAA)
- Consider enabling PII masking
- Secure your API keys and configuration files

## Features

- ✅ Full Mailchimp API integration
- ✅ Read-only tools for safe data access
- ✅ Optional write tools (campaign creation/sending)
- ✅ **Template creation with MTL validation** (NEW)
- ✅ **File Manager integration** (NEW)
- ✅ **AI Image Generation** (NEW) - Generate images with DALL-E, Stability AI, or Replicate
- ✅ **Pre-populated Prompts** (NEW) - 30+ clickable prompts organized by persona (CSM, Marketer, Business Owner)
- ✅ Rate limiting and retry logic
- ✅ Input validation with Zod
- ✅ Supports both stdio and HTTP/SSE transports
- ✅ Claude Desktop compatible

## Prerequisites

- Node.js 20.0.0 or higher
- A Mailchimp account with API access
- Claude Desktop (for Claude integration)

## Installation

1. Clone this repository:
```bash
git clone https://github.com/alien-lifestyles/mailchimp-mcp-alien-lifestyles.git
cd mailchimp-mcp-alien-lifestyles
```

2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

## Configuration

### 1. Get Your Mailchimp API Key

1. Go to [Mailchimp Developer Portal](https://mailchimp.com/developer/portal/)
2. Or navigate to: Account → Extras → API keys
3. Create a new API key or use an existing one
4. Copy the **full API key** including the datacenter suffix (e.g., `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-us9`)

### 2. Set Up Environment Variables

Create a `.env` file in the project root:

```bash
MAILCHIMP_API_KEY=your_full_api_key_here-us9
MAILCHIMP_SERVER_PREFIX=us9
MAILCHIMP_READONLY=true
MAILCHIMP_MASK_PII=true
TRANSPORT_MODE=stdio
```

**Important:**
- Replace `your_full_api_key_here-us9` with your actual API key
- The `MAILCHIMP_SERVER_PREFIX` should match the datacenter suffix (e.g., `us9`, `us1`, `us2`)
- Set `MAILCHIMP_READONLY=true` for read-only access (recommended)
- **Set `MAILCHIMP_MASK_PII=true` to mask email addresses and personal information** (recommended for privacy)
- Use `TRANSPORT_MODE=stdio` for Claude Desktop

See [API_KEY_SETUP.md](./API_KEY_SETUP.md) for detailed instructions.

## Usage

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm run build
npm start
```

## Claude Desktop Setup

1. Open Claude Desktop
2. Go to Settings → Developer → Edit Config
3. Add the following configuration:

```json
{
  "mcpServers": {
    "mailchimp-mcp": {
      "command": "/usr/local/bin/node",
      "args": ["/path/to/mailchimp-mcp/dist/index.js"],
      "cwd": "/path/to/mailchimp-mcp",
      "env": {
        "MAILCHIMP_API_KEY": "your_full_api_key_here-us9",
        "MAILCHIMP_SERVER_PREFIX": "us9",
        "MAILCHIMP_READONLY": "true",
        "TRANSPORT_MODE": "stdio"
      }
    }
  }
}
```

**Important:** Replace `/path/to/mailchimp-mcp` with your actual project path.

4. Restart Claude Desktop

5. Test the connection:
   - Ask Claude: "Can you run mc_ping?"
   - Expected response: `{ ok: true }`

## Available Tools

### Read Tools (Always Available)

- `mc_ping` - Test connection to Mailchimp MCP server
- `mc_listAudiences` - List all Mailchimp audiences (lists)
- `mc_getAudience` - Get detailed information about a specific audience
- `mc_listMembers` - List members in an audience
- `mc_getMember` - Get detailed information about a specific member
- `mc_listCampaigns` - List Mailchimp campaigns
- `mc_getCampaign` - Get detailed information about a specific campaign
- `mc_getCampaignReport` - Get analytics report for a sent campaign
- `mc_getAccount` - Get account information
- `mc_listVerifiedDomains` - List all verified domains and their authentication status
- `mc_getVerifiedDomain` - Get detailed authentication status for a specific domain

### Write Tools (Only if `MAILCHIMP_READONLY=false`)

- `mc_createCampaign` - Create a new Mailchimp campaign
- `mc_setCampaignContent` - Set content for a campaign
- `mc_sendCampaign` - Send a campaign (requires `CONFIRM_SEND=I_KNOW_WHAT_IM_DOING`)
- `mc_createTemplate` - Create a custom-coded template with MTL validation
- `mc_updateTemplate` - Update an existing template
- `mc_deleteTemplate` - Delete a template
- `mc_uploadFile` - Upload files (images, PDFs) to File Manager
- `mc_createTemplateFolder` - Create a folder for organizing templates
- `mc_createFileFolder` - Create a folder in File Manager
- `mc_generateAndUploadImage` - Generate AI images and upload to Mailchimp (NEW)

**New:** Template creation features with automatic Mailchimp Template Language (MTL) compliance validation. See [TEMPLATE_CREATION_FEATURES.md](./TEMPLATE_CREATION_FEATURES.md) for details.

**New:** AI image generation integration - Generate images using OpenAI DALL-E, Stability AI, or Replicate, and automatically upload them to Mailchimp. See [IMAGE_GENERATION_GUIDE.md](./IMAGE_GENERATION_GUIDE.md) for setup and usage.

## Example Queries

Once set up with Claude Desktop, you can:

### Use Pre-populated Prompts (Recommended)
Click on any of the 30+ pre-populated prompts in Claude Desktop, organized by persona:
- **CSM prompts:** Account health checks, upsell opportunities, troubleshooting
- **Marketer prompts:** Performance reports, strategic insights, executive summaries
- **Business Owner prompts:** Quick status updates, ROI assessment, strategic planning

See [USE_CASES_GUIDE.md](./USE_CASES_GUIDE.md) for the complete list.

### Or Ask Directly
- "List my Mailchimp audiences"
- "How many subscribers do I have?"
- "Show me my recent campaigns"
- "What's my top performing campaign?"
- "Get details for campaign [campaign_id]"
- "Check my domain authentication status"
- "List all my verified domains"

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `MAILCHIMP_API_KEY` | Your Mailchimp API key (with datacenter suffix) | Yes | - |
| `MAILCHIMP_SERVER_PREFIX` | Datacenter prefix (e.g., `us9`, `us1`) | Yes | `us21` |
| `MAILCHIMP_READONLY` | Enable read-only mode | No | `true` |
| `MAILCHIMP_MASK_PII` | Mask email addresses and personal information | No | `false` |
| `CONFIRM_SEND` | Required to send campaigns | No | - |
| `TRANSPORT_MODE` | Transport mode (must be `stdio`) | No | `stdio` |
| `OPENAI_API_KEY` | OpenAI API key for image generation (optional) | No | - |
| `STABILITY_API_KEY` | Stability AI API key for image generation (optional) | No | - |
| `REPLICATE_API_KEY` | Replicate API token for image generation (optional) | No | - |

**Security Recommendations:**
- Set `MAILCHIMP_MASK_PII=true` to protect personal information
- Use read-only API keys with minimal permissions
- Never commit API keys to version control

## Project Structure

```
mailchimp-mcp/
├── src/
│   ├── index.ts              # Main MCP server entry point
│   ├── lib/
│   │   └── mailchimp-client.ts  # Mailchimp API client
│   └── tools/
│       ├── read-tools.ts     # Read-only tools
│       └── write-tools.ts     # Write tools
├── dist/                     # Build output (generated)
├── .env                      # Environment variables (not in repo)
├── .env.example             # Example environment file
├── package.json
├── tsconfig.json
└── README.md
```

## Troubleshooting

### API Key Invalid Error

- Verify your API key is correct and active in Mailchimp
- Ensure the datacenter prefix matches (`us9` in key and `MAILCHIMP_SERVER_PREFIX`)
- Check that you're using the **full, unmasked** API key
- The API key should include the datacenter suffix (e.g., `-us9`)

### Claude Desktop Connection Issues

- Verify the paths in `claude_desktop_config.json` are correct
- Ensure `dist/index.js` exists (run `npm run build`)
- Check Claude Desktop logs: Settings → Developer → View Logs
- Restart Claude Desktop after configuration changes
- Verify `TRANSPORT_MODE=stdio` is set in your configuration

## Development

### Scripts

- `npm run dev` - Start development server with watch mode
- `npm run build` - Build the project
- `npm start` - Run the built server

### Code Style

- TypeScript with ES modules
- Input validation with Zod
- Error handling with retries for rate limits

## Security

- **Never commit your `.env` file** - it contains sensitive API keys
- Use read-only mode (`MAILCHIMP_READONLY=true`) when possible
- **Enable PII masking** (`MAILCHIMP_MASK_PII=true`) to protect personal information
- **Review [SECURITY.md](./SECURITY.md)** for comprehensive security documentation
- Campaign sending requires explicit confirmation (`CONFIRM_SEND=I_KNOW_WHAT_IM_DOING`)
- **Claude Desktop stores conversation history** - regularly review and delete sensitive conversations
- **Only use with non-sensitive data** - consider compliance requirements for your use case

## License

MIT

## Contributing

Contributions welcome! Please ensure:
- Code follows TypeScript best practices
- All tools include proper input validation
- Tests pass before submitting PRs

## Support

For issues or questions:
1. Check the Troubleshooting section above
2. Review [SECURITY.md](./SECURITY.md) for security and compliance information
3. Open an issue on GitHub

## Acknowledgments

- Built with [Model Context Protocol SDK](https://github.com/modelcontextprotocol)
- Uses [Mailchimp Marketing API](https://mailchimp.com/developer/marketing/)

