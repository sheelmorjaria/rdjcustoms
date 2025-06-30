import mongoose from 'mongoose';

const promotionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    index: true
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['percentage', 'fixed_amount', 'free_shipping']
  },
  value: {
    type: Number,
    required: function() {
      return this.type !== 'free_shipping';
    },
    min: 0
  },
  minimumOrderSubtotal: {
    type: Number,
    min: 0,
    default: 0
  },
  applicableProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  applicableCategories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  totalUsageLimit: {
    type: Number,
    min: 0
  },
  perUserUsageLimit: {
    type: Number,
    min: 0,
    default: 1
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['draft', 'active', 'inactive', 'expired', 'archived'],
    default: 'draft'
  },
  timesUsed: {
    type: Number,
    default: 0,
    min: 0
  },
  usersUsed: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    usageCount: {
      type: Number,
      default: 1
    },
    usedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for performance
promotionSchema.index({ status: 1, startDate: 1, endDate: 1 });
promotionSchema.index({ code: 1, isDeleted: 1 });

// Virtual to check if promotion is currently valid
promotionSchema.virtual('isValid').get(function() {
  const now = new Date();
  return this.status === 'active' && 
         this.startDate <= now && 
         this.endDate >= now &&
         !this.isDeleted;
});

// Virtual to check if promotion has reached usage limit
promotionSchema.virtual('hasReachedLimit').get(function() {
  return this.totalUsageLimit && this.timesUsed >= this.totalUsageLimit;
});

// Method to check if user can use this promotion
promotionSchema.methods.canUserUse = function(userId) {
  if (!userId) return false;
  
  // Check if promotion is valid
  if (!this.isValid || this.hasReachedLimit) return false;
  
  // Check per-user usage limit
  const userUsage = this.usersUsed.find(u => u.userId.toString() === userId.toString());
  if (userUsage && userUsage.usageCount >= this.perUserUsageLimit) {
    return false;
  }
  
  return true;
};

// Method to calculate discount amount
promotionSchema.methods.calculateDiscount = function(subtotal, shippingCost = 0) {
  if (!this.isValid) return 0;
  
  // Check minimum order subtotal
  if (subtotal < this.minimumOrderSubtotal) return 0;
  
  switch (this.type) {
    case 'percentage':
      return Math.round(subtotal * (this.value / 100) * 100) / 100;
    case 'fixed_amount':
      return Math.min(this.value, subtotal);
    case 'free_shipping':
      return shippingCost;
    default:
      return 0;
  }
};

// Method to record usage
promotionSchema.methods.recordUsage = async function(userId) {
  // Increment total usage
  this.timesUsed += 1;
  
  // Record user usage
  const existingUserUsage = this.usersUsed.find(u => u.userId.toString() === userId.toString());
  if (existingUserUsage) {
    existingUserUsage.usageCount += 1;
    existingUserUsage.usedAt = new Date();
  } else {
    this.usersUsed.push({
      userId,
      usageCount: 1,
      usedAt: new Date()
    });
  }
  
  await this.save();
};

// Pre-save hook to update status based on dates
promotionSchema.pre('save', function(next) {
  const now = new Date();
  
  // Auto-expire promotions past their end date
  if (this.endDate < now && this.status !== 'archived') {
    this.status = 'expired';
  }
  
  next();
});

// Static method to find active promotions
promotionSchema.statics.findActive = function() {
  const now = new Date();
  return this.find({
    status: 'active',
    startDate: { $lte: now },
    endDate: { $gte: now },
    isDeleted: false
  });
};

// Static method to find by code
promotionSchema.statics.findByCode = function(code) {
  return this.findOne({
    code: code.toUpperCase(),
    isDeleted: false
  });
};

// Ensure end date is after start date
promotionSchema.pre('validate', function(next) {
  if (this.startDate && this.endDate && this.startDate >= this.endDate) {
    next(new Error('End date must be after start date'));
  } else {
    next();
  }
});

const Promotion = mongoose.model('Promotion', promotionSchema);

export default Promotion;