# Next Steps - After macOS/Xcode Update

## Current Status

✅ **v0.3 Tagged and Pushed to GitHub**
- All installer and uninstaller code is committed
- Tag `v0.3` has been created and pushed to GitHub
- Ready for Xcode project creation

## Next Steps (After Xcode is Updated)

### 1. Create Xcode Projects

Follow the guide in `installer/macos/CREATE_XCODE_PROJECTS.md`:

- Create `MailchimpMCPInstaller.xcodeproj` in `installer/macos/`
- Create `MailchimpMCPUninstaller.xcodeproj` in `installer/macos/`
- Add all Swift files to each project
- Configure build settings (macOS 11.0+, code signing)

### 2. Build the Apps

Once Xcode projects are created:

```bash
npm run build:installer
```

This will:
- Build both installer and uninstaller apps
- Create a DMG file at `dist/MailchimpMCPInstaller.dmg`

### 3. Test the Installer

- Test on a clean macOS system (or VM)
- Verify installation flow works correctly
- Verify Claude Desktop config is updated
- Test that Claude Desktop auto-starts Mailchimp MCP after restart

### 4. Test the Uninstaller

- Test complete removal of all components
- Verify .env files are securely deleted
- Verify Claude Desktop config is cleaned
- Verify no traces remain

### 5. Create GitHub Release

- Go to GitHub Releases
- Create a new release for v0.3
- Upload the DMG file
- Add release notes

## Files Ready for Xcode

All Swift source files are ready in:
- `installer/macos/MailchimpMCPInstaller/`
- `installer/macos/MailchimpMCPUninstaller/`

## Documentation

- `installer/macos/CREATE_XCODE_PROJECTS.md` - Step-by-step Xcode project creation
- `installer/macos/README.md` - Build instructions
- `installer/macos/IMPLEMENTATION_SUMMARY.md` - Complete implementation details

## Notes

- The installer validates Claude Desktop config to ensure auto-start will work
- The uninstaller securely deletes all sensitive data (API keys, etc.)
- Both apps are one-time executables (they exit after completion)

