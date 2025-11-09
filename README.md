# Mailchimp MCP Server

A Model Context Protocol (MCP) server for integrating Mailchimp with Claude Desktop.

## ⚠️ Security & Privacy Notice

**IMPORTANT:** This MCP server exposes personal data to Claude AI and Claude Desktop:

- Email addresses and member information are sent to Claude AI via tool responses
- Claude Desktop stores conversation history locally on your device
- Use only with accounts containing non-sensitive data
- Enable PII masking (`MAILCHIMP_MASK_PII=true`) to protect personal information
- Review [SECURITY.md](./SECURITY.md) for detailed security information

## Quick Start

### Installation

```bash
npm install -g @alien-lifestyles/mailchimp-mcp
```

### Configuration

**Option 1: Setup UI (Recommended)**

```bash
npm run setup
```

Opens a local web interface at `http://localhost:3000` for secure key entry.

**Option 2: Manual Configuration**

Create a `.env` file:

```bash
# Required
MAILCHIMP_API_KEY=your_api_key_here-us9
MAILCHIMP_SERVER_PREFIX=us9

# Optional
MAILCHIMP_LICENSE_KEY=ALIEN-XXXX-XXXX-XXXX
MAILCHIMP_MASK_PII=true
MAILCHIMP_READONLY=true
```

### Claude Desktop Setup

1. Open Claude Desktop → Settings → Developer → Edit Config
2. Add configuration:

```json
{
  "mcpServers": {
    "mailchimp-mcp": {
      "command": "/usr/local/bin/node",
      "args": ["/path/to/mailchimp-mcp/dist/index.js"],
      "cwd": "/path/to/mailchimp-mcp",
      "env": {
        "MAILCHIMP_API_KEY": "your_api_key_here-us9",
        "MAILCHIMP_SERVER_PREFIX": "us9",
        "MAILCHIMP_MASK_PII": "true"
      }
    }
  }
}
```

3. Restart Claude Desktop
4. Test: Ask Claude "Can you run mc_ping?"

## Free vs Paid Versions

### Free Version (Default)
- Read-only access to audiences, campaigns, reports
- 5 Marketer prompts
- No write operations
- No license key required

### Paid Version
- Full read/write access
- All prompts (CSM, Marketer, Business Owner)
- Create campaigns, templates, audiences
- File Manager integration
- Requires license key from [alienlifestyles.com](https://alienlifestyles.com)

## Available Tools

### Read Tools

| Tool | Description |
|------|-------------|
| `mc_ping` | Test connection |
| `mc_listAudiences` | List all audiences |
| `mc_getAudience` | Get audience details |
| `mc_listMembers` | List members in audience |
| `mc_getMember` | Get member details |
| `mc_listCampaigns` | List campaigns |
| `mc_getCampaign` | Get campaign details |
| `mc_getCampaignReport` | Get campaign analytics |
| `mc_getAccount` | Get account information |
| `mc_listVerifiedDomains` | List verified domains |
| `mc_getVerifiedDomain` | Get domain auth status |

### Write Tools (Paid Only)

| Tool | Description |
|------|-------------|
| **Campaigns** | |
| `mc_createCampaign` | Create new campaign |
| `mc_updateCampaign` | Update campaign settings |
| `mc_setCampaignContent` | Set campaign content |
| `mc_sendCampaign` | Send campaign |
| `mc_deleteCampaign` | Delete campaign |
| **Templates** | |
| `mc_createTemplate` | Create template with MTL validation |
| `mc_updateTemplate` | Update template |
| `mc_deleteTemplate` | Delete template |
| **Files & Folders** | |
| `mc_uploadFile` | Upload file to File Manager |
| `mc_deleteFile` | Delete file from File Manager |
| `mc_createTemplateFolder` | Create template folder |
| `mc_deleteTemplateFolder` | Delete template folder |
| `mc_createFileFolder` | Create file folder |
| `mc_deleteFileFolder` | Delete file folder |
| **Audiences** | |
| `mc_createAudience` | Create new audience |
| `mc_updateAudience` | Update audience settings |
| `mc_deleteAudience` | Delete audience |
| **Members** | |
| `mc_createMember` | Add member to audience |
| `mc_updateMember` | Update member information |
| `mc_deleteMember` | Delete member from audience |
| **Segments** | |
| `mc_createSegment` | Create segment |
| `mc_updateSegment` | Update segment |
| `mc_deleteSegment` | Delete segment |
| **Tags** | |
| `mc_createTag` | Create tag |
| `mc_addTagToMember` | Add/remove tags from member |
| `mc_deleteTag` | Delete tag |
| **Merge Fields** | |
| `mc_createMergeField` | Create merge field |
| `mc_updateMergeField` | Update merge field |
| `mc_deleteMergeField` | Delete merge field |
| **Domains** | |
| `mc_createVerifiedDomain` | Add domain for verification |
| `mc_deleteVerifiedDomain` | Delete verified domain |
| `mc_sendDomainVerificationEmail` | Send domain verification email |
| **E-commerce Stores** | |
| `mc_deleteStore` | Delete e-commerce store (Note: Mailchimp Stores API is read-only - stores must be deleted via web interface) |

## Example Queries

- "List my Mailchimp audiences"
- "How many subscribers do I have?"
- "Show me my recent campaigns"
- "What's my top performing campaign?"
- "Check my domain authentication status"

See [USE_CASES.md](./USE_CASES.md) for more examples.

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `MAILCHIMP_API_KEY` | Mailchimp API key (with datacenter suffix) | Yes | - |
| `MAILCHIMP_SERVER_PREFIX` | Datacenter prefix (e.g., `us9`) | Yes | `us21` |
| `MAILCHIMP_LICENSE_KEY` | License key for paid version | No | - |
| `MAILCHIMP_READONLY` | Enable read-only mode | No | `true` |
| `MAILCHIMP_MASK_PII` | Mask email addresses and PII | No | `false` |

## Troubleshooting

### API Key Invalid
- Verify API key is correct and active in Mailchimp
- Ensure datacenter prefix matches (e.g., `us9` in key and `MAILCHIMP_SERVER_PREFIX`)
- Use full, unmasked API key including datacenter suffix

### Claude Desktop Connection Issues
- Verify paths in `claude_desktop_config.json` are correct
- Ensure `dist/index.js` exists (run `npm run build`)
- Check Claude Desktop logs: Settings → Developer → View Logs
- Restart Claude Desktop after configuration changes

## Development

```bash
npm run dev    # Development mode with watch
npm run build  # Build project
npm start      # Run built server
npm run setup  # Launch setup UI
```

## Security

- Never commit your `.env` file
- Enable PII masking (`MAILCHIMP_MASK_PII=true`)
- Use read-only API keys when possible
- Review [SECURITY.md](./SECURITY.md) for comprehensive security documentation
- Claude Desktop stores conversation history locally

## Contributing

Contributions welcome. Ensure code follows TypeScript best practices and includes proper input validation.

## License

MIT

## Support

- Check Troubleshooting section
- Review [SECURITY.md](./SECURITY.md)
- Open an issue on GitHub
