/**
 * Security Audit Logging Tests
 * Tests comprehensive security event logging and monitoring
 */

import request from 'supertest';
import express from 'express';
import { 
  securityAuditLogger, 
  securityAuditMiddleware, 
  SECURITY_EVENT_TYPES, 
  SECURITY_SEVERITY 
} from '../../middleware/securityAuditLogger.js';

// Mock logger
const mockLogs = [];
jest.mock('../../utils/logger.js', () => ({
  logger: {
    debug: jest.fn((msg, data) => mockLogs.push({ level: 'debug', msg, data })),
    info: jest.fn((msg, data) => mockLogs.push({ level: 'info', msg, data })),
    warn: jest.fn((msg, data) => mockLogs.push({ level: 'warn', msg, data })),
    error: jest.fn((msg, data) => mockLogs.push({ level: 'error', msg, data }))
  }
}));

// Create test app
const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use(securityAuditMiddleware({
    logAllRequests: true,
    logFailedAuth: true,
    logSuspiciousActivity: true
  }));
  
  return app;
};

describe('Security Audit Logging Tests', () => {
  beforeEach(() => {
    mockLogs.length = 0; // Clear logs
  });

  describe('Basic Event Logging', () => {
    test('should log security events with required fields', () => {
      const eventId = securityAuditLogger.logSecurityEvent(
        SECURITY_EVENT_TYPES.AUTHENTICATION.LOGIN_FAILURE,
        { username: 'testuser', reason: 'invalid_password' }
      );

      expect(eventId).toMatch(/^sec_\d+_[a-f0-9]{16}$/);
      expect(mockLogs.length).toBeGreaterThan(0);
      
      const logEntry = mockLogs[0];
      expect(logEntry.data.eventType).toBe(SECURITY_EVENT_TYPES.AUTHENTICATION.LOGIN_FAILURE);
      expect(logEntry.data.severity).toBeDefined();
      expect(logEntry.data.timestamp).toBeDefined();
      expect(logEntry.data.eventId).toBe(eventId);
    });

    test('should calculate appropriate risk scores', () => {
      // High risk event
      const xssEventId = securityAuditLogger.logSecurityEvent(
        SECURITY_EVENT_TYPES.INPUT_VALIDATION.XSS_ATTEMPT,
        { payload: '<script>alert("xss")</script>' }
      );

      // Low risk event
      const loginEventId = securityAuditLogger.logSecurityEvent(
        SECURITY_EVENT_TYPES.AUTHENTICATION.LOGIN_SUCCESS,
        { username: 'testuser' }
      );

      const xssLog = mockLogs.find(log => log.data.eventId === xssEventId);
      const loginLog = mockLogs.find(log => log.data.eventId === loginEventId);

      expect(xssLog.data.riskScore).toBeGreaterThan(loginLog.data.riskScore);
      expect(xssLog.data.severity).toBe(SECURITY_SEVERITY.HIGH);
    });

    test('should assign correct severity levels', () => {
      const testCases = [
        {
          eventType: SECURITY_EVENT_TYPES.INPUT_VALIDATION.SQL_INJECTION,
          expectedSeverity: SECURITY_SEVERITY.CRITICAL
        },
        {
          eventType: SECURITY_EVENT_TYPES.INPUT_VALIDATION.XSS_ATTEMPT,
          expectedSeverity: SECURITY_SEVERITY.HIGH
        },
        {
          eventType: SECURITY_EVENT_TYPES.AUTHENTICATION.LOGIN_FAILURE,
          expectedSeverity: SECURITY_SEVERITY.MEDIUM
        },
        {
          eventType: SECURITY_EVENT_TYPES.AUTHENTICATION.LOGIN_SUCCESS,
          expectedSeverity: SECURITY_SEVERITY.INFO
        }
      ];

      testCases.forEach(({ eventType, expectedSeverity }) => {
        securityAuditLogger.logSecurityEvent(eventType, {});
        const log = mockLogs[mockLogs.length - 1];
        expect(log.data.severity).toBe(expectedSeverity);
      });
    });
  });

  describe('Request Information Extraction', () => {
    test('should extract comprehensive request information', async () => {
      const app = createTestApp();
      
      app.post('/test', (req, res) => {
        securityAuditLogger.logSecurityEvent(
          SECURITY_EVENT_TYPES.INPUT_VALIDATION.XSS_ATTEMPT,
          { payload: '<script>alert("test")</script>' },
          req
        );
        res.json({ status: 'logged' });
      });

      await request(app)
        .post('/test')
        .set('User-Agent', 'Test-Agent/1.0')
        .set('X-Forwarded-For', '192.168.1.100')
        .send({ testData: 'value' })
        .expect(200);

      const securityLog = mockLogs.find(log => log.msg === 'SECURITY HIGH');
      expect(securityLog.data.request).toBeDefined();
      expect(securityLog.data.request.method).toBe('POST');
      expect(securityLog.data.request.url).toBe('/test');
      expect(securityLog.data.request.userAgent).toBe('Test-Agent/1.0');
      expect(securityLog.data.request.body).toBeDefined();
    });

    test('should sanitize sensitive data in logs', async () => {
      const app = createTestApp();
      
      app.post('/login', (req, res) => {
        securityAuditLogger.logSecurityEvent(
          SECURITY_EVENT_TYPES.AUTHENTICATION.LOGIN_FAILURE,
          { username: req.body.username },
          req
        );
        res.status(401).json({ error: 'Invalid credentials' });
      });

      await request(app)
        .post('/login')
        .set('Authorization', 'Bearer secret-token')
        .send({ 
          username: 'testuser',
          password: 'secret123',
          apiKey: 'super-secret-key'
        })
        .expect(401);

      const securityLog = mockLogs.find(log => log.msg === 'SECURITY MEDIUM');
      expect(securityLog.data.request.headers.authorization).toBe('[REDACTED]');
      expect(securityLog.data.request.body.password).toBe('[REDACTED]');
      expect(securityLog.data.request.body.apiKey).toBe('[REDACTED]');
      expect(securityLog.data.request.body.username).toBe('testuser');
    });

    test('should handle large request bodies', async () => {
      const app = createTestApp();
      
      app.post('/large', (req, res) => {
        securityAuditLogger.logSecurityEvent(
          'system.request.large',
          {},
          req
        );
        res.json({ status: 'ok' });
      });

      const largeData = 'x'.repeat(2000);
      
      await request(app)
        .post('/large')
        .send({ largeField: largeData })
        .expect(200);

      const securityLog = mockLogs.find(log => log.data.eventType === 'system.request.large');
      expect(securityLog.data.request.body._truncated).toBe(true);
      expect(securityLog.data.request.body._size).toBeGreaterThan(1000);
    });
  });

  describe('Middleware Integration', () => {
    test('should automatically log failed authentication', async () => {
      const app = createTestApp();
      
      app.post('/auth', (req, res) => {
        res.status(401).json({ error: 'Unauthorized' });
      });

      await request(app)
        .post('/auth')
        .send({ username: 'test', password: 'wrong' })
        .expect(401);

      const authFailureLog = mockLogs.find(log => 
        log.data.eventType === SECURITY_EVENT_TYPES.AUTHENTICATION.LOGIN_FAILURE
      );
      expect(authFailureLog).toBeDefined();
      expect(authFailureLog.data.details.statusCode).toBe(401);
    });

    test('should automatically log rate limiting', async () => {
      const app = createTestApp();
      
      app.get('/limited', (req, res) => {
        res.status(429).json({ error: 'Too Many Requests' });
      });

      await request(app)
        .get('/limited')
        .expect(429);

      const rateLimitLog = mockLogs.find(log => 
        log.data.eventType === SECURITY_EVENT_TYPES.RATE_LIMITING.LIMIT_EXCEEDED
      );
      expect(rateLimitLog).toBeDefined();
      expect(rateLimitLog.data.details.statusCode).toBe(429);
    });

    test('should log all requests when enabled', async () => {
      const app = createTestApp();
      
      app.get('/normal', (req, res) => {
        res.json({ status: 'ok' });
      });

      await request(app)
        .get('/normal')
        .expect(200);

      const requestLog = mockLogs.find(log => 
        log.data.eventType === 'system.request.completed'
      );
      expect(requestLog).toBeDefined();
      expect(requestLog.data.details.statusCode).toBe(200);
      expect(requestLog.data.details.method).toBe('GET');
      expect(requestLog.data.details.duration).toBeDefined();
    });
  });

  describe('Alert Conditions', () => {
    test('should trigger alerts for critical events', () => {
      securityAuditLogger.logSecurityEvent(
        SECURITY_EVENT_TYPES.INPUT_VALIDATION.SQL_INJECTION,
        { payload: "'; DROP TABLE users; --" }
      );

      const criticalLog = mockLogs.find(log => log.msg === 'SECURITY CRITICAL');
      expect(criticalLog).toBeDefined();
      
      const alertLog = mockLogs.find(log => log.msg === 'SECURITY ALERT TRIGGERED');
      expect(alertLog).toBeDefined();
      expect(alertLog.data.severity).toBe(SECURITY_SEVERITY.CRITICAL);
    });

    test('should track IP reputation', () => {
      const mockReq = {
        ip: '192.168.1.100',
        method: 'POST',
        url: '/test',
        headers: {}
      };

      // Log multiple XSS attempts from same IP
      for (let i = 0; i < 3; i++) {
        securityAuditLogger.logSecurityEvent(
          SECURITY_EVENT_TYPES.INPUT_VALIDATION.XSS_ATTEMPT,
          { attempt: i + 1 },
          mockReq
        );
      }

      // IP reputation should increase with each attempt
      const ipScore = securityAuditLogger.getIpReputationScore('192.168.1.100');
      expect(ipScore).toBeGreaterThan(0);
    });
  });

  describe('Performance and Scalability', () => {
    test('should handle high volume of events efficiently', () => {
      const startTime = Date.now();
      
      // Log 1000 events
      for (let i = 0; i < 1000; i++) {
        securityAuditLogger.logSecurityEvent(
          SECURITY_EVENT_TYPES.AUTHENTICATION.LOGIN_SUCCESS,
          { userId: `user_${i}` }
        );
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should complete within reasonable time (< 1 second)
      expect(duration).toBeLessThan(1000);
      expect(mockLogs.length).toBe(1000);
    });

    test('should prevent memory leaks with data cleanup', () => {
      // Simulate old data
      const oldTimestamp = Date.now() - (25 * 60 * 60 * 1000); // 25 hours ago
      
      // Add session to track cleanup
      securityAuditLogger.sessionMap.set('old_session', oldTimestamp);
      securityAuditLogger.ipReputation.set('192.168.1.1', 50);
      
      // Trigger cleanup
      securityAuditLogger.cleanOldTrackingData();
      
      // Old session should be removed
      expect(securityAuditLogger.sessionMap.has('old_session')).toBe(false);
      
      // IP reputation should decay
      const currentScore = securityAuditLogger.ipReputation.get('192.168.1.1');
      expect(currentScore).toBeLessThan(50);
    });
  });

  describe('Security Context', () => {
    test('should capture security context information', async () => {
      const app = createTestApp();
      
      app.get('/secure', (req, res) => {
        // Simulate authenticated user
        req.user = { id: '123', role: 'admin' };
        req.sessionID = 'test_session_123';
        
        securityAuditLogger.logSecurityEvent(
          SECURITY_EVENT_TYPES.AUTHORIZATION.ADMIN_ACCESS,
          { resource: '/admin/users' },
          req
        );
        res.json({ status: 'ok' });
      });

      await request(app)
        .get('/secure')
        .set('Origin', 'https://trusted-domain.com')
        .expect(200);

      const securityLog = mockLogs.find(log => 
        log.data.eventType === SECURITY_EVENT_TYPES.AUTHORIZATION.ADMIN_ACCESS
      );
      
      expect(securityLog.data.context.isAuthenticated).toBe(true);
      expect(securityLog.data.context.userRole).toBe('admin');
      expect(securityLog.data.context.origin).toBe('https://trusted-domain.com');
    });

    test('should handle unauthenticated requests', async () => {
      const app = createTestApp();
      
      app.get('/public', (req, res) => {
        securityAuditLogger.logSecurityEvent(
          SECURITY_EVENT_TYPES.AUTHORIZATION.ACCESS_DENIED,
          { reason: 'Authentication required' },
          req
        );
        res.status(401).json({ error: 'Unauthorized' });
      });

      await request(app)
        .get('/public')
        .expect(401);

      const securityLog = mockLogs.find(log => 
        log.data.eventType === SECURITY_EVENT_TYPES.AUTHORIZATION.ACCESS_DENIED
      );
      
      expect(securityLog.data.context.isAuthenticated).toBe(false);
      expect(securityLog.data.context.userRole).toBeUndefined();
    });
  });

  describe('Event Types Coverage', () => {
    test('should support all defined event types', () => {
      const allEventTypes = Object.values(SECURITY_EVENT_TYPES).flatMap(category => 
        Object.values(category)
      );

      allEventTypes.forEach(eventType => {
        const eventId = securityAuditLogger.logSecurityEvent(eventType, {
          testData: 'coverage_test'
        });
        
        expect(eventId).toMatch(/^sec_\d+_[a-f0-9]{16}$/);
      });

      expect(mockLogs.length).toBe(allEventTypes.length);
    });

    test('should handle custom event types', () => {
      const customEventType = 'custom.security.event';
      
      const eventId = securityAuditLogger.logSecurityEvent(customEventType, {
        customData: 'test'
      });
      
      expect(eventId).toBeDefined();
      const log = mockLogs.find(log => log.data.eventType === customEventType);
      expect(log).toBeDefined();
    });
  });
});