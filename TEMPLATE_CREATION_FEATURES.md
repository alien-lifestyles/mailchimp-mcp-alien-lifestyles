# Template Creation Features

**Date:** November 2024  
**Status:** ✅ Implemented

## Overview

This document describes the new template creation and file management features added to the Mailchimp MCP server. These features enable creating custom-coded templates based on screenshots, Claude recommendations, or any HTML source, with automatic Mailchimp Template Language (MTL) compliance validation.

## New Write Tools

### Template Management

#### `mc_createTemplate`
Create a new custom-coded template in Mailchimp with automatic MTL validation.

**Parameters:**
- `name` (required): The name of the template
- `html` (required): The HTML content of the template (should include MTL attributes like `mc:edit`)
- `folder_id` (optional): The folder ID to place the template in

**Features:**
- Automatic MTL compliance validation
- Warnings for missing `mc:edit` attributes (recommended)
- Size limit: 1MB
- Returns template ID and details

**Example:**
```json
{
  "name": "My Custom Template",
  "html": "<div mc:edit=\"header\">Header Content</div>",
  "folder_id": "optional-folder-id"
}
```

#### `mc_updateTemplate`
Update an existing template with new HTML or name.

**Parameters:**
- `templateId` (required): The unique ID for the template
- `name` (optional): The new name for the template
- `html` (optional): The updated HTML content

**Features:**
- MTL validation when HTML is updated
- Partial updates supported (name or HTML or both)

#### `mc_deleteTemplate`
Delete a template from Mailchimp.

**Parameters:**
- `templateId` (required): The unique ID for the template to delete

### File Management

#### `mc_uploadFile`
Upload a file (image, PDF, etc.) to Mailchimp's File Manager.

**Parameters:**
- `name` (required): The name of the file
- `file_data` (required): Base64-encoded file data
- `folder_id` (optional): The folder ID to place the file in

**Features:**
- Base64 format validation
- File size limit: 10MB
- Returns file URL for use in templates

**Example:**
```json
{
  "name": "logo.png",
  "file_data": "iVBORw0KGgoAAAANSUhEUgAA...",
  "folder_id": "optional-folder-id"
}
```

### Folder Management

#### `mc_createTemplateFolder`
Create a folder for organizing templates.

**Parameters:**
- `name` (required): The name of the folder

#### `mc_createFileFolder`
Create a folder in Mailchimp's File Manager for organizing files.

**Parameters:**
- `name` (required): The name of the folder

## New Read Tools

### File Manager

#### `mc_listFiles`
List files in Mailchimp's File Manager.

**Parameters:**
- `type` (optional): Filter by file type (`image` or `file`)
- `count` (optional): Number of records to return (default: 50, max: 1000)
- `offset` (optional): Number of records to skip

#### `mc_getFile`
Get detailed information about a specific file including URL, size, and creation date.

**Parameters:**
- `fileId` (required): The unique ID for the file

#### `mc_listFileFolders`
List folders in Mailchimp's File Manager.

**Parameters:**
- `count` (optional): Number of records to return
- `offset` (optional): Number of records to skip

#### `mc_getFileFolder`
Get detailed information about a specific file folder.

**Parameters:**
- `folderId` (required): The unique ID for the file folder

## MTL Validation

### What is MTL?

Mailchimp Template Language (MTL) is a set of HTML attributes and CSS comments that make templates editable in Mailchimp's visual editor.

### Validation Features

The `validateMTLTemplate` function checks for:

1. **mc:edit attributes** - Recommended for editable content areas
   - Example: `<div mc:edit="header">...</div>`
   - Warning if missing (not required, but recommended)

2. **mc:repeatable attributes** - For repeatable sections
   - Example: `<div mc:repeatable="product">...</div>`

3. **Merge tags** - For dynamic content
   - Example: `*|FNAME|*`, `*|LNAME|*`

4. **Editable CSS comments** - For style customization
   - Example: `/*@editable*/ color: #202020;`

5. **HTML structure** - Basic validation
   - Checks for DOCTYPE and html tags

6. **Size limits** - Prevents oversized templates
   - Maximum: 1MB

### Validation Result

The validation returns:
- `isValid`: Boolean indicating if template passes validation
- `warnings`: Array of warnings (non-blocking)
- `errors`: Array of errors (blocking)
- `suggestions`: Array of helpful suggestions

### Helper Functions

#### `generateMTLTemplateStructure(options)`
Generates a basic MTL-compliant template structure with editable content areas.

**Options:**
- `header`: Header content (default: "Header Content")
- `body`: Body content (default: "Body Content")
- `footer`: Footer content (default: "Footer Content")
- `includeStyles`: Include editable CSS styles (default: true)

#### `extractEditableAreas(html)`
Extracts all `mc:edit` attribute values from HTML.

## Use Cases

### Screenshot-to-Template Workflow

1. **Upload Image**: Use `mc_uploadFile` to upload screenshot/image
2. **Generate HTML**: Use Claude to analyze screenshot and generate HTML
3. **Add MTL Attributes**: Add `mc:edit` attributes to make sections editable
4. **Validate**: Template is automatically validated for MTL compliance
5. **Create Template**: Use `mc_createTemplate` to create the template
6. **Use in Campaign**: Template is now available in Mailchimp

### Claude-Generated Templates

1. **Request HTML**: Ask Claude to generate email HTML based on requirements
2. **Enhance with MTL**: Add MTL attributes for editable sections
3. **Validate**: Automatic validation ensures compliance
4. **Create**: Use `mc_createTemplate` to save the template

### File Organization

1. **Create Folders**: Use `mc_createFileFolder` or `mc_createTemplateFolder`
2. **Organize Assets**: Upload files to specific folders
3. **List Files**: Use `mc_listFiles` to browse uploaded assets
4. **Reference in Templates**: Use file URLs in template HTML

## MTL Documentation References

All template tools include references to Mailchimp's official documentation:

- [Getting Started with MTL](https://mailchimp.com/help/getting-started-with-mailchimps-template-language/)
- [Editable Content Areas](https://mailchimp.com/help/create-editable-content-areas-with-mailchimps-template-language/)
- [Editable Styles](https://mailchimp.com/help/create-editable-styles-with-mailchimps-template-language/)
- [Import Custom HTML](https://mailchimp.com/help/import-a-custom-html-template/)

## Technical Details

### File Size Limits
- Template HTML: 1MB maximum
- File uploads: 10MB maximum (base64 encoded)

### Validation Behavior
- **Errors**: Block template creation/update
- **Warnings**: Logged but don't block operations
- **Suggestions**: Provided for improvement

### API Endpoints Used
- `POST /templates` - Create template
- `PATCH /templates/{id}` - Update template
- `DELETE /templates/{id}` - Delete template
- `POST /file-manager/files` - Upload file
- `GET /file-manager/files` - List files
- `GET /file-manager/files/{id}` - Get file
- `GET /file-manager/folders` - List file folders
- `GET /file-manager/folders/{id}` - Get file folder
- `POST /file-manager/folders` - Create file folder
- `POST /template-folders` - Create template folder

## Example Workflow

```typescript
// 1. Create a folder for templates
const folder = await mc_createTemplateFolder({ name: "Custom Templates" });

// 2. Upload an image asset
const image = await mc_uploadFile({
  name: "hero-image.jpg",
  file_data: base64ImageData,
  folder_id: imageFolderId
});

// 3. Create template with MTL attributes
const template = await mc_createTemplate({
  name: "Newsletter Template",
  html: `
    <div mc:edit="header">
      <img src="${image.url}" alt="Hero" />
    </div>
    <div mc:edit="body">
      <h1>Hello, *|FNAME|*!</h1>
      <p>Welcome to our newsletter.</p>
    </div>
    <div mc:edit="footer">
      <p>© 2024 Company Name</p>
    </div>
  `,
  folder_id: folder.id
});

// 4. Use template in campaign
const campaign = await mc_createCampaign({
  type: "regular",
  recipients: { list_id: audienceId },
  settings: {
    subject_line: "Welcome!",
    from_name: "Company",
    reply_to: "noreply@company.com"
  }
});

await mc_setCampaignContent({
  campaignId: campaign.id,
  html: template.html
});
```

## Security Considerations

- All HTML content is validated for size limits
- Base64 file data is validated before upload
- File size limits prevent abuse
- MTL validation helps prevent malformed templates

## Future Enhancements

Potential future additions:
- Template preview generation
- Batch template operations
- Template versioning
- Template import/export
- Advanced MTL validation rules
- Template marketplace integration

