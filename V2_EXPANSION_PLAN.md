# Mailchimp MCP v2 Expansion Plan

**Document Version:** 1.0  
**Created:** Based on current implementation analysis  
**Purpose:** Comprehensive roadmap for expanding Mailchimp MCP Server capabilities

## Current Implementation Status (v1)

### ✅ Implemented Endpoints (43 total)

**Core Features:**
- ✅ Audiences (Lists, Members, Segments, Tags, Merge Fields, Interests)
- ✅ Campaigns (List, Get, Reports)
- ✅ Templates & Template Folders
- ✅ Automations & Automation Emails
- ✅ Reports (List, Get Campaign Reports)
- ✅ Conversations
- ✅ E-commerce Stores (Basic: Stores, Products, Orders, Customers)
- ✅ Batch Operations
- ✅ Account Info

**Total:** 43 read endpoints + 3 write endpoints

---

## v2 Expansion Opportunities

### 🎯 High Priority (High Impact, Broad Use Cases)

#### 1. Campaign Deep Analytics ⭐⭐⭐
**Purpose:** Detailed campaign performance insights

**New Endpoints:**
- `GET /reports/{campaign_id}/click-details` - Get all click details
- `GET /reports/{campaign_id}/click-details/{link_id}` - Get specific link performance
- `GET /reports/{campaign_id}/domain-performance` - Email domain performance
- `GET /reports/{campaign_id}/eepurl` - Eepurl report
- `GET /reports/{campaign_id}/email-activity` - Detailed email activity timeline
- `GET /reports/{campaign_id}/locations` - Geographic performance data
- `GET /reports/{campaign_id}/sent-to` - Detailed recipient information
- `GET /reports/{campaign_id}/sub-reports` - Sub-reports for A/B tests
- `GET /reports/{campaign_id}/unsubscribed` - Unsubscribe details
- `GET /reports/{campaign_id}/advice` - Campaign optimization advice

**Use Cases:**
- Analyze which links perform best
- Track geographic engagement patterns
- Review detailed email activity timeline
- Get AI-powered campaign optimization suggestions
- Understand unsubscribe reasons

**Estimated Endpoints:** 10 new endpoints

---

#### 2. File Manager ⭐⭐⭐
**Purpose:** Manage images and assets for campaigns

**New Endpoints:**
- `GET /file-manager/files` - List uploaded files
- `GET /file-manager/files/{file_id}` - Get file details
- `GET /file-manager/folders` - List folders
- `GET /file-manager/folders/{folder_id}` - Get folder details

**Use Cases:**
- List all files/images used in campaigns
- Organize campaign assets
- Check file storage usage
- Manage branding assets

**Estimated Endpoints:** 4 new endpoints

---

#### 3. Search Operations ⭐⭐⭐
**Purpose:** Powerful search across Mailchimp data

**New Endpoints:**
- `GET /search-campaigns` - Search campaigns by keyword
- `GET /search-members` - Search members across all lists

**Use Cases:**
- Find campaigns by keyword
- Search for members across all lists
- Quick lookup functionality
- Cross-list member discovery

**Estimated Endpoints:** 2 new endpoints

---

### 🔶 Medium Priority (Niche but Valuable)

#### 4. Landing Pages ⭐⭐
**Purpose:** Manage landing pages created in Mailchimp

**New Endpoints:**
- `GET /landing-pages` - List landing pages
- `GET /landing-pages/{page_id}` - Get landing page details
- `GET /landing-pages/{page_id}/content` - Get landing page content

**Use Cases:**
- Track landing page performance
- Review lead generation pages
- Analyze landing page analytics
- Manage conversion pages

**Estimated Endpoints:** 3 new endpoints

---

#### 5. Enhanced Member Data ⭐⭐
**Purpose:** Deeper member insights and activity

**New Endpoints:**
- `GET /lists/{list_id}/members/{subscriber_hash}/activity` - Get member activity feed
- `GET /lists/{list_id}/members/{subscriber_hash}/tags` - Get member tags
- `GET /lists/{list_id}/members/{subscriber_hash}/removed` - Check if member was removed
- `GET /lists/{list_id}/members/{subscriber_hash}/goals` - Get member goals
- `GET /lists/{list_id}/members/{subscriber_hash}/notes` - Get member notes
- `GET /lists/{list_id}/members/{subscriber_hash}/events` - Get member events
- `GET /lists/{list_id}/webhooks` - List webhooks for an audience

**Use Cases:**
- Track individual member journey
- Review member engagement history
- Monitor tag associations
- Track member goals and notes
- Webhook configuration

**Estimated Endpoints:** 7 new endpoints

---

#### 6. Facebook Ads Integration ⭐⭐
**Purpose:** Manage Facebook ad campaigns

**New Endpoints:**
- `GET /facebook-ads` - List Facebook ad campaigns
- `GET /facebook-ads/{outreach_id}` - Get specific Facebook ad
- `GET /facebook-ads/{outreach_id}/content` - Get ad content

**Use Cases:**
- Track Facebook ad performance
- Sync Mailchimp and Facebook campaigns
- Analyze cross-platform marketing
- Manage social media campaigns

**Estimated Endpoints:** 3 new endpoints

---

### 🔹 Lower Priority (Advanced/Specialized Use Cases)

#### 7. Connected Sites ⭐
**Purpose:** Manage website integrations

**New Endpoints:**
- `GET /connected-sites` - List connected sites
- `GET /connected-sites/{connected_site_id}` - Get site details
- `GET /connected-sites/{connected_site_id}/verify-script-token` - Verify site connection

**Use Cases:**
- Monitor website integrations
- Verify site connections
- Track pop-up form performance
- Manage site tracking

**Estimated Endpoints:** 3 new endpoints

---

#### 8. E-commerce Advanced ⭐
**Purpose:** Deeper e-commerce analytics and management

**New Endpoints:**
- `GET /ecommerce/stores/{store_id}/carts` - List abandoned carts
- `GET /ecommerce/stores/{store_id}/carts/{cart_id}` - Get cart details
- `GET /ecommerce/stores/{store_id}/products/{product_id}/variants` - List product variants
- `GET /ecommerce/stores/{store_id}/promo-rules` - List promotion rules
- `GET /ecommerce/stores/{store_id}/promo-rules/{promo_rule_id}` - Get promo rule details

**Use Cases:**
- Recover abandoned carts
- Manage product catalogs with variants
- Track promotional campaigns
- Analyze cart abandonment

**Estimated Endpoints:** 5 new endpoints

---

#### 9. Account-Level Operations ⭐
**Purpose:** Account management and settings

**New Endpoints:**
- `GET /verified-domains` - List verified domains
- `GET /verified-domains/{domain_name}` - Get domain verification details
- `GET /authorized-apps` - List authorized apps
- `GET /timezones` - Get available timezones
- `GET /countries` - Get available countries

**Use Cases:**
- Manage domain verification
- Review app integrations
- Check account settings
- Reference data for other operations

**Estimated Endpoints:** 5 new endpoints

---

#### 10. Outreach/Content Studio ⭐
**Purpose:** Content planning and scheduling

**Endpoints:** (Requires API availability verification)
- `GET /outreach` - List outreach items
- `GET /content-studio` - Content studio items

**Use Cases:**
- Content planning
- Editorial calendar management
- Content asset organization

**Estimated Endpoints:** 2 new endpoints (if available)

---

## v2 Implementation Summary

### Total New Endpoints by Priority

| Priority | Category | Endpoints |
|----------|----------|-----------|
| High | Campaign Analytics | 10 |
| High | File Manager | 4 |
| High | Search Operations | 2 |
| Medium | Landing Pages | 3 |
| Medium | Enhanced Member Data | 7 |
| Medium | Facebook Ads | 3 |
| Low | Connected Sites | 3 |
| Low | E-commerce Advanced | 5 |
| Low | Account-Level | 5 |
| Low | Content Studio | 2 |

**Total Estimated New Endpoints:** ~44 endpoints

---

## Implementation Strategy

### Phase 1: High Priority (Recommended First)
1. Campaign Deep Analytics (10 endpoints)
2. File Manager (4 endpoints)
3. Search Operations (2 endpoints)

**Total:** 16 endpoints

### Phase 2: Medium Priority
4. Landing Pages (3 endpoints)
5. Enhanced Member Data (7 endpoints)
6. Facebook Ads (3 endpoints)

**Total:** 13 endpoints

### Phase 3: Lower Priority
7. Connected Sites (3 endpoints)
8. E-commerce Advanced (5 endpoints)
9. Account-Level Operations (5 endpoints)
10. Content Studio (2 endpoints)

**Total:** 15 endpoints

---

## Additional Considerations

### Write Endpoints (Future Enhancements)
- File upload endpoints
- Member note creation
- Tag management
- Segment creation
- Template creation
- Landing page creation

### Enhancement Ideas
- Rate limiting optimizations
- Caching layer for frequently accessed data
- Batch request support
- Webhook management
- Advanced filtering on list endpoints

---

## Notes

- All endpoint counts are estimates based on Mailchimp API documentation
- Some endpoints may require API verification
- Write endpoints are currently limited to campaign creation/sending
- Future versions could expand write capabilities based on user needs

---

## Reference Links

- [Mailchimp Marketing API Reference](https://mailchimp.com/developer/marketing/api/)
- [Current Implementation](../src/tools/read-tools.ts)
- [Test Suite](../test-endpoints.ts)

---

**Last Updated:** Based on current v1 implementation analysis  
**Next Review:** When beginning v2 development

