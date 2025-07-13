import express from 'express';
import { 
  getCustomerReviews, 
  updateCustomerReview, 
  deleteCustomerReview 
} from '../controllers/reviewController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Customer review management routes
router.get('/customer/reviews', protect, getCustomerReviews);
router.put('/customer/reviews/:reviewId', protect, updateCustomerReview);
router.delete('/customer/reviews/:reviewId', protect, deleteCustomerReview);

export default router;