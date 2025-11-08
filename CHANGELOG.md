# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2024-12-XX

### Added
- License-based feature gating system
- Free version: Read-only access with 5 Marketer prompts
- Paid version: Full read/write access with all 30+ prompts
- Setup UI for secure key entry (`npm run setup`)
- License key validation (format: ALIEN-XXXX-XXXX-XXXX)
- License key generation script (`scripts/generate-license.js`)
- Automatic Claude Desktop config updates
- Backward compatibility with `MAILCHIMP_READONLY` environment variable
- Audience creation tool (`mc_createAudience`)

### Changed
- Package name changed to `@alien-lifestyles/mailchimp-mcp` (scoped package)
- License system replaces `MAILCHIMP_READONLY` (deprecated but still works)
- Prompts filtered based on license type
- Enhanced write tools with audience management

### Security
- All keys stored locally in `.env` file
- Setup UI runs on localhost only
- No external network calls for key storage
- Sensitive documents excluded from repository

## [0.1.0] - Pre-Licensing Version

### Features
- Full Mailchimp API integration
- Read-only and write tools
- Template creation with MTL validation
- File Manager integration
- AI Image Generation (OpenAI, Stability AI, Replicate)
- 30+ pre-populated prompts
- Domain authentication status tools
- Standardized layout instructions for consistent reports

[0.2.0]: https://github.com/alien-lifestyles/mailchimp-mcp-alien-lifestyles/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/alien-lifestyles/mailchimp-mcp-alien-lifestyles/releases/tag/v0.1.0

