import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { OrderCompletionService, handleOrderCompletion } from '../orderCompletionService.js';
import { processReferralQualification } from '../../controllers/referralController.js';
import logger from '../../utils/logger.js';

// Mock dependencies
vi.mock('../../controllers/referralController.js', () => ({
  processReferralQualification: vi.fn()
}));

vi.mock('../../utils/logger.js', () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn()
  }
}));

// Create a mock Order model
const mockOrderModel = {
  countDocuments: vi.fn()
};

// Mock dynamic import of Order model - need to mock the module path relative to the service
vi.mock('../../models/Order.js', () => ({
  default: mockOrderModel
}));

describe('OrderCompletionService', () => {
  const mockOrderData = {
    _id: 'ORDER-123',
    userId: 'USER-456',
    totalAmount: 150.00,
    items: [
      { productId: 'PROD-1', quantity: 2, price: 50 },
      { productId: 'PROD-2', quantity: 1, price: 50 }
    ],
    paymentStatus: 'completed'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('processOrderCompletion', () => {
    it('should process order completion successfully', async () => {
      processReferralQualification.mockResolvedValue({
        referral: { _id: 'REF-123' },
        reward: { _id: 'REWARD-456' }
      });

      await OrderCompletionService.processOrderCompletion(mockOrderData);

      // Check logging
      expect(logger.info).toHaveBeenCalledWith('Processing order completion', {
        orderId: 'ORDER-123',
        userId: 'USER-456',
        orderTotal: 150,
        action: 'order_completion_start'
      });

      expect(logger.info).toHaveBeenCalledWith('Order completion processed successfully', {
        orderId: 'ORDER-123',
        userId: 'USER-456',
        action: 'order_completion_success'
      });

      // Check referral processing was called
      expect(processReferralQualification).toHaveBeenCalledWith('USER-456', 'ORDER-123', 150);
    });

    it('should handle errors without throwing', async () => {
      const error = new Error('Referral processing failed');
      processReferralQualification.mockRejectedValue(error);

      // Should not throw
      await expect(OrderCompletionService.processOrderCompletion(mockOrderData))
        .resolves.not.toThrow();

      // Check error logging - the error is caught in processReferralForOrder, not the main function
      expect(logger.error).toHaveBeenCalledWith('Referral processing failed for order', {
        userId: 'USER-456',
        orderId: 'ORDER-123',
        error: 'Referral processing failed',
        action: 'referral_qualification_error'
      });
    });

    it('should process order with session parameter', async () => {
      const mockSession = { id: 'SESSION-123' };
      processReferralQualification.mockResolvedValue(null);

      await OrderCompletionService.processOrderCompletion(mockOrderData, mockSession);

      expect(processReferralQualification).toHaveBeenCalledWith('USER-456', 'ORDER-123', 150);
    });

    it('should handle missing order properties gracefully', async () => {
      const incompleteOrder = { _id: 'ORDER-999' };
      processReferralQualification.mockResolvedValue(null);

      await expect(OrderCompletionService.processOrderCompletion(incompleteOrder))
        .resolves.not.toThrow();

      // Since the order has missing properties, the function should still log success
      expect(logger.info).toHaveBeenCalledWith(
        'Order completion processed successfully',
        expect.objectContaining({
          orderId: 'ORDER-999'
        })
      );
    });
  });

  describe('processReferralForOrder', () => {
    it('should process referral qualification successfully', async () => {
      const mockReferralResult = {
        referral: { _id: 'REF-789' },
        reward: { _id: 'REWARD-123', amount: 10, type: 'discount' }
      };
      processReferralQualification.mockResolvedValue(mockReferralResult);

      await OrderCompletionService.processReferralForOrder('USER-456', 'ORDER-123', 150);

      expect(processReferralQualification).toHaveBeenCalledWith('USER-456', 'ORDER-123', 150);
      
      expect(logger.info).toHaveBeenCalledWith('Referral qualification processed for order', {
        userId: 'USER-456',
        orderId: 'ORDER-123',
        referralId: 'REF-789',
        rewardId: 'REWARD-123',
        action: 'referral_qualification_success'
      });
    });

    it('should handle no referral qualification result', async () => {
      processReferralQualification.mockResolvedValue(null);

      await OrderCompletionService.processReferralForOrder('USER-456', 'ORDER-123', 150);

      expect(processReferralQualification).toHaveBeenCalledWith('USER-456', 'ORDER-123', 150);
      expect(logger.info).not.toHaveBeenCalledWith(
        expect.stringContaining('Referral qualification processed'),
        expect.any(Object)
      );
    });

    it('should handle referral processing errors', async () => {
      const error = new Error('Database connection failed');
      processReferralQualification.mockRejectedValue(error);

      await OrderCompletionService.processReferralForOrder('USER-456', 'ORDER-123', 150);

      expect(logger.error).toHaveBeenCalledWith('Referral processing failed for order', {
        userId: 'USER-456',
        orderId: 'ORDER-123',
        error: 'Database connection failed',
        action: 'referral_qualification_error'
      });
    });

    it('should handle referral result without reward', async () => {
      const mockReferralResult = {
        referral: { _id: 'REF-999' }
        // No reward property
      };
      processReferralQualification.mockResolvedValue(mockReferralResult);

      await OrderCompletionService.processReferralForOrder('USER-456', 'ORDER-123', 150);

      expect(logger.info).toHaveBeenCalledWith('Referral qualification processed for order', {
        userId: 'USER-456',
        orderId: 'ORDER-123',
        referralId: 'REF-999',
        rewardId: undefined,
        action: 'referral_qualification_success'
      });
    });
  });

  describe('isFirstOrder', () => {
    it('should return true for first order', async () => {
      mockOrderModel.countDocuments.mockResolvedValue(1);

      const result = await OrderCompletionService.isFirstOrder('USER-123');

      expect(result).toBe(true);
      expect(mockOrderModel.countDocuments).toHaveBeenCalledWith({
        userId: 'USER-123',
        paymentStatus: 'completed'
      });
    });

    it('should return false for subsequent orders', async () => {
      mockOrderModel.countDocuments.mockResolvedValue(5);

      const result = await OrderCompletionService.isFirstOrder('USER-123');

      expect(result).toBe(false);
    });

    it('should return true when count is 0', async () => {
      mockOrderModel.countDocuments.mockResolvedValue(0);

      const result = await OrderCompletionService.isFirstOrder('USER-123');

      expect(result).toBe(true);
    });

    it('should handle database errors', async () => {
      mockOrderModel.countDocuments.mockRejectedValue(new Error('Database error'));

      const result = await OrderCompletionService.isFirstOrder('USER-123');

      expect(result).toBe(false);
      expect(logger.error).toHaveBeenCalledWith('Failed to check if first order', {
        userId: 'USER-123',
        error: 'Database error'
      });
    });
  });

  describe('getCompletionHandlers', () => {
    it('should return array of handler functions', () => {
      const handlers = OrderCompletionService.getCompletionHandlers();

      expect(Array.isArray(handlers)).toBe(true);
      expect(handlers.length).toBeGreaterThan(0);
      expect(typeof handlers[0]).toBe('function');
    });

    it('should include processReferralForOrder handler', () => {
      const handlers = OrderCompletionService.getCompletionHandlers();
      
      // Test that the first handler is bound to processReferralForOrder
      expect(handlers[0].name).toBe('bound processReferralForOrder');
    });
  });

  describe('handleOrderCompletion', () => {
    it('should call processOrderCompletion with order', async () => {
      const processSpy = vi.spyOn(OrderCompletionService, 'processOrderCompletion');
      processReferralQualification.mockResolvedValue(null);

      await handleOrderCompletion(mockOrderData);

      expect(processSpy).toHaveBeenCalledWith(mockOrderData, null);
    });

    it('should pass session parameter if provided', async () => {
      const processSpy = vi.spyOn(OrderCompletionService, 'processOrderCompletion');
      const mockSession = { id: 'SESSION-456' };
      processReferralQualification.mockResolvedValue(null);

      await handleOrderCompletion(mockOrderData, mockSession);

      expect(processSpy).toHaveBeenCalledWith(mockOrderData, mockSession);
    });
  });

  describe('Integration scenarios', () => {
    it('should handle complete order flow with referral reward', async () => {
      mockOrderModel.countDocuments.mockResolvedValue(1);

      const mockReferralResult = {
        referral: { 
          _id: 'REF-INT-123',
          referrerId: 'USER-REFERRER',
          referredUserId: 'USER-456'
        },
        reward: { 
          _id: 'REWARD-INT-456',
          amount: 15,
          type: 'credit'
        }
      };
      processReferralQualification.mockResolvedValue(mockReferralResult);

      await OrderCompletionService.processOrderCompletion(mockOrderData);

      // Verify complete flow
      expect(logger.info).toHaveBeenCalledTimes(3); // Start, referral success, completion success
      expect(processReferralQualification).toHaveBeenCalledOnce();
      expect(logger.error).not.toHaveBeenCalled();
    });

    it('should handle order completion even when all sub-processes fail', async () => {
      processReferralQualification.mockRejectedValue(new Error('All systems down'));

      await expect(OrderCompletionService.processOrderCompletion(mockOrderData))
        .resolves.not.toThrow();

      expect(logger.error).toHaveBeenCalled();
      // Order completion should still be attempted
      expect(logger.info).toHaveBeenCalledWith(
        'Processing order completion',
        expect.any(Object)
      );
    });
  });
});