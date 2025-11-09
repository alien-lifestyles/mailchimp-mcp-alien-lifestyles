#!/usr/bin/env node

/**
 * CLI entry point for mailchimp-mcp-setup
 * This script runs the setup UI server
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Find the package root (go up from scripts/ to root)
const packageRoot = join(__dirname, '..');

// Try to run the setup server
// First try with tsx (for development), then with node (for production)
const setupServerPath = join(packageRoot, 'src', 'setup', 'server.ts');
const distSetupServerPath = join(packageRoot, 'dist', 'setup', 'server.js');

// Check if dist exists (production build)
const distExists = existsSync(distSetupServerPath);

if (distExists) {
  // Production: run from dist
  const proc = spawn('node', [distSetupServerPath], {
    stdio: 'inherit',
    cwd: packageRoot
  });
  
  proc.on('exit', (code) => {
    process.exit(code || 0);
  });
} else {
  // Development: run with tsx
  try {
    const proc = spawn('npx', ['tsx', setupServerPath], {
      stdio: 'inherit',
      cwd: packageRoot,
      shell: true
    });
    
    proc.on('exit', (code) => {
      process.exit(code || 0);
    });
  } catch (error) {
    console.error('Error running setup server:', error);
    console.error('\nPlease ensure the package is built: npm run build');
    process.exit(1);
  }
}

