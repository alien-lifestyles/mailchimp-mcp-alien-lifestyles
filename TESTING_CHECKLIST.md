# Testing Checklist - Security Fixes

**Date:** November 5, 2024  
**Branch:** security-fixes

## Pre-Testing Checklist

- [ ] Build successful (`npm run build`)
- [ ] Claude Desktop configuration updated if needed
- [ ] `.env` file configured with API key
- [ ] Claude Desktop restarted if configuration changed

---

## Test Scenarios

### 1. Basic Read Operations ✅

Test that all read operations still work:

- [ ] `mc_ping` - Should return `{ ok: true }`
- [ ] `mc_listAudiences` - Should list audiences
- [ ] `mc_getAudience` - Should get audience details
- [ ] `mc_listMembers` - Should list members
- [ ] `mc_getMember` - Should get member details (with email)
- [ ] `mc_listCampaigns` - Should list campaigns
- [ ] `mc_getCampaign` - Should get campaign details

**Expected:** All operations work as before, no errors

---

### 2. Error Handling Validation 🔒

Test that error messages are sanitized:

- [ ] Test with invalid API key - Error should not expose full API response
- [ ] Test with invalid audience ID - Error should be sanitized
- [ ] Test with invalid email format - Should show validation error (not full API error)

**Expected:** Error messages are sanitized, only show safe fields (`detail`, `title`, `status`)

---

### 3. Input Validation 🔒

Test that new validation limits work:

- [ ] Email validation: Test email > 254 characters - Should reject
- [ ] Offset validation: Test offset > 100,000 - Should reject
- [ ] Count validation: Test count > 1000 - Should reject (existing)

**Expected:** Invalid inputs are rejected with clear error messages

---

### 4. PII Masking (if enabled) 🔒

Test that PII masking still works:

- [ ] With `MAILCHIMP_MASK_PII=true` - Email addresses should be masked
- [ ] With `MAILCHIMP_MASK_PII=false` - Full email addresses shown

**Expected:** PII masking works correctly based on environment variable

---

### 5. HTTP Mode (if testing HTTP) 🔒

If testing HTTP mode (`TRANSPORT_MODE=http`):

- [ ] CORS from localhost - Should work
- [ ] CORS from external origin - Should be blocked (unless ALLOWED_ORIGINS set)
- [ ] Security headers present - Check response headers

**Expected:** CORS restricted to localhost by default, security headers present

---

### 6. Backward Compatibility ✅

Test that existing functionality still works:

- [ ] All existing queries work
- [ ] Response format unchanged
- [ ] PII masking behavior unchanged (if used)
- [ ] Read-only mode works

**Expected:** No breaking changes, everything works as before

---

## Test Commands for Claude

Try these queries in Claude Desktop:

1. **Basic Ping:**
   ```
   Can you run mc_ping?
   ```

2. **List Audiences:**
   ```
   List my Mailchimp audiences
   ```

3. **Get Member (test email validation):**
   ```
   Get member details for email test@example.com in audience [audience_id]
   ```

4. **Test Error Handling:**
   ```
   Get member details for an invalid email address
   ```

5. **Test Pagination:**
   ```
   List members with offset 50000
   ```

---

## Issues to Watch For

⚠️ **If you see these, report them:**

1. Errors exposing full API responses (should be sanitized)
2. CORS errors for localhost (should work)
3. Validation errors for previously valid inputs
4. PII masking not working correctly
5. Any functionality that worked before but doesn't now

---

## Notes

- All changes are backward compatible
- Default behavior should be identical to before
- Only security improvements, no feature changes
- HTTP mode defaults to localhost-only CORS

---

**After Testing:** Report any issues or confirm everything works, then we'll commit!

