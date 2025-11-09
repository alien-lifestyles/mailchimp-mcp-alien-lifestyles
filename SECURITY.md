# Security & Privacy Documentation

**Version:** 1.0.0

## ⚠️ Important Security Notice

**This MCP server exposes personal data to Claude AI and Claude Desktop.**

- Email addresses and member information are sent to Claude AI
- Claude Desktop stores conversation history locally on your device
- Use only with accounts containing non-sensitive data
- Enable PII masking (`MAILCHIMP_MASK_PII=true`) to protect personal information

## Security Risks

### PII Exposure Risk 🔴

**What's Exposed:**
- Email addresses, names, personal information (merge fields)
- Location data (IP geolocation)
- Phone numbers and custom merge fields

**Data Flow:**
```
Mailchimp API → MCP Server → Claude Desktop → Claude AI → Potentially Stored
```

**Mitigation:**
- Use `MAILCHIMP_MASK_PII=true` environment variable
- Only query necessary fields
- Avoid bulk member queries
- Review Claude Desktop conversation history regularly

### Claude Desktop Conversation Storage 🔴

**Storage Locations:**
- **macOS:** `~/Library/Application Support/Claude/`
- **Windows:** `%APPDATA%\Claude\`
- **Linux:** `~/.config/Claude/`

**Risks:**
- Personal data stored unencrypted on local disk
- Accessible to anyone with system access
- No automatic deletion mechanism

**Mitigation:**
- Regularly review and delete conversation history
- Use disk encryption on your computer
- Don't share your computer with untrusted users

### API Key Exposure 🟡

**Risks:**
- API keys stored in plaintext in `claude_desktop_config.json`
- No encryption at rest
- No key rotation mechanism

**Mitigation:**
- Use environment variables instead of config files when possible
- Use read-only API keys with minimal permissions
- Rotate API keys regularly
- Never commit API keys to version control

### No Data Masking/Redaction 🟡

**Current Behavior:**
- Full email addresses returned in responses
- Complete member data sent to Claude
- No PII redaction by default

**Mitigation:**
- Enable PII masking (`MAILCHIMP_MASK_PII=true`)
- Use field-level filtering in queries
- Limit data returned in responses

## Compliance Considerations

### GDPR

**Requirements:**
- ✅ Get explicit consent from data subjects before use
- ❌ Right to Deletion: Not implemented (manual process required)
- ❌ Data Portability: Not implemented

**Recommendations:**
- Document data processing activities (DPIA)
- Implement data deletion mechanism
- Provide data export functionality

### CCPA

**Requirements:**
- ❌ Right to Know: Not implemented
- ❌ Right to Delete: Not implemented
- ❌ Right to Opt-Out: Not implemented

**Recommendations:**
- Add privacy notice
- Provide deletion mechanism
- Show data collection transparency

### HIPAA

**⚠️ CRITICAL: Do NOT use with Protected Health Information (PHI)**

- Not HIPAA-compliant
- Do not use this MCP server with healthcare data
- Use only with non-sensitive, non-PHI data

## Security Best Practices

### For End Users

1. **Use Read-Only API Keys** - Create API keys with minimal permissions, rotate regularly
2. **Limit Data Exposure** - Only query necessary fields, avoid bulk member queries
3. **Secure Storage** - Encrypt config files, use environment variables, never commit API keys
4. **Monitor Access** - Review conversation history, monitor API usage, rotate keys if compromised
5. **Compliance** - Only use with non-sensitive data, get explicit consent, document activities

### For Developers

1. **Code Security** - Never log API keys, validate inputs, handle errors gracefully
2. **Dependency Management** - Keep dependencies updated, use `npm audit` regularly
3. **Configuration** - Use environment variables, validate at startup, provide security warnings

## Data Handling

- **Collection:** Reads data from Mailchimp API, no storage by MCP server
- **Storage:** Claude Desktop stores conversation history locally
- **Sharing:** Data shared with Claude AI (Anthropic), check privacy policy

## Incident Response

### If API Key is Compromised

1. Immediately revoke the key in Mailchimp
2. Update `.env` file and Claude Desktop config
3. Monitor for unauthorized access

### If PII is Exposed

1. Assess the breach - determine what data was exposed
2. Notify authorities (if required) - GDPR (72 hours), CCPA, HIPAA
3. Notify affected individuals with clear information

## Security Features

**Implemented:**
- ✅ PII masking functionality
- ✅ Field-level filtering
- ✅ Error message sanitization
- ✅ Input validation enhancements

**Planned:**
- [ ] Audit logging
- [ ] Data encryption at rest
- [ ] Key rotation mechanism
- [ ] GDPR compliance tools

## Additional Resources

- [Mailchimp Security Documentation](https://mailchimp.com/developer/security/)
- [Anthropic Privacy Policy](https://www.anthropic.com/privacy)
- [GDPR Information](https://gdpr.eu/)
- [CCPA Information](https://oag.ca.gov/privacy/ccpa)
- [HIPAA Information](https://www.hhs.gov/hipaa/index.html)

## Disclaimer

**This software is provided "as is" without warranty of any kind.**

- Users are responsible for compliance with applicable laws
- Users should conduct their own security assessments
- Use at your own risk

**For production use with sensitive data, consult with security and compliance experts.**
