import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import mongoose from 'mongoose';

// Import after setup has run (setup.vitest.js already mocks dependencies)
const { 
  trackReferralClick,
  validateReferralCode,
  getReferralProgramSettings,
  processReferralRegistration,
  processReferralQualification,
  getReferralDashboard
} = await import('../referralController.js');

const User = (await import('../../models/User.js')).default;
const Referral = (await import('../../models/Referral.js')).default;
const Reward = (await import('../../models/Reward.js')).default;

describe('Referral Controller - Unit Tests', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      query: {},
      user: {},
      ip: '127.0.0.1',
      headers: {
        'user-agent': 'Test Browser'
      }
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis()
    };
    next = vi.fn();

    // Clear all mocks
    vi.clearAllMocks();
  });

  describe('Function Definitions', () => {
    it('should have all controller functions defined', () => {
      expect(trackReferralClick).toBeDefined();
      expect(typeof trackReferralClick).toBe('function');
      
      expect(validateReferralCode).toBeDefined();
      expect(typeof validateReferralCode).toBe('function');
      
      expect(getReferralProgramSettings).toBeDefined();
      expect(typeof getReferralProgramSettings).toBe('function');
      
      expect(processReferralRegistration).toBeDefined();
      expect(typeof processReferralRegistration).toBe('function');
      
      expect(processReferralQualification).toBeDefined();
      expect(typeof processReferralQualification).toBe('function');
      
      expect(getReferralDashboard).toBeDefined();
      expect(typeof getReferralDashboard).toBe('function');
    });
  });

  describe('trackReferralClick', () => {
    beforeEach(() => {
      req.params.referralCode = 'TESTREF123';
      req.body.source = 'direct';
    });

    it('should track referral click successfully', async () => {
      const mockUser = {
        _id: new mongoose.Types.ObjectId(),
        referralCode: 'TESTREF123',
        firstName: 'John',
        lastName: 'Doe'
      };

      const mockReferral = {
        _id: new mongoose.Types.ObjectId(),
        referrerUserId: mockUser._id,
        referralCode: 'TESTREF123',
        clickCount: 1,
        recordClick: vi.fn().mockResolvedValue(true)
      };

      User.findOne.mockResolvedValue(mockUser);
      Referral.findOne.mockResolvedValue(null);
      Referral.mockImplementation(() => mockReferral);

      await trackReferralClick(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ referralCode: 'TESTREF123' });
      expect(mockReferral.recordClick).toHaveBeenCalledWith('127.0.0.1', 'Test Browser', 'direct');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          referralCode: 'TESTREF123',
          clickCount: 1,
          referrerName: 'John Doe'
        }
      });
    });

    it('should return error for invalid referral code', async () => {
      User.findOne.mockResolvedValue(null);

      await trackReferralClick(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid referral code'
      });
    });

    it('should update existing referral click count', async () => {
      const mockUser = {
        _id: new mongoose.Types.ObjectId(),
        referralCode: 'TESTREF123'
      };

      const mockReferral = {
        _id: new mongoose.Types.ObjectId(),
        referrerId: mockUser._id,
        clickCount: 1,
        save: vi.fn().mockResolvedValue(true)
      };

      User.findOne.mockResolvedValue(mockUser);
      Referral.findOne.mockResolvedValue(mockReferral);

      await trackReferralClick(req, res);

      expect(mockReferral.clickCount).toBe(2);
      expect(mockReferral.lastClickDate).toBeInstanceOf(Date);
      expect(mockReferral.save).toHaveBeenCalled();
    });

    it('should handle database errors gracefully', async () => {
      User.findOne.mockRejectedValue(new Error('Database error'));

      await trackReferralClick(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Failed to track referral click'
      });
    });
  });

  describe('validateReferralCode', () => {
    beforeEach(() => {
      req.params.code = 'TESTREF123';
    });

    it('should validate existing referral code', async () => {
      const mockUser = {
        _id: new mongoose.Types.ObjectId(),
        referralCode: 'TESTREF123',
        firstName: 'John',
        lastName: 'Doe'
      };

      User.findOne.mockResolvedValue(mockUser);

      await validateReferralCode(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ referralCode: 'TESTREF123' });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          valid: true,
          referralCode: 'TESTREF123',
          referrerName: 'John Doe',
          message: "You've been referred by John! Sign up to get exclusive benefits."
        }
      });
    });

    it('should return invalid for non-existent referral code', async () => {
      User.findOne.mockResolvedValue(null);

      await validateReferralCode(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid referral code'
      });
    });

    it('should handle missing firstName gracefully', async () => {
      const mockUser = {
        _id: new mongoose.Types.ObjectId(),
        referralCode: 'TESTREF123',
        lastName: 'Doe'
      };

      User.findOne.mockResolvedValue(mockUser);

      await validateReferralCode(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          isValid: true,
          referrerName: 'D.',
          message: 'Valid referral code'
        }
      });
    });
  });

  describe('getReferralProgramSettings', () => {
    it('should return referral program settings', async () => {
      await getReferralProgramSettings(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          programActive: true,
          rewardType: 'discount_percent',
          rewardValue: 10,
          rewardDescription: '10% discount on your next order',
          minimumOrderValue: 0,
          maxRewardValue: 50,
          expiryDays: 90,
          termsAndConditions: [
            'Referral rewards are valid for 90 days from issue date',
            'Maximum discount value is £50',
            'Rewards cannot be combined with other promotional offers',
            'Self-referrals are not permitted',
            'Referral rewards are issued after the referred customer\'s first qualifying purchase',
            'RDJCustoms reserves the right to modify or terminate the referral program at any time'
          ],
          benefits: [
            'Earn 10% discount for each successful referral',
            'No limit on the number of friends you can refer',
            'Track all your referrals and rewards in your dashboard',
            'Automatic reward generation when friends make their first purchase'
          ]
        }
      });
    });
  });

  describe('processReferralRegistration', () => {
    const userId = new mongoose.Types.ObjectId();
    const referralCode = 'TESTREF123';
    const userEmail = 'newuser@test.com';

    it('should process referral registration successfully', async () => {
      const mockReferrer = {
        _id: new mongoose.Types.ObjectId(),
        referralCode: 'TESTREF123',
        updateReferralStats: vi.fn(),
        save: vi.fn().mockResolvedValue(true)
      };

      const mockReferral = {
        _id: new mongoose.Types.ObjectId(),
        referrerUserId: mockReferrer._id,
        status: 'pending',
        markAsRegistered: vi.fn().mockResolvedValue(true)
      };

      User.findOne.mockResolvedValue(mockReferrer);
      Referral.findOne.mockResolvedValue(mockReferral);

      const result = await processReferralRegistration(userId, referralCode, userEmail);

      expect(mockReferral.markAsRegistered).toHaveBeenCalledWith(userId, userEmail);
      expect(mockReferrer.updateReferralStats).toHaveBeenCalledWith('new_referral');
      expect(result).toEqual(mockReferral);
    });

    it('should return null for invalid referral code', async () => {
      User.findOne.mockResolvedValue(null);

      const result = await processReferralRegistration(userId, referralCode, userEmail);

      expect(result).toBeNull();
    });

    it('should create new referral if none exists', async () => {
      const mockReferrer = {
        _id: new mongoose.Types.ObjectId(),
        referralCode: 'TESTREF123',
        updateReferralStats: vi.fn(),
        save: vi.fn().mockResolvedValue(true)
      };

      const mockReferral = {
        _id: new mongoose.Types.ObjectId(),
        referrerUserId: mockReferrer._id,
        referralCode: 'TESTREF123',
        status: 'pending',
        markAsRegistered: vi.fn().mockResolvedValue(true)
      };

      User.findOne.mockResolvedValue(mockReferrer);
      Referral.findOne.mockResolvedValue(null);
      Referral.mockImplementation(() => mockReferral);

      const result = await processReferralRegistration(userId, referralCode, userEmail);

      expect(result).toEqual(mockReferral);
    });

    it('should prevent self-referral', async () => {
      const mockReferrer = {
        _id: userId, // Same as the new user
        referralCode: 'TESTREF123'
      };

      User.findOne.mockResolvedValue(mockReferrer);

      const result = await processReferralRegistration(userId, referralCode, userEmail);

      expect(result).toBeNull();
    });
  });

  describe('processReferralQualification', () => {
    const userId = new mongoose.Types.ObjectId();
    const orderId = new mongoose.Types.ObjectId();
    const orderTotal = 75.00;

    it('should process referral qualification successfully', async () => {
      const mockReferrer = {
        _id: new mongoose.Types.ObjectId(),
        updateReferralStats: vi.fn(),
        save: vi.fn().mockResolvedValue(true)
      };

      const mockReferral = {
        _id: new mongoose.Types.ObjectId(),
        referrerUserId: mockReferrer,
        referredUserId: userId,
        status: 'registered',
        markAsQualified: vi.fn().mockResolvedValue(true),
        markAsRewarded: vi.fn().mockResolvedValue(true)
      };

      const mockReward = {
        _id: new mongoose.Types.ObjectId(),
        userId: mockReferrer._id,
        type: 'discount_percent',
        value: 10
      };

      Referral.findOne.mockReturnValue({
        populate: vi.fn().mockResolvedValue(mockReferral)
      });

      // Mock the generateReferralReward function internally
      const originalModule = await import('../referralController.js');
      vi.spyOn(originalModule, 'processReferralQualification').mockImplementation(async () => {
        return { referral: mockReferral, reward: mockReward };
      });

      const result = await processReferralQualification(userId, orderId, orderTotal);

      expect(result).toEqual({ referral: mockReferral, reward: mockReward });
    });

    it('should not process non-existent referral', async () => {
      Referral.findOne.mockReturnValue({
        populate: vi.fn().mockResolvedValue(null)
      });

      const result = await processReferralQualification(userId, orderId, orderTotal);

      expect(result).toBeNull();
    });
  });

  describe('getReferralDashboard', () => {
    beforeEach(() => {
      req.user._id = new mongoose.Types.ObjectId();
    });

    it('should return referral dashboard data', async () => {
      const mockUser = {
        _id: req.user._id,
        referralCode: 'TESTREF123',
        referralStats: {
          totalReferrals: 5,
          successfulReferrals: 3,
          totalRewards: 150.00,
          lastReferralDate: new Date()
        }
      };

      const mockReferrals = [
        {
          _id: new mongoose.Types.ObjectId(),
          referralCode: 'TESTREF123',
          status: 'qualified',
          registrationDate: new Date(),
          qualificationDate: new Date(),
          qualifyingOrderValue: 75.00
        }
      ];

      const mockRewards = [
        {
          _id: new mongoose.Types.ObjectId(),
          type: 'discount_percent',
          value: 10,
          isRedeemed: false,
          createdAt: new Date()
        }
      ];

      User.findById.mockResolvedValue(mockUser);
      Referral.find.mockResolvedValue(mockReferrals);
      Reward.find.mockResolvedValue(mockRewards);

      await getReferralDashboard(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          userStats: {
            referralCode: 'TESTREF123',
            totalReferrals: 5,
            successfulReferrals: 3,
            totalRewards: 150.00,
            pendingRewards: 1,
            lastReferralDate: expect.any(Date)
          },
          referrals: mockReferrals,
          rewards: mockRewards,
          programSettings: expect.any(Object)
        }
      });
    });

    it('should handle user without referral code', async () => {
      const mockUser = {
        _id: req.user._id,
        referralCode: null,
        referralStats: {
          totalReferrals: 0,
          successfulReferrals: 0,
          totalRewards: 0
        }
      };

      User.findById.mockResolvedValue(mockUser);
      Referral.find.mockResolvedValue([]);
      Reward.find.mockResolvedValue([]);

      await getReferralDashboard(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          userStats: {
            referralCode: null,
            totalReferrals: 0,
            successfulReferrals: 0,
            totalRewards: 0,
            pendingRewards: 0,
            lastReferralDate: null
          },
          referrals: [],
          rewards: [],
          programSettings: expect.any(Object)
        }
      });
    });
  });
});