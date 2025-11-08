# Security & Privacy Documentation

**Last Updated:** Based on security analysis  
**Version:** 1.0.0

## ⚠️ Important Security Notice

**This MCP server exposes personal data to Claude AI and Claude Desktop.**

- Email addresses and member information are sent to Claude AI
- Claude Desktop stores conversation history locally on your device
- Use only with accounts containing non-sensitive data
- Review this document before using in production

---

## Security Vulnerabilities

### 1. PII Exposure Risk 🔴

**What's Exposed:**
- Email addresses (via `mc_listMembers`, `mc_getMember`)
- Names and personal information (merge fields)
- Location data (IP geolocation)
- Phone numbers (if stored in merge fields)
- Account information including email addresses
- Custom merge fields (may contain sensitive PII)

**Data Flow:**
```
Mailchimp API → MCP Server → Claude Desktop → Claude AI → Potentially Stored
```

**Impact:**
- All PII is sent to Claude AI via tool responses
- Claude Desktop stores conversation history locally
- AI training data may include your data (check Claude's privacy policy)
- No built-in data masking or redaction

**Mitigation:**
- Use `MAILCHIMP_MASK_PII=true` environment variable (if implemented)
- Only query necessary fields
- Avoid bulk member queries
- Review Claude Desktop conversation history regularly

---

### 2. Claude Desktop Conversation Storage 🔴

**Storage Locations:**
- **macOS:** `~/Library/Application Support/Claude/`
- **Windows:** `%APPDATA%\Claude\`
- **Linux:** `~/.config/Claude/`

**What's Stored:**
- Full conversation history including API responses
- Email addresses and member data
- Campaign information
- Account details

**Risks:**
- Personal data stored unencrypted on local disk
- Accessible to anyone with system access
- No automatic deletion mechanism
- Potential exposure in backups

**Mitigation:**
- Regularly review and delete conversation history
- Use disk encryption on your computer
- Don't share your computer with untrusted users
- Consider using a separate Claude Desktop profile

---

### 3. API Key Exposure 🟡

**Current Risks:**
- API keys stored in plaintext in `claude_desktop_config.json`
- API keys visible in environment variables
- No encryption at rest
- No key rotation mechanism

**Attack Vectors:**
- Malware scanning config files
- Shared computers
- Screenshots/logs containing API keys
- Accidental git commits

**Mitigation:**
- Use environment variables instead of config files when possible
- Use read-only API keys with minimal permissions
- Rotate API keys regularly
- Never commit API keys to version control
- Use keychain/credential store for production

---

### 4. No Data Masking/Redaction 🟡

**Current Behavior:**
- Full email addresses returned in responses
- Complete member data sent to Claude
- No field-level filtering
- No PII redaction by default

**Example Exposure:**
```json
{
  "email_address": "user@example.com",  // Full PII exposed
  "full_name": "John Doe",              // PII exposed
  "location": {                         // Geolocation exposed
    "latitude": 40.7128,
    "longitude": -74.0060
  }
}
```

**Mitigation:**
- Enable PII masking when available (`MAILCHIMP_MASK_PII=true`)
- Use field-level filtering in queries
- Limit data returned in responses

---

### 5. No Access Controls 🟡

**Current Access:**
- All endpoints accessible if API key is valid
- No user-level permissions
- No field-level access control
- Read-only mode doesn't restrict data access

**Mitigation:**
- Use Mailchimp API keys with minimal permissions
- Create separate API keys for different use cases
- Monitor API usage in Mailchimp dashboard

---

### 6. No Audit Logging 🟡

**Missing Features:**
- No request logging
- No audit trail of data access
- No data access monitoring
- No anomaly detection

**Mitigation:**
- Monitor Mailchimp API usage dashboard
- Review Claude Desktop conversation history
- Use Mailchimp's audit logs if available

---

---

## Compliance Considerations

### GDPR (General Data Protection Regulation)

**Risks:**
- Personal data processed without explicit consent mechanism
- No right to deletion implemented
- No data portability features
- No breach notification system

**Requirements:**
- ✅ **Consent:** Get explicit consent from data subjects before use
- ❌ **Right to Deletion:** Not implemented (manual process required)
- ❌ **Data Portability:** Not implemented
- ❌ **Privacy by Design:** Basic implementation, needs improvement

**Recommendations:**
- Document data processing activities (DPIA)
- Implement data deletion mechanism
- Add consent checkbox during setup
- Provide data export functionality

---

### CCPA (California Consumer Privacy Act)

**Risks:**
- No "Do Not Sell" option
- No deletion request mechanism
- No transparency reports

**Requirements:**
- ❌ **Right to Know:** Not implemented
- ❌ **Right to Delete:** Not implemented
- ❌ **Right to Opt-Out:** Not implemented
- ❌ **Non-Discrimination:** N/A

**Recommendations:**
- Add privacy notice
- Provide deletion mechanism
- Show data collection transparency
- Honor opt-out requests

---

### HIPAA (Health Insurance Portability and Accountability Act)

**⚠️ CRITICAL: Do NOT use with Protected Health Information (PHI)**

**Requirements:**
- ❌ **Business Associate Agreement:** Not available
- ❌ **Encryption:** Not fully implemented
- ❌ **Access Controls:** Not HIPAA-compliant
- ❌ **Audit Logs:** Not HIPAA-compliant

**Recommendation:**
- **Do not use this MCP server with healthcare data**
- Use only with non-sensitive, non-PHI data
- Consider HIPAA-compliant alternatives if handling PHI

---

## Security Best Practices

### For End Users

1. **Use Read-Only API Keys**
   - Create API keys with minimal permissions
   - Use keys scoped to specific audiences if possible
   - Rotate keys regularly

2. **Limit Data Exposure**
   - Only query necessary fields
   - Avoid bulk member queries
   - Don't share Claude Desktop conversations

3. **Secure Storage**
   - Encrypt your `claude_desktop_config.json` file
   - Use environment variables instead of config files when possible
   - Never commit API keys to version control
   - Use keychain/credential store for production

4. **Monitor Access**
   - Review Claude Desktop conversation history regularly
   - Monitor Mailchimp API usage dashboard
   - Set up alerts for unusual activity
   - Rotate API keys if compromised

5. **Compliance Considerations**
   - Only use with non-sensitive data
   - Get explicit consent from data subjects
   - Document data processing activities
   - Have deletion procedures ready

---

### For Developers

1. **Code Security**
   - Never log API keys or sensitive data
   - Validate all inputs before processing
   - Handle errors gracefully without exposing sensitive info
   - Use secure defaults (read-only mode)

2. **Dependency Management**
   - Keep dependencies updated
   - Review dependencies for vulnerabilities
   - Use `npm audit` regularly

3. **Configuration**
   - Use environment variables for sensitive data
   - Validate configuration at startup
   - Provide clear security warnings

---

## Data Handling Practices

### Data Collection
- This MCP server reads data from Mailchimp API
- No data is stored by the MCP server itself
- Data flows through Claude Desktop to Claude AI
- Claude Desktop may store conversation history locally

### Data Storage
- **MCP Server:** No persistent storage
- **Claude Desktop:** Stores conversation history locally
- **Mailchimp:** Data remains in Mailchimp's systems
- **Claude AI:** Check Claude's privacy policy for data storage

### Data Sharing
- Data is shared with Claude AI (Anthropic)
- Check Claude's privacy policy for data usage
- Data may be used for AI training (check policy)
- No data is shared with third parties by this MCP server

---

## Incident Response

### If API Key is Compromised

1. **Immediately revoke the key in Mailchimp**
   - Go to Mailchimp → Account → Extras → API keys
   - Delete the compromised key
   - Create a new key

2. **Update Configuration**
   - Update `.env` file
   - Update Claude Desktop config
   - Restart Claude Desktop

3. **Monitor for Unauthorized Access**
   - Check Mailchimp API usage logs
   - Review recent activity
   - Contact Mailchimp support if needed

### If PII is Exposed

1. **Assess the Breach**
   - Determine what data was exposed
   - Identify affected individuals
   - Document the incident

2. **Notify Authorities (if required)**
   - GDPR: Notify within 72 hours if high risk
   - CCPA: Follow California requirements
   - HIPAA: Follow HIPAA breach notification rules

3. **Notify Affected Individuals**
   - Provide clear information about the breach
   - Explain what data was exposed
   - Provide remediation steps

---

## Security Reporting

### Reporting Vulnerabilities

If you discover a security vulnerability:

1. **Do NOT create a public GitHub issue**
2. Email security details to: [Your Security Email]
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### Security Updates

- Security updates will be released as needed
- Critical vulnerabilities will be patched immediately
- Check GitHub releases for security updates
- Subscribe to security notifications

---

## Security Features Roadmap

### Planned Improvements

- [x] PII masking functionality
- [x] Field-level filtering
- [ ] Audit logging
- [ ] Data encryption at rest
- [ ] Key rotation mechanism
- [ ] GDPR compliance tools
- [ ] Data deletion mechanism
- [ ] Access controls
- [x] Error message sanitization
- [x] CORS security improvements
- [x] Security headers
- [x] Input validation enhancements
- [x] Request body size limits
- [x] CORS origin validation improvements

### Long-term Goals

- [ ] HIPAA compliance (if needed)
- [ ] SOC 2 compliance
- [ ] ISO 27001 compliance
- [ ] Security certifications

---

## Additional Resources

- [Mailchimp Security Documentation](https://mailchimp.com/developer/security/)
- [Anthropic Privacy Policy](https://www.anthropic.com/privacy)
- [GDPR Information](https://gdpr.eu/)
- [CCPA Information](https://oag.ca.gov/privacy/ccpa)
- [HIPAA Information](https://www.hhs.gov/hipaa/index.html)

---

## Disclaimer

**This software is provided "as is" without warranty of any kind.**

- The authors are not responsible for data breaches or compliance violations
- Users are responsible for compliance with applicable laws
- Users should conduct their own security assessments
- Use at your own risk

**For production use with sensitive data, consult with security and compliance experts.**

---

**Last Updated:** Based on security analysis  
**Version:** 1.0.0

