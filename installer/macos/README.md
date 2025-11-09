# Mailchimp MCP macOS Installer

This directory contains the native macOS installer and uninstaller applications.

## Project Structure

- `MailchimpMCPInstaller/` - Installer application source code
- `MailchimpMCPUninstaller/` - Uninstaller application source code

## Building the Installer

### Prerequisites

- macOS 11.0 or later
- Xcode 13.0 or later
- Node.js 20+ (for the package being installed)

### Creating Xcode Projects

The Swift source files are provided, but you need to create Xcode projects:

1. Open Xcode
2. File → New → Project
3. Choose "macOS" → "App"
4. Product Name: `MailchimpMCPInstaller`
5. Language: Swift
6. Interface: AppKit
7. Save in: `installer/macos/`
8. Add all Swift files from `MailchimpMCPInstaller/` to the project
9. Repeat for `MailchimpMCPUninstaller`

### Building

Once Xcode projects are created:

```bash
npm run build:installer
```

Or manually:

```bash
./scripts/build-installer.sh
```

This will:
1. Build both installer and uninstaller apps
2. Create a DMG file in `dist/MailchimpMCPInstaller.dmg`

## Manual Build Steps

If you prefer to build manually:

1. Open `MailchimpMCPInstaller.xcodeproj` in Xcode
2. Select "Release" configuration
3. Product → Archive
4. Repeat for `MailchimpMCPUninstaller.xcodeproj`
5. Run `./scripts/build-dmg.sh` to create the DMG

## Distribution

The DMG file can be:
- Hosted on GitHub Releases
- Distributed via download link
- Users download and run the installer app

