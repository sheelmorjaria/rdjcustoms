import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import Reward from '../Reward.js';
import User from '../User.js';

describe('Reward Model Tests', () => {
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
    await Reward.deleteMany({});
    await User.deleteMany({});
  });

  afterEach(async () => {
    await Reward.deleteMany({});
    await User.deleteMany({});
  });

  describe('Schema Validation', () => {
    it('should create reward with valid data', async () => {
      const rewardData = {
        userId: new mongoose.Types.ObjectId(),
        referralId: new mongoose.Types.ObjectId(),
        type: 'discount_percent',
        value: 10,
        description: '10% discount on next order',
        isRedeemed: false,
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days
      };

      const reward = new Reward(rewardData);
      await reward.save();

      expect(reward._id).toBeDefined();
      expect(reward.userId).toEqual(rewardData.userId);
      expect(reward.type).toBe('discount_percent');
      expect(reward.value).toBe(10);
      expect(reward.isRedeemed).toBe(false);
    });

    it('should require userId', async () => {
      const rewardData = {
        type: 'discount_percent',
        value: 10,
        description: '10% discount'
      };

      const reward = new Reward(rewardData);
      
      await expect(reward.save()).rejects.toThrow(/userId.*required/);
    });

    it('should require type', async () => {
      const rewardData = {
        userId: new mongoose.Types.ObjectId(),
        value: 10,
        description: '10% discount'
      };

      const reward = new Reward(rewardData);
      
      await expect(reward.save()).rejects.toThrow(/type.*required/);
    });

    it('should require value', async () => {
      const rewardData = {
        userId: new mongoose.Types.ObjectId(),
        type: 'discount_percent',
        description: '10% discount'
      };

      const reward = new Reward(rewardData);
      
      await expect(reward.save()).rejects.toThrow(/value.*required/);
    });

    it('should validate type enum values', async () => {
      const rewardData = {
        userId: new mongoose.Types.ObjectId(),
        type: 'invalid_type',
        value: 10,
        description: 'Invalid reward'
      };

      const reward = new Reward(rewardData);
      
      await expect(reward.save()).rejects.toThrow(/is not a valid enum value/);
    });

    it('should accept valid type values', async () => {
      const validTypes = ['discount_percent', 'discount_fixed', 'store_credit', 'free_shipping', 'cashback'];
      
      for (const type of validTypes) {
        const rewardData = {
          userId: new mongoose.Types.ObjectId(),
          type,
          value: type === 'discount_percent' ? 10 : 25.00,
          description: `${type} reward`
        };

        const reward = new Reward(rewardData);
        await reward.save();
        
        expect(reward.type).toBe(type);
        
        // Clean up for next iteration
        await Reward.deleteOne({ _id: reward._id });
      }
    });

    it('should set default values correctly', async () => {
      const rewardData = {
        userId: new mongoose.Types.ObjectId(),
        type: 'discount_percent',
        value: 10,
        description: '10% discount'
      };

      const reward = new Reward(rewardData);
      await reward.save();

      expect(reward.isRedeemed).toBe(false);
      expect(reward.createdAt).toBeDefined();
      expect(reward.updatedAt).toBeDefined();
      expect(reward.expiresAt).toBeDefined();
      // Default expiry should be 90 days from creation
      const expectedExpiry = new Date(reward.createdAt.getTime() + 90 * 24 * 60 * 60 * 1000);
      const timeDiff = Math.abs(reward.expiresAt.getTime() - expectedExpiry.getTime());
      expect(timeDiff).toBeLessThan(1000); // Within 1 second
    });

    it('should validate value is positive', async () => {
      const rewardData = {
        userId: new mongoose.Types.ObjectId(),
        type: 'discount_percent',
        value: -10,
        description: 'Negative value reward'
      };

      const reward = new Reward(rewardData);
      
      await expect(reward.save()).rejects.toThrow(/Value must be positive/);
    });

    it('should validate percentage values are not over 100', async () => {
      const rewardData = {
        userId: new mongoose.Types.ObjectId(),
        type: 'discount_percent',
        value: 150,
        description: 'Over 100% discount'
      };

      const reward = new Reward(rewardData);
      
      await expect(reward.save()).rejects.toThrow(/Percentage value cannot exceed 100/);
    });

    it('should allow 100% discount', async () => {
      const rewardData = {
        userId: new mongoose.Types.ObjectId(),
        type: 'discount_percent',
        value: 100,
        description: '100% discount'
      };

      const reward = new Reward(rewardData);
      await reward.save();
      
      expect(reward.value).toBe(100);
    });
  });

  describe('Instance Methods', () => {
    let reward;

    beforeEach(async () => {
      reward = new Reward({
        userId: new mongoose.Types.ObjectId(),
        type: 'discount_percent',
        value: 10,
        description: '10% discount on next order',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      });
      await reward.save();
    });

    it('should check if reward is expired', async () => {
      // Test non-expired reward
      expect(reward.isExpired()).toBe(false);

      // Test expired reward
      reward.expiresAt = new Date(Date.now() - 24 * 60 * 60 * 1000); // Yesterday
      expect(reward.isExpired()).toBe(true);
    });

    it('should check if reward is valid', async () => {
      // Valid reward: not redeemed and not expired
      expect(reward.isValid()).toBe(true);

      // Invalid: redeemed
      reward.isRedeemed = true;
      expect(reward.isValid()).toBe(false);

      // Reset and test expired
      reward.isRedeemed = false;
      reward.expiresAt = new Date(Date.now() - 24 * 60 * 60 * 1000);
      expect(reward.isValid()).toBe(false);
    });

    it('should redeem reward successfully', async () => {
      const orderId = new mongoose.Types.ObjectId();
      
      expect(reward.isRedeemed).toBe(false);
      
      await reward.redeem(orderId);
      
      expect(reward.isRedeemed).toBe(true);
      expect(reward.redeemedAt).toBeDefined();
      expect(reward.redeemedOrderId).toEqual(orderId);
      
      // Verify it was saved to database
      const savedReward = await Reward.findById(reward._id);
      expect(savedReward.isRedeemed).toBe(true);
      expect(savedReward.redeemedOrderId).toEqual(orderId);
    });

    it('should throw error when redeeming already redeemed reward', async () => {
      const orderId = new mongoose.Types.ObjectId();
      
      // Redeem once
      await reward.redeem(orderId);
      
      // Try to redeem again
      await expect(reward.redeem(new mongoose.Types.ObjectId()))
        .rejects.toThrow('Reward has already been redeemed');
    });

    it('should throw error when redeeming expired reward', async () => {
      // Make reward expired
      reward.expiresAt = new Date(Date.now() - 24 * 60 * 60 * 1000);
      await reward.save();
      
      const orderId = new mongoose.Types.ObjectId();
      
      await expect(reward.redeem(orderId))
        .rejects.toThrow('Reward has expired');
    });

    it('should calculate discount amount correctly', async () => {
      const orderTotal = 100.00;
      
      // Test percentage discount
      const percentReward = new Reward({
        userId: new mongoose.Types.ObjectId(),
        type: 'discount_percent',
        value: 15,
        description: '15% discount'
      });
      
      expect(percentReward.calculateDiscountAmount(orderTotal)).toBe(15.00);
      
      // Test fixed discount
      const fixedReward = new Reward({
        userId: new mongoose.Types.ObjectId(),
        type: 'discount_fixed',
        value: 25.00,
        description: '£25 off'
      });
      
      expect(fixedReward.calculateDiscountAmount(orderTotal)).toBe(25.00);
      
      // Test store credit
      const creditReward = new Reward({
        userId: new mongoose.Types.ObjectId(),
        type: 'store_credit',
        value: 30.00,
        description: '£30 store credit'
      });
      
      expect(creditReward.calculateDiscountAmount(orderTotal)).toBe(30.00);
      
      // Test free shipping (no discount to order total)
      const shippingReward = new Reward({
        userId: new mongoose.Types.ObjectId(),
        type: 'free_shipping',
        value: 1,
        description: 'Free shipping'
      });
      
      expect(shippingReward.calculateDiscountAmount(orderTotal)).toBe(0);
    });

    it('should not exceed order total for percentage discount', async () => {
      const percentReward = new Reward({
        userId: new mongoose.Types.ObjectId(),
        type: 'discount_percent',
        value: 15,
        description: '15% discount'
      });
      
      // Small order total
      expect(percentReward.calculateDiscountAmount(10.00)).toBe(1.50);
      
      // Large discount percentage shouldn't exceed order total
      percentReward.value = 100;
      expect(percentReward.calculateDiscountAmount(50.00)).toBe(50.00);
    });

    it('should not exceed order total for fixed discount', async () => {
      const fixedReward = new Reward({
        userId: new mongoose.Types.ObjectId(),
        type: 'discount_fixed',
        value: 75.00,
        description: '£75 off'
      });
      
      // Discount larger than order
      expect(fixedReward.calculateDiscountAmount(50.00)).toBe(50.00);
      
      // Discount smaller than order
      expect(fixedReward.calculateDiscountAmount(100.00)).toBe(75.00);
    });
  });

  describe('Static Methods', () => {
    beforeEach(async () => {
      const userId = new mongoose.Types.ObjectId();
      
      // Create test rewards
      await Reward.create([
        {
          userId,
          type: 'discount_percent',
          value: 10,
          description: '10% discount',
          isRedeemed: false,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        },
        {
          userId,
          type: 'discount_fixed',
          value: 25,
          description: '£25 off',
          isRedeemed: true,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        },
        {
          userId,
          type: 'store_credit',
          value: 50,
          description: '£50 credit',
          isRedeemed: false,
          expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // Expired
        }
      ]);
    });

    it('should find valid rewards for user', async () => {
      const userId = (await Reward.findOne({})).userId;
      const validRewards = await Reward.findValidForUser(userId);
      
      expect(validRewards).toHaveLength(1);
      expect(validRewards[0].type).toBe('discount_percent');
      expect(validRewards[0].isRedeemed).toBe(false);
      expect(validRewards[0].isExpired()).toBe(false);
    });

    it('should find expired rewards', async () => {
      const expiredRewards = await Reward.findExpired();
      
      expect(expiredRewards).toHaveLength(1);
      expect(expiredRewards[0].type).toBe('store_credit');
      expect(expiredRewards[0].isExpired()).toBe(true);
    });

    it('should find unredeemed rewards', async () => {
      const unredeemedRewards = await Reward.findUnredeemed();
      
      expect(unredeemedRewards).toHaveLength(2); // One valid, one expired but unredeemed
      expect(unredeemedRewards.every(r => !r.isRedeemed)).toBe(true);
    });
  });

  describe('Reward Types and Values', () => {
    it('should handle all reward types correctly', async () => {
      const userId = new mongoose.Types.ObjectId();
      const orderTotal = 100.00;
      
      const rewardTypes = [
        { type: 'discount_percent', value: 20, expectedDiscount: 20.00 },
        { type: 'discount_fixed', value: 15.00, expectedDiscount: 15.00 },
        { type: 'store_credit', value: 30.00, expectedDiscount: 30.00 },
        { type: 'free_shipping', value: 1, expectedDiscount: 0 },
        { type: 'cashback', value: 10.00, expectedDiscount: 10.00 }
      ];
      
      for (const { type, value, expectedDiscount } of rewardTypes) {
        const reward = new Reward({
          userId,
          type,
          value,
          description: `${type} reward`
        });
        
        await reward.save();
        expect(reward.calculateDiscountAmount(orderTotal)).toBe(expectedDiscount);
        
        // Clean up
        await Reward.deleteOne({ _id: reward._id });
      }
    });
  });

  describe('Indexing and Performance', () => {
    it('should have proper indexes', async () => {
      const indexes = await Reward.collection.getIndexes();
      
      // Check for userId index
      const hasUserIdIndex = Object.keys(indexes).some(key =>
        indexes[key].some(field => field.userId === 1 || field.userId === -1)
      );

      // Check for compound index on userId and isRedeemed
      const hasUserRedeemedIndex = Object.keys(indexes).some(key => 
        indexes[key].some(field => 
          (field.userId === 1 || field.userId === -1) &&
          (field.isRedeemed === 1 || field.isRedeemed === -1)
        )
      );

      expect(hasUserIdIndex || hasUserRedeemedIndex).toBe(true);
    });

    it('should query efficiently for valid rewards', async () => {
      const userId = new mongoose.Types.ObjectId();
      
      // Create many rewards to test query performance
      const rewards = [];
      for (let i = 0; i < 10; i++) {
        rewards.push({
          userId,
          type: i % 2 === 0 ? 'discount_percent' : 'discount_fixed',
          value: 10 + i,
          description: `Test reward ${i}`,
          isRedeemed: i % 3 === 0,
          expiresAt: i % 4 === 0 ? 
            new Date(Date.now() - 24 * 60 * 60 * 1000) : // Some expired
            new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Some valid
        });
      }
      
      await Reward.insertMany(rewards);
      
      // This should use indexes and be efficient
      const validRewards = await Reward.findValidForUser(userId);
      expect(validRewards.length).toBeGreaterThan(0);
      expect(validRewards.every(r => r.userId.equals(userId))).toBe(true);
      expect(validRewards.every(r => !r.isRedeemed && !r.isExpired())).toBe(true);
    });
  });
});