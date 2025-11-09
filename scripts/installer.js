#!/usr/bin/env node

/**
 * Mailchimp MCP Installer
 * 
 * This installer can be run directly via npx without requiring
 * global installation first. It handles:
 * 1. Checking prerequisites
 * 2. Installing the package globally
 * 3. Running the setup UI
 * 4. Configuring Claude Desktop automatically
 */

import { execSync, spawn } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

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
  magenta: '\x1b[35m',
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

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// Check if Node.js is installed and version is correct
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

// Check if npm is installed
function checkNpm() {
  try {
    const version = execSync('npm --version', { encoding: 'utf-8' }).trim();
    logSuccess(`npm ${version} detected`);
    return true;
  } catch (error) {
    logError('npm is not installed or not in PATH');
    log('Please install npm (comes with Node.js): https://nodejs.org/', 'yellow');
    process.exit(1);
  }
}

// Check if package is already installed globally
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

// Install package globally
function installPackage() {
  logStep('📦', 'Installing Mailchimp MCP globally...');
  logInfo('This may require administrator privileges on some systems');
  
  try {
    execSync('npm install -g @alien-lifestyles/mailchimp-mcp', { 
      stdio: 'inherit',
      encoding: 'utf-8'
    });
    logSuccess('Package installed successfully');
    return true;
  } catch (error) {
    logError('Failed to install package');
    log('\nTroubleshooting:', 'yellow');
    log('  • macOS/Linux: Try running with sudo: sudo npm install -g @alien-lifestyles/mailchimp-mcp', 'yellow');
    log('  • Windows: Run terminal as Administrator', 'yellow');
    log('  • Or install without -g and use: npm run setup', 'yellow');
    return false;
  }
}

// Launch setup UI
function launchSetup() {
  logStep('🚀', 'Launching setup UI...');
  
  try {
    // Try to run the setup command
    const proc = spawn('mailchimp-mcp-setup', [], {
      stdio: 'inherit',
      shell: true
    });
    
    proc.on('exit', (code) => {
      if (code === 0) {
        logSuccess('Setup completed successfully!');
        log('\n📋 Next Steps:', 'bright');
        log('1. Restart Claude Desktop completely', 'cyan');
        log('2. Test the connection: Ask Claude "Can you run mc_ping?"', 'cyan');
      } else {
        logWarning(`Setup exited with code ${code}`);
        log('You can manually run: mailchimp-mcp-setup', 'yellow');
      }
      process.exit(code || 0);
    });
    
    proc.on('error', (error) => {
      logError(`Failed to launch setup: ${error.message}`);
      log('Try running manually: mailchimp-mcp-setup', 'yellow');
      log('Or: npm run setup (if installed locally)', 'yellow');
      process.exit(1);
    });
  } catch (error) {
    logError('Could not launch setup UI');
    log('Please run: mailchimp-mcp-setup', 'yellow');
    process.exit(1);
  }
}

// Main installation process
async function main() {
  log('\n' + '═'.repeat(70), 'bright');
  log('  Mailchimp MCP - Easy Installation', 'bright');
  log('  Powered by Alien Lifestyles', 'magenta');
  log('═'.repeat(70) + '\n', 'bright');
  
  // Step 1: Check prerequisites
  logStep('1️⃣', 'Checking prerequisites...');
  checkNodeVersion();
  checkNpm();
  
  // Step 2: Check if already installed
  logStep('2️⃣', 'Checking installation status...');
  if (isPackageInstalled()) {
    logSuccess('Mailchimp MCP is already installed globally');
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
  log('\nThe setup UI will open in your browser where you can:', 'cyan');
  log('  • Enter your Mailchimp API key', 'cyan');
  log('  • Configure server settings', 'cyan');
  log('  • Add your license key (optional - for paid features)', 'cyan');
  log('  • Set privacy preferences', 'cyan');
  log('\n' + '═'.repeat(70) + '\n', 'bright');
  
  launchSetup();
}

// Handle errors
main().catch((error) => {
  logError('Installation failed: ' + error.message);
  if (error.stack) {
    log('\nStack trace:', 'yellow');
    console.error(error.stack);
  }
  process.exit(1);
});

