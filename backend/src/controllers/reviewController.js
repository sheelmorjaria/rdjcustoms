import Review from '../models/Review.js';
import Product from '../models/Product.js';
import logger from '../utils/logger.js';
import { sanitizeInput } from '../utils/sanitization.js';

// Get all reviews for the authenticated customer
export const getCustomerReviews = async (req, res, next) => {
  try {
    const customerId = req.user._id;
    
    const reviews = await Review.find({ 
      customerId,
      status: { $ne: 'deleted' }
    })
      .populate({
        path: 'productId',
        select: 'name slug images price'
      })
      .sort({ createdAt: -1 });

    logger.info(`Customer ${customerId} fetched their reviews`);
    
    res.status(200).json({
      success: true,
      reviews: reviews.map(review => ({
        _id: review._id,
        rating: review.rating,
        title: review.title,
        content: review.content,
        status: review.status,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
        formattedDate: review.formattedDate,
        product: review.productId ? {
          _id: review.productId._id,
          name: review.productId.name,
          slug: review.productId.slug,
          image: review.productId.images?.[0] || null,
          price: review.productId.price
        } : null
      }))
    });
  } catch (error) {
    logger.error('Error fetching customer reviews:', error);
    next(error);
  }
};

// Update a review
export const updateCustomerReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const customerId = req.user._id;
    const { rating, title, content } = req.body;

    // Validate input
    if (!rating || !title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Rating, title, and content are required'
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    // Sanitize input
    const sanitizedTitle = sanitizeInput(title);
    const sanitizedContent = sanitizeInput(content);

    // Find the review
    const review = await Review.findById(reviewId);
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check ownership
    if (!review.canBeEditedBy(customerId)) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to edit this review'
      });
    }

    // Update the review
    review.rating = rating;
    review.title = sanitizedTitle;
    review.content = sanitizedContent;
    
    // If moderation is enabled, set status back to pending
    if (review.status === 'approved') {
      review.status = 'pending';
    }

    await review.save();

    logger.info(`Customer ${customerId} updated review ${reviewId}`);

    res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      review: {
        _id: review._id,
        rating: review.rating,
        title: review.title,
        content: review.content,
        status: review.status,
        updatedAt: review.updatedAt
      }
    });
  } catch (error) {
    logger.error('Error updating customer review:', error);
    next(error);
  }
};

// Delete a review
export const deleteCustomerReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const customerId = req.user._id;

    // Find the review
    const review = await Review.findById(reviewId);
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check ownership
    if (!review.canBeDeletedBy(customerId)) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this review'
      });
    }

    // Soft delete the review
    review.status = 'deleted';
    await review.save();

    // Update product rating if needed
    const product = await Product.findById(review.productId);
    if (product) {
      // Recalculate average rating
      const activeReviews = await Review.find({
        productId: product._id,
        status: 'approved'
      });

      if (activeReviews.length > 0) {
        const totalRating = activeReviews.reduce((sum, r) => sum + r.rating, 0);
        product.averageRating = totalRating / activeReviews.length;
        product.reviewCount = activeReviews.length;
      } else {
        product.averageRating = 0;
        product.reviewCount = 0;
      }
      
      await product.save();
    }

    logger.info(`Customer ${customerId} deleted review ${reviewId}`);

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting customer review:', error);
    next(error);
  }
};