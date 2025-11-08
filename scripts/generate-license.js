#!/usr/bin/env node

/**
 * License Key Generator
 * 
 * Generates license keys in the format: ALIEN-XXXX-XXXX-XXXX
 * Where X is alphanumeric (A-Z, 0-9)
 * 
 * Usage:
 *   node scripts/generate-license.js [count]
 * 
 * Example:
 *   node scripts/generate-license.js 5
 *   Generates 5 license keys
 */

const count = parseInt(process.argv[2]) || 1;

function generateLicenseKey() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const segments = [4, 4, 4];
  
  const segmentsStr = segments.map(len => 
    Array.from({length: len}, () => 
      chars[Math.floor(Math.random() * chars.length)]
    ).join('')
  ).join('-');
  
  return `ALIEN-${segmentsStr}`;
}

console.log('\n📝 Generated License Keys:\n');
for (let i = 0; i < count; i++) {
  const key = generateLicenseKey();
  console.log(key);
}
console.log(`\n✅ Generated ${count} license key${count > 1 ? 's' : ''}\n`);

