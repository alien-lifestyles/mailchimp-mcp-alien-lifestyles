/**
 * License Verification Script
 * 
 * This script helps verify that the license key is being read correctly
 * and provides instructions for updating Claude Desktop config.
 */

import 'dotenv/config';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { validateLicense, LicenseType } from '../lib/license.js';

const LICENSE_KEY = process.env.MAILCHIMP_LICENSE_KEY;
const result = validateLicense(LICENSE_KEY);

console.log('\n📋 License Verification\n');
console.log('License Key from .env:', LICENSE_KEY || '(not set)');
console.log('License Type:', result.type);
console.log('Is Valid:', result.isValid);
console.log('Write Enabled:', result.type === LicenseType.PAID);

if (result.type === LicenseType.PAID) {
  console.log('\n✅ PAID License Detected');
  console.log('You should have access to:');
  console.log('  - All 30+ prompts');
  console.log('  - Full read/write capabilities');
} else {
  console.log('\n🆓 FREE License (Read-only)');
  console.log('You have access to:');
  console.log('  - 5 Marketer prompts only');
  console.log('  - Read-only capabilities');
}

// Check Claude Desktop config
const claudeConfigPath = join(
  process.env.HOME || process.env.USERPROFILE || '',
  'Library',
  'Application Support',
  'Claude',
  'claude_desktop_config.json'
);

console.log('\n📝 Claude Desktop Config Check\n');
if (existsSync(claudeConfigPath)) {
  try {
    const config = JSON.parse(readFileSync(claudeConfigPath, 'utf-8'));
    const mcpConfig = config.mcpServers?.['mailchimp-mcp'];
    const configLicenseKey = mcpConfig?.env?.MAILCHIMP_LICENSE_KEY;
    
    if (configLicenseKey) {
      console.log('✅ License key found in Claude Desktop config');
      console.log('   Key:', configLicenseKey.substring(0, 10) + '...');
      const configResult = validateLicense(configLicenseKey);
      console.log('   Type:', configResult.type);
      
      if (configLicenseKey !== LICENSE_KEY) {
        console.log('\n⚠️  WARNING: License key in Claude Desktop config differs from .env file');
        console.log('   Claude Desktop config:', configLicenseKey);
        console.log('   .env file:', LICENSE_KEY);
        console.log('   Claude Desktop will use the value from its config file.');
      }
    } else {
      console.log('❌ License key NOT found in Claude Desktop config');
      console.log('\n📋 To fix this:');
      console.log('1. Open:', claudeConfigPath);
      console.log('2. Add MAILCHIMP_LICENSE_KEY to the env section:');
      console.log('   "env": {');
      console.log('     "MAILCHIMP_API_KEY": "...",');
      console.log(`     "MAILCHIMP_LICENSE_KEY": "${LICENSE_KEY || 'ALIEN-XXXX-XXXX-XXXX'}",`);
      console.log('     ...');
      console.log('   }');
      console.log('3. Restart Claude Desktop completely');
    }
  } catch (error) {
    console.log('⚠️  Could not read Claude Desktop config:', error.message);
  }
} else {
  console.log('⚠️  Claude Desktop config file not found at:', claudeConfigPath);
  console.log('   Make sure Claude Desktop is installed and configured.');
}

console.log('\n');

