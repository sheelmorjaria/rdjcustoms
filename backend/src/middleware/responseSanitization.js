/**
 * API Response Sanitization Middleware
 * Sanitizes all outgoing API responses to prevent XSS and data leakage
 */

import { sanitizeUserInput, escapeHtml } from '../utils/sanitization.js';
import { logger } from '../utils/logger.js';

/**
 * Sanitize response data recursively
 */
const sanitizeResponseData = (data, options = {}) => {
  const {
    maxDepth = 10,
    currentDepth = 0,
    sanitizeHtml = true,
    preserveArrays = true,
    excludeFields = ['id', '_id', 'createdAt', 'updatedAt', 'password', 'token']
  } = options;

  // Prevent infinite recursion
  if (currentDepth >= maxDepth) {
    return data;
  }

  // Handle null/undefined
  if (data === null || data === undefined) {
    return data;
  }

  // Handle strings
  if (typeof data === 'string') {
    if (sanitizeHtml) {
      return sanitizeUserInput(data, { 
        allowHtml: false, 
        maxLength: 10000,
        removeScripts: true,
        escapeEntities: true 
      });
    }
    return escapeHtml(data);
  }

  // Handle numbers, booleans, dates
  if (typeof data === 'number' || typeof data === 'boolean' || data instanceof Date) {
    return data;
  }

  // Handle arrays
  if (Array.isArray(data)) {
    return data.map(item => 
      sanitizeResponseData(item, { 
        ...options, 
        currentDepth: currentDepth + 1 
      })
    );
  }

  // Handle objects
  if (typeof data === 'object') {
    const sanitized = {};
    
    for (const [key, value] of Object.entries(data)) {
      // Skip excluded fields for security
      if (excludeFields.includes(key)) {
        // For sensitive fields, either exclude or mask
        if (key === 'password') {
          continue; // Never include passwords
        } else if (key === 'token' && typeof value === 'string') {
          sanitized[key] = value.substring(0, 8) + '...'; // Mask tokens
        } else {
          sanitized[key] = value; // Keep other excluded fields as-is
        }
        continue;
      }

      // Sanitize the key name itself
      const sanitizedKey = sanitizeHtml ? escapeHtml(key) : key;
      
      // Recursively sanitize the value
      sanitized[sanitizedKey] = sanitizeResponseData(value, {
        ...options,
        currentDepth: currentDepth + 1
      });
    }
    
    return sanitized;
  }

  return data;
};

/**
 * Remove sensitive fields from response data
 */
const removeSensitiveFields = (data, sensitiveFields = [
  'password',
  'passwordHash',
  'salt',
  'privateKey',
  'secret',
  'apiKey',
  'sessionId',
  'refreshToken',
  'resetToken',
  'verificationToken'
]) => {
  if (!data || typeof data !== 'object') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(item => removeSensitiveFields(item, sensitiveFields));
  }

  const cleaned = { ...data };
  
  sensitiveFields.forEach(field => {
    if (field in cleaned) {
      delete cleaned[field];
    }
  });

  // Recursively clean nested objects
  Object.keys(cleaned).forEach(key => {
    if (cleaned[key] && typeof cleaned[key] === 'object') {
      cleaned[key] = removeSensitiveFields(cleaned[key], sensitiveFields);
    }
  });

  return cleaned;
};

/**
 * Sanitize error messages to prevent information disclosure
 */
const sanitizeErrorMessage = (error, isProduction = process.env.NODE_ENV === 'production') => {
  if (!error) return 'An error occurred';

  const message = error.message || 'An error occurred';
  
  // In production, use generic error messages for security
  if (isProduction) {
    const safeErrorMessages = {
      'ValidationError': 'Invalid input provided',
      'CastError': 'Invalid data format',
      'MongoError': 'Database operation failed',
      'JsonWebTokenError': 'Authentication failed',
      'TokenExpiredError': 'Session expired',
      'MulterError': 'File upload failed'
    };

    const errorType = error.constructor.name;
    return safeErrorMessages[errorType] || 'Internal server error';
  }

  // In development, sanitize but keep useful info
  return sanitizeUserInput(message, {
    allowHtml: false,
    maxLength: 500,
    removeScripts: true
  });
};

/**
 * Main response sanitization middleware
 */
export const responseSanitization = (options = {}) => {
  const {
    enabled = true,
    sanitizeErrors = true,
    removeSensitive = true,
    logSanitization = process.env.NODE_ENV === 'development'
  } = options;

  return (req, res, next) => {
    if (!enabled) {
      return next();
    }

    // Store original json method
    const originalJson = res.json;
    
    // Override res.json to sanitize responses
    res.json = function(data) {
      try {
        let sanitizedData = data;

        // Remove sensitive fields first
        if (removeSensitive) {
          sanitizedData = removeSensitiveFields(sanitizedData);
        }

        // Sanitize the response data
        sanitizedData = sanitizeResponseData(sanitizedData, {
          sanitizeHtml: true,
          maxDepth: 10,
          preserveArrays: true
        });

        // Handle error responses specifically
        if (sanitizeErrors && (res.statusCode >= 400 || sanitizedData.error)) {
          if (sanitizedData.error) {
            sanitizedData.error = sanitizeErrorMessage(sanitizedData.error);
          }
          if (sanitizedData.message) {
            sanitizedData.message = sanitizeErrorMessage({ message: sanitizedData.message });
          }
        }

        // Log sanitization in development
        if (logSanitization && data !== sanitizedData) {
          logger.debug('Response sanitized', {
            endpoint: req.path,
            method: req.method,
            originalDataType: typeof data,
            sanitizedDataType: typeof sanitizedData,
            hasChanges: JSON.stringify(data) !== JSON.stringify(sanitizedData)
          });
        }

        // Call original json method with sanitized data
        return originalJson.call(this, sanitizedData);
        
      } catch (sanitizationError) {
        logger.error('Response sanitization failed', {
          error: sanitizationError.message,
          endpoint: req.path,
          method: req.method,
          statusCode: res.statusCode
        });

        // Fallback to safe error response
        return originalJson.call(this, {
          error: 'Response processing failed',
          message: 'Unable to process response data safely'
        });
      }
    };

    next();
  };
};

/**
 * Specific sanitization for user data responses
 */
export const sanitizeUserResponse = (userData) => {
  if (!userData) return userData;

  // Create a clean user object without sensitive fields
  const safeUser = {
    id: userData.id || userData._id,
    email: userData.email ? escapeHtml(userData.email) : undefined,
    name: userData.name ? sanitizeUserInput(userData.name, { maxLength: 100 }) : undefined,
    role: userData.role ? escapeHtml(userData.role) : undefined,
    isActive: userData.isActive,
    lastLogin: userData.lastLogin,
    createdAt: userData.createdAt,
    updatedAt: userData.updatedAt,
    profile: userData.profile ? sanitizeResponseData(userData.profile) : undefined
  };

  // Remove undefined fields
  Object.keys(safeUser).forEach(key => {
    if (safeUser[key] === undefined) {
      delete safeUser[key];
    }
  });

  return safeUser;
};

/**
 * Specific sanitization for product data responses
 */
export const sanitizeProductResponse = (productData) => {
  if (!productData) return productData;

  return {
    id: productData.id || productData._id,
    name: productData.name ? sanitizeUserInput(productData.name, { maxLength: 200 }) : undefined,
    slug: productData.slug ? escapeHtml(productData.slug) : undefined,
    description: productData.description ? sanitizeUserInput(productData.description, { maxLength: 5000 }) : undefined,
    shortDescription: productData.shortDescription ? sanitizeUserInput(productData.shortDescription, { maxLength: 500 }) : undefined,
    price: productData.price,
    images: Array.isArray(productData.images) 
      ? productData.images.map(img => typeof img === 'string' ? escapeHtml(img) : img)
      : productData.images,
    category: productData.category ? sanitizeResponseData(productData.category) : undefined,
    stockStatus: productData.stockStatus ? escapeHtml(productData.stockStatus) : undefined,
    condition: productData.condition ? escapeHtml(productData.condition) : undefined,
    isActive: productData.isActive,
    createdAt: productData.createdAt,
    updatedAt: productData.updatedAt
  };
};

/**
 * Middleware specifically for API endpoints that need strict sanitization
 */
export const strictResponseSanitization = responseSanitization({
  enabled: true,
  sanitizeErrors: true,
  removeSensitive: true,
  logSanitization: true
});

/**
 * Content-Type validation middleware
 */
export const validateResponseContentType = (req, res, next) => {
  const originalJson = res.json;
  
  res.json = function(data) {
    // Ensure proper Content-Type for JSON responses
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    
    // Prevent content type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    return originalJson.call(this, data);
  };
  
  next();
};

export default {
  responseSanitization,
  strictResponseSanitization,
  sanitizeUserResponse,
  sanitizeProductResponse,
  validateResponseContentType,
  sanitizeErrorMessage,
  removeSensitiveFields
};