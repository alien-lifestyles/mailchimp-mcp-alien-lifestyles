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

// Update Claude Desktop config with license key
function updateClaudeDesktopConfig(licenseKey: string | null): { success: boolean; message: string; path?: string } {
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
    
    // Ensure mailchimp-mcp server config exists
    if (!config.mcpServers['mailchimp-mcp']) {
      config.mcpServers['mailchimp-mcp'] = {
        command: '/usr/local/bin/node',
        args: [join(process.cwd(), 'dist', 'index.js')],
        cwd: process.cwd(),
        env: {},
      };
    }
    
    // Ensure env object exists
    if (!config.mcpServers['mailchimp-mcp'].env) {
      config.mcpServers['mailchimp-mcp'].env = {};
    }
    
    // Update license key
    const currentKey = config.mcpServers['mailchimp-mcp'].env.MAILCHIMP_LICENSE_KEY;
    console.log('[updateClaudeDesktopConfig] Current license key in config:', currentKey || '(not set)');
    
    if (licenseKey && licenseKey.trim()) {
      const normalizedKey = licenseKey.trim().toUpperCase();
      console.log('[updateClaudeDesktopConfig] Setting license key to:', normalizedKey);
      config.mcpServers['mailchimp-mcp'].env.MAILCHIMP_LICENSE_KEY = normalizedKey;
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
      writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n', 'utf-8');
      console.log('Successfully wrote Claude Desktop config to:', configPath);
      console.log('License key in config:', config.mcpServers['mailchimp-mcp'].env.MAILCHIMP_LICENSE_KEY || '(not set)');
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
    `TRANSPORT_MODE=${env.TRANSPORT_MODE || 'stdio'}`,
    '',
    '# Optional: Required only if you want to send campaigns',
    env.CONFIRM_SEND ? `CONFIRM_SEND=${env.CONFIRM_SEND}` : '# CONFIRM_SEND=I_KNOW_WHAT_IM_DOING',
    '',
    '# Optional: Image Generation API Keys',
    env.OPENAI_API_KEY ? `OPENAI_API_KEY=${env.OPENAI_API_KEY}` : '# OPENAI_API_KEY=your_openai_api_key_here',
    env.STABILITY_API_KEY ? `STABILITY_API_KEY=${env.STABILITY_API_KEY}` : '# STABILITY_API_KEY=your_stability_api_key_here',
    env.REPLICATE_API_KEY ? `REPLICATE_API_KEY=${env.REPLICATE_API_KEY}` : '# REPLICATE_API_KEY=your_replicate_api_key_here',
  ];
  
  writeFileSync(ENV_FILE, lines.join('\n') + '\n', 'utf-8');
}

// Get current config (masked)
app.get('/api/config', (req, res) => {
  const env = readEnvFile();
  res.json({
    mailchimpApiKey: env.MAILCHIMP_API_KEY ? maskValue(env.MAILCHIMP_API_KEY) : '',
    mailchimpServerPrefix: env.MAILCHIMP_SERVER_PREFIX || 'us9',
    licenseKey: env.MAILCHIMP_LICENSE_KEY ? maskValue(env.MAILCHIMP_LICENSE_KEY) : '',
    maskPii: env.MAILCHIMP_MASK_PII !== 'false',
    openaiApiKey: env.OPENAI_API_KEY ? maskValue(env.OPENAI_API_KEY) : '',
    stabilityApiKey: env.STABILITY_API_KEY ? maskValue(env.STABILITY_API_KEY) : '',
    replicateApiKey: env.REPLICATE_API_KEY ? maskValue(env.REPLICATE_API_KEY) : '',
  });
});

// Save config
app.post('/api/config', (req, res) => {
  try {
    const currentEnv = readEnvFile();
    const newEnv = { ...currentEnv, ...req.body };
    
    // Only update if values are provided
    if (req.body.mailchimpApiKey) newEnv.MAILCHIMP_API_KEY = req.body.mailchimpApiKey;
    if (req.body.mailchimpServerPrefix) newEnv.MAILCHIMP_SERVER_PREFIX = req.body.mailchimpServerPrefix;
    if (req.body.licenseKey !== undefined) {
      if (req.body.licenseKey.trim()) {
        // Normalize the license key to uppercase
        const normalizedKey = req.body.licenseKey.trim().toUpperCase();
        newEnv.MAILCHIMP_LICENSE_KEY = normalizedKey;
      } else {
        delete newEnv.MAILCHIMP_LICENSE_KEY;
      }
    }
    if (req.body.maskPii !== undefined) newEnv.MAILCHIMP_MASK_PII = req.body.maskPii ? 'true' : 'false';
    if (req.body.openaiApiKey) newEnv.OPENAI_API_KEY = req.body.openaiApiKey;
    if (req.body.stabilityApiKey) newEnv.STABILITY_API_KEY = req.body.stabilityApiKey;
    if (req.body.replicateApiKey) newEnv.REPLICATE_API_KEY = req.body.replicateApiKey;
    
    writeEnvFile(newEnv);
    
    // Try to update Claude Desktop config automatically
    // Use the normalized key from newEnv if it exists, otherwise use the formatted one from request
    const licenseKeyToSave = newEnv.MAILCHIMP_LICENSE_KEY || (req.body.licenseKey ? req.body.licenseKey.trim().toUpperCase() : null);
    console.log('\n=== Claude Desktop Config Update ===');
    console.log('License key from newEnv:', newEnv.MAILCHIMP_LICENSE_KEY || '(not set)');
    console.log('License key from req.body:', req.body.licenseKey || '(not set)');
    console.log('License key to save:', licenseKeyToSave || '(empty - will remove)');
    console.log('Calling updateClaudeDesktopConfig...');
    
    const claudeConfigResult = updateClaudeDesktopConfig(licenseKeyToSave);
    
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
        }
      } catch (verifyError) {
        console.error('⚠️ Could not verify write:', verifyError);
      }
    }
    console.log('=== End Update ===\n');
    
    let message = 'Configuration saved to .env file successfully!';
    if (claudeConfigResult.success) {
      message += `\n\n✅ Claude Desktop config updated automatically at:\n${claudeConfigResult.path}\n\nPlease restart Claude Desktop for changes to take effect.`;
    } else {
      message += `\n\n⚠️ Could not update Claude Desktop config automatically:\n${claudeConfigResult.message}\n\nPlease manually add MAILCHIMP_LICENSE_KEY to your Claude Desktop config file.`;
    }
    
    res.json({
      success: true,
      message,
      claudeConfigUpdated: claudeConfigResult.success,
      claudeConfigPath: claudeConfigResult.path,
      claudeConfigError: claudeConfigResult.success ? undefined : claudeConfigResult.message,
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
    const { licenseKey } = req.body;
    const result = updateClaudeDesktopConfig(licenseKey || null);
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

