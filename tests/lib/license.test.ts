import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { validateLicense, getLicenseType, isWriteEnabled, LicenseType } from '../../src/lib/license.js';

describe('License Validation', () => {
  const originalEnv = process.env.MAILCHIMP_LICENSE_KEY;

  afterEach(() => {
    process.env.MAILCHIMP_LICENSE_KEY = originalEnv;
  });

  describe('validateLicense', () => {
    it('should return FREE license for no key', () => {
      const result = validateLicense();
      expect(result.type).toBe(LicenseType.FREE);
      expect(result.isValid).toBe(true);
      expect(result.key).toBeUndefined();
    });

    it('should return FREE license for empty string', () => {
      const result = validateLicense('');
      expect(result.type).toBe(LicenseType.FREE);
      expect(result.isValid).toBe(true);
    });

    it('should return FREE license for whitespace only', () => {
      const result = validateLicense('   ');
      expect(result.type).toBe(LicenseType.FREE);
      expect(result.isValid).toBe(true);
    });

    it('should accept valid license key format', () => {
      const result = validateLicense('ALIEN-1234-5678-90AB');
      expect(result.type).toBe(LicenseType.PAID);
      expect(result.isValid).toBe(true);
      expect(result.key).toBe('ALIEN-1234-5678-90AB');
    });

    it('should normalize license key to uppercase', () => {
      const result = validateLicense('alien-abcd-efgh-ijkl');
      expect(result.type).toBe(LicenseType.PAID);
      expect(result.isValid).toBe(true);
      expect(result.key).toBe('ALIEN-ABCD-EFGH-IJKL');
    });

    it('should trim whitespace from license key', () => {
      const result = validateLicense('  ALIEN-1234-5678-90AB  ');
      expect(result.type).toBe(LicenseType.PAID);
      expect(result.isValid).toBe(true);
      expect(result.key).toBe('ALIEN-1234-5678-90AB');
    });

    it('should reject invalid prefix', () => {
      const result = validateLicense('INVALID-1234-5678-90AB');
      expect(result.type).toBe(LicenseType.FREE);
      expect(result.isValid).toBe(false);
    });

    it('should reject wrong number of segments', () => {
      const result = validateLicense('ALIEN-1234-5678');
      expect(result.type).toBe(LicenseType.FREE);
      expect(result.isValid).toBe(false);
    });

    it('should reject segments with wrong length', () => {
      const result = validateLicense('ALIEN-123-5678-90AB');
      expect(result.type).toBe(LicenseType.FREE);
      expect(result.isValid).toBe(false);
    });

    it('should reject segments with invalid characters', () => {
      const result = validateLicense('ALIEN-12!4-5678-90AB');
      expect(result.type).toBe(LicenseType.FREE);
      expect(result.isValid).toBe(false);
    });

    it('should normalize and accept lowercase letters in segments', () => {
      const result = validateLicense('ALIEN-12a4-5678-90AB');
      expect(result.type).toBe(LicenseType.PAID);
      expect(result.isValid).toBe(true);
      expect(result.key).toBe('ALIEN-12A4-5678-90AB');
    });

    it('should accept all numeric segments', () => {
      const result = validateLicense('ALIEN-1234-5678-9012');
      expect(result.type).toBe(LicenseType.PAID);
      expect(result.isValid).toBe(true);
    });

    it('should accept all alphabetic segments', () => {
      const result = validateLicense('ALIEN-ABCD-EFGH-IJKL');
      expect(result.type).toBe(LicenseType.PAID);
      expect(result.isValid).toBe(true);
    });
  });

  describe('getLicenseType', () => {
    it('should return FREE when no env var set', () => {
      delete process.env.MAILCHIMP_LICENSE_KEY;
      expect(getLicenseType()).toBe(LicenseType.FREE);
    });

    it('should return PAID for valid env var', () => {
      process.env.MAILCHIMP_LICENSE_KEY = 'ALIEN-1234-5678-90AB';
      expect(getLicenseType()).toBe(LicenseType.PAID);
    });

    it('should return FREE for invalid env var', () => {
      process.env.MAILCHIMP_LICENSE_KEY = 'invalid-key';
      expect(getLicenseType()).toBe(LicenseType.FREE);
    });
  });

  describe('isWriteEnabled', () => {
    it('should return false when no license key', () => {
      delete process.env.MAILCHIMP_LICENSE_KEY;
      expect(isWriteEnabled()).toBe(false);
    });

    it('should return true for valid license key', () => {
      process.env.MAILCHIMP_LICENSE_KEY = 'ALIEN-1234-5678-90AB';
      expect(isWriteEnabled()).toBe(true);
    });

    it('should return false for invalid license key', () => {
      process.env.MAILCHIMP_LICENSE_KEY = 'invalid';
      expect(isWriteEnabled()).toBe(false);
    });
  });
});
