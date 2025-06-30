import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product ID is required']
  },
  productName: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: 100
  },
  productSlug: {
    type: String,
    required: [true, 'Product slug is required'],
    trim: true
  },
  productImage: {
    type: String,
    trim: true,
    maxlength: 500
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1'],
    max: [99, 'Quantity cannot exceed 99']
  },
  unitPrice: {
    type: Number,
    required: [true, 'Unit price is required'],
    min: [0, 'Unit price cannot be negative']
  },
  totalPrice: {
    type: Number,
    required: [true, 'Total price is required'],
    min: [0, 'Total price cannot be negative']
  }
});

const shippingAddressSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
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
    maxlength: 20
  }
});

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    trim: true,
    maxlength: 20
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  customerEmail: {
    type: String,
    required: [true, 'Customer email is required'],
    lowercase: true,
    trim: true,
    maxlength: 255
  },
  status: {
    type: String,
    required: [true, 'Order status is required'],
    enum: {
      values: ['pending', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned'],
      message: 'Status must be one of: pending, processing, shipped, out_for_delivery, delivered, cancelled, returned'
    },
    default: 'pending'
  },
  items: {
    type: [orderItemSchema],
    required: [true, 'Order items are required'],
    validate: {
      validator: function(items) {
        return items && items.length > 0;
      },
      message: 'Order must contain at least one item'
    }
  },
  subtotal: {
    type: Number,
    required: [true, 'Subtotal is required'],
    min: [0, 'Subtotal cannot be negative']
  },
  tax: {
    type: Number,
    required: [true, 'Tax amount is required'],
    min: [0, 'Tax cannot be negative'],
    default: 0
  },
  shipping: {
    type: Number,
    required: [true, 'Shipping cost is required'],
    min: [0, 'Shipping cost cannot be negative'],
    default: 0
  },
  totalAmount: {
    type: Number,
    min: [0, 'Total amount cannot be negative']
  },
  promotionCode: {
    type: String,
    trim: true,
    uppercase: true
  },
  promotionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Promotion'
  },
  discountAmount: {
    type: Number,
    default: 0,
    min: [0, 'Discount amount cannot be negative']
  },
  shippingAddress: {
    type: shippingAddressSchema,
    required: [true, 'Shipping address is required']
  },
  billingAddress: {
    type: shippingAddressSchema,
    required: [true, 'Billing address is required']
  },
  shippingMethod: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ShippingMethod',
      required: [true, 'Shipping method ID is required']
    },
    name: {
      type: String,
      required: [true, 'Shipping method name is required'],
      trim: true,
      maxlength: 100
    },
    cost: {
      type: Number,
      required: [true, 'Shipping method cost is required'],
      min: [0, 'Shipping cost cannot be negative']
    },
    estimatedDelivery: {
      type: String,
      trim: true,
      maxlength: 100
    }
  },
  paymentMethod: {
    type: {
      type: String,
      required: [true, 'Payment method type is required'],
      enum: {
        values: ['paypal', 'bitcoin', 'monero'],
        message: 'Payment method type must be: paypal, bitcoin, monero'
      }
    },
    name: {
      type: String,
      required: [true, 'Payment method name is required'],
      trim: true,
      maxlength: 100
    }
  },
  paymentDetails: {
    // PayPal payment details
    paypalOrderId: {
      type: String,
      trim: true,
      maxlength: 100
    },
    paypalPaymentId: {
      type: String,
      trim: true,
      maxlength: 100
    },
    paypalPayerId: {
      type: String,
      trim: true,
      maxlength: 100
    },
    paypalTransactionId: {
      type: String,
      trim: true,
      maxlength: 100
    },
    paypalPayerEmail: {
      type: String,
      trim: true,
      maxlength: 255
    },
    // Bitcoin payment details
    bitcoinAddress: {
      type: String,
      trim: true,
      maxlength: 100
    },
    bitcoinAmount: {
      type: Number,
      min: 0
    },
    bitcoinExchangeRate: {
      type: Number,
      min: 0
    },
    bitcoinExchangeRateTimestamp: {
      type: Date
    },
    bitcoinTransactionHash: {
      type: String,
      trim: true,
      maxlength: 100
    },
    bitcoinConfirmations: {
      type: Number,
      min: 0,
      default: 0
    },
    bitcoinPaymentExpiry: {
      type: Date
    },
    bitcoinAmountReceived: {
      type: Number,
      min: 0,
      default: 0
    },
    // Monero payment details
    moneroAddress: {
      type: String,
      trim: true,
      maxlength: 100
    },
    xmrAmount: {
      type: Number,
      min: 0
    },
    exchangeRate: {
      type: Number,
      min: 0
    },
    exchangeRateValidUntil: {
      type: Date
    },
    globeePaymentId: {
      type: String,
      trim: true,
      maxlength: 100
    },
    paymentUrl: {
      type: String,
      trim: true,
      maxlength: 500
    },
    expirationTime: {
      type: Date
    },
    confirmations: {
      type: Number,
      min: 0,
      default: 0
    },
    paidAmount: {
      type: Number,
      min: 0,
      default: 0
    },
    transactionHash: {
      type: String,
      trim: true,
      maxlength: 100
    },
    lastWebhookUpdate: {
      type: Date
    },
    paymentWindow: {
      type: Number,
      min: 1,
      default: 24
    },
    requiredConfirmations: {
      type: Number,
      min: 1,
      default: 10
    },
    // Generic transaction ID for any payment method
    transactionId: {
      type: String,
      trim: true,
      maxlength: 100,
      index: true
    }
  },
  paymentStatus: {
    type: String,
    required: [true, 'Payment status is required'],
    enum: {
      values: ['pending', 'completed', 'failed', 'refunded', 'awaiting_confirmation', 'underpaid', 'expired'],
      message: 'Payment status must be one of: pending, completed, failed, refunded, awaiting_confirmation, underpaid, expired'
    },
    default: 'pending'
  },
  // Refund information
  refundStatus: {
    type: String,
    enum: {
      values: ['none', 'partial_refunded', 'fully_refunded', 'pending_refund'],
      message: 'Refund status must be one of: none, partial_refunded, fully_refunded, pending_refund'
    },
    default: 'none',
    trim: true
  },
  totalRefundedAmount: {
    type: Number,
    min: [0, 'Total refunded amount cannot be negative'],
    default: 0
  },
  refundHistory: [{
    refundId: {
      type: String,
      required: [true, 'Refund ID is required'],
      trim: true,
      maxlength: 255
    },
    amount: {
      type: Number,
      required: [true, 'Refund amount is required'],
      min: [0, 'Refund amount cannot be negative']
    },
    date: {
      type: Date,
      required: [true, 'Refund date is required'],
      default: Date.now
    },
    reason: {
      type: String,
      required: [true, 'Refund reason is required'],
      trim: true,
      maxlength: 500
    },
    adminUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Admin user ID is required']
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'succeeded', 'failed', 'canceled'],
        message: 'Refund status must be one of: pending, succeeded, failed, canceled'
      },
      default: 'pending'
    }
  }],
  orderDate: {
    type: Date,
    required: [true, 'Order date is required'],
    default: Date.now,
    index: true
  },
  trackingNumber: {
    type: String,
    trim: true,
    maxlength: 100
  },
  trackingUrl: {
    type: String,
    trim: true,
    maxlength: 500
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 500
  },
  // Delivery tracking
  deliveryDate: {
    type: Date,
    index: true
  },
  // Return tracking
  hasReturnRequest: {
    type: Boolean,
    default: false,
    index: true
  },
  returnRequestIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ReturnRequest'
  }],
  statusHistory: [{
    status: {
      type: String,
      required: [true, 'Status is required'],
      enum: {
        values: ['pending', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned'],
        message: 'Status must be one of: pending, processing, shipped, out_for_delivery, delivered, cancelled, returned'
      }
    },
    timestamp: {
      type: Date,
      required: [true, 'Timestamp is required'],
      default: Date.now
    },
    note: {
      type: String,
      trim: true,
      maxlength: 200
    }
  }]
}, {
  timestamps: true
});

// Compound index for efficient querying by user and date
orderSchema.index({ userId: 1, orderDate: -1 });

// Indexes for report aggregations
orderSchema.index({ createdAt: 1, orderStatus: 1 }); // For sales reports
orderSchema.index({ 'cartItems.product': 1, createdAt: 1 }); // For product performance
orderSchema.index({ orderStatus: 1, createdAt: -1 }); // For order queries

// Pre-save middleware to generate order number and calculate total
orderSchema.pre('save', function(next) {
  // Generate order number if not provided
  if (!this.orderNumber) {
    // Use shorter timestamp (last 8 digits) and 3-digit random suffix
    const timestamp = Date.now().toString().slice(-8);
    const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.orderNumber = `ORD-${timestamp}-${randomSuffix}`;
  }
  
  // Calculate totalAmount from subtotal, tax, and shipping if not provided
  if (!this.totalAmount) {
    this.totalAmount = this.subtotal + this.tax + this.shipping;
  }
  
  // Track status changes in statusHistory
  if (this.isModified('status') || this.isNew) {
    // Initialize statusHistory if it doesn't exist
    if (!this.statusHistory) {
      this.statusHistory = [];
    }
    
    // Add new status entry to history
    this.statusHistory.push({
      status: this.status,
      timestamp: new Date(),
      note: this.isNew ? 'Order created' : 'Status updated'
    });
  }
  
  next();
});

// Instance method to format order status for display
orderSchema.methods.getStatusDisplay = function() {
  const statusMap = {
    pending: 'Pending',
    processing: 'Processing',
    shipped: 'Shipped',
    out_for_delivery: 'Out for Delivery',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    returned: 'Returned'
  };
  return statusMap[this.status] || this.status;
};

// Instance method to get formatted order date
orderSchema.methods.getFormattedDate = function() {
  return this.orderDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Instance method to format payment method for display
orderSchema.methods.getPaymentMethodDisplay = function() {
  return this.paymentMethod.name || this.paymentMethod.type;
};

// Instance method to calculate maximum refundable amount
orderSchema.methods.getMaxRefundableAmount = function() {
  return Math.max(0, this.totalAmount - (this.totalRefundedAmount || 0));
};

// Instance method to check if order is eligible for refund
orderSchema.methods.isRefundEligible = function() {
  return this.paymentStatus === 'completed' && 
         this.refundStatus !== 'fully_refunded' &&
         this.getMaxRefundableAmount() > 0;
};

// Static method to find orders by user with pagination
orderSchema.statics.findByUser = function(userId, options = {}) {
  const {
    page = 1,
    limit = 10,
    sortBy = 'orderDate',
    sortOrder = -1
  } = options;
  
  const skip = (page - 1) * limit;
  const sort = { [sortBy]: sortOrder };
  
  return this.find({ userId })
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .select('orderNumber orderDate totalAmount status customerEmail items.length');
};

// Static method to count orders by user
orderSchema.statics.countByUser = function(userId) {
  return this.countDocuments({ userId });
};

const Order = mongoose.model('Order', orderSchema);

export default Order;