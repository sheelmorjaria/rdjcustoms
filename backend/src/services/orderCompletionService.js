import { processReferralQualification } from '../controllers/referralController.js';
import logger from '../utils/logger.js';

/**
 * Service to handle order completion logic including referral processing
 */
export class OrderCompletionService {
  
  /**
   * Process order completion - call this when payment is confirmed
   * @param {Object} order - The completed order
   * @param {Object} session - Database session for transactions (optional)
   */
  static async processOrderCompletion(order, _session = null) {
    try {
      const orderId = order._id;
      const userId = order.userId;
      const orderTotal = order.totalAmount;

      logger.info('Processing order completion', {
        orderId,
        userId,
        orderTotal,
        action: 'order_completion_start'
      });

      // Process referral qualification if applicable
      await this.processReferralForOrder(userId, orderId, orderTotal);

      // Add other order completion logic here as needed
      // - Email notifications
      // - Inventory updates
      // - Analytics tracking
      // - etc.

      logger.info('Order completion processed successfully', {
        orderId,
        userId,
        action: 'order_completion_success'
      });

    } catch (error) {
      logger.error('Order completion processing failed', {
        orderId: order._id,
        userId: order.userId,
        error: error.message,
        stack: error.stack,
        action: 'order_completion_error'
      });
      
      // Don't throw error as this shouldn't break the payment flow
      // Just log the issue for investigation
    }
  }

  /**
   * Process referral qualification for completed order
   * @param {String} userId - The user who made the order
   * @param {String} orderId - The completed order ID
   * @param {Number} orderTotal - Total order amount
   */
  static async processReferralForOrder(userId, orderId, orderTotal) {
    try {
      const referralResult = await processReferralQualification(userId, orderId, orderTotal);
      
      if (referralResult) {
        logger.info('Referral qualification processed for order', {
          userId,
          orderId,
          referralId: referralResult.referral._id,
          rewardId: referralResult.reward?._id,
          action: 'referral_qualification_success'
        });
      }

    } catch (error) {
      logger.error('Referral processing failed for order', {
        userId,
        orderId,
        error: error.message,
        action: 'referral_qualification_error'
      });
    }
  }

  /**
   * Check if this is the user's first qualifying order for referrals
   * @param {String} userId - The user ID
   * @returns {Boolean} - True if this is their first order
   */
  static async isFirstOrder(userId) {
    try {
      // Import Order model here to avoid circular dependencies
      const { default: Order } = await import('../models/Order.js');
      
      const orderCount = await Order.countDocuments({
        userId: userId,
        paymentStatus: 'completed'
      });

      return orderCount <= 1; // 1 because current order is already completed
    } catch (error) {
      logger.error('Failed to check if first order', {
        userId,
        error: error.message
      });
      return false;
    }
  }

  /**
   * Get order completion handlers to be called after payment confirmation
   * This allows extending the order completion logic
   */
  static getCompletionHandlers() {
    return [
      this.processReferralForOrder.bind(this)
      // Add more handlers here as needed
    ];
  }
}

/**
 * Convenience function to call from payment controllers
 * @param {Object} order - The completed order
 * @param {Object} session - Database session (optional)
 */
export const handleOrderCompletion = async (order, session = null) => {
  return OrderCompletionService.processOrderCompletion(order, session);
};

export default OrderCompletionService;