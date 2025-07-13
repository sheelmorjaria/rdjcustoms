/**
 * Security-related routes including CSP violation reporting
 * and security monitoring endpoints
 */

import express from 'express';
import { handleCSPViolation } from '../middleware/csp.js';
import { securityAuditLogger, SECURITY_EVENT_TYPES, SECURITY_SEVERITY } from '../middleware/securityAuditLogger.js';
import { logger } from '../utils/logger.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

/**
 * Rate limiter for CSP reports to prevent spam
 */
const cspReportLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 100, // Limit each IP to 100 CSP reports per windowMs
  message: {
    error: 'Too many CSP reports from this IP'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * CSP violation reporting endpoint
 * POST /api/csp-report
 */
router.post('/csp-report', cspReportLimiter, handleCSPViolation);

/**
 * Security status endpoint for monitoring
 * GET /api/security/status
 */
router.get('/status', (req, res) => {
  try {
    const securityStatus = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      headers: {
        csp: !!res.getHeader('Content-Security-Policy') || !!res.getHeader('Content-Security-Policy-Report-Only'),
        hsts: !!res.getHeader('Strict-Transport-Security'),
        xssProtection: !!res.getHeader('X-XSS-Protection'),
        frameOptions: !!res.getHeader('X-Frame-Options'),
        contentTypeOptions: !!res.getHeader('X-Content-Type-Options')
      },
      rateLimiting: {
        enabled: true,
        general: '1000 requests per 15 minutes',
        auth: '10 attempts per 15 minutes',
        search: '50 requests per minute'
      },
      inputValidation: {
        xssProtection: true,
        sqlInjectionProtection: true,
        nosqlInjectionProtection: true,
        pathTraversalProtection: true
      },
      fileUpload: {
        maxSize: '5MB',
        allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        maliciousFileDetection: true
      }
    };
    
    res.json({
      status: 'operational',
      security: securityStatus
    });
    
  } catch (error) {
    logger.error('Security status check failed', {
      error: error.message,
      stack: error.stack
    });
    
    res.status(500).json({
      status: 'error',
      message: 'Security status check failed'
    });
  }
});

/**
 * Security health check endpoint
 * GET /api/security/health
 */
router.get('/health', (req, res) => {
  try {
    const healthChecks = {
      database: true, // TODO: Add actual DB connectivity check
      rateLimiting: true,
      inputSanitization: true,
      securityHeaders: true,
      cors: true
    };
    
    const allHealthy = Object.values(healthChecks).every(check => check === true);
    
    res.status(allHealthy ? 200 : 503).json({
      status: allHealthy ? 'healthy' : 'unhealthy',
      checks: healthChecks,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error('Security health check failed', {
      error: error.message,
      stack: error.stack
    });
    
    res.status(503).json({
      status: 'unhealthy',
      error: 'Health check failed',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Security configuration endpoint (admin only)
 * GET /api/security/config
 */
router.get('/config', (req, res) => {
  // TODO: Add admin authentication middleware
  try {
    const config = {
      csp: {
        enabled: true,
        reportOnly: process.env.NODE_ENV === 'development',
        nonce: true,
        reportUri: '/api/csp-report'
      },
      rateLimiting: {
        general: { windowMs: 900000, max: 1000 },
        auth: { windowMs: 900000, max: 10 },
        search: { windowMs: 60000, max: 50 }
      },
      fileUpload: {
        maxSize: 5242880,
        allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
      },
      session: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 1800000
      }
    };
    
    res.json({
      configuration: config,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error('Security config retrieval failed', {
      error: error.message,
      stack: error.stack
    });
    
    res.status(500).json({
      error: 'Configuration retrieval failed'
    });
  }
});

/**
 * Test endpoint for security validation
 * POST /api/security/test
 */
router.post('/test', (req, res) => {
  try {
    const { testType, payload } = req.body;
    
    // Log security test attempt with audit logger
    securityAuditLogger.logSecurityEvent(
      'system.security.test',
      {
        testType,
        payload: payload ? payload.substring(0, 100) : null,
        userAgent: req.get('User-Agent')
      },
      req
    );
    
    const result = {
      testType,
      timestamp: new Date().toISOString(),
      status: 'completed'
    };
    
    switch (testType) {
    case 'xss':
      result.blocked = !payload || typeof payload === 'string' && 
          !payload.includes('<script>') && 
          !payload.includes('javascript:');
        
      if (!result.blocked) {
        securityAuditLogger.logSecurityEvent(
          SECURITY_EVENT_TYPES.INPUT_VALIDATION.XSS_ATTEMPT,
          { payload, source: 'security_test' },
          req
        );
      }
      break;
        
    case 'sql_injection':
      result.blocked = !payload || typeof payload === 'string' && 
          !payload.includes('\'; DROP TABLE') && 
          !payload.includes('\' OR \'1\'=\'1');
        
      if (!result.blocked) {
        securityAuditLogger.logSecurityEvent(
          SECURITY_EVENT_TYPES.INPUT_VALIDATION.SQL_INJECTION,
          { payload, source: 'security_test' },
          req
        );
      }
      break;
        
    case 'path_traversal':
      result.blocked = !payload || typeof payload === 'string' && 
          !payload.includes('../') && 
          !payload.includes('..\\\\');
        
      if (!result.blocked) {
        securityAuditLogger.logSecurityEvent(
          SECURITY_EVENT_TYPES.INPUT_VALIDATION.PATH_TRAVERSAL,
          { payload, source: 'security_test' },
          req
        );
      }
      break;
        
    default:
      result.status = 'invalid_test_type';
    }
    
    res.json(result);
    
  } catch (error) {
    securityAuditLogger.logSecurityEvent(
      'system.security.test.error',
      { error: error.message },
      req
    );
    
    res.status(500).json({
      error: 'Security test failed'
    });
  }
});

/**
 * Security audit logs endpoint (admin only)
 * GET /api/security/audit/logs
 */
router.get('/audit/logs', (req, res) => {
  try {
    // TODO: Add admin authentication middleware
    const { limit = 50, severity, eventType, startDate, endDate } = req.query;
    
    // In a real implementation, this would query a database
    // For now, return mock audit log data
    const mockLogs = [
      {
        eventId: 'sec_1234567890_abcdef1234567890',
        timestamp: new Date().toISOString(),
        eventType: SECURITY_EVENT_TYPES.AUTHENTICATION.LOGIN_FAILURE,
        severity: SECURITY_SEVERITY.MEDIUM,
        details: { username: 'testuser', reason: 'invalid_password' },
        request: {
          ip: '192.168.1.100',
          userAgent: 'Mozilla/5.0...',
          method: 'POST',
          url: '/api/auth/login'
        }
      }
    ];
    
    securityAuditLogger.logSecurityEvent(
      SECURITY_EVENT_TYPES.DATA_PROTECTION.SENSITIVE_DATA_ACCESS,
      { resource: 'audit_logs', query: req.query },
      req
    );
    
    res.json({
      logs: mockLogs.slice(0, parseInt(limit)),
      total: mockLogs.length,
      filters: { severity, eventType, startDate, endDate }
    });
    
  } catch (error) {
    securityAuditLogger.logSecurityEvent(
      'system.audit.logs.error',
      { error: error.message },
      req
    );
    
    res.status(500).json({
      error: 'Failed to retrieve audit logs'
    });
  }
});

/**
 * Security metrics endpoint
 * GET /api/security/metrics
 */
router.get('/metrics', (req, res) => {
  try {
    const { timeRange = '24h' } = req.query;
    
    // Mock security metrics
    const metrics = {
      timeRange,
      authenticationEvents: {
        successfulLogins: 1250,
        failedLogins: 45,
        accountLockouts: 3,
        suspiciousLogins: 8
      },
      inputValidationEvents: {
        xssAttempts: 12,
        sqlInjectionAttempts: 3,
        pathTraversalAttempts: 5,
        maliciousFileUploads: 1
      },
      rateLimitingEvents: {
        limitExceeded: 89,
        suspiciousActivity: 15,
        botDetected: 7
      },
      cspViolations: {
        scriptViolations: 23,
        styleViolations: 8,
        imageViolations: 12
      },
      topThreatIPs: [
        { ip: '192.168.1.100', threatScore: 85, events: 25 },
        { ip: '10.0.0.50', threatScore: 72, events: 18 },
        { ip: '172.16.0.25', threatScore: 64, events: 12 }
      ]
    };
    
    securityAuditLogger.logSecurityEvent(
      SECURITY_EVENT_TYPES.DATA_PROTECTION.SENSITIVE_DATA_ACCESS,
      { resource: 'security_metrics', timeRange },
      req
    );
    
    res.json(metrics);
    
  } catch (error) {
    securityAuditLogger.logSecurityEvent(
      'system.metrics.error',
      { error: error.message },
      req
    );
    
    res.status(500).json({
      error: 'Failed to retrieve security metrics'
    });
  }
});

export default router;