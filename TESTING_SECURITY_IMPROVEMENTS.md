# Testing Guide - Security Improvements (Dec 2024)

**Date:** December 2024  
**Changes:** CORS validation improvements, request body size limits

## Quick Test Checklist

### ✅ Basic Functionality Tests

1. **Test Core Operations:**
   ```
   Can you run mc_ping?
   List my Mailchimp audiences
   Show me my recent campaigns
   ```
   **Expected:** All operations work as before

---

### 🔒 CORS Security Tests (HTTP Mode Only)

If testing HTTP mode (`TRANSPORT_MODE=http`):

1. **Test Localhost Access:**
   - From `http://localhost:3000` - Should work ✅
   - From `http://127.0.0.1:3000` - Should work ✅

2. **Test Invalid Origins (Should Fail):**
   - From `http://evillocalhost.com` - Should be blocked ❌
   - From `http://localhost.evil.com` - Should be blocked ❌
   - From `http://example.com` - Should be blocked ❌

**Note:** If HTTP mode isn't used, skip these tests (stdio mode doesn't use CORS)

---

### 🔒 Request Body Size Limit Tests (HTTP Mode Only)

If testing HTTP mode:

1. **Normal Request:**
   - Small request body (< 10MB) - Should work ✅

2. **Oversized Request:**
   - Request body > 10MB - Should reject with error ❌
   - Error message should mention "Request body too large"

**Note:** This is hard to test manually, but the protection is in place

---

### ✅ General Functionality

Test that all existing features still work:

- [ ] `mc_ping` - Connection test
- [ ] `mc_listAudiences` - List audiences
- [ ] `mc_getAudience` - Get audience details
- [ ] `mc_listMembers` - List members
- [ ] `mc_getMember` - Get member (with email validation)
- [ ] `mc_listCampaigns` - List campaigns
- [ ] `mc_getCampaign` - Get campaign details

**Expected:** All features work identically to before

---

### 🔒 Input Validation Tests

Test that validation still works:

- [ ] Invalid email format - Should reject
- [ ] Email > 254 characters - Should reject
- [ ] Offset > 100,000 - Should reject
- [ ] Count > 1000 - Should reject

**Expected:** All validations work as before

---

## What Changed

1. **CORS Origin Validation** - Now uses URL parsing instead of substring matching
   - Only affects HTTP mode
   - More secure against subdomain attacks
   - Should work identically for legitimate localhost usage

2. **Request Body Size Limits** - 10MB limit added
   - Only affects HTTP mode
   - Prevents DoS via large payloads
   - Normal requests unaffected

3. **Documentation** - Rate limiting guidance added
   - Documentation only, no code changes

---

## Expected Results

✅ **All existing functionality should work identically**  
✅ **No breaking changes**  
✅ **Security improvements are transparent to normal usage**

---

## Issues to Report

If you encounter:
- ❌ CORS errors for legitimate localhost access
- ❌ Normal requests being rejected
- ❌ Any functionality that worked before but doesn't now
- ❌ Unexpected errors

---

## After Testing

Once testing is complete:
- If everything works: We can commit the changes
- If issues found: Report them and we'll fix before committing

**Note:** Most changes are internal security improvements that won't affect normal usage. The main thing to verify is that everything still works as expected!

