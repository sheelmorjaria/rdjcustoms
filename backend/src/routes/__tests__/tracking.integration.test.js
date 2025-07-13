import request from 'supertest';
import app from '../../app.js';
import Order from '../../models/Order.js';
import User from '../../models/User.js';
import { generateTestUser, generateTestOrder } from '../../test/helpers/testDataGenerators.js';
import { signTestToken } from '../../test/helpers/authHelpers.js';
import { cleanupTestData } from '../../test/helpers/cleanupHelpers.js';

describe('Order Tracking API Integration Tests', () => {
  let testUser;
  let testOrder;
  let authToken;

  beforeEach(async () => {
    // Clean up any existing test data
    await cleanupTestData();

    // Create test user
    testUser = await User.create(generateTestUser());
    authToken = signTestToken(testUser);

    // Create test order with tracking information
    const orderData = generateTestOrder(testUser._id);
    orderData.status = 'shipped';
    orderData.trackingNumber = 'TEST123456789';
    orderData.carrier = 'UPS';
    orderData.trackingUrl = 'https://www.ups.com/track?tracknum=TEST123456789';
    orderData.trackingHistory = [
      {
        status: 'Order Placed',
        description: 'Order information received',
        location: 'Online',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
      },
      {
        status: 'Shipped',
        description: 'Package picked up by UPS',
        location: 'London, UK',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      },
      {
        status: 'In Transit',
        description: 'Package in transit',
        location: 'Birmingham, UK',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
      }
    ];
    orderData.estimatedDeliveryDate = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000); // Tomorrow
    orderData.trackingLastUpdated = new Date();

    testOrder = await Order.create(orderData);
  });

  afterEach(async () => {
    await cleanupTestData();
  });

  describe('GET /api/user/orders/:orderId/tracking', () => {
    it('should return tracking information for a valid order', async () => {
      const response = await request(app)
        .get(`/api/user/orders/${testOrder._id}/tracking`)
        .set('Cookie', [`auth-token=${authToken}`])
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('orderId');
      expect(response.body.data).toHaveProperty('orderNumber');
      expect(response.body.data).toHaveProperty('tracking');

      const tracking = response.body.data.tracking;
      expect(tracking.trackingNumber).toBe('TEST123456789');
      expect(tracking.carrier).toBe('UPS');
      expect(tracking.trackingUrl).toBe('https://www.ups.com/track?tracknum=TEST123456789');
      expect(tracking.trackingHistory).toHaveLength(3);
      expect(tracking.currentStatus).toBe('In Transit');
      expect(tracking.estimatedDeliveryDate).toBeDefined();
    });

    it('should return 404 for non-existent order', async () => {
      const fakeOrderId = '507f1f77bcf86cd799439011';
      
      const response = await request(app)
        .get(`/api/user/orders/${fakeOrderId}/tracking`)
        .set('Cookie', [`auth-token=${authToken}`])
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Order not found');
    });

    it('should return 400 for invalid order ID format', async () => {
      const response = await request(app)
        .get('/api/user/orders/invalid-order-id/tracking')
        .set('Cookie', [`auth-token=${authToken}`])
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid order ID format');
    });

    it('should return 401 for unauthenticated requests', async () => {
      const response = await request(app)
        .get(`/api/user/orders/${testOrder._id}/tracking`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should return 403 when trying to access another user\'s order', async () => {
      // Create another user
      const anotherUser = await User.create(generateTestUser({
        email: 'another@example.com'
      }));
      const anotherToken = signTestToken(anotherUser);

      const response = await request(app)
        .get(`/api/user/orders/${testOrder._id}/tracking`)
        .set('Cookie', [`auth-token=${anotherToken}`])
        .expect(404); // Should return 404 since order doesn't belong to user

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Order not found');
    });

    it('should return 400 when tracking information is not available', async () => {
      // Create order without tracking information
      const orderWithoutTracking = await Order.create({
        ...generateTestOrder(testUser._id),
        status: 'processing' // Not shipped yet
      });

      const response = await request(app)
        .get(`/api/user/orders/${orderWithoutTracking._id}/tracking`)
        .set('Cookie', [`auth-token=${authToken}`])
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Tracking information not available for this order yet');
    });

    it('should fetch fresh tracking data when cache is expired', async () => {
      // Set tracking last updated to more than 30 minutes ago
      testOrder.trackingLastUpdated = new Date(Date.now() - 35 * 60 * 1000);
      await testOrder.save();

      const response = await request(app)
        .get(`/api/user/orders/${testOrder._id}/tracking`)
        .set('Cookie', [`auth-token=${authToken}`])
        .expect(200);

      expect(response.body.success).toBe(true);
      
      // Check that tracking data was refreshed
      const updatedOrder = await Order.findById(testOrder._id);
      expect(updatedOrder.trackingLastUpdated.getTime()).toBeGreaterThan(testOrder.trackingLastUpdated.getTime());
    });

    it('should return cached data when cache is still valid', async () => {
      // Set tracking last updated to less than 30 minutes ago
      const recentTime = new Date(Date.now() - 10 * 60 * 1000);
      testOrder.trackingLastUpdated = recentTime;
      await testOrder.save();

      const response = await request(app)
        .get(`/api/user/orders/${testOrder._id}/tracking`)
        .set('Cookie', [`auth-token=${authToken}`])
        .expect(200);

      expect(response.body.success).toBe(true);
      
      // Check that tracking last updated hasn't changed much (cached)
      const updatedOrder = await Order.findById(testOrder._id);
      expect(Math.abs(updatedOrder.trackingLastUpdated.getTime() - recentTime.getTime())).toBeLessThan(1000);
    });

    it('should handle carrier tracking service errors gracefully', async () => {
      // Create order with invalid carrier to trigger error
      testOrder.carrier = 'INVALID_CARRIER';
      testOrder.trackingLastUpdated = new Date(Date.now() - 35 * 60 * 1000); // Force refresh
      await testOrder.save();

      const response = await request(app)
        .get(`/api/user/orders/${testOrder._id}/tracking`)
        .set('Cookie', [`auth-token=${authToken}`])
        .expect(200); // Should still return cached data

      expect(response.body.success).toBe(true);
      expect(response.body.data.tracking.carrier).toBe('INVALID_CARRIER');
    });
  });

  describe('Order status display in tracking timeline', () => {
    it('should correctly map tracking events to timeline steps', async () => {
      const response = await request(app)
        .get(`/api/user/orders/${testOrder._id}/tracking`)
        .set('Cookie', [`auth-token=${authToken}`])
        .expect(200);

      const tracking = response.body.data.tracking;
      expect(tracking.trackingHistory).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            status: 'Order Placed',
            description: 'Order information received'
          }),
          expect.objectContaining({
            status: 'Shipped',
            description: 'Package picked up by UPS'
          }),
          expect.objectContaining({
            status: 'In Transit',
            description: 'Package in transit'
          })
        ])
      );
    });

    it('should sort tracking history by timestamp (most recent first)', async () => {
      const response = await request(app)
        .get(`/api/user/orders/${testOrder._id}/tracking`)
        .set('Cookie', [`auth-token=${authToken}`])
        .expect(200);

      const trackingHistory = response.body.data.tracking.trackingHistory;
      
      // Verify history is sorted by timestamp descending
      for (let i = 1; i < trackingHistory.length; i++) {
        const currentTime = new Date(trackingHistory[i - 1].timestamp);
        const nextTime = new Date(trackingHistory[i].timestamp);
        expect(currentTime.getTime()).toBeGreaterThanOrEqual(nextTime.getTime());
      }
    });
  });
});