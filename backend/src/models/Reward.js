import mongoose from 'mongoose';

const rewardSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  referralId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Referral',
    required: true
  },
  type: {
    type: String,
    enum: ['discount_percent', 'discount_fixed', 'store_credit', 'free_shipping', 'cashback'],
    required: true
  },
  rewardCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  value: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'GBP',
    enum: ['GBP', 'USD', 'EUR']
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'redeemed', 'expired', 'cancelled'],
    default: 'active',
    index: true
  },
  issuedDate: {
    type: Date,
    default: Date.now
  },
  expiryDate: {
    type: Date,
    required: true
  },
  redemptionDate: {
    type: Date,
    default: null
  },
  redeemedOrderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    default: null
  },
  redemptionValue: {
    type: Number,
    default: 0
  },
  minimumOrderValue: {
    type: Number,
    default: 0
  },
  maxRedemptionValue: {
    type: Number,
    default: null
  },
  isTransferable: {
    type: Boolean,
    default: false
  },
  usageLimit: {
    type: Number,
    default: 1
  },
  usageCount: {
    type: Number,
    default: 0
  },
  termsAndConditions: {
    type: String,
    default: 'Standard referral reward terms apply.'
  },
  metadata: {
    campaign: String,
    source: String,
    notes: String
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
rewardSchema.index({ userId: 1, status: 1 });
rewardSchema.index({ rewardCode: 1, status: 1 });
rewardSchema.index({ expiryDate: 1, status: 1 });
rewardSchema.index({ issuedDate: 1, status: 1 });

// Instance method to check if reward is expired
rewardSchema.methods.isExpired = function() {
  return new Date() > this.expiryDate;
};

// Instance method to check if reward is redeemable
rewardSchema.methods.isRedeemable = function() {
  return this.status === 'active' && 
         !this.isExpired() && 
         this.usageCount < this.usageLimit;
};

// Instance method to check if reward can be applied to order
rewardSchema.methods.canApplyToOrder = function(orderTotal) {
  if (!this.isRedeemable()) {
    return { valid: false, reason: 'Reward is not redeemable' };
  }
  
  if (orderTotal < this.minimumOrderValue) {
    return { 
      valid: false, 
      reason: `Minimum order value of £${this.minimumOrderValue.toFixed(2)} required` 
    };
  }
  
  return { valid: true };
};

// Instance method to calculate discount amount
rewardSchema.methods.calculateDiscount = function(orderTotal) {
  if (!this.canApplyToOrder(orderTotal).valid) {
    return 0;
  }
  
  let discount = 0;
  
  switch (this.type) {
  case 'discount_percent':
    discount = (orderTotal * this.value) / 100;
    break;
  case 'discount_fixed':
    discount = Math.min(this.value, orderTotal);
    break;
  case 'store_credit':
    discount = Math.min(this.value, orderTotal);
    break;
  case 'free_shipping':
    // This would need to be handled in shipping calculation
    discount = 0;
    break;
  case 'cashback':
    // Cashback is processed after order completion
    discount = 0;
    break;
  default:
    discount = 0;
  }
  
  // Apply maximum redemption value if set
  if (this.maxRedemptionValue && discount > this.maxRedemptionValue) {
    discount = this.maxRedemptionValue;
  }
  
  return Math.round(discount * 100) / 100; // Round to 2 decimal places
};

// Instance method to redeem reward
rewardSchema.methods.redeem = function(orderId, redemptionValue = null) {
  this.status = 'redeemed';
  this.redemptionDate = new Date();
  this.redeemedOrderId = orderId;
  this.usageCount += 1;
  
  if (redemptionValue !== null) {
    this.redemptionValue = redemptionValue;
  }
  
  return this.save();
};

// Instance method to format display value
rewardSchema.methods.getDisplayValue = function() {
  switch (this.type) {
  case 'discount_percent':
    return `${this.value}% off`;
  case 'discount_fixed':
  case 'store_credit':
    return `£${this.value.toFixed(2)} off`;
  case 'free_shipping':
    return 'Free shipping';
  case 'cashback':
    return `£${this.value.toFixed(2)} cashback`;
  default:
    return `£${this.value.toFixed(2)}`;
  }
};

// Static method to find active rewards by user
rewardSchema.statics.findActiveByUser = function(userId) {
  return this.find({
    userId: userId,
    status: 'active',
    expiryDate: { $gt: new Date() }
  }).populate('referralId', 'referredEmail registrationDate qualificationDate')
    .sort({ issuedDate: -1 });
};

// Static method to find reward by code
rewardSchema.statics.findByCode = function(code) {
  return this.findOne({
    rewardCode: code.toUpperCase(),
    status: 'active',
    expiryDate: { $gt: new Date() }
  }).populate('userId', 'firstName lastName email');
};

// Static method to generate reward code
rewardSchema.statics.generateRewardCode = function() {
  const prefix = 'REF';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}${timestamp}${random}`;
};

// Pre-save middleware to generate reward code
rewardSchema.pre('save', function(next) {
  if (this.isNew && !this.rewardCode) {
    this.rewardCode = this.constructor.generateRewardCode();
  }
  next();
});

// Pre-save middleware to update status based on expiry
rewardSchema.pre('save', function(next) {
  if (this.status === 'active' && this.isExpired()) {
    this.status = 'expired';
  }
  next();
});

export default mongoose.model('Reward', rewardSchema);