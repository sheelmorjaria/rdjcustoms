import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { 
  addToWishlist, 
  removeFromWishlist, 
  getWishlist, 
  checkProductInWishlist,
  clearWishlist,
  addToCartFromWishlist 
} from '../wishlistController.js';
import User from '../../models/User.js';
import Product from '../../models/Product.js';
import Cart from '../../models/Cart.js';
import logger from '../../utils/logger.js';

// Mock dependencies
vi.mock('../../models/User.js');
vi.mock('../../models/Product.js');
vi.mock('../../models/Cart.js');
vi.mock('../../utils/logger.js');

describe('Wishlist Controller Unit Tests', () => {
  let req, res, mockUser, mockProduct, mockCart;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Mock request and response objects
    req = {
      user: { _id: 'user123' },
      body: {},
      params: {}
    };

    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis()
    };

    // Mock user with wishlist methods
    mockUser = {
      _id: 'user123',
      wishlist: ['product123'],
      isInWishlist: vi.fn(),
      addToWishlist: vi.fn().mockReturnThis(),
      removeFromWishlist: vi.fn().mockReturnThis(),
      getWishlistCount: vi.fn(),
      clearWishlist: vi.fn().mockReturnThis(),
      save: vi.fn().mockResolvedValue(true)
    };

    // Mock product
    mockProduct = {
      _id: 'product123',
      name: 'Test Product',
      price: 29.99,
      isActive: true,
      stockStatus: 'in_stock',
      stockQuantity: 10,
      isInStock: vi.fn().mockReturnValue(true)
    };

    // Mock cart
    mockCart = {
      userId: 'user123',
      items: [],
      totalItems: 0,
      totalAmount: 0,
      save: vi.fn().mockResolvedValue(true)
    };

    // Mock logger
    logger.info = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('addToWishlist', () => {
    beforeEach(() => {
      req.body = { productId: 'product123' };
    });

    it('should add product to wishlist successfully', async () => {
      Product.findById.mockResolvedValue(mockProduct);
      User.findById.mockResolvedValue(mockUser);
      mockUser.isInWishlist.mockReturnValue(false);
      mockUser.getWishlistCount.mockReturnValue(1);

      await addToWishlist(req, res);

      expect(Product.findById).toHaveBeenCalledWith('product123');
      expect(User.findById).toHaveBeenCalledWith('user123');
      expect(mockUser.isInWishlist).toHaveBeenCalledWith('product123');
      expect(mockUser.addToWishlist).toHaveBeenCalledWith('product123');
      expect(mockUser.save).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith('Product added to wishlist', expect.any(Object));
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Product added to wishlist successfully',
        data: { wishlistCount: 1 }
      });
    });

    it('should return 404 if product not found', async () => {
      Product.findById.mockResolvedValue(null);

      await addToWishlist(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Product not found'
      });
    });

    it('should return 404 if user not found', async () => {
      Product.findById.mockResolvedValue(mockProduct);
      User.findById.mockResolvedValue(null);

      await addToWishlist(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'User not found'
      });
    });

    it('should return 400 if product already in wishlist', async () => {
      Product.findById.mockResolvedValue(mockProduct);
      User.findById.mockResolvedValue(mockUser);
      mockUser.isInWishlist.mockReturnValue(true);

      await addToWishlist(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Product is already in wishlist'
      });
    });

    it('should handle database errors', async () => {
      Product.findById.mockRejectedValue(new Error('Database error'));

      await addToWishlist(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Failed to add product to wishlist'
      });
    });
  });

  describe('removeFromWishlist', () => {
    beforeEach(() => {
      req.params = { productId: 'product123' };
    });

    it('should remove product from wishlist successfully', async () => {
      User.findById.mockResolvedValue(mockUser);
      mockUser.isInWishlist.mockReturnValue(true);
      mockUser.getWishlistCount.mockReturnValue(0);

      await removeFromWishlist(req, res);

      expect(User.findById).toHaveBeenCalledWith('user123');
      expect(mockUser.isInWishlist).toHaveBeenCalledWith('product123');
      expect(mockUser.removeFromWishlist).toHaveBeenCalledWith('product123');
      expect(mockUser.save).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith('Product removed from wishlist', expect.any(Object));
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Product removed from wishlist successfully',
        data: { wishlistCount: 0 }
      });
    });

    it('should return 404 if user not found', async () => {
      User.findById.mockResolvedValue(null);

      await removeFromWishlist(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'User not found'
      });
    });

    it('should return 404 if product not in wishlist', async () => {
      User.findById.mockResolvedValue(mockUser);
      mockUser.isInWishlist.mockReturnValue(false);

      await removeFromWishlist(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Product not found in wishlist'
      });
    });
  });

  describe('getWishlist', () => {
    it('should return user wishlist successfully', async () => {
      const populatedUser = {
        ...mockUser,
        wishlist: [mockProduct, null] // Include null to test filtering
      };
      
      User.findById.mockReturnValue({
        populate: vi.fn().mockResolvedValue(populatedUser)
      });

      await getWishlist(req, res);

      expect(User.findById).toHaveBeenCalledWith('user123');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          wishlist: [mockProduct], // Should filter out null
          totalItems: 1
        }
      });
    });

    it('should return 404 if user not found', async () => {
      User.findById.mockReturnValue({
        populate: vi.fn().mockResolvedValue(null)
      });

      await getWishlist(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'User not found'
      });
    });
  });

  describe('checkProductInWishlist', () => {
    beforeEach(() => {
      req.params = { productId: 'product123' };
    });

    it('should return true if product is in wishlist', async () => {
      User.findById.mockResolvedValue(mockUser);
      mockUser.isInWishlist.mockReturnValue(true);

      await checkProductInWishlist(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: { isInWishlist: true }
      });
    });

    it('should return false if product is not in wishlist', async () => {
      User.findById.mockResolvedValue(mockUser);
      mockUser.isInWishlist.mockReturnValue(false);

      await checkProductInWishlist(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: { isInWishlist: false }
      });
    });
  });

  describe('clearWishlist', () => {
    it('should clear wishlist successfully', async () => {
      User.findById.mockResolvedValue(mockUser);

      await clearWishlist(req, res);

      expect(mockUser.clearWishlist).toHaveBeenCalled();
      expect(mockUser.save).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith('Wishlist cleared', expect.any(Object));
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Wishlist cleared successfully',
        data: { wishlistCount: 0 }
      });
    });
  });

  describe('addToCartFromWishlist', () => {
    beforeEach(() => {
      req.body = { productId: 'product123', quantity: 2 };
    });

    it('should add product to cart from wishlist successfully', async () => {
      Product.findById.mockResolvedValue(mockProduct);
      User.findById.mockResolvedValue(mockUser);
      Cart.findByUserId.mockResolvedValue(mockCart);
      mockUser.isInWishlist.mockReturnValue(true);
      mockUser.getWishlistCount.mockReturnValue(0);

      await addToCartFromWishlist(req, res);

      expect(Product.findById).toHaveBeenCalledWith('product123');
      expect(User.findById).toHaveBeenCalledWith('user123');
      expect(Cart.findByUserId).toHaveBeenCalledWith('user123');
      expect(mockUser.removeFromWishlist).toHaveBeenCalledWith('product123');
      expect(mockCart.save).toHaveBeenCalled();
      expect(mockUser.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Product added to cart successfully',
        data: expect.objectContaining({
          productId: 'product123',
          quantity: 2,
          removedFromWishlist: true
        })
      });
    });

    it('should return 404 if product not found', async () => {
      Product.findById.mockResolvedValue(null);

      await addToCartFromWishlist(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Product not found'
      });
    });

    it('should return 400 if product is not active', async () => {
      mockProduct.isActive = false;
      Product.findById.mockResolvedValue(mockProduct);

      await addToCartFromWishlist(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Product is not available'
      });
    });

    it('should return 400 if product is out of stock', async () => {
      mockProduct.isInStock.mockReturnValue(false);
      Product.findById.mockResolvedValue(mockProduct);

      await addToCartFromWishlist(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Product is out of stock'
      });
    });

    it('should return 400 if insufficient stock', async () => {
      mockProduct.stockQuantity = 1;
      req.body.quantity = 5;
      Product.findById.mockResolvedValue(mockProduct);

      await addToCartFromWishlist(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Only 1 items available in stock'
      });
    });

    it('should return 404 if product not in wishlist', async () => {
      Product.findById.mockResolvedValue(mockProduct);
      User.findById.mockResolvedValue(mockUser);
      mockUser.isInWishlist.mockReturnValue(false);

      await addToCartFromWishlist(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Product not found in wishlist'
      });
    });

    it('should create new cart if user has no cart', async () => {
      Product.findById.mockResolvedValue(mockProduct);
      User.findById.mockResolvedValue(mockUser);
      Cart.findByUserId.mockResolvedValue(null);
      mockUser.isInWishlist.mockReturnValue(true);

      // Mock Cart constructor
      const mockNewCart = {
        userId: 'user123',
        items: [],
        totalItems: 0,
        totalAmount: 0,
        save: vi.fn().mockResolvedValue(true)
      };
      Cart.mockImplementation(() => mockNewCart);

      await addToCartFromWishlist(req, res);

      expect(Cart).toHaveBeenCalledWith({
        userId: 'user123',
        items: [],
        totalItems: 0,
        totalAmount: 0
      });
      expect(mockNewCart.save).toHaveBeenCalled();
    });

    it('should not remove from wishlist if removeFromWishlistAfterAdd is false', async () => {
      req.body.removeFromWishlistAfterAdd = false;
      Product.findById.mockResolvedValue(mockProduct);
      User.findById.mockResolvedValue(mockUser);
      Cart.findByUserId.mockResolvedValue(mockCart);
      mockUser.isInWishlist.mockReturnValue(true);

      await addToCartFromWishlist(req, res);

      expect(mockUser.removeFromWishlist).not.toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Product added to cart successfully',
        data: expect.objectContaining({
          removedFromWishlist: false
        })
      });
    });
  });
});