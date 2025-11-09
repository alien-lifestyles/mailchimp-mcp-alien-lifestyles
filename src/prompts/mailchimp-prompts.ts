import type { Prompt } from '@modelcontextprotocol/sdk/types.js';
import { LicenseType } from '../lib/license.js';
import { PROMPT_PREFIX } from '../constants.js';

// Free users get these 3 Marketer prompts only
const FREE_USER_PROMPTS = [
  'marketer-quarterly-performance',
  'marketer-campaign-benchmarks',
  'marketer-content-analysis',
];

export function createMailchimpPrompts(licenseType: LicenseType = LicenseType.FREE): Prompt[] {
  const allPrompts: Prompt[] = [
    // CSM Prompts (Top 3)
    {
      name: 'account-health-check',
      description: 'Comprehensive account health analysis',
      arguments: [],
    },
    {
      name: 'churn-risk-analysis',
      description: 'Identify accounts at risk of churning',
      arguments: [],
    },
    {
      name: 'feature-adoption',
      description: 'Check which features are being used',
      arguments: [],
    },
    
    // Marketer Prompts (Top 3)
    {
      name: 'marketer-quarterly-performance',
      description: 'Q4 2024 performance report',
      arguments: [],
    },
    {
      name: 'marketer-campaign-benchmarks',
      description: 'Compare campaigns to benchmarks',
      arguments: [],
    },
    {
      name: 'marketer-content-analysis',
      description: 'What content resonates with audience',
      arguments: [],
    },
    
    // Business Owner Prompts (Top 3)
    {
      name: 'monthly-summary',
      description: 'Simple monthly performance summary',
      arguments: [],
    },
    {
      name: 'roi-assessment',
      description: 'Marketing ROI and business value',
      arguments: [],
    },
    {
      name: 'list-health',
      description: 'Email list health check',
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

export function getPromptTemplate(name: string): string {
  const prompts: Record<string, string> = {
    'account-health-check': `${PROMPT_PREFIX}

Give me a complete account health check:
- Total audiences and member counts
- Recent campaign activity
- Automation usage
- Engagement trends
- Domain authentication status`,

    'churn-risk-analysis': `${PROMPT_PREFIX}

Analyze this account for churn risk signals:
- Show me campaigns with declining open rates
- Check if they have any paused automations
- Review audience growth trends
- Identify any unused features`,

    'feature-adoption': `${PROMPT_PREFIX}

What Mailchimp features is this customer using vs. not using?
- Do they have segments set up? Show me what segments exist
- Are they using tags? List all tags and member counts
- Check their template usage - do they have custom templates?
- What automations are running vs. what could be automated?`,

    'marketer-quarterly-performance': `${PROMPT_PREFIX}

Create a Q4 2024 performance report:
- All campaigns sent
- Average open rate, click rate
- Top 5 performing campaigns
- Compare to previous quarters`,

    'marketer-campaign-benchmarks': `${PROMPT_PREFIX}

Analyze our campaign performance this year:
- What's our average open rate across all campaigns?
- Which campaign types perform best?
- Show me campaigns that exceeded our average by 20%+
- What do our top performers have in common?`,

    'marketer-content-analysis': `${PROMPT_PREFIX}

What content resonates with our audience?
- Show me campaigns sorted by click rate
- Analyze campaign content themes
- Which merge fields or personalization elements are we using?
- Review template usage - which templates perform best?`,

    'monthly-summary': `${PROMPT_PREFIX}

Create an executive summary for this month:
- Total campaigns sent
- Total subscribers
- Key performance metrics (open rate, click rate)
- Top performing campaign
- Biggest opportunity for improvement
- One-sentence recommendation`,

    'roi-assessment': `${PROMPT_PREFIX}

Show me the business value of our email marketing:
- How many people are we reaching?
- What's our engagement rate?
- If we have e-commerce connected, show sales impact
- Are we getting good return on our Mailchimp investment?`,

    'list-health': `${PROMPT_PREFIX}

Quick check on our email list:
- How many subscribers do we have?
- Are we growing or shrinking?
- What's our engagement rate?
- Is our list healthy?`,
  };

  return prompts[name] || '';
}
