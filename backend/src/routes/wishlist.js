import express from 'express';
import { 
  addToWishlist, 
  removeFromWishlist, 
  getWishlist, 
  checkProductInWishlist,
  clearWishlist,
  addToCartFromWishlist 
} from '../controllers/wishlistController.js';
import { authenticate } from '../middleware/auth.js';
import { body, param } from 'express-validator';
import { validate } from '../middleware/validation.js';

const router = express.Router();

// Validation middleware
const validateProductId = [
  body('productId')
    .isMongoId()
    .withMessage('Product ID must be a valid MongoDB ObjectId'),
  validate
];

const validateProductIdParam = [
  param('productId')
    .isMongoId()
    .withMessage('Product ID must be a valid MongoDB ObjectId'),
  validate
];

const validateAddToCartFromWishlist = [
  body('productId')
    .isMongoId()
    .withMessage('Product ID must be a valid MongoDB ObjectId'),
  body('quantity')
    .optional()
    .isInt({ min: 1, max: 99 })
    .withMessage('Quantity must be an integer between 1 and 99'),
  body('removeFromWishlistAfterAdd')
    .optional()
    .isBoolean()
    .withMessage('removeFromWishlistAfterAdd must be a boolean'),
  validate
];

// Apply authentication middleware to all routes
router.use(authenticate);

// POST /api/user/wishlist - Add product to wishlist
router.post('/', validateProductId, addToWishlist);

// GET /api/user/wishlist - Get user's wishlist
router.get('/', getWishlist);

// DELETE /api/user/wishlist/:productId - Remove product from wishlist
router.delete('/:productId', validateProductIdParam, removeFromWishlist);

// GET /api/user/wishlist/check/:productId - Check if product is in wishlist
router.get('/check/:productId', validateProductIdParam, checkProductInWishlist);

// DELETE /api/user/wishlist - Clear entire wishlist
router.delete('/', clearWishlist);

// POST /api/user/wishlist/add-to-cart - Add product from wishlist to cart
router.post('/add-to-cart', validateAddToCartFromWishlist, addToCartFromWishlist);

export default router;