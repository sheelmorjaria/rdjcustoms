import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'deleted'],
    default: 'pending'
  },
  images: [{
    type: String,
    maxlength: 500
  }],
  helpfulCount: {
    type: Number,
    default: 0,
    min: 0
  },
  unhelpfulCount: {
    type: Number,
    default: 0,
    min: 0
  },
  verifiedPurchase: {
    type: Boolean,
    default: false
  },
  adminNotes: {
    type: String,
    maxlength: 500
  }
}, {
  timestamps: true
});

// Compound index to ensure one review per customer per product
reviewSchema.index({ customerId: 1, productId: 1 }, { unique: true });

// Index for querying reviews by status
reviewSchema.index({ status: 1 });

// Index for querying reviews by product
reviewSchema.index({ productId: 1, status: 1 });

// Index for querying reviews by customer
reviewSchema.index({ customerId: 1, status: 1 });

// Method to check if user can edit this review
reviewSchema.methods.canBeEditedBy = function(userId) {
  return this.customerId.toString() === userId.toString() && this.status !== 'deleted';
};

// Method to check if user can delete this review
reviewSchema.methods.canBeDeletedBy = function(userId) {
  return this.customerId.toString() === userId.toString() && this.status !== 'deleted';
};

// Virtual for formatted date
reviewSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Ensure virtuals are included in JSON output
reviewSchema.set('toJSON', { virtuals: true });

const Review = mongoose.model('Review', reviewSchema);

export default Review;