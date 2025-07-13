import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock models before importing
vi.mock('../../models/Review.js', () => {
  const ReviewMock = vi.fn();
  ReviewMock.find = vi.fn();
  ReviewMock.findById = vi.fn();
  return {
    default: ReviewMock
  };
});

vi.mock('../../models/Product.js', () => ({
  default: {
    findById: vi.fn()
  }
}));

vi.mock('../../utils/logger.js', () => ({
  default: {
    info: vi.fn(),
    error: vi.fn()
  }
}));

vi.mock('../../utils/sanitization.js', () => ({
  sanitizeInput: vi.fn((input) => input)
}));

// Import after mocks
import { getCustomerReviews, updateCustomerReview, deleteCustomerReview } from '../reviewController.js';
import Review from '../../models/Review.js';
import Product from '../../models/Product.js';

describe('Review Controller', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      user: { _id: 'customerId123' },
      params: {},
      body: {}
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };
    next = vi.fn();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getCustomerReviews', () => {
    it('should return customer reviews successfully', async () => {
      const mockReviews = [
        {
          _id: 'review1',
          rating: 5,
          title: 'Great product',
          content: 'I love it!',
          status: 'approved',
          createdAt: new Date(),
          updatedAt: new Date(),
          formattedDate: '1 January 2024',
          productId: {
            _id: 'product1',
            name: 'Test Product',
            slug: 'test-product',
            images: ['image1.jpg'],
            price: 29.99
          }
        }
      ];

      const findMock = {
        populate: vi.fn().mockReturnThis(),
        sort: vi.fn().mockResolvedValue(mockReviews)
      };
      Review.find.mockReturnValue(findMock);

      await getCustomerReviews(req, res, next);

      expect(Review.find).toHaveBeenCalledWith({
        customerId: 'customerId123',
        status: { $ne: 'deleted' }
      });
      expect(findMock.populate).toHaveBeenCalledWith({
        path: 'productId',
        select: 'name slug images price'
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        reviews: expect.any(Array)
      });
    });

    it('should handle errors gracefully', async () => {
      const error = new Error('Database error');
      Review.find.mockImplementation(() => {
        throw error;
      });

      await getCustomerReviews(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('updateCustomerReview', () => {
    beforeEach(() => {
      req.params.reviewId = 'review123';
      req.body = {
        rating: 4,
        title: 'Updated title',
        content: 'Updated content'
      };
    });

    it('should update review successfully', async () => {
      const mockReview = {
        _id: 'review123',
        rating: 5,
        title: 'Old title',
        content: 'Old content',
        status: 'approved',
        canBeEditedBy: vi.fn().mockReturnValue(true),
        save: vi.fn().mockResolvedValue(true)
      };

      Review.findById.mockResolvedValue(mockReview);

      await updateCustomerReview(req, res, next);

      // The controller should have updated these values
      expect(mockReview.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Review updated successfully',
        review: expect.objectContaining({
          _id: 'review123',
          rating: 4,
          title: 'Updated title',
          content: 'Updated content'
        })
      });
    });

    it('should return 400 for invalid rating', async () => {
      req.body.rating = 6;

      await updateCustomerReview(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    });

    it('should return 400 for missing fields', async () => {
      req.body = { rating: 4 }; // Missing title and content

      await updateCustomerReview(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Rating, title, and content are required'
      });
    });

    it('should return 404 if review not found', async () => {
      Review.findById.mockResolvedValue(null);

      await updateCustomerReview(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Review not found'
      });
    });

    it('should return 403 if user not authorized', async () => {
      const mockReview = {
        canBeEditedBy: vi.fn().mockReturnValue(false)
      };
      Review.findById.mockResolvedValue(mockReview);

      await updateCustomerReview(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'You are not authorized to edit this review'
      });
    });
  });

  describe('deleteCustomerReview', () => {
    beforeEach(() => {
      req.params.reviewId = 'review123';
    });

    it('should delete review successfully', async () => {
      const mockReview = {
        _id: 'review123',
        productId: 'product123',
        status: 'approved',
        canBeDeletedBy: vi.fn().mockReturnValue(true),
        save: vi.fn().mockResolvedValue(true)
      };

      const mockProduct = {
        _id: 'product123',
        averageRating: 4.5,
        reviewCount: 10,
        save: vi.fn().mockResolvedValue(true)
      };

      const mockActiveReviews = [
        { rating: 4 },
        { rating: 5 }
      ];

      Review.findById.mockResolvedValue(mockReview);
      Product.findById.mockResolvedValue(mockProduct);
      Review.find.mockResolvedValue(mockActiveReviews);

      await deleteCustomerReview(req, res, next);

      expect(mockReview.status).toBe('deleted');
      expect(mockReview.save).toHaveBeenCalled();
      expect(mockProduct.averageRating).toBe(4.5);
      expect(mockProduct.reviewCount).toBe(2);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Review deleted successfully'
      });
    });

    it('should handle product not found gracefully', async () => {
      const mockReview = {
        _id: 'review123',
        productId: 'product123',
        status: 'approved',
        canBeDeletedBy: vi.fn().mockReturnValue(true),
        save: vi.fn().mockResolvedValue(true)
      };

      Review.findById.mockResolvedValue(mockReview);
      Product.findById.mockResolvedValue(null);

      await deleteCustomerReview(req, res, next);

      expect(mockReview.status).toBe('deleted');
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should return 404 if review not found', async () => {
      Review.findById.mockResolvedValue(null);

      await deleteCustomerReview(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Review not found'
      });
    });

    it('should return 403 if user not authorized', async () => {
      const mockReview = {
        canBeDeletedBy: vi.fn().mockReturnValue(false)
      };
      Review.findById.mockResolvedValue(mockReview);

      await deleteCustomerReview(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'You are not authorized to delete this review'
      });
    });
  });
});