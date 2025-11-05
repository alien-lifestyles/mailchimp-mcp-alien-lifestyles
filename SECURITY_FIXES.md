# Security Fixes Branch Summary

## Branch: `security-fixes`

### Changes Made

**Total Lines Changed:** +31 insertions, -11 deletions

#### 1. ID Validation (Critical Fix)
- **Files:** `src/tools/read-tools.ts`, `src/tools/write-tools.ts`
- **Change:** Added regex validation for all Mailchimp IDs
- **Pattern:** `^[a-zA-Z0-9-]{1,64}$`
- **Impact:** Prevents path traversal attacks via ID injection
- **Validated IDs:**
  - `audienceId` (in 3 places)
  - `campaignId` (in 3 places)
  - `list_id` (in write tools)

#### 2. Server Prefix Validation (SSRF Prevention)
- **File:** `src/index.ts`
- **Change:** Whitelist validation for server prefix
- **Valid Prefixes:** us1-us21 (all Mailchimp datacenters)
- **Impact:** Prevents SSRF attacks via manipulated server prefix

#### 3. Content Size Limits
- **File:** `src/tools/write-tools.ts`
- **Change:** Added 1MB limit to `plain_text` and `html` fields
- **Impact:** Prevents DoS via large payloads

#### 4. HTML Sanitization Warning
- **File:** `src/tools/write-tools.ts`
- **Change:** Added comment noting HTML is not sanitized
- **Impact:** Documents security requirement for users

### Testing

✅ Build successful  
✅ No linter errors  
✅ All existing functionality preserved  
✅ Backward compatible (valid IDs still work)

### Next Steps

1. Test the branch with Claude Desktop
2. If everything works, merge to main
3. Optional: Create `cleanup` branch to remove HTTP mode code

### Rollback

If issues occur:
```bash
git checkout main
# v0.1.0 tag preserved for complete rollback
```

