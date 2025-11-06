/**
 * PII Masking Utilities
 * 
 * Provides functions to mask Personally Identifiable Information (PII)
 * in Mailchimp API responses to protect user privacy.
 */

/**
 * Mask an email address showing only first character and domain
 * Example: "john.doe@example.com" -> "j***@example.com"
 */
export function maskEmail(email: string): string {
  if (!email || typeof email !== 'string') return email;
  
  const [localPart, domain] = email.split('@');
  if (!localPart || !domain) return email;
  
  if (localPart.length === 1) {
    return `${localPart[0]}***@${domain}`;
  }
  
  return `${localPart[0]}***@${domain}`;
}

/**
 * Mask a name showing only first letter
 * Example: "John Doe" -> "J***"
 */
export function maskName(name: string): string {
  if (!name || typeof name !== 'string') return name;
  
  const trimmed = name.trim();
  if (trimmed.length === 0) return name;
  
  if (trimmed.length === 1) {
    return `${trimmed[0]}***`;
  }
  
  return `${trimmed[0]}***`;
}

/**
 * Mask phone numbers showing only last 4 digits
 * Example: "+1-555-123-4567" -> "***-***-4567"
 */
export function maskPhone(phone: string): string {
  if (!phone || typeof phone !== 'string') return phone;
  
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');
  
  if (digits.length <= 4) {
    return '***';
  }
  
  const lastFour = digits.slice(-4);
  return `***-***-${lastFour}`;
}

/**
 * Mask location data (latitude/longitude)
 * Rounds to approximate location (city level)
 */
export function maskLocation(location: { latitude?: number; longitude?: number }): { latitude: number; longitude: number } | null {
  if (!location || typeof location.latitude !== 'number' || typeof location.longitude !== 'number') {
    return location as any;
  }
  
  // Round to ~10km precision (approximately city level)
  return {
    latitude: Math.round(location.latitude * 10) / 10,
    longitude: Math.round(location.longitude * 10) / 10,
  };
}

/**
 * Mask IP addresses showing only first octet
 * Example: "192.168.1.1" -> "192.***.***.***"
 */
export function maskIP(ip: string): string {
  if (!ip || typeof ip !== 'string') return ip;
  
  const parts = ip.split('.');
  if (parts.length !== 4) return ip;
  
  return `${parts[0]}.***.***.***`;
}

/**
 * Recursively mask PII in an object
 */
export function maskPIIInObject(obj: any, maskEnabled: boolean): any {
  if (!maskEnabled) return obj;
  
  if (obj === null || obj === undefined) return obj;
  
  if (typeof obj !== 'object') return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(item => maskPIIInObject(item, maskEnabled));
  }
  
  const masked: any = {};
  
  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();
    
    // Mask email addresses
    if (lowerKey.includes('email') && typeof value === 'string') {
      masked[key] = maskEmail(value);
    }
    // Mask names
    else if ((lowerKey.includes('name') || lowerKey === 'full_name' || lowerKey === 'fname' || lowerKey === 'lname') && typeof value === 'string') {
      masked[key] = maskName(value);
    }
    // Mask phone numbers
    else if ((lowerKey.includes('phone') || lowerKey.includes('tel')) && typeof value === 'string') {
      masked[key] = maskPhone(value);
    }
    // Mask IP addresses
    else if (lowerKey.includes('ip') && typeof value === 'string') {
      masked[key] = maskIP(value);
    }
    // Mask location data
    else if (lowerKey === 'location' && typeof value === 'object') {
      masked[key] = maskLocation(value as any);
    }
    // Recursively process nested objects
    else if (typeof value === 'object') {
      masked[key] = maskPIIInObject(value, maskEnabled);
    }
    // Keep other values as-is
    else {
      masked[key] = value;
    }
  }
  
  return masked;
}

/**
 * Mask merge fields that might contain PII
 */
export function maskMergeFields(mergeFields: Record<string, any>, maskEnabled: boolean): Record<string, any> {
  if (!maskEnabled || !mergeFields) return mergeFields;
  
  const masked: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(mergeFields)) {
    const lowerKey = key.toLowerCase();
    const lowerValue = String(value).toLowerCase();
    
    // Check if merge field contains common PII patterns
    if (lowerKey.includes('email') || lowerValue.includes('@')) {
      masked[key] = maskEmail(String(value));
    } else if (lowerKey.includes('name') || lowerKey.includes('first') || lowerKey.includes('last')) {
      masked[key] = maskName(String(value));
    } else if (lowerKey.includes('phone') || lowerKey.includes('tel')) {
      masked[key] = maskPhone(String(value));
    } else {
      masked[key] = value;
    }
  }
  
  return masked;
}

