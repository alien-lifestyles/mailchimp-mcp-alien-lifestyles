# Tier 1 Improvements - Testing Guide

## Current Branch: `claude-tier1`

This branch contains comprehensive tier 1 improvements ready for testing.

## What's New in Tier 1

### ✅ Testing Infrastructure
- **Vitest** test framework with 73% code coverage
- 63 total tests across 3 test suites
- Coverage reports in `coverage/` directory
- CI/CD integration with GitHub Actions

### ✅ Observability
- **Structured Logging** (`src/lib/logger.ts`) - Pino-based JSON logging
- **Metrics Collection** (`src/lib/metrics.ts`) - Counters, gauges, histograms
- Automatic PII redaction in logs

### ✅ Code Quality
- **Constants** (`src/constants.ts`) - Centralized configuration
- **Architecture Documentation** (`docs/ARCHITECTURE.md`)
- Type-safe server prefix validation

### ✅ Production Readiness
- CI/CD workflow (`.github/workflows/ci.yml`)
- Multi-version Node.js testing (20.x, 22.x)
- Coverage reporting

## Testing Checklist

### 1. Install Dependencies

```bash
# Make sure you're on the claude-tier1 branch
git checkout claude-tier1

# Install dependencies (including new test dependencies)
npm install
```

### 2. Run Tests

```bash
# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage report
npm run test:coverage

# View coverage report
open coverage/index.html
```

### 3. Test the Logger

```bash
# Start in dev mode to see pretty logs
npm run dev

# In another terminal, test with MCP tools
# The logger should output structured logs
```

### 4. Test Metrics Collection

The metrics system is integrated but may need to be activated in the main code. Check:
- `src/lib/metrics.ts` - Metrics implementation
- Integration points in `src/lib/mailchimp-client.ts`

### 5. Verify Constants

Check that constants are being used:
- `src/constants.ts` - All configuration values
- Verify server prefix validation works
- Check API limits are enforced

### 6. Test CI/CD

```bash
# Push to GitHub to trigger CI
git push origin claude-tier1

# Check GitHub Actions tab for CI results
```

### 7. Integration Testing

Test the full MCP server with Claude Desktop:

```bash
# Build the project
npm run build

# Start the server
npm start

# In Claude Desktop, test various tools:
# - Read operations (should work)
# - Write operations (require paid license)
# - Check logs for structured output
```

## Known Issues to Test

1. **Logger Integration**: Verify logger is actually being used in production code
2. **Metrics Integration**: Check if metrics are being collected during API calls
3. **Test Coverage**: Some areas may need more tests (currently 73%)
4. **CI/CD**: Verify GitHub Actions runs successfully

## Files to Review

- `src/lib/logger.ts` - Structured logging
- `src/lib/metrics.ts` - Metrics collection
- `src/constants.ts` - Configuration constants
- `tests/lib/*.test.ts` - Test suites
- `.github/workflows/ci.yml` - CI/CD pipeline
- `docs/ARCHITECTURE.md` - Architecture documentation

## Next Steps After Testing

1. **Fix any issues** found during testing
2. **Increase test coverage** if needed (aim for 80%+)
3. **Integrate logger** into main code paths if not already done
4. **Integrate metrics** into API client if not already done
5. **Merge to main** when ready:
   ```bash
   git checkout main
   git merge claude-tier1
   git tag -a v0.4 -m "Version 0.4.0 - Tier 1 Improvements"
   git push origin main --tags
   ```

## Test Results Template

```
## Test Results - [Date]

### Tests
- [ ] All tests pass (`npm test`)
- [ ] Coverage meets target (73%+)
- [ ] No failing tests

### Logger
- [ ] Logger outputs structured JSON in production
- [ ] Logger outputs pretty format in development
- [ ] PII redaction works correctly

### Metrics
- [ ] Metrics are collected during API calls
- [ ] Metrics snapshot API works
- [ ] Timing measurements work

### Constants
- [ ] Server prefix validation works
- [ ] API limits are enforced
- [ ] File size limits work

### CI/CD
- [ ] GitHub Actions runs successfully
- [ ] Tests run on multiple Node versions
- [ ] Coverage is reported

### Integration
- [ ] MCP server starts correctly
- [ ] Tools work as expected
- [ ] No regressions from main branch
```

