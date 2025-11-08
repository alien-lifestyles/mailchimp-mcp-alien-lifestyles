/**
 * Mailchimp Template Language (MTL) Validation and Utilities
 * 
 * This module provides validation and helper functions for creating
 * Mailchimp Template Language (MTL) compliant templates.
 * 
 * References:
 * - Getting Started: https://mailchimp.com/help/getting-started-with-mailchimps-template-language/
 * - Editable Content Areas: https://mailchimp.com/help/create-editable-content-areas-with-mailchimps-template-language/
 * - Editable Styles: https://mailchimp.com/help/create-editable-styles-with-mailchimps-template-language/
 * - Import Custom HTML: https://mailchimp.com/help/import-a-custom-html-template/
 */

export interface MTLValidationResult {
  isValid: boolean;
  warnings: string[];
  errors: string[];
  suggestions: string[];
}

/**
 * Validate HTML template for Mailchimp Template Language compliance
 * 
 * Checks for:
 * - mc:edit attributes (recommended for editable content)
 * - mc:repeatable attributes (if repeatable sections are used)
 * - Proper HTML structure
 * - Merge tag syntax (*|TAG|*)
 * - CSS editable comments (at-editable style)
 */
export function validateMTLTemplate(html: string): MTLValidationResult {
  const result: MTLValidationResult = {
    isValid: true,
    warnings: [],
    errors: [],
    suggestions: [],
  };

  // Check for mc:edit attributes (recommended but not required)
  const mcEditMatches = html.match(/mc:edit=["']([^"']+)["']/g);
  if (!mcEditMatches || mcEditMatches.length === 0) {
    result.warnings.push(
      'No mc:edit attributes found. Consider adding editable content areas using mc:edit="section_name"'
    );
    result.suggestions.push(
      'Add editable sections: <div mc:edit="header">...</div>'
    );
  } else {
    result.suggestions.push(
      `Found ${mcEditMatches.length} editable content area(s). Good!`
    );
  }

  // Check for mc:repeatable (optional but useful)
  const mcRepeatableMatches = html.match(/mc:repeatable=["']([^"']+)["']/g);
  if (mcRepeatableMatches && mcRepeatableMatches.length > 0) {
    result.suggestions.push(
      `Found ${mcRepeatableMatches.length} repeatable section(s).`
    );
  }

  // Check for merge tags (common pattern)
  const mergeTagMatches = html.match(/\*\|[A-Z_]+\|\*/g);
  if (mergeTagMatches && mergeTagMatches.length > 0) {
    result.suggestions.push(
      `Found ${mergeTagMatches.length} merge tag(s) for dynamic content.`
    );
  }

  // Check for editable CSS comments
  const editableCssMatches = html.match(/\/\*@editable\*\//g);
  if (editableCssMatches && editableCssMatches.length > 0) {
    result.suggestions.push(
      `Found ${editableCssMatches.length} editable style(s) in CSS.`
    );
  }

  // Basic HTML structure validation
  if (!html.includes('<html') && !html.includes('<!DOCTYPE')) {
    result.warnings.push(
      'HTML structure may be incomplete. Ensure proper DOCTYPE and html tags.'
    );
  }

  // Check for inline styles (recommended for email compatibility)
  const styleTagMatches = html.match(/<style[^>]*>/g);
  const inlineStyleMatches = html.match(/style=["'][^"']+["']/g);
  if (styleTagMatches && styleTagMatches.length > 0 && !inlineStyleMatches) {
    result.warnings.push(
      'External <style> tags found. Consider inline styles for better email client compatibility.'
    );
  }

  // Check HTML size (Mailchimp has limits)
  if (html.length > 1000000) {
    result.errors.push('HTML template exceeds 1MB size limit.');
    result.isValid = false;
  }

  // Check for potentially problematic content
  if (html.includes('<script')) {
    result.warnings.push(
      'Script tags found. Email clients typically strip JavaScript for security.'
    );
  }

  return result;
}

/**
 * Generate MTL-compliant HTML template structure
 * 
 * Returns a basic template structure with editable content areas
 */
export function generateMTLTemplateStructure(options: {
  header?: string;
  body?: string;
  footer?: string;
  includeStyles?: boolean;
}): string {
  const { header = 'Header Content', body = 'Body Content', footer = 'Footer Content', includeStyles = true } = options;

  const styles = includeStyles ? `
  <style type="text/css">
    /**
     * @tab Page
     * @section heading 1
     * @style heading 1
     */
    h1 {
      /*@editable*/ color: #202020 !important;
      /*@editable*/ font-family: Arial, sans-serif;
      /*@editable*/ font-size: 34px;
      /*@editable*/ font-weight: bold;
      /*@editable*/ line-height: 100%;
      /*@editable*/ text-align: left;
    }
    
    /**
     * @tab Page
     * @section body
     * @style body
     */
    body {
      /*@editable*/ color: #555555 !important;
      /*@editable*/ font-family: Arial, sans-serif;
      /*@editable*/ font-size: 14px;
      /*@editable*/ line-height: 150%;
    }
  </style>
  ` : '';

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Template</title>
  ${styles}
</head>
<body>
  <!-- Header Section - Editable -->
  <div mc:edit="header">
    ${header}
  </div>
  
  <!-- Body Section - Editable -->
  <div mc:edit="body">
    ${body}
    <p>Hello, *|FNAME|*!</p>
  </div>
  
  <!-- Footer Section - Editable -->
  <div mc:edit="footer">
    ${footer}
  </div>
</body>
</html>`;
}

/**
 * Extract editable content areas from HTML
 */
export function extractEditableAreas(html: string): string[] {
  const matches = html.match(/mc:edit=["']([^"']+)["']/g);
  if (!matches) return [];
  
  return matches.map(match => {
    const nameMatch = match.match(/mc:edit=["']([^"']+)["']/);
    return nameMatch ? nameMatch[1] : '';
  }).filter(Boolean);
}

