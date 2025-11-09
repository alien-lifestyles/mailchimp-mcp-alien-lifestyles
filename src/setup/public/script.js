// Store the actual license key value (unmasked) for reference
let actualLicenseKey = '';

// Get stored license key from localStorage
function getStoredLicenseKey() {
  try {
    return localStorage.getItem('mailchimp_mcp_license_key') || '';
  } catch (e) {
    return '';
  }
}

// Store license key in localStorage
function storeLicenseKey(key) {
  try {
    if (key && key.trim()) {
      localStorage.setItem('mailchimp_mcp_license_key', key.trim());
    } else {
      localStorage.removeItem('mailchimp_mcp_license_key');
    }
  } catch (e) {
    // Ignore localStorage errors (e.g., in private browsing)
  }
}

// Load current configuration
async function loadConfig() {
  try {
    const response = await fetch('/api/config');
    const config = await response.json();
    
    // Populate form fields
    document.getElementById('mailchimpApiKey').value = config.mailchimpApiKey || '';
    document.getElementById('mailchimpServerPrefix').value = config.mailchimpServerPrefix || 'us9';
    
    // Handle license key - check if it's masked
    const licenseInput = document.getElementById('licenseKey');
    const licenseValue = config.licenseKey || '';
    
    // Check if the value is masked (contains **** in the middle)
    const isMasked = licenseValue.includes('****') || /^ALIEN-[A-Z0-9]{4}-\*\*\*\*-[A-Z0-9]{4}$/.test(licenseValue);
    
    // Get stored license key from localStorage
    const storedKey = getStoredLicenseKey();
    
    if (isMasked && storedKey) {
      // If it's masked but we have the actual key stored, use the stored key
      licenseInput.value = storedKey;
      actualLicenseKey = storedKey;
    } else if (isMasked) {
      // If it's masked and we don't have the stored key, keep it masked
      licenseInput.value = licenseValue;
      actualLicenseKey = '';
    } else {
      // Not masked, use the value directly and store it
      licenseInput.value = licenseValue;
      if (licenseValue) {
        actualLicenseKey = licenseValue;
        storeLicenseKey(licenseValue);
      }
    }
    
    document.getElementById('maskPii').checked = config.maskPii !== false;
  } catch (error) {
    showStatus('Error loading configuration: ' + error.message, 'error');
  }
}

// Determine license type from license key
function getLicenseType(licenseKey) {
  if (!licenseKey || !licenseKey.trim()) {
    return 'FREE';
  }
  
  const normalizedKey = licenseKey.trim().toUpperCase();
  // Check if it matches the format ALIEN-XXXX-XXXX-XXXX
  const pattern = /^ALIEN-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
  if (pattern.test(normalizedKey)) {
    return 'PAID';
  }
  return 'FREE';
}

// Show confirmation modal
function showConfirmationModal(formData) {
  const modal = document.getElementById('confirmModal');
  const licenseType = getLicenseType(formData.licenseKey);
  const licenseDisplay = document.getElementById('licenseTypeDisplay');
  const featuresList = document.getElementById('featuresList');
  
  // Display license type
  if (licenseType === 'PAID') {
    licenseDisplay.innerHTML = `
      <div class="license-type-badge paid">
        <span>⭐</span>
        <span>Paid License - Full Access</span>
      </div>
    `;
    featuresList.innerHTML = `
      <div class="features-list">
        <h3>You'll have access to:</h3>
        <ul>
          <li>All 30+ pre-populated prompts (CSM, Marketer, Business Owner)</li>
          <li>Full read access to all Mailchimp data</li>
          <li>Write capabilities: Create/update audiences, segments, tags, merge fields</li>
          <li>Template creation and management</li>
          <li>File upload and management</li>
          <li>Campaign creation and sending</li>
        </ul>
      </div>
      <div class="modal-note">
        <strong>✨ Automatic Setup:</strong> License key will be added to <code>.env</code> and Claude Desktop config. <strong>Restart Claude Desktop</strong> to activate.
      </div>
    `;
  } else {
    licenseDisplay.innerHTML = `
      <div class="license-type-badge free">
        <span>🆓</span>
        <span>Free License - Read-Only Access</span>
      </div>
    `;
    featuresList.innerHTML = `
      <div class="features-list">
        <h3>You'll have access to:</h3>
        <ul>
          <li>5 Marketer prompts only</li>
          <li>Full read access to all Mailchimp data</li>
          <li>No write capabilities</li>
          <li>No template creation</li>
          <li>No file management</li>
          <li>No campaign creation</li>
        </ul>
      </div>
      <div class="modal-note">
        <strong>✨ Automatic Setup:</strong> Configuration will be saved automatically. Restart Claude Desktop completely for changes to take effect.
      </div>
    `;
  }
  
  // Store form data for saving after confirmation
  modal.dataset.formData = JSON.stringify(formData);
  
  // Show modal
  modal.classList.add('show');
  
  // Focus on the modal content for accessibility
  setTimeout(() => {
    const modalContent = modal.querySelector('.modal-content');
    if (modalContent) {
      modalContent.setAttribute('tabindex', '-1');
      modalContent.focus();
    }
  }, 100);
}

// Actually save the configuration
async function performSave(formData) {
  console.log('[Frontend] Saving configuration with formData:', {
    ...formData,
    mailchimpApiKey: formData.mailchimpApiKey ? maskValue(formData.mailchimpApiKey) : null,
    licenseKey: formData.licenseKey || '(empty)',
  });
  
  try {
    const response = await fetch('/api/config', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    const result = await response.json();

    if (result.success) {
      // Store the actual license key if it was saved
      if (formData.licenseKey && formData.licenseKey.trim()) {
        actualLicenseKey = formData.licenseKey.trim();
        storeLicenseKey(actualLicenseKey);
      } else {
        actualLicenseKey = '';
        storeLicenseKey('');
      }
      
      let message = result.message || '✅ Configuration saved successfully!';
      
      // Format message for display with better styling
      const formattedMessage = message
        .replace(/\n/g, '<br>')
        .replace(/✅/g, '<span style="color: var(--success);">✅</span>')
        .replace(/❌/g, '<span style="color: var(--error);">❌</span>')
        .replace(/⚠️/g, '<span style="color: var(--warning);">⚠️</span>')
        .replace(/📁/g, '📁')
        .replace(/🖥️/g, '🖥️')
        .replace(/📝/g, '📝')
        .replace(/🎫/g, '🎫')
        .replace(/🔄/g, '🔄')
        .replace(/📍/g, '📍')
        .replace(/🆓/g, '🆓')
        .replace(/⭐/g, '⭐');
      
      // Show success message with extended display time
      const statusEl = document.getElementById('statusMessage');
      statusEl.innerHTML = formattedMessage;
      statusEl.className = 'status-message success';
      statusEl.style.display = 'block';
      statusEl.style.textAlign = 'left';
      statusEl.style.fontSize = '13px';
      statusEl.style.lineHeight = '1.6';
      statusEl.style.whiteSpace = 'pre-wrap';
      
      // Keep message visible longer for detailed info (15 seconds instead of 5)
      setTimeout(() => {
        statusEl.style.display = 'none';
      }, 15000);
      
      // Close modal
      document.getElementById('confirmModal').classList.remove('show');
      
      // Reload config - but preserve the actual license key
      setTimeout(() => {
        loadConfig();
        // After reload, if we have an actual license key, restore it to the input
        if (actualLicenseKey) {
          const licenseInput = document.getElementById('licenseKey');
          licenseInput.value = actualLicenseKey;
        }
      }, 1000);
    } else {
      showStatus('Error: ' + (result.error || 'Failed to save configuration'), 'error');
    }
  } catch (error) {
    showStatus('Error saving configuration: ' + error.message, 'error');
  }
}

// Save configuration
async function saveConfig(event) {
  event.preventDefault();
  event.stopPropagation();
  
  // Clear any HTML5 validation errors
  const form = event.target;
  form.querySelectorAll('input').forEach(input => {
    input.setCustomValidity('');
    input.classList.remove('error');
  });
  
  // Get license key from input
  const licenseInput = document.getElementById('licenseKey');
  let licenseKeyValue = licenseInput.value.trim();
  
  // Check if the license key is masked (contains ****)
  const isMasked = licenseKeyValue.includes('****') || /^ALIEN-[A-Z0-9]{4}-\*\*\*\*-[A-Z0-9]{4}$/.test(licenseKeyValue);
  
  // If masked, try to get the actual key from memory or localStorage
  if (isMasked) {
    const storedKey = actualLicenseKey || getStoredLicenseKey();
    if (storedKey) {
      licenseKeyValue = storedKey;
    }
  }
  
  const formData = {
    mailchimpApiKey: document.getElementById('mailchimpApiKey').value.trim(),
    mailchimpServerPrefix: document.getElementById('mailchimpServerPrefix').value.trim(),
    licenseKey: licenseKeyValue,
    maskPii: document.getElementById('maskPii').checked,
  };

  // Validate required fields
  if (!formData.mailchimpApiKey) {
    showStatus('Mailchimp API Key is required', 'error');
    return;
  }

  // Handle license key - format it
  if (formData.licenseKey && formData.licenseKey.trim()) {
    let normalizedKey = formData.licenseKey.trim().toUpperCase();
    
    // Remove any existing dashes and ALIEN- prefix to rebuild
    if (normalizedKey.startsWith('ALIEN-')) {
      normalizedKey = normalizedKey.substring(6);
    }
    // Remove dashes and non-alphanumeric characters
    normalizedKey = normalizedKey.replace(/-/g, '').replace(/[^A-Z0-9]/g, '');
    
    // Format whatever they have
    if (normalizedKey.length > 0) {
      // Format into groups of 4, up to 12 characters
      const trimmed = normalizedKey.substring(0, 12); // Max 12 chars
      const parts = [];
      for (let i = 0; i < trimmed.length; i += 4) {
        parts.push(trimmed.substring(i, i + 4));
      }
      formData.licenseKey = 'ALIEN-' + parts.join('-');
    } else {
      // Empty after cleaning - treat as no license key
      formData.licenseKey = '';
    }
  } else {
    // Empty license key is fine (free version)
    formData.licenseKey = '';
  }

  // Show confirmation modal instead of saving directly
  showConfirmationModal(formData);
}

// Helper to mask values (for logging)
function maskValue(value) {
  if (!value || value.length < 8) return '••••••••';
  return value.substring(0, 4) + '••••••••' + value.substring(value.length - 4);
}

// Show status message
function showStatus(message, type) {
  const statusEl = document.getElementById('statusMessage');
  statusEl.textContent = message;
  statusEl.className = `status-message ${type}`;
  
  // Auto-hide after 5 seconds for success messages
  if (type === 'success') {
    setTimeout(() => {
      statusEl.style.display = 'none';
    }, 5000);
  }
}

  // License key input - plain text field for copy/paste
function setupLicenseKeyInput() {
  const licenseInput = document.getElementById('licenseKey');
  
  // When user focuses on a masked value, restore the actual key if we have it
  licenseInput.addEventListener('focus', (e) => {
    e.target.setCustomValidity('');
    e.target.classList.remove('error');
    
    // Check for stored key in localStorage as fallback
    const storedKey = getStoredLicenseKey();
    const keyToUse = actualLicenseKey || storedKey;
    
    // If the value is masked (contains ****) and we have the actual key, restore it
    if ((e.target.value.includes('****') || /^ALIEN-[A-Z0-9]{4}-\*\*\*\*-[A-Z0-9]{4}$/.test(e.target.value)) && keyToUse) {
      e.target.value = keyToUse;
      actualLicenseKey = keyToUse;
    } else if (e.target.value.includes('****')) {
      // If masked but no stored key, clear it so user can paste/type
      e.target.value = '';
      e.target.placeholder = 'Paste your license key here (ALIEN-XXXX-XXXX-XXXX)';
    }
  });
  
  licenseInput.addEventListener('blur', (e) => {
    // Clear any validation on blur
    e.target.setCustomValidity('');
    e.target.classList.remove('error');
    
    // Store the actual value if it's not masked
    if (e.target.value && !e.target.value.includes('****')) {
      actualLicenseKey = e.target.value.trim();
      storeLicenseKey(actualLicenseKey);
    }
    
    // Clear placeholder if empty
    if (!e.target.value) {
      e.target.placeholder = '';
    }
  });
  
  // Also store the value when user types
  licenseInput.addEventListener('input', (e) => {
    if (e.target.value && !e.target.value.includes('****')) {
      actualLicenseKey = e.target.value.trim();
      storeLicenseKey(actualLicenseKey);
    }
  });
  
  // Prevent any HTML5 validation - this is an optional field
  licenseInput.removeAttribute('pattern');
  licenseInput.removeAttribute('required');
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  // Initialize actualLicenseKey from localStorage if available
  actualLicenseKey = getStoredLicenseKey();
  
  loadConfig();
  setupLicenseKeyInput();
  
  const form = document.getElementById('setupForm');
  
  // Prevent HTML5 validation - we handle it ourselves
  form.setAttribute('novalidate', 'novalidate');
  form.addEventListener('submit', saveConfig);
  
  // Also prevent validation on all inputs
  form.querySelectorAll('input').forEach(input => {
    input.setAttribute('novalidate', 'novalidate');
  });
  
  // Modal event handlers
  const modal = document.getElementById('confirmModal');
  const closeModal = document.getElementById('closeModal');
  const cancelSave = document.getElementById('cancelSave');
  const confirmSave = document.getElementById('confirmSave');
  
  // Close modal handlers
  closeModal.addEventListener('click', () => {
    modal.classList.remove('show');
  });
  
  cancelSave.addEventListener('click', () => {
    modal.classList.remove('show');
  });
  
  // Confirm and save
  confirmSave.addEventListener('click', () => {
    const formData = JSON.parse(modal.dataset.formData || '{}');
    console.log('[Frontend] Confirm button clicked');
    console.log('[Frontend] Form data from modal:', {
      ...formData,
      mailchimpApiKey: formData.mailchimpApiKey ? maskValue(formData.mailchimpApiKey) : null,
      licenseKey: formData.licenseKey || '(empty)',
    });
    performSave(formData);
  });
  
  // Close modal when clicking outside
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('show');
    }
  });
  
  // Close modal with Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (modal.classList.contains('show')) {
        modal.classList.remove('show');
      }
    }
  });
});

