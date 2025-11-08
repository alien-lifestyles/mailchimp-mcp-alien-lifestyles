# Testing Guide: Template Creation Features

This guide walks you through testing the new template creation and file management features.

## Prerequisites

1. **Environment Setup**
   - Ensure `MAILCHIMP_READONLY=false` in your `.env` file
   - Verify your API key has write permissions
   - Build the project: `npm run build`

2. **Test Account**
   - Use a test Mailchimp account (not production)
   - Have at least one audience/list available

## Testing Checklist

### ✅ 1. Basic Template Creation

**Test:** Create a simple template with MTL attributes

```bash
# Using Claude Desktop or MCP client, call:
mc_createTemplate({
  "name": "Test Template 1",
  "html": "<div mc:edit=\"header\"><h1>Test Header</h1></div><div mc:edit=\"body\"><p>Hello, *|FNAME|*!</p></div>"
})
```

**Expected:**
- Template created successfully
- Returns template ID
- Template appears in Mailchimp dashboard
- No validation errors (warnings OK)

**Verify:**
- Check Mailchimp dashboard → Templates → User templates
- Template should be visible and editable

---

### ✅ 2. MTL Validation - Missing Attributes

**Test:** Create template without `mc:edit` attributes

```bash
mc_createTemplate({
  "name": "Test Template - No MTL",
  "html": "<div><h1>No editable sections</h1></div>"
})
```

**Expected:**
- Template created successfully (warnings don't block)
- Warning logged about missing `mc:edit` attributes
- Template still functional but not editable in Mailchimp editor

**Verify:**
- Check console/logs for warning message
- Template exists but may not be fully editable in Mailchimp UI

---

### ✅ 3. MTL Validation - Size Limit

**Test:** Attempt to create template exceeding 1MB

```bash
# Generate large HTML string (>1MB)
mc_createTemplate({
  "name": "Oversized Template",
  "html": "<div>" + "x".repeat(1100000) + "</div>"  # ~1.1MB
})
```

**Expected:**
- Error: "MTL validation failed: HTML template exceeds 1MB size limit"
- Template NOT created

---

### ✅ 4. Update Template

**Test:** Update existing template

```bash
# First, create a template and note the templateId
# Then update it:
mc_updateTemplate({
  "templateId": "your-template-id",
  "name": "Updated Template Name",
  "html": "<div mc:edit=\"header\"><h1>Updated Header</h1></div>"
})
```

**Expected:**
- Template updated successfully
- Name and/or HTML changed
- MTL validation runs on HTML update

**Verify:**
- Check Mailchimp dashboard - template name/content updated

---

### ✅ 5. Delete Template

**Test:** Delete a template

```bash
mc_deleteTemplate({
  "templateId": "your-template-id"
})
```

**Expected:**
- Template deleted successfully
- Template no longer appears in Mailchimp dashboard

**Verify:**
- Check Mailchimp dashboard - template removed

---

### ✅ 6. File Upload

**Test:** Upload an image file

**Preparation:**
1. Convert an image to base64:
   ```bash
   # Using Node.js:
   node -e "const fs = require('fs'); console.log(fs.readFileSync('test-image.png').toString('base64'))"
   ```

2. Upload file:
   ```bash
   mc_uploadFile({
     "name": "test-logo.png",
     "file_data": "iVBORw0KGgoAAAANSUhEUgAA..."  # Your base64 string
   })
   ```

**Expected:**
- File uploaded successfully
- Returns file object with `url`, `size`, `id`
- File appears in Mailchimp File Manager

**Verify:**
- Check Mailchimp dashboard → File Manager
- File should be visible
- Note the file URL for use in templates

---

### ✅ 7. File Upload - Size Limit

**Test:** Attempt to upload file exceeding 10MB

```bash
# Generate large base64 string (>10MB when decoded)
mc_uploadFile({
  "name": "oversized-file.png",
  "file_data": "iVBORw0KGgoAAAANSUhEUgAA..."  # Large base64 string
})
```

**Expected:**
- Error: "File size exceeds 10MB limit"
- File NOT uploaded

---

### ✅ 8. File Upload - Invalid Base64

**Test:** Upload file with invalid base64 format

```bash
mc_uploadFile({
  "name": "invalid-file.png",
  "file_data": "not-valid-base64!!!"
})
```

**Expected:**
- Error: "Invalid base64 file data format"
- File NOT uploaded

---

### ✅ 9. Create Template with File Reference

**Test:** Create template using uploaded file URL

```bash
# First upload a file, get the URL
# Then create template:
mc_createTemplate({
  "name": "Template with Image",
  "html": `<div mc:edit="header"><img src="${fileUrl}" alt="Logo" /></div><div mc:edit="body">Content</div>`
})
```

**Expected:**
- Template created with image reference
- Image displays correctly in Mailchimp

**Verify:**
- Preview template in Mailchimp
- Image should load correctly

---

### ✅ 10. Folder Creation

**Test:** Create template and file folders

```bash
# Create template folder
mc_createTemplateFolder({
  "name": "My Custom Templates"
})

# Create file folder
mc_createFileFolder({
  "name": "Campaign Assets"
})
```

**Expected:**
- Folders created successfully
- Returns folder IDs
- Folders appear in Mailchimp dashboard

**Verify:**
- Check Mailchimp dashboard:
  - Templates → Folders
  - File Manager → Folders

---

### ✅ 11. Create Template in Folder

**Test:** Create template inside a folder

```bash
mc_createTemplate({
  "name": "Organized Template",
  "html": "<div mc:edit=\"header\">Header</div>",
  "folder_id": "your-folder-id"
})
```

**Expected:**
- Template created in specified folder
- Appears under folder in Mailchimp dashboard

**Verify:**
- Check Mailchimp dashboard - template in correct folder

---

### ✅ 12. Upload File to Folder

**Test:** Upload file to a specific folder

```bash
mc_uploadFile({
  "name": "organized-asset.png",
  "file_data": "base64-data",
  "folder_id": "your-folder-id"
})
```

**Expected:**
- File uploaded to specified folder
- Appears under folder in File Manager

**Verify:**
- Check File Manager - file in correct folder

---

### ✅ 13. List Files

**Test:** List uploaded files

```bash
mc_listFiles({
  "type": "image",
  "count": 10
})
```

**Expected:**
- Returns list of files
- Can filter by type (image/file)
- Supports pagination

---

### ✅ 14. Get File Details

**Test:** Get specific file information

```bash
mc_getFile({
  "fileId": "your-file-id"
})
```

**Expected:**
- Returns file details:
  - URL
  - Size
  - Creation date
  - Name
  - Type

---

### ✅ 15. List File Folders

**Test:** List file folders

```bash
mc_listFileFolders({
  "count": 20
})
```

**Expected:**
- Returns list of folders
- Supports pagination

---

### ✅ 16. Get File Folder

**Test:** Get specific folder details

```bash
mc_getFileFolder({
  "folderId": "your-folder-id"
})
```

**Expected:**
- Returns folder details:
  - Name
  - File count
  - Creation date

---

### ✅ 17. Complete Workflow Test

**Test:** End-to-end screenshot-to-template workflow

1. **Upload image:**
   ```bash
   const image = await mc_uploadFile({
     "name": "hero-screenshot.png",
     "file_data": "base64-image-data"
   })
   ```

2. **Create folder:**
   ```bash
   const folder = await mc_createTemplateFolder({
     "name": "Screenshot Templates"
   })
   ```

3. **Create template with image:**
   ```bash
   const template = await mc_createTemplate({
     "name": "Screenshot-Based Template",
     "html": `
       <div mc:edit="header">
         <img src="${image.url}" alt="Hero" />
       </div>
       <div mc:edit="body">
         <h1>Hello, *|FNAME|*!</h1>
         <p>Welcome to our newsletter.</p>
       </div>
       <div mc:edit="footer">
         <p>© 2024 Company</p>
       </div>
     `,
     "folder_id": folder.id
   })
   ```

4. **Use template in campaign:**
   ```bash
   # Get template HTML
   const templateDetails = await mc_getTemplate({
     "templateId": template.id
   })
   
   # Create campaign
   const campaign = await mc_createCampaign({
     "type": "regular",
     "recipients": { "list_id": "your-audience-id" },
     "settings": {
       "subject_line": "Test Campaign",
       "from_name": "Test",
       "reply_to": "test@example.com"
     }
   })
   
   # Set content
   await mc_setCampaignContent({
     "campaignId": campaign.id,
     "html": templateDetails.html
   })
   ```

**Expected:**
- All steps complete successfully
- Template ready to use in campaigns
- Image displays correctly

---

## Testing with Claude Desktop

### Setup

1. Ensure MCP server is running:
   ```bash
   npm run dev
   # or
   npm start
   ```

2. In Claude Desktop, ask:
   - "Create a test template called 'My Test Template'"
   - "Upload an image file for me"
   - "List my templates"
   - "Show me my uploaded files"

### Example Queries

**Create Template:**
```
Create a newsletter template with:
- Header section (editable)
- Body section with merge tag for first name
- Footer section (editable)
Name it "Newsletter Template v1"
```

**Upload File:**
```
I have a base64 encoded image: [paste base64]
Upload it as "logo.png" to my File Manager
```

**List Templates:**
```
Show me all my custom templates
```

---

## Common Issues & Troubleshooting

### Issue: "MTL validation failed"

**Cause:** Template HTML exceeds size limit or has blocking errors

**Solution:**
- Check HTML size (must be < 1MB)
- Review validation errors in response
- Fix HTML structure issues

### Issue: "Invalid base64 file data format"

**Cause:** File data not properly base64 encoded

**Solution:**
- Ensure file is properly encoded
- Check for special characters
- Verify encoding method

### Issue: "File size exceeds 10MB limit"

**Cause:** File too large (after base64 decoding)

**Solution:**
- Compress image before encoding
- Use smaller file
- Note: Base64 is ~33% larger than original

### Issue: Template not editable in Mailchimp

**Cause:** Missing `mc:edit` attributes

**Solution:**
- Add `mc:edit="section-name"` to editable divs
- Use MTL validation warnings as guide
- See MTL documentation for best practices

### Issue: Image not displaying

**Cause:** Incorrect file URL or CORS issues

**Solution:**
- Verify file URL from `mc_getFile`
- Ensure URL is accessible
- Check Mailchimp File Manager for file status

---

## Validation Test Cases

### MTL Validation Tests

1. **Valid Template:**
   ```html
   <div mc:edit="header">Header</div>
   <div mc:edit="body">Body</div>
   ```
   ✅ Should pass with suggestions

2. **Template with Merge Tags:**
   ```html
   <div mc:edit="greeting">Hello, *|FNAME|*!</div>
   ```
   ✅ Should pass, detects merge tags

3. **Template with Editable CSS:**
   ```html
   <style>
     h1 { /*@editable*/ color: #000; }
   </style>
   ```
   ✅ Should pass, detects editable styles

4. **Template without MTL:**
   ```html
   <div>No editable sections</div>
   ```
   ⚠️ Should pass with warnings

5. **Oversized Template:**
   ```html
   <div>[1.1MB of content]</div>
   ```
   ❌ Should fail with size error

---

## Performance Testing

### Test Large File Uploads

1. Upload files of various sizes:
   - 100KB image
   - 1MB image
   - 5MB image
   - 9MB image (near limit)

**Expected:** All upload successfully (except >10MB)

### Test Template Creation Speed

1. Create multiple templates sequentially
2. Measure response times

**Expected:** Consistent performance, no timeouts

---

## Security Testing

### Test Input Validation

1. **XSS Attempt:**
   ```html
   <div mc:edit="test"><script>alert('xss')</script></div>
   ```
   ⚠️ Note: HTML is not sanitized - Mailchimp handles this

2. **Invalid IDs:**
   ```bash
   mc_deleteTemplate({ "templateId": "../../etc/passwd" })
   ```
   ❌ Should fail validation

3. **Oversized Inputs:**
   ```bash
   mc_createTemplate({ "name": "x".repeat(200), "html": "test" })
   ```
   ❌ Should fail (name > 100 chars)

---

## Next Steps After Testing

1. **Document Issues:** Note any bugs or unexpected behavior
2. **Performance Notes:** Record response times
3. **Feature Requests:** Note improvements needed
4. **Update Documentation:** Update docs based on findings

---

## Quick Test Script

Save this as `test-template-features.ts`:

```typescript
import { MailchimpClient } from './src/lib/mailchimp-client.js';
import { handleWriteTool } from './src/tools/write-tools.js';
import { handleReadTool } from './src/tools/read-tools.js';

const client = new MailchimpClient(
  process.env.MAILCHIMP_API_KEY!,
  process.env.MAILCHIMP_SERVER_PREFIX!
);

async function runTests() {
  console.log('🧪 Testing Template Features...\n');

  // Test 1: Create Template
  console.log('1. Creating template...');
  const template = await handleWriteTool(
    'mc_createTemplate',
    {
      name: 'Test Template',
      html: '<div mc:edit="header"><h1>Test</h1></div>'
    },
    client,
    ''
  );
  console.log('✅ Template created:', template);

  // Test 2: List Templates
  console.log('\n2. Listing templates...');
  const templates = await handleReadTool('mc_listTemplates', {}, client, false);
  console.log('✅ Templates listed:', templates);

  // Test 3: Get Template
  console.log('\n3. Getting template...');
  const templateDetails = await handleReadTool(
    'mc_getTemplate',
    { templateId: template.id },
    client,
    false
  );
  console.log('✅ Template retrieved:', templateDetails);

  console.log('\n✅ All tests passed!');
}

runTests().catch(console.error);
```

Run with:
```bash
tsx test-template-features.ts
```

---

## Success Criteria

✅ All tests pass  
✅ No errors in console  
✅ Templates appear in Mailchimp dashboard  
✅ Files upload successfully  
✅ MTL validation works correctly  
✅ Folders organize content properly  
✅ Integration with campaigns works  

If all criteria are met, the features are ready for production use!

