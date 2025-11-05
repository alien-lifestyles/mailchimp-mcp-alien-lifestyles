# Mailchimp API Key Configuration Guide

## API Key Format

Your Mailchimp API key should be in this format:
```
09dd[your_full_unmasked_key_here]-us9
```

**Important:** 
- Use the FULL, UNMASKED API key from Mailchimp
- Include the datacenter suffix (`-us9`) at the end
- The key should be approximately 32-40 characters BEFORE the `-us9` suffix

## Locations to Update

### 1. Project `.env` File
**Location:** `/Users/michaelreynolds/Desktop/Cursor/Mailchimp MCP/.env`

**Format:**
```bash
MAILCHIMP_API_KEY=your_full_api_key_here-us9
MAILCHIMP_SERVER_PREFIX=us9
```

**Example:**
```bash
MAILCHIMP_API_KEY=your_full_api_key_here-us9
MAILCHIMP_SERVER_PREFIX=us9
MAILCHIMP_READONLY=true
TRANSPORT_MODE=stdio
```

### 2. Claude Desktop Config File
**Location:** `~/Library/Application Support/Claude/claude_desktop_config.json`

**Format (JSON):**
```json
{
  "mcpServers": {
    "mailchimp-mcp": {
      "command": "/usr/local/bin/node",
      "args": ["/Users/michaelreynolds/Desktop/Cursor/Mailchimp MCP/dist/index.js"],
      "cwd": "/Users/michaelreynolds/Desktop/Cursor/Mailchimp MCP",
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

**Important:** In JSON, the API key must be in quotes: `"your_full_api_key_here-us9"`

## Steps to Update

1. **Get your full API key from Mailchimp:**
   - Go to https://mailchimp.com/developer/portal/
   - Or: Account → Extras → API keys
   - Click "Show" or "Reveal" to see the full key
   - Copy the ENTIRE key including `-us9`

2. **Update the `.env` file:**
   - Open `/Users/michaelreynolds/Desktop/Cursor/Mailchimp MCP/.env`
   - Replace the value after `MAILCHIMP_API_KEY=`
   - No quotes needed in `.env` file

3. **Update Claude Desktop config:**
   - Open `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Find `"MAILCHIMP_API_KEY": "..."` 
   - Replace with your full key (keep it in quotes)
   - Save the file

4. **Restart Claude Desktop:**
   - Quit completely (Cmd+Q)
   - Reopen Claude Desktop

## Verification

After updating, test with:
- Ask Claude: "Can you run mc_ping?"
- Then: "List my Mailchimp campaigns"

If you still get authentication errors, verify:
- The API key is active in Mailchimp
- The datacenter matches (`us9`)
- No extra spaces or quotes in the `.env` file
- JSON syntax is correct in Claude config

