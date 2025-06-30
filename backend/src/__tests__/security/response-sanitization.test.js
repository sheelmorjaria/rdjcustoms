/**
 * Response Sanitization Security Tests
 * Tests API response sanitization to prevent XSS and data leakage
 */

import request from 'supertest';
import express from 'express';
import { responseSanitization, sanitizeUserResponse, sanitizeProductResponse, sanitizeErrorMessage } from '../../middleware/responseSanitization.js';
import { sanitizeUserInput, escapeHtml, detectXSSPayload } from '../../utils/sanitization.js';

// Create test app
const createTestApp = (middleware) => {
  const app = express();
  app.use(express.json());
  
  if (middleware) {
    app.use(middleware);
  }
  
  return app;
};

describe('Response Sanitization Tests', () => {
  describe('Basic Response Sanitization', () => {
    test('should sanitize XSS in JSON responses', async () => {
      const app = createTestApp(responseSanitization());
      
      app.get('/test', (req, res) => {
        res.json({
          message: '<script>alert("xss")</script>Hello',
          description: 'Safe content',
          userInput: '<img src=x onerror=alert("xss")>'
        });
      });

      const response = await request(app)
        .get('/test')
        .expect(200);

      expect(response.body.message).not.toContain('<script>');
      expect(response.body.message).toContain('&lt;script&gt;');
      expect(response.body.userInput).not.toContain('onerror=');
      expect(response.body.description).toBe('Safe content');
    });

    test('should remove sensitive fields from responses', async () => {
      const app = createTestApp(responseSanitization());
      
      app.get('/user', (req, res) => {
        res.json({
          id: '123',
          email: 'user@example.com',
          password: 'secret123',
          apiKey: 'api_key_123',
          name: 'John Doe',
          sessionId: 'session_123'
        });
      });

      const response = await request(app)
        .get('/user')
        .expect(200);

      expect(response.body.password).toBeUndefined();
      expect(response.body.apiKey).toBeUndefined();
      expect(response.body.sessionId).toBeUndefined();
      expect(response.body.id).toBe('123');
      expect(response.body.email).toBe('user@example.com');
      expect(response.body.name).toBe('John Doe');
    });

    test('should sanitize nested objects and arrays', async () => {
      const app = createTestApp(responseSanitization());
      
      app.get('/nested', (req, res) => {
        res.json({
          users: [
            {
              name: '<script>alert("user1")</script>User1',
              password: 'secret'
            },
            {
              name: 'User2',
              profile: {
                bio: '<img src=x onerror=alert("bio")>Bio text',
                password: 'another_secret'
              }
            }
          ],
          metadata: {
            description: 'javascript:alert("metadata")',
            apiKey: 'secret_key'
          }
        });
      });

      const response = await request(app)
        .get('/nested')
        .expect(200);

      // Check array sanitization
      expect(response.body.users[0].name).toContain('&lt;script&gt;');
      expect(response.body.users[0].password).toBeUndefined();
      
      // Check nested object sanitization
      expect(response.body.users[1].profile.bio).not.toContain('onerror=');
      expect(response.body.users[1].profile.password).toBeUndefined();
      
      // Check metadata sanitization
      expect(response.body.metadata.description).not.toContain('javascript:');
      expect(response.body.metadata.apiKey).toBeUndefined();
    });

    test('should handle non-object responses safely', async () => {
      const app = createTestApp(responseSanitization());
      
      app.get('/string', (req, res) => {
        res.json('<script>alert("xss")</script>Simple string');
      });
      
      app.get('/number', (req, res) => {
        res.json(12345);
      });
      
      app.get('/boolean', (req, res) => {
        res.json(true);
      });

      const stringResponse = await request(app).get('/string').expect(200);
      expect(stringResponse.body).toContain('&lt;script&gt;');
      
      const numberResponse = await request(app).get('/number').expect(200);
      expect(numberResponse.body).toBe(12345);
      
      const booleanResponse = await request(app).get('/boolean').expect(200);
      expect(booleanResponse.body).toBe(true);
    });
  });

  describe('Error Response Sanitization', () => {
    test('should sanitize error messages in production', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      const app = createTestApp(responseSanitization({ sanitizeErrors: true }));
      
      app.get('/error', (req, res) => {
        res.status(400).json({
          error: {
            message: 'Database connection failed: mongodb://user:password@localhost',
            stack: 'Error stack trace with sensitive info'
          }
        });
      });

      const response = await request(app)
        .get('/error')
        .expect(400);

      expect(response.body.error).not.toContain('password@localhost');
      expect(response.body.error).toBe('Internal server error');
      
      process.env.NODE_ENV = originalEnv;
    });

    test('should preserve useful error info in development', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      const app = createTestApp(responseSanitization({ sanitizeErrors: true }));
      
      app.get('/dev-error', (req, res) => {
        res.status(400).json({
          error: {
            message: 'Validation failed for field "email"'
          }
        });
      });

      const response = await request(app)
        .get('/dev-error')
        .expect(400);

      expect(response.body.error).toContain('Validation failed');
      expect(response.body.error).toContain('email');
      
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Specific Response Sanitizers', () => {
    test('sanitizeUserResponse should clean user data', () => {
      const userData = {
        id: '123',
        email: 'user@example.com',
        name: '<script>alert("name")</script>John',
        password: 'secret123',
        role: 'user',
        apiKey: 'key123',
        profile: {
          bio: '<img src=x onerror=alert("bio")>My bio',
          secret: 'hidden'
        }
      };

      const sanitized = sanitizeUserResponse(userData);
      
      expect(sanitized.password).toBeUndefined();
      expect(sanitized.apiKey).toBeUndefined();
      expect(sanitized.name).toContain('&lt;script&gt;');
      expect(sanitized.email).toBe('user@example.com');
      expect(sanitized.role).toBe('user');
      expect(sanitized.profile.bio).not.toContain('onerror=');
    });

    test('sanitizeProductResponse should clean product data', () => {
      const productData = {
        id: 'prod123',
        name: '<script>alert("product")</script>Test Product',
        description: 'javascript:alert("desc")Product description',
        price: 99.99,
        images: ['<img src=x onerror=alert("img")>', 'safe-image.jpg'],
        adminNotes: 'Internal admin notes',
        secretKey: 'internal_key'
      };

      const sanitized = sanitizeProductResponse(productData);
      
      expect(sanitized.adminNotes).toBeUndefined();
      expect(sanitized.secretKey).toBeUndefined();
      expect(sanitized.name).toContain('&lt;script&gt;');
      expect(sanitized.description).not.toContain('javascript:');
      expect(sanitized.price).toBe(99.99);
      expect(sanitized.images[0]).not.toContain('onerror=');
      expect(sanitized.images[1]).toBe('safe-image.jpg');
    });
  });

  describe('Content Type Validation', () => {
    test('should set proper Content-Type headers', async () => {
      const app = createTestApp();
      
      // Import and use the content type middleware
      const { validateResponseContentType } = await import('../../middleware/responseSanitization.js');
      app.use(validateResponseContentType);
      
      app.get('/json', (req, res) => {
        res.json({ message: 'test' });
      });

      const response = await request(app)
        .get('/json')
        .expect(200);

      expect(response.headers['content-type']).toContain('application/json');
      expect(response.headers['content-type']).toContain('charset=utf-8');
      expect(response.headers['x-content-type-options']).toBe('nosniff');
    });
  });

  describe('Performance and Edge Cases', () => {
    test('should handle large nested objects without performance issues', async () => {
      const app = createTestApp(responseSanitization());
      
      // Create a large nested object
      const largeObject = {
        level1: {
          level2: {
            level3: {
              level4: {
                level5: {
                  data: Array(1000).fill().map((_, i) => ({
                    id: i,
                    content: `<script>alert(${i})</script>Content ${i}`
                  }))
                }
              }
            }
          }
        }
      };
      
      app.get('/large', (req, res) => {
        res.json(largeObject);
      });

      const startTime = Date.now();
      const response = await request(app)
        .get('/large')
        .expect(200);
      const endTime = Date.now();
      
      // Should complete within reasonable time (< 1 second)
      expect(endTime - startTime).toBeLessThan(1000);
      
      // Check that content is sanitized
      const firstItem = response.body.level1.level2.level3.level4.level5.data[0];
      expect(firstItem.content).toContain('&lt;script&gt;');
    });

    test('should handle circular reference protection', async () => {
      const app = createTestApp(responseSanitization());
      
      app.get('/circular', (req, res) => {
        const obj = { name: 'test' };
        obj.self = obj; // Create circular reference
        
        // This should not cause an infinite loop
        res.json({ safe: 'data', circular: obj });
      });

      await request(app)
        .get('/circular')
        .expect(200);
    });

    test('should handle null and undefined values', async () => {
      const app = createTestApp(responseSanitization());
      
      app.get('/nullish', (req, res) => {
        res.json({
          nullValue: null,
          undefinedValue: undefined,
          emptyString: '',
          zeroValue: 0,
          falseValue: false
        });
      });

      const response = await request(app)
        .get('/nullish')
        .expect(200);

      expect(response.body.nullValue).toBe(null);
      expect(response.body.undefinedValue).toBeUndefined();
      expect(response.body.emptyString).toBe('');
      expect(response.body.zeroValue).toBe(0);
      expect(response.body.falseValue).toBe(false);
    });
  });

  describe('Utility Functions', () => {
    test('sanitizeUserInput should prevent XSS', () => {
      const maliciousInput = '<script>alert("xss")</script>Hello';
      const sanitized = sanitizeUserInput(maliciousInput);
      
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).toContain('&lt;script&gt;');
      expect(detectXSSPayload(sanitized)).toBe(false);
    });

    test('escapeHtml should escape dangerous characters', () => {
      const input = '<>&"\'`=/';
      const escaped = escapeHtml(input);
      
      expect(escaped).toBe('&lt;&gt;&amp;&quot;&#x27;&#x60;&#x3D;&#x2F;');
    });

    test('sanitizeErrorMessage should mask sensitive error info', () => {
      const error = new Error('Database connection failed: mongodb://user:secret@localhost:27017/db');
      const sanitized = sanitizeErrorMessage(error, true);
      
      expect(sanitized).not.toContain('secret');
      expect(sanitized).not.toContain('mongodb://');
      expect(sanitized).toBe('Internal server error');
    });
  });

  describe('Token Masking', () => {
    test('should mask JWT tokens in responses', async () => {
      const app = createTestApp(responseSanitization());
      
      app.get('/auth', (req, res) => {
        res.json({
          user: {
            id: '123',
            email: 'user@example.com'
          },
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
          refreshToken: 'refresh_token_here'
        });
      });

      const response = await request(app)
        .get('/auth')
        .expect(200);

      expect(response.body.token).toContain('...');
      expect(response.body.token.length).toBeLessThan(50);
      expect(response.body.refreshToken).toContain('...');
      expect(response.body.user.email).toBe('user@example.com');
    });
  });
});