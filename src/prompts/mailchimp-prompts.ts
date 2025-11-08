import type { Prompt } from '@modelcontextprotocol/sdk/types.js';
import { getMailchimpBrandInstructions, getMailchimpBrandInstructionsDemo, getLayoutInstructions, getLayoutInstructionsDemo } from './mailchimp-brand-guidelines.js';
import { LicenseType } from '../lib/license.js';

/**
 * Mailchimp MCP Prompts
 * 
 * Pre-populated prompts organized by persona and use case.
 * These appear as clickable options in Claude Desktop.
 * 
 * All prompts automatically include Mailchimp brand guidelines
 * for consistent tone, voice, colors, and visual design.
 * 
 * Free users get 5 Marketer prompts only.
 * Paid users get all 30+ prompts.
 */

// Free users get these 5 Marketer prompts only
const FREE_USER_PROMPTS = [
  'marketer-quarterly-report-demo',
  'marketer-performance-benchmarking',
  'marketer-roi-analysis',
  'marketer-optimization-opportunities',
  'marketer-executive-summary',
];

export function createMailchimpPrompts(licenseType: LicenseType = LicenseType.FREE): Prompt[] {
  const allPrompts: Prompt[] = [
    // ============================================
    // MAILCHIMP CSM (Customer Success Manager)
    // ============================================
    
    {
      name: 'csm-account-health-check-demo',
      description: 'DEMO: Comprehensive account health check - shows audiences, campaigns, automations, and engagement trends',
      arguments: [],
    },
    {
      name: 'csm-engagement-risk-analysis',
      description: 'Analyze account for churn risk signals - declining engagement, paused automations, subscriber loss',
      arguments: [],
    },
    {
      name: 'csm-feature-adoption',
      description: 'Check which Mailchimp features the customer is using vs. not using (segments, tags, templates, automations)',
      arguments: [],
    },
    {
      name: 'csm-automation-opportunities',
      description: 'Identify automation opportunities by analyzing regular campaign sending patterns',
      arguments: [],
    },
    {
      name: 'csm-segmentation-opportunities',
      description: 'Review segmentation strategy and suggest advanced personalization opportunities',
      arguments: [],
    },
    {
      name: 'csm-template-optimization',
      description: 'Analyze template usage and suggest improvements or custom template opportunities',
      arguments: [],
    },
    {
      name: 'csm-campaign-investigation',
      description: 'Investigate low-performing campaign - analyze metrics, send time, content, and compare to averages',
      arguments: [],
    },
    {
      name: 'csm-automation-troubleshooting',
      description: 'Troubleshoot automation issues - check status, identify problems, review automation details',
      arguments: [],
    },
    {
      name: 'csm-data-validation',
      description: 'Validate subscriber counts and explain any discrepancies in audience data',
      arguments: [],
    },

    // ============================================
    // MARKETERS REPORTING TO EXECUTIVES
    // ============================================
    
    {
      name: 'marketer-quarterly-report-demo',
      description: 'DEMO: Create comprehensive quarterly performance report with metrics, top/bottom campaigns, and trends',
      arguments: [],
    },
    {
      name: 'marketer-performance-benchmarking',
      description: 'Analyze campaign performance, identify benchmarks, and find common patterns in top performers',
      arguments: [],
    },
    {
      name: 'marketer-roi-analysis',
      description: 'Show business impact of email marketing - campaigns, subscribers, engagement, and revenue if available',
      arguments: [],
    },
    {
      name: 'marketer-optimization-opportunities',
      description: 'Identify optimization opportunities - underperforming campaigns, send time patterns, subject line analysis',
      arguments: [],
    },
    {
      name: 'marketer-audience-growth-strategy',
      description: 'Analyze audience growth trends, segment engagement, retention rates, and growth recommendations',
      arguments: [],
    },
    {
      name: 'marketer-content-performance',
      description: 'Analyze what content resonates - click rates, themes, personalization usage, template performance',
      arguments: [],
    },
    {
      name: 'marketer-executive-summary',
      description: 'Create monthly executive summary - key metrics, top campaign, opportunities, and recommendations',
      arguments: [],
    },
    {
      name: 'marketer-campaign-snapshot',
      description: 'Quick snapshot of last 10 campaigns with performance vs. average and insights',
      arguments: [],
    },
    {
      name: 'marketer-strategic-health-check-demo',
      description: 'DEMO: Quick strategic health check - growth trends, risks, opportunities, and one recommendation',
      arguments: [],
    },

    // ============================================
    // BUSINESS OWNERS
    // ============================================
    
    {
      name: 'owner-monthly-summary',
      description: 'Simple monthly summary - campaigns sent, performance, what\'s working, what needs improvement',
      arguments: [],
    },
    {
      name: 'owner-recent-campaigns',
      description: 'Show recent campaign activity from last 2 weeks with performance assessment',
      arguments: [],
    },
    {
      name: 'owner-list-health',
      description: 'Quick email list health check - subscriber count, growth trends, engagement rate',
      arguments: [],
    },
    {
      name: 'owner-roi-assessment-demo',
      description: 'DEMO: Assess marketing ROI - reach, engagement, sales impact, cost per engaged subscriber',
      arguments: [],
    },
    {
      name: 'owner-customer-engagement',
      description: 'Analyze most engaged subscribers and their relationship to customer value',
      arguments: [],
    },
    {
      name: 'owner-growth-scale',
      description: 'Assess scalability - current capacity, growth potential, what it takes to double impact',
      arguments: [],
    },
    {
      name: 'owner-strategic-focus',
      description: 'Get recommendations for next month - opportunities, risks, start/stop actions, 3 specific recommendations',
      arguments: [],
    },
    {
      name: 'owner-investment-justification',
      description: 'Evaluate Mailchimp investment value - key metrics, feature usage, what would be missed',
      arguments: [],
    },
    {
      name: 'owner-growth-planning',
      description: 'Strategic growth planning - current capacity, engagement potential, scaling requirements, risks',
      arguments: [],
    },

    // ============================================
    // CROSS-FUNCTIONAL
    // ============================================
    
    {
      name: 'account-audit-demo',
      description: 'DEMO: Comprehensive Mailchimp account audit - what\'s set up well, needs improvement, unused features, opportunities',
      arguments: [],
    },
    {
      name: 'onboard-team-member',
      description: 'Overview for new team members - audiences, campaigns, automations, benchmarks, getting started',
      arguments: [],
    },
    {
      name: 'industry-benchmarking',
      description: 'Compare performance to industry benchmarks - open rates, click rates, strengths, weaknesses',
      arguments: [],
    },
  ];

  // Filter prompts based on license type
  if (licenseType === LicenseType.FREE) {
    return allPrompts.filter(prompt => FREE_USER_PROMPTS.includes(prompt.name));
  }

  // Paid users get all prompts
  return allPrompts;
}

/**
 * Get current quarter and last quarter dates
 */
function getQuarterDates(): { 
  currentQuarter: string; 
  lastQuarter: string; 
  lastQuarterStart: string; 
  lastQuarterEnd: string;
  lastQuarterISOStart: string;
  lastQuarterISOEnd: string;
} {
  const now = new Date();
  const currentMonth = now.getMonth(); // 0-11
  const currentYear = now.getFullYear();
  
  // Determine current quarter
  const currentQuarter = Math.floor(currentMonth / 3) + 1;
  
  // Calculate last quarter
  let lastQuarter = currentQuarter - 1;
  let lastQuarterYear = currentYear;
  if (lastQuarter === 0) {
    lastQuarter = 4;
    lastQuarterYear = currentYear - 1;
  }
  
  const lastQuarterStartMonth = (lastQuarter - 1) * 3;
  const lastQuarterEndMonth = lastQuarterStartMonth + 2;
  
  // Start of last quarter (first day of first month)
  const lastQuarterStartDate = new Date(lastQuarterYear, lastQuarterStartMonth, 1);
  // End of last quarter (last day of last month)
  const lastQuarterEndDate = new Date(lastQuarterYear, lastQuarterEndMonth + 1, 0);
  
  const lastQuarterStart = lastQuarterStartDate.toISOString().split('T')[0];
  const lastQuarterEnd = lastQuarterEndDate.toISOString().split('T')[0];
  // ISO format for Mailchimp API (includes time)
  const lastQuarterISOStart = lastQuarterStartDate.toISOString();
  const lastQuarterISOEnd = new Date(lastQuarterEndDate.getTime() + 24 * 60 * 60 * 1000 - 1).toISOString(); // End of day
  
  return {
    currentQuarter: `Q${currentQuarter} ${currentYear}`,
    lastQuarter: `Q${lastQuarter} ${lastQuarterYear}`,
    lastQuarterStart,
    lastQuarterEnd,
    lastQuarterISOStart,
    lastQuarterISOEnd,
  };
}

/**
 * Get prompt template text by name
 */
export function getPromptTemplate(name: string): string {
  const { lastQuarter, lastQuarterStart, lastQuarterEnd, lastQuarterISOStart, lastQuarterISOEnd } = getQuarterDates();
  
  // Get Mailchimp brand guidelines (applied to all prompts)
  const brandInstructions = getMailchimpBrandInstructions();
  
  // Get standardized layout instructions (applied to all prompts)
  const layoutInstructions = getLayoutInstructions();
  
  const quarterlyInstruction = `IMPORTANT TIME-BASED REPORTING INSTRUCTIONS:
1. FIRST: Check for activity in ${lastQuarter} (${lastQuarterStart} to ${lastQuarterEnd}) using since_send_time filter where applicable
2. IF NO ACTIVITY in last quarter: Fall back to all-time data
3. ALWAYS: Clearly indicate which time period you're reporting on in your response
4. ALWAYS: Provide a quarterly breakdown/selector showing data by quarter (Q1, Q2, Q3, Q4) where applicable
5. Use ISO 8601 format (${lastQuarterISOStart}) for date filters when querying campaigns
6. Include a quarterly comparison table or breakdown in your response showing metrics by quarter`;

  // Condensed quarterly instruction for demos (reduces token usage)
  const quarterlyInstructionDemo = `TIME: Check ${lastQuarter} first, fallback to all-time. Include quarterly breakdown (Q1-Q4).`;

  const accountHealthInstruction = `ACCOUNT HEALTH CHECK REQUIREMENTS (for account health, audit, and strategic prompts):
- ALWAYS check domain authentication status using mc_listVerifiedDomains or mc_getVerifiedDomain
- Report on verification status, DKIM, SPF, and DMARC authentication for all domains
- Flag any domains that are not verified or authenticated (this impacts email deliverability)
- Include domain authentication status in any account health summary`;

  // Condensed account health instruction for demos
  const accountHealthInstructionDemo = `HEALTH: Check domain auth status. Report DKIM/SPF/DMARC. Flag unverified domains.`;

  // Condensed demo-specific masking instructions (CRITICAL for demo safety, optimized for token usage)
  const demoMaskingInstruction = `DEMO SAFETY: Replace domains/campaigns/subjects with generic placeholders (e.g., "example.com", "Q4 Newsletter", "Monthly Update"). Never show first+last names together. Use generic labels in all visuals. Anonymize all identifying data.`;

  // Combine brand, layout, quarterly, and account health instructions
  const baseInstructions = `${brandInstructions}\n\n${layoutInstructions}\n\n${quarterlyInstruction}\n\n${accountHealthInstruction}`;
  
  // Demo instructions use condensed versions to reduce token usage
  const brandInstructionsDemo = getMailchimpBrandInstructionsDemo();
  const layoutInstructionsDemo = getLayoutInstructionsDemo();
  const demoBaseInstructions = `${brandInstructionsDemo}\n\n${layoutInstructionsDemo}\n\n${quarterlyInstructionDemo}\n\n${accountHealthInstructionDemo}\n\n${demoMaskingInstruction}`;
  
  const prompts: Record<string, string> = {
    'csm-account-health-check-demo': `${demoBaseInstructions}

Give me a complete account health check. Show me:
- Total audiences and member counts
- Domain authentication status (check all verified domains and their DKIM/SPF/DMARC status)
- Campaign activity: First check ${lastQuarter} (${lastQuarterStart} to ${lastQuarterEnd}), if no activity then show all-time with quarterly breakdown
- Automation usage and performance
- Any segments or tags being used
- Overall engagement trends with quarterly comparison
- Include a quarterly breakdown table showing activity by quarter (Q1, Q2, Q3, Q4)`,

    'csm-engagement-risk-analysis': `${baseInstructions}

Analyze this account for churn risk signals:
- Show me campaigns with declining open rates (prioritize ${lastQuarter}, fall back to all-time)
- Check if they have any paused automations
- Review audience growth trends by quarter (are they losing subscribers?)
- Identify any unused features (segments, tags, templates)
- Include quarterly engagement trends showing changes over time`,

    'csm-feature-adoption': `${baseInstructions}

What Mailchimp features is this customer using vs. not using?
- Do they have segments set up? Show me what segments exist
- Are they using tags? List all tags and member counts
- Check their template usage - do they have custom templates?
- What automations are running vs. what could be automated?
- Show feature usage trends by quarter if applicable`,

    'csm-automation-opportunities': `${baseInstructions}

This customer only sends regular campaigns. Analyze their sending patterns:
- What types of emails do they send regularly? (check ${lastQuarter} first, then all-time)
- Which campaigns could be converted to automations?
- Show me their campaign frequency by quarter - are they sending welcome emails manually?
- Recommend 3 automation opportunities with business impact
- Include quarterly sending frequency breakdown`,

    'csm-segmentation-opportunities': `${baseInstructions}

Review their segmentation strategy:
- How many segments do they have? Show me all segments
- What merge fields are they using? List all merge fields
- Do they have interest categories set up?
- Suggest advanced segmentation opportunities based on their member data
- If segment usage has changed over time, show quarterly trends`,

    'csm-template-optimization': `${baseInstructions}

Analyze their template usage:
- List all templates they're using
- Do they have custom-coded templates?
- Check their campaign content - are they using responsive designs?
- Suggest template improvements or custom template opportunities
- Show template usage trends by quarter if templates were created/used over time`,

    'csm-campaign-investigation': `${baseInstructions}

The customer says their last campaign had low opens. Investigate:
- Show me the campaign report with all metrics
- Check the send time and day of week
- Compare to their average campaign performance (from ${lastQuarter} or all-time)
- Review the subject line and content
- What might explain the low performance?
- Include quarterly performance context showing how this compares to other quarters`,

    'csm-automation-troubleshooting': `${baseInstructions}

Customer reports their welcome automation isn't working:
- List all automations and their status
- Check if any automations are paused
- Show me automation email details
- Identify what might be wrong`,

    'csm-data-validation': `${baseInstructions}

Customer questions their subscriber count. Verify:
- Show me total audience size
- Break down by member status (subscribed, unsubscribed, cleaned, pending)
- Show recent activity (new subscribers, unsubscribes) - prioritize ${lastQuarter}, include quarterly breakdown
- Explain any discrepancies
- Include quarterly growth trends showing subscriber changes by quarter`,

    'marketer-quarterly-report-demo': `${demoBaseInstructions}

Create a comprehensive ${lastQuarter} performance report:
- List all campaigns sent in ${lastQuarter} (if no activity, show all-time with quarterly breakdown)
- Calculate average open rate, click rate, and unsubscribe rate
- Identify top 5 and bottom 5 performing campaigns
- Compare ${lastQuarter} performance to previous quarters (if available)
- Highlight key insights and trends
- Provide a quarterly comparison table showing metrics by quarter`,

    'marketer-performance-benchmarking': `${baseInstructions}

Analyze our campaign performance:
- What's our average open rate? (prioritize ${lastQuarter}, include all-time for comparison)
- Which campaign types perform best (regular, automation, etc.)?
- Show me campaigns that exceeded our average by 20%+ (from ${lastQuarter} or all-time)
- What do our top performers have in common?
- Create a performance benchmark report with quarterly breakdown
- Include a quarterly performance comparison table`,

    'marketer-roi-analysis': `${baseInstructions}

Show me the business impact of our email marketing:
- Total campaigns sent (${lastQuarter} first, then all-time with quarterly breakdown)
- Total subscribers reached
- Overall engagement rates (opens, clicks) by quarter
- If we have e-commerce data, show revenue impact by quarter
- Calculate engagement trends over time with quarterly comparison
- Include a quarterly ROI summary table`,

    'marketer-optimization-opportunities': `${baseInstructions}

Identify optimization opportunities:
- Show me campaigns with below-average performance (from ${lastQuarter} or all-time)
- What patterns do underperforming campaigns share?
- Analyze send times by quarter - when do we get best engagement?
- Review subject line patterns in top vs. bottom performers
- Recommend 5 specific improvements
- Include quarterly performance trends to identify patterns`,

    'marketer-audience-growth-strategy': `${baseInstructions}

Analyze our audience growth and engagement:
- Show audience growth trends (prioritize ${lastQuarter}, include quarterly breakdown)
- Break down by member status (new, unsubscribed, cleaned) by quarter
- Which segments have highest engagement? (from ${lastQuarter} or all-time)
- What's our subscriber retention rate by quarter?
- Recommend audience growth strategies
- Include quarterly growth comparison table`,

    'marketer-content-performance': `${baseInstructions}

What content resonates with our audience?
- Show me campaigns sorted by click rate (from ${lastQuarter} or all-time)
- Analyze campaign content themes by quarter
- Which merge fields or personalization elements are we using?
- Review template usage - which templates perform best? (include quarterly breakdown)
- Recommend content strategy improvements
- Include quarterly content performance comparison`,

    'marketer-executive-summary': `${baseInstructions}

Create an executive summary for ${lastQuarter}:
- Total campaigns sent (${lastQuarter} first, with quarterly comparison)
- Total subscribers
- Key performance metrics (open rate, click rate) by quarter
- Top performing campaign (from ${lastQuarter} or all-time)
- Biggest opportunity for improvement
- One-sentence recommendation
- Include quarterly metrics summary table`,

    'marketer-campaign-snapshot': `${baseInstructions}

Give me a quick snapshot of campaigns:
- Show campaigns from ${lastQuarter} first (if available), otherwise show all-time
- Campaign name and send date
- Open rate and click rate
- Performance vs. average (above/below)
- One insight per campaign
- Include quarterly breakdown showing which quarter each campaign belongs to`,

    'marketer-strategic-health-check-demo': `${demoBaseInstructions}

Quick health check for executive review:
- Are we growing or shrinking our list? (compare ${lastQuarter} to previous quarters)
- Is engagement improving or declining? (quarterly trend analysis)
- What's our biggest risk right now?
- What's our biggest opportunity?
- One strategic recommendation
- Include quarterly health metrics comparison`,

    'owner-monthly-summary': `${baseInstructions}

Give me a simple summary of our email marketing for ${lastQuarter}:
- How many campaigns did we send? (${lastQuarter} first, with quarterly comparison)
- What's our average performance? (by quarter)
- What's working well?
- What needs improvement?
- Keep it simple and actionable
- Include quarterly summary table`,

    'owner-recent-campaigns': `${baseInstructions}

What did my marketing team send?
- Show campaigns from ${lastQuarter} first (if available), otherwise show all-time with quarterly breakdown
- List all campaigns with dates and which quarter they belong to
- Show performance (good, average, or needs work)
- Highlight the best performer
- Any concerns I should know about?
- Include quarterly campaign activity summary`,

    'owner-list-health': `${baseInstructions}

Quick check on our email list:
- How many subscribers do we have?
- Are we growing or shrinking? (compare ${lastQuarter} to previous quarters)
- What's our engagement rate? (by quarter)
- Is our list healthy?
- Include quarterly growth and engagement trends`,

    'owner-roi-assessment-demo': `${demoBaseInstructions}

Show me the business value of our email marketing:
- How many people are we reaching? (${lastQuarter} first, with quarterly breakdown)
- What's our engagement rate? (by quarter)
- If we have e-commerce connected, show sales impact by quarter
- Are we getting good return on our Mailchimp investment?
- What's the cost per engaged subscriber? (quarterly comparison)
- Include quarterly ROI summary table`,

    'owner-customer-engagement': `${baseInstructions}

Who are our most engaged email subscribers?
- Show me engagement patterns (from ${lastQuarter} or all-time)
- Are engaged subscribers also our best customers?
- If we have store data, connect email engagement to purchases by quarter
- What does this tell us about our customer relationships?
- Include quarterly engagement trends`,

    'owner-growth-scale': `${baseInstructions}

Can we scale our email marketing?
- Show me our current list size and growth rate (with quarterly breakdown)
- What's our capacity for growth?
- Are we maximizing our current subscriber base?
- What would it take to double our email impact?
- Include quarterly growth trends and projections`,

    'owner-strategic-focus': `${baseInstructions}

Based on all our email data (prioritizing ${lastQuarter}), what should we focus on next?
- What's our biggest opportunity? (consider ${lastQuarter} trends)
- What's our biggest risk?
- What's one thing we should start doing?
- What's one thing we should stop doing?
- Give me 3 specific recommendations
- Include quarterly performance context in recommendations`,

    'owner-investment-justification': `${baseInstructions}

Help me understand if we're getting value from Mailchimp:
- Show me key metrics that matter for our business (${lastQuarter} first, with quarterly trends)
- Are we using the platform effectively?
- What features are we paying for but not using?
- What would we miss if we stopped using Mailchimp?
- Is this a good investment?
- Include quarterly value analysis`,

    'owner-growth-planning': `${baseInstructions}

I'm thinking about expanding our email marketing. What does our data say?
- What's our current capacity? (based on ${lastQuarter} or all-time)
- What's our engagement potential? (with quarterly trends)
- What would need to change to scale?
- Show me the data to support expansion (quarterly breakdown)
- What are the risks?
- Include quarterly growth projections`,

    'account-audit-demo': `${demoBaseInstructions}

Create a comprehensive Mailchimp account audit:
- What's set up well?
- What needs improvement?
- What features are unused?
- What are the biggest opportunities?
- Prioritize recommendations
- Include activity analysis: Check ${lastQuarter} first, then all-time with quarterly breakdown
- Show quarterly usage trends for key features`,

    'onboard-team-member': `${baseInstructions}

Give a new team member an overview of our Mailchimp setup:
- What audiences do we have?
- What campaigns are we running? (show ${lastQuarter} activity first, then all-time with quarterly breakdown)
- What automations are active?
- What are our performance benchmarks? (include quarterly comparison)
- What should they know to get started?
- Include quarterly activity summary showing when we're most active`,

    'industry-benchmarking': `${baseInstructions}

Compare our performance to industry benchmarks:
- What's our open rate vs. industry average (typically 20-25%)? (${lastQuarter} first, with quarterly comparison)
- What's our click rate vs. industry average (typically 2-5%)? (by quarter)
- Where do we excel?
- Where are we falling behind?
- What can we learn from benchmarks?
- Include quarterly benchmark comparison table`,
  };

  return prompts[name] || '';
}

