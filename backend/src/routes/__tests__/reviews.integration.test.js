import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import reviewRoutes from '../reviews.js';
import { protect } from '../../middleware/auth.js';

// Mock middleware
vi.mock('../../middleware/auth.js', () => ({
  protect: vi.fn((req, res, next) => {
    req.user = { _id: 'user123', email: 'test@example.com' };
    next();
  })
}));

// Mock controllers
vi.mock('../../controllers/reviewController.js', () => ({
  getCustomerReviews: vi.fn((req, res) => {
    res.status(200).json({ success: true, reviews: [] });
  }),
  updateCustomerReview: vi.fn((req, res) => {
    res.status(200).json({ success: true, message: 'Review updated' });
  }),
  deleteCustomerReview: vi.fn((req, res) => {
    res.status(200).json({ success: true, message: 'Review deleted' });
  })
}));

describe('Review Routes', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api', reviewRoutes);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/customer/reviews', () => {
    it('should require authentication', async () => {
      await request(app).get('/api/customer/reviews');
      expect(protect).toHaveBeenCalled();
    });

    it('should return customer reviews', async () => {
      const res = await request(app)
        .get('/api/customer/reviews')
        .expect(200);

      expect(res.body).toEqual({
        success: true,
        reviews: []
      });
    });
  });

  describe('PUT /api/customer/reviews/:reviewId', () => {
    it('should require authentication', async () => {
      await request(app)
        .put('/api/customer/reviews/review123')
        .send({ rating: 4, title: 'Updated', content: 'Updated content' });
      
      expect(protect).toHaveBeenCalled();
    });

    it('should update review', async () => {
      const res = await request(app)
        .put('/api/customer/reviews/review123')
        .send({ rating: 4, title: 'Updated', content: 'Updated content' })
        .expect(200);

      expect(res.body).toEqual({
        success: true,
        message: 'Review updated'
      });
    });
  });

  describe('DELETE /api/customer/reviews/:reviewId', () => {
    it('should require authentication', async () => {
      await request(app)
        .delete('/api/customer/reviews/review123');
      
      expect(protect).toHaveBeenCalled();
    });

    it('should delete review', async () => {
      const res = await request(app)
        .delete('/api/customer/reviews/review123')
        .expect(200);

      expect(res.body).toEqual({
        success: true,
        message: 'Review deleted'
      });
    });
  });
});