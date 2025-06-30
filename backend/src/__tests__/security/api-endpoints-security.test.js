import request from 'supertest';
import app from '../../app.js';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import User from '../../models/User.js';
import Product from '../../models/Product.js';
import Order from '../../models/Order.js';

describe('API Endpoints Security Tests', () => {
  let adminToken, userToken, adminUser, normalUser;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/rdjcustoms-test');
    
    // Create test users
    adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'AdminPass123!',
      role: 'admin',
    });

    normalUser = await User.create({
      name: 'Normal User',
      email: 'user@example.com',
      password: 'UserPass123!',
      role: 'user',
    });

    // Generate tokens
    adminToken = jwt.sign(
      { userId: adminUser._id, email: adminUser.email, role: 'admin' },
      process.env.JWT_SECRET || 'test-secret'
    );

    userToken = jwt.sign(
      { userId: normalUser._id, email: normalUser.email, role: 'user' },
      process.env.JWT_SECRET || 'test-secret'
    );
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  });

  describe('Authorization Security', () => {
    it('should protect admin endpoints from regular users', async () => {
      const adminEndpoints = [
        { method: 'get', path: '/api/admin/users' },
        { method: 'get', path: '/api/admin/orders' },
        { method: 'post', path: '/api/admin/products' },
        { method: 'delete', path: '/api/admin/users/123' },
        { method: 'get', path: '/api/admin/analytics' },
      ];

      for (const endpoint of adminEndpoints) {
        const response = await request(app)
          [endpoint.method](endpoint.path)
          .set('Authorization', `Bearer ${userToken}`);

        expect(response.status).toBe(403);
        expect(response.body.error).toMatch(/forbidden|unauthorized|admin/i);
      }
    });

    it('should require authentication for protected endpoints', async () => {
      const protectedEndpoints = [
        { method: 'get', path: '/api/users/profile' },
        { method: 'put', path: '/api/users/profile' },
        { method: 'post', path: '/api/orders' },
        { method: 'get', path: '/api/orders/my-orders' },
      ];

      for (const endpoint of protectedEndpoints) {
        const response = await request(app)[endpoint.method](endpoint.path);
        
        expect(response.status).toBe(401);
        expect(response.body.error).toMatch(/unauthorized|authentication|token/i);
      }
    });

    it('should allow public access to designated endpoints', async () => {
      const publicEndpoints = [
        { method: 'get', path: '/api/products' },
        { method: 'get', path: '/api/products/search' },
        { method: 'post', path: '/api/auth/login' },
        { method: 'post', path: '/api/auth/register' },
      ];

      for (const endpoint of publicEndpoints) {
        const response = await request(app)[endpoint.method](endpoint.path);
        
        // Should not return 401 (might return 400 for missing data)
        expect(response.status).not.toBe(401);
      }
    });
  });

  describe('Input Validation Security', () => {
    it('should validate and sanitize product creation inputs', async () => {
      const maliciousInputs = [
        {
          name: '<script>alert("XSS")</script>Product',
          description: 'Description<img src=x onerror=alert("XSS")>',
          price: '"; DROP TABLE products; --',
          category: ['<script>category</script>'],
        },
        {
          name: 'Product${process.exit(1)}',
          description: 'Description`rm -rf /`',
          price: 'NaN',
          category: { $ne: null },
        },
      ];

      for (const input of maliciousInputs) {
        const response = await request(app)
          .post('/api/products')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(input);

        expect(response.status).toBe(400);
        expect(response.body.error).toMatch(/validation|invalid/i);
      }
    });

    it('should prevent MongoDB injection in queries', async () => {
      // Create a test product
      const product = await Product.create({
        name: 'Test Product',
        price: 99.99,
        category: 'electronics',
      });

      const injectionAttempts = [
        '/api/products?category[$ne]=null',
        '/api/products?price[$gt]=0',
        '/api/products?name[$regex]=.*',
        `/api/products/${product._id}?$where=this.price > 0`,
      ];

      for (const path of injectionAttempts) {
        const response = await request(app).get(path);
        
        // Should either sanitize the input or reject it
        if (response.status === 200) {
          // If accepted, verify no injection occurred
          expect(response.body).not.toContain('$');
        } else {
          expect(response.status).toBe(400);
        }
      }
    });

    it('should limit request body size', async () => {
      const largePayload = {
        name: 'Product',
        description: 'x'.repeat(10 * 1024 * 1024), // 10MB string
        price: 99.99,
      };

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(largePayload);

      expect(response.status).toBe(413); // Payload Too Large
    });
  });

  describe('Rate Limiting Security', () => {
    it('should implement rate limiting on sensitive endpoints', async () => {
      const requests = [];
      
      // Make many rapid requests
      for (let i = 0; i < 20; i++) {
        requests.push(
          request(app)
            .post('/api/auth/login')
            .send({ email: 'test@example.com', password: 'wrong' })
        );
      }

      const responses = await Promise.all(requests);
      
      // Some requests should be rate limited
      const rateLimited = responses.filter(r => r.status === 429);
      expect(rateLimited.length).toBeGreaterThan(0);
    });

    it('should have stricter limits for authentication endpoints', async () => {
      const authRequests = [];
      const regularRequests = [];

      // Auth endpoint requests
      for (let i = 0; i < 10; i++) {
        authRequests.push(
          request(app)
            .post('/api/auth/login')
            .send({ email: 'test@example.com', password: 'test' })
        );
      }

      // Regular endpoint requests
      for (let i = 0; i < 10; i++) {
        regularRequests.push(request(app).get('/api/products'));
      }

      const [authResponses, regularResponses] = await Promise.all([
        Promise.all(authRequests),
        Promise.all(regularRequests),
      ]);

      const authRateLimited = authResponses.filter(r => r.status === 429).length;
      const regularRateLimited = regularResponses.filter(r => r.status === 429).length;

      // Auth endpoints should be rate limited more aggressively
      expect(authRateLimited).toBeGreaterThanOrEqual(regularRateLimited);
    });
  });

  describe('CORS Security', () => {
    it('should enforce CORS policy', async () => {
      const maliciousOrigins = [
        'http://evil-site.com',
        'https://malicious.example.com',
        'http://localhost:1337',
      ];

      for (const origin of maliciousOrigins) {
        const response = await request(app)
          .post('/api/orders')
          .set('Origin', origin)
          .set('Authorization', `Bearer ${userToken}`)
          .send({ items: [] });

        // Check CORS headers
        const allowedOrigin = response.headers['access-control-allow-origin'];
        if (allowedOrigin) {
          expect(allowedOrigin).not.toBe(origin);
        }
      }
    });

    it('should allow legitimate origins', async () => {
      const allowedOrigins = [
        process.env.FRONTEND_URL || 'http://localhost:3000',
      ];

      for (const origin of allowedOrigins) {
        const response = await request(app)
          .get('/api/products')
          .set('Origin', origin);

        const allowedOrigin = response.headers['access-control-allow-origin'];
        expect(allowedOrigin).toBe(origin);
      }
    });
  });

  describe('Data Exposure Prevention', () => {
    it('should not expose sensitive user data', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.password).toBeUndefined();
      expect(response.body.resetPasswordToken).toBeUndefined();
      expect(response.body.__v).toBeUndefined();
    });

    it('should not expose internal error details', async () => {
      // Trigger an error by sending invalid ObjectId
      const response = await request(app)
        .get('/api/products/invalid-object-id')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.body.error).toBeDefined();
      expect(response.body.error).not.toMatch(/CastError|MongoDB|mongoose/i);
      expect(response.body.stack).toBeUndefined();
    });

    it('should sanitize error messages', async () => {
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ price: 'invalid' }); // Invalid data to trigger error

      expect(response.status).toBe(400);
      expect(response.body.error).toMatch(/validation|invalid/i);
      expect(response.body.error).not.toContain('CastError');
      expect(response.body.error).not.toContain('path:');
    });
  });

  describe('HTTP Security Headers', () => {
    it('should set security headers', async () => {
      const response = await request(app).get('/api/products');

      // Check for security headers
      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-frame-options']).toMatch(/DENY|SAMEORIGIN/);
      expect(response.headers['x-xss-protection']).toBe('1; mode=block');
      expect(response.headers['strict-transport-security']).toBeDefined();
    });

    it('should not expose server information', async () => {
      const response = await request(app).get('/api/products');

      expect(response.headers['x-powered-by']).toBeUndefined();
      expect(response.headers['server']).not.toMatch(/Express|Node/i);
    });
  });

  describe('API Versioning Security', () => {
    it('should handle API version properly', async () => {
      const response = await request(app)
        .get('/api/v1/products')
        .set('Accept', 'application/json');

      // Should either support versioning or redirect to current version
      expect([200, 301, 302, 404]).toContain(response.status);
    });
  });

  describe('Request Forgery Protection', () => {
    it('should validate request origin for state-changing operations', async () => {
      const stateChangingEndpoints = [
        { method: 'post', path: '/api/orders' },
        { method: 'put', path: '/api/users/profile' },
        { method: 'delete', path: '/api/orders/123' },
      ];

      for (const endpoint of stateChangingEndpoints) {
        const response = await request(app)
          [endpoint.method](endpoint.path)
          .set('Authorization', `Bearer ${userToken}`)
          .set('Origin', 'http://malicious-site.com')
          .send({});

        // Should either reject or not include CORS headers for malicious origin
        if (response.headers['access-control-allow-origin']) {
          expect(response.headers['access-control-allow-origin']).not.toBe('http://malicious-site.com');
        }
      }
    });
  });

  describe('Business Logic Security', () => {
    it('should prevent price manipulation', async () => {
      const product = await Product.create({
        name: 'Test Product',
        price: 99.99,
        stock: 10,
      });

      // Try to order with manipulated price
      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          items: [{
            product: product._id,
            quantity: 1,
            price: 0.01, // Attempting to set low price
          }],
        });

      if (response.status === 201) {
        // If order created, verify price wasn't manipulated
        const order = await Order.findById(response.body.order._id);
        expect(order.items[0].price).toBe(product.price);
      }
    });

    it('should prevent quantity manipulation', async () => {
      const product = await Product.create({
        name: 'Limited Product',
        price: 50,
        stock: 5,
      });

      // Try to order more than available
      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          items: [{
            product: product._id,
            quantity: 100, // More than stock
          }],
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toMatch(/stock|quantity|available/i);
    });
  });

  describe('File Upload Security', () => {
    it('should validate file uploads', async () => {
      const maliciousFilenames = [
        '../../../etc/passwd',
        'shell.php',
        'virus.exe',
        '.htaccess',
        '../../config.json',
      ];

      for (const filename of maliciousFilenames) {
        const response = await request(app)
          .post('/api/upload')
          .set('Authorization', `Bearer ${adminToken}`)
          .attach('file', Buffer.from('malicious content'), filename);

        expect([400, 403, 415]).toContain(response.status);
      }
    });
  });
});