# Mailchimp MCP Architecture

## Overview

The Mailchimp MCP Server is a production-grade Model Context Protocol implementation that provides Claude AI with comprehensive access to the Mailchimp API.

## Tier 1 Features

### 1. Testing Infrastructure ✅

- **Framework**: Vitest with V8 coverage
- **Coverage**: 73% overall (license: 100%, pii-masking: 98.6%)
- **Test Structure**:
  - `tests/lib/license.test.ts` - License validation (19 tests)
  - `tests/lib/pii-masking.test.ts` - PII protection (36 tests)
  - `tests/lib/mailchimp-client.test.ts` - API client (8 tests)
- **Run Tests**: `npm test`
- **Coverage**: `npm run test:coverage`

### 2. Observability Layer ✅

**Structured Logging** (`src/lib/logger.ts`):
- Pino-based JSON logging
- Automatic PII redaction
- Environment-aware formatting (pretty in dev, JSON in prod)
- Contextual child loggers

**Metrics Collection** (`src/lib/metrics.ts`):
- Counters, gauges, and histograms
- Tagged metrics for detailed analysis
- In-memory storage with snapshot API
- Utility functions for timing measurements

### 3. Code Quality Improvements ✅

**Constants** (`src/constants.ts`):
- Centralized configuration
- Type-safe server prefix validation
- API limits and retry configuration
- File size limits

### 4. Production Readiness ✅

**CI/CD** (`.github/workflows/ci.yml`):
- Automated testing on push/PR
- Multi-version Node.js testing (20.x, 22.x)
- Coverage reporting to Codecov
- Build verification

## Core Components

### License System

**File**: `src/lib/license.ts`

Implements a simple but effective licensing system:
- FREE tier: Read-only access, 3 prompts
- PAID tier: Full read/write access, all prompts
- Format: `ALIEN-XXXX-XXXX-XXXX` (uppercase alphanumeric)
- Validation with normalization (lowercase accepted)

### API Client

**File**: `src/lib/mailchimp-client.ts`

Production-ready HTTP client:
- Exponential backoff retry logic
- Rate limit handling (429 responses)
- Server error retry (500-599)
- Error message sanitization
- Request/response logging (when integrated)
- Metrics tracking (when integrated)

### PII Protection

**File**: `src/lib/pii-masking.ts`

Comprehensive data privacy:
- Email masking: `user@example.com` → `u***@example.com`
- Name masking: `John Doe` → `J***`
- Phone masking: `+1-555-123-4567` → `***-***-4567`
- IP masking: `192.168.1.1` → `192.***.***.***`
- Location rounding to city-level precision
- Recursive object traversal

## Security Features

1. **Input Validation**:
   - Zod schemas for all tool inputs
   - Mailchimp ID format validation (`^[a-zA-Z0-9-]{1,64}$`)
   - Email length limits (RFC 5321 compliant)
   - File size limits (10MB for uploads)

2. **SSRF Prevention**:
   - Whitelisted server prefixes only
   - No user-controlled URLs

3. **Error Sanitization**:
   - Only safe error fields exposed
   - Sensitive API details redacted
   - Validation errors include helpful context

4. **PII Protection**:
   - Optional masking mode (`MAILCHIMP_MASK_PII=true`)
   - Automatic field detection
   - Preserves data utility while protecting privacy

## Performance Considerations

### Retry Strategy

```typescript
{
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  backoff: exponential
}
```

- 429 (rate limit): Uses `Retry-After` header when available
- 500-599 (server errors): Exponential backoff
- 400-499 (client errors): No retry (fail fast)

### Pagination

- Default page size: 50 items
- Maximum page size: 1000 items
- Maximum offset: 100,000 (prevents excessive pagination)

## Tool Categories

### Read Tools (Always Available)
- Account & Domain Management
- Audience Operations
- Campaign Analytics
- Member Management
- Segment & Tag Queries
- Template Browsing
- E-commerce Data
- Automation Workflows

### Write Tools (Paid License Required)
- Campaign Creation & Sending
- Template Management
- File Uploads
- Audience CRUD
- Member Operations
- Segment Management
- Tag Operations
- Domain Verification

## MCP Resources

Exposes Mailchimp audiences as resources:
- URI: `mailchimp://audience/{audienceId}`
- Provides member counts and metadata
- Enables Claude to browse account structure

## Prompts

Specialized prompts for different user roles:
- **CSM**: Account health, churn risk, feature adoption
- **Marketer**: Campaign performance, content analysis, benchmarks
- **Business Owner**: Monthly summaries, ROI assessment, list health

## Development Workflow

1. **Setup**: `npm install`
2. **Dev Mode**: `npm run dev`
3. **Test**: `npm test`
4. **Build**: `npm run build`
5. **Coverage**: `npm run test:coverage`

## Production Deployment

### Environment Variables

```bash
# Required
MAILCHIMP_API_KEY=your-key-here-us9
MAILCHIMP_SERVER_PREFIX=us9

# Optional
MAILCHIMP_LICENSE_KEY=ALIEN-XXXX-XXXX-XXXX
MAILCHIMP_MASK_PII=true
MAILCHIMP_READONLY=false
LOG_LEVEL=info
NODE_ENV=production
```

### Health Monitoring

- Logs: Structured JSON output (parse with log aggregators)
- Metrics: Available via `metrics.getMetrics()` API
- Errors: Logged with full context and stack traces

## Future Enhancements

1. **Caching Layer**: LRU cache for GET requests (5-minute TTL)
2. **Bulk Operations**: Batch member operations
3. **Pagination Helpers**: Auto-fetch all pages utility
4. **Search Tools**: Cross-audience member search
5. **Rate Limit Pool**: Track and predict rate limit exhaustion
6. **Circuit Breaker**: Fail-fast when Mailchimp is down
7. **Docker Support**: Containerized deployment
8. **Health Check Endpoint**: `/health` for load balancers

## Contributing

See `CONTRIBUTING.md` for development guidelines and code standards.

## License

MIT - See LICENSE file for details.
