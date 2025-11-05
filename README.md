# Mailchimp MCP Server

A Model Context Protocol (MCP) server for integrating Mailchimp with Claude Desktop and other MCP-compatible clients.

## Features

- ✅ Full Mailchimp API integration
- ✅ Read-only tools for safe data access
- ✅ Optional write tools (campaign creation/sending)
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
git clone <your-repo-url>
cd mailchimp-mcp
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
TRANSPORT_MODE=stdio
```

**Important:**
- Replace `your_full_api_key_here-us9` with your actual API key
- The `MAILCHIMP_SERVER_PREFIX` should match the datacenter suffix (e.g., `us9`, `us1`, `us2`)
- Set `MAILCHIMP_READONLY=true` for read-only access (recommended)
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

### Write Tools (Only if `MAILCHIMP_READONLY=false`)

- `mc_createCampaign` - Create a new Mailchimp campaign
- `mc_setCampaignContent` - Set content for a campaign
- `mc_sendCampaign` - Send a campaign (requires `CONFIRM_SEND=I_KNOW_WHAT_IM_DOING`)

## Example Queries

Once set up with Claude Desktop, you can ask:

- "List my Mailchimp audiences"
- "How many subscribers do I have?"
- "Show me my recent campaigns"
- "What's my top performing campaign?"
- "Get details for campaign [campaign_id]"

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `MAILCHIMP_API_KEY` | Your Mailchimp API key (with datacenter suffix) | Yes | - |
| `MAILCHIMP_SERVER_PREFIX` | Datacenter prefix (e.g., `us9`, `us1`) | Yes | `us21` |
| `MAILCHIMP_READONLY` | Enable read-only mode | No | `true` |
| `CONFIRM_SEND` | Required to send campaigns | No | - |
| `TRANSPORT_MODE` | Transport mode (`stdio` or `http`) | No | `stdio` |
| `PORT` | HTTP server port (if using HTTP mode) | No | `3000` |

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

### Claude Desktop Connection Issues

- Verify the paths in `claude_desktop_config.json` are correct
- Ensure `dist/index.js` exists (run `npm run build`)
- Check Claude Desktop logs: Settings → Developer → View Logs
- Restart Claude Desktop after configuration changes

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for more help.

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
- Campaign sending requires explicit confirmation (`CONFIRM_SEND=I_KNOW_WHAT_IM_DOING`)

## License

MIT

## Contributing

Contributions welcome! Please ensure:
- Code follows TypeScript best practices
- All tools include proper input validation
- Tests pass before submitting PRs

## Support

For issues or questions:
1. Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
2. Check [API_KEY_SETUP.md](./API_KEY_SETUP.md) for API key issues
3. Open an issue on GitHub

## Acknowledgments

- Built with [Model Context Protocol SDK](https://github.com/modelcontextprotocol)
- Uses [Mailchimp Marketing API](https://mailchimp.com/developer/marketing/)

