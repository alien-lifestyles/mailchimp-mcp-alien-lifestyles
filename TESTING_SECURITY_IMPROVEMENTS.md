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

**Note:** This server only supports stdio mode. HTTP mode has been removed for security and simplicity.

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

1. **HTTP Mode Removed** - Server now only supports stdio mode
   - Simplified codebase and security model
   - Removed HTTP/SSE endpoints and CORS handling
   - All communication via stdio (standard MCP approach)

2. **Input Validation** - Enhanced validation remains in place
   - Email format and length validation
   - Pagination limits (offset, count)
   - All existing validations still active

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

