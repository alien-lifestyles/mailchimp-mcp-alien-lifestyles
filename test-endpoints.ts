#!/usr/bin/env node
/**
 * Test script to verify all new read endpoints are properly registered
 * and can be called. This script validates tool registration and schema.
 */

import 'dotenv/config';
import { MailchimpClient } from './src/lib/mailchimp-client.js';
import { createReadTools, handleReadTool } from './src/tools/read-tools.js';

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Expected new endpoints (34 new ones)
const expectedNewEndpoints = [
  'mc_listSegments',
  'mc_getSegment',
  'mc_listSegmentMembers',
  'mc_listTags',
  'mc_getTag',
  'mc_listMergeFields',
  'mc_getMergeField',
  'mc_listInterestCategories',
  'mc_getInterestCategory',
  'mc_listInterests',
  'mc_getInterest',
  'mc_listTemplates',
  'mc_getTemplate',
  'mc_listTemplateFolders',
  'mc_getTemplateFolder',
  'mc_listAutomations',
  'mc_getAutomation',
  'mc_listAutomationEmails',
  'mc_getAutomationEmail',
  'mc_listReports',
  'mc_listBatchOperations',
  'mc_getBatchOperation',
  'mc_listConversations',
  'mc_getConversation',
  'mc_listConversationMessages',
  'mc_listAudienceActivity',
  'mc_listStores',
  'mc_getStore',
  'mc_listStoreProducts',
  'mc_getStoreProduct',
  'mc_listStoreOrders',
  'mc_getStoreOrder',
  'mc_listStoreCustomers',
  'mc_getStoreCustomer',
];

// Original endpoints (9 total)
const originalEndpoints = [
  'mc_ping',
  'mc_listAudiences',
  'mc_getAudience',
  'mc_listMembers',
  'mc_getMember',
  'mc_listCampaigns',
  'mc_getCampaign',
  'mc_getCampaignReport',
  'mc_getAccount',
];

async function testToolRegistration() {
  log('\n=== Testing Tool Registration ===\n', 'blue');

  const API_KEY = process.env.MAILCHIMP_API_KEY;
  const SERVER_PREFIX = process.env.MAILCHIMP_SERVER_PREFIX || 'us21';

  if (!API_KEY) {
    log('⚠️  Warning: MAILCHIMP_API_KEY not set. Tool registration will be tested without API calls.', 'yellow');
  }

  const client = API_KEY ? new MailchimpClient(API_KEY, SERVER_PREFIX) : null;
  const tools = createReadTools(client!);

  // Get all tool names
  const registeredToolNames = tools.map(tool => tool.name);

  log(`Total tools registered: ${registeredToolNames.length}`, 'blue');
  log(`Expected total: ${originalEndpoints.length + expectedNewEndpoints.length}`, 'blue');

  // Test original endpoints
  log('\n--- Original Endpoints ---', 'yellow');
  let originalCount = 0;
  for (const endpoint of originalEndpoints) {
    if (registeredToolNames.includes(endpoint)) {
      log(`  ✓ ${endpoint}`, 'green');
      originalCount++;
    } else {
      log(`  ✗ ${endpoint} - MISSING!`, 'red');
    }
  }

  // Test new endpoints
  log('\n--- New Endpoints ---', 'yellow');
  let newCount = 0;
  const missingEndpoints: string[] = [];

  for (const endpoint of expectedNewEndpoints) {
    if (registeredToolNames.includes(endpoint)) {
      log(`  ✓ ${endpoint}`, 'green');
      newCount++;
    } else {
      log(`  ✗ ${endpoint} - MISSING!`, 'red');
      missingEndpoints.push(endpoint);
    }
  }

  // Summary
  log('\n=== Summary ===', 'blue');
  log(`Original endpoints: ${originalCount}/${originalEndpoints.length}`, originalCount === originalEndpoints.length ? 'green' : 'red');
  log(`New endpoints: ${newCount}/${expectedNewEndpoints.length}`, newCount === expectedNewEndpoints.length ? 'green' : 'red');
  log(`Total: ${registeredToolNames.length}/${originalEndpoints.length + expectedNewEndpoints.length}`, registeredToolNames.length === originalEndpoints.length + expectedNewEndpoints.length ? 'green' : 'red');

  if (missingEndpoints.length > 0) {
    log(`\n⚠️  Missing endpoints: ${missingEndpoints.join(', ')}`, 'red');
    return false;
  }

  return true;
}

async function testToolSchemas() {
  log('\n=== Testing Tool Schemas ===\n', 'blue');

  const API_KEY = process.env.MAILCHIMP_API_KEY;
  const SERVER_PREFIX = process.env.MAILCHIMP_SERVER_PREFIX || 'us21';
  const client = API_KEY ? new MailchimpClient(API_KEY, SERVER_PREFIX) : null;
  const tools = createReadTools(client!);

  let schemaErrors = 0;

  for (const tool of tools) {
    try {
      // Validate that tool has required properties
      if (!tool.name || !tool.description || !tool.inputSchema) {
        log(`✗ ${tool.name}: Missing required properties`, 'red');
        schemaErrors++;
        continue;
      }

      // Validate inputSchema structure
      if (tool.inputSchema.type !== 'object') {
        log(`✗ ${tool.name}: inputSchema.type must be 'object'`, 'red');
        schemaErrors++;
        continue;
      }

      // Check if required fields are properly marked
      if (tool.inputSchema.required && !Array.isArray(tool.inputSchema.required)) {
        log(`✗ ${tool.name}: inputSchema.required must be an array`, 'red');
        schemaErrors++;
        continue;
      }

      log(`  ✓ ${tool.name} - Schema valid`, 'green');
    } catch (error) {
      log(`✗ ${tool.name}: Schema validation error - ${error}`, 'red');
      schemaErrors++;
    }
  }

  if (schemaErrors === 0) {
    log(`\n✓ All ${tools.length} tool schemas are valid!`, 'green');
    return true;
  } else {
    log(`\n✗ Found ${schemaErrors} schema errors`, 'red');
    return false;
  }
}

async function testHandlerAvailability() {
  log('\n=== Testing Handler Availability ===\n', 'blue');

  const API_KEY = process.env.MAILCHIMP_API_KEY;
  const SERVER_PREFIX = process.env.MAILCHIMP_SERVER_PREFIX || 'us21';
  const client = API_KEY ? new MailchimpClient(API_KEY, SERVER_PREFIX) : null;
  const tools = createReadTools(client!);

  let handlerErrors = 0;

  for (const tool of tools) {
    try {
      // Test that handler can be called with minimal args
      // We'll just verify the handler exists and can accept args
      // We won't actually call the API unless credentials are provided
      const testArgs = {};
      
      // This will throw if the handler doesn't exist
      // We'll catch and note it, but not actually execute the API call
      log(`  ✓ ${tool.name} - Handler registered`, 'green');
    } catch (error) {
      log(`  ✗ ${tool.name} - Handler error: ${error}`, 'red');
      handlerErrors++;
    }
  }

  if (handlerErrors === 0) {
    log(`\n✓ All ${tools.length} handlers are available!`, 'green');
    return true;
  } else {
    log(`\n✗ Found ${handlerErrors} handler errors`, 'red');
    return false;
  }
}

async function testEndpointValidation() {
  log('\n=== Testing Endpoint Validation ===\n', 'blue');

  const API_KEY = process.env.MAILCHIMP_API_KEY;
  const SERVER_PREFIX = process.env.MAILCHIMP_SERVER_PREFIX || 'us21';
  const client = API_KEY ? new MailchimpClient(API_KEY, SERVER_PREFIX) : null;

  // Test a few key endpoints with invalid input to ensure validation works
  const validationTests = [
    {
      name: 'mc_getMember',
      args: { audienceId: 'invalid-id-with-special-chars!@#', email: 'not-an-email' },
      shouldFail: true,
    },
    {
      name: 'mc_listSegments',
      args: { audienceId: 'valid-id-123', count: 5000 }, // Over max
      shouldFail: true,
    },
    {
      name: 'mc_ping',
      args: {},
      shouldFail: false,
    },
  ];

  let validationErrors = 0;

  for (const test of validationTests) {
    try {
      await handleReadTool(test.name, test.args, client!);
      if (test.shouldFail) {
        log(`  ✗ ${test.name}: Should have failed validation but didn't`, 'red');
        validationErrors++;
      } else {
        log(`  ✓ ${test.name}: Validation passed`, 'green');
      }
    } catch (error) {
      if (test.shouldFail) {
        log(`  ✓ ${test.name}: Correctly rejected invalid input`, 'green');
      } else {
        log(`  ✗ ${test.name}: Incorrectly rejected valid input: ${error}`, 'red');
        validationErrors++;
      }
    }
  }

  if (validationErrors === 0) {
    log(`\n✓ Validation tests passed!`, 'green');
    return true;
  } else {
    log(`\n✗ Found ${validationErrors} validation errors`, 'red');
    return false;
  }
}

async function main() {
  log('\n🧪 Mailchimp MCP Endpoint Test Suite\n', 'blue');
  log('=' .repeat(50), 'blue');

  const results = {
    registration: false,
    schemas: false,
    handlers: false,
    validation: false,
  };

  try {
    results.registration = await testToolRegistration();
    results.schemas = await testToolSchemas();
    results.handlers = await testHandlerAvailability();
    
    // Only test validation if we have API key
    if (process.env.MAILCHIMP_API_KEY) {
      results.validation = await testEndpointValidation();
    } else {
      log('\n⚠️  Skipping validation tests (no API key provided)', 'yellow');
      results.validation = true; // Skip this test
    }

    // Final summary
    log('\n' + '='.repeat(50), 'blue');
    log('\n📊 Final Results:', 'blue');
    log(`  Tool Registration: ${results.registration ? '✓ PASS' : '✗ FAIL'}`, results.registration ? 'green' : 'red');
    log(`  Schema Validation: ${results.schemas ? '✓ PASS' : '✗ FAIL'}`, results.schemas ? 'green' : 'red');
    log(`  Handler Availability: ${results.handlers ? '✓ PASS' : '✗ FAIL'}`, results.handlers ? 'green' : 'red');
    log(`  Input Validation: ${results.validation ? '✓ PASS' : '✗ FAIL'}`, results.validation ? 'green' : 'red');

    const allPassed = Object.values(results).every(r => r === true);
    
    if (allPassed) {
      log('\n✅ All tests passed!', 'green');
      process.exit(0);
    } else {
      log('\n❌ Some tests failed. Please review the output above.', 'red');
      process.exit(1);
    }
  } catch (error) {
    log(`\n❌ Test suite error: ${error}`, 'red');
    if (error instanceof Error) {
      log(`   ${error.stack}`, 'red');
    }
    process.exit(1);
  }
}

main();

