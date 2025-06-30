import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import Referral from '../Referral.js';
import User from '../User.js';

describe('Referral Model Tests', () => {
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
    await Referral.deleteMany({});
    await User.deleteMany({});
  });

  afterEach(async () => {
    await Referral.deleteMany({});
    await User.deleteMany({});
  });

  describe('Schema Validation', () => {
    it('should create referral with valid data', async () => {
      const referrerId = new mongoose.Types.ObjectId();
      
      const referralData = {
        referrerId,
        referralCode: 'TEST123456',
        ipAddress: '192.168.1.1',
        userAgent: 'Test Browser',
        source: 'direct',
        clickCount: 1,
        firstClickDate: new Date(),
        lastClickDate: new Date(),
        status: 'pending'
      };

      const referral = new Referral(referralData);
      await referral.save();

      expect(referral._id).toBeDefined();
      expect(referral.referrerId).toEqual(referrerId);
      expect(referral.referralCode).toBe('TEST123456');
      expect(referral.status).toBe('pending');
      expect(referral.clickCount).toBe(1);
    });

    it('should require referrerId', async () => {
      const referralData = {
        referralCode: 'TEST123456',
        status: 'pending'
      };

      const referral = new Referral(referralData);
      
      await expect(referral.save()).rejects.toThrow(/referrerId.*required/);
    });

    it('should require referralCode', async () => {
      const referralData = {
        referrerId: new mongoose.Types.ObjectId(),
        status: 'pending'
      };

      const referral = new Referral(referralData);
      
      await expect(referral.save()).rejects.toThrow(/referralCode.*required/);
    });

    it('should validate status enum values', async () => {
      const referralData = {
        referrerId: new mongoose.Types.ObjectId(),
        referralCode: 'TEST123456',
        status: 'invalid_status'
      };

      const referral = new Referral(referralData);
      
      await expect(referral.save()).rejects.toThrow(/is not a valid enum value/);
    });

    it('should accept valid status values', async () => {
      const validStatuses = ['pending', 'registered', 'qualified', 'rewarded', 'expired'];
      
      for (const status of validStatuses) {
        const referralData = {
          referrerId: new mongoose.Types.ObjectId(),
          referralCode: `TEST${status.toUpperCase()}`,
          status
        };

        const referral = new Referral(referralData);
        await referral.save();
        
        expect(referral.status).toBe(status);
        
        // Clean up for next iteration
        await Referral.deleteOne({ _id: referral._id });
      }
    });

    it('should validate source enum values', async () => {
      const referralData = {
        referrerId: new mongoose.Types.ObjectId(),
        referralCode: 'TEST123456',
        source: 'invalid_source',
        status: 'pending'
      };

      const referral = new Referral(referralData);
      
      await expect(referral.save()).rejects.toThrow(/is not a valid enum value/);
    });

    it('should accept valid source values', async () => {
      const validSources = ['direct', 'email', 'social_facebook', 'social_twitter', 'social_whatsapp', 'other'];
      
      for (const source of validSources) {
        const referralData = {
          referrerId: new mongoose.Types.ObjectId(),
          referralCode: `TEST${source.toUpperCase()}`,
          source,
          status: 'pending'
        };

        const referral = new Referral(referralData);
        await referral.save();
        
        expect(referral.source).toBe(source);
        
        // Clean up for next iteration
        await Referral.deleteOne({ _id: referral._id });
      }
    });

    it('should set default values correctly', async () => {
      const referralData = {
        referrerId: new mongoose.Types.ObjectId(),
        referralCode: 'TEST123456'
      };

      const referral = new Referral(referralData);
      await referral.save();

      expect(referral.status).toBe('pending');
      expect(referral.clickCount).toBe(0);
      expect(referral.createdAt).toBeDefined();
      expect(referral.updatedAt).toBeDefined();
    });
  });

  describe('Instance Methods', () => {
    it('should update click count', async () => {
      const referral = new Referral({
        referrerId: new mongoose.Types.ObjectId(),
        referralCode: 'TEST123456',
        status: 'pending'
      });
      await referral.save();

      referral.clickCount += 1;
      referral.lastClickDate = new Date();
      
      if (!referral.firstClickDate) {
        referral.firstClickDate = new Date();
      }

      await referral.save();

      expect(referral.clickCount).toBe(1);
      expect(referral.firstClickDate).toBeDefined();
      expect(referral.lastClickDate).toBeDefined();
    });

    it('should transition status correctly', async () => {
      const referral = new Referral({
        referrerId: new mongoose.Types.ObjectId(),
        referralCode: 'TEST123456',
        status: 'pending'
      });
      await referral.save();

      // Transition to registered
      referral.status = 'registered';
      referral.refereeId = new mongoose.Types.ObjectId();
      referral.refereeEmail = 'referee@test.com';
      referral.registrationDate = new Date();
      
      await referral.save();

      expect(referral.status).toBe('registered');
      expect(referral.refereeId).toBeDefined();
      expect(referral.refereeEmail).toBe('referee@test.com');
      expect(referral.registrationDate).toBeDefined();

      // Transition to qualified
      referral.status = 'qualified';
      referral.qualificationDate = new Date();
      referral.qualifyingOrderId = new mongoose.Types.ObjectId();
      referral.qualifyingOrderValue = 75.00;
      
      await referral.save();

      expect(referral.status).toBe('qualified');
      expect(referral.qualificationDate).toBeDefined();
      expect(referral.qualifyingOrderId).toBeDefined();
      expect(referral.qualifyingOrderValue).toBe(75.00);
    });
  });

  describe('Indexing', () => {
    it('should have proper indexes', async () => {
      const indexes = await Referral.collection.getIndexes();
      
      // Check for compound index on referrerId and status
      const hasReferrerStatusIndex = Object.keys(indexes).some(key => 
        indexes[key].some(field => 
          (field.referrerId === 1 || field.referrerId === -1) &&
          (field.status === 1 || field.status === -1)
        )
      );

      // Check for referralCode index
      const hasReferralCodeIndex = Object.keys(indexes).some(key =>
        indexes[key].some(field => field.referralCode === 1 || field.referralCode === -1)
      );

      expect(hasReferrerStatusIndex || hasReferralCodeIndex).toBe(true);
    });
  });

  describe('Referral Code Format', () => {
    it('should handle uppercase referral codes', async () => {
      const referral = new Referral({
        referrerId: new mongoose.Types.ObjectId(),
        referralCode: 'lowercase123',
        status: 'pending'
      });
      await referral.save();

      // The referral code should be stored as provided
      expect(referral.referralCode).toBe('lowercase123');
      
      // But queries should handle case sensitivity appropriately
      const found = await Referral.findOne({ 
        referralCode: { $regex: new RegExp('^lowercase123$', 'i') }
      });
      expect(found).toBeTruthy();
    });
  });

  describe('Referral Lifecycle', () => {
    let referrerId, refereeId;

    beforeEach(() => {
      referrerId = new mongoose.Types.ObjectId();
      refereeId = new mongoose.Types.ObjectId();
    });

    it('should complete full referral lifecycle', async () => {
      // 1. Create initial referral (click tracking)
      const referral = new Referral({
        referrerId,
        referralCode: 'LIFECYCLE123',
        ipAddress: '192.168.1.1',
        userAgent: 'Test Browser',
        source: 'direct',
        clickCount: 1,
        firstClickDate: new Date(),
        lastClickDate: new Date(),
        status: 'pending'
      });
      await referral.save();

      expect(referral.status).toBe('pending');

      // 2. User registers (registration)
      referral.status = 'registered';
      referral.refereeId = refereeId;
      referral.refereeEmail = 'referee@test.com';
      referral.registrationDate = new Date();
      await referral.save();

      expect(referral.status).toBe('registered');
      expect(referral.refereeId).toEqual(refereeId);

      // 3. User makes qualifying order (qualification)
      referral.status = 'qualified';
      referral.qualificationDate = new Date();
      referral.qualifyingOrderId = new mongoose.Types.ObjectId();
      referral.qualifyingOrderValue = 75.00;
      await referral.save();

      expect(referral.status).toBe('qualified');
      expect(referral.qualifyingOrderValue).toBe(75.00);

      // 4. Reward is generated and processed (rewarded)
      referral.status = 'rewarded';
      referral.rewardDate = new Date();
      referral.rewardId = new mongoose.Types.ObjectId();
      await referral.save();

      expect(referral.status).toBe('rewarded');
      expect(referral.rewardDate).toBeDefined();

      // Verify all lifecycle data is present
      const finalReferral = await Referral.findById(referral._id);
      expect(finalReferral.clickCount).toBe(1);
      expect(finalReferral.registrationDate).toBeDefined();
      expect(finalReferral.qualificationDate).toBeDefined();
      expect(finalReferral.rewardDate).toBeDefined();
      expect(finalReferral.qualifyingOrderValue).toBe(75.00);
    });

    it('should handle referral expiration', async () => {
      const referral = new Referral({
        referrerId,
        referralCode: 'EXPIRED123',
        status: 'pending',
        expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // Expired yesterday
      });
      await referral.save();

      // Update status to expired
      referral.status = 'expired';
      await referral.save();

      expect(referral.status).toBe('expired');
      expect(referral.expiresAt).toBeDefined();
      expect(referral.expiresAt.getTime()).toBeLessThan(Date.now());
    });
  });
});