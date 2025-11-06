# ChatGPT MCP Stdio Setup Guide

## Why Stdio Mode is Best

✅ **Standard MCP approach** - ChatGPT expects this  
✅ **More reliable** - No ngrok dependency  
✅ **Faster** - Direct process communication  
✅ **Simpler** - One process to manage  
✅ **Perfect for read-only queries** - Your exact use case

## ChatGPT Configuration

In ChatGPT's MCP settings (Settings → Developer → Model Context Protocol), configure:

### Server Configuration:
- **Name**: `mailchimp-mcp`
- **Command**: `node`
- **Arguments**: `dist/index.js` (or `src/index.ts` for dev with tsx)
- **Working Directory**: `/path/to/mailchimp-mcp` (replace with your actual project path)
- **Environment Variables**: Load from `.env` file

### Environment Variables (.env):
```
MAILCHIMP_API_KEY=your_api_key_here
MAILCHIMP_SERVER_PREFIX=us9
MAILCHIMP_READONLY=true
CONFIRM_SEND=
TRANSPORT_MODE=stdio
```

## Starting the Server

### For Production:
```bash
cd /path/to/mailchimp-mcp
npm run build
TRANSPORT_MODE=stdio npm start
```

### For Development:
```bash
cd /path/to/mailchimp-mcp
TRANSPORT_MODE=stdio npm run dev
```

**Note:** Replace `/path/to/mailchimp-mcp` with your actual project directory path.

## What Happens

1. ChatGPT launches the Node.js process automatically
2. Server connects via stdio (standard input/output)
3. ChatGPT can call tools like:
   - `mc.listAudiences` - "Show me my audiences"
   - `mc.listMembers` - "How many subscribers do I have?"
   - `mc.listCampaigns` - "Show me my recent campaigns"
   - `mc.getCampaignReport` - "What's the performance of campaign X?"

## Verification

Once configured, ChatGPT should:
- ✅ See all 9 read-only tools
- ✅ Successfully call `mc.ping` (returns `{ ok: true }`)
- ✅ Retrieve real Mailchimp data
- ✅ Answer natural language questions about your account

## Troubleshooting

If tools timeout:
1. Check `.env` file exists and has correct API key
2. Verify `MAILCHIMP_SERVER_PREFIX` matches your API key (us9)
3. Test locally: `TRANSPORT_MODE=stdio npm start`
4. Check ChatGPT MCP logs for errors

