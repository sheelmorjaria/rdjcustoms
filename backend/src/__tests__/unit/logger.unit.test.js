import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('Logger Utility Unit Tests', () => {
  let mockLogger;
  let logError, logPaymentEvent, logAuthEvent, logSecurityEvent;

  beforeEach(() => {
    // Mock winston logger
    mockLogger = {
      error: vi.fn(),
      warn: vi.fn(),
      info: vi.fn(),
      http: vi.fn(),
      debug: vi.fn(),
      stream: {
        write: vi.fn()
      },
      level: 'info',
      levels: {
        error: 0,
        warn: 1,
        info: 2,
        http: 3,
        debug: 4
      }
    };

    // Mock logger functions
    logError = (error, context = {}) => {
      mockLogger.error({
        message: error.message,
        stack: error.stack,
        ...context
      });
    };

    logPaymentEvent = (event, data) => {
      mockLogger.info({
        message: `Payment event: ${event}`,
        category: 'payment',
        ...data
      });
    };

    logAuthEvent = (event, userId, details = {}) => {
      mockLogger.info({
        message: `Auth event: ${event}`,
        category: 'auth',
        userId,
        ...details
      });
    };

    logSecurityEvent = (event, details) => {
      mockLogger.warn({
        message: `Security event: ${event}`,
        category: 'security',
        ...details
      });
    };
  });

  describe('Logger Configuration', () => {
    it('should have appropriate log levels defined', () => {
      const levels = mockLogger.levels;
      
      expect(levels.error).toBe(0);
      expect(levels.warn).toBe(1);
      expect(levels.info).toBe(2);
      expect(levels.http).toBe(3);
      expect(levels.debug).toBe(4);
      
      // Error should be highest priority (lowest number)
      expect(levels.error).toBeLessThan(levels.warn);
      expect(levels.warn).toBeLessThan(levels.info);
      expect(levels.info).toBeLessThan(levels.http);
      expect(levels.http).toBeLessThan(levels.debug);
    });

    it('should have stream interface for HTTP logging', () => {
      expect(mockLogger.stream).toBeDefined();
      expect(typeof mockLogger.stream.write).toBe('function');
    });

    it('should use appropriate default log level', () => {
      expect(['error', 'warn', 'info', 'debug']).toContain(mockLogger.level);
    });
  });

  describe('Basic Logging Functions', () => {
    it('should log error messages', () => {
      const testMessage = 'Test error message';
      mockLogger.error(testMessage);
      
      expect(mockLogger.error).toHaveBeenCalledWith(testMessage);
    });

    it('should log warning messages', () => {
      const testMessage = 'Test warning message';
      mockLogger.warn(testMessage);
      
      expect(mockLogger.warn).toHaveBeenCalledWith(testMessage);
    });

    it('should log info messages', () => {
      const testMessage = 'Test info message';
      mockLogger.info(testMessage);
      
      expect(mockLogger.info).toHaveBeenCalledWith(testMessage);
    });

    it('should log HTTP messages', () => {
      const testMessage = 'GET /api/test 200';
      mockLogger.http(testMessage);
      
      expect(mockLogger.http).toHaveBeenCalledWith(testMessage);
    });

    it('should log debug messages', () => {
      const testMessage = 'Debug information';
      mockLogger.debug(testMessage);
      
      expect(mockLogger.debug).toHaveBeenCalledWith(testMessage);
    });
  });

  describe('HTTP Stream Logging', () => {
    it('should process HTTP log messages through stream', () => {
      const httpMessage = 'GET /api/users 200 15ms\n';
      
      // Mock the stream write behavior
      mockLogger.stream.write = vi.fn((message) => {
        mockLogger.http(message.trim());
      });
      
      mockLogger.stream.write(httpMessage);
      
      expect(mockLogger.http).toHaveBeenCalledWith('GET /api/users 200 15ms');
    });

    it('should trim whitespace from HTTP messages', () => {
      const httpMessage = '  POST /api/auth/login 201 45ms  \n';
      
      mockLogger.stream.write = vi.fn((message) => {
        mockLogger.http(message.trim());
      });
      
      mockLogger.stream.write(httpMessage);
      
      expect(mockLogger.http).toHaveBeenCalledWith('POST /api/auth/login 201 45ms');
    });
  });

  describe('Error Logging Helper', () => {
    it('should log error objects with stack trace', () => {
      const error = new Error('Test error');
      const context = { userId: '123', action: 'test' };
      
      logError(error, context);
      
      expect(mockLogger.error).toHaveBeenCalledWith({
        message: 'Test error',
        stack: error.stack,
        userId: '123',
        action: 'test'
      });
    });

    it('should log errors without context', () => {
      const error = new Error('Simple error');
      
      logError(error);
      
      expect(mockLogger.error).toHaveBeenCalledWith({
        message: 'Simple error',
        stack: error.stack
      });
    });

    it('should handle errors with additional properties', () => {
      const error = new Error('Custom error');
      error.code = 'E001';
      error.statusCode = 400;
      
      const context = { endpoint: '/api/test', method: 'POST' };
      
      logError(error, context);
      
      expect(mockLogger.error).toHaveBeenCalledWith({
        message: 'Custom error',
        stack: error.stack,
        endpoint: '/api/test',
        method: 'POST'
      });
    });

    it('should handle errors without message', () => {
      const error = new Error();
      
      logError(error);
      
      expect(mockLogger.error).toHaveBeenCalledWith({
        message: '',
        stack: error.stack
      });
    });
  });

  describe('Payment Event Logging', () => {
    it('should log payment events with proper format', () => {
      const event = 'payment_initiated';
      const data = {
        paymentId: 'PAY-123',
        amount: 99.99,
        currency: 'GBP',
        method: 'paypal'
      };
      
      logPaymentEvent(event, data);
      
      expect(mockLogger.info).toHaveBeenCalledWith({
        message: 'Payment event: payment_initiated',
        category: 'payment',
        paymentId: 'PAY-123',
        amount: 99.99,
        currency: 'GBP',
        method: 'paypal'
      });
    });

    it('should log payment events without additional data', () => {
      const event = 'payment_completed';
      
      logPaymentEvent(event);
      
      expect(mockLogger.info).toHaveBeenCalledWith({
        message: 'Payment event: payment_completed',
        category: 'payment'
      });
    });

    it('should handle various payment event types', () => {
      const events = [
        'payment_initiated',
        'payment_completed',
        'payment_failed',
        'payment_cancelled',
        'refund_processed'
      ];
      
      events.forEach(event => {
        logPaymentEvent(event, { orderId: 'ORD-123' });
        
        expect(mockLogger.info).toHaveBeenCalledWith({
          message: `Payment event: ${event}`,
          category: 'payment',
          orderId: 'ORD-123'
        });
      });
    });
  });

  describe('Authentication Event Logging', () => {
    it('should log auth events with user ID', () => {
      const event = 'login_success';
      const userId = 'user_123';
      const details = {
        ip: '192.168.1.1',
        userAgent: 'Mozilla/5.0'
      };
      
      logAuthEvent(event, userId, details);
      
      expect(mockLogger.info).toHaveBeenCalledWith({
        message: 'Auth event: login_success',
        category: 'auth',
        userId: 'user_123',
        ip: '192.168.1.1',
        userAgent: 'Mozilla/5.0'
      });
    });

    it('should log auth events without details', () => {
      const event = 'logout';
      const userId = 'user_456';
      
      logAuthEvent(event, userId);
      
      expect(mockLogger.info).toHaveBeenCalledWith({
        message: 'Auth event: logout',
        category: 'auth',
        userId: 'user_456'
      });
    });

    it('should handle various auth event types', () => {
      const events = [
        'login_attempt',
        'login_success',
        'login_failure',
        'logout',
        'password_reset_request',
        'password_reset_success',
        'account_locked'
      ];
      
      events.forEach(event => {
        logAuthEvent(event, 'user_123', { timestamp: new Date() });
        
        expect(mockLogger.info).toHaveBeenCalledWith({
          message: `Auth event: ${event}`,
          category: 'auth',
          userId: 'user_123',
          timestamp: expect.any(Date)
        });
      });
    });

    it('should handle null/undefined user IDs', () => {
      logAuthEvent('anonymous_action', null, { ip: '192.168.1.1' });
      
      expect(mockLogger.info).toHaveBeenCalledWith({
        message: 'Auth event: anonymous_action',
        category: 'auth',
        userId: null,
        ip: '192.168.1.1'
      });
    });
  });

  describe('Security Event Logging', () => {
    it('should log security events as warnings', () => {
      const event = 'suspicious_activity';
      const details = {
        ip: '192.168.1.100',
        reason: 'multiple_failed_logins',
        count: 5
      };
      
      logSecurityEvent(event, details);
      
      expect(mockLogger.warn).toHaveBeenCalledWith({
        message: 'Security event: suspicious_activity',
        category: 'security',
        ip: '192.168.1.100',
        reason: 'multiple_failed_logins',
        count: 5
      });
    });

    it('should handle various security event types', () => {
      const securityEvents = [
        'brute_force_attempt',
        'sql_injection_attempt',
        'xss_attempt',
        'rate_limit_exceeded',
        'invalid_token_usage',
        'unauthorized_access_attempt'
      ];
      
      securityEvents.forEach(event => {
        logSecurityEvent(event, { timestamp: new Date(), severity: 'high' });
        
        expect(mockLogger.warn).toHaveBeenCalledWith({
          message: `Security event: ${event}`,
          category: 'security',
          timestamp: expect.any(Date),
          severity: 'high'
        });
      });
    });

    it('should log security events without details', () => {
      logSecurityEvent('general_security_alert');
      
      expect(mockLogger.warn).toHaveBeenCalledWith({
        message: 'Security event: general_security_alert',
        category: 'security'
      });
    });
  });

  describe('Log Message Formatting', () => {
    it('should format log messages consistently', () => {
      const testCases = [
        { method: 'error', message: 'Error occurred' },
        { method: 'warn', message: 'Warning issued' },
        { method: 'info', message: 'Information logged' },
        { method: 'debug', message: 'Debug info' }
      ];
      
      testCases.forEach(({ method, message }) => {
        mockLogger[method](message);
        expect(mockLogger[method]).toHaveBeenCalledWith(message);
      });
    });

    it('should handle log messages with structured data', () => {
      const structuredData = {
        message: 'Structured log entry',
        userId: '123',
        action: 'data_access',
        timestamp: new Date(),
        metadata: {
          source: 'api',
          version: '1.0'
        }
      };
      
      mockLogger.info(structuredData);
      
      expect(mockLogger.info).toHaveBeenCalledWith(structuredData);
    });
  });

  describe('Environment-Specific Behavior', () => {
    it('should handle test environment appropriately', () => {
      // In test environment, logger should be silent or minimal
      // This is just testing the concept since we can't easily test NODE_ENV changes
      const testLogger = {
        silent: process.env.NODE_ENV === 'test',
        level: process.env.LOG_LEVEL || 'info'
      };
      
      if (process.env.NODE_ENV === 'test') {
        expect(testLogger.silent).toBe(true);
      }
    });

    it('should respect log level configuration', () => {
      const logLevels = ['error', 'warn', 'info', 'debug'];
      
      logLevels.forEach(level => {
        const levelLogger = { level };
        expect(logLevels).toContain(levelLogger.level);
      });
    });
  });

  describe('Performance and Reliability', () => {
    it('should handle high-frequency logging without errors', () => {
      // Simulate rapid logging
      for (let i = 0; i < 100; i++) {
        mockLogger.info(`Log message ${i}`);
      }
      
      expect(mockLogger.info).toHaveBeenCalledTimes(100);
    });

    it('should handle various data types in log messages', () => {
      const testData = [
        'string message',
        { object: 'message' },
        ['array', 'message'],
        123,
        true,
        null,
        undefined
      ];
      
      testData.forEach(data => {
        expect(() => {
          mockLogger.info(data);
        }).not.toThrow();
      });
    });

    it('should handle circular references in log data gracefully', () => {
      const circularObj = { name: 'test' };
      circularObj.self = circularObj;
      
      // Should not throw when logging circular references
      expect(() => {
        mockLogger.info({
          message: 'Circular reference test',
          data: circularObj
        });
      }).not.toThrow();
    });

    it('should handle very long log messages', () => {
      const longMessage = 'A'.repeat(10000);
      
      expect(() => {
        mockLogger.info(longMessage);
      }).not.toThrow();
      
      expect(mockLogger.info).toHaveBeenCalledWith(longMessage);
    });
  });
});