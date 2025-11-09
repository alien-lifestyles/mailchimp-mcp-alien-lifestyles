# Mailchimp MCP macOS Installer

This directory contains the native macOS installer and uninstaller applications.

## Project Structure

- `MailchimpMCPInstaller/` - Installer application source code
  - `project.yml` - XcodeGen project specification
- `MailchimpMCPUninstaller/` - Uninstaller application source code
  - `project.yml` - XcodeGen project specification

## Building the Installer

### Prerequisites

- macOS 11.0 or later
- Xcode 13.0 or later (with command line tools)
- **XcodeGen** - Install via: `brew install xcodegen`
- Node.js 20+ (for the package being installed)

### Automatic Build

The build process is fully automated:

```bash
npm run build:installer
```

Or:

```bash
./scripts/build-installer.sh
```

This will:
1. Check for XcodeGen installation
2. Generate Xcode projects automatically (if they don't exist)
3. Build both installer and uninstaller apps
4. Create a DMG file in `dist/MailchimpMCPInstaller.dmg`

### Manual Project Generation

If you want to generate projects manually:

```bash
# Check XcodeGen installation
./scripts/check-xcodegen.sh

# Generate installer project
cd installer/macos/MailchimpMCPInstaller
xcodegen generate

# Generate uninstaller project
cd ../MailchimpMCPUninstaller
xcodegen generate
```

### Manual Build in Xcode

1. Generate projects (see above or let build script do it)
2. Open `MailchimpMCPInstaller.xcodeproj` in Xcode
3. Select "Release" scheme
4. Product → Archive
5. Repeat for `MailchimpMCPUninstaller.xcodeproj`
6. Run `./scripts/build-dmg.sh` to create the DMG

## Project Configuration

Project settings are defined in YAML files:
- `MailchimpMCPInstaller/project.yml` - Installer configuration
- `MailchimpMCPUninstaller/project.yml` - Uninstaller configuration

To modify settings, edit the `project.yml` files and regenerate projects.

## Distribution

The DMG file can be:
- Hosted on GitHub Releases
- Distributed via download link
- Users download and run the installer app

## Troubleshooting

See `CREATE_XCODE_PROJECTS.md` for detailed troubleshooting steps.
