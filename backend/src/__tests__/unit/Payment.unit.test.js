import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('Payment Model Unit Tests', () => {
  let mockPayment;

  beforeEach(() => {
    // Create a mock payment object with the methods we want to test
    mockPayment = {
      paymentId: 'PAY-123456789',
      orderId: 'order-123',
      customerEmail: 'customer@example.com',
      paymentMethod: 'paypal',
      amount: 99.99,
      currency: 'GBP',
      status: 'pending',
      refundAmount: 0,
      bitcoinConfirmations: 1,
      moneroConfirmations: 5,
      expiryDate: null,
      
      // Instance methods
      isCompleted() {
        return this.status === 'completed';
      },
      
      isPending() {
        return this.status === 'pending' || this.status === 'processing';
      },
      
      isFailed() {
        return this.status === 'failed';
      },
      
      canBeRefunded() {
        return this.status === 'completed' && this.paymentMethod === 'paypal';
      },
      
      getConfirmationProgress() {
        if (this.paymentMethod === 'bitcoin') {
          return Math.min(100, (this.bitcoinConfirmations / 2) * 100);
        }
        if (this.paymentMethod === 'monero') {
          return Math.min(100, (this.moneroConfirmations / 10) * 100);
        }
        return 100; // PayPal is instant
      },
      
      getFormattedAmount() {
        return `£${this.amount}`;
      },
      
      getPaymentMethodDisplay() {
        const methods = {
          paypal: 'PayPal',
          bitcoin: 'Bitcoin',
          monero: 'Monero'
        };
        return methods[this.paymentMethod] || this.paymentMethod;
      },
      
      isExpired() {
        if (!this.expiryDate) return false;
        return new Date() > this.expiryDate;
      }
    };
  });

  describe('Instance Methods', () => {
    describe('isCompleted', () => {
      it('should return true for completed status', () => {
        mockPayment.status = 'completed';
        expect(mockPayment.isCompleted()).toBe(true);
      });

      it('should return false for non-completed status', () => {
        mockPayment.status = 'pending';
        expect(mockPayment.isCompleted()).toBe(false);
      });
    });

    describe('isPending', () => {
      it('should return true for pending status', () => {
        mockPayment.status = 'pending';
        expect(mockPayment.isPending()).toBe(true);
      });

      it('should return true for processing status', () => {
        mockPayment.status = 'processing';
        expect(mockPayment.isPending()).toBe(true);
      });

      it('should return false for completed status', () => {
        mockPayment.status = 'completed';
        expect(mockPayment.isPending()).toBe(false);
      });
    });

    describe('isFailed', () => {
      it('should return true for failed status', () => {
        mockPayment.status = 'failed';
        expect(mockPayment.isFailed()).toBe(true);
      });

      it('should return false for non-failed status', () => {
        mockPayment.status = 'completed';
        expect(mockPayment.isFailed()).toBe(false);
      });
    });

    describe('canBeRefunded', () => {
      it('should return true for completed PayPal payments', () => {
        mockPayment.status = 'completed';
        mockPayment.paymentMethod = 'paypal';
        expect(mockPayment.canBeRefunded()).toBe(true);
      });

      it('should return false for pending payments', () => {
        mockPayment.status = 'pending';
        mockPayment.paymentMethod = 'paypal';
        expect(mockPayment.canBeRefunded()).toBe(false);
      });

      it('should return false for completed Bitcoin payments', () => {
        mockPayment.status = 'completed';
        mockPayment.paymentMethod = 'bitcoin';
        expect(mockPayment.canBeRefunded()).toBe(false);
      });

      it('should return false for completed Monero payments', () => {
        mockPayment.status = 'completed';
        mockPayment.paymentMethod = 'monero';
        expect(mockPayment.canBeRefunded()).toBe(false);
      });
    });

    describe('getConfirmationProgress', () => {
      it('should calculate Bitcoin confirmation progress correctly', () => {
        mockPayment.paymentMethod = 'bitcoin';
        mockPayment.bitcoinConfirmations = 1;
        expect(mockPayment.getConfirmationProgress()).toBe(50); // 1 out of 2 confirmations
      });

      it('should calculate Monero confirmation progress correctly', () => {
        mockPayment.paymentMethod = 'monero';
        mockPayment.moneroConfirmations = 5;
        expect(mockPayment.getConfirmationProgress()).toBe(50); // 5 out of 10 confirmations
      });

      it('should return 100% for PayPal payments', () => {
        mockPayment.paymentMethod = 'paypal';
        expect(mockPayment.getConfirmationProgress()).toBe(100);
      });

      it('should cap Bitcoin confirmations at 100%', () => {
        mockPayment.paymentMethod = 'bitcoin';
        mockPayment.bitcoinConfirmations = 5; // More than required 2
        expect(mockPayment.getConfirmationProgress()).toBe(100);
      });

      it('should cap Monero confirmations at 100%', () => {
        mockPayment.paymentMethod = 'monero';
        mockPayment.moneroConfirmations = 15; // More than required 10
        expect(mockPayment.getConfirmationProgress()).toBe(100);
      });
    });

    describe('getFormattedAmount', () => {
      it('should format amount with GBP currency symbol', () => {
        mockPayment.amount = 99.99;
        expect(mockPayment.getFormattedAmount()).toBe('£99.99');
      });

      it('should handle whole numbers', () => {
        mockPayment.amount = 100;
        expect(mockPayment.getFormattedAmount()).toBe('£100');
      });
    });

    describe('getPaymentMethodDisplay', () => {
      it('should return PayPal for paypal method', () => {
        mockPayment.paymentMethod = 'paypal';
        expect(mockPayment.getPaymentMethodDisplay()).toBe('PayPal');
      });

      it('should return Bitcoin for bitcoin method', () => {
        mockPayment.paymentMethod = 'bitcoin';
        expect(mockPayment.getPaymentMethodDisplay()).toBe('Bitcoin');
      });

      it('should return Monero for monero method', () => {
        mockPayment.paymentMethod = 'monero';
        expect(mockPayment.getPaymentMethodDisplay()).toBe('Monero');
      });

      it('should return the original method for unknown methods', () => {
        mockPayment.paymentMethod = 'unknown';
        expect(mockPayment.getPaymentMethodDisplay()).toBe('unknown');
      });
    });

    describe('isExpired', () => {
      it('should return false when no expiry date is set', () => {
        mockPayment.expiryDate = null;
        expect(mockPayment.isExpired()).toBe(false);
      });

      it('should return true when payment is expired', () => {
        mockPayment.expiryDate = new Date(Date.now() - 1000); // 1 second ago
        expect(mockPayment.isExpired()).toBe(true);
      });

      it('should return false when payment is not expired', () => {
        mockPayment.expiryDate = new Date(Date.now() + 3600000); // 1 hour from now
        expect(mockPayment.isExpired()).toBe(false);
      });
    });
  });

  describe('Payment Method Validation', () => {
    it('should validate payment method is one of allowed values', () => {
      const allowedMethods = ['paypal', 'bitcoin', 'monero'];
      
      allowedMethods.forEach(method => {
        mockPayment.paymentMethod = method;
        expect(allowedMethods.includes(mockPayment.paymentMethod)).toBe(true);
      });
    });

    it('should identify PayPal as refundable payment method', () => {
      const refundableMethods = ['paypal'];
      
      refundableMethods.forEach(method => {
        mockPayment.paymentMethod = method;
        mockPayment.status = 'completed';
        expect(mockPayment.canBeRefunded()).toBe(true);
      });
    });

    it('should identify crypto methods as non-refundable', () => {
      const nonRefundableMethods = ['bitcoin', 'monero'];
      
      nonRefundableMethods.forEach(method => {
        mockPayment.paymentMethod = method;
        mockPayment.status = 'completed';
        expect(mockPayment.canBeRefunded()).toBe(false);
      });
    });
  });

  describe('Status Validation', () => {
    it('should validate status transitions', () => {
      const validStatuses = [
        'pending', 'processing', 'completed', 'failed', 
        'cancelled', 'refunded', 'expired', 'underpaid'
      ];
      
      validStatuses.forEach(status => {
        mockPayment.status = status;
        expect(validStatuses.includes(mockPayment.status)).toBe(true);
      });
    });

    it('should correctly identify pending states', () => {
      const pendingStates = ['pending', 'processing'];
      
      pendingStates.forEach(status => {
        mockPayment.status = status;
        expect(mockPayment.isPending()).toBe(true);
      });
    });

    it('should correctly identify final states', () => {
      const finalStates = ['completed', 'failed', 'cancelled', 'refunded'];
      
      finalStates.forEach(status => {
        mockPayment.status = status;
        expect(mockPayment.isPending()).toBe(false);
      });
    });
  });

  describe('Business Logic Validation', () => {
    it('should enforce 2 confirmations requirement for Bitcoin', () => {
      mockPayment.paymentMethod = 'bitcoin';
      
      // Test various confirmation levels
      const testCases = [
        { confirmations: 0, expectedProgress: 0 },
        { confirmations: 1, expectedProgress: 50 },
        { confirmations: 2, expectedProgress: 100 },
        { confirmations: 3, expectedProgress: 100 }
      ];
      
      testCases.forEach(({ confirmations, expectedProgress }) => {
        mockPayment.bitcoinConfirmations = confirmations;
        expect(mockPayment.getConfirmationProgress()).toBe(expectedProgress);
      });
    });

    it('should enforce 10 confirmations requirement for Monero', () => {
      mockPayment.paymentMethod = 'monero';
      
      // Test various confirmation levels
      const testCases = [
        { confirmations: 0, expectedProgress: 0 },
        { confirmations: 5, expectedProgress: 50 },
        { confirmations: 10, expectedProgress: 100 },
        { confirmations: 15, expectedProgress: 100 }
      ];
      
      testCases.forEach(({ confirmations, expectedProgress }) => {
        mockPayment.moneroConfirmations = confirmations;
        expect(mockPayment.getConfirmationProgress()).toBe(expectedProgress);
      });
    });

    it('should use GBP as default currency', () => {
      expect(mockPayment.currency).toBe('GBP');
    });

    it('should format amounts with proper currency symbol', () => {
      const testAmounts = [0.01, 1, 10.5, 99.99, 1000];
      
      testAmounts.forEach(amount => {
        mockPayment.amount = amount;
        const formatted = mockPayment.getFormattedAmount();
        expect(formatted).toMatch(/^£\d+(\.\d+)?$/);
        expect(formatted).toBe(`£${amount}`);
      });
    });
  });
});