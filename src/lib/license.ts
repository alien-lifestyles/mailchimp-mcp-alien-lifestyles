/**
 * License Validation System
 * 
 * Validates license keys and determines feature access level.
 * Supports FREE (read-only) and PAID (full read/write) license types.
 */

export enum LicenseType {
  FREE = 'FREE',
  PAID = 'PAID',
}

export interface LicenseValidationResult {
  type: LicenseType;
  isValid: boolean;
  key?: string;
}

/**
 * License key format: ALIEN-XXXX-XXXX-XXXX
 * Where X is alphanumeric (A-Z, 0-9)
 * Total length: 20 characters (ALIEN- + 4-4-4-4)
 */
const LICENSE_KEY_REGEX = /^ALIEN-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;

/**
 * Validate a license key and return the license type
 * 
 * @param licenseKey - The license key to validate (optional)
 * @returns LicenseValidationResult with type and validity
 */
export function validateLicense(licenseKey?: string): LicenseValidationResult {
  // No key provided = FREE license
  if (!licenseKey || licenseKey.trim() === '') {
    return {
      type: LicenseType.FREE,
      isValid: true,
    };
  }

  const trimmedKey = licenseKey.trim().toUpperCase();

  // Check format
  if (!LICENSE_KEY_REGEX.test(trimmedKey)) {
    return {
      type: LicenseType.FREE,
      isValid: false,
      key: trimmedKey,
    };
  }

  // Valid paid license key format
  return {
    type: LicenseType.PAID,
    isValid: true,
    key: trimmedKey,
  };
}

/**
 * Get license type from environment variable
 * 
 * @returns LicenseType based on MAILCHIMP_LICENSE_KEY env var
 */
export function getLicenseType(): LicenseType {
  const licenseKey = process.env.MAILCHIMP_LICENSE_KEY;
  const result = validateLicense(licenseKey);
  return result.type;
}

/**
 * Check if write features are enabled
 * 
 * @returns true if license allows write operations
 */
export function isWriteEnabled(): boolean {
  return getLicenseType() === LicenseType.PAID;
}

