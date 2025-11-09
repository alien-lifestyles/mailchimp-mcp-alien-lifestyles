# Creating Xcode Projects for Installer and Uninstaller

The Swift source files are ready, but you need to create Xcode projects to build them. Follow these steps:

## For MailchimpMCPInstaller

1. Open Xcode
2. File → New → Project
3. Choose "macOS" → "App"
4. Configure:
   - Product Name: `MailchimpMCPInstaller`
   - Team: (Select your team or None)
   - Organization Identifier: `com.alienlifestyles`
   - Bundle Identifier: `com.alienlifestyles.mailchimp-mcp-installer`
   - Language: Swift
   - Interface: AppKit
   - Use SwiftUI: No
   - Include Tests: No
5. Save location: `installer/macos/`
6. After project creation:
   - Delete the default `AppDelegate.swift` and `ContentView.swift` if created
   - Add all files from `MailchimpMCPInstaller/` directory:
     - `MailchimpMCPInstallerApp.swift` (rename to `AppDelegate.swift` in Xcode)
     - `InstallerWindowController.swift`
     - All files in `Views/` folder
     - All files in `Services/` folder
     - `Info.plist` (update project settings to use it)
     - `Resources/TERMS.md`
7. Update Build Settings:
   - Deployment Target: macOS 11.0
   - Code Signing: Automatic (or your Developer ID)
8. Update Info.plist path in Build Settings if needed

## For MailchimpMCPUninstaller

Repeat the same steps with:
- Product Name: `MailchimpMCPUninstaller`
- Bundle Identifier: `com.alienlifestyles.mailchimp-mcp-uninstaller`
- Add files from `MailchimpMCPUninstaller/` directory

## Building

Once projects are created, you can build using:

```bash
npm run build:installer
```

Or manually in Xcode:
1. Select "Release" scheme
2. Product → Archive
3. Export the apps
4. Run `./scripts/build-dmg.sh` to create the DMG

## Alternative: Use XcodeGen (Optional)

If you have XcodeGen installed, you could create `project.yml` files to generate the projects automatically.

