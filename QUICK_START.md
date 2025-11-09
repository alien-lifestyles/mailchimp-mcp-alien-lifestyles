# Quick Start Guide for macOS

## 🚀 Fastest Installation (30 seconds)

### Step 1: Open Terminal

Press `Cmd + Space`, type "Terminal", and press Enter.

### Step 2: Copy & Paste This Command

```bash
curl -fsSL https://raw.githubusercontent.com/alien-lifestyles/mailchimp-mcp-alien-lifestyles/main/install.sh | bash
```

Press Enter and wait for the installation to complete.

### Step 3: Enter Your Mailchimp API Key

The setup UI will automatically open in your browser. Enter:
- Your Mailchimp API key (get it from [Mailchimp Developer Portal](https://mailchimp.com/developer/portal/))
- Server prefix (usually auto-detected from your API key)
- License key (optional - skip for free trial)

### Step 4: Restart Claude Desktop

After saving your configuration:
1. Quit Claude Desktop completely (Cmd + Q)
2. Reopen Claude Desktop
3. Ask Claude: "Can you run mc_ping?" to test

## 🎉 That's It!

You're now ready to use Mailchimp MCP with Claude Desktop.

## What You Get (Free Version)

- ✅ Read-only access to your Mailchimp account
- ✅ List audiences, campaigns, and reports
- ✅ View member information
- ✅ 5 pre-built Marketer prompts
- ✅ No license key required

## Upgrade to Paid Version

Get full access including:
- ⭐ Create and send campaigns
- ⭐ Manage audiences and members
- ⭐ File Manager integration
- ⭐ All 30+ prompts (CSM, Marketer, Business Owner)
- ⭐ Write operations

Visit [alienlifestyles.com](https://alienlifestyles.com) to get your license key.

## Troubleshooting

### "Node.js not found"

Install Node.js from [nodejs.org](https://nodejs.org/) or use Homebrew:
```bash
brew install node
```

### "Permission denied"

You may need to run with sudo:
```bash
sudo npm install -g @alien-lifestyles/mailchimp-mcp
```

### Setup UI doesn't open

Manually visit: `http://localhost:3000`

### Need Help?

- Check [INSTALL.md](./INSTALL.md) for detailed instructions
- Review [README.md](./README.md) for full documentation
- Open an issue on GitHub

