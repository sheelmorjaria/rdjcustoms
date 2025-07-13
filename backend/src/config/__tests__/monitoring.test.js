import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as Sentry from '@sentry/node';
import { 
  initializeSentry, 
  initializeNewRelic, 
  getHealthMetrics, 
  metrics,
  alerts
} from '../monitoring.js';

// Mock Sentry
vi.mock('@sentry/node', () => ({
  init: vi.fn(),
  httpIntegration: vi.fn().mockReturnValue({}),
  expressIntegration: vi.fn().mockReturnValue({}),
  mongoIntegration: vi.fn().mockReturnValue({}),
  addBreadcrumb: vi.fn(),
  withScope: vi.fn((callback) => callback({
    setTag: vi.fn()
  })),
  captureException: vi.fn()
}));

// Mock profiling integration
vi.mock('@sentry/profiling-node', () => ({
  nodeProfilingIntegration: vi.fn().mockReturnValue({})
}));

// Mock newrelic
vi.mock('newrelic', () => ({}));

describe('Monitoring Configuration', () => {
  let originalEnv;
  let consoleLogSpy;
  let consoleErrorSpy;
  let consoleWarnSpy;
  let consoleInfoSpy;

  beforeEach(() => {
    originalEnv = { ...process.env };
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleInfoSpy.mockRestore();
  });

  describe('initializeSentry', () => {
    it('should initialize Sentry in production with SENTRY_DSN', () => {
      process.env.NODE_ENV = 'production';
      process.env.SENTRY_DSN = 'https://test@sentry.io/123';
      process.env.npm_package_version = '1.2.3';

      initializeSentry();

      expect(Sentry.init).toHaveBeenCalledWith({
        dsn: 'https://test@sentry.io/123',
        environment: 'production',
        integrations: expect.any(Array),
        tracesSampleRate: 0.1,
        profilesSampleRate: 0.1,
        release: '1.2.3',
        beforeSend: expect.any(Function)
      });
      expect(consoleLogSpy).toHaveBeenCalledWith('✅ Sentry error tracking initialized');
    });

    it('should not initialize Sentry without SENTRY_DSN', () => {
      process.env.NODE_ENV = 'production';
      delete process.env.SENTRY_DSN;

      initializeSentry();

      expect(Sentry.init).not.toHaveBeenCalled();
      expect(consoleLogSpy).toHaveBeenCalledWith('⚠️  Sentry not initialized - missing SENTRY_DSN or not in production');
    });

    it('should not initialize Sentry in non-production environment', () => {
      process.env.NODE_ENV = 'development';
      process.env.SENTRY_DSN = 'https://test@sentry.io/123';

      initializeSentry();

      expect(Sentry.init).not.toHaveBeenCalled();
      expect(consoleLogSpy).toHaveBeenCalledWith('⚠️  Sentry not initialized - missing SENTRY_DSN or not in production');
    });

    it('should filter sensitive data in beforeSend', () => {
      process.env.NODE_ENV = 'production';
      process.env.SENTRY_DSN = 'https://test@sentry.io/123';

      initializeSentry();

      const beforeSend = Sentry.init.mock.calls[0][0].beforeSend;
      const event = {
        request: {
          cookies: { session: 'secret' },
          headers: {
            authorization: 'Bearer token',
            cookie: 'session=secret',
            'content-type': 'application/json'
          }
        }
      };
      const hint = {};

      const result = beforeSend(event, hint);

      expect(result.request.cookies).toBeUndefined();
      expect(result.request.headers.authorization).toBeUndefined();
      expect(result.request.headers.cookie).toBeUndefined();
      expect(result.request.headers['content-type']).toBe('application/json');
    });

    it('should log errors in development mode', () => {
      process.env.NODE_ENV = 'development';
      process.env.SENTRY_DSN = 'https://test@sentry.io/123';

      // Force initialization for testing beforeSend
      process.env.NODE_ENV = 'production';
      initializeSentry();
      
      const beforeSend = Sentry.init.mock.calls[0][0].beforeSend;
      process.env.NODE_ENV = 'development';
      
      const error = new Error('Test error');
      const hint = { originalException: error };

      beforeSend({}, hint);

      expect(consoleErrorSpy).toHaveBeenCalledWith('Sentry Error:', error);
    });
  });

  describe('initializeNewRelic', () => {
    it('should initialize New Relic in production with license key', async () => {
      process.env.NODE_ENV = 'production';
      process.env.NEW_RELIC_LICENSE_KEY = 'test-license-key';

      initializeNewRelic();

      // Wait for dynamic import
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(consoleLogSpy).toHaveBeenCalledWith('✅ New Relic APM initialized');
    });

    it('should not initialize New Relic without license key', () => {
      process.env.NODE_ENV = 'production';
      delete process.env.NEW_RELIC_LICENSE_KEY;

      initializeNewRelic();

      expect(consoleLogSpy).toHaveBeenCalledWith('⚠️  New Relic not initialized - missing license key or not in production');
    });

    it('should not initialize New Relic in non-production environment', () => {
      process.env.NODE_ENV = 'development';
      process.env.NEW_RELIC_LICENSE_KEY = 'test-license-key';

      initializeNewRelic();

      expect(consoleLogSpy).toHaveBeenCalledWith('⚠️  New Relic not initialized - missing license key or not in production');
    });
  });

  describe('getHealthMetrics', () => {
    it('should return health metrics with proper format', () => {
      const metrics = getHealthMetrics();

      expect(metrics).toMatchObject({
        status: 'healthy',
        timestamp: expect.any(String),
        uptime: expect.any(Number),
        memory: {
          rss: expect.any(Number),
          heapUsed: expect.any(Number),
          heapTotal: expect.any(Number),
          external: expect.any(Number)
        },
        node: {
          version: process.version,
          environment: process.env.NODE_ENV
        }
      });

      expect(new Date(metrics.timestamp)).toBeInstanceOf(Date);
      expect(metrics.uptime).toBeGreaterThanOrEqual(0);
    });
  });

  describe('metrics.responseTime', () => {
    it('should track response time and warn for slow requests', (done) => {
      const req = { method: 'GET', path: '/api/test' };
      const res = {
        on: vi.fn((event, callback) => {
          if (event === 'finish') {
            // Simulate slow request
            setTimeout(() => {
              callback();
              expect(consoleWarnSpy).toHaveBeenCalledWith(
                expect.stringContaining('Slow request detected: GET /api/test')
              );
              done();
            }, 10);
          }
        })
      };
      const next = vi.fn();

      // Mock Date.now to simulate a slow request
      const originalDateNow = Date.now;
      let callCount = 0;
      Date.now = vi.fn(() => {
        if (callCount === 0) {
          callCount++;
          return 1000;
        }
        return 3001; // 2001ms duration
      });

      metrics.responseTime(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.on).toHaveBeenCalledWith('finish', expect.any(Function));

      // Restore Date.now
      Date.now = originalDateNow;
    });

    it('should not warn for fast requests', (done) => {
      const req = { method: 'GET', path: '/api/test' };
      const res = {
        on: vi.fn((event, callback) => {
          if (event === 'finish') {
            setTimeout(() => {
              callback();
              expect(consoleWarnSpy).not.toHaveBeenCalled();
              done();
            }, 10);
          }
        })
      };
      const next = vi.fn();

      metrics.responseTime(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe('metrics.trackPayment', () => {
    it('should track payment metrics', () => {
      const paymentData = {
        paymentMethod: 'paypal',
        amount: 100.50,
        status: 'completed',
        orderId: 'ORDER-123'
      };

      metrics.trackPayment(
        paymentData.paymentMethod,
        paymentData.amount,
        paymentData.status,
        paymentData.orderId
      );

      expect(consoleInfoSpy).toHaveBeenCalledWith('Payment metric:', {
        event: 'payment_processed',
        paymentMethod: 'paypal',
        amount: 100.50,
        status: 'completed',
        orderId: 'ORDER-123',
        timestamp: expect.any(String)
      });
    });

    it('should add Sentry breadcrumb in production', () => {
      process.env.NODE_ENV = 'production';

      metrics.trackPayment('bitcoin', 200, 'completed', 'ORDER-456');

      expect(Sentry.addBreadcrumb).toHaveBeenCalledWith({
        message: 'Payment completed',
        category: 'payment',
        data: { paymentMethod: 'bitcoin', amount: 200, orderId: 'ORDER-456' },
        level: 'info'
      });

      process.env.NODE_ENV = 'test';
    });

    it('should set warning level for non-completed payments', () => {
      process.env.NODE_ENV = 'production';

      metrics.trackPayment('monero', 150, 'failed', 'ORDER-789');

      expect(Sentry.addBreadcrumb).toHaveBeenCalledWith({
        message: 'Payment failed',
        category: 'payment',
        data: { paymentMethod: 'monero', amount: 150, orderId: 'ORDER-789' },
        level: 'warning'
      });

      process.env.NODE_ENV = 'test';
    });
  });

  describe('metrics.trackUserEvent', () => {
    it('should track user events', () => {
      metrics.trackUserEvent('USER-123', 'login', { ip: '127.0.0.1' });

      expect(consoleInfoSpy).toHaveBeenCalledWith('User event:', {
        event: 'login',
        userId: 'USER-123',
        data: { ip: '127.0.0.1' },
        timestamp: expect.any(String)
      });
    });

    it('should add Sentry breadcrumb in production', () => {
      process.env.NODE_ENV = 'production';

      metrics.trackUserEvent('USER-456', 'profile_update', { field: 'email' });

      expect(Sentry.addBreadcrumb).toHaveBeenCalledWith({
        message: 'User profile_update',
        category: 'user',
        data: { userId: 'USER-456', field: 'email' },
        level: 'info'
      });

      process.env.NODE_ENV = 'test';
    });
  });

  describe('metrics.trackError', () => {
    it('should track errors with context', () => {
      const error = new Error('Test error');
      const context = { userId: 'USER-123', action: 'payment' };

      metrics.trackError(error, context);

      expect(consoleErrorSpy).toHaveBeenCalledWith('Application error:', error, context);
    });

    it('should capture exception in Sentry in production', () => {
      process.env.NODE_ENV = 'production';
      const error = new Error('Production error');
      const context = { orderId: 'ORDER-123', step: 'validation' };
      const scopeMock = { setTag: vi.fn() };

      Sentry.withScope.mockImplementation((callback) => callback(scopeMock));

      metrics.trackError(error, context);

      expect(scopeMock.setTag).toHaveBeenCalledWith('orderId', 'ORDER-123');
      expect(scopeMock.setTag).toHaveBeenCalledWith('step', 'validation');
      expect(Sentry.captureException).toHaveBeenCalledWith(error);

      process.env.NODE_ENV = 'test';
    });
  });

  describe('alerts', () => {
    it('should have alert check methods', () => {
      expect(alerts.checkErrorRate).toBeDefined();
      expect(alerts.checkDatabaseHealth).toBeDefined();
      expect(alerts.checkPaymentHealth).toBeDefined();
      expect(typeof alerts.checkErrorRate).toBe('function');
      expect(typeof alerts.checkDatabaseHealth).toBe('function');
      expect(typeof alerts.checkPaymentHealth).toBe('function');
    });
  });
});