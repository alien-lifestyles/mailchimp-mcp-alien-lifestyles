import { describe, it, expect } from 'vitest';
import {
  maskEmail,
  maskName,
  maskPhone,
  maskIP,
  maskLocation,
  maskPIIInObject,
  maskMergeFields
} from '../../src/lib/pii-masking.js';

describe('PII Masking', () => {
  describe('maskEmail', () => {
    it('should mask email showing only first character and domain', () => {
      expect(maskEmail('john.doe@example.com')).toBe('j***@example.com');
    });

    it('should mask single character local part', () => {
      expect(maskEmail('a@example.com')).toBe('a***@example.com');
    });

    it('should handle empty string', () => {
      expect(maskEmail('')).toBe('');
    });

    it('should handle null', () => {
      expect(maskEmail(null as any)).toBe(null);
    });

    it('should handle undefined', () => {
      expect(maskEmail(undefined as any)).toBe(undefined);
    });

    it('should handle invalid email format', () => {
      expect(maskEmail('notanemail')).toBe('notanemail');
    });
  });

  describe('maskName', () => {
    it('should mask name showing only first letter', () => {
      expect(maskName('John Doe')).toBe('J***');
    });

    it('should mask single character name', () => {
      expect(maskName('A')).toBe('A***');
    });

    it('should handle empty string', () => {
      expect(maskName('')).toBe('');
    });

    it('should handle whitespace', () => {
      expect(maskName('   ')).toBe('   ');
    });

    it('should handle null', () => {
      expect(maskName(null as any)).toBe(null);
    });
  });

  describe('maskPhone', () => {
    it('should mask phone showing last 4 digits', () => {
      expect(maskPhone('+1-555-123-4567')).toBe('***-***-4567');
    });

    it('should handle short phone numbers', () => {
      expect(maskPhone('1234')).toBe('***');
    });

    it('should handle phone with various formats', () => {
      expect(maskPhone('(555) 123-4567')).toBe('***-***-4567');
    });

    it('should return empty string for empty input', () => {
      expect(maskPhone('')).toBe('');
    });
  });

  describe('maskIP', () => {
    it('should mask IP showing only first octet', () => {
      expect(maskIP('192.168.1.1')).toBe('192.***.***.***');
    });

    it('should handle invalid IP format', () => {
      expect(maskIP('not.an.ip')).toBe('not.an.ip');
    });

    it('should handle empty string', () => {
      expect(maskIP('')).toBe('');
    });
  });

  describe('maskLocation', () => {
    it('should round location to city-level precision', () => {
      const result = maskLocation({ latitude: 37.7749, longitude: -122.4194 });
      expect(result).toEqual({ latitude: 37.8, longitude: -122.4 });
    });

    it('should handle missing coordinates', () => {
      const result = maskLocation({} as any);
      expect(result).toEqual({});
    });

    it('should handle null', () => {
      const result = maskLocation(null as any);
      expect(result).toBe(null);
    });
  });

  describe('maskPIIInObject', () => {
    it('should return object unchanged when masking is disabled', () => {
      const data = {
        email_address: 'user@example.com',
        full_name: 'John Doe',
      };
      const result = maskPIIInObject(data, false);
      expect(result).toEqual(data);
    });

    it('should mask email_address field', () => {
      const data = {
        email_address: 'user@example.com',
      };
      const result = maskPIIInObject(data, true);
      expect(result.email_address).toBe('u***@example.com');
    });

    it('should mask nested email_address fields', () => {
      const data = {
        member: {
          email_address: 'user@example.com',
        },
      };
      const result = maskPIIInObject(data, true);
      expect(result.member.email_address).toBe('u***@example.com');
    });

    it('should mask arrays of objects with email_address', () => {
      const data = {
        members: [
          { email_address: 'user1@example.com', full_name: 'User One' },
          { email_address: 'user2@example.com', full_name: 'User Two' },
        ],
      };
      const result = maskPIIInObject(data, true);
      expect(result.members[0].email_address).toBe('u***@example.com');
      expect(result.members[0].full_name).toBe('U***');
      expect(result.members[1].email_address).toBe('u***@example.com');
      expect(result.members[1].full_name).toBe('U***');
    });

    it('should mask phone numbers', () => {
      const data = {
        phone: '+1-555-123-4567',
      };
      const result = maskPIIInObject(data, true);
      expect(result.phone).toBe('***-***-4567');
    });

    it('should mask IP addresses', () => {
      const data = {
        ip_address: '192.168.1.1',
      };
      const result = maskPIIInObject(data, true);
      expect(result.ip_address).toBe('192.***.***.***');
    });

    it('should mask location data', () => {
      const data = {
        location: { latitude: 37.7749, longitude: -122.4194 },
      };
      const result = maskPIIInObject(data, true);
      expect(result.location).toEqual({ latitude: 37.8, longitude: -122.4 });
    });

    it('should preserve non-PII fields', () => {
      const data = {
        email_address: 'user@example.com',
        id: '12345',
        status: 'subscribed',
        stats: {
          member_count: 100,
        },
      };
      const result = maskPIIInObject(data, true);
      expect(result.id).toBe('12345');
      expect(result.status).toBe('subscribed');
      expect(result.stats.member_count).toBe(100);
    });

    it('should handle null values', () => {
      const data = {
        email_address: null,
      };
      const result = maskPIIInObject(data, true);
      expect(result.email_address).toBeNull();
    });

    it('should handle arrays at root level', () => {
      const data = [
        { email_address: 'user1@example.com' },
        { email_address: 'user2@example.com' },
      ];
      const result = maskPIIInObject(data, true);
      expect(Array.isArray(result)).toBe(true);
      expect(result[0].email_address).toBe('u***@example.com');
      expect(result[1].email_address).toBe('u***@example.com');
    });
  });

  describe('maskMergeFields', () => {
    it('should return unchanged when masking disabled', () => {
      const fields = {
        EMAIL: 'user@example.com',
        FNAME: 'John',
      };
      const result = maskMergeFields(fields, false);
      expect(result).toEqual(fields);
    });

    it('should mask email merge fields', () => {
      const fields = {
        EMAIL: 'user@example.com',
      };
      const result = maskMergeFields(fields, true);
      expect(result.EMAIL).toBe('u***@example.com');
    });

    it('should mask name merge fields', () => {
      const fields = {
        FNAME: 'John',
        LNAME: 'Doe',
      };
      const result = maskMergeFields(fields, true);
      expect(result.FNAME).toBe('J***');
      expect(result.LNAME).toBe('D***');
    });

    it('should mask phone merge fields', () => {
      const fields = {
        PHONE: '+1-555-123-4567',
      };
      const result = maskMergeFields(fields, true);
      expect(result.PHONE).toBe('***-***-4567');
    });

    it('should preserve non-PII merge fields', () => {
      const fields = {
        COMPANY: 'Acme Inc',
        WEBSITE: 'https://example.com',
      };
      const result = maskMergeFields(fields, true);
      expect(result.COMPANY).toBe('Acme Inc');
      expect(result.WEBSITE).toBe('https://example.com');
    });
  });
});
