# Top 5 Demo Prompts - Mailchimp MCP

**Purpose:** Demo-ready prompts with all PII and domain names obscured for safe demonstrations.

These prompts are based on the top 5 most valuable use cases from the USE_CASES_GUIDE.md, modified to be safe for demos with obscured personal information.

## 🎯 Quick Reference - Top 5 Demo Prompts

1. **`csm-account-health-check-demo`** - Comprehensive Account Health Check
2. **`marketer-quarterly-report-demo`** - Quarterly Performance Report  
3. **`owner-roi-assessment-demo`** - Marketing ROI Assessment
4. **`marketer-strategic-health-check-demo`** - Strategic Health Check
5. **`account-audit-demo`** - Comprehensive Account Audit

**All prompts are clickable in Claude Desktop and automatically mask PII when `MAILCHIMP_MASK_PII=true`**

**Note:** These prompts are clearly marked with "-demo" suffix and "DEMO:" prefix in descriptions for easy identification.

---

## Demo Prompt 1: Comprehensive Account Health Check

**Prompt Name:** `csm-account-health-check-demo` (available in Claude Desktop)  
**Use Case:** Account Health Assessment (CSM)  
**Value:** Most comprehensive overview - shows account status, risks, and opportunities

```
Give me a complete account health check. Show me:
- Total audiences and member counts
- Domain authentication status (check all verified domains and their DKIM/SPF/DMARC status)
- Campaign activity: First check Q4 2024 (2024-10-01 to 2024-12-31), if no activity then show all-time with quarterly breakdown
- Automation usage and performance
- Any segments or tags being used
- Overall engagement trends with quarterly comparison
- Include a quarterly breakdown table showing activity by quarter (Q1, Q2, Q3, Q4)
```

**Demo Notes:**
- All sensitive data is automatically obscured by built-in demo masking instructions
- Domain names, campaign names, subject lines, and full names are replaced with generic placeholders
- Email addresses are automatically masked (e.g., `j***@example.com`)
- All visual assets (charts, tables) use generic labels only

---

## Demo Prompt 2: Quarterly Performance Report

**Prompt Name:** `marketer-quarterly-report-demo` (available in Claude Desktop)  
**Use Case:** Performance Reporting & Analytics (Marketer)  
**Value:** Executive-ready reporting showing ROI and performance trends

```
Create a comprehensive Q4 2024 performance report:
- List all campaigns sent in Q4 2024 (if no activity, show all-time with quarterly breakdown)
- Calculate average open rate, click rate, and unsubscribe rate
- Identify top 5 and bottom 5 performing campaigns
- Compare Q4 2024 performance to previous quarters (if available)
- Highlight key insights and trends
- Provide a quarterly comparison table showing metrics by quarter
```

**Demo Notes:**
- Campaign names and subject lines are automatically replaced with generic placeholders
- Performance metrics are safe to show (aggregate data only)
- Email addresses in reports are automatically masked
- All identifying information is obscured in charts and tables

---

## Demo Prompt 3: Marketing ROI Assessment

**Prompt Name:** `owner-roi-assessment-demo` (available in Claude Desktop)  
**Use Case:** ROI & Business Impact (Business Owner)  
**Value:** Demonstrates business value and investment justification

```
Show me the business value of our email marketing:
- How many people are we reaching? (Q4 2024 first, with quarterly breakdown)
- What's our engagement rate? (by quarter)
- If we have e-commerce connected, show sales impact by quarter
- Are we getting good return on our Mailchimp investment?
- What's the cost per engaged subscriber? (quarterly comparison)
- Include quarterly ROI summary table
```

**Demo Notes:**
- Financial data is safe to show (aggregate numbers only)
- No individual customer data exposed
- All domain names, campaign names, and identifying information are obscured
- Shows value proposition clearly with anonymized data

---

## Demo Prompt 4: Strategic Health Check

**Prompt Name:** `marketer-strategic-health-check-demo` (available in Claude Desktop)  
**Use Case:** Executive Dashboard & Quick Insights (Marketer)  
**Value:** Quick, high-level insights for executive briefings

```
Quick health check for executive review:
- Are we growing or shrinking our list? (compare Q4 2024 to previous quarters)
- Is engagement improving or declining? (quarterly trend analysis)
- What's our biggest risk right now?
- What's our biggest opportunity?
- One strategic recommendation
- Include quarterly health metrics comparison
```

**Demo Notes:**
- High-level metrics only (all anonymized)
- No sensitive details - all identifying information obscured
- Perfect for executive presentations
- Shows strategic thinking with safe, generic data

---

## Demo Prompt 5: Comprehensive Account Audit

**Prompt Name:** `account-audit-demo` (available in Claude Desktop)  
**Use Case:** Account Audit (Cross-Functional)  
**Value:** Complete account overview for any persona - identifies opportunities and issues

```
Create a comprehensive Mailchimp account audit:
- What's set up well?
- What needs improvement?
- What features are unused?
- What are the biggest opportunities?
- Prioritize recommendations
- Include activity analysis: Check Q4 2024 first, then all-time with quarterly breakdown
- Show quarterly usage trends for key features
```

**Demo Notes:**
- Comprehensive but safe overview (all data anonymized)
- No PII exposed - domain names, campaign names, subject lines all obscured
- Shows platform utilization with generic descriptors
- Identifies optimization opportunities without exposing sensitive information

---

## Demo Safety Features

All demo prompts automatically include comprehensive data obfuscation:

1. **PII Masking:** Email addresses are automatically masked (e.g., `j***@example.com`) when `MAILCHIMP_MASK_PII=true`
2. **Domain Names:** All domain names are replaced with generic placeholders (e.g., "example.com", "yourdomain.com") - NEVER shows actual domains
3. **Campaign Names:** All campaign names are replaced with generic placeholders (e.g., "Q4 Newsletter", "Weekly Update") - NEVER shows actual campaign names
4. **Subject Lines:** All email subject lines are replaced with generic placeholders (e.g., "Monthly Newsletter", "Product Update") - NEVER shows actual subject lines
5. **Names:** NEVER displays first and last names together. Uses generic placeholders (e.g., "Customer A", "Subscriber 123") or single name only
6. **Visual Assets:** All charts, tables, and visualizations use generic labels only - no identifying information
7. **Aggregate Data Only:** All metrics are aggregate - no individual member data exposed
8. **Quarterly Focus:** Prompts prioritize recent data (Q4 2024) with historical context
9. **Brand Guidelines:** All charts and visualizations use Mailchimp colors (#FFE01B yellow) automatically

**CRITICAL:** These demo prompts include explicit instructions to Claude to obscure all sensitive data. This ensures demo safety even if PII masking is not fully enabled.

---

## How to Use These Demo Prompts

1. **In Claude Desktop:**
   - These prompts are pre-populated in Claude Desktop with "-demo" suffix
   - Click on the prompt name to use it (e.g., `csm-account-health-check-demo`)
   - All data obfuscation happens automatically via built-in instructions

2. **For Live Demos:**
   - Simply click the demo prompt in Claude Desktop
   - Claude will automatically:
     - Replace domain names with generic placeholders
     - Replace campaign names with generic placeholders
     - Replace subject lines with generic placeholders
     - Never show first and last names together
     - Mask all email addresses
     - Use generic labels in all charts and visualizations
   - All data shown is aggregate and anonymized

3. **Important:**
   - These prompts include explicit instructions to Claude to obscure all sensitive data
   - The masking happens at the prompt level, ensuring demo safety
   - No additional configuration needed - just use the "-demo" prompts

---

## Expected Demo Outputs

Each prompt will return:
- ✅ Clean, professional reports
- ✅ Mailchimp brand colors in charts (#FFE01B yellow)
- ✅ Quarterly breakdowns and comparisons
- ✅ Actionable insights and recommendations
- ✅ No exposed PII or sensitive data
- ✅ Domain authentication status included

---

**Last Updated:** For demo purposes - all PII automatically masked

