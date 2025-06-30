import User from '../models/User.js';
import Referral from '../models/Referral.js';
import Reward from '../models/Reward.js';
import logger from '../utils/logger.js';

// Get user's referral dashboard data
export const getReferralDashboard = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Generate referral code if not exists
    if (!user.referralCode) {
      user.generateReferralCode();
      await user.save();
    }

    // Get referral data
    const referrals = await Referral.findActiveByUser(userId);
    const rewards = await Reward.findActiveByUser(userId);

    // Calculate stats
    const stats = {
      totalReferrals: referrals.length,
      pendingReferrals: referrals.filter(r => r.status === 'pending').length,
      successfulReferrals: referrals.filter(r => r.status === 'qualified' || r.status === 'rewarded').length,
      totalRewards: rewards.length,
      activeRewards: rewards.filter(r => r.status === 'active').length,
      totalRewardValue: rewards.reduce((sum, reward) => sum + reward.value, 0)
    };

    // Format referral data for frontend
    const formattedReferrals = referrals.map(referral => ({
      id: referral._id,
      referredEmail: referral.referredEmail ? 
        referral.referredEmail.replace(/(.{2}).*@/, '$1***@') : 
        'Unknown',
      referredName: referral.referredUserId ? 
        `${referral.referredUserId.firstName} ${referral.referredUserId.lastName.charAt(0)}.` : 
        'Unknown',
      status: referral.status,
      registrationDate: referral.registrationDate,
      qualificationDate: referral.qualificationDate,
      orderAmount: referral.qualifyingOrderId ? referral.qualifyingOrderId.totalAmount : null,
      clickCount: referral.clickCount,
      createdAt: referral.createdAt
    }));

    // Format rewards data for frontend
    const formattedRewards = rewards.map(reward => ({
      id: reward._id,
      type: reward.type,
      code: reward.rewardCode,
      value: reward.value,
      displayValue: reward.getDisplayValue(),
      description: reward.description,
      status: reward.status,
      issuedDate: reward.issuedDate,
      expiryDate: reward.expiryDate,
      redemptionDate: reward.redemptionDate,
      isExpired: reward.isExpired(),
      isRedeemable: reward.isRedeemable(),
      minimumOrderValue: reward.minimumOrderValue,
      termsAndConditions: reward.termsAndConditions
    }));

    logger.info('Referral dashboard data retrieved', {
      userId,
      stats,
      action: 'get_referral_dashboard'
    });

    res.json({
      success: true,
      data: {
        referralCode: user.referralCode,
        referralUrl: user.getReferralUrl(),
        stats,
        referrals: formattedReferrals,
        rewards: formattedRewards,
        user: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email
        }
      }
    });
  } catch (error) {
    logger.error('Get referral dashboard error', { 
      userId: req.user?._id, 
      error: error.message,
      stack: error.stack 
    });
    
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve referral dashboard data'
    });
  }
};

// Track referral click
export const trackReferralClick = async (req, res) => {
  try {
    const { referralCode } = req.params;
    const { source = 'direct' } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('user-agent');

    // Find the referrer by referral code
    const referrer = await User.findOne({ 
      referralCode: referralCode.toUpperCase() 
    });

    if (!referrer) {
      return res.status(404).json({
        success: false,
        error: 'Invalid referral code'
      });
    }

    // Check if there's already a pending referral from this IP/user agent
    let referral = await Referral.findOne({
      referralCode: referralCode.toUpperCase(),
      status: 'pending',
      'metadata.ipAddress': ipAddress
    });

    if (!referral) {
      // Create new referral tracking
      referral = new Referral({
        referrerUserId: referrer._id,
        referralCode: referralCode.toUpperCase(),
        status: 'pending'
      });
    }

    // Record the click
    await referral.recordClick(ipAddress, userAgent, source);

    logger.info('Referral click tracked', {
      referralCode,
      referrerId: referrer._id,
      ipAddress,
      source,
      action: 'track_referral_click'
    });

    res.json({
      success: true,
      data: {
        referralCode,
        clickCount: referral.clickCount,
        referrerName: `${referrer.firstName} ${referrer.lastName}`
      }
    });
  } catch (error) {
    logger.error('Track referral click error', { 
      referralCode: req.params.referralCode,
      error: error.message,
      stack: error.stack 
    });
    
    res.status(500).json({
      success: false,
      error: 'Failed to track referral click'
    });
  }
};

// Validate referral code
export const validateReferralCode = async (req, res) => {
  try {
    const { code } = req.params;

    const referrer = await User.findOne({ 
      referralCode: code.toUpperCase() 
    });

    if (!referrer) {
      return res.status(404).json({
        success: false,
        error: 'Invalid referral code'
      });
    }

    res.json({
      success: true,
      data: {
        valid: true,
        referralCode: code.toUpperCase(),
        referrerName: `${referrer.firstName} ${referrer.lastName}`,
        message: `You've been referred by ${referrer.firstName}! Sign up to get exclusive benefits.`
      }
    });
  } catch (error) {
    logger.error('Validate referral code error', { 
      code: req.params.code,
      error: error.message 
    });
    
    res.status(500).json({
      success: false,
      error: 'Failed to validate referral code'
    });
  }
};

// Process referral registration (called during user registration)
export const processReferralRegistration = async (userId, referralCode, email) => {
  try {
    if (!referralCode) return null;

    // Find the referrer
    const referrer = await User.findOne({ 
      referralCode: referralCode.toUpperCase() 
    });

    if (!referrer) {
      logger.warn('Invalid referral code during registration', { 
        userId, 
        referralCode, 
        email 
      });
      return null;
    }

    // Prevent self-referral
    if (referrer._id.toString() === userId.toString()) {
      logger.warn('Self-referral attempt prevented', { 
        userId, 
        referralCode 
      });
      return null;
    }

    // Find or create referral record
    let referral = await Referral.findOne({
      referralCode: referralCode.toUpperCase(),
      status: 'pending'
    });

    if (!referral) {
      referral = new Referral({
        referrerUserId: referrer._id,
        referralCode: referralCode.toUpperCase(),
        status: 'pending'
      });
    }

    // Mark as registered
    await referral.markAsRegistered(userId, email);

    // Update referrer stats
    referrer.updateReferralStats('new_referral');
    await referrer.save();

    logger.info('Referral registration processed', {
      referralId: referral._id,
      referrerId: referrer._id,
      referredUserId: userId,
      action: 'process_referral_registration'
    });

    return referral;
  } catch (error) {
    logger.error('Process referral registration error', { 
      userId, 
      referralCode, 
      error: error.message 
    });
    return null;
  }
};

// Process referral qualification (called during order completion)
export const processReferralQualification = async (userId, orderId, orderTotal) => {
  try {
    // Find referral record for this user
    const referral = await Referral.findOne({
      referredUserId: userId,
      status: 'registered'
    }).populate('referrerUserId');

    if (!referral) {
      return null; // No referral to process
    }

    // Mark referral as qualified
    await referral.markAsQualified(orderId);

    // Update referrer stats
    const referrer = referral.referrerUserId;
    referrer.updateReferralStats('successful_referral');
    await referrer.save();

    // Generate reward for referrer
    const reward = await generateReferralReward(referrer._id, referral._id, orderTotal);

    if (reward) {
      // Mark referral as rewarded
      await referral.markAsRewarded();
      
      // Update referrer reward stats
      referrer.updateReferralStats('reward_earned', reward.value);
      await referrer.save();
    }

    logger.info('Referral qualification processed', {
      referralId: referral._id,
      referrerId: referrer._id,
      referredUserId: userId,
      orderId,
      rewardId: reward?._id,
      action: 'process_referral_qualification'
    });

    return { referral, reward };
  } catch (error) {
    logger.error('Process referral qualification error', { 
      userId, 
      orderId, 
      error: error.message 
    });
    return null;
  }
};

// Generate referral reward
const generateReferralReward = async (referrerId, referralId, orderTotal) => {
  try {
    // Reward configuration - this could be moved to a settings collection
    const rewardConfig = {
      type: 'discount_percent',
      value: 10, // 10% discount
      expiryDays: 90,
      minimumOrderValue: 0,
      maxRedemptionValue: 50 // Max £50 discount
    };

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + rewardConfig.expiryDays);

    const reward = new Reward({
      userId: referrerId,
      referralId: referralId,
      type: rewardConfig.type,
      value: rewardConfig.value,
      description: `${rewardConfig.value}% discount for successful referral`,
      expiryDate: expiryDate,
      minimumOrderValue: rewardConfig.minimumOrderValue,
      maxRedemptionValue: rewardConfig.maxRedemptionValue,
      termsAndConditions: 'Valid for one-time use. Cannot be combined with other offers.'
    });

    await reward.save();

    logger.info('Referral reward generated', {
      rewardId: reward._id,
      referrerId,
      referralId,
      type: reward.type,
      value: reward.value,
      action: 'generate_referral_reward'
    });

    return reward;
  } catch (error) {
    logger.error('Generate referral reward error', { 
      referrerId, 
      referralId, 
      error: error.message 
    });
    return null;
  }
};

// Get referral program settings (for frontend display)
export const getReferralProgramSettings = async (req, res) => {
  try {
    const settings = {
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
    };

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    logger.error('Get referral program settings error', { 
      error: error.message 
    });
    
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve program settings'
    });
  }
};