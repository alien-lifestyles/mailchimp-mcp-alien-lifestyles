# Compliance Documentation

**Last Updated:** Based on security analysis  
**Version:** 1.0.0

This document outlines compliance considerations for using the Mailchimp MCP Server with various data protection regulations.

---

## GDPR (General Data Protection Regulation)

### Applicability
GDPR applies to processing personal data of individuals in the European Economic Area (EEA).

### Data Processing Details

**What Data is Processed:**
- Email addresses
- Names and personal information (merge fields)
- Location data (IP geolocation)
- Phone numbers (if stored)
- Account information
- Campaign performance data

**How Data is Processed:**
- Read from Mailchimp API
- Sent to Claude AI via MCP protocol
- Stored in Claude Desktop conversation history
- Potentially used for AI training (check Claude's privacy policy)

**Legal Basis:**
- You must have a legal basis for processing (consent, legitimate interest, etc.)
- Document your legal basis for processing

### GDPR Requirements Status

| Requirement | Status | Notes |
|------------|--------|-------|
| **Right to be Informed** | ⚠️ Partial | Basic notice provided, but explicit consent mechanism not implemented |
| **Right of Access** | ✅ Available | Users can query their own data via MCP tools |
| **Right to Rectification** | ✅ Available | Can be done via Mailchimp directly |
| **Right to Erasure** | ❌ Not Implemented | No automatic deletion mechanism |
| **Right to Restrict Processing** | ⚠️ Partial | Read-only mode available, but no granular controls |
| **Right to Data Portability** | ❌ Not Implemented | No export functionality |
| **Right to Object** | ⚠️ Partial | Can disable MCP, but no opt-out mechanism for processing |
| **Rights Related to Automated Decision Making** | N/A | Not applicable |

### GDPR Compliance Recommendations

**For Data Controllers (Users of this MCP):**

1. **Obtain Explicit Consent**
   - Inform data subjects that their data will be processed by Claude AI
   - Get explicit consent before using this MCP with personal data
   - Document consent appropriately

2. **Conduct Data Protection Impact Assessment (DPIA)**
   - Assess risks of processing personal data via Claude AI
   - Document processing activities
   - Implement appropriate safeguards

3. **Implement Data Minimization**
   - Enable PII masking (`MAILCHIMP_MASK_PII=true`)
   - Only query necessary data
   - Limit conversation history retention

4. **Provide Data Subject Rights**
   - Have procedures for handling data subject requests
   - Provide data export functionality
   - Implement deletion procedures

5. **Document Processing Activities**
   - Maintain records of processing activities
   - Document legal basis for processing
   - Keep audit logs

**For Users:**
- Review Claude's privacy policy before use
- Understand data flows
- Enable PII masking when possible
- Regularly review and delete conversation history

---

## CCPA (California Consumer Privacy Act)

### Applicability
CCPA applies to for-profit businesses that:
- Do business in California
- Meet certain revenue thresholds
- Process personal information of California residents

### CCPA Requirements Status

| Requirement | Status | Notes |
|------------|--------|-------|
| **Right to Know** | ⚠️ Partial | Can query data, but no transparency report |
| **Right to Delete** | ❌ Not Implemented | No deletion mechanism |
| **Right to Opt-Out** | ❌ Not Implemented | No opt-out mechanism |
| **Right to Non-Discrimination** | ✅ Available | Service available regardless of privacy choices |
| **Notice at Collection** | ⚠️ Partial | Basic notice, but could be improved |

### CCPA Compliance Recommendations

**For Businesses:**

1. **Provide Privacy Notice**
   - Notify consumers about data collection
   - Explain how data is used and shared
   - Provide contact information for privacy requests

2. **Implement Consumer Rights**
   - Provide data access upon request
   - Implement deletion mechanism
   - Honor opt-out requests

3. **Update Privacy Policy**
   - Disclose use of AI services (Claude)
   - Explain data sharing practices
   - Provide opt-out instructions

4. **Avoid Discrimination**
   - Don't discriminate against consumers exercising privacy rights
   - Provide same service regardless of privacy choices

**For Users:**
- Review privacy policies of all involved services
- Understand data sharing practices
- Exercise privacy rights when appropriate

---

## HIPAA (Health Insurance Portability and Accountability Act)

### ⚠️ CRITICAL WARNING

**DO NOT USE THIS MCP SERVER WITH PROTECTED HEALTH INFORMATION (PHI)**

### HIPAA Requirements

| Requirement | Status | Notes |
|------------|--------|-------|
| **Business Associate Agreement (BAA)** | ❌ Not Available | No BAA with Claude/Anthropic |
| **Administrative Safeguards** | ❌ Not Compliant | No HIPAA-compliant policies |
| **Physical Safeguards** | ⚠️ Partial | Depends on user's infrastructure |
| **Technical Safeguards** | ❌ Not Compliant | No encryption requirements, no access controls |
| **Organizational Requirements** | ❌ Not Compliant | No BAA mechanisms |

### HIPAA Compliance Status

**This MCP Server is NOT HIPAA-Compliant**

**Reasons:**
- No Business Associate Agreement (BAA) available
- No HIPAA-compliant encryption requirements
- No access controls required
- No audit logging required
- No breach notification mechanisms
- Data may be processed by AI services without HIPAA compliance

### HIPAA Recommendations

**For Healthcare Organizations:**

1. **DO NOT USE with PHI**
   - This MCP server is not designed for healthcare data
   - No HIPAA-compliant safeguards
   - Risk of HIPAA violations

2. **Use HIPAA-Compliant Alternatives**
   - Use Mailchimp's HIPAA-compliant features directly
   - Implement proper BAAs with all vendors
   - Use HIPAA-compliant integrations only

3. **If Handling Health Data**
   - Consult with HIPAA compliance experts
   - Implement proper safeguards
   - Use only HIPAA-compliant services

**For General Users:**
- Don't use with healthcare-related data
- Be aware of HIPAA requirements if handling health data
- Consider compliance implications

---

## Other Compliance Considerations

### SOC 2
- **Status:** Not SOC 2 compliant
- **Recommendation:** Not applicable for this open-source tool

### ISO 27001
- **Status:** Not ISO 27001 certified
- **Recommendation:** Not applicable for this open-source tool

### PCI DSS
- **Not Applicable:** This MCP server doesn't handle payment card data
- **Recommendation:** If processing payments, use Mailchimp's payment features directly

---

## Compliance Checklist

### Before Using in Production

- [ ] Review applicable regulations (GDPR, CCPA, etc.)
- [ ] Obtain necessary consents
- [ ] Enable PII masking (`MAILCHIMP_MASK_PII=true`)
- [ ] Document data processing activities
- [ ] Implement privacy notices
- [ ] Establish data subject request procedures
- [ ] Review Claude's privacy policy
- [ ] Understand data flows
- [ ] Secure API keys and configuration
- [ ] Train users on compliance requirements

### Ongoing Compliance

- [ ] Regularly review conversation history
- [ ] Delete sensitive conversations promptly
- [ ] Monitor data access
- [ ] Update privacy policies as needed
- [ ] Respond to data subject requests
- [ ] Rotate API keys regularly
- [ ] Review compliance documentation
- [ ] Update security measures

---

## Data Subject Request Procedures

### Access Requests

**How to Handle:**
1. User requests access to their data
2. Use MCP tools to query their data from Mailchimp
3. Provide data in structured format
4. Document the request and response

**Tools Available:**
- `mc_getMember` - Get member data
- `mc_listMembers` - List members (can filter)
- Export conversation history if needed

### Deletion Requests

**How to Handle:**
1. User requests deletion
2. Delete from Mailchimp directly (not via MCP)
3. Delete conversation history from Claude Desktop
4. Confirm deletion in writing
5. Document the request

**Limitations:**
- MCP server doesn't delete data directly
- Must delete from Mailchimp
- Must manually delete Claude Desktop conversations

### Opt-Out Requests

**How to Handle:**
1. User requests opt-out
2. Disable MCP server
3. Remove from Claude Desktop configuration
4. Confirm opt-out
5. Document the request

---

## Incident Response

### Data Breach Procedures

**If a Breach Occurs:**

1. **Assess the Breach**
   - Determine what data was exposed
   - Identify affected individuals
   - Document the incident

2. **Notify Authorities (if required)**
   - **GDPR:** Notify within 72 hours if high risk
   - **CCPA:** Follow California requirements
   - **HIPAA:** Follow HIPAA breach notification rules

3. **Notify Affected Individuals**
   - Provide clear information about the breach
   - Explain what data was exposed
   - Provide remediation steps

4. **Document Everything**
   - Keep records of the breach
   - Document response actions
   - Update security measures

---

## Privacy by Design

### Current Implementation

- ✅ Read-only mode available
- ✅ PII masking available
- ✅ Input validation
- ⚠️ No data retention policies
- ⚠️ No automatic deletion
- ⚠️ Limited access controls

### Recommendations

1. **Enable PII Masking by Default**
   - Consider making masking the default
   - Make it easy to enable

2. **Implement Data Minimization**
   - Only query necessary fields
   - Limit data returned
   - Use field-level filtering

3. **Add Data Retention Policies**
   - Auto-delete old conversations
   - Configurable retention periods
   - Clear data on request

4. **Enhance Access Controls**
   - Field-level permissions
   - User-level access controls
   - Audit logging

---

## Additional Resources

- [GDPR Official Site](https://gdpr.eu/)
- [CCPA Official Site](https://oag.ca.gov/privacy/ccpa)
- [HIPAA Official Site](https://www.hhs.gov/hipaa/index.html)
- [Mailchimp Privacy Policy](https://mailchimp.com/legal/privacy/)
- [Anthropic Privacy Policy](https://www.anthropic.com/privacy)
- [EU-US Privacy Shield](https://www.privacyshield.gov/) (Note: Invalidated, check current status)

---

## Disclaimer

**This compliance documentation is provided for informational purposes only.**

- Not legal advice
- Consult with compliance experts for your specific situation
- Regulations may change, stay updated
- You are responsible for your own compliance

**For production use with sensitive data, consult with legal and compliance experts.**

---

**Last Updated:** Based on security analysis  
**Version:** 1.0.0

