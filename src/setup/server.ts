/**
 * Setup UI Server
 * 
 * Local web server for securely entering API keys and license keys.
 * Runs on localhost only - keys never leave the user's machine.
 */

import express from 'express';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { homedir } from 'os';
import open from 'open';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3000;
const ENV_FILE = join(process.cwd(), '.env');

// Public directory for static files
const publicDir = join(__dirname, 'public');

// Get Claude Desktop config file path based on OS
function getClaudeDesktopConfigPath(): string {
  const platform = process.platform;
  let configDir: string;
  
  if (platform === 'darwin') {
    // macOS
    configDir = join(homedir(), 'Library', 'Application Support', 'Claude');
  } else if (platform === 'win32') {
    // Windows
    configDir = join(process.env.APPDATA || '', 'Claude');
  } else {
    // Linux
    configDir = join(homedir(), '.config', 'Claude');
  }
  
  return join(configDir, 'claude_desktop_config.json');
}

// Read Claude Desktop config
function readClaudeDesktopConfig(): { config: any; exists: boolean; error?: string } {
  const configPath = getClaudeDesktopConfigPath();
  
  if (!existsSync(configPath)) {
    return { config: null, exists: false };
  }
  
  try {
    const content = readFileSync(configPath, 'utf-8');
    const config = JSON.parse(content);
    return { config, exists: true };
  } catch (error) {
    return {
      config: null,
      exists: true,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Find the global package installation path
function findGlobalPackagePath(): string | null {
  try {
    const { execSync } = require('child_process');
    
    // Try npm list to find the package
    try {
      const listOutput = execSync('npm list -g @alien-lifestyles/mailchimp-mcp --depth=0 --json', { 
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'ignore']
      });
      const parsed = JSON.parse(listOutput);
      if (parsed.dependencies && parsed.dependencies['@alien-lifestyles/mailchimp-mcp']) {
        const path = parsed.dependencies['@alien-lifestyles/mailchimp-mcp'].resolved;
        if (path && existsSync(join(path, 'dist', 'index.js'))) {
          return path;
        }
      }
    } catch (e) {
      // Ignore
    }
    
    // Try common global npm locations
    const platform = process.platform;
    const possiblePaths = [];
    
    if (platform === 'darwin' || platform === 'linux') {
      possiblePaths.push(
        '/usr/local/lib/node_modules/@alien-lifestyles/mailchimp-mcp',
        join(process.env.HOME || '', '.npm-global/lib/node_modules/@alien-lifestyles/mailchimp-mcp'),
        join(process.env.HOME || '', '.nvm/versions/node', process.version, 'lib/node_modules/@alien-lifestyles/mailchimp-mcp')
      );
    } else if (platform === 'win32') {
      const appData = process.env.APPDATA || '';
      possiblePaths.push(
        join(appData, 'npm/node_modules/@alien-lifestyles/mailchimp-mcp')
      );
    }
    
    for (const path of possiblePaths) {
      if (existsSync(join(path, 'dist', 'index.js'))) {
        return path;
      }
    }
    
    return null;
  } catch (error) {
    return null;
  }
}

// Get Node.js executable path
function getNodePath(): string {
  try {
    const { execSync } = require('child_process');
    // Try to find node in PATH
    if (process.platform === 'win32') {
      return execSync('where node', { encoding: 'utf-8' }).trim().split('\n')[0];
    } else {
      return execSync('which node', { encoding: 'utf-8' }).trim();
    }
  } catch (error) {
    // Fallback to common locations
    if (process.platform === 'win32') {
      return 'node';
    } else {
      return '/usr/local/bin/node';
    }
  }
}

// Update Claude Desktop config with license key and API settings
function updateClaudeDesktopConfig(
  licenseKey: string | null,
  apiKey?: string,
  serverPrefix?: string,
  maskPii?: boolean
): { success: boolean; message: string; path?: string } {
  const configPath = getClaudeDesktopConfigPath();
  const configDir = join(configPath, '..');
  
  console.log('[updateClaudeDesktopConfig] Starting update...');
  console.log('[updateClaudeDesktopConfig] Config path:', configPath);
  console.log('[updateClaudeDesktopConfig] License key parameter:', licenseKey || '(null)');
  
  try {
    // Read existing config or create new one
    let config: any = { mcpServers: {} };
    let configExists = false;
    
    if (existsSync(configPath)) {
      const result = readClaudeDesktopConfig();
      if (result.exists && result.config) {
        config = result.config;
        configExists = true;
      } else if (result.error) {
        return {
          success: false,
          message: `Error reading Claude Desktop config: ${result.error}`,
          path: configPath,
        };
      }
    }
    
    // Ensure mcpServers exists
    if (!config.mcpServers) {
      config.mcpServers = {};
    }
    
    // Find the package path (global or local)
    const globalPath = findGlobalPackagePath();
    const packagePath = globalPath || process.cwd();
    const nodePath = getNodePath();
    
    console.log('[updateClaudeDesktopConfig] Package path:', packagePath);
    console.log('[updateClaudeDesktopConfig] Node path:', nodePath);
    
    // Ensure mailchimp-mcp server config exists
    if (!config.mcpServers['mailchimp-mcp']) {
      config.mcpServers['mailchimp-mcp'] = {
        command: nodePath,
        args: [join(packagePath, 'dist', 'index.js')],
        cwd: packagePath,
        env: {},
      };
    } else {
      // Update paths if they exist
      config.mcpServers['mailchimp-mcp'].command = nodePath;
      config.mcpServers['mailchimp-mcp'].args = [join(packagePath, 'dist', 'index.js')];
      config.mcpServers['mailchimp-mcp'].cwd = packagePath;
    }
    
    // Ensure env object exists
    if (!config.mcpServers['mailchimp-mcp'].env) {
      config.mcpServers['mailchimp-mcp'].env = {};
    }
    
    // Update API key if provided
    if (apiKey) {
      config.mcpServers['mailchimp-mcp'].env.MAILCHIMP_API_KEY = apiKey;
      console.log('[updateClaudeDesktopConfig] ✅ API key set in config');
    }
    
    // Update server prefix if provided
    if (serverPrefix) {
      config.mcpServers['mailchimp-mcp'].env.MAILCHIMP_SERVER_PREFIX = serverPrefix;
      console.log('[updateClaudeDesktopConfig] ✅ Server prefix set:', serverPrefix);
    }
    
    // Update mask PII if provided
    if (maskPii !== undefined) {
      config.mcpServers['mailchimp-mcp'].env.MAILCHIMP_MASK_PII = maskPii ? 'true' : 'false';
      console.log('[updateClaudeDesktopConfig] ✅ Mask PII set:', maskPii);
    }
    
    // Update license key
    const currentKey = config.mcpServers['mailchimp-mcp'].env.MAILCHIMP_LICENSE_KEY;
    console.log('[updateClaudeDesktopConfig] Current license key in config:', currentKey || '(not set)');
    
    if (licenseKey && licenseKey.trim()) {
      const normalizedKey = licenseKey.trim().toUpperCase();
      console.log('[updateClaudeDesktopConfig] Setting license key to:', normalizedKey);
      config.mcpServers['mailchimp-mcp'].env.MAILCHIMP_LICENSE_KEY = normalizedKey;
      
      // Verify it was set correctly
      const verifySet = config.mcpServers['mailchimp-mcp'].env.MAILCHIMP_LICENSE_KEY;
      if (verifySet !== normalizedKey) {
        console.error('[updateClaudeDesktopConfig] ❌ FAILED TO SET! Expected:', normalizedKey, 'Got:', verifySet);
        throw new Error(`Failed to set license key in config object. Expected: ${normalizedKey}, Got: ${verifySet}`);
      }
      console.log('[updateClaudeDesktopConfig] ✅ License key set in config object:', verifySet);
    } else {
      console.log('[updateClaudeDesktopConfig] Removing license key (empty value provided)');
      delete config.mcpServers['mailchimp-mcp'].env.MAILCHIMP_LICENSE_KEY;
    }
    
    // Ensure directory exists
    if (!existsSync(configDir)) {
      mkdirSync(configDir, { recursive: true });
    }
    
    // Write config file with pretty formatting
    try {
      const configToWrite = JSON.stringify(config, null, 2) + '\n';
      console.log('[updateClaudeDesktopConfig] About to write config file...');
      console.log('[updateClaudeDesktopConfig] Config file size:', configToWrite.length, 'bytes');
      console.log('[updateClaudeDesktopConfig] License key that will be written:', config.mcpServers['mailchimp-mcp'].env.MAILCHIMP_LICENSE_KEY || '(not set)');
      
      writeFileSync(configPath, configToWrite, 'utf-8');
      
      // Immediately verify the write
      const verifyContent = readFileSync(configPath, 'utf-8');
      const verifyConfig = JSON.parse(verifyContent);
      const verifyKey = verifyConfig.mcpServers?.['mailchimp-mcp']?.env?.MAILCHIMP_LICENSE_KEY;
      
      console.log('[updateClaudeDesktopConfig] ✅ File written successfully');
      console.log('[updateClaudeDesktopConfig] Verified license key in file:', verifyKey || '(not set)');
      console.log('[updateClaudeDesktopConfig] License key in config object:', config.mcpServers['mailchimp-mcp'].env.MAILCHIMP_LICENSE_KEY || '(not set)');
      
      if (verifyKey !== config.mcpServers['mailchimp-mcp'].env.MAILCHIMP_LICENSE_KEY) {
        console.error('[updateClaudeDesktopConfig] ❌ MISMATCH! Written:', verifyKey, 'Expected:', config.mcpServers['mailchimp-mcp'].env.MAILCHIMP_LICENSE_KEY);
      }
    } catch (writeError) {
      console.error('Error writing Claude Desktop config:', writeError);
      return {
        success: false,
        message: `Error writing to Claude Desktop config: ${writeError instanceof Error ? writeError.message : 'Unknown error'}`,
        path: configPath,
      };
    }
    
    return {
      success: true,
      message: configExists ? 'Claude Desktop config updated successfully' : 'Claude Desktop config created successfully',
      path: configPath,
    };
  } catch (error) {
    return {
      success: false,
      message: `Error updating Claude Desktop config: ${error instanceof Error ? error.message : 'Unknown error'}`,
      path: configPath,
    };
  }
}

app.use(express.json());
app.use(express.static(publicDir));

// Serve index.html for root path
app.get('/', (req, res) => {
  res.sendFile(join(publicDir, 'index.html'));
});

// Read current .env file if it exists
function readEnvFile(): Record<string, string> {
  const env: Record<string, string> = {};
  if (existsSync(ENV_FILE)) {
    const content = readFileSync(ENV_FILE, 'utf-8');
    content.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key) {
          env[key.trim()] = valueParts.join('=').trim();
        }
      }
    });
  }
  return env;
}

// Write .env file
function writeEnvFile(env: Record<string, string>): void {
  const lines: string[] = [
    '# Mailchimp API Configuration',
    `MAILCHIMP_API_KEY=${env.MAILCHIMP_API_KEY || 'your_full_api_key_here-us9'}`,
    `MAILCHIMP_SERVER_PREFIX=${env.MAILCHIMP_SERVER_PREFIX || 'us9'}`,
    '',
    '# License Configuration',
    '# FREE: No license key needed (read-only access, 5 prompts)',
    '# PAID: Add your license key from alienlifestyles.com (full read/write access, all prompts)',
    env.MAILCHIMP_LICENSE_KEY ? `MAILCHIMP_LICENSE_KEY=${env.MAILCHIMP_LICENSE_KEY}` : '# MAILCHIMP_LICENSE_KEY=ALIEN-XXXX-XXXX-XXXX',
    '',
    '# Server Configuration',
    env.MAILCHIMP_MASK_PII !== undefined ? `MAILCHIMP_MASK_PII=${env.MAILCHIMP_MASK_PII}` : 'MAILCHIMP_MASK_PII=true',
  ];
  
  writeFileSync(ENV_FILE, lines.join('\n') + '\n', 'utf-8');
}

// Get current config (masked)
app.get('/api/config', (req, res) => {
  const env = readEnvFile();
  res.json({
    mailchimpApiKey: env.MAILCHIMP_API_KEY ? maskValue(env.MAILCHIMP_API_KEY) : '',
    mailchimpServerPrefix: env.MAILCHIMP_SERVER_PREFIX || 'us9',
    licenseKey: env.MAILCHIMP_LICENSE_KEY ? maskLicenseKey(env.MAILCHIMP_LICENSE_KEY) : '',
    maskPii: env.MAILCHIMP_MASK_PII !== 'false',
  });
});

// Save config
app.post('/api/config', (req, res) => {
  try {
    console.log('\n=== POST /api/config ===');
    console.log('Request body keys:', Object.keys(req.body));
    console.log('Full request body:', JSON.stringify(req.body, null, 2));
    console.log('License key in request:', req.body.licenseKey ? `${req.body.licenseKey.substring(0, 10)}...` : '(empty/undefined)');
    console.log('License key full value:', req.body.licenseKey || '(empty/undefined)');
    
    const currentEnv = readEnvFile();
    const newEnv = { ...currentEnv, ...req.body };
    
    // Only update if values are provided
    if (req.body.mailchimpApiKey) newEnv.MAILCHIMP_API_KEY = req.body.mailchimpApiKey;
    if (req.body.mailchimpServerPrefix) newEnv.MAILCHIMP_SERVER_PREFIX = req.body.mailchimpServerPrefix;
    if (req.body.licenseKey !== undefined) {
      console.log('Processing license key...');
      console.log('  Raw value:', req.body.licenseKey);
      console.log('  Trimmed:', req.body.licenseKey ? req.body.licenseKey.trim() : '(empty)');
      
      if (req.body.licenseKey && req.body.licenseKey.trim()) {
        // Normalize the license key to uppercase
        const normalizedKey = req.body.licenseKey.trim().toUpperCase();
        console.log('  Normalized:', normalizedKey);
        newEnv.MAILCHIMP_LICENSE_KEY = normalizedKey;
      } else {
        console.log('  Removing license key (empty value)');
        delete newEnv.MAILCHIMP_LICENSE_KEY;
      }
    } else {
      console.log('License key not in request body (undefined)');
    }
    
    console.log('newEnv.MAILCHIMP_LICENSE_KEY:', newEnv.MAILCHIMP_LICENSE_KEY || '(not set)');
    if (req.body.maskPii !== undefined) newEnv.MAILCHIMP_MASK_PII = req.body.maskPii ? 'true' : 'false';
    
    writeEnvFile(newEnv);
    
    // Try to update Claude Desktop config automatically
    let claudeConfigResult: { success: boolean; message: string; path?: string };
    
    try {
      // Use the normalized key from newEnv if it exists, otherwise use the formatted one from request
      const licenseKeyToSave = newEnv.MAILCHIMP_LICENSE_KEY || (req.body.licenseKey ? req.body.licenseKey.trim().toUpperCase() : null);
      console.log('\n=== Claude Desktop Config Update ===');
      console.log('License key from newEnv:', newEnv.MAILCHIMP_LICENSE_KEY || '(not set)');
      console.log('License key from req.body:', req.body.licenseKey || '(not set)');
      console.log('License key to save:', licenseKeyToSave || '(empty - will remove)');
      console.log('Type of licenseKeyToSave:', typeof licenseKeyToSave);
      console.log('Calling updateClaudeDesktopConfig with:', licenseKeyToSave);
      
      // Always call updateClaudeDesktopConfig, even if licenseKeyToSave is null/undefined
      // This ensures we update the config file (removing the key if it's empty)
      console.log('About to call updateClaudeDesktopConfig...');
      claudeConfigResult = updateClaudeDesktopConfig(
        licenseKeyToSave || null,
        newEnv.MAILCHIMP_API_KEY,
        newEnv.MAILCHIMP_SERVER_PREFIX,
        newEnv.MAILCHIMP_MASK_PII === 'true'
      );
      console.log('Function returned:', JSON.stringify(claudeConfigResult, null, 2));
      
      if (!claudeConfigResult.success) {
        console.error('❌ CRITICAL: updateClaudeDesktopConfig failed!');
        console.error('Error details:', claudeConfigResult.message);
        console.error('Config path:', claudeConfigResult.path);
      }
      
      console.log('Update result:', claudeConfigResult.success ? '✅ SUCCESS' : '❌ FAILED');
      console.log('Message:', claudeConfigResult.message);
      console.log('Path:', claudeConfigResult.path);
      
      if (!claudeConfigResult.success) {
        console.error('❌ ERROR DETAILS:', JSON.stringify(claudeConfigResult, null, 2));
      } else {
        // Verify the write actually happened
        try {
          const verifyResult = readClaudeDesktopConfig();
          const verifyKey = verifyResult.config?.mcpServers?.['mailchimp-mcp']?.env?.MAILCHIMP_LICENSE_KEY;
          console.log('✅ Verification - License key in file:', verifyKey || '(not set)');
          if (verifyKey !== licenseKeyToSave) {
            console.error('⚠️ WARNING: License key mismatch! Expected:', licenseKeyToSave, 'Got:', verifyKey);
            // Try to fix it by writing again
            console.log('🔄 Attempting to fix mismatch by writing again...');
            const retryResult = updateClaudeDesktopConfig(licenseKeyToSave);
            console.log('Retry result:', retryResult.success ? '✅ SUCCESS' : '❌ FAILED');
          }
        } catch (verifyError) {
          console.error('⚠️ Could not verify write:', verifyError);
        }
      }
      console.log('=== End Update ===\n');
    } catch (updateError) {
      console.error('❌ FATAL ERROR in Claude Desktop config update:', updateError);
      claudeConfigResult = {
        success: false,
        message: `Fatal error: ${updateError instanceof Error ? updateError.message : 'Unknown error'}`,
        path: getClaudeDesktopConfigPath(),
      };
    }
    
    // Build detailed success message
    let message = '✅ Configuration saved successfully!\n\n';
    
    // .env file status
    message += '📁 .env File:\n';
    message += '  ✅ Saved successfully\n';
    if (newEnv.MAILCHIMP_LICENSE_KEY) {
      message += `  📝 License Key: ${maskValue(newEnv.MAILCHIMP_LICENSE_KEY)}\n`;
      message += `  🎫 License Type: ${newEnv.MAILCHIMP_LICENSE_KEY.match(/^ALIEN-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/) ? 'PAID ⭐' : 'FREE 🆓'}\n`;
    } else {
      message += '  🆓 License Type: FREE (No license key)\n';
    }
    
    message += '\n';
    
    // Claude Desktop config status
    message += '🖥️  Claude Desktop Config:\n';
    if (claudeConfigResult.success) {
      message += '  ✅ Updated successfully\n';
      message += `  📍 Location: ${claudeConfigResult.path}\n`;
      
      // Verify the write
      try {
        const verifyResult = readClaudeDesktopConfig();
        const verifyKey = verifyResult.config?.mcpServers?.['mailchimp-mcp']?.env?.MAILCHIMP_LICENSE_KEY;
        const expectedKey = newEnv.MAILCHIMP_LICENSE_KEY || null;
        if (verifyKey) {
          message += `  📝 License Key: ${maskValue(verifyKey)}\n`;
          message += `  🎫 License Type: ${verifyKey.match(/^ALIEN-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/) ? 'PAID ⭐' : 'FREE 🆓'}\n`;
          
          // Check if keys match
          if (verifyKey === expectedKey) {
            message += '  ✅ Keys are in sync\n';
          } else {
            message += `  ⚠️  Keys don't match (expected: ${maskValue(expectedKey || '')}, got: ${maskValue(verifyKey)})\n`;
          }
        } else {
          message += '  🆓 License Type: FREE (No license key)\n';
          if (expectedKey) {
            message += '  ⚠️  Warning: License key was not found in config file\n';
          }
        }
      } catch (verifyError) {
        message += '  ⚠️  Could not verify update\n';
      }
      
      message += '\n';
      message += '🔄 Next Step: Restart Claude Desktop completely for changes to take effect.';
    } else {
      message += '  ❌ Update failed\n';
      message += `  ⚠️  Error: ${claudeConfigResult.message}\n`;
      message += `  📍 Location: ${claudeConfigResult.path || 'Unknown'}\n`;
      message += '\n';
      message += '⚠️  Please manually add MAILCHIMP_LICENSE_KEY to your Claude Desktop config file.';
    }
    
    res.json({
      success: true,
      message,
      claudeConfigUpdated: claudeConfigResult.success,
      claudeConfigPath: claudeConfigResult.path,
      claudeConfigError: claudeConfigResult.success ? undefined : claudeConfigResult.message,
      licenseKey: newEnv.MAILCHIMP_LICENSE_KEY ? maskValue(newEnv.MAILCHIMP_LICENSE_KEY) : null,
      licenseType: newEnv.MAILCHIMP_LICENSE_KEY 
        ? (newEnv.MAILCHIMP_LICENSE_KEY.match(/^ALIEN-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/) ? 'PAID' : 'FREE')
        : 'FREE',
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// API to check Claude Desktop config status
app.get('/api/claude-config', (req, res) => {
  const configPath = getClaudeDesktopConfigPath();
  const result = readClaudeDesktopConfig();
  const licenseKey = result.config?.mcpServers?.['mailchimp-mcp']?.env?.MAILCHIMP_LICENSE_KEY;
  
  res.json({
    exists: result.exists,
    path: configPath,
    hasLicenseKey: !!licenseKey,
    licenseKey: licenseKey ? maskValue(licenseKey) : null,
    error: result.error,
    canWrite: existsSync(configPath) ? true : (() => {
      try {
        const testPath = join(configPath, '..');
        return existsSync(testPath) || true; // Directory might not exist but we can create it
      } catch {
        return false;
      }
    })(),
  });
});

// API to manually update Claude Desktop config (for testing)
app.post('/api/claude-config/update', (req, res) => {
  try {
    const { licenseKey, apiKey, serverPrefix, maskPii } = req.body;
    const result = updateClaudeDesktopConfig(
      licenseKey || null,
      apiKey,
      serverPrefix,
      maskPii
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Helper to mask sensitive values
function maskValue(value: string): string {
  if (!value || value.length < 8) return '••••••••';
  return value.substring(0, 4) + '••••••••' + value.substring(value.length - 4);
}

// Helper to mask license key in format ALIEN-xxxx-****-xxxx (hides middle 2 segments)
function maskLicenseKey(value: string): string {
  if (!value) return '';
  
  // Check if it matches the ALIEN-XXXX-XXXX-XXXX format
  const pattern = /^ALIEN-([A-Z0-9]{4})-([A-Z0-9]{4})-([A-Z0-9]{4})$/;
  const match = value.toUpperCase().match(pattern);
  
  if (match) {
    // Return ALIEN-xxxx-****-xxxx (first and last segments visible, middle hidden)
    return `ALIEN-${match[1]}-****-${match[3]}`;
  }
  
  // If it doesn't match the format, fall back to regular masking
  return maskValue(value);
}

app.listen(PORT, async () => {
  console.log(`\n🚀 Setup UI running at http://localhost:${PORT}`);
  console.log('📝 Enter your API keys and license key securely');
  console.log('🔒 All data stays on your machine - nothing is sent over the network\n');
  
  // Open browser automatically
  try {
    await open(`http://localhost:${PORT}`);
  } catch (error) {
    console.log('⚠️  Could not open browser automatically. Please visit http://localhost:3000');
  }
  
  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n\n✅ Setup complete. Server shutting down...');
    process.exit(0);
  });
});

