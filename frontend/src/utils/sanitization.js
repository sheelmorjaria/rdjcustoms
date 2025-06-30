/**
 * Comprehensive input sanitization utilities for XSS prevention
 * and secure data handling in the frontend application
 */

// Basic HTML entity encoding
const htmlEntityMap = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#96;',
  '=': '&#x3D;'
};

/**
 * Escapes HTML entities to prevent XSS attacks
 * @param {string} text - Text to escape
 * @returns {string} - Escaped text
 */
export const escapeHtml = (text) => {
  if (typeof text !== 'string') {
    return String(text);
  }
  
  return text.replace(/[&<>"'`=/]/g, (match) => htmlEntityMap[match]);
};

/**
 * Removes dangerous script tags and event handlers
 * @param {string} input - Input to sanitize
 * @returns {string} - Sanitized input
 */
export const removeScriptTags = (input) => {
  if (typeof input !== 'string') {
    return String(input);
  }
  
  return input
    // Remove script tags (case insensitive)
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove javascript: and vbscript: protocols
    .replace(/javascript:/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/data:/gi, '')
    // Remove event handlers
    .replace(/on\w+\s*=/gi, '')
    // Remove style attributes that might contain expressions
    .replace(/style\s*=\s*["'][^"']*["']/gi, '');
};

/**
 * Sanitizes user input for safe display
 * @param {string} input - User input to sanitize
 * @param {Object} options - Sanitization options
 * @returns {string} - Sanitized input
 */
export const sanitizeUserInput = (input, options = {}) => {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  const {
    allowHtml = false,
    maxLength = 1000,
    removeScripts = true,
    escapeEntities = true
  } = options;
  
  let sanitized = input.trim();
  
  // Limit length to prevent DoS
  if (maxLength && sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  
  // Remove script tags and dangerous content
  if (removeScripts) {
    sanitized = removeScriptTags(sanitized);
  }
  
  // Escape HTML entities unless HTML is explicitly allowed
  if (!allowHtml && escapeEntities) {
    sanitized = escapeHtml(sanitized);
  }
  
  return sanitized;
};

/**
 * Validates and sanitizes email addresses
 * @param {string} email - Email to validate
 * @returns {Object} - Validation result with sanitized email
 */
export const sanitizeEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return { isValid: false, sanitized: '', error: 'Email is required' };
  }
  
  // Remove dangerous characters and scripts
  const sanitized = removeScriptTags(email.trim().toLowerCase());
  
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValid = emailRegex.test(sanitized) && 
                  sanitized.length <= 254 && // RFC 5321 limit
                  !sanitized.includes('<') && 
                  !sanitized.includes('>') &&
                  !sanitized.includes('javascript:') &&
                  !sanitized.includes('data:');
  
  return {
    isValid,
    sanitized: isValid ? sanitized : '',
    error: isValid ? null : 'Invalid email format'
  };
};

/**
 * Sanitizes phone numbers
 * @param {string} phone - Phone number to sanitize
 * @returns {Object} - Validation result with sanitized phone
 */
export const sanitizePhone = (phone) => {
  if (!phone || typeof phone !== 'string') {
    return { isValid: false, sanitized: '', error: 'Phone number is required' };
  }
  
  // Remove scripts and dangerous content
  let sanitized = removeScriptTags(phone.trim());
  
  // Remove all non-digit characters except + and spaces
  sanitized = sanitized.replace(/[^\d\+\s\-\(\)]/g, '');
  
  // Basic phone validation (international format)
  const phoneRegex = /^[\+]?[1-9][\d\s\-\(\)]{7,14}$/;
  const isValid = phoneRegex.test(sanitized) && sanitized.length <= 20;
  
  return {
    isValid,
    sanitized: isValid ? sanitized : '',
    error: isValid ? null : 'Invalid phone number format'
  };
};

/**
 * Sanitizes search queries to prevent injection attacks
 * @param {string} query - Search query to sanitize
 * @returns {string} - Sanitized query
 */
export const sanitizeSearchQuery = (query) => {
  if (!query || typeof query !== 'string') {
    return '';
  }
  
  let sanitized = query.trim();
  
  // Remove SQL injection patterns
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|CREATE|ALTER)\b)/gi,
    /(--|#|\/\*|\*\/)/g,
    /('|"|;|\\)/g,
  ];
  
  sqlPatterns.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '');
  });
  
  // Remove script tags and dangerous content
  sanitized = removeScriptTags(sanitized);
  
  // Limit length
  if (sanitized.length > 100) {
    sanitized = sanitized.substring(0, 100);
  }
  
  return sanitized;
};

/**
 * Validates and sanitizes URLs
 * @param {string} url - URL to validate
 * @returns {Object} - Validation result with sanitized URL
 */
export const sanitizeUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return { isValid: false, sanitized: '', error: 'URL is required' };
  }
  
  try {
    const urlObj = new URL(url);
    
    // Only allow safe protocols
    const allowedProtocols = ['http:', 'https:'];
    const isValid = allowedProtocols.includes(urlObj.protocol) &&
                    !url.includes('javascript:') &&
                    !url.includes('vbscript:') &&
                    !url.includes('data:') &&
                    !url.includes('<script>');
    
    return {
      isValid,
      sanitized: isValid ? url : '',
      error: isValid ? null : 'Invalid or unsafe URL'
    };
  } catch (error) {
    return {
      isValid: false,
      sanitized: '',
      error: 'Invalid URL format'
    };
  }
};

/**
 * Sanitizes file names for safe upload
 * @param {string} fileName - File name to sanitize
 * @returns {Object} - Validation result with sanitized file name
 */
export const sanitizeFileName = (fileName) => {
  if (!fileName || typeof fileName !== 'string') {
    return { isValid: false, sanitized: '', error: 'File name is required' };
  }
  
  // Check for path traversal attempts
  if (fileName.includes('../') || fileName.includes('..\\')) {
    return { isValid: false, sanitized: '', error: 'Path traversal not allowed' };
  }
  
  // Remove dangerous characters
  let sanitized = fileName
    .replace(/[<>:"|?*]/g, '') // Windows reserved characters
    .replace(/[\/\\]/g, '_')   // Path separators
    .replace(/\s+/g, '_')      // Multiple spaces
    .trim();
  
  // Check for dangerous extensions
  const dangerousExtensions = [
    '.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js', '.jar',
    '.php', '.asp', '.aspx', '.jsp', '.py', '.rb', '.pl', '.sh', '.ps1'
  ];
  
  const hasDangerousExtension = dangerousExtensions.some(ext => 
    sanitized.toLowerCase().includes(ext)
  );
  
  // Check for reserved file names (Windows)
  const reservedNames = [
    'CON', 'PRN', 'AUX', 'NUL', 'COM1', 'COM2', 'COM3', 'COM4', 'COM5',
    'COM6', 'COM7', 'COM8', 'COM9', 'LPT1', 'LPT2', 'LPT3', 'LPT4',
    'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'
  ];
  
  const isReserved = reservedNames.includes(sanitized.split('.')[0].toUpperCase());
  
  const isValid = sanitized.length > 0 && 
                  sanitized.length <= 255 &&
                  !hasDangerousExtension &&
                  !isReserved &&
                  !sanitized.startsWith('.') &&
                  !/^[\s\.]+$/.test(sanitized);
  
  return {
    isValid,
    sanitized: isValid ? sanitized : '',
    error: isValid ? null : 'Invalid or unsafe file name'
  };
};

/**
 * Detects potential SQL injection patterns
 * @param {string} input - Input to check
 * @returns {boolean} - True if SQL injection detected
 */
export const detectSqlInjection = (input) => {
  if (!input || typeof input !== 'string') {
    return false;
  }
  
  const sqlInjectionPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|CREATE|ALTER)\b)/i,
    /(--|#|\/\*|\*\/)/,
    /('|"|;|\\)/,
    /(OR|AND)\s+\d+\s*=\s*\d+/i,
    /(\bUNION\b|\bSELECT\b|\bDROP\b)/i
  ];
  
  return sqlInjectionPatterns.some(pattern => pattern.test(input));
};

/**
 * Comprehensive input sanitizer for forms
 * @param {Object} formData - Form data to sanitize
 * @param {Object} fieldConfig - Configuration for each field
 * @returns {Object} - Sanitized form data with validation results
 */
export const sanitizeFormData = (formData, fieldConfig = {}) => {
  const sanitized = {};
  const errors = {};
  let isValid = true;
  
  Object.keys(formData).forEach(field => {
    const value = formData[field];
    const config = fieldConfig[field] || {};
    
    switch (config.type) {
      case 'email':
        const emailResult = sanitizeEmail(value);
        sanitized[field] = emailResult.sanitized;
        if (!emailResult.isValid) {
          errors[field] = emailResult.error;
          isValid = false;
        }
        break;
        
      case 'phone':
        const phoneResult = sanitizePhone(value);
        sanitized[field] = phoneResult.sanitized;
        if (!phoneResult.isValid) {
          errors[field] = phoneResult.error;
          isValid = false;
        }
        break;
        
      case 'url':
        const urlResult = sanitizeUrl(value);
        sanitized[field] = urlResult.sanitized;
        if (!urlResult.isValid) {
          errors[field] = urlResult.error;
          isValid = false;
        }
        break;
        
      case 'search':
        sanitized[field] = sanitizeSearchQuery(value);
        break;
        
      default:
        sanitized[field] = sanitizeUserInput(value, config);
        
        // Check for SQL injection
        if (detectSqlInjection(sanitized[field])) {
          errors[field] = 'Invalid characters detected';
          isValid = false;
        }
    }
    
    // Required field validation
    if (config.required && !sanitized[field]) {
      errors[field] = `${field} is required`;
      isValid = false;
    }
  });
  
  return {
    data: sanitized,
    errors,
    isValid
  };
};

export default {
  escapeHtml,
  removeScriptTags,
  sanitizeUserInput,
  sanitizeEmail,
  sanitizePhone,
  sanitizeSearchQuery,
  sanitizeUrl,
  sanitizeFileName,
  detectSqlInjection,
  sanitizeFormData
};