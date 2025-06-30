import request from 'supertest';
import app from '../../app.js';
import mongoose from 'mongoose';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../../models/User.js';
import Order from '../../models/Order.js';
import Product from '../../models/Product.js';
import PaymentTransaction from '../../models/PaymentTransaction.js';

describe('Payment Security Tests', () => {
  let userToken, testUser, testProduct;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/rdjcustoms-test');
    
    testUser = await User.create({
      name: 'Payment Test User',
      email: 'payment@example.com',
      password: 'SecurePass123!',
    });

    userToken = jwt.sign(
      { userId: testUser._id, email: testUser.email },
      process.env.JWT_SECRET || 'test-secret'
    );

    testProduct = await Product.create({
      name: 'Test Product',
      price: 99.99,
      stock: 100,
      category: 'test',
    });
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  });

  describe('Payment Method Security', () => {
    it('should validate payment method selection', async () => {
      const invalidPaymentMethods = [
        'invalid_method',
        'PAYPAL', // Case sensitive
        '<script>alert("XSS")</script>',
        'bitcoin; DROP TABLE orders;',
        { $ne: null },
      ];

      for (const method of invalidPaymentMethods) {
        const response = await request(app)
          .post('/api/orders')
          .set('Authorization', `Bearer ${userToken}`)
          .send({
            items: [{ product: testProduct._id, quantity: 1 }],
            paymentMethod: method,
            shippingAddress: {
              street: '123 Test St',
              city: 'London',
              postcode: 'SW1A 1AA',
              country: 'UK',
            },
          });

        expect(response.status).toBe(400);
        expect(response.body.error).toMatch(/payment method|invalid/i);
      }
    });

    it('should enforce allowed payment methods only', async () => {
      const allowedMethods = ['paypal', 'bitcoin', 'monero'];
      
      for (const method of allowedMethods) {
        const response = await request(app)
          .post('/api/orders')
          .set('Authorization', `Bearer ${userToken}`)
          .send({
            items: [{ product: testProduct._id, quantity: 1 }],
            paymentMethod: method,
            shippingAddress: {
              street: '123 Test St',
              city: 'London',
              postcode: 'SW1A 1AA',
              country: 'UK',
            },
          });

        expect([200, 201]).toContain(response.status);
      }
    });
  });

  describe('Cryptocurrency Payment Security', () => {
    it('should generate unique payment addresses for each order', async () => {
      const addresses = new Set();
      
      for (let i = 0; i < 5; i++) {
        const response = await request(app)
          .post('/api/orders')
          .set('Authorization', `Bearer ${userToken}`)
          .send({
            items: [{ product: testProduct._id, quantity: 1 }],
            paymentMethod: 'bitcoin',
            shippingAddress: {
              street: '123 Test St',
              city: 'London',
              postcode: 'SW1A 1AA',
              country: 'UK',
            },
          });

        if (response.body.order?.paymentDetails?.address) {
          addresses.add(response.body.order.paymentDetails.address);
        }
      }

      // All addresses should be unique
      expect(addresses.size).toBe(5);
    });

    it('should validate Bitcoin address format', async () => {
      const invalidAddresses = [
        '123invalid',
        'not-a-bitcoin-address',
        '<script>alert("XSS")</script>',
        '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa; DROP TABLE orders;',
        '',
      ];

      for (const address of invalidAddresses) {
        const response = await request(app)
          .post('/api/payments/bitcoin/validate')
          .set('Authorization', `Bearer ${userToken}`)
          .send({ address });

        expect(response.status).toBe(400);
        expect(response.body.valid).toBe(false);
      }
    });

    it('should validate Monero payment IDs', async () => {
      const invalidPaymentIds = [
        '123',
        'not-64-chars',
        '<script>alert("XSS")</script>',
        'x'.repeat(65), // Too long
        'g'.repeat(64), // Invalid hex
      ];

      for (const paymentId of invalidPaymentIds) {
        const response = await request(app)
          .post('/api/payments/monero/validate')
          .set('Authorization', `Bearer ${userToken}`)
          .send({ paymentId });

        expect(response.status).toBe(400);
      }
    });

    it('should enforce payment confirmation requirements', async () => {
      const order = await Order.create({
        user: testUser._id,
        items: [{ product: testProduct._id, quantity: 1, price: 99.99 }],
        totalAmount: 99.99,
        paymentMethod: 'bitcoin',
        paymentDetails: {
          address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
          amount: 0.001,
        },
        status: 'pending_payment',
      });

      // Try to mark as paid without enough confirmations
      const response = await request(app)
        .post(`/api/orders/${order._id}/confirm-payment`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          confirmations: 1, // Less than required 2
          txHash: 'abc123',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toMatch(/confirmations|insufficient/i);
    });

    it('should prevent double-spending attacks', async () => {
      const txHash = 'duplicate-tx-hash-123';
      
      // Create first order with transaction
      await PaymentTransaction.create({
        orderId: new mongoose.Types.ObjectId(),
        txHash,
        amount: 0.001,
        currency: 'BTC',
        status: 'confirmed',
      });

      // Try to use same transaction hash for another order
      const response = await request(app)
        .post('/api/payments/bitcoin/confirm')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          orderId: new mongoose.Types.ObjectId(),
          txHash,
          confirmations: 6,
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toMatch(/duplicate|already used/i);
    });
  });

  describe('PayPal Integration Security', () => {
    it('should validate PayPal webhook signatures', async () => {
      const webhookBody = {
        id: 'WH-123456',
        event_type: 'PAYMENT.CAPTURE.COMPLETED',
        resource: {
          id: 'CAPTURE-123',
          amount: { value: '99.99', currency_code: 'GBP' },
        },
      };

      // Invalid signature
      const response = await request(app)
        .post('/api/webhooks/paypal')
        .set('PayPal-Transmission-Sig', 'invalid-signature')
        .set('PayPal-Transmission-Id', 'msg-123')
        .set('PayPal-Transmission-Time', new Date().toISOString())
        .set('PayPal-Cert-Url', 'https://api.paypal.com/cert')
        .send(webhookBody);

      expect(response.status).toBe(401);
      expect(response.body.error).toMatch(/signature|verification/i);
    });

    it('should prevent PayPal order ID manipulation', async () => {
      // Try to confirm payment with manipulated order ID
      const response = await request(app)
        .post('/api/payments/paypal/capture')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          orderId: '../../../admin/orders/all',
          paypalOrderId: 'PAYPAL-123',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('Exchange Rate Security', () => {
    it('should validate exchange rate updates', async () => {
      const maliciousRates = [
        { BTC: -1, XMR: 100 }, // Negative rate
        { BTC: 'DROP TABLE rates;', XMR: 100 }, // SQL injection
        { BTC: 0, XMR: 0 }, // Zero rates
        { BTC: 999999999, XMR: 100 }, // Unrealistic rate
        { BTC: null, XMR: undefined }, // Null values
      ];

      for (const rates of maliciousRates) {
        const response = await request(app)
          .post('/api/admin/exchange-rates')
          .set('Authorization', `Bearer ${userToken}`)
          .send({ rates });

        expect(response.status).toBe(400);
      }
    });

    it('should enforce rate limits on exchange rate queries', async () => {
      const requests = [];
      
      for (let i = 0; i < 50; i++) {
        requests.push(
          request(app)
            .get('/api/exchange-rates')
            .set('Authorization', `Bearer ${userToken}`)
        );
      }

      const responses = await Promise.all(requests);
      const rateLimited = responses.filter(r => r.status === 429);
      
      expect(rateLimited.length).toBeGreaterThan(0);
    });

    it('should expire exchange rates appropriately', async () => {
      // Create order with exchange rate
      const order = await Order.create({
        user: testUser._id,
        items: [{ product: testProduct._id, quantity: 1, price: 99.99 }],
        totalAmount: 99.99,
        paymentMethod: 'bitcoin',
        exchangeRate: {
          rate: 0.00001,
          validUntil: new Date(Date.now() - 3600000), // Expired 1 hour ago
        },
      });

      // Try to pay with expired rate
      const response = await request(app)
        .post(`/api/orders/${order._id}/pay`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ amount: 0.00001 });

      expect(response.status).toBe(400);
      expect(response.body.error).toMatch(/expired|rate/i);
    });
  });

  describe('Payment Amount Security', () => {
    it('should prevent negative payment amounts', async () => {
      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          items: [{ 
            product: testProduct._id, 
            quantity: -1, // Negative quantity
          }],
          paymentMethod: 'paypal',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toMatch(/quantity|invalid/i);
    });

    it('should validate payment amount precision', async () => {
      const response = await request(app)
        .post('/api/payments/process')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          orderId: new mongoose.Types.ObjectId(),
          amount: 99.999999999, // Too many decimal places
          currency: 'GBP',
        });

      expect(response.status).toBe(400);
    });

    it('should prevent payment amount manipulation', async () => {
      const order = await Order.create({
        user: testUser._id,
        items: [{ product: testProduct._id, quantity: 2, price: 99.99 }],
        totalAmount: 199.98,
        paymentMethod: 'paypal',
        status: 'pending_payment',
      });

      // Try to pay different amount
      const response = await request(app)
        .post(`/api/orders/${order._id}/pay`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ amount: 10.00 }); // Much less than order total

      expect(response.status).toBe(400);
      expect(response.body.error).toMatch(/amount|mismatch/i);
    });
  });

  describe('Refund Security', () => {
    it('should validate refund requests', async () => {
      const order = await Order.create({
        user: testUser._id,
        items: [{ product: testProduct._id, quantity: 1, price: 99.99 }],
        totalAmount: 99.99,
        paymentMethod: 'paypal',
        status: 'completed',
        paymentDetails: { transactionId: 'PAYPAL-123' },
      });

      // Try to refund more than paid
      const response = await request(app)
        .post(`/api/orders/${order._id}/refund`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ amount: 200.00 });

      expect(response.status).toBe(400);
      expect(response.body.error).toMatch(/amount|exceeds/i);
    });

    it('should prevent duplicate refunds', async () => {
      const order = await Order.create({
        user: testUser._id,
        items: [{ product: testProduct._id, quantity: 1, price: 99.99 }],
        totalAmount: 99.99,
        paymentMethod: 'paypal',
        status: 'refunded',
        refundDetails: { amount: 99.99, date: new Date() },
      });

      // Try to refund already refunded order
      const response = await request(app)
        .post(`/api/orders/${order._id}/refund`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ amount: 99.99 });

      expect(response.status).toBe(400);
      expect(response.body.error).toMatch(/already refunded/i);
    });

    it('should restrict refunds for crypto payments', async () => {
      const order = await Order.create({
        user: testUser._id,
        items: [{ product: testProduct._id, quantity: 1, price: 99.99 }],
        totalAmount: 99.99,
        paymentMethod: 'bitcoin',
        status: 'completed',
      });

      const response = await request(app)
        .post(`/api/orders/${order._id}/refund`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ amount: 99.99 });

      expect(response.status).toBe(400);
      expect(response.body.error).toMatch(/crypto|manual|not supported/i);
    });
  });

  describe('Payment Logging Security', () => {
    it('should not log sensitive payment data', async () => {
      const sensitiveData = {
        cardNumber: '4111111111111111',
        cvv: '123',
        bitcoinPrivateKey: 'L1vqR8EmhqPKPsJoe1bghBPF8c8yXxq2bEmh7vbTBaGRCHmVM1gB',
        paypalPassword: 'MyPayPalPass123',
      };

      // Mock console.log to capture logs
      const originalLog = console.log;
      const logs = [];
      console.log = (...args) => logs.push(args.join(' '));

      // Make payment request
      await request(app)
        .post('/api/payments/process')
        .set('Authorization', `Bearer ${userToken}`)
        .send(sensitiveData);

      // Restore console.log
      console.log = originalLog;

      // Check logs don't contain sensitive data
      const logString = logs.join(' ');
      expect(logString).not.toContain('4111111111111111');
      expect(logString).not.toContain('123');
      expect(logString).not.toContain('L1vqR8EmhqPKPsJoe1bghBPF8c8yXxq2bEmh7vbTBaGRCHmVM1gB');
      expect(logString).not.toContain('MyPayPalPass123');
    });
  });

  describe('Payment State Machine Security', () => {
    it('should enforce valid payment state transitions', async () => {
      const order = await Order.create({
        user: testUser._id,
        items: [{ product: testProduct._id, quantity: 1, price: 99.99 }],
        totalAmount: 99.99,
        paymentMethod: 'paypal',
        status: 'cancelled',
      });

      // Try to move from cancelled to completed
      const response = await request(app)
        .patch(`/api/orders/${order._id}/status`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ status: 'completed' });

      expect(response.status).toBe(400);
      expect(response.body.error).toMatch(/invalid.*transition|cannot.*cancelled/i);
    });
  });
});