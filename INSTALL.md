# Installation Guide

## Quick Install for macOS (Easiest!)

**Option 1: One-Line Install (Copy & Paste)**

Simply copy and paste this into your Terminal:

```bash
curl -fsSL https://raw.githubusercontent.com/alien-lifestyles/mailchimp-mcp-alien-lifestyles/main/install.sh | bash
```

Or download and run the installer:

```bash
curl -O https://raw.githubusercontent.com/alien-lifestyles/mailchimp-mcp-alien-lifestyles/main/install.sh
chmod +x install.sh
./install.sh
```

**Option 2: Using npx (No Download Required)**

```bash
npx -y @alien-lifestyles/mailchimp-mcp mailchimp-mcp-install
```

Both methods will:
- ✅ Check that Node.js 20+ is installed
- ✅ Install the package globally
- ✅ Launch the setup UI in your browser
- ✅ Automatically configure Claude Desktop

## Manual Installation

If you prefer to install manually:

### Step 1: Install the Package

```bash
npm install -g @alien-lifestyles/mailchimp-mcp
```

**Note:** On macOS/Linux, you may need `sudo`:
```bash
sudo npm install -g @alien-lifestyles/mailchimp-mcp
```

### Step 2: Run Setup

```bash
mailchimp-mcp-setup
```

This will open a web interface at `http://localhost:3000` where you can:
- Enter your Mailchimp API key
- Configure server settings
- Add your license key (optional)
- Set privacy preferences

### Step 3: Restart Claude Desktop

After saving your configuration, **completely restart Claude Desktop** for changes to take effect.

### Step 4: Test

Ask Claude: "Can you run mc_ping?" to verify the connection.

## Troubleshooting

### "Command not found: mailchimp-mcp-setup"

This usually means the package wasn't installed globally or npm's global bin directory isn't in your PATH.

**Solution:**
1. Verify installation: `npm list -g @alien-lifestyles/mailchimp-mcp`
2. Check npm global prefix: `npm config get prefix`
3. Add to PATH if needed (usually `~/.npm-global/bin` or `/usr/local/bin`)

### "Permission denied" on macOS/Linux

Global npm installs require administrator privileges.

**Solution:**
```bash
sudo npm install -g @alien-lifestyles/mailchimp-mcp
```

### Node.js Version Error

Mailchimp MCP requires Node.js 20 or higher.

**Solution:**
1. Check your version: `node --version`
2. Upgrade if needed: https://nodejs.org/

### Setup UI Won't Open

The setup UI runs on `http://localhost:3000`. If it doesn't open automatically:

1. Check if port 3000 is in use
2. Manually visit `http://localhost:3000` in your browser
3. Check terminal for error messages

## Uninstallation

To remove Mailchimp MCP:

```bash
npm uninstall -g @alien-lifestyles/mailchimp-mcp
```

You may also want to:
- Remove the `.env` file from the package directory
- Remove the `mailchimp-mcp` entry from Claude Desktop config

## Updating

To update to the latest version:

```bash
npm update -g @alien-lifestyles/mailchimp-mcp
```

Then restart Claude Desktop.

