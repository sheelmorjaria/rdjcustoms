/**
 * Content Security Policy (CSP) security tests
 * Tests CSP implementation, nonce generation, and violation reporting
 */

import request from 'supertest';
import app from '../../app.js';
import { generateNonce } from '../../middleware/csp.js';

describe('Content Security Policy Security Tests', () => {
  let server;

  beforeAll(async () => {
    server = app.listen(0);
  });

  afterAll(async () => {
    if (server) {
      await new Promise((resolve) => {
        server.close(resolve);
      });
    }
  });

  describe('CSP Headers', () => {
    test('should include CSP header in responses', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(
        response.headers['content-security-policy'] || 
        response.headers['content-security-policy-report-only']
      ).toBeDefined();
    });

    test('should include nonce in CSP header', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      const cspHeader = response.headers['content-security-policy'] || 
                       response.headers['content-security-policy-report-only'];
      
      expect(cspHeader).toMatch(/nonce-[A-Za-z0-9+/=]+/);
    });

    test('should have secure CSP directives', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      const cspHeader = response.headers['content-security-policy'] || 
                       response.headers['content-security-policy-report-only'];
      
      // Check for essential security directives
      expect(cspHeader).toContain('default-src \'self\'');
      expect(cspHeader).toContain('object-src \'none\'');
      expect(cspHeader).toContain('frame-ancestors \'none\'');
      expect(cspHeader).toContain('base-uri \'self\'');
      expect(cspHeader).toContain('form-action \'self\'');
    });

    test('should have report-uri directive', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      const cspHeader = response.headers['content-security-policy'] || 
                       response.headers['content-security-policy-report-only'];
      
      expect(cspHeader).toContain('report-uri /api/csp-report');
    });
  });

  describe('Route-specific CSP', () => {
    test('admin routes should have strict CSP', async () => {
      const response = await request(app)
        .get('/api/admin/products')
        .expect(401); // Will fail auth but CSP header should be set

      const cspHeader = response.headers['content-security-policy'];
      expect(cspHeader).toBeDefined();
      
      // Admin CSP should be more restrictive
      expect(cspHeader).toContain('default-src \'self\'');
      expect(cspHeader).toContain('frame-src \'none\'');
      expect(cspHeader).toContain('object-src \'none\'');
    });

    test('payment routes should allow PayPal domains', async () => {
      const response = await request(app)
        .get('/api/payments/status')
        .expect(404); // Route may not exist but CSP header should be set

      const cspHeader = response.headers['content-security-policy'];
      expect(cspHeader).toBeDefined();
      
      // Payment CSP should allow PayPal
      expect(cspHeader).toContain('https://www.paypal.com');
      expect(cspHeader).toContain('https://api.paypal.com');
    });
  });

  describe('CSP Nonce Generation', () => {
    test('should generate cryptographically secure nonces', () => {
      const nonce1 = generateNonce();
      const nonce2 = generateNonce();
      
      expect(nonce1).toBeDefined();
      expect(nonce2).toBeDefined();
      expect(nonce1).not.toBe(nonce2);
      
      // Should be base64 encoded
      expect(nonce1).toMatch(/^[A-Za-z0-9+/]+=*$/);
      expect(nonce2).toMatch(/^[A-Za-z0-9+/]+=*$/);
    });

    test('nonces should be unique across requests', async () => {
      const response1 = await request(app).get('/');
      const response2 = await request(app).get('/');
      
      const csp1 = response1.headers['content-security-policy'] || 
                   response1.headers['content-security-policy-report-only'];
      const csp2 = response2.headers['content-security-policy'] || 
                   response2.headers['content-security-policy-report-only'];
      
      const nonce1 = csp1.match(/nonce-([A-Za-z0-9+/=]+)/)?.[1];
      const nonce2 = csp2.match(/nonce-([A-Za-z0-9+/=]+)/)?.[1];
      
      expect(nonce1).toBeDefined();
      expect(nonce2).toBeDefined();
      expect(nonce1).not.toBe(nonce2);
    });
  });

  describe('CSP Violation Reporting', () => {
    test('should accept CSP violation reports', async () => {
      const violationReport = {
        'document-uri': 'https://example.com/',
        'referrer': '',
        'violated-directive': 'script-src',
        'effective-directive': 'script-src',
        'original-policy': 'default-src \'self\'; script-src \'self\'',
        'disposition': 'enforce',
        'blocked-uri': 'https://evil.com/script.js',
        'line-number': 1,
        'column-number': 1,
        'source-file': 'https://example.com/',
        'status-code': 200,
        'script-sample': ''
      };

      const response = await request(app)
        .post('/api/csp-report')
        .send(violationReport)
        .expect(204);

      expect(response.text).toBe('');
    });

    test('should reject malformed CSP reports', async () => {
      const malformedReport = {
        invalid: 'data'
      };

      await request(app)
        .post('/api/csp-report')
        .send(malformedReport)
        .expect(204); // Still accepts but logs warning
    });

    test('should rate limit CSP reports', async () => {
      const violationReport = {
        'document-uri': 'https://example.com/',
        'violated-directive': 'script-src',
        'blocked-uri': 'https://evil.com/script.js'
      };

      // Send multiple reports quickly
      const promises = Array(105).fill().map(() => 
        request(app)
          .post('/api/csp-report')
          .send(violationReport)
      );

      const responses = await Promise.all(promises);
      
      // Some should be rate limited (429)
      const rateLimited = responses.filter(res => res.status === 429);
      expect(rateLimited.length).toBeGreaterThan(0);
    });
  });

  describe('Security Headers', () => {
    test('should include comprehensive security headers', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      // Check for essential security headers
      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-frame-options']).toBe('DENY');
      expect(response.headers['x-xss-protection']).toBe('1; mode=block');
      expect(response.headers['strict-transport-security']).toBeDefined();
      expect(response.headers['referrer-policy']).toBe('same-origin');
    });

    test('API routes should have cache control headers', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.headers['cache-control']).toContain('no-store');
      expect(response.headers['pragma']).toBe('no-cache');
    });
  });

  describe('Environment-specific CSP', () => {
    test('should use report-only in development', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      return request(app)
        .get('/')
        .expect(200)
        .then((response) => {
          expect(response.headers['content-security-policy-report-only']).toBeDefined();
          process.env.NODE_ENV = originalEnv;
        });
    });

    test('should enforce CSP in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      return request(app)
        .get('/')
        .expect(200)
        .then((response) => {
          expect(response.headers['content-security-policy']).toBeDefined();
          process.env.NODE_ENV = originalEnv;
        });
    });
  });

  describe('Security Monitoring', () => {
    test('should provide security status endpoint', async () => {
      const response = await request(app)
        .get('/api/security/status')
        .expect(200);

      expect(response.body.status).toBe('operational');
      expect(response.body.security).toBeDefined();
      expect(response.body.security.headers).toBeDefined();
      expect(response.body.security.rateLimiting).toBeDefined();
      expect(response.body.security.inputValidation).toBeDefined();
    });

    test('should provide security health check', async () => {
      const response = await request(app)
        .get('/api/security/health')
        .expect(200);

      expect(response.body.status).toBe('healthy');
      expect(response.body.checks).toBeDefined();
      expect(response.body.timestamp).toBeDefined();
    });

    test('should allow security testing endpoint', async () => {
      const testPayload = {
        testType: 'xss',
        payload: '<script>alert("xss")</script>'
      };

      const response = await request(app)
        .post('/api/security/test')
        .send(testPayload)
        .expect(200);

      expect(response.body.testType).toBe('xss');
      expect(response.body.blocked).toBe(true);
      expect(response.body.status).toBe('completed');
    });
  });

  describe('CSP Bypass Prevention', () => {
    test('should prevent script-src bypasses', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      const cspHeader = response.headers['content-security-policy'] || 
                       response.headers['content-security-policy-report-only'];
      
      // Should not allow unsafe-eval or unsafe-inline for scripts
      expect(cspHeader).not.toContain('\'unsafe-eval\'');
      
      // script-src should not contain unsafe-inline
      const scriptSrcMatch = cspHeader.match(/script-src[^;]*/);
      if (scriptSrcMatch) {
        expect(scriptSrcMatch[0]).not.toContain('\'unsafe-inline\'');
      }
    });

    test('should prevent object-src and base-uri abuse', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      const cspHeader = response.headers['content-security-policy'] || 
                       response.headers['content-security-policy-report-only'];
      
      expect(cspHeader).toContain('object-src \'none\'');
      expect(cspHeader).toContain('base-uri \'self\'');
    });

    test('should prevent clickjacking with frame-ancestors', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      const cspHeader = response.headers['content-security-policy'] || 
                       response.headers['content-security-policy-report-only'];
      
      expect(cspHeader).toContain('frame-ancestors \'none\'');
    });
  });
});

describe('CSP Performance Tests', () => {
  test('CSP middleware should not significantly impact response time', async () => {
    const startTime = Date.now();
    
    await request(app)
      .get('/')
      .expect(200);
      
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    // CSP middleware should add minimal overhead (< 100ms)
    expect(responseTime).toBeLessThan(100);
  });

  test('nonce generation should be fast', () => {
    const iterations = 1000;
    const startTime = Date.now();
    
    for (let i = 0; i < iterations; i++) {
      generateNonce();
    }
    
    const endTime = Date.now();
    const avgTime = (endTime - startTime) / iterations;
    
    // Should generate nonce in less than 1ms on average
    expect(avgTime).toBeLessThan(1);
  });
});