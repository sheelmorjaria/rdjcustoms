import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../app.js';
import User from '../../models/User.js';
import Referral from '../../models/Referral.js';
import Reward from '../../models/Reward.js';
import Order from '../../models/Order.js';

describe('Referral Controller - Integration Tests', () => {
  let testUser;
  let referrerUser;
  let authToken;
  let referrerToken;

  beforeAll(async () => {
    // Connect to test database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/rdjcustoms_test');
    }
  });

  afterAll(async () => {
    // Close database connection
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  });

  beforeEach(async () => {
    // Clean up collections
    await User.deleteMany({});
    await Referral.deleteMany({});
    await Reward.deleteMany({});
    await Order.deleteMany({});

    // Create referrer user with referral code
    referrerUser = await User.create({
      firstName: 'John',
      lastName: 'Referrer',
      email: 'referrer@test.com',
      password: 'password123',
      referralCode: 'JOHNREF123',
      referralStats: {
        totalReferrals: 0,
        successfulReferrals: 0,
        totalRewards: 0
      }
    });

    // Create test user (referee)
    testUser = await User.create({
      firstName: 'Jane',
      lastName: 'Referee',
      email: 'referee@test.com',
      password: 'password123'
    });

    // Get auth tokens
    const referrerResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'referrer@test.com',
        password: 'password123'
      });
    referrerToken = referrerResponse.body.token;

    const userResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'referee@test.com',
        password: 'password123'
      });
    authToken = userResponse.body.token;
  });

  afterEach(async () => {
    // Clean up collections after each test
    await User.deleteMany({});
    await Referral.deleteMany({});
    await Reward.deleteMany({});
    await Order.deleteMany({});
  });

  describe('GET /api/referral/validate/:code', () => {
    it('should validate existing referral code', async () => {
      const response = await request(app)
        .get('/api/referral/validate/JOHNREF123')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.isValid).toBe(true);
      expect(response.body.data.referrerName).toBe('John R.');
      expect(response.body.data.message).toBe('Valid referral code');
    });

    it('should return invalid for non-existent referral code', async () => {
      const response = await request(app)
        .get('/api/referral/validate/INVALID123')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.isValid).toBe(false);
      expect(response.body.data.message).toBe('Invalid referral code');
    });

    it('should return validation error for invalid format', async () => {
      const response = await request(app)
        .get('/api/referral/validate/123') // Too short
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('POST /api/referral/track/:referralCode', () => {
    it('should track referral click successfully', async () => {
      const response = await request(app)
        .post('/api/referral/track/JOHNREF123')
        .send({
          source: 'direct'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Referral click tracked successfully');

      // Verify referral was created in database
      const referral = await Referral.findOne({ referralCode: 'JOHNREF123' });
      expect(referral).toBeTruthy();
      expect(referral.referrerId.toString()).toBe(referrerUser._id.toString());
      expect(referral.clickCount).toBe(1);
      expect(referral.source).toBe('direct');
    });

    it('should increment click count for existing referral', async () => {
      // First click
      await request(app)
        .post('/api/referral/track/JOHNREF123')
        .send({ source: 'direct' })
        .expect(200);

      // Second click
      await request(app)
        .post('/api/referral/track/JOHNREF123')
        .send({ source: 'email' })
        .expect(200);

      // Verify click count increased
      const referral = await Referral.findOne({ referralCode: 'JOHNREF123' });
      expect(referral.clickCount).toBe(2);
    });

    it('should return error for invalid referral code', async () => {
      const response = await request(app)
        .post('/api/referral/track/INVALID123')
        .send({
          source: 'direct'
        })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid referral code');
    });

    it('should validate source parameter', async () => {
      const response = await request(app)
        .post('/api/referral/track/JOHNREF123')
        .send({
          source: 'invalid_source'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('GET /api/referral/program-settings', () => {
    it('should return referral program settings', async () => {
      const response = await request(app)
        .get('/api/referral/program-settings')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.referralSettings).toBeDefined();
      expect(response.body.data.referralSettings.minimumOrderValue).toBe(50);
      expect(response.body.data.referralSettings.referrerReward).toBeDefined();
      expect(response.body.data.referralSettings.refereeReward).toBeDefined();
      expect(response.body.data.referralSettings.cookieExpiryDays).toBe(60);
    });
  });

  describe('Referral Registration Process', () => {
    it('should process referral registration after user signup with ref parameter', async () => {
      // Create a referral click first
      await request(app)
        .post('/api/referral/track/JOHNREF123')
        .send({ source: 'direct' });

      // Register new user with referral code in URL
      const response = await request(app)
        .post('/api/auth/register?ref=JOHNREF123')
        .send({
          firstName: 'New',
          lastName: 'User',
          email: 'newuser@test.com',
          password: 'password123',
          confirmPassword: 'password123'
        })
        .expect(201);

      expect(response.body.success).toBe(true);

      // Wait for async referral processing
      await new Promise(resolve => setTimeout(resolve, 100));

      // Verify referral was updated with registration
      const referral = await Referral.findOne({ referralCode: 'JOHNREF123' });
      expect(referral.status).toBe('registered');
      expect(referral.refereeEmail).toBe('newuser@test.com');
      expect(referral.registrationDate).toBeTruthy();
    });
  });

  describe('Referral Qualification Process', () => {
    beforeEach(async () => {
      // Create a referral record
      await Referral.create({
        referrerId: referrerUser._id,
        refereeId: testUser._id,
        referralCode: 'JOHNREF123',
        refereeEmail: testUser.email,
        status: 'registered',
        registrationDate: new Date(),
        clickCount: 1
      });
    });

    it('should qualify referral when order meets minimum value', async () => {
      // Create an order that meets minimum value
      const order = await Order.create({
        userId: testUser._id,
        orderNumber: 'TEST001',
        items: [{
          productId: new mongoose.Types.ObjectId(),
          productName: 'Test Product',
          quantity: 1,
          unitPrice: 75.00,
          totalPrice: 75.00
        }],
        totalAmount: 75.00,
        paymentStatus: 'completed',
        status: 'processing'
      });

      // Import the qualification function and call it
      const { processReferralQualification } = await import('../referralController.js');
      const result = await processReferralQualification(testUser._id, order._id, 75.00);

      expect(result.success).toBe(true);

      // Verify referral was qualified
      const referral = await Referral.findOne({ referralCode: 'JOHNREF123' });
      expect(referral.status).toBe('qualified');
      expect(referral.qualifyingOrderId.toString()).toBe(order._id.toString());
      expect(referral.qualifyingOrderValue).toBe(75.00);

      // Verify reward was created
      const reward = await Reward.findOne({ userId: referrerUser._id });
      expect(reward).toBeTruthy();
      expect(reward.type).toBe('discount_percent');
      expect(reward.value).toBe(10);

      // Verify referrer stats were updated
      const updatedReferrer = await User.findById(referrerUser._id);
      expect(updatedReferrer.referralStats.successfulReferrals).toBe(1);
      expect(updatedReferrer.referralStats.totalRewards).toBe(10);
    });

    it('should not qualify referral when order below minimum value', async () => {
      const { processReferralQualification } = await import('../referralController.js');
      const result = await processReferralQualification(testUser._id, new mongoose.Types.ObjectId(), 25.00);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Order does not meet minimum value requirement');

      // Verify referral status unchanged
      const referral = await Referral.findOne({ referralCode: 'JOHNREF123' });
      expect(referral.status).toBe('registered');
    });

    it('should not qualify already qualified referral', async () => {
      // Update referral to qualified status
      await Referral.findOneAndUpdate(
        { referralCode: 'JOHNREF123' },
        { status: 'qualified' }
      );

      const { processReferralQualification } = await import('../referralController.js');
      const result = await processReferralQualification(testUser._id, new mongoose.Types.ObjectId(), 75.00);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Referral already qualified');
    });
  });

  describe('Referral Dashboard', () => {
    beforeEach(async () => {
      // Create referral data for dashboard
      await Referral.create({
        referrerId: referrerUser._id,
        refereeId: testUser._id,
        referralCode: 'JOHNREF123',
        refereeEmail: testUser.email,
        status: 'qualified',
        registrationDate: new Date(),
        qualificationDate: new Date(),
        qualifyingOrderValue: 75.00,
        clickCount: 3
      });

      await Reward.create({
        userId: referrerUser._id,
        referralId: new mongoose.Types.ObjectId(),
        type: 'discount_percent',
        value: 10,
        description: '10% discount on next order',
        isRedeemed: false,
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days
      });
    });

    it('should return dashboard data for authenticated user', async () => {
      // First, need to add dashboard route - this is missing from current implementation
      // For now, test the controller function directly
      const { getReferralDashboard } = await import('../referralController.js');
      
      const req = {
        user: { _id: referrerUser._id }
      };
      const res = {
        json: vi.fn(),
        status: vi.fn().mockReturnThis()
      };

      await getReferralDashboard(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          userStats: expect.objectContaining({
            referralCode: 'JOHNREF123',
            totalReferrals: expect.any(Number),
            successfulReferrals: expect.any(Number)
          }),
          referrals: expect.any(Array),
          rewards: expect.any(Array),
          programSettings: expect.any(Object)
        })
      });
    });
  });
});