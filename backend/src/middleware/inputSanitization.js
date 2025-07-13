import xss from 'xss';
import mongoSanitize from 'express-mongo-sanitize';
import validator from 'validator';

/**
 * Comprehensive input sanitization middleware for Express.js
 * Provides protection against XSS, NoSQL injection, and other common attacks
 */

/**
 * XSS protection options configuration
 */
const xssOptions = {
  whiteList: {
    // Allow minimal safe HTML tags for specific use cases
    p: [],
    br: [],
    strong: [],
    em: [],
    b: [],
    i: []
  },
  stripIgnoreTag: true,
  stripIgnoreTagBody: ['script', 'style'],
  allowCommentTag: false,
  css: false // Disable CSS to prevent style-based attacks
};

/**
 * Recursively sanitize object properties
 * @param {any} obj - Object to sanitize
 * @param {Object} options - Sanitization options
 * @returns {any} - Sanitized object
 */
const sanitizeObject = (obj, options = {}) => {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {
    let sanitized = obj;

    // XSS protection
    if (options.xss !== false) {
      sanitized = xss(sanitized, xssOptions);
    }

    // Trim whitespace
    if (options.trim !== false) {
      sanitized = sanitized.trim();
    }

    // Length limits
    if (options.maxLength && sanitized.length > options.maxLength) {
      sanitized = sanitized.substring(0, options.maxLength);
    }

    // Remove null bytes
    sanitized = sanitized.replace(/\0/g, '');

    return sanitized;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item, options));
  }

  if (typeof obj === 'object') {
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      // Sanitize the key as well
      const sanitizedKey = sanitizeObject(key, { ...options, maxLength: 100 });
      sanitized[sanitizedKey] = sanitizeObject(value, options);
    }
    return sanitized;
  }

  return obj;
};

/**
 * Input sanitization middleware
 * @param {Object} options - Sanitization options
 * @returns {Function} Express middleware function
 */
export const inputSanitization = (options = {}) => {
  const defaultOptions = {
    xss: true,
    trim: true,
    maxLength: 10000,
    skipPaths: ['/api/webhooks'], // Skip webhook endpoints that need raw data
    ...options
  };

  return (req, res, next) => {
    // Skip sanitization for certain paths
    if (defaultOptions.skipPaths.some(path => req.path.startsWith(path))) {
      return next();
    }

    try {
      // Sanitize request body
      if (req.body && typeof req.body === 'object') {
        req.body = sanitizeObject(req.body, defaultOptions);
      }

      // Sanitize query parameters
      if (req.query && typeof req.query === 'object') {
        req.query = sanitizeObject(req.query, defaultOptions);
      }

      // Sanitize URL parameters
      if (req.params && typeof req.params === 'object') {
        req.params = sanitizeObject(req.params, defaultOptions);
      }

      next();
    } catch (error) {
      console.error('Input sanitization error:', error);
      return res.status(400).json({
        error: 'Invalid input data',
        message: 'Request contains malformed or dangerous content'
      });
    }
  };
};

/**
 * SQL injection pattern detection
 * @param {string} input - Input to check
 * @returns {boolean} - True if SQL injection pattern detected
 */
export const detectSqlInjection = (input) => {
  if (typeof input !== 'string') {
    return false;
  }

  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|CREATE|ALTER|EXEC|EXECUTE)\b)/i,
    /(--|#|\/\*|\*\/)/,
    /('|"|;|\\)/,
    /(OR|AND)\s+\d+\s*=\s*\d+/i,
    /(\bUNION\b.*\bSELECT\b)/i,
    /(\bDROP\b.*\bTABLE\b)/i
  ];

  return sqlPatterns.some(pattern => pattern.test(input));
};

/**
 * NoSQL injection detection middleware
 */
export const detectNoSqlInjection = (req, res, next) => {
  const checkObject = (obj, path = '') => {
    if (obj === null || obj === undefined) {
      return false;
    }

    if (typeof obj === 'object') {
      for (const [key, value] of Object.entries(obj)) {
        // Check for MongoDB operators
        if (key.startsWith('$')) {
          console.warn(`Potential NoSQL injection detected at ${path}.${key}`);
          return true;
        }

        // Check for regex injection
        if (value && typeof value === 'object' && value.constructor === RegExp) {
          console.warn(`Regex injection attempt detected at ${path}.${key}`);
          return true;
        }

        // Recursively check nested objects
        if (checkObject(value, `${path}.${key}`)) {
          return true;
        }
      }
    }

    return false;
  };

  try {
    // Check body, query, and params for NoSQL injection
    const hasInjection = [req.body, req.query, req.params]
      .some((obj, index) => {
        const location = ['body', 'query', 'params'][index];
        return checkObject(obj, location);
      });

    if (hasInjection) {
      return res.status(400).json({
        error: 'Invalid request format',
        message: 'Request contains potentially dangerous operators'
      });
    }

    next();
  } catch (error) {
    console.error('NoSQL injection detection error:', error);
    return res.status(400).json({
      error: 'Request validation failed',
      message: 'Unable to process request format'
    });
  }
};

/**
 * Email validation middleware
 */
export const validateEmail = (field = 'email') => (req, res, next) => {
  const email = req.body[field];

  if (!email) {
    return res.status(400).json({
      error: 'Validation failed',
      message: `${field} is required`
    });
  }

  if (!validator.isEmail(email)) {
    return res.status(400).json({
      error: 'Validation failed',
      message: `Invalid ${field} format`
    });
  }

  // Additional security checks
  if (email.length > 254 || detectSqlInjection(email)) {
    return res.status(400).json({
      error: 'Validation failed',
      message: `Invalid ${field} format`
    });
  }

  // Normalize email
  req.body[field] = validator.normalizeEmail(email);
  next();
};

/**
 * Password strength validation middleware
 */
export const validatePasswordStrength = (field = 'password') => (req, res, next) => {
  const password = req.body[field];

  if (!password) {
    return res.status(400).json({
      error: 'Validation failed',
      message: `${field} is required`
    });
  }

  // Password strength requirements
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const requirements = [];
  if (password.length < minLength) {
    requirements.push(`at least ${minLength} characters`);
  }
  if (!hasUpperCase) {
    requirements.push('an uppercase letter');
  }
  if (!hasLowerCase) {
    requirements.push('a lowercase letter');
  }
  if (!hasNumbers) {
    requirements.push('a number');
  }
  if (!hasSpecialChar) {
    requirements.push('a special character');
  }

  if (requirements.length > 0) {
    return res.status(400).json({
      error: 'Weak password',
      message: `Password must contain ${requirements.join(', ')}`
    });
  }

  next();
};

/**
 * URL validation middleware
 */
export const validateUrl = (field = 'url') => (req, res, next) => {
  const url = req.body[field];

  if (!url) {
    return next(); // URL might be optional
  }

  if (!validator.isURL(url, {
    protocols: ['http', 'https'],
    require_protocol: true,
    require_host: true,
    require_valid_protocol: true,
    allow_underscores: false,
    allow_trailing_dot: false,
    allow_protocol_relative_urls: false
  })) {
    return res.status(400).json({
      error: 'Validation failed',
      message: `Invalid ${field} format`
    });
  }

  // Additional security checks
  if (url.includes('javascript:') || url.includes('vbscript:') || url.includes('data:')) {
    return res.status(400).json({
      error: 'Validation failed',
      message: `Unsafe ${field} protocol`
    });
  }

  next();
};

/**
 * File upload validation middleware
 */
export const validateFileUpload = (options = {}) => (req, res, next) => {
  const {
    allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    maxFileSize = 5 * 1024 * 1024, // 5MB
    maxFiles = 10
  } = options;

  if (!req.files || req.files.length === 0) {
    return next(); // No files to validate
  }

  const files = Array.isArray(req.files) ? req.files : [req.files];

  if (files.length > maxFiles) {
    return res.status(400).json({
      error: 'Too many files',
      message: `Maximum ${maxFiles} files allowed`
    });
  }

  for (const file of files) {
    // Check file size
    if (file.size > maxFileSize) {
      return res.status(400).json({
        error: 'File too large',
        message: `File size must be less than ${maxFileSize / (1024 * 1024)}MB`
      });
    }

    // Check MIME type
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return res.status(400).json({
        error: 'Invalid file type',
        message: `Allowed types: ${allowedMimeTypes.join(', ')}`
      });
    }

    // Check filename for security
    const filename = file.originalname || file.name;
    if (filename && (filename.includes('../') || filename.includes('..\\'))) {
      return res.status(400).json({
        error: 'Invalid filename',
        message: 'Filename contains illegal characters'
      });
    }
  }

  next();
};

/**
 * Rate limiting for sensitive operations
 */
export const sensitiveOperationLimiter = (options = {}) => {
  const requests = new Map();
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    maxAttempts = 5,
    message = 'Too many attempts, please try again later'
  } = options;

  return (req, res, next) => {
    const key = req.ip + ':' + req.path;
    const now = Date.now();
    
    // Clean old entries
    for (const [k, data] of requests.entries()) {
      if (now - data.firstAttempt > windowMs) {
        requests.delete(k);
      }
    }

    const requestData = requests.get(key) || { count: 0, firstAttempt: now };
    
    if (requestData.count >= maxAttempts) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message,
        retryAfter: Math.ceil((requestData.firstAttempt + windowMs - now) / 1000)
      });
    }

    requestData.count++;
    if (requestData.count === 1) {
      requestData.firstAttempt = now;
    }
    
    requests.set(key, requestData);
    next();
  };
};

// Apply MongoDB sanitization as default export
export default mongoSanitize();