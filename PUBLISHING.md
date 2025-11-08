# Publishing Workflow

This document outlines the process for publishing new versions of the Mailchimp MCP package to npm.

## Prerequisites

1. **npm Account**: Ensure you're logged in to npm with access to `@alien-lifestyles` scope
   ```bash
   npm login
   ```

2. **Git**: Ensure all changes are committed and pushed to the repository

## Publishing Steps

### 1. Update Version

Update the version in `package.json` following semantic versioning:
- **MAJOR** (1.0.0 → 2.0.0): Breaking changes
- **MINOR** (1.0.0 → 1.1.0): New features (backward compatible)
- **PATCH** (1.0.0 → 1.0.1): Bug fixes

```bash
# Edit package.json manually or use npm version
npm version patch  # for 1.0.0 → 1.0.1
npm version minor  # for 1.0.0 → 1.1.0
npm version major  # for 1.0.0 → 2.0.0
```

### 2. Update CHANGELOG.md

Add a new entry in `CHANGELOG.md` documenting:
- New features
- Changes
- Bug fixes
- Breaking changes (if any)

### 3. Build the Project

Ensure the project builds successfully:

```bash
npm run build
```

### 4. Test Locally

Test the built package locally:

```bash
# Test the setup UI
npm run setup

# Test the main server
npm start
```

### 5. Publish to npm

Publish the package:

```bash
npm publish --access public
```

The `prepublishOnly` script will automatically run `npm run build` before publishing.

### 6. Tag Release in GitHub

Create a git tag for the release:

```bash
git tag v1.0.0
git push origin v1.0.0
```

Or create a release on GitHub:
1. Go to GitHub repository
2. Click "Releases" → "Create a new release"
3. Tag: `v1.0.0`
4. Title: `v1.0.0 - License System & Setup UI`
5. Description: Copy from CHANGELOG.md
6. Publish release

## Verification

After publishing, verify the package is available:

```bash
npm view @alien-lifestyles/mailchimp-mcp
```

Users can install/update with:

```bash
npm install -g @alien-lifestyles/mailchimp-mcp
# or
npm update @alien-lifestyles/mailchimp-mcp
```

## Troubleshooting

### "Package name already exists"
- Check if version already exists: `npm view @alien-lifestyles/mailchimp-mcp versions`
- Increment version number

### "Access denied"
- Ensure you're logged in: `npm whoami`
- Verify you have access to `@alien-lifestyles` scope
- Check `publishConfig.access` in package.json

### Build fails
- Check for TypeScript errors: `npm run build`
- Ensure all dependencies are installed: `npm install`

