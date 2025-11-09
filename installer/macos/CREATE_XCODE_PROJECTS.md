# Creating Xcode Projects with XcodeGen

Xcode projects are now automatically generated using XcodeGen from YAML specification files. No manual Xcode project creation is needed!

## Prerequisites

1. **XcodeGen** - Install via Homebrew:
   ```bash
   brew install xcodegen
   ```

2. **Xcode** - Xcode 13.0 or later with command line tools

3. **macOS** - macOS 11.0 or later

## Automatic Project Generation

The build script automatically generates Xcode projects if they don't exist:

```bash
npm run build:installer
```

Or manually:

```bash
./scripts/build-installer.sh
```

The script will:
1. Check if XcodeGen is installed
2. Generate `MailchimpMCPInstaller.xcodeproj` from `MailchimpMCPInstaller/project.yml`
3. Generate `MailchimpMCPUninstaller.xcodeproj` from `MailchimpMCPUninstaller/project.yml`
4. Build both apps
5. Create the DMG package

## Manual Project Generation

If you want to generate projects manually:

```bash
# Generate installer project
cd installer/macos/MailchimpMCPInstaller
xcodegen generate

# Generate uninstaller project
cd ../MailchimpMCPUninstaller
xcodegen generate
```

## Project Configuration

Project settings are defined in `project.yml` files:

- **MailchimpMCPInstaller/project.yml** - Installer app configuration
- **MailchimpMCPUninstaller/project.yml** - Uninstaller app configuration

These files define:
- Bundle identifiers
- Deployment target (macOS 11.0)
- Source files
- Build settings
- Info.plist references
- Resources

## Modifying Projects

To modify project settings:

1. Edit the `project.yml` file
2. Regenerate the project: `xcodegen generate`
3. Or let the build script regenerate automatically

## Building

Once projects are generated (automatically or manually):

```bash
npm run build:installer
```

This will build both apps and create a DMG file at `dist/MailchimpMCPInstaller.dmg`.

## Manual Build in Xcode

You can also open the generated projects in Xcode:

1. Open `MailchimpMCPInstaller.xcodeproj` in Xcode
2. Select "Release" scheme
3. Product → Archive
4. Repeat for `MailchimpMCPUninstaller.xcodeproj`
5. Run `./scripts/build-dmg.sh` to create the DMG

## Troubleshooting

### XcodeGen Not Found

If you see an error about XcodeGen not being installed:

```bash
# Install via Homebrew
brew install xcodegen

# Or check installation
./scripts/check-xcodegen.sh
```

### Project Generation Fails

1. Verify `project.yml` files exist in both project directories
2. Check YAML syntax (use a YAML validator)
3. Ensure all source files referenced in `project.yml` exist
4. Run `xcodegen generate` manually to see detailed error messages

## Version Control

The `.xcodeproj` files are **not** version controlled (they're in `.gitignore`). Only the `project.yml` files are committed, ensuring:
- No merge conflicts on project files
- Consistent project generation
- Easy project configuration updates
