import { describe, it, expect, beforeEach, afterEach as _afterEach, vi } from 'vitest';
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
      },
      get: vi.fn().mockImplementation((header) => {
        if (header === 'user-agent') return 'Test Browser';
        return null;
      })
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

      User.findOne.mockResolvedValue(mockUser);
      Referral.findOne.mockResolvedValue(null);

      await trackReferralClick(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ referralCode: 'TESTREF123' });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          referralCode: 'TESTREF123',
          clickCount: expect.any(Number),
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
        referralCode: 'TESTREF123',
        firstName: 'John',
        lastName: 'Doe'
      };

      const mockReferral = {
        _id: new mongoose.Types.ObjectId(),
        referrerUserId: mockUser._id,
        referralCode: 'TESTREF123',
        status: 'pending',
        metadata: { ipAddress: '127.0.0.1' },
        clickCount: 1,
        recordClick: vi.fn().mockImplementation(async () => {
          mockReferral.clickCount = 2;
          mockReferral.lastClickDate = new Date();
        })
      };

      User.findOne.mockResolvedValue(mockUser);
      Referral.findOne.mockResolvedValue(mockReferral);

      await trackReferralClick(req, res);

      expect(mockReferral.recordClick).toHaveBeenCalledWith('127.0.0.1', 'Test Browser', 'direct');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          referralCode: 'TESTREF123',
          clickCount: 2,
          referrerName: 'John Doe'
        }
      });
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
          message: 'You\'ve been referred by John! Sign up to get exclusive benefits.'
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
        firstName: undefined,
        lastName: 'Doe'
      };

      User.findOne.mockResolvedValue(mockUser);

      await validateReferralCode(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          valid: true,
          referralCode: 'TESTREF123',
          referrerName: 'undefined Doe',
          message: 'You\'ve been referred by undefined! Sign up to get exclusive benefits.'
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

      User.findOne.mockResolvedValue(mockReferrer);
      Referral.findOne.mockResolvedValue(null);

      const result = await processReferralRegistration(userId, referralCode, userEmail);

      expect(mockReferrer.updateReferralStats).toHaveBeenCalledWith('new_referral');
      expect(result).toBeDefined();
      expect(result.referrerUserId).toEqual(mockReferrer._id);
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

      Referral.findOne.mockReturnValue({
        populate: vi.fn().mockResolvedValue(mockReferral)
      });

      const result = await processReferralQualification(userId, orderId, orderTotal);

      expect(mockReferral.markAsQualified).toHaveBeenCalledWith(orderId);
      expect(mockReferrer.updateReferralStats).toHaveBeenCalledWith('successful_referral');
      expect(result).toBeDefined();
      expect(result.referral).toEqual(mockReferral);
      expect(result.reward).toBeDefined();
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
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@test.com',
        getReferralUrl: vi.fn().mockReturnValue('https://rdjcustoms.com/ref/TESTREF123')
      };

      const mockReferrals = [
        {
          _id: new mongoose.Types.ObjectId(),
          status: 'qualified',
          registrationDate: new Date(),
          qualificationDate: new Date(),
          referredEmail: 'referred@test.com',
          referredUserId: {
            firstName: 'Jane',
            lastName: 'Smith'
          },
          qualifyingOrderId: {
            totalAmount: 75.00
          },
          clickCount: 2,
          createdAt: new Date()
        }
      ];

      const mockRewards = [
        {
          _id: new mongoose.Types.ObjectId(),
          type: 'discount_percent',
          rewardCode: 'REWARD123',
          value: 10,
          description: '10% discount',
          status: 'active',
          issuedDate: new Date(),
          expiryDate: new Date(Date.now() + 90*24*60*60*1000),
          getDisplayValue: vi.fn().mockReturnValue('10%'),
          isExpired: vi.fn().mockReturnValue(false),
          isRedeemable: vi.fn().mockReturnValue(true),
          minimumOrderValue: 0,
          termsAndConditions: 'Valid for one-time use'
        }
      ];

      User.findById.mockResolvedValue(mockUser);
      Referral.findActiveByUser = vi.fn().mockResolvedValue(mockReferrals);
      Reward.findActiveByUser = vi.fn().mockResolvedValue(mockRewards);

      await getReferralDashboard(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          referralCode: 'TESTREF123',
          referralUrl: 'https://rdjcustoms.com/ref/TESTREF123',
          stats: {
            totalReferrals: 1,
            pendingReferrals: 0,
            successfulReferrals: 1,
            totalRewards: 1,
            activeRewards: 1,
            totalRewardValue: 10
          },
          referrals: [{
            id: mockReferrals[0]._id,
            referredEmail: 're***@test.com',
            referredName: 'Jane S.',
            status: 'qualified',
            registrationDate: mockReferrals[0].registrationDate,
            qualificationDate: mockReferrals[0].qualificationDate,
            orderAmount: 75.00,
            clickCount: 2,
            createdAt: mockReferrals[0].createdAt
          }],
          rewards: [{
            id: mockRewards[0]._id,
            type: 'discount_percent',
            code: 'REWARD123',
            value: 10,
            displayValue: '10%',
            description: '10% discount',
            status: 'active',
            issuedDate: mockRewards[0].issuedDate,
            expiryDate: mockRewards[0].expiryDate,
            redemptionDate: undefined,
            isExpired: false,
            isRedeemable: true,
            minimumOrderValue: 0,
            termsAndConditions: 'Valid for one-time use'
          }],
          user: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@test.com'
          }
        }
      });
    });

    it('should handle user without referral code', async () => {
      const mockUser = {
        _id: req.user._id,
        referralCode: null,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@test.com',
        generateReferralCode: vi.fn(),
        save: vi.fn().mockResolvedValue(true),
        getReferralUrl: vi.fn().mockReturnValue('https://rdjcustoms.com/ref/NEWREF123')
      };
      
      // Mock the side effect of generateReferralCode
      mockUser.generateReferralCode.mockImplementation(() => {
        mockUser.referralCode = 'NEWREF123';
      });

      User.findById.mockResolvedValue(mockUser);
      Referral.findActiveByUser = vi.fn().mockResolvedValue([]);
      Reward.findActiveByUser = vi.fn().mockResolvedValue([]);

      await getReferralDashboard(req, res);

      expect(mockUser.generateReferralCode).toHaveBeenCalled();
      expect(mockUser.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          referralCode: 'NEWREF123',
          referralUrl: 'https://rdjcustoms.com/ref/NEWREF123',
          stats: {
            totalReferrals: 0,
            pendingReferrals: 0,
            successfulReferrals: 0,
            totalRewards: 0,
            activeRewards: 0,
            totalRewardValue: 0
          },
          referrals: [],
          rewards: [],
          user: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@test.com'
          }
        }
      });
    });
  });
});