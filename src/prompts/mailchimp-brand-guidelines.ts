/**
 * Mailchimp Brand Guidelines
 * 
 * Colors, fonts, tone, and voice guidelines for maintaining
 * Mailchimp brand consistency in all generated content.
 * 
 * Based on Mailchimp's official brand identity.
 */

export const MAILCHIMP_BRAND = {
  // Primary Colors
  colors: {
    primary: '#FFE01B',      // Mailchimp Yellow (signature color)
    secondary: '#000000',     // Black
    accent: '#FFC72C',        // Bright Yellow (variation)
    text: '#231F20',          // Dark Gray/Black
    textLight: '#666666',     // Medium Gray
    background: '#FFFFFF',    // White
    backgroundLight: '#F7F7F7', // Light Gray
    success: '#00A86B',       // Green
    warning: '#FFB81C',       // Orange
    error: '#E85D75',         // Red/Pink
    info: '#0073E6',          // Blue
  },
  
  // Typography
  fonts: {
    primary: 'Cooper Light, Georgia, serif',  // Mailchimp's signature font
    secondary: 'Arial, Helvetica, sans-serif',
    body: 'Arial, Helvetica, sans-serif',
    heading: 'Cooper Light, Georgia, serif',
  },
  
  // Tone & Voice
  tone: {
    personality: [
      'Friendly and approachable',
      'Helpful without being condescending',
      'Professional but not corporate',
      'Clear and direct',
      'Empathetic to user needs',
      'Encouraging and supportive',
    ],
    writingStyle: [
      'Use "you" and "we" to create connection',
      'Avoid jargon - explain technical terms',
      'Be conversational but professional',
      'Use active voice',
      'Keep sentences clear and concise',
      'Show enthusiasm for user success',
    ],
    doNot: [
      'Use overly formal language',
      'Be condescending or patronizing',
      'Use excessive exclamation points',
      'Make assumptions about user knowledge',
      'Use corporate buzzwords',
    ],
  },
  
  // Visual Guidelines
  visual: {
    chartColors: [
      '#FFE01B',  // Primary yellow
      '#000000',  // Black
      '#FFC72C',  // Bright yellow
      '#00A86B',  // Green
      '#0073E6',  // Blue
      '#E85D75',  // Red/Pink
      '#666666',  // Gray
    ],
    chartStyle: [
      'Clean and modern',
      'Use Mailchimp yellow (#FFE01B) as primary color',
      'High contrast for accessibility',
      'Minimal, uncluttered design',
      'Friendly and approachable aesthetic',
    ],
  },
};

/**
 * Get Mailchimp brand instructions for prompts
 * 
 * These instructions are automatically included in all prompts to ensure
 * brand consistency in charts, visualizations, and written responses.
 */
export function getMailchimpBrandInstructions(): string {
  return `MAILCHIMP BRAND GUIDELINES - Apply to ALL responses automatically:

VISUAL DESIGN (Charts, Tables, Visualizations, Data Displays):
- PRIMARY COLOR: #FFE01B (Mailchimp Yellow) - ALWAYS use this as the primary/accent color for charts, key metrics, highlights, and data visualizations
- SECONDARY COLOR: #000000 (Black) - Use for text, borders, and strong contrasts
- CHART COLOR PALETTE (in order): #FFE01B (yellow), #000000 (black), #FFC72C (bright yellow), #00A86B (green), #0073E6 (blue), #E85D75 (red/pink), #666666 (gray)
- When creating ANY chart, graph, or visualization, ALWAYS use Mailchimp yellow (#FFE01B) as the primary color
- Style: Clean, modern, friendly, approachable - match the aesthetic of Mailchimp.com
- Typography: Use Arial/Helvetica for body text, Cooper Light/Georgia for headings when possible
- Background: White (#FFFFFF) or light gray (#F7F7F7) for readability
- Ensure high contrast for accessibility
- Keep designs minimal and uncluttered

TONE & VOICE (How to Write):
- Be friendly and approachable, like a helpful colleague who wants you to succeed
- Use "you" and "we" to create connection and partnership
- Be clear and direct - avoid jargon, explain technical terms in plain language
- Professional but not corporate - avoid buzzwords and corporate speak
- Encouraging and supportive - show enthusiasm for user success
- Use active voice ("We sent 10 campaigns" not "10 campaigns were sent")
- Keep sentences clear and concise
- Be empathetic to user needs and challenges

WRITING STYLE GUIDELINES:
- Explain technical terms in plain language when first introduced
- Show genuine enthusiasm for user success and achievements
- Be empathetic - acknowledge challenges and provide supportive solutions
- Avoid corporate buzzwords (synergy, leverage, utilize, etc.)
- Don't be condescending or patronizing
- Use examples and analogies to make complex concepts accessible

WHEN CREATING CHARTS, GRAPHS, OR VISUALIZATIONS:
1. ALWAYS use Mailchimp yellow (#FFE01B) as the primary/accent color
2. Use the Mailchimp color palette (#FFE01B, #000000, #FFC72C, #00A86B, #0073E6, #E85D75, #666666) for data series
3. Match the clean, friendly aesthetic of Mailchimp.com
4. Ensure high contrast for accessibility
5. Keep designs minimal and uncluttered
6. Use Mailchimp yellow for highlighting key metrics, trends, or important data points

Apply these guidelines to ALL responses, charts, tables, and visualizations automatically - even if not explicitly requested.`;
}

/**
 * Get condensed Mailchimp brand instructions for demo prompts
 * 
 * This is a shortened version optimized for demo prompts to reduce token usage
 * while maintaining essential brand consistency.
 */
export function getMailchimpBrandInstructionsDemo(): string {
  return `BRAND: Use #FFE01B (Mailchimp Yellow) as primary color in charts. Friendly, approachable tone. Clean, modern visuals matching Mailchimp.com aesthetic.`;
}

/**
 * Get standardized layout instructions for consistent report structure
 * 
 * Ensures all reports, dashboards, and visualizations follow the same
 * consistent structure and layout patterns.
 */
export function getLayoutInstructions(): string {
  return `STANDARDIZED LAYOUT & STRUCTURE - Apply to ALL responses:

REPORT STRUCTURE (Follow this order consistently):
1. EXECUTIVE SUMMARY (2-3 sentences at top)
   - Key takeaway or main insight
   - Overall performance assessment
   - One critical finding or recommendation

2. KEY METRICS DASHBOARD (Visual cards/charts section)
   - Display primary metrics in visual format (cards, charts, or highlighted numbers)
   - Use Mailchimp yellow (#FFE01B) for primary metrics
   - Include: Total campaigns, subscribers, open rate, click rate (or relevant metrics)
   - Make metrics scannable and visually prominent

3. DETAILED ANALYSIS (Organized sections with clear headings)
   - Use H2 headings for main sections (## Section Name)
   - Use H3 headings for subsections (### Subsection Name)
   - Each section should have a clear purpose
   - Include data visualizations (charts/tables) within relevant sections
   - Maintain consistent section ordering across similar report types

4. QUARTERLY BREAKDOWN (Standardized table/chart)
   - Always include quarterly comparison when time-based data is available
   - Use consistent table format: Quarter | Metric 1 | Metric 2 | Metric 3
   - Or use bar/line chart with quarters on X-axis
   - Highlight current/last quarter with Mailchimp yellow

5. RECOMMENDATIONS (Numbered list at end)
   - 3-5 specific, actionable recommendations
   - Prioritized by impact
   - Include brief rationale for each

VISUAL HIERARCHY:
- H1: Report title (only one per report)
- H2: Main sections (Executive Summary, Key Metrics, Detailed Analysis, etc.)
- H3: Subsections within main sections
- Use bold for key metrics and important numbers
- Use bullet points for lists
- Use numbered lists for recommendations or sequential items

DASHBOARD LAYOUT:
- Metrics at top (visual cards or highlighted numbers)
- Charts in middle sections (bar charts, line charts, pie charts as appropriate)
- Tables below charts for detailed data
- Quarterly breakdown always in consistent location (before recommendations)
- Recommendations always at bottom

CHART & TABLE STANDARDS:
- Charts: Always use Mailchimp yellow (#FFE01B) for primary data series
- Tables: Consistent column headers, left-align text, right-align numbers
- Table headers: Bold, use Mailchimp yellow background or text color
- Data alignment: Numbers right-aligned, text left-aligned
- Include units in headers (e.g., "Open Rate (%)", "Subscribers (Count)")
- Use consistent date formats (e.g., "Q1 2024", "Jan-Mar 2024")

PAGE STRUCTURE:
- Start with Executive Summary (brief overview)
- Follow with visual dashboard (key metrics)
- Then detailed analysis (organized sections)
- Include quarterly breakdown (standardized format)
- End with recommendations (actionable items)

CONSISTENCY REQUIREMENTS:
- Same section order every time for similar report types
- Same visual hierarchy (H1 → H2 → H3)
- Same metric presentation style (cards, charts, or tables)
- Same quarterly breakdown format
- Same recommendation structure

Apply these layout standards to ensure every report looks professional, consistent, and easy to scan.`;
}

/**
 * Get condensed layout instructions for demo prompts
 * 
 * Shortened version optimized for token usage while maintaining structure consistency.
 */
export function getLayoutInstructionsDemo(): string {
  return `LAYOUT: 1) Executive Summary (2-3 sentences), 2) Key Metrics Dashboard (visual cards), 3) Detailed Analysis (H2 sections), 4) Quarterly Breakdown (table/chart), 5) Recommendations (numbered). Use H2 for sections, H3 for subsections. Charts use #FFE01B. Tables: bold headers, right-align numbers.`;
}

