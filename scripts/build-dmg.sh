#!/bin/bash

# Build DMG script for Mailchimp MCP Installer
# Packages both installer and uninstaller apps into a DMG file

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
INSTALLER_DIR="$PROJECT_ROOT/installer/macos"
DIST_DIR="$PROJECT_ROOT/dist"
DMG_NAME="MailchimpMCPInstaller"
DMG_PATH="$DIST_DIR/$DMG_NAME.dmg"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}Creating DMG package...${NC}"

# Create dist directory if it doesn't exist
mkdir -p "$DIST_DIR"

# Check if apps exist (using derivedDataPath from build script)
INSTALLER_APP="$INSTALLER_DIR/MailchimpMCPInstaller/build/Build/Products/Release/MailchimpMCPInstaller.app"
UNINSTALLER_APP="$INSTALLER_DIR/MailchimpMCPUninstaller/build/Build/Products/Release/MailchimpMCPUninstaller.app"

if [ ! -d "$INSTALLER_APP" ]; then
    echo -e "${RED}Error: Installer app not found at $INSTALLER_APP${NC}"
    echo "Please build the installer app first using Xcode or build-installer.sh"
    exit 1
fi

if [ ! -d "$UNINSTALLER_APP" ]; then
    echo -e "${RED}Error: Uninstaller app not found at $UNINSTALLER_APP${NC}"
    echo "Please build the uninstaller app first using Xcode or build-installer.sh"
    exit 1
fi

# Create temporary DMG directory
TEMP_DMG_DIR="$DIST_DIR/dmg_contents"
rm -rf "$TEMP_DMG_DIR"
mkdir -p "$TEMP_DMG_DIR"

# Copy apps to DMG directory
echo "Copying apps to DMG..."
cp -R "$INSTALLER_APP" "$TEMP_DMG_DIR/"
cp -R "$UNINSTALLER_APP" "$TEMP_DMG_DIR/"

# Create README
cat > "$TEMP_DMG_DIR/README.txt" << 'EOF'
Mailchimp MCP Installer

INSTALLATION:
1. Double-click "MailchimpMCPInstaller.app"
2. Follow the installation wizard
3. Enter your Mailchimp API key when prompted
4. Restart Claude Desktop

UNINSTALLATION:
1. Double-click "MailchimpMCPUninstaller.app"
2. Confirm removal
3. All files and configuration will be removed

For support, contact: michael@alienlifestyles.com
EOF

# Create Applications symlink
ln -s /Applications "$TEMP_DMG_DIR/Applications"

# Remove existing DMG if it exists
if [ -f "$DMG_PATH" ]; then
    rm "$DMG_PATH"
fi

# Create DMG
echo "Creating DMG file..."
hdiutil create -volname "Mailchimp MCP Installer" \
    -srcfolder "$TEMP_DMG_DIR" \
    -ov -format UDZO \
    "$DMG_PATH"

# Clean up
rm -rf "$TEMP_DMG_DIR"

echo -e "${GREEN}✅ DMG created successfully: $DMG_PATH${NC}"

