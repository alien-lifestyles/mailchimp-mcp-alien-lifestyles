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

