/**
 * Content Security Policy middleware with dynamic nonce generation
 * and violation reporting for enhanced XSS protection
 */

import crypto from 'crypto';
import { logger } from '../utils/logger.js';

/**
 * Generate a cryptographically secure nonce for CSP
 */
export const generateNonce = () => {
  return crypto.randomBytes(16).toString('base64');
};

/**
 * CSP nonce middleware - adds a unique nonce for each request
 */
export const cspNonce = (req, res, next) => {
  // Generate a unique nonce for this request
  const nonce = generateNonce();
  
  // Store nonce in res.locals for template access
  res.locals.nonce = nonce;
  
  // Store nonce in request for middleware access
  req.nonce = nonce;
  
  next();
};

/**
 * Dynamic CSP header middleware that uses the generated nonce
 */
export const dynamicCSP = (req, res, next) => {
  const nonce = req.nonce || generateNonce();
  
  // Build CSP header with dynamic nonce
  const cspDirectives = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' https://www.paypal.com https://www.paypalobjects.com https://js.paypal.com`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net",
    "font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net",
    "img-src 'self' data: https: blob: https://www.paypal.com https://www.paypalobjects.com",
    "object-src 'none'",
    "media-src 'self' blob: data:",
    "frame-src 'none' https://www.paypal.com https://www.sandbox.paypal.com",
    "frame-ancestors 'none'",
    "connect-src 'self' https://api.paypal.com https://api.sandbox.paypal.com https://api.coingecko.com https://www.blockonomics.co https://globee.com wss:",
    "base-uri 'self'",
    "form-action 'self'",
    "manifest-src 'self'",
    "worker-src 'self' blob:",
    "child-src 'self'",
    "report-uri /api/csp-report"
  ];
  
  // Add production-only directives
  if (process.env.NODE_ENV === 'production') {
    cspDirectives.push("upgrade-insecure-requests");
    cspDirectives.push("block-all-mixed-content");
  }
  
  const cspHeader = cspDirectives.join('; ');
  
  // Use report-only mode in development
  const headerName = process.env.NODE_ENV === 'development' 
    ? 'Content-Security-Policy-Report-Only' 
    : 'Content-Security-Policy';
  
  res.setHeader(headerName, cspHeader);
  
  next();
};

/**
 * CSP violation reporting endpoint handler
 */
export const handleCSPViolation = (req, res) => {
  try {
    const violation = req.body;
    
    // Log the violation
    logger.warn('CSP Violation detected', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      violation: {
        documentUri: violation['document-uri'],
        referrer: violation.referrer,
        violatedDirective: violation['violated-directive'],
        effectiveDirective: violation['effective-directive'],
        originalPolicy: violation['original-policy'],
        disposition: violation.disposition,
        blockedUri: violation['blocked-uri'],
        lineNumber: violation['line-number'],
        columnNumber: violation['column-number'],
        sourceFile: violation['source-file'],
        statusCode: violation['status-code'],
        scriptSample: violation['script-sample']
      },
      timestamp: new Date().toISOString()
    });
    
    // Store violation for security monitoring
    if (process.env.NODE_ENV === 'production') {
      // In production, you might want to store violations in a database
      // or send to a security monitoring service
      storeCSPViolation(violation, req);
    }
    
    // Respond with 204 No Content (standard for CSP reports)
    res.status(204).end();
    
  } catch (error) {
    logger.error('Error processing CSP violation report', {
      error: error.message,
      stack: error.stack
    });
    res.status(400).json({ error: 'Invalid CSP report' });
  }
};

/**
 * Store CSP violation for security analysis
 */
const storeCSPViolation = async (violation, req) => {
  try {
    // This could be enhanced to store in MongoDB or send to external service
    const violationRecord = {
      timestamp: new Date(),
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      documentUri: violation['document-uri'],
      violatedDirective: violation['violated-directive'],
      blockedUri: violation['blocked-uri'],
      disposition: violation.disposition,
      sourceFile: violation['source-file'],
      lineNumber: violation['line-number'],
      scriptSample: violation['script-sample']
    };
    
    // Log for immediate analysis
    logger.security('CSP violation stored', violationRecord);
    
    // TODO: Implement database storage or external service integration
    // Example: await CSPViolation.create(violationRecord);
    
  } catch (error) {
    logger.error('Failed to store CSP violation', {
      error: error.message,
      violation
    });
  }
};

/**
 * Middleware to add CSP nonce to template context
 */
export const addNonceToTemplates = (req, res, next) => {
  const originalRender = res.render;
  
  res.render = function(view, options, callback) {
    // Add nonce to template variables
    const templateData = {
      ...options,
      nonce: req.nonce || res.locals.nonce
    };
    
    return originalRender.call(this, view, templateData, callback);
  };
  
  next();
};

/**
 * Security headers specifically for API endpoints
 */
export const apiSecurityHeaders = (req, res, next) => {
  // Prevent caching of sensitive API responses
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
  
  // Additional security headers for APIs
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Prevent MIME type sniffing
  res.setHeader('X-Download-Options', 'noopen');
  
  next();
};

/**
 * Enhanced CSP for different route types
 */
export const routeSpecificCSP = {
  /**
   * Strict CSP for admin routes
   */
  admin: (req, res, next) => {
    const nonce = req.nonce || generateNonce();
    
    const adminCSP = [
      "default-src 'self'",
      `script-src 'self' 'nonce-${nonce}'`, // No external scripts for admin
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data:",
      "object-src 'none'",
      "frame-src 'none'",
      "frame-ancestors 'none'",
      "connect-src 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests",
      "block-all-mixed-content"
    ].join('; ');
    
    res.setHeader('Content-Security-Policy', adminCSP);
    next();
  },
  
  /**
   * Payment-specific CSP allowing PayPal integration
   */
  payment: (req, res, next) => {
    const nonce = req.nonce || generateNonce();
    
    const paymentCSP = [
      "default-src 'self'",
      `script-src 'self' 'nonce-${nonce}' https://www.paypal.com https://www.paypalobjects.com https://js.paypal.com`,
      "style-src 'self' 'unsafe-inline' https://www.paypal.com",
      "img-src 'self' data: https://www.paypal.com https://www.paypalobjects.com",
      "frame-src https://www.paypal.com https://www.sandbox.paypal.com",
      "connect-src 'self' https://api.paypal.com https://api.sandbox.paypal.com",
      "form-action 'self' https://www.paypal.com",
      "object-src 'none'",
      "base-uri 'self'"
    ].join('; ');
    
    res.setHeader('Content-Security-Policy', paymentCSP);
    next();
  },
  
  /**
   * Public API CSP (most restrictive)
   */
  api: (req, res, next) => {
    const apiCSP = [
      "default-src 'none'",
      "script-src 'none'",
      "style-src 'none'",
      "img-src 'none'",
      "object-src 'none'",
      "frame-src 'none'",
      "frame-ancestors 'none'",
      "connect-src 'none'",
      "base-uri 'none'",
      "form-action 'none'"
    ].join('; ');
    
    res.setHeader('Content-Security-Policy', apiCSP);
    next();
  }
};

export default {
  cspNonce,
  dynamicCSP,
  handleCSPViolation,
  addNonceToTemplates,
  apiSecurityHeaders,
  routeSpecificCSP,
  generateNonce
};