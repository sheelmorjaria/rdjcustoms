/**
 * Backend sanitization utilities for XSS prevention and data cleaning
 * Mirrors and extends frontend sanitization functionality
 */

/**
 * Escape HTML characters to prevent XSS
 */
export const escapeHtml = (str) => {
  if (typeof str !== 'string') {
    return str;
  }

  const htmlEscapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    '\'': '&#x27;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;'
  };

  return str.replace(/[&<>"'`=/]/g, (match) => htmlEscapeMap[match]);
};

/**
 * Remove script tags and dangerous content
 */
export const removeScriptTags = (str) => {
  if (typeof str !== 'string') {
    return str;
  }

  return str
    // Remove script tags and content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove javascript: protocol
    .replace(/javascript:/gi, '')
    // Remove vbscript: protocol
    .replace(/vbscript:/gi, '')
    // Remove data: protocol for HTML content
    .replace(/data:text\/html/gi, '')
    // Remove on* event handlers
    .replace(/\s*on\w+\s*=/gi, '')
    // Remove style attributes that could contain expressions
    .replace(/style\s*=\s*["'][^"']*expression\([^"']*["']/gi, '');
};

/**
 * Sanitize user input with comprehensive protection
 */
export const sanitizeUserInput = (input, options = {}) => {
  if (!input || typeof input !== 'string') {
    return input === 0 ? 0 : (input || '');
  }

  const {
    allowHtml = false,
    maxLength = 1000,
    removeScripts = true,
    escapeEntities = true,
    trimWhitespace = true,
    removeControlChars = true
  } = options;

  let sanitized = input;

  // Trim whitespace
  if (trimWhitespace) {
    sanitized = sanitized.trim();
  }

  // Remove control characters (except newlines and tabs for text areas)
  if (removeControlChars) {
    sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  }

  // Apply length limit
  if (maxLength && sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  // Escape HTML entities first if HTML is not allowed
  if (!allowHtml && escapeEntities) {
    sanitized = escapeHtml(sanitized);
  }

  // Remove scripts and dangerous content after escaping
  if (removeScripts) {
    sanitized = removeScriptTags(sanitized);
  }

  // Additional XSS prevention patterns
  sanitized = sanitized
    // Remove null bytes
    .replace(/\0/g, '')
    // Remove potentially dangerous protocols
    .replace(/(javascript|vbscript|data|file|about):/gi, '')
    // Remove CSS expressions
    .replace(/expression\s*\(/gi, '')
    // Remove import statements
    .replace(/@import/gi, '');

  return sanitized;
};

/**
 * Sanitize email addresses
 */
export const sanitizeEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return '';
  }

  return email
    .trim()
    .toLowerCase()
    .substring(0, 254) // RFC 5321 limit
    .replace(/[^a-zA-Z0-9@._+-]/g, ''); // Allow only valid email characters
};

/**
 * Sanitize phone numbers
 */
export const sanitizePhone = (phone) => {
  if (!phone || typeof phone !== 'string') {
    return '';
  }

  return phone
    .trim()
    .substring(0, 20)
    .replace(/[^0-9+\-\s()]/g, ''); // Allow only valid phone characters
};

/**
 * Sanitize URLs
 */
export const sanitizeUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return '';
  }

  // Remove dangerous protocols
  const cleanUrl = url
    .trim()
    .replace(/^(javascript|vbscript|data|file):/gi, 'http:');

  // Validate URL format
  try {
    const urlObj = new URL(cleanUrl);
    
    // Only allow http and https
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return '';
    }
    
    return urlObj.toString().substring(0, 2048); // Reasonable URL length limit
  } catch (error) {
    return '';
  }
};

/**
 * Sanitize MongoDB queries to prevent NoSQL injection
 */
export const sanitizeMongoQuery = (query) => {
  if (!query || typeof query !== 'object') {
    return query;
  }

  // Convert to JSON and back to remove functions and other dangerous content
  try {
    const jsonString = JSON.stringify(query);
    // const parsed = JSON.parse(jsonString);
    
    // Remove dangerous operators
    const dangerousOperators = ['$where', '$regex', '$expr'];
    
    const sanitized = JSON.parse(jsonString, (key, value) => {
      if (dangerousOperators.includes(key)) {
        return undefined;
      }
      
      if (typeof value === 'string') {
        return sanitizeUserInput(value, { allowHtml: false, maxLength: 1000 });
      }
      
      return value;
    });
    
    return sanitized;
  } catch (error) {
    return {};
  }
};

/**
 * Sanitize file names
 */
export const sanitizeFileName = (fileName) => {
  if (!fileName || typeof fileName !== 'string') {
    return 'untitled';
  }

  return fileName
    .trim()
    .substring(0, 255) // Max filename length
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace invalid characters
    .replace(/^\.+/, '') // Remove leading dots
    .replace(/\.+$/, '') // Remove trailing dots
    .replace(/_{2,}/g, '_') // Replace multiple underscores
    || 'untitled'; // Fallback if empty
};

/**
 * Sanitize JSON data recursively
 */
export const sanitizeJson = (data, options = {}) => {
  const { maxDepth = 10, currentDepth = 0 } = options;

  if (currentDepth >= maxDepth) {
    return null;
  }

  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data === 'string') {
    return sanitizeUserInput(data, options);
  }

  if (typeof data === 'number' || typeof data === 'boolean') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(item => 
      sanitizeJson(item, { ...options, currentDepth: currentDepth + 1 })
    );
  }

  if (typeof data === 'object') {
    const sanitized = {};
    
    Object.keys(data).forEach(key => {
      const sanitizedKey = sanitizeUserInput(key, { 
        allowHtml: false, 
        maxLength: 100 
      });
      
      sanitized[sanitizedKey] = sanitizeJson(
        data[key], 
        { ...options, currentDepth: currentDepth + 1 }
      );
    });
    
    return sanitized;
  }

  return data;
};

/**
 * Advanced XSS payload detection
 */
export const detectXSSPayload = (input) => {
  if (!input || typeof input !== 'string') {
    return false;
  }

  const xssPatterns = [
    /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
    /<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi,
    /javascript:/gi,
    /vbscript:/gi,
    /on\w+\s*=/gi,
    /<img[^>]*src[\s]*=[\s]*["\'][\s]*javascript:/gi,
    /<svg[\s\S]*?onload[\s\S]*?>/gi,
    /expression\s*\(/gi,
    /<object[\s\S]*?>[\s\S]*?<\/object>/gi,
    /<embed[\s\S]*?>/gi,
    /<link[\s\S]*?href[\s]*=[\s]*["\'][\s]*javascript:/gi
  ];

  return xssPatterns.some(pattern => pattern.test(input));
};

/**
 * SQL injection pattern detection
 */
export const detectSQLInjection = (input) => {
  if (!input || typeof input !== 'string') {
    return false;
  }

  const sqlPatterns = [
    /(\b(ALTER|CREATE|DELETE|DROP|EXEC(UTE)?|INSERT|SELECT|UNION|UPDATE)\b)/gi,
    /(\b(OR|AND)\b[\s]*[\d\w]*[\s]*=[\s]*[\d\w]*)/gi,
    /(;[\s]*DROP[\s]+TABLE)/gi,
    /(;[\s]*SHUTDOWN)/gi,
    /('[\s]*OR[\s]*'[^']*'[\s]*=[\s]*'[^']*')/gi,
    /(1[\s]*=[\s]*1)/gi,
    /(-{2,})/g, // SQL comments
    /\/\*[\s\S]*?\*\//g // Multi-line comments
  ];

  return sqlPatterns.some(pattern => pattern.test(input));
};

/**
 * Path traversal detection
 */
export const detectPathTraversal = (input) => {
  if (!input || typeof input !== 'string') {
    return false;
  }

  const pathTraversalPatterns = [
    /\.\.[\/\\]/g,
    /%2e%2e[\/\\]/gi,
    /\.{2,}[\/\\]/g,
    /[\/\\]\.{2,}[\/\\]/g,
    /%252e%252e/gi
  ];

  return pathTraversalPatterns.some(pattern => pattern.test(input));
};

/**
 * Comprehensive input validation
 */
export const validateAndSanitizeInput = (input, type = 'text', options = {}) => {
  const sanitized = sanitizeUserInput(input, options);
  
  const validation = {
    isValid: true,
    sanitized,
    threats: []
  };

  // Check for threats
  if (detectXSSPayload(input)) {
    validation.threats.push('XSS');
  }
  
  if (detectSQLInjection(input)) {
    validation.threats.push('SQL_INJECTION');
  }
  
  if (detectPathTraversal(input)) {
    validation.threats.push('PATH_TRAVERSAL');
  }

  // Type-specific validation
  switch (type) {
  case 'email':
    validation.sanitized = sanitizeEmail(sanitized);
    validation.isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(validation.sanitized);
    break;
      
  case 'url':
    validation.sanitized = sanitizeUrl(sanitized);
    validation.isValid = validation.sanitized.length > 0;
    break;
      
  case 'phone':
    validation.sanitized = sanitizePhone(sanitized);
    validation.isValid = /^[\+]?[1-9][\d\s\-\(\)]{7,14}$/.test(validation.sanitized);
    break;
      
  case 'filename':
    validation.sanitized = sanitizeFileName(sanitized);
    validation.isValid = validation.sanitized !== 'untitled';
    break;
  }

  // Mark as invalid if threats were detected
  if (validation.threats.length > 0) {
    validation.isValid = false;
  }

  return validation;
};

export default {
  escapeHtml,
  removeScriptTags,
  sanitizeUserInput,
  sanitizeEmail,
  sanitizePhone,
  sanitizeUrl,
  sanitizeFileName,
  sanitizeMongoQuery,
  sanitizeJson,
  detectXSSPayload,
  detectSQLInjection,
  detectPathTraversal,
  validateAndSanitizeInput
};