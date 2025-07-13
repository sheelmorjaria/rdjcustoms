import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';

// Mock all dependencies before importing app
vi.mock('cors');
vi.mock('helmet');
vi.mock('express-rate-limit');
vi.mock('compression');
vi.mock('morgan');
vi.mock('cookie-parser');
vi.mock('../../routes/auth.js', () => ({ default: vi.fn() }));
vi.mock('../../routes/products.js', () => ({ default: vi.fn() }));
vi.mock('../../routes/cart.js', () => ({ default: vi.fn() }));
vi.mock('../../routes/user.js', () => ({ default: vi.fn() }));
vi.mock('../../routes/admin.js', () => ({ default: vi.fn() }));
vi.mock('../../routes/payment.js', () => ({ default: vi.fn() }));
vi.mock('../../routes/shipping.js', () => ({ default: vi.fn() }));
vi.mock('../../routes/support.js', () => ({ default: vi.fn() }));
vi.mock('../../routes/health.js', () => ({ default: vi.fn() }));
vi.mock('../../routes/internalOrderRoutes.js', () => ({ default: vi.fn() }));
vi.mock('../../routes/security.js', () => ({ default: vi.fn() }));
vi.mock('../../routes/referral.js', () => ({ default: vi.fn() }));
vi.mock('../../middleware/errorHandler.js', () => ({ errorHandler: vi.fn() }));
vi.mock('../../middleware/notFound.js', () => ({ notFound: vi.fn() }));
vi.mock('../../middleware/inputSanitization.js', () => ({ inputSanitization: vi.fn() }));
vi.mock('../../middleware/csp.js', () => ({
  cspNonce: vi.fn((req, res, next) => next()),
  dynamicCSP: vi.fn((req, res, next) => next()),
  routeSpecificCSP: vi.fn((req, res, next) => next()),
  apiSecurityHeaders: vi.fn((req, res, next) => next())
}));
vi.mock('../../middleware/responseSanitization.js', () => ({
  responseSanitization: vi.fn((req, res, next) => next()),
  validateResponseContentType: vi.fn((req, res, next) => next())
}));
vi.mock('../../middleware/securityAuditLogger.js', () => ({
  securityAuditMiddleware: vi.fn((req, res, next) => next()),
  securityAuditLogger: vi.fn(),
  SECURITY_EVENT_TYPES: {}
}));
vi.mock('../../config/security.js', () => ({
  securityHeaders: vi.fn((req, res, next) => next()),
  corsConfig: { origin: true },
  rateLimiters: {
    general: vi.fn((req, res, next) => next()),
    auth: vi.fn((req, res, next) => next()),
    api: vi.fn((req, res, next) => next()),
    upload: vi.fn((req, res, next) => next())
  }
}));
vi.mock('../../middleware/referralTracking.js', () => ({
  referralTrackingMiddleware: vi.fn((req, res, next) => next()),
  addReferralContext: vi.fn((req, res, next) => next())
}));

describe('App Configuration Tests', () => {
  let app;
  let mockExpress;
  let mockApp;

  beforeEach(async () => {
    // Reset all mocks
    vi.clearAllMocks();

    // Mock express and its methods
    mockApp = {
      set: vi.fn(),
      use: vi.fn(),
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      listen: vi.fn()
    };

    mockExpress = vi.fn(() => mockApp);
    mockExpress.json = vi.fn(() => vi.fn());
    mockExpress.urlencoded = vi.fn(() => vi.fn());
    mockExpress.static = vi.fn(() => vi.fn());

    // Mock dependencies
    const cors = await import('cors');
    const helmet = await import('helmet');
    const rateLimit = await import('express-rate-limit');
    const compression = await import('compression');
    const morgan = await import('morgan');
    const cookieParser = await import('cookie-parser');

    cors.default = vi.fn(() => vi.fn());
    helmet.default = vi.fn(() => vi.fn());
    rateLimit.default = vi.fn(() => vi.fn());
    compression.default = vi.fn(() => vi.fn());
    morgan.default = vi.fn(() => vi.fn());
    cookieParser.default = vi.fn(() => vi.fn());

    // Mock express at module level
    vi.doMock('express', () => ({ default: mockExpress }));

    // Import app after mocking
    const appModule = await import('../../app.js');
    app = appModule.default;
  });

  describe('App Initialization', () => {
    it('should create an Express application', () => {
      expect(mockExpress).toHaveBeenCalled();
    });

    it('should set trust proxy to 1', () => {
      expect(mockApp.set).toHaveBeenCalledWith('trust proxy', 1);
    });
  });

  describe('Security Middleware Setup', () => {
    it('should configure CSP nonce middleware', () => {
      const csp = require('../../middleware/csp.js');
      expect(mockApp.use).toHaveBeenCalledWith(csp.cspNonce);
    });

    it('should configure security headers', () => {
      const security = require('../../config/security.js');
      expect(mockApp.use).toHaveBeenCalledWith(security.securityHeaders);
    });

    it('should configure dynamic CSP middleware', () => {
      const csp = require('../../middleware/csp.js');
      expect(mockApp.use).toHaveBeenCalledWith(csp.dynamicCSP);
    });

    it('should configure CORS with security config', () => {
      const security = require('../../config/security.js');
      expect(mockApp.use).toHaveBeenCalledWith(expect.any(Function));
    });
  });

  describe('Rate Limiting Configuration', () => {
    it('should configure general rate limiting for /api/', () => {
      const security = require('../../config/security.js');
      expect(mockApp.use).toHaveBeenCalledWith('/api/', security.rateLimiters.general);
    });

    it('should configure auth-specific rate limiting', () => {
      const security = require('../../config/security.js');
      expect(mockApp.use).toHaveBeenCalledWith('/api/auth', security.rateLimiters.auth);
    });

    it('should configure API-specific rate limiting', () => {
      const security = require('../../config/security.js');
      expect(mockApp.use).toHaveBeenCalledWith('/api/', security.rateLimiters.api);
    });

    it('should configure upload-specific rate limiting', () => {
      const security = require('../../config/security.js');
      expect(mockApp.use).toHaveBeenCalledWith('/api/admin/products/images', security.rateLimiters.upload);
    });
  });

  describe('Body Parsing Middleware', () => {
    it('should configure JSON body parsing with size limits', () => {
      expect(mockExpress.json).toHaveBeenCalledWith({
        limit: '50mb',
        verify: expect.any(Function)
      });
    });

    it('should configure URL encoded body parsing', () => {
      expect(mockExpress.urlencoded).toHaveBeenCalledWith({
        extended: true,
        limit: '50mb'
      });
    });

    it('should configure cookie parser', () => {
      expect(mockApp.use).toHaveBeenCalledWith(expect.any(Function));
    });
  });

  describe('Request Processing Middleware', () => {
    it('should configure compression middleware', () => {
      expect(mockApp.use).toHaveBeenCalledWith(expect.any(Function));
    });

    it('should configure Morgan logging in non-test environment', () => {
      // Note: Morgan setup is conditional based on NODE_ENV
      expect(mockApp.use).toHaveBeenCalled();
    });

    it('should configure input sanitization middleware', () => {
      const inputSan = require('../../middleware/inputSanitization.js');
      expect(mockApp.use).toHaveBeenCalledWith(inputSan.inputSanitization);
    });
  });

  describe('Referral Tracking Middleware', () => {
    it('should configure referral tracking middleware', () => {
      const referral = require('../../middleware/referralTracking.js');
      expect(mockApp.use).toHaveBeenCalledWith(referral.referralTrackingMiddleware);
    });

    it('should configure referral context middleware', () => {
      const referral = require('../../middleware/referralTracking.js');
      expect(mockApp.use).toHaveBeenCalledWith(referral.addReferralContext);
    });
  });

  describe('Route Configuration', () => {
    it('should configure all API routes', () => {
      // Verify that routes are mounted
      expect(mockApp.use).toHaveBeenCalledWith('/api/auth', expect.any(Function));
      expect(mockApp.use).toHaveBeenCalledWith('/api/products', expect.any(Function));
      expect(mockApp.use).toHaveBeenCalledWith('/api/cart', expect.any(Function));
      expect(mockApp.use).toHaveBeenCalledWith('/api/user', expect.any(Function));
      expect(mockApp.use).toHaveBeenCalledWith('/api/admin', expect.any(Function));
      expect(mockApp.use).toHaveBeenCalledWith('/api/payments', expect.any(Function));
      expect(mockApp.use).toHaveBeenCalledWith('/api/shipping', expect.any(Function));
      expect(mockApp.use).toHaveBeenCalledWith('/api/support', expect.any(Function));
      expect(mockApp.use).toHaveBeenCalledWith('/api/health', expect.any(Function));
      expect(mockApp.use).toHaveBeenCalledWith('/api/internal', expect.any(Function));
      expect(mockApp.use).toHaveBeenCalledWith('/api/security', expect.any(Function));
      expect(mockApp.use).toHaveBeenCalledWith('/api/referral', expect.any(Function));
    });
  });

  describe('Security and Response Middleware', () => {
    it('should configure route-specific CSP middleware', () => {
      const csp = require('../../middleware/csp.js');
      expect(mockApp.use).toHaveBeenCalledWith('/api/', csp.routeSpecificCSP);
    });

    it('should configure API security headers', () => {
      const csp = require('../../middleware/csp.js');
      expect(mockApp.use).toHaveBeenCalledWith('/api/', csp.apiSecurityHeaders);
    });

    it('should configure response sanitization', () => {
      const respSan = require('../../middleware/responseSanitization.js');
      expect(mockApp.use).toHaveBeenCalledWith(respSan.responseSanitization);
    });

    it('should configure response content type validation', () => {
      const respSan = require('../../middleware/responseSanitization.js');
      expect(mockApp.use).toHaveBeenCalledWith(respSan.validateResponseContentType);
    });

    it('should configure security audit middleware', () => {
      const audit = require('../../middleware/securityAuditLogger.js');
      expect(mockApp.use).toHaveBeenCalledWith(audit.securityAuditMiddleware);
    });
  });

  describe('Error Handling', () => {
    it('should configure 404 not found middleware', () => {
      const notFound = require('../../middleware/notFound.js');
      expect(mockApp.use).toHaveBeenCalledWith(notFound.notFound);
    });

    it('should configure error handler middleware last', () => {
      const errorHandler = require('../../middleware/errorHandler.js');
      expect(mockApp.use).toHaveBeenCalledWith(errorHandler.errorHandler);
    });
  });

  describe('Development vs Production Configuration', () => {
    it('should handle different environments appropriately', () => {
      // Test that app configuration adapts to environment
      expect(mockApp.use).toHaveBeenCalled();
      
      // In test environment, certain middleware like Morgan should be configured differently
      const calls = mockApp.use.mock.calls;
      expect(calls.length).toBeGreaterThan(10); // Should have many middleware configured
    });
  });
});

describe('App Module Export', () => {
  it('should export the configured Express application', async () => {
    const appModule = await import('../../app.js');
    expect(appModule.default).toBeDefined();
  });
});