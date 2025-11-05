# ChatGPT MCP Configuration Guide

## Step 1: Update Your .env File

Edit `.env` and add your actual Mailchimp API key:

```bash
MAILCHIMP_API_KEY=your_actual_api_key_here
MAILCHIMP_SERVER_PREFIX=us9
MAILCHIMP_READONLY=true
CONFIRM_SEND=
TRANSPORT_MODE=stdio
```

**Important**: Replace `your_actual_api_key_here` with your real Mailchimp API key.

## Step 2: Configure ChatGPT MCP Settings

1. Open ChatGPT
2. Go to **Settings** → **Developer** → **Model Context Protocol (MCP)**
3. Click **Add Server** or edit existing "mailchimp-mcp"
4. Configure as follows:

### Configuration Values:

| Field | Value |
|-------|-------|
| **Name** | `mailchimp-mcp` |
| **Command** | `node` |
| **Arguments** | `dist/index.js` |
| **Working Directory** | `/Users/michaelreynolds/Desktop/Cursor/Mailchimp MCP` |
| **Environment Variables** | Load from `.env` file (ChatGPT should auto-detect) |

### Alternative: Manual Environment Variables

If ChatGPT doesn't auto-load `.env`, add these manually:

```
MAILCHIMP_API_KEY=your_api_key
MAILCHIMP_SERVER_PREFIX=us9
MAILCHIMP_READONLY=true
TRANSPORT_MODE=stdio
```

## Step 3: Test the Connection

1. Save the MCP configuration in ChatGPT
2. Start a new chat
3. Ask ChatGPT: "Can you run mc.ping?"
4. Expected response: `{ ok: true }`

## Step 4: Verify Read-Only Tools

Ask ChatGPT:
- "List my Mailchimp audiences"
- "Show me my recent campaigns"
- "How many subscribers do I have?"

## What ChatGPT Will Do

✅ **Automatically launch** the Node.js server when needed  
✅ **Connect via stdio** (standard input/output)  
✅ **Call tools** like `mc.listAudiences`, `mc.listMembers`, etc.  
✅ **Return real data** from your Mailchimp account  
✅ **Read-only mode** - Cannot send campaigns or modify data  

## Troubleshooting

### If `mc.ping` times out:

1. **Check .env file exists**:
   ```bash
   cat "/Users/michaelreynolds/Desktop/Cursor/Mailchimp MCP/.env"
   ```

2. **Verify API key is correct**:
   - Should start with `mcus-` or similar
   - Should match your Mailchimp account

3. **Check server prefix**:
   - Your API key might have `-us9` suffix
   - If so, remove it from the API key
   - Set `MAILCHIMP_SERVER_PREFIX=us9` in .env

4. **Test manually**:
   ```bash
   cd "/Users/michaelreynolds/Desktop/Cursor/Mailchimp MCP"
   TRANSPORT_MODE=stdio node dist/index.js
   ```
   Should see: `✅ Mailchimp MCP server running via stdio.`

5. **Check ChatGPT MCP logs**:
   - Look for errors in ChatGPT's developer console
   - Verify the working directory path is correct

### If tools don't appear:

- Restart ChatGPT
- Check that `MAILCHIMP_READONLY=true` is set
- Verify the build completed: `ls dist/index.js`

## Success Indicators

Once configured correctly, you should see:
- ✅ ChatGPT can run `mc.ping` successfully
- ✅ ChatGPT lists all 9 read-only tools
- ✅ ChatGPT can answer questions about your Mailchimp account
- ✅ Real data is returned (audiences, campaigns, members)

