import mongoose from 'mongoose';

const referralSchema = new mongoose.Schema({
  referrerUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  referredUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  referralCode: {
    type: String,
    required: true,
    index: true
  },
  referredEmail: {
    type: String,
    default: null,
    trim: true,
    lowercase: true
  },
  status: {
    type: String,
    enum: ['pending', 'registered', 'qualified', 'rewarded', 'expired'],
    default: 'pending',
    index: true
  },
  clickCount: {
    type: Number,
    default: 0
  },
  firstClickDate: {
    type: Date,
    default: null
  },
  registrationDate: {
    type: Date,
    default: null
  },
  qualificationDate: {
    type: Date,
    default: null
  },
  qualifyingOrderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    default: null
  },
  rewardedDate: {
    type: Date,
    default: null
  },
  expiryDate: {
    type: Date,
    default: null
  },
  metadata: {
    referralSource: {
      type: String,
      enum: ['direct', 'email', 'social_facebook', 'social_twitter', 'social_whatsapp', 'other'],
      default: 'direct'
    },
    ipAddress: String,
    userAgent: String,
    utmSource: String,
    utmMedium: String,
    utmCampaign: String
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
referralSchema.index({ referrerUserId: 1, status: 1 });
referralSchema.index({ referralCode: 1, status: 1 });
referralSchema.index({ referredUserId: 1 }, { sparse: true });
referralSchema.index({ createdAt: 1, status: 1 });

// Instance method to mark referral as clicked
referralSchema.methods.recordClick = function(ipAddress, userAgent, source = 'direct') {
  this.clickCount += 1;
  
  if (!this.firstClickDate) {
    this.firstClickDate = new Date();
  }
  
  this.metadata.ipAddress = ipAddress;
  this.metadata.userAgent = userAgent;
  this.metadata.referralSource = source;
  
  return this.save();
};

// Instance method to mark referral as registered
referralSchema.methods.markAsRegistered = function(referredUserId, email) {
  this.status = 'registered';
  this.referredUserId = referredUserId;
  this.referredEmail = email;
  this.registrationDate = new Date();
  
  return this.save();
};

// Instance method to mark referral as qualified
referralSchema.methods.markAsQualified = function(orderId) {
  this.status = 'qualified';
  this.qualifyingOrderId = orderId;
  this.qualificationDate = new Date();
  
  return this.save();
};

// Instance method to mark referral as rewarded
referralSchema.methods.markAsRewarded = function() {
  this.status = 'rewarded';
  this.rewardedDate = new Date();
  
  return this.save();
};

// Instance method to check if referral is expired
referralSchema.methods.isExpired = function() {
  return this.expiryDate && new Date() > this.expiryDate;
};

// Static method to find active referrals by user
referralSchema.statics.findActiveByUser = function(userId) {
  return this.find({
    referrerUserId: userId,
    status: { $in: ['pending', 'registered', 'qualified', 'rewarded'] }
  }).populate('referredUserId', 'firstName lastName email')
    .populate('qualifyingOrderId', 'orderNumber totalAmount createdAt')
    .sort({ createdAt: -1 });
};

// Static method to find referral by code
referralSchema.statics.findByCode = function(code) {
  return this.findOne({
    referralCode: code,
    status: { $in: ['pending', 'registered'] }
  }).populate('referrerUserId', 'firstName lastName email');
};

// Pre-save middleware to set expiry date
referralSchema.pre('save', function(next) {
  if (this.isNew && !this.expiryDate) {
    // Set expiry to 60 days from creation
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 60);
    this.expiryDate = expiryDate;
  }
  next();
});

export default mongoose.model('Referral', referralSchema);