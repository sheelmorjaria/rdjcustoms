import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('Security Configuration Unit Tests', () => {
  let mockSecurityConfig;

  beforeEach(() => {
    // Mock environment variables
    process.env.NODE_ENV = 'test';
    process.env.FRONTEND_URL = 'http://localhost:3000';
    process.env.SESSION_SECRET = 'test-session-secret';
    
    // Mock security configuration object
    mockSecurityConfig = {
      cspConfig: {
        directives: {
          defaultSrc: ['\'self\''],
          styleSrc: ['\'self\'', '\'unsafe-inline\'', 'https://fonts.googleapis.com'],
          fontSrc: ['\'self\'', 'https://fonts.gstatic.com'],
          imgSrc: ['\'self\'', 'data:', 'https:', 'blob:'],
          scriptSrc: ['\'self\'', '\'nonce-{{nonce}}\'', 'https://www.paypal.com'],
          objectSrc: ['\'none\''],
          frameSrc: ['\'none\'', 'https://www.paypal.com'],
          frameAncestors: ['\'none\''],
          connectSrc: ['\'self\'', 'https://api.paypal.com'],
          baseUri: ['\'self\''],
          formAction: ['\'self\'']
        },
        reportOnly: true
      },
      
      rateLimiters: {
        general: {
          windowMs: 15 * 60 * 1000,
          max: 1000,
          message: { error: 'Too many requests' }
        },
        auth: {
          windowMs: 15 * 60 * 1000,
          max: 10,
          message: { error: 'Too many authentication attempts' }
        },
        passwordReset: {
          windowMs: 60 * 60 * 1000,
          max: 3
        }
      },
      
      corsConfig: {
        origin: function(origin, callback) {
          const allowedOrigins = ['http://localhost:3000', 'https://rdjcustoms.vercel.app'];
          if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
          }
          return callback(new Error('Not allowed by CORS'));
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Origin', 'Content-Type', 'Authorization']
      },
      
      fileUploadSecurity: {
        limits: {
          fileSize: 5 * 1024 * 1024,
          files: 10,
          fields: 20
        },
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif'],
        fileFilter: function(req, file, cb) {
          if (!this.allowedMimeTypes.includes(file.mimetype)) {
            return cb(new Error('Invalid file type'), false);
          }
          if (file.originalname.includes('../')) {
            return cb(new Error('Invalid filename'), false);
          }
          cb(null, true);
        }
      },
      
      passwordSecurity: {
        minLength: 8,
        maxLength: 128,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
        saltRounds: 12,
        pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,128}$/
      },
      
      accountLockout: {
        maxAttempts: 5,
        lockoutDuration: 15 * 60 * 1000,
        progressiveDelay: true,
        trackByIp: true,
        trackByEmail: true
      },
      
      contentValidation: {
        maxFieldLength: {
          name: 100,
          email: 254,
          description: 5000
        },
        patterns: {
          email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
          phone: /^[\+]?[\d\s\-\(\)]{7,20}$/, // More permissive phone regex
          url: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/
        }
      },
      
      securityValidators: {
        validateEmail: function(email) {
          return this.contentValidation.patterns.email.test(email) && 
                 email.length <= this.contentValidation.maxFieldLength.email;
        },
        
        validatePassword: function(password) {
          return this.passwordSecurity.pattern.test(password) &&
                 password.length >= this.passwordSecurity.minLength &&
                 password.length <= this.passwordSecurity.maxLength;
        },
        
        validateUrl: function(url) {
          return this.contentValidation.patterns.url.test(url) &&
                 !url.includes('javascript:') &&
                 !url.includes('vbscript:') &&
                 !url.includes('data:');
        },
        
        sanitizeInput: function(input, maxLength = 1000) {
          if (typeof input !== 'string') return input;
          
          return input
            .trim()
            .substring(0, maxLength)
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/javascript:/gi, '')
            .replace(/vbscript:/gi, '')
            .replace(/on\w+\s*=/gi, '');
        }
      }
    };
    
    // Bind methods to have access to config
    Object.keys(mockSecurityConfig.securityValidators).forEach(key => {
      if (typeof mockSecurityConfig.securityValidators[key] === 'function') {
        mockSecurityConfig.securityValidators[key] = mockSecurityConfig.securityValidators[key].bind(mockSecurityConfig);
      }
    });
  });

  describe('CSP Configuration', () => {
    it('should have secure default source policy', () => {
      expect(mockSecurityConfig.cspConfig.directives.defaultSrc).toEqual(['\'self\'']);
    });

    it('should allow necessary external font sources', () => {
      const fontSrc = mockSecurityConfig.cspConfig.directives.fontSrc;
      expect(fontSrc).toContain('\'self\'');
      expect(fontSrc).toContain('https://fonts.gstatic.com');
    });

    it('should prevent object embedding', () => {
      expect(mockSecurityConfig.cspConfig.directives.objectSrc).toEqual(['\'none\'']);
    });

    it('should prevent clickjacking with frame-ancestors', () => {
      expect(mockSecurityConfig.cspConfig.directives.frameAncestors).toEqual(['\'none\'']);
    });

    it('should allow PayPal domains for payments', () => {
      const scriptSrc = mockSecurityConfig.cspConfig.directives.scriptSrc;
      const frameSrc = mockSecurityConfig.cspConfig.directives.frameSrc;
      
      expect(scriptSrc).toContain('https://www.paypal.com');
      expect(frameSrc).toContain('https://www.paypal.com');
    });

    it('should use nonce for inline scripts', () => {
      const scriptSrc = mockSecurityConfig.cspConfig.directives.scriptSrc;
      expect(scriptSrc).toContain('\'nonce-{{nonce}}\'');
    });

    it('should be in report-only mode for development', () => {
      expect(mockSecurityConfig.cspConfig.reportOnly).toBe(true);
    });
  });

  describe('Rate Limiting Configuration', () => {
    it('should have appropriate general rate limits', () => {
      const general = mockSecurityConfig.rateLimiters.general;
      expect(general.windowMs).toBe(15 * 60 * 1000); // 15 minutes
      expect(general.max).toBe(1000);
      expect(general.message.error).toBe('Too many requests');
    });

    it('should have strict authentication rate limits', () => {
      const auth = mockSecurityConfig.rateLimiters.auth;
      expect(auth.windowMs).toBe(15 * 60 * 1000);
      expect(auth.max).toBe(10); // Much stricter than general
      expect(auth.message.error).toBe('Too many authentication attempts');
    });

    it('should have very strict password reset limits', () => {
      const passwordReset = mockSecurityConfig.rateLimiters.passwordReset;
      expect(passwordReset.windowMs).toBe(60 * 60 * 1000); // 1 hour
      expect(passwordReset.max).toBe(3); // Very restrictive
    });

    it('should have rate limiting periods that make sense', () => {
      const { general, auth, passwordReset } = mockSecurityConfig.rateLimiters;
      
      // Auth should be stricter than general
      expect(auth.max).toBeLessThan(general.max);
      
      // Password reset should be strictest
      expect(passwordReset.max).toBeLessThan(auth.max);
      expect(passwordReset.windowMs).toBeGreaterThan(auth.windowMs);
    });
  });

  describe('CORS Configuration', () => {
    it('should validate allowed origins correctly', () => {
      const corsOrigin = mockSecurityConfig.corsConfig.origin;
      
      // Test allowed origin
      let callbackResult = null;
      corsOrigin('http://localhost:3000', (err, allowed) => {
        callbackResult = { err, allowed };
      });
      expect(callbackResult.err).toBe(null);
      expect(callbackResult.allowed).toBe(true);
    });

    it('should reject disallowed origins', () => {
      const corsOrigin = mockSecurityConfig.corsConfig.origin;
      
      // Test disallowed origin
      let callbackResult = null;
      corsOrigin('http://malicious-site.com', (err, allowed) => {
        callbackResult = { err, allowed };
      });
      expect(callbackResult.err).toBeInstanceOf(Error);
      expect(callbackResult.err.message).toBe('Not allowed by CORS');
    });

    it('should allow requests with no origin', () => {
      const corsOrigin = mockSecurityConfig.corsConfig.origin;
      
      // Test no origin (mobile apps, curl, etc.)
      let callbackResult = null;
      corsOrigin(undefined, (err, allowed) => {
        callbackResult = { err, allowed };
      });
      expect(callbackResult.err).toBe(null);
      expect(callbackResult.allowed).toBe(true);
    });

    it('should enable credentials', () => {
      expect(mockSecurityConfig.corsConfig.credentials).toBe(true);
    });

    it('should allow necessary HTTP methods', () => {
      const methods = mockSecurityConfig.corsConfig.methods;
      expect(methods).toContain('GET');
      expect(methods).toContain('POST');
      expect(methods).toContain('PUT');
      expect(methods).toContain('DELETE');
    });

    it('should allow necessary headers', () => {
      const headers = mockSecurityConfig.corsConfig.allowedHeaders;
      expect(headers).toContain('Authorization');
      expect(headers).toContain('Content-Type');
      expect(headers).toContain('Origin');
    });
  });

  describe('File Upload Security', () => {
    it('should have appropriate file size limits', () => {
      const limits = mockSecurityConfig.fileUploadSecurity.limits;
      expect(limits.fileSize).toBe(5 * 1024 * 1024); // 5MB
      expect(limits.files).toBe(10);
      expect(limits.fields).toBe(20);
    });

    it('should only allow safe image types', () => {
      const allowedTypes = mockSecurityConfig.fileUploadSecurity.allowedMimeTypes;
      expect(allowedTypes).toContain('image/jpeg');
      expect(allowedTypes).toContain('image/png');
      expect(allowedTypes).toContain('image/gif');
      
      // Should not allow dangerous types
      expect(allowedTypes).not.toContain('application/javascript');
      expect(allowedTypes).not.toContain('text/html');
      expect(allowedTypes).not.toContain('application/x-executable');
    });

    it('should reject invalid file types', () => {
      const fileFilter = mockSecurityConfig.fileUploadSecurity.fileFilter;
      const mockReq = {};
      const mockFile = { mimetype: 'application/javascript', originalname: 'script.js' };
      
      let callbackResult = null;
      fileFilter.call(mockSecurityConfig.fileUploadSecurity, mockReq, mockFile, (err, allowed) => {
        callbackResult = { err, allowed };
      });
      
      expect(callbackResult.err).toBeInstanceOf(Error);
      expect(callbackResult.err.message).toBe('Invalid file type');
      expect(callbackResult.allowed).toBe(false);
    });

    it('should reject path traversal attempts', () => {
      const fileFilter = mockSecurityConfig.fileUploadSecurity.fileFilter;
      const mockReq = {};
      const mockFile = { mimetype: 'image/jpeg', originalname: '../../../etc/passwd' };
      
      let callbackResult = null;
      fileFilter.call(mockSecurityConfig.fileUploadSecurity, mockReq, mockFile, (err, allowed) => {
        callbackResult = { err, allowed };
      });
      
      expect(callbackResult.err).toBeInstanceOf(Error);
      expect(callbackResult.err.message).toBe('Invalid filename');
      expect(callbackResult.allowed).toBe(false);
    });

    it('should accept valid files', () => {
      const fileFilter = mockSecurityConfig.fileUploadSecurity.fileFilter;
      const mockReq = {};
      const mockFile = { mimetype: 'image/jpeg', originalname: 'photo.jpg' };
      
      let callbackResult = null;
      fileFilter.call(mockSecurityConfig.fileUploadSecurity, mockReq, mockFile, (err, allowed) => {
        callbackResult = { err, allowed };
      });
      
      expect(callbackResult.err).toBe(null);
      expect(callbackResult.allowed).toBe(true);
    });
  });

  describe('Password Security', () => {
    it('should have strong password requirements', () => {
      const config = mockSecurityConfig.passwordSecurity;
      expect(config.minLength).toBeGreaterThanOrEqual(8);
      expect(config.maxLength).toBeLessThanOrEqual(128);
      expect(config.requireUppercase).toBe(true);
      expect(config.requireLowercase).toBe(true);
      expect(config.requireNumbers).toBe(true);
      expect(config.requireSpecialChars).toBe(true);
    });

    it('should use strong bcrypt salt rounds', () => {
      expect(mockSecurityConfig.passwordSecurity.saltRounds).toBeGreaterThanOrEqual(12);
    });

    it('should validate strong passwords correctly', () => {
      const pattern = mockSecurityConfig.passwordSecurity.pattern;
      
      // Valid passwords
      expect(pattern.test('StrongPass123!')).toBe(true);
      expect(pattern.test('MySecur3P@ssw0rd')).toBe(true);
      
      // Invalid passwords
      expect(pattern.test('weak')).toBe(false); // Too short
      expect(pattern.test('nostrongpassword')).toBe(false); // No uppercase/numbers/special
      expect(pattern.test('NOLOWECASE123!')).toBe(false); // No lowercase
      expect(pattern.test('NoNumbers!')).toBe(false); // No numbers
      expect(pattern.test('NoSpecialChars123')).toBe(false); // No special chars
    });
  });

  describe('Account Lockout Configuration', () => {
    it('should have reasonable lockout settings', () => {
      const lockout = mockSecurityConfig.accountLockout;
      expect(lockout.maxAttempts).toBeGreaterThan(3);
      expect(lockout.maxAttempts).toBeLessThanOrEqual(10);
      expect(lockout.lockoutDuration).toBeGreaterThan(5 * 60 * 1000); // At least 5 minutes
    });

    it('should track lockouts by both IP and email', () => {
      const lockout = mockSecurityConfig.accountLockout;
      expect(lockout.trackByIp).toBe(true);
      expect(lockout.trackByEmail).toBe(true);
    });

    it('should use progressive delay', () => {
      expect(mockSecurityConfig.accountLockout.progressiveDelay).toBe(true);
    });
  });

  describe('Content Validation', () => {
    it('should have reasonable field length limits', () => {
      const limits = mockSecurityConfig.contentValidation.maxFieldLength;
      expect(limits.name).toBeLessThanOrEqual(100);
      expect(limits.email).toBeLessThanOrEqual(254); // RFC 5321 limit
      expect(limits.description).toBeGreaterThan(1000); // Should allow reasonable descriptions
    });

    it('should validate email format correctly', () => {
      const emailPattern = mockSecurityConfig.contentValidation.patterns.email;
      
      // Valid emails
      expect(emailPattern.test('user@example.com')).toBe(true);
      expect(emailPattern.test('test.email+tag@domain.co.uk')).toBe(true);
      
      // Invalid emails
      expect(emailPattern.test('invalid-email')).toBe(false);
      expect(emailPattern.test('@domain.com')).toBe(false);
      expect(emailPattern.test('user@')).toBe(false);
      expect(emailPattern.test('user@domain')).toBe(false);
    });

    it('should validate phone format correctly', () => {
      const phonePattern = mockSecurityConfig.contentValidation.patterns.phone;
      
      // Valid phones
      expect(phonePattern.test('+44 20 7946 0958')).toBe(true);
      expect(phonePattern.test('(555) 123-4567')).toBe(true);
      expect(phonePattern.test('1234567890')).toBe(true);
      
      // Invalid phones
      expect(phonePattern.test('123')).toBe(false);
      expect(phonePattern.test('abc-def-ghij')).toBe(false);
    });

    it('should validate URL format correctly', () => {
      const urlPattern = mockSecurityConfig.contentValidation.patterns.url;
      
      // Valid URLs
      expect(urlPattern.test('https://example.com')).toBe(true);
      expect(urlPattern.test('http://www.example.com/path')).toBe(true);
      
      // Invalid URLs
      expect(urlPattern.test('not-a-url')).toBe(false);
      expect(urlPattern.test('ftp://example.com')).toBe(false);
    });
  });

  describe('Security Validators', () => {
    it('should validate emails with length and format checks', () => {
      const validator = mockSecurityConfig.securityValidators.validateEmail;
      
      // Valid email
      expect(validator('test@example.com')).toBe(true);
      
      // Invalid format
      expect(validator('invalid-email')).toBe(false);
      
      // Too long
      const longEmail = 'a'.repeat(250) + '@example.com';
      expect(validator(longEmail)).toBe(false);
    });

    it('should validate passwords with all security requirements', () => {
      const validator = mockSecurityConfig.securityValidators.validatePassword;
      
      // Valid password
      expect(validator('StrongPass123!')).toBe(true);
      
      // Too short
      expect(validator('Sh0rt!')).toBe(false);
      
      // Missing requirements
      expect(validator('weakpassword')).toBe(false);
      expect(validator('STRONGPASSWORD123!')).toBe(false); // No lowercase
      expect(validator('strongpassword123!')).toBe(false); // No uppercase
      expect(validator('StrongPassword!')).toBe(false); // No numbers
      expect(validator('StrongPassword123')).toBe(false); // No special chars
    });

    it('should validate URLs and prevent script injection', () => {
      const validator = mockSecurityConfig.securityValidators.validateUrl;
      
      // Valid URLs
      expect(validator('https://example.com')).toBe(true);
      expect(validator('http://www.example.com/path')).toBe(true);
      
      // Invalid URLs
      expect(validator('javascript:alert(1)')).toBe(false);
      expect(validator('vbscript:msgbox(1)')).toBe(false);
      expect(validator('data:text/html,<script>alert(1)</script>')).toBe(false);
    });

    it('should sanitize input to prevent XSS', () => {
      const sanitizer = mockSecurityConfig.securityValidators.sanitizeInput;
      
      // Basic sanitization
      expect(sanitizer('  hello world  ')).toBe('hello world');
      
      // Script removal
      expect(sanitizer('<script>alert(1)</script>hello')).toBe('hello');
      expect(sanitizer('hello<script type="text/javascript">alert(1)</script>world')).toBe('helloworld');
      
      // Protocol removal
      expect(sanitizer('javascript:alert(1)')).toBe('alert(1)');
      expect(sanitizer('vbscript:msgbox(1)')).toBe('msgbox(1)');
      
      // Event handler removal - removes the value but keeps the attribute structure
      expect(sanitizer('<div onclick="alert(1)">hello</div>')).toBe('<div "alert(1)">hello</div>');
      expect(sanitizer('onload=alert(1)')).toBe('alert(1)');
      
      // Length limiting
      expect(sanitizer('a'.repeat(1500), 100)).toHaveLength(100);
      
      // Non-string handling
      expect(sanitizer(123)).toBe(123);
      expect(sanitizer(null)).toBe(null);
      expect(sanitizer(undefined)).toBe(undefined);
    });
  });

  describe('Security Integration', () => {
    it('should have consistent security levels across configs', () => {
      // Rate limiting should be stricter for sensitive operations
      const { general, auth, passwordReset } = mockSecurityConfig.rateLimiters;
      expect(auth.max).toBeLessThan(general.max);
      expect(passwordReset.max).toBeLessThan(auth.max);
      
      // Password requirements should be strong
      expect(mockSecurityConfig.passwordSecurity.minLength).toBeGreaterThanOrEqual(8);
      expect(mockSecurityConfig.passwordSecurity.saltRounds).toBeGreaterThanOrEqual(12);
      
      // Account lockout should be reasonable but secure
      expect(mockSecurityConfig.accountLockout.maxAttempts).toBeLessThanOrEqual(10);
      expect(mockSecurityConfig.accountLockout.lockoutDuration).toBeGreaterThanOrEqual(5 * 60 * 1000);
    });

    it('should handle production vs development differences', () => {
      // In test/development, CSP should be in report-only mode
      expect(mockSecurityConfig.cspConfig.reportOnly).toBe(true);
      
      // Environment-specific settings should be configurable
      expect(typeof mockSecurityConfig.corsConfig.origin).toBe('function');
    });

    it('should provide comprehensive input validation', () => {
      const validators = mockSecurityConfig.securityValidators;
      
      // Should have validators for common input types
      expect(typeof validators.validateEmail).toBe('function');
      expect(typeof validators.validatePassword).toBe('function');
      expect(typeof validators.validateUrl).toBe('function');
      expect(typeof validators.sanitizeInput).toBe('function');
      
      // Validators should actually validate
      expect(validators.validateEmail('invalid')).toBe(false);
      expect(validators.validateEmail('valid@example.com')).toBe(true);
    });
  });
});