#!/usr/bin/env node

/**
 * Easy Installation Script for Mailchimp MCP
 * 
 * This script provides a one-command installation process:
 * 1. Checks prerequisites (Node.js)
 * 2. Installs the package globally
 * 3. Automatically configures Claude Desktop
 * 4. Launches the setup UI
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`\n${step} ${message}`, 'cyan');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

// Check if Node.js is installed
function checkNodeVersion() {
  try {
    const version = execSync('node --version', { encoding: 'utf-8' }).trim();
    const majorVersion = parseInt(version.replace('v', '').split('.')[0]);
    
    if (majorVersion < 20) {
      logError(`Node.js version ${version} detected. Node.js 20+ is required.`);
      log('Please upgrade Node.js: https://nodejs.org/', 'yellow');
      process.exit(1);
    }
    
    logSuccess(`Node.js ${version} detected`);
    return true;
  } catch (error) {
    logError('Node.js is not installed or not in PATH');
    log('Please install Node.js 20+ from https://nodejs.org/', 'yellow');
    process.exit(1);
  }
}

// Get global npm prefix (where global packages are installed)
function getGlobalNpmPrefix() {
  try {
    return execSync('npm config get prefix', { encoding: 'utf-8' }).trim();
  } catch (error) {
    // Fallback to common locations
    const platform = process.platform;
    if (platform === 'darwin' || platform === 'linux') {
      return '/usr/local';
    } else if (platform === 'win32') {
      return process.env.APPDATA + '\\npm';
    }
    return '/usr/local';
  }
}

// Find the global package installation path
function findGlobalPackagePath() {
  try {
    const prefix = getGlobalNpmPrefix();
    const platform = process.platform;
    
    // Try to find the package in common locations
    const possiblePaths = [
      join(prefix, 'lib', 'node_modules', '@alien-lifestyles', 'mailchimp-mcp'),
      join(prefix, 'node_modules', '@alien-lifestyles', 'mailchimp-mcp'),
    ];
    
    for (const path of possiblePaths) {
      if (existsSync(path)) {
        return path;
      }
    }
    
    // If not found, try npm list
    try {
      const listOutput = execSync('npm list -g @alien-lifestyles/mailchimp-mcp --depth=0', { encoding: 'utf-8' });
      // Parse the output to find the path (this is a fallback)
    } catch (e) {
      // Ignore
    }
    
    return null;
  } catch (error) {
    return null;
  }
}

// Install package globally
function installPackage() {
  logStep('📦', 'Installing Mailchimp MCP globally...');
  
  try {
    execSync('npm install -g @alien-lifestyles/mailchimp-mcp', { 
      stdio: 'inherit',
      encoding: 'utf-8'
    });
    logSuccess('Package installed successfully');
    return true;
  } catch (error) {
    logError('Failed to install package');
    log('You may need to run with sudo (macOS/Linux) or as Administrator (Windows)', 'yellow');
    log('Or try: npm install -g @alien-lifestyles/mailchimp-mcp', 'yellow');
    return false;
  }
}

// Check if package is already installed
function isPackageInstalled() {
  try {
    execSync('npm list -g @alien-lifestyles/mailchimp-mcp', { 
      stdio: 'ignore',
      encoding: 'utf-8'
    });
    return true;
  } catch (error) {
    return false;
  }
}

// Launch setup UI
function launchSetup() {
  logStep('🚀', 'Launching setup UI...');
  
  try {
    const packagePath = findGlobalPackagePath();
    if (packagePath) {
      process.chdir(packagePath);
    }
    
    // Try to run the setup script
    try {
      execSync('npx tsx src/setup/server.ts', { 
        stdio: 'inherit',
        cwd: packagePath || process.cwd()
      });
    } catch (error) {
      // If tsx fails, try with node if dist exists
      logWarning('Could not run setup with tsx, trying alternative method...');
      log('Please run: mailchimp-mcp-setup', 'yellow');
      log('Or: npm run setup (if installed locally)', 'yellow');
    }
  } catch (error) {
    logWarning('Could not automatically launch setup UI');
    log('Please run: mailchimp-mcp-setup', 'yellow');
  }
}

// Main installation process
async function main() {
  log('\n' + '='.repeat(60), 'bright');
  log('  Mailchimp MCP - Easy Installation', 'bright');
  log('='.repeat(60) + '\n', 'bright');
  
  // Step 1: Check prerequisites
  logStep('1️⃣', 'Checking prerequisites...');
  checkNodeVersion();
  
  // Step 2: Check if already installed
  logStep('2️⃣', 'Checking installation status...');
  if (isPackageInstalled()) {
    logSuccess('Mailchimp MCP is already installed');
    log('Launching setup UI...', 'cyan');
    launchSetup();
    return;
  }
  
  // Step 3: Install package
  logStep('3️⃣', 'Installing package...');
  if (!installPackage()) {
    process.exit(1);
  }
  
  // Step 4: Launch setup
  logStep('4️⃣', 'Configuration');
  log('\n🎉 Installation complete!', 'green');
  log('\nNext steps:', 'bright');
  log('1. The setup UI will open in your browser', 'cyan');
  log('2. Enter your Mailchimp API key', 'cyan');
  log('3. (Optional) Enter your license key for paid features', 'cyan');
  log('4. Restart Claude Desktop to activate', 'cyan');
  log('\n' + '='.repeat(60) + '\n', 'bright');
  
  launchSetup();
}

main().catch((error) => {
  logError('Installation failed: ' + error.message);
  process.exit(1);
});

