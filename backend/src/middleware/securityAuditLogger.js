/**
 * Security Audit Logging System
 * Comprehensive logging for security events, violations, and monitoring
 */

import { logger } from '../utils/logger.js';
import crypto from 'crypto';

/**
 * Security event types for categorization
 */
export const SECURITY_EVENT_TYPES = {
  AUTHENTICATION: {
    LOGIN_SUCCESS: 'auth.login.success',
    LOGIN_FAILURE: 'auth.login.failure',
    LOGOUT: 'auth.logout',
    TOKEN_ISSUED: 'auth.token.issued',
    TOKEN_EXPIRED: 'auth.token.expired',
    TOKEN_INVALID: 'auth.token.invalid',
    PASSWORD_RESET_REQUEST: 'auth.password.reset.request',
    PASSWORD_RESET_SUCCESS: 'auth.password.reset.success',
    ACCOUNT_LOCKED: 'auth.account.locked',
    SUSPICIOUS_LOGIN: 'auth.login.suspicious'
  },
  AUTHORIZATION: {
    ACCESS_DENIED: 'authz.access.denied',
    PRIVILEGE_ESCALATION: 'authz.privilege.escalation',
    UNAUTHORIZED_RESOURCE: 'authz.resource.unauthorized',
    ADMIN_ACCESS: 'authz.admin.access',
    API_KEY_USAGE: 'authz.apikey.usage'
  },
  INPUT_VALIDATION: {
    XSS_ATTEMPT: 'input.xss.attempt',
    SQL_INJECTION: 'input.sql.injection',
    NOSQL_INJECTION: 'input.nosql.injection',
    PATH_TRAVERSAL: 'input.path.traversal',
    COMMAND_INJECTION: 'input.command.injection',
    MALICIOUS_FILE: 'input.file.malicious',
    OVERSIZED_PAYLOAD: 'input.payload.oversized'
  },
  RATE_LIMITING: {
    LIMIT_EXCEEDED: 'rate.limit.exceeded',
    SUSPICIOUS_ACTIVITY: 'rate.activity.suspicious',
    BOT_DETECTED: 'rate.bot.detected',
    DDOS_ATTEMPT: 'rate.ddos.attempt'
  },
  CSP_VIOLATIONS: {
    SCRIPT_VIOLATION: 'csp.script.violation',
    STYLE_VIOLATION: 'csp.style.violation',
    IMAGE_VIOLATION: 'csp.image.violation',
    FRAME_VIOLATION: 'csp.frame.violation',
    CONNECT_VIOLATION: 'csp.connect.violation'
  },
  DATA_PROTECTION: {
    SENSITIVE_DATA_ACCESS: 'data.sensitive.access',
    DATA_EXPORT: 'data.export',
    DATA_MODIFICATION: 'data.modification',
    DATA_DELETION: 'data.deletion',
    UNAUTHORIZED_DATA_ACCESS: 'data.access.unauthorized'
  },
  PAYMENT_SECURITY: {
    PAYMENT_ATTEMPT: 'payment.attempt',
    PAYMENT_SUCCESS: 'payment.success',
    PAYMENT_FAILURE: 'payment.failure',
    SUSPICIOUS_TRANSACTION: 'payment.transaction.suspicious',
    WEBHOOK_VERIFICATION_FAILURE: 'payment.webhook.verification.failure',
    AMOUNT_TAMPERING: 'payment.amount.tampering'
  },
  SYSTEM_SECURITY: {
    CONFIG_CHANGE: 'system.config.change',
    SECURITY_HEADER_MISSING: 'system.header.missing',
    TLS_ERROR: 'system.tls.error',
    CERTIFICATE_ERROR: 'system.certificate.error',
    SYSTEM_COMPROMISE: 'system.compromise'
  }
};

/**
 * Security event severity levels
 */
export const SECURITY_SEVERITY = {
  CRITICAL: 'CRITICAL',
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW',
  INFO: 'INFO'
};

/**
 * Core security audit logger class
 */
class SecurityAuditLogger {
  constructor() {
    this.sessionMap = new Map(); // Track session activities
    this.ipReputation = new Map(); // Track IP reputation scores
    this.alertThresholds = {
      failedLogins: 5,
      rateLimitExceeded: 10,
      xssAttempts: 3,
      sqlInjectionAttempts: 1
    };
  }

  /**
   * Log a security event with comprehensive details
   */
  logSecurityEvent(eventType, details = {}, req = null) {
    const timestamp = new Date().toISOString();
    const eventId = this.generateEventId();
    
    // Extract request information
    const requestInfo = req ? this.extractRequestInfo(req) : {};
    
    // Calculate risk score
    const riskScore = this.calculateRiskScore(eventType, details, requestInfo);
    
    // Determine severity
    const severity = this.determineSeverity(eventType, riskScore);
    
    // Create comprehensive log entry
    const logEntry = {
      eventId,
      timestamp,
      eventType,
      severity,
      riskScore,
      details: this.sanitizeLogDetails(details),
      request: requestInfo,
      context: this.getSecurityContext(req),
      metadata: {
        environment: process.env.NODE_ENV,
        version: process.env.npm_package_version || '1.0.0',
        hostname: process.env.HOSTNAME || 'unknown'
      }
    };

    // Log based on severity
    this.writeSecurityLog(logEntry);
    
    // Update tracking maps
    this.updateSecurityTracking(eventType, requestInfo);
    
    // Check for alert conditions
    this.checkAlertConditions(eventType, requestInfo);
    
    return eventId;
  }

  /**
   * Generate unique event ID
   */
  generateEventId() {
    return `sec_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
  }

  /**
   * Extract relevant information from request
   */
  extractRequestInfo(req) {
    return {
      ip: req.ip || req.connection?.remoteAddress,
      userAgent: req.get('User-Agent'),
      method: req.method,
      url: req.originalUrl || req.url,
      headers: this.sanitizeHeaders(req.headers),
      sessionId: req.sessionID,
      userId: req.user?.id || req.user?._id,
      body: this.sanitizeRequestBody(req.body),
      query: this.sanitizeQuery(req.query),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Sanitize headers for logging (remove sensitive data)
   */
  sanitizeHeaders(headers) {
    const sanitized = { ...headers };
    const sensitiveHeaders = [
      'authorization',
      'cookie',
      'x-api-key',
      'x-auth-token',
      'x-csrf-token'
    ];
    
    sensitiveHeaders.forEach(header => {
      if (sanitized[header]) {
        sanitized[header] = '[REDACTED]';
      }
    });
    
    return sanitized;
  }

  /**
   * Sanitize request body for logging
   */
  sanitizeRequestBody(body) {
    if (!body || typeof body !== 'object') {
      return body;
    }
    
    const sanitized = { ...body };
    const sensitiveFields = [
      'password',
      'token',
      'secret',
      'apiKey',
      'creditCard',
      'ssn',
      'bankAccount'
    ];
    
    this.sanitizeObjectRecursive(sanitized, sensitiveFields);
    
    // Limit size of logged body
    const jsonString = JSON.stringify(sanitized);
    if (jsonString.length > 1000) {
      return { _truncated: true, _size: jsonString.length };
    }
    
    return sanitized;
  }

  /**
   * Recursively sanitize object fields
   */
  sanitizeObjectRecursive(obj, sensitiveFields) {
    Object.keys(obj).forEach(key => {
      if (sensitiveFields.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
        obj[key] = '[REDACTED]';
      } else if (obj[key] && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
        this.sanitizeObjectRecursive(obj[key], sensitiveFields);
      }
    });
  }

  /**
   * Sanitize query parameters
   */
  sanitizeQuery(query) {
    const sanitized = { ...query };
    const sensitiveParams = ['token', 'key', 'secret', 'password'];
    
    sensitiveParams.forEach(param => {
      if (sanitized[param]) {
        sanitized[param] = '[REDACTED]';
      }
    });
    
    return sanitized;
  }

  /**
   * Calculate risk score based on event type and context
   */
  calculateRiskScore(eventType, details, requestInfo) {
    let score = 0;
    
    // Base scores by event type category
    const categoryScores = {
      'auth.login.failure': 30,
      'input.xss.attempt': 80,
      'input.sql.injection': 90,
      'input.nosql.injection': 90,
      'input.path.traversal': 70,
      'rate.limit.exceeded': 40,
      'csp.script.violation': 60,
      'payment.webhook.verification.failure': 85,
      'authz.access.denied': 50
    };
    
    score += categoryScores[eventType] || 20;
    
    // IP reputation factor
    const ipScore = this.getIpReputationScore(requestInfo.ip);
    score += ipScore;
    
    // Time-based factors
    const hour = new Date().getHours();
    if (hour < 6 || hour > 22) { // Off-hours activity
      score += 10;
    }
    
    // Frequency factors
    const recentEvents = this.getRecentEventCount(eventType, requestInfo.ip);
    if (recentEvents > 3) {
      score += 20;
    }
    
    // Geographic factors (if available)
    if (details.geoLocation && this.isHighRiskLocation(details.geoLocation)) {
      score += 15;
    }
    
    return Math.min(score, 100); // Cap at 100
  }

  /**
   * Determine severity based on event type and risk score
   */
  determineSeverity(eventType, riskScore) {
    // Critical events
    const criticalEvents = [
      'input.sql.injection',
      'input.nosql.injection',
      'system.compromise',
      'authz.privilege.escalation'
    ];
    
    if (criticalEvents.includes(eventType) || riskScore >= 90) {
      return SECURITY_SEVERITY.CRITICAL;
    }
    
    // High severity
    if (riskScore >= 70 || eventType.includes('injection') || eventType.includes('xss')) {
      return SECURITY_SEVERITY.HIGH;
    }
    
    // Medium severity
    if (riskScore >= 50 || eventType.includes('auth.login.failure')) {
      return SECURITY_SEVERITY.MEDIUM;
    }
    
    // Low severity
    if (riskScore >= 30) {
      return SECURITY_SEVERITY.LOW;
    }
    
    return SECURITY_SEVERITY.INFO;
  }

  /**
   * Get security context information
   */
  getSecurityContext(req) {
    return {
      isAuthenticated: !!req.user,
      userRole: req.user?.role,
      sessionAge: req.sessionID ? this.getSessionAge(req.sessionID) : null,
      tlsVersion: req.connection?.getProtocol?.(),
      isSecure: req.secure,
      referrer: req.get('Referer'),
      origin: req.get('Origin')
    };
  }

  /**
   * Write security log based on severity
   */
  writeSecurityLog(logEntry) {
    switch (logEntry.severity) {
      case SECURITY_SEVERITY.CRITICAL:
        logger.error('SECURITY CRITICAL', logEntry);
        this.sendSecurityAlert(logEntry);
        break;
      case SECURITY_SEVERITY.HIGH:
        logger.warn('SECURITY HIGH', logEntry);
        this.sendSecurityAlert(logEntry);
        break;
      case SECURITY_SEVERITY.MEDIUM:
        logger.warn('SECURITY MEDIUM', logEntry);
        break;
      case SECURITY_SEVERITY.LOW:
        logger.info('SECURITY LOW', logEntry);
        break;
      case SECURITY_SEVERITY.INFO:
        logger.debug('SECURITY INFO', logEntry);
        break;
      default:
        logger.info('SECURITY EVENT', logEntry);
    }
  }

  /**
   * Send security alerts for high-priority events
   */
  sendSecurityAlert(logEntry) {
    // In a real implementation, this would send alerts via:
    // - Email
    // - Slack/Teams
    // - PagerDuty
    // - Security information and event management (SIEM) systems
    
    logger.warn('SECURITY ALERT TRIGGERED', {
      eventId: logEntry.eventId,
      eventType: logEntry.eventType,
      severity: logEntry.severity,
      riskScore: logEntry.riskScore,
      timestamp: logEntry.timestamp,
      requiresImmediateAttention: logEntry.severity === SECURITY_SEVERITY.CRITICAL
    });
  }

  /**
   * Update security tracking maps
   */
  updateSecurityTracking(eventType, requestInfo) {
    const ip = requestInfo.ip;
    if (!ip) return;
    
    // Update IP reputation
    const currentScore = this.ipReputation.get(ip) || 0;
    const penalty = this.getEventPenalty(eventType);
    this.ipReputation.set(ip, Math.min(currentScore + penalty, 100));
    
    // Clean old entries (keep only last 24 hours of data)
    this.cleanOldTrackingData();
  }

  /**
   * Get penalty score for event type
   */
  getEventPenalty(eventType) {
    const penalties = {
      'auth.login.failure': 5,
      'input.xss.attempt': 20,
      'input.sql.injection': 30,
      'rate.limit.exceeded': 10,
      'csp.script.violation': 15
    };
    
    return penalties[eventType] || 2;
  }

  /**
   * Check for alert conditions
   */
  checkAlertConditions(eventType, requestInfo) {
    const ip = requestInfo.ip;
    if (!ip) return;
    
    // Check for repeated failed logins
    if (eventType === SECURITY_EVENT_TYPES.AUTHENTICATION.LOGIN_FAILURE) {
      const recentFailures = this.getRecentEventCount(eventType, ip, 15 * 60 * 1000); // 15 minutes
      if (recentFailures >= this.alertThresholds.failedLogins) {
        this.logSecurityEvent('auth.account.locked', {
          reason: 'Repeated failed login attempts',
          attemptCount: recentFailures,
          ip
        });
      }
    }
    
    // Check for injection attempts
    if (eventType.includes('injection')) {
      const recentInjections = this.getRecentEventCount(eventType, ip, 60 * 60 * 1000); // 1 hour
      if (recentInjections >= this.alertThresholds.sqlInjectionAttempts) {
        this.logSecurityEvent('system.compromise', {
          reason: 'Multiple injection attempts detected',
          attemptCount: recentInjections,
          ip,
          eventType
        });
      }
    }
  }

  /**
   * Get recent event count for IP
   */
  getRecentEventCount(eventType, ip, timeWindow = 60 * 60 * 1000) {
    // In a real implementation, this would query a database or cache
    // For now, return a mock count
    return Math.floor(Math.random() * 3);
  }

  /**
   * Get IP reputation score
   */
  getIpReputationScore(ip) {
    return this.ipReputation.get(ip) || 0;
  }

  /**
   * Get session age in minutes
   */
  getSessionAge(sessionId) {
    const sessionStart = this.sessionMap.get(sessionId);
    if (!sessionStart) return null;
    
    return Math.floor((Date.now() - sessionStart) / (1000 * 60));
  }

  /**
   * Check if location is high risk
   */
  isHighRiskLocation(geoLocation) {
    // Simple implementation - in reality would use threat intelligence
    const highRiskCountries = ['CN', 'RU', 'NK', 'IR'];
    return highRiskCountries.includes(geoLocation.country);
  }

  /**
   * Clean old tracking data
   */
  cleanOldTrackingData() {
    const twentyFourHoursAgo = Date.now() - (24 * 60 * 60 * 1000);
    
    // Clean session map
    for (const [sessionId, startTime] of this.sessionMap.entries()) {
      if (startTime < twentyFourHoursAgo) {
        this.sessionMap.delete(sessionId);
      }
    }
    
    // Gradually decay IP reputation scores
    for (const [ip, score] of this.ipReputation.entries()) {
      const decayedScore = Math.max(0, score - 1);
      if (decayedScore === 0) {
        this.ipReputation.delete(ip);
      } else {
        this.ipReputation.set(ip, decayedScore);
      }
    }
  }

  /**
   * Sanitize log details to prevent log injection
   */
  sanitizeLogDetails(details) {
    if (typeof details === 'string') {
      return details.replace(/[\r\n\t]/g, ' ').substring(0, 500);
    }
    
    if (typeof details === 'object' && details !== null) {
      const sanitized = {};
      Object.keys(details).forEach(key => {
        const value = details[key];
        if (typeof value === 'string') {
          sanitized[key] = value.replace(/[\r\n\t]/g, ' ').substring(0, 200);
        } else if (typeof value === 'number' || typeof value === 'boolean') {
          sanitized[key] = value;
        } else if (value && typeof value === 'object') {
          sanitized[key] = this.sanitizeLogDetails(value);
        }
      });
      return sanitized;
    }
    
    return details;
  }
}

// Create singleton instance
const securityAuditLogger = new SecurityAuditLogger();

/**
 * Express middleware for automatic security logging
 */
export const securityAuditMiddleware = (options = {}) => {
  const {
    logAllRequests = false,
    logFailedAuth = true,
    logSuspiciousActivity = true
  } = options;

  return (req, res, next) => {
    // Store original methods
    const originalJson = res.json;
    const originalStatus = res.status;
    
    // Track request start time
    req.securityAuditStart = Date.now();
    
    // Override res.status to capture status codes
    res.status = function(code) {
      res.statusCode = code;
      return originalStatus.call(this, code);
    };
    
    // Override res.json to log responses
    res.json = function(data) {
      // Log based on response status
      if (logFailedAuth && res.statusCode === 401) {
        securityAuditLogger.logSecurityEvent(
          SECURITY_EVENT_TYPES.AUTHENTICATION.LOGIN_FAILURE,
          { statusCode: res.statusCode, responseData: data },
          req
        );
      }
      
      if (logSuspiciousActivity && res.statusCode === 429) {
        securityAuditLogger.logSecurityEvent(
          SECURITY_EVENT_TYPES.RATE_LIMITING.LIMIT_EXCEEDED,
          { statusCode: res.statusCode },
          req
        );
      }
      
      if (logAllRequests) {
        const duration = Date.now() - req.securityAuditStart;
        securityAuditLogger.logSecurityEvent(
          'system.request.completed',
          { 
            statusCode: res.statusCode, 
            duration,
            method: req.method,
            path: req.path
          },
          req
        );
      }
      
      return originalJson.call(this, data);
    };
    
    next();
  };
};

// Export the logger instance as default
export default securityAuditLogger;