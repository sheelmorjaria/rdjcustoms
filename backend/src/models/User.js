import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    maxlength: 255,
    match: [
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      'Please enter a valid email address'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long']
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: 50
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: 50
  },
  phone: {
    type: String,
    trim: true,
    maxlength: 20,
    match: [
      /^[\+]?[1-9][\d]{0,15}$/,
      'Please enter a valid phone number'
    ]
  },
  isActive: {
    type: Boolean,
    default: true
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  marketingOptIn: {
    type: Boolean,
    default: false
  },
  role: {
    type: String,
    enum: ['customer', 'admin'],
    default: 'customer'
  },
  accountStatus: {
    type: String,
    enum: ['active', 'disabled'],
    default: 'active'
  },
  lastLoginAt: {
    type: Date
  },
  emailVerificationToken: {
    type: String
  },
  emailVerificationExpires: {
    type: Date
  },
  passwordResetToken: {
    type: String
  },
  passwordResetExpires: {
    type: Date
  },
  addresses: [{
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      maxlength: 100
    },
    company: {
      type: String,
      trim: true,
      maxlength: 100
    },
    addressLine1: {
      type: String,
      required: [true, 'Address line 1 is required'],
      trim: true,
      maxlength: 100
    },
    addressLine2: {
      type: String,
      trim: true,
      maxlength: 100
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      maxlength: 50
    },
    stateProvince: {
      type: String,
      required: [true, 'State/Province is required'],
      trim: true,
      maxlength: 50
    },
    postalCode: {
      type: String,
      required: [true, 'Postal code is required'],
      trim: true,
      maxlength: 20
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      trim: true,
      maxlength: 50
    },
    phoneNumber: {
      type: String,
      trim: true,
      maxlength: 20,
      match: [
        /^[\+]?[1-9][\d\s\-\(\)]{0,20}$/,
        'Please enter a valid phone number'
      ]
    },
    isDeleted: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  }],
  defaultShippingAddressId: {
    type: mongoose.Schema.Types.ObjectId
  },
  defaultBillingAddressId: {
    type: mongoose.Schema.Types.ObjectId
  },
  wishlist: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  referralCode: {
    type: String,
    unique: true,
    sparse: true,
    uppercase: true,
    index: true
  },
  referralStats: {
    totalReferrals: {
      type: Number,
      default: 0
    },
    successfulReferrals: {
      type: Number,
      default: 0
    },
    totalRewards: {
      type: Number,
      default: 0
    },
    lastReferralDate: {
      type: Date
    }
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.emailVerificationToken;
      delete ret.emailVerificationExpires;
      delete ret.passwordResetToken;
      delete ret.passwordResetExpires;
      return ret;
    }
  }
});

// Index for email uniqueness and quick lookups
userSchema.index({ email: 1 }, { unique: true });

// Index for performance on common queries
userSchema.index({ isActive: 1 });
userSchema.index({ role: 1 });

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with cost of 12
    const saltRounds = 12;
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Instance method to get full name
userSchema.methods.getFullName = function() {
  return `${this.firstName} ${this.lastName}`.trim();
};

// Instance method to generate email verification token
userSchema.methods.generateEmailVerificationToken = function() {
  const token = crypto.randomBytes(32).toString('hex');
  
  this.emailVerificationToken = token;
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  
  return token;
};

// Instance method to generate password reset token
userSchema.methods.generatePasswordResetToken = function() {
  const token = crypto.randomBytes(32).toString('hex');
  
  this.passwordResetToken = token;
  this.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour
  
  return token;
};

// Static method to find by email
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Static method to find active users
userSchema.statics.findActiveUsers = function() {
  return this.find({ isActive: true });
};

// Instance method to get active addresses (not deleted)
userSchema.methods.getActiveAddresses = function() {
  return this.addresses.filter(address => !address.isDeleted);
};

// Instance method to get address by ID
userSchema.methods.getAddressById = function(addressId) {
  return this.addresses.id(addressId);
};

// Instance method to add new address
userSchema.methods.addAddress = function(addressData) {
  const address = this.addresses.create(addressData);
  this.addresses.push(address);
  return address;
};

// Instance method to update address
userSchema.methods.updateAddress = function(addressId, addressData) {
  const address = this.addresses.id(addressId);
  if (!address || address.isDeleted) {
    throw new Error('Address not found');
  }
  
  Object.assign(address, addressData);
  address.updatedAt = new Date();
  return address;
};

// Instance method to soft delete address
userSchema.methods.deleteAddress = function(addressId) {
  const address = this.addresses.id(addressId);
  if (!address || address.isDeleted) {
    throw new Error('Address not found');
  }
  
  // Check if it's a default address
  if (this.defaultShippingAddressId && this.defaultShippingAddressId.toString() === addressId.toString()) {
    this.defaultShippingAddressId = null;
  }
  if (this.defaultBillingAddressId && this.defaultBillingAddressId.toString() === addressId.toString()) {
    this.defaultBillingAddressId = null;
  }
  
  address.isDeleted = true;
  address.updatedAt = new Date();
  return address;
};

// Instance method to set default shipping address
userSchema.methods.setDefaultShippingAddress = function(addressId) {
  const address = this.addresses.id(addressId);
  if (!address || address.isDeleted) {
    throw new Error('Address not found');
  }
  
  this.defaultShippingAddressId = addressId;
  return address;
};

// Instance method to set default billing address
userSchema.methods.setDefaultBillingAddress = function(addressId) {
  const address = this.addresses.id(addressId);
  if (!address || address.isDeleted) {
    throw new Error('Address not found');
  }
  
  this.defaultBillingAddressId = addressId;
  return address;
};

// Instance method to get default shipping address
userSchema.methods.getDefaultShippingAddress = function() {
  if (!this.defaultShippingAddressId) return null;
  return this.addresses.id(this.defaultShippingAddressId);
};

// Instance method to get default billing address
userSchema.methods.getDefaultBillingAddress = function() {
  if (!this.defaultBillingAddressId) return null;
  return this.addresses.id(this.defaultBillingAddressId);
};

// Instance method to add product to wishlist
userSchema.methods.addToWishlist = function(productId) {
  if (!this.wishlist.includes(productId)) {
    this.wishlist.push(productId);
  }
  return this;
};

// Instance method to remove product from wishlist
userSchema.methods.removeFromWishlist = function(productId) {
  this.wishlist = this.wishlist.filter(id => !id.equals(productId));
  return this;
};

// Instance method to check if product is in wishlist
userSchema.methods.isInWishlist = function(productId) {
  return this.wishlist.some(id => id.equals(productId));
};

// Instance method to get wishlist count
userSchema.methods.getWishlistCount = function() {
  return this.wishlist.length;
};

// Instance method to clear wishlist
userSchema.methods.clearWishlist = function() {
  this.wishlist = [];
  return this;
};

// Instance method to generate referral code
userSchema.methods.generateReferralCode = function() {
  if (!this.referralCode) {
    const prefix = 'REF';
    const userId = this._id.toString().slice(-6).toUpperCase();
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 4).toUpperCase();
    this.referralCode = `${prefix}${userId}${timestamp}${random}`;
  }
  return this.referralCode;
};

// Instance method to get referral URL
userSchema.methods.getReferralUrl = function(baseUrl = 'https://rdjcustoms.com') {
  if (!this.referralCode) {
    this.generateReferralCode();
  }
  return `${baseUrl}?ref=${this.referralCode}`;
};

// Instance method to update referral stats
userSchema.methods.updateReferralStats = function(type, amount = 0) {
  if (!this.referralStats) {
    this.referralStats = {
      totalReferrals: 0,
      successfulReferrals: 0,
      totalRewards: 0
    };
  }
  
  switch (type) {
    case 'new_referral':
      this.referralStats.totalReferrals += 1;
      this.referralStats.lastReferralDate = new Date();
      break;
    case 'successful_referral':
      this.referralStats.successfulReferrals += 1;
      break;
    case 'reward_earned':
      this.referralStats.totalRewards += amount;
      break;
  }
  
  return this;
};

// Indexes for customer reports
userSchema.index({ createdAt: 1, role: 1 }); // For customer acquisition reports
userSchema.index({ role: 1, accountStatus: 1 }); // For user management queries
userSchema.index({ referralCode: 1 }, { sparse: true }); // For referral lookups

const User = mongoose.model('User', userSchema);

export default User;