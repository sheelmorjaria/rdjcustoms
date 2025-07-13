import { describe, it, expect, beforeEach } from 'vitest';
import { validationResult } from 'express-validator';
import {
  createPromotionValidator,
  updatePromotionValidator,
  updatePromotionStatusValidator,
  getPromotionsValidator,
  checkPromotionCodeValidator,
  deletePromotionValidator
} from '../promotionValidators.js';

// Helper function to run validators
const runValidators = async (validators, req) => {
  for (const validator of validators) {
    await validator.run(req);
  }
  return validationResult(req);
};

// Mock request object
const createMockRequest = (body = {}, params = {}, query = {}) => ({
  body,
  params,
  query
});

describe('Promotion Validators', () => {
  describe('createPromotionValidator', () => {
    const validPromotion = {
      name: 'Summer Sale',
      code: 'SUMMER2024',
      type: 'percentage',
      value: 20,
      startDate: '2024-06-01T00:00:00Z',
      endDate: '2024-08-31T23:59:59Z'
    };

    it('should pass with valid promotion data', async () => {
      const req = createMockRequest(validPromotion);
      const result = await runValidators(createPromotionValidator, req);
      
      expect(result.isEmpty()).toBe(true);
    });

    it('should fail when required fields are missing', async () => {
      const req = createMockRequest({});
      const result = await runValidators(createPromotionValidator, req);
      
      const errors = result.array();
      expect(errors).toContainEqual(expect.objectContaining({
        msg: 'Promotion name is required',
        path: 'name'
      }));
      expect(errors).toContainEqual(expect.objectContaining({
        msg: 'Promotion code is required',
        path: 'code'
      }));
      expect(errors).toContainEqual(expect.objectContaining({
        msg: 'Promotion type is required',
        path: 'type'
      }));
    });

    it('should validate name length', async () => {
      const req = createMockRequest({
        ...validPromotion,
        name: 'AB' // Too short
      });
      const result = await runValidators(createPromotionValidator, req);
      
      expect(result.array()).toContainEqual(expect.objectContaining({
        msg: 'Name must be between 3 and 100 characters',
        path: 'name'
      }));
    });

    it('should validate code format', async () => {
      const req = createMockRequest({
        ...validPromotion,
        code: 'invalid-code!' // Contains invalid characters
      });
      const result = await runValidators(createPromotionValidator, req);
      
      expect(result.array()).toContainEqual(expect.objectContaining({
        msg: 'Code can only contain letters, numbers, and underscores',
        path: 'code'
      }));
    });

    it('should validate promotion types', async () => {
      const req = createMockRequest({
        ...validPromotion,
        type: 'invalid_type'
      });
      const result = await runValidators(createPromotionValidator, req);
      
      expect(result.array()).toContainEqual(expect.objectContaining({
        msg: 'Invalid promotion type',
        path: 'type'
      }));
    });

    it('should validate percentage value does not exceed 100', async () => {
      const req = createMockRequest({
        ...validPromotion,
        type: 'percentage',
        value: 150
      });
      const result = await runValidators(createPromotionValidator, req);
      
      expect(result.array()).toContainEqual(expect.objectContaining({
        msg: 'Percentage value cannot exceed 100',
        path: 'value'
      }));
    });

    it('should allow fixed amount values over 100', async () => {
      const req = createMockRequest({
        ...validPromotion,
        type: 'fixed_amount',
        value: 150
      });
      const result = await runValidators(createPromotionValidator, req);
      
      expect(result.isEmpty()).toBe(true);
    });

    it('should not require value for free_shipping type', async () => {
      const req = createMockRequest({
        ...validPromotion,
        type: 'free_shipping',
        value: undefined
      });
      const result = await runValidators(createPromotionValidator, req);
      
      expect(result.isEmpty()).toBe(true);
    });

    it('should validate end date is after start date', async () => {
      const req = createMockRequest({
        ...validPromotion,
        startDate: '2024-08-01T00:00:00Z',
        endDate: '2024-07-01T00:00:00Z'
      });
      const result = await runValidators(createPromotionValidator, req);
      
      expect(result.array()).toContainEqual(expect.objectContaining({
        msg: 'End date must be after start date',
        path: 'endDate'
      }));
    });

    it('should validate MongoDB ObjectId format for applicable products', async () => {
      const req = createMockRequest({
        ...validPromotion,
        applicableProducts: ['invalid-id', '507f1f77bcf86cd799439011']
      });
      const result = await runValidators(createPromotionValidator, req);
      
      expect(result.array()).toContainEqual(expect.objectContaining({
        msg: 'Invalid product ID format',
        path: 'applicableProducts'
      }));
    });

    it('should accept valid MongoDB ObjectIds for products', async () => {
      const req = createMockRequest({
        ...validPromotion,
        applicableProducts: ['507f1f77bcf86cd799439011', '507f191e810c19729de860ea']
      });
      const result = await runValidators(createPromotionValidator, req);
      
      expect(result.isEmpty()).toBe(true);
    });

    it('should validate usage limits', async () => {
      const req = createMockRequest({
        ...validPromotion,
        totalUsageLimit: 0,
        perUserUsageLimit: -1
      });
      const result = await runValidators(createPromotionValidator, req);
      
      const errors = result.array();
      expect(errors).toContainEqual(expect.objectContaining({
        msg: 'Total usage limit must be a positive integer',
        path: 'totalUsageLimit'
      }));
      expect(errors).toContainEqual(expect.objectContaining({
        msg: 'Per user usage limit must be a positive integer',
        path: 'perUserUsageLimit'
      }));
    });

    it('should validate optional status field', async () => {
      const req = createMockRequest({
        ...validPromotion,
        status: 'published' // Invalid status
      });
      const result = await runValidators(createPromotionValidator, req);
      
      expect(result.array()).toContainEqual(expect.objectContaining({
        msg: 'Invalid status',
        path: 'status'
      }));
    });
  });

  describe('updatePromotionValidator', () => {
    it('should validate promotion ID in params', async () => {
      const req = createMockRequest({}, { promoId: 'invalid-id' });
      const result = await runValidators(updatePromotionValidator, req);
      
      expect(result.array()).toContainEqual(expect.objectContaining({
        msg: 'Invalid promotion ID',
        path: 'promoId'
      }));
    });

    it('should allow partial updates', async () => {
      const req = createMockRequest(
        { name: 'Updated Summer Sale' },
        { promoId: '507f1f77bcf86cd799439011' }
      );
      const result = await runValidators(updatePromotionValidator, req);
      
      expect(result.isEmpty()).toBe(true);
    });

    it('should validate updated fields', async () => {
      const req = createMockRequest(
        { 
          code: 'A', // Too short
          type: 'invalid_type'
        },
        { promoId: '507f1f77bcf86cd799439011' }
      );
      const result = await runValidators(updatePromotionValidator, req);
      
      const errors = result.array();
      expect(errors).toContainEqual(expect.objectContaining({
        msg: 'Code must be between 3 and 20 characters',
        path: 'code'
      }));
      expect(errors).toContainEqual(expect.objectContaining({
        msg: 'Invalid promotion type',
        path: 'type'
      }));
    });

    it('should allow archived status in updates', async () => {
      const req = createMockRequest(
        { status: 'archived' },
        { promoId: '507f1f77bcf86cd799439011' }
      );
      const result = await runValidators(updatePromotionValidator, req);
      
      expect(result.isEmpty()).toBe(true);
    });
  });

  describe('updatePromotionStatusValidator', () => {
    it('should require status field', async () => {
      const req = createMockRequest({}, { promoId: '507f1f77bcf86cd799439011' });
      const result = await runValidators(updatePromotionStatusValidator, req);
      
      expect(result.array()).toContainEqual(expect.objectContaining({
        msg: 'Status is required',
        path: 'status'
      }));
    });

    it('should validate status values', async () => {
      const req = createMockRequest(
        { status: 'published' },
        { promoId: '507f1f77bcf86cd799439011' }
      );
      const result = await runValidators(updatePromotionStatusValidator, req);
      
      expect(result.array()).toContainEqual(expect.objectContaining({
        msg: 'Invalid status',
        path: 'status'
      }));
    });

    it('should accept valid status values', async () => {
      const validStatuses = ['draft', 'active', 'inactive', 'archived'];
      
      for (const status of validStatuses) {
        const req = createMockRequest(
          { status },
          { promoId: '507f1f77bcf86cd799439011' }
        );
        const result = await runValidators(updatePromotionStatusValidator, req);
        
        expect(result.isEmpty()).toBe(true);
      }
    });
  });

  describe('getPromotionsValidator', () => {
    it('should validate pagination parameters', async () => {
      const req = createMockRequest({}, {}, {
        page: '0',
        limit: '200'
      });
      const result = await runValidators(getPromotionsValidator, req);
      
      const errors = result.array();
      expect(errors).toContainEqual(expect.objectContaining({
        msg: 'Page must be a positive integer',
        path: 'page'
      }));
      expect(errors).toContainEqual(expect.objectContaining({
        msg: 'Limit must be between 1 and 100',
        path: 'limit'
      }));
    });

    it('should validate search term length', async () => {
      const req = createMockRequest({}, {}, {
        search: 'a'.repeat(101)
      });
      const result = await runValidators(getPromotionsValidator, req);
      
      expect(result.array()).toContainEqual(expect.objectContaining({
        msg: 'Search term too long',
        path: 'search'
      }));
    });

    it('should validate filter parameters', async () => {
      const req = createMockRequest({}, {}, {
        type: 'invalid_type',
        status: 'invalid_status'
      });
      const result = await runValidators(getPromotionsValidator, req);
      
      const errors = result.array();
      expect(errors).toContainEqual(expect.objectContaining({
        msg: 'Invalid promotion type',
        path: 'type'
      }));
      expect(errors).toContainEqual(expect.objectContaining({
        msg: 'Invalid status',
        path: 'status'
      }));
    });

    it('should allow expired status in filters', async () => {
      const req = createMockRequest({}, {}, {
        status: 'expired'
      });
      const result = await runValidators(getPromotionsValidator, req);
      
      expect(result.isEmpty()).toBe(true);
    });

    it('should validate sort parameters', async () => {
      const req = createMockRequest({}, {}, {
        sortBy: 'invalid_field',
        sortOrder: 'invalid_order'
      });
      const result = await runValidators(getPromotionsValidator, req);
      
      const errors = result.array();
      expect(errors).toContainEqual(expect.objectContaining({
        msg: 'Invalid sort field',
        path: 'sortBy'
      }));
      expect(errors).toContainEqual(expect.objectContaining({
        msg: 'Invalid sort order',
        path: 'sortOrder'
      }));
    });

    it('should accept valid query parameters', async () => {
      const req = createMockRequest({}, {}, {
        page: '2',
        limit: '20',
        search: 'summer',
        type: 'percentage',
        status: 'active',
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });
      const result = await runValidators(getPromotionsValidator, req);
      
      expect(result.isEmpty()).toBe(true);
    });
  });

  describe('checkPromotionCodeValidator', () => {
    it('should require code parameter', async () => {
      const req = createMockRequest({}, {}, {});
      const result = await runValidators(checkPromotionCodeValidator, req);
      
      expect(result.array()).toContainEqual(expect.objectContaining({
        msg: 'Code is required',
        path: 'code'
      }));
    });

    it('should validate code length', async () => {
      const req = createMockRequest({}, {}, { code: 'AB' });
      const result = await runValidators(checkPromotionCodeValidator, req);
      
      expect(result.array()).toContainEqual(expect.objectContaining({
        msg: 'Code must be between 3 and 20 characters',
        path: 'code'
      }));
    });

    it('should validate optional promoId', async () => {
      const req = createMockRequest({}, {}, {
        code: 'SUMMER2024',
        promoId: 'invalid-id'
      });
      const result = await runValidators(checkPromotionCodeValidator, req);
      
      expect(result.array()).toContainEqual(expect.objectContaining({
        msg: 'Invalid promotion ID',
        path: 'promoId'
      }));
    });

    it('should accept valid parameters', async () => {
      const req = createMockRequest({}, {}, {
        code: 'SUMMER2024',
        promoId: '507f1f77bcf86cd799439011'
      });
      const result = await runValidators(checkPromotionCodeValidator, req);
      
      expect(result.isEmpty()).toBe(true);
    });
  });

  describe('deletePromotionValidator', () => {
    it('should validate promotion ID', async () => {
      const req = createMockRequest({}, { promoId: 'invalid-id' });
      const result = await runValidators(deletePromotionValidator, req);
      
      expect(result.array()).toContainEqual(expect.objectContaining({
        msg: 'Invalid promotion ID',
        path: 'promoId'
      }));
    });

    it('should accept valid MongoDB ObjectId', async () => {
      const req = createMockRequest({}, { promoId: '507f1f77bcf86cd799439011' });
      const result = await runValidators(deletePromotionValidator, req);
      
      expect(result.isEmpty()).toBe(true);
    });
  });
});