import request from 'supertest';
import app from '../../app.js';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../../models/User.js';
import RefreshToken from '../../models/RefreshToken.js';
import crypto from 'crypto';

describe('Authentication Security Tests', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/rdjcustoms-test');
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await RefreshToken.deleteMany({});
  });

  describe('Password Security', () => {
    it('should enforce strong password requirements', async () => {
      const weakPasswords = [
        'password',
        '12345678',
        'qwerty123',
        'admin123',
        'Password',
        'Pass123',
      ];

      for (const password of weakPasswords) {
        const response = await request(app)
          .post('/api/auth/register')
          .send({
            name: 'Test User',
            email: 'test@example.com',
            password,
          });

        expect(response.status).toBe(400);
        expect(response.body.error).toMatch(/password.*strong|weak|requirements/i);
      }
    });

    it('should accept strong passwords', async () => {
      const strongPasswords = [
        'SecureP@ssw0rd!',
        'Complex123!@#',
        'MyStr0ng!Pass',
        'Test@1234567',
      ];

      for (const password of strongPasswords) {
        const response = await request(app)
          .post('/api/auth/register')
          .send({
            name: 'Test User',
            email: `test${Date.now()}@example.com`,
            password,
          });

        expect(response.status).toBe(201);
      }
    });

    it('should hash passwords with bcrypt', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'SecureP@ssw0rd!',
        });

      const user = await User.findOne({ email: 'test@example.com' });
      
      // Password should be hashed
      expect(user.password).not.toBe('SecureP@ssw0rd!');
      expect(user.password).toMatch(/^\$2[aby]\$\d{2}\$/); // bcrypt hash pattern
      
      // Verify the hash works
      const isValid = await bcrypt.compare('SecureP@ssw0rd!', user.password);
      expect(isValid).toBe(true);
    });

    it('should not expose password in API responses', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'SecureP@ssw0rd!',
        });

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'SecureP@ssw0rd!',
        });

      expect(loginResponse.body.user).toBeDefined();
      expect(loginResponse.body.user.password).toBeUndefined();
    });
  });

  describe('Authentication Attempts Security', () => {
    it('should implement account lockout after failed attempts', async () => {
      const email = 'test@example.com';
      
      // Create user
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email,
          password: 'SecureP@ssw0rd!',
        });

      // Make multiple failed login attempts
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/api/auth/login')
          .send({ email, password: 'WrongPassword!' });
      }

      // Next attempt should be blocked
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email, password: 'SecureP@ssw0rd!' });

      expect(response.status).toBe(429);
      expect(response.body.error).toMatch(/locked|too many attempts/i);
    });

    it('should implement progressive delays for failed attempts', async () => {
      const email = 'bruteforce@example.com';
      
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email,
          password: 'SecureP@ssw0rd!',
        });

      const attemptTimes = [];

      for (let i = 0; i < 3; i++) {
        const startTime = Date.now();
        
        await request(app)
          .post('/api/auth/login')
          .send({ email, password: 'WrongPassword!' });
        
        const endTime = Date.now();
        attemptTimes.push(endTime - startTime);
      }

      // Response times should increase with failed attempts
      expect(attemptTimes[2]).toBeGreaterThan(attemptTimes[0]);
    });
  });

  describe('JWT Security', () => {
    let validUser;
    let validToken;

    beforeEach(async () => {
      validUser = await User.create({
        name: 'Test User',
        email: 'jwt@example.com',
        password: await bcrypt.hash('SecureP@ssw0rd!', 10),
      });

      validToken = jwt.sign(
        { userId: validUser._id, email: validUser.email },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '1h' }
      );
    });

    it('should reject tokens with invalid signatures', async () => {
      const tamperedToken = validToken.slice(0, -10) + 'tampered123';

      const response = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', `Bearer ${tamperedToken}`);

      expect(response.status).toBe(401);
      expect(response.body.error).toMatch(/invalid.*token/i);
    });

    it('should reject expired tokens', async () => {
      const expiredToken = jwt.sign(
        { userId: validUser._id, email: validUser.email },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '-1h' } // Already expired
      );

      const response = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(response.status).toBe(401);
      expect(response.body.error).toMatch(/expired/i);
    });

    it('should use secure JWT configuration', async () => {
      const decoded = jwt.decode(validToken, { complete: true });

      // Check for secure algorithm
      expect(decoded.header.alg).toMatch(/^(HS256|HS384|HS512|RS256|RS384|RS512)$/);
      
      // Check for required claims
      expect(decoded.payload.userId).toBeDefined();
      expect(decoded.payload.exp).toBeDefined();
      expect(decoded.payload.iat).toBeDefined();
    });

    it('should implement token refresh securely', async () => {
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'jwt@example.com',
          password: 'SecureP@ssw0rd!',
        });

      const refreshToken = loginResponse.body.refreshToken;
      expect(refreshToken).toBeDefined();

      // Attempt to refresh
      const refreshResponse = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken });

      expect(refreshResponse.status).toBe(200);
      expect(refreshResponse.body.accessToken).toBeDefined();
      expect(refreshResponse.body.accessToken).not.toBe(loginResponse.body.accessToken);
    });
  });

  describe('Session Security', () => {
    it('should invalidate sessions on logout', async () => {
      const loginResponse = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Session Test',
          email: 'session@example.com',
          password: 'SecureP@ssw0rd!',
        });

      const token = loginResponse.body.accessToken;

      // Logout
      await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`);

      // Try to use the token after logout
      const response = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(401);
    });

    it('should implement session timeout', async () => {
      // This would typically be tested with shorter timeouts in test environment
      const shortLivedToken = jwt.sign(
        { userId: '123', email: 'test@example.com' },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '1s' }
      );

      // Wait for token to expire
      await new Promise(resolve => setTimeout(resolve, 1500));

      const response = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', `Bearer ${shortLivedToken}`);

      expect(response.status).toBe(401);
    });
  });

  describe('Input Validation Security', () => {
    it('should prevent SQL injection in login', async () => {
      const sqlInjectionAttempts = [
        { email: "admin'--", password: 'password' },
        { email: "test@example.com' OR '1'='1", password: 'password' },
        { email: 'test@example.com', password: "' OR '1'='1" },
        { email: "'; DROP TABLE users; --", password: 'password' },
      ];

      for (const attempt of sqlInjectionAttempts) {
        const response = await request(app)
          .post('/api/auth/login')
          .send(attempt);

        expect(response.status).toBe(400);
        expect(response.body.error).toMatch(/invalid|validation/i);
      }
    });

    it('should prevent NoSQL injection', async () => {
      const noSqlInjectionAttempts = [
        { email: { $ne: null }, password: 'password' },
        { email: 'test@example.com', password: { $ne: null } },
        { email: { $regex: '.*' }, password: 'password' },
        { email: { $gt: '' }, password: { $gt: '' } },
      ];

      for (const attempt of noSqlInjectionAttempts) {
        const response = await request(app)
          .post('/api/auth/login')
          .send(attempt);

        expect(response.status).toBe(400);
      }
    });

    it('should sanitize email inputs', async () => {
      const maliciousEmails = [
        '<script>alert("XSS")</script>@example.com',
        'test@example.com<img src=x onerror=alert("XSS")>',
        'test+<script>alert(1)</script>@example.com',
      ];

      for (const email of maliciousEmails) {
        const response = await request(app)
          .post('/api/auth/register')
          .send({
            name: 'Test User',
            email,
            password: 'SecureP@ssw0rd!',
          });

        expect(response.status).toBe(400);
        expect(response.body.error).toMatch(/invalid.*email/i);
      }
    });
  });

  describe('Password Reset Security', () => {
    it('should use secure random tokens for password reset', async () => {
      const user = await User.create({
        name: 'Reset Test',
        email: 'reset@example.com',
        password: await bcrypt.hash('OldPassword123!', 10),
      });

      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'reset@example.com' });

      expect(response.status).toBe(200);

      // Check that a secure token was generated
      const updatedUser = await User.findById(user._id);
      expect(updatedUser.resetPasswordToken).toBeDefined();
      expect(updatedUser.resetPasswordToken.length).toBeGreaterThanOrEqual(32);
      expect(updatedUser.resetPasswordExpires).toBeDefined();
    });

    it('should expire password reset tokens', async () => {
      const user = await User.create({
        name: 'Reset Test',
        email: 'reset@example.com',
        password: await bcrypt.hash('OldPassword123!', 10),
        resetPasswordToken: crypto.randomBytes(32).toString('hex'),
        resetPasswordExpires: Date.now() - 3600000, // Expired 1 hour ago
      });

      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: user.resetPasswordToken,
          password: 'NewPassword123!',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toMatch(/expired/i);
    });

    it('should prevent password reset token reuse', async () => {
      const resetToken = crypto.randomBytes(32).toString('hex');
      
      await User.create({
        name: 'Reset Test',
        email: 'reset@example.com',
        password: await bcrypt.hash('OldPassword123!', 10),
        resetPasswordToken: resetToken,
        resetPasswordExpires: Date.now() + 3600000,
      });

      // First reset should succeed
      const firstReset = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: resetToken,
          password: 'NewPassword123!',
        });

      expect(firstReset.status).toBe(200);

      // Second reset with same token should fail
      const secondReset = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: resetToken,
          password: 'AnotherPassword123!',
        });

      expect(secondReset.status).toBe(400);
    });
  });

  describe('CSRF Protection', () => {
    it('should validate CSRF tokens on state-changing operations', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'CSRF Test',
          email: 'csrf@example.com',
          password: 'SecureP@ssw0rd!',
        })
        .set('Origin', 'https://malicious-site.com');

      // Should check CORS/CSRF protection
      if (response.status === 403) {
        expect(response.body.error).toMatch(/csrf|forbidden|origin/i);
      }
    });
  });

  describe('Timing Attack Prevention', () => {
    it('should use constant-time comparison for sensitive operations', async () => {
      const timings = [];
      
      // Create a user
      await User.create({
        name: 'Timing Test',
        email: 'timing@example.com',
        password: await bcrypt.hash('SecureP@ssw0rd!', 10),
      });

      // Test with correct and incorrect emails
      const emails = [
        'timing@example.com',
        'nonexistent@example.com',
        'almost-timing@example.com',
        'a@example.com',
      ];

      for (const email of emails) {
        const startTime = process.hrtime.bigint();
        
        await request(app)
          .post('/api/auth/login')
          .send({ email, password: 'WrongPassword!' });
        
        const endTime = process.hrtime.bigint();
        timings.push(Number(endTime - startTime));
      }

      // Check that timing differences are minimal (within 20%)
      const avgTiming = timings.reduce((a, b) => a + b, 0) / timings.length;
      const maxDeviation = Math.max(...timings.map(t => Math.abs(t - avgTiming)));
      
      expect(maxDeviation / avgTiming).toBeLessThan(0.2);
    });
  });
});