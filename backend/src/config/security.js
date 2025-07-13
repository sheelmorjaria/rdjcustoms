/**
 * Comprehensive security configuration for the RDJCustoms backend
 * Implements OWASP Top 10 protections and best practices
 */

import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import { inputSanitization, detectNoSqlInjection, sensitiveOperationLimiter as _sensitiveOperationLimiter } from '../middleware/inputSanitization.js';

/**
 * Security headers configuration using Helmet
 */
/**
 * Enhanced Content Security Policy configuration
 */
export const cspConfig = {
  directives: {
    defaultSrc: ['\'self\''],
    styleSrc: [
      '\'self\'', 
      '\'unsafe-inline\'', // Needed for dynamic styles
      'https://fonts.googleapis.com',
      'https://cdn.jsdelivr.net' // For any CDN stylesheets
    ],
    fontSrc: [
      '\'self\'', 
      'https://fonts.gstatic.com',
      'https://cdn.jsdelivr.net'
    ],
    imgSrc: [
      '\'self\'', 
      'data:', 
      'https:', // Allow HTTPS images
      'blob:', // For user uploaded images
      'https://www.paypal.com', // PayPal logos
      'https://www.paypalobjects.com'
    ],
    scriptSrc: [
      '\'self\'',
      '\'nonce-{{nonce}}\'', // Dynamic nonce for inline scripts
      'https://www.paypal.com',
      'https://www.paypalobjects.com',
      'https://js.paypal.com'
      // Add other trusted script sources as needed
    ],
    objectSrc: ['\'none\''],
    mediaSrc: ['\'self\'', 'blob:', 'data:'],
    frameSrc: [
      '\'none\'',
      'https://www.paypal.com', // PayPal checkout
      'https://www.sandbox.paypal.com'
    ],
    frameAncestors: ['\'none\''], // Prevent clickjacking
    connectSrc: [
      '\'self\'', 
      'https://api.paypal.com', 
      'https://api.sandbox.paypal.com',
      'https://api.coingecko.com', // Exchange rates
      'https://www.blockonomics.co', // Bitcoin service
      'https://globee.com', // Monero service
      'wss:', // WebSocket connections
      process.env.NODE_ENV === 'development' ? 'ws://localhost:*' : null
    ].filter(Boolean),
    baseUri: ['\'self\''],
    formAction: ['\'self\''],
    manifestSrc: ['\'self\''],
    workerSrc: ['\'self\'', 'blob:'],
    childSrc: ['\'self\''],
    upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
    blockAllMixedContent: process.env.NODE_ENV === 'production' ? [] : null,
    reportUri: '/api/csp-report' // CSP violation reporting
  },
  reportOnly: process.env.NODE_ENV === 'development' // Report-only in dev
};

export const securityHeaders = helmet({
  contentSecurityPolicy: cspConfig,
  crossOriginEmbedderPolicy: false, // Allow embedding for PayPal
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  frameguard: { action: 'deny' },
  xssFilter: true,
  referrerPolicy: { policy: 'same-origin' },
  permittedCrossDomainPolicies: false,
  dnsPrefetchControl: { allow: false },
  ieNoOpen: true,
  hidePoweredBy: true
});

/**
 * Rate limiting configurations for different endpoints
 */
export const rateLimiters = {
  // General API rate limiting
  general: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Limit each IP to 1000 requests per windowMs
    message: {
      error: 'Too many requests',
      message: 'Rate limit exceeded, please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        error: 'Rate limit exceeded',
        message: 'Too many requests from this IP, please try again later.',
        retryAfter: Math.round(req.rateLimit.resetTime / 1000)
      });
    }
  }),

  // Strict rate limiting for authentication endpoints
  auth: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 login attempts per windowMs
    message: {
      error: 'Too many authentication attempts',
      message: 'Account temporarily locked due to too many failed attempts'
    },
    skipSuccessfulRequests: true,
    handler: (req, res) => {
      res.status(429).json({
        error: 'Authentication rate limit exceeded',
        message: 'Too many login attempts. Please try again later.',
        retryAfter: Math.round(req.rateLimit.resetTime / 1000),
        lockoutTime: 15 // minutes
      });
    }
  }),

  // Rate limiting for password reset
  passwordReset: rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // Limit each IP to 3 password reset attempts per hour
    message: {
      error: 'Too many password reset attempts',
      message: 'Please wait before requesting another password reset'
    }
  }),

  // Rate limiting for webhook endpoints
  webhooks: rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 100, // Allow more requests for webhooks
    message: {
      error: 'Webhook rate limit exceeded',
      message: 'Too many webhook requests'
    }
  }),

  // Rate limiting for search endpoints
  search: rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 50, // 50 searches per minute
    message: {
      error: 'Search rate limit exceeded',
      message: 'Too many search requests'
    }
  })
};

/**
 * CORS configuration
 */
export const corsConfig = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      'http://localhost:3000',
      'http://localhost:5173',
      'https://rdjcustoms.vercel.app'
    ].filter(Boolean);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-CSRF-Token'
  ],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count']
};

/**
 * MongoDB sanitization configuration
 */
export const mongoSanitizeConfig = mongoSanitize({
  replaceWith: '_', // Replace prohibited characters with underscore
  onSanitize: ({ req, key }) => {
    console.warn(`NoSQL injection attempt detected: ${key} from ${req.ip}`);
  }
});

/**
 * HTTP Parameter Pollution (HPP) protection
 */
export const hppProtection = hpp({
  whitelist: ['tags', 'categories'] // Allow arrays for these parameters
});

/**
 * File upload security configuration
 */
export const fileUploadSecurity = {
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 10, // Maximum 10 files
    fields: 20, // Maximum 20 form fields
    parts: 30 // Maximum 30 parts
  },
  allowedMimeTypes: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml'
  ],
  fileFilter: (req, file, cb) => {
    // Check file type
    if (!fileUploadSecurity.allowedMimeTypes.includes(file.mimetype)) {
      return cb(new Error('Invalid file type'), false);
    }

    // Check filename for security
    if (file.originalname.includes('../') || file.originalname.includes('..\\')) {
      return cb(new Error('Invalid filename'), false);
    }

    // Check for executable extensions
    const dangerousExtensions = ['.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js'];
    const hasExt = dangerousExtensions.some(ext => file.originalname.toLowerCase().endsWith(ext));
    if (hasExt) {
      return cb(new Error('Dangerous file extension'), false);
    }

    cb(null, true);
  }
};

/**
 * JWT security configuration
 */
export const jwtSecurity = {
  accessTokenExpiry: '1h',
  refreshTokenExpiry: '7d',
  issuer: 'rdjcustoms.com',
  audience: 'rdjcustoms-users',
  algorithm: 'HS256',
  
  // Token validation options
  verifyOptions: {
    issuer: 'rdjcustoms.com',
    audience: 'rdjcustoms-users',
    algorithm: ['HS256'],
    maxAge: '1h'
  }
};

/**
 * Session security configuration
 */
export const sessionSecurity = {
  name: 'rdjcustoms.sid', // Don't use default session name
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  rolling: true, // Reset expiry on activity
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    httpOnly: true, // Prevent XSS
    maxAge: 30 * 60 * 1000, // 30 minutes
    sameSite: 'strict' // CSRF protection
  }
};

/**
 * Password security requirements
 */
export const passwordSecurity = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  preventCommonPasswords: true,
  preventUserInfo: true, // Don't allow password to contain user info
  
  // Bcrypt configuration
  saltRounds: 12,
  
  // Password validation regex
  pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,128}$/
};

/**
 * Account lockout configuration
 */
export const accountLockout = {
  maxAttempts: 5,
  lockoutDuration: 15 * 60 * 1000, // 15 minutes
  progressiveDelay: true, // Increase delay with each failed attempt
  trackByIp: true,
  trackByEmail: true
};

/**
 * API versioning security
 */
export const apiVersioning = {
  supportedVersions: ['v1'],
  defaultVersion: 'v1',
  deprecationWarning: true,
  strictVersioning: true
};

/**
 * Webhook security configuration
 */
export const webhookSecurity = {
  maxPayloadSize: '1mb',
  timestampTolerance: 5 * 60 * 1000, // 5 minutes
  verifySignatures: true,
  allowedIPs: {
    paypal: [
      '173.0.80.0/20',
      '64.4.240.0/20'
    ],
    globee: [
      // Add GloBee IP ranges
    ]
  }
};

/**
 * Security monitoring configuration
 */
export const securityMonitoring = {
  logSecurityEvents: true,
  alertOnSuspiciousActivity: true,
  trackFailedLogins: true,
  trackIpReputation: true,
  
  suspiciousActivityThresholds: {
    failedLoginsPerHour: 10,
    requestsPerMinute: 100,
    uniqueIpsPerUser: 5
  }
};

/**
 * Content validation rules
 */
export const contentValidation = {
  maxFieldLength: {
    name: 100,
    email: 254,
    description: 5000,
    address: 200,
    phone: 20,
    message: 2000
  },
  
  allowedHtmlTags: [], // No HTML allowed by default
  
  // Regular expressions for validation
  patterns: {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    phone: /^[\+]?[1-9][\d\s\-\(\)]{7,14}$/,
    postcode: /^[A-Z]{1,2}[0-9]{1,2}\s?[0-9][A-Z]{2}$/i, // UK postcode
    url: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/
  }
};

/**
 * Error handling security
 */
export const errorSecurity = {
  hideStackTrace: process.env.NODE_ENV === 'production',
  sanitizeErrorMessages: true,
  logAllErrors: true,
  preventInfoDisclosure: true,
  
  // Safe error messages for production
  safeErrorMessages: {
    validation: 'Invalid input provided',
    authentication: 'Authentication failed',
    authorization: 'Access denied',
    notFound: 'Resource not found',
    serverError: 'Internal server error',
    rateLimit: 'Rate limit exceeded'
  }
};

/**
 * Complete security middleware stack
 */
export const securityMiddleware = [
  securityHeaders,
  rateLimiters.general,
  mongoSanitizeConfig,
  hppProtection,
  inputSanitization(),
  detectNoSqlInjection
];

/**
 * Security validation functions
 */
export const securityValidators = {
  validateEmail: (email) => {
    return contentValidation.patterns.email.test(email) && 
           email.length <= contentValidation.maxFieldLength.email;
  },
  
  validatePassword: (password) => {
    return passwordSecurity.pattern.test(password) &&
           password.length >= passwordSecurity.minLength &&
           password.length <= passwordSecurity.maxLength;
  },
  
  validateUrl: (url) => {
    return contentValidation.patterns.url.test(url) &&
           !url.includes('javascript:') &&
           !url.includes('vbscript:') &&
           !url.includes('data:');
  },
  
  sanitizeInput: (input, maxLength = 1000) => {
    if (typeof input !== 'string') return input;
    
    return input
      .trim()
      .substring(0, maxLength)
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/vbscript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  }
};

export default {
  headers: securityHeaders,
  rateLimiters,
  cors: corsConfig,
  mongoSanitize: mongoSanitizeConfig,
  hpp: hppProtection,
  fileUpload: fileUploadSecurity,
  jwt: jwtSecurity,
  session: sessionSecurity,
  password: passwordSecurity,
  lockout: accountLockout,
  versioning: apiVersioning,
  webhooks: webhookSecurity,
  monitoring: securityMonitoring,
  content: contentValidation,
  errors: errorSecurity,
  middleware: securityMiddleware,
  validators: securityValidators
};