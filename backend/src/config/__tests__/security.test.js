import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock dependencies
vi.mock('helmet', () => ({
  default: vi.fn(() => vi.fn())
}));

vi.mock('express-rate-limit', () => ({
  default: vi.fn(() => vi.fn())
}));

describe('Security Configuration Tests', () => {
  let securityConfig;
  let mockHelmet;
  let mockRateLimit;

  beforeEach(async () => {
    vi.clearAllMocks();
    
    // Mock helmet
    const helmet = await import('helmet');
    mockHelmet = helmet.default;
    mockHelmet.mockReturnValue(vi.fn());

    // Mock express-rate-limit
    const rateLimit = await import('express-rate-limit');
    mockRateLimit = rateLimit.default;
    mockRateLimit.mockReturnValue(vi.fn());

    // Import security config after mocking
    securityConfig = await import('../security.js');
  });

  describe('Security Headers Configuration', () => {
    it('should configure Helmet with comprehensive security headers', () => {
      expect(mockHelmet).toHaveBeenCalledWith({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
            fontSrc: ["'self'", 'https://fonts.gstatic.com'],
            imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
            scriptSrc: ["'self'", "'unsafe-eval'"],
            connectSrc: ["'self'", 'https://api.coindesk.com', 'https://api.coingecko.com'],
            frameSrc: ["'self'", 'https://www.paypal.com', 'https://js.paypal.com'],
            objectSrc: ["'none'"],
            upgradeInsecureRequests: []
          }
        },
        crossOriginEmbedderPolicy: false,
        hsts: {
          maxAge: 31536000,
          includeSubDomains: true,
          preload: true
        },
        noSniff: true,
        frameguard: { action: 'deny' },
        xssFilter: true,
        referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
      });
    });

    it('should export securityHeaders function', () => {
      expect(securityConfig.securityHeaders).toBeDefined();
      expect(typeof securityConfig.securityHeaders).toBe('function');
    });
  });

  describe('CORS Configuration', () => {
    it('should have proper CORS configuration', () => {
      expect(securityConfig.corsConfig).toBeDefined();
      expect(securityConfig.corsConfig).toEqual({
        origin: function(origin, callback) {
          // Allow requests with no origin (mobile apps, curl, etc.)
          if (!origin) return callback(null, true);
          
          const allowedOrigins = [
            'http://localhost:3000',
            'http://localhost:5173',
            'https://rdjcustoms.vercel.app',
            process.env.FRONTEND_URL
          ].filter(Boolean);
          
          if (allowedOrigins.includes(origin)) {
            callback(null, true);
          } else {
            callback(new Error('Not allowed by CORS'));
          }
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-Requested-With'],
        exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
        maxAge: 86400
      });
    });

    it('should allow requests with no origin', () => {
      const originCallback = vi.fn();
      securityConfig.corsConfig.origin(undefined, originCallback);
      expect(originCallback).toHaveBeenCalledWith(null, true);
    });

    it('should allow localhost origins', () => {
      const originCallback = vi.fn();
      securityConfig.corsConfig.origin('http://localhost:3000', originCallback);
      expect(originCallback).toHaveBeenCalledWith(null, true);
      
      securityConfig.corsConfig.origin('http://localhost:5173', originCallback);
      expect(originCallback).toHaveBeenCalledWith(null, true);
    });

    it('should allow production frontend URL', () => {
      const originCallback = vi.fn();
      securityConfig.corsConfig.origin('https://rdjcustoms.vercel.app', originCallback);
      expect(originCallback).toHaveBeenCalledWith(null, true);
    });

    it('should reject unauthorized origins', () => {
      const originCallback = vi.fn();
      securityConfig.corsConfig.origin('https://evil-site.com', originCallback);
      expect(originCallback).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('Rate Limiters Configuration', () => {
    it('should configure general rate limiter', () => {
      expect(mockRateLimit).toHaveBeenCalledWith({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 1000,
        message: {
          error: 'Too many requests from this IP, please try again later.'
        },
        standardHeaders: true,
        legacyHeaders: false,
        trustProxy: true
      });
    });

    it('should configure auth rate limiter with stricter limits', () => {
      expect(mockRateLimit).toHaveBeenCalledWith({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 5,
        message: {
          error: 'Too many authentication attempts, please try again later.'
        },
        standardHeaders: true,
        legacyHeaders: false,
        trustProxy: true,
        skipSuccessfulRequests: true
      });
    });

    it('should configure API rate limiter', () => {
      expect(mockRateLimit).toHaveBeenCalledWith({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 500,
        message: {
          error: 'API rate limit exceeded, please try again later.'
        },
        standardHeaders: true,
        legacyHeaders: false,
        trustProxy: true
      });
    });

    it('should configure upload rate limiter with lower limits', () => {
      expect(mockRateLimit).toHaveBeenCalledWith({
        windowMs: 60 * 60 * 1000, // 1 hour
        max: 50,
        message: {
          error: 'Upload rate limit exceeded, please try again later.'
        },
        standardHeaders: true,
        legacyHeaders: false,
        trustProxy: true
      });
    });

    it('should export all rate limiters', () => {
      expect(securityConfig.rateLimiters).toBeDefined();
      expect(securityConfig.rateLimiters.general).toBeDefined();
      expect(securityConfig.rateLimiters.auth).toBeDefined();
      expect(securityConfig.rateLimiters.api).toBeDefined();
      expect(securityConfig.rateLimiters.upload).toBeDefined();
    });
  });

  describe('Environment-specific Configuration', () => {
    it('should handle production environment', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      // Security should be stricter in production
      expect(securityConfig.corsConfig.credentials).toBe(true);
      
      process.env.NODE_ENV = originalEnv;
    });

    it('should handle development environment', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      // Should still maintain security in development
      expect(securityConfig.corsConfig.credentials).toBe(true);
      
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Security Best Practices', () => {
    it('should implement HSTS with proper configuration', () => {
      const helmetCall = mockHelmet.mock.calls[0][0];
      expect(helmetCall.hsts).toEqual({
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true
      });
    });

    it('should prevent XSS attacks', () => {
      const helmetCall = mockHelmet.mock.calls[0][0];
      expect(helmetCall.xssFilter).toBe(true);
    });

    it('should prevent MIME type sniffing', () => {
      const helmetCall = mockHelmet.mock.calls[0][0];
      expect(helmetCall.noSniff).toBe(true);
    });

    it('should prevent clickjacking', () => {
      const helmetCall = mockHelmet.mock.calls[0][0];
      expect(helmetCall.frameguard).toEqual({ action: 'deny' });
    });

    it('should implement proper referrer policy', () => {
      const helmetCall = mockHelmet.mock.calls[0][0];
      expect(helmetCall.referrerPolicy).toEqual({
        policy: 'strict-origin-when-cross-origin'
      });
    });
  });

  describe('Content Security Policy', () => {
    it('should have restrictive default source policy', () => {
      const helmetCall = mockHelmet.mock.calls[0][0];
      const csp = helmetCall.contentSecurityPolicy.directives;
      expect(csp.defaultSrc).toEqual(["'self'"]);
    });

    it('should allow necessary external resources', () => {
      const helmetCall = mockHelmet.mock.calls[0][0];
      const csp = helmetCall.contentSecurityPolicy.directives;
      
      expect(csp.styleSrc).toContain('https://fonts.googleapis.com');
      expect(csp.fontSrc).toContain('https://fonts.gstatic.com');
      expect(csp.connectSrc).toContain('https://api.coindesk.com');
      expect(csp.connectSrc).toContain('https://api.coingecko.com');
      expect(csp.frameSrc).toContain('https://www.paypal.com');
    });

    it('should block object sources for security', () => {
      const helmetCall = mockHelmet.mock.calls[0][0];
      const csp = helmetCall.contentSecurityPolicy.directives;
      expect(csp.objectSrc).toEqual(["'none'"]);
    });

    it('should enforce HTTPS upgrade', () => {
      const helmetCall = mockHelmet.mock.calls[0][0];
      const csp = helmetCall.contentSecurityPolicy.directives;
      expect(csp.upgradeInsecureRequests).toEqual([]);
    });
  });
});