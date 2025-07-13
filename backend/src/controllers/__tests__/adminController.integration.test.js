import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import _express from 'express';
import User from '../../models/User.js';
import Order from '../../models/Order.js';
import Product from '../../models/Product.js';
import _jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { setupAdminTest } from '../../test/helpers/testConfig.js';
import { createValidOrderData, createValidUserData, createValidProductData } from '../../test/helpers/testDataFactory.js';
import { generateAdminToken, generateTestToken } from '../../test/helpers/testMiddleware.js';

// Import admin controllers
import { 
  getDashboardMetrics,
  getAllUsers,
  getUserById,
  updateUserStatus,
  getAllOrders,
  getOrderById,
  updateOrderStatus
} from '../adminController.js';
import { authenticate, requireRole } from '../../middleware/auth.js';

// Create admin auth middleware
const adminAuth = requireRole(['admin']);

// Set up test configuration
const testConfig = setupAdminTest((app) => {
  // Admin dashboard routes
  app.get('/api/admin/dashboard', authenticate, adminAuth, getDashboardMetrics);
  
  // User management routes  
  app.get('/api/admin/users', authenticate, adminAuth, getAllUsers);
  app.get('/api/admin/users/:userId', authenticate, adminAuth, getUserById);
  app.put('/api/admin/users/:userId/status', authenticate, adminAuth, updateUserStatus);
  
  // Order management routes
  app.get('/api/admin/orders', authenticate, adminAuth, getAllOrders);
  app.get('/api/admin/orders/:orderId', authenticate, adminAuth, getOrderById);
  app.put('/api/admin/orders/:orderId/status', authenticate, adminAuth, updateOrderStatus);
});

describe('Admin Controller Integration', () => {
  let adminUser;
  let adminToken;
  let customerUser;
  let customerToken;
  let testOrder;
  let testProduct;

  beforeEach(async () => {
    // Mock mongoose session functions to avoid transaction errors in single MongoDB container
    const mockSession = {
      withTransaction: vi.fn().mockImplementation(async (fn) => {
        return fn(mockSession);
      }),
      endSession: vi.fn().mockResolvedValue(undefined),
      startTransaction: vi.fn().mockResolvedValue(undefined),
      commitTransaction: vi.fn().mockResolvedValue(undefined),
      abortTransaction: vi.fn().mockResolvedValue(undefined),
      inTransaction: vi.fn().mockReturnValue(false),
      id: 'mock-session-id',
      // MongoDB driver properties
      options: {
        causalConsistency: false,
        defaultTransactionOptions: {}
      },
      readPreference: {
        mode: 'primary',
        tags: []
      },
      transaction: {
        state: 'NO_TRANSACTION'
      }
    };
    
    mongoose.startSession = vi.fn().mockResolvedValue(mockSession);
    
    // Mock Query.prototype.session to simply return this for chaining
    mongoose.Query.prototype.session = function(_session) {
      return this;
    };
    
    // Mock Document save to ignore session
    const originalSave = mongoose.Document.prototype.save;
    mongoose.Document.prototype.save = function(options) {
      if (options && options.session) {
        const { session: _session, ...optionsWithoutSession } = options;
        return originalSave.call(this, optionsWithoutSession);
      }
      return originalSave.call(this, options);
    };
    
    await testConfig.beforeEach();
    
    // Create admin user
    adminUser = new User(createValidUserData({
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin'
    }));
    await adminUser.save();

    // Create customer user
    customerUser = new User(createValidUserData({
      firstName: 'Customer',
      lastName: 'User',
      role: 'customer'
    }));
    await customerUser.save();

    // Create test product
    testProduct = new Product(createValidProductData({
      name: 'Test Admin Product',
      price: 299.99
    }));
    await testProduct.save();

    // Create test order
    testOrder = new Order(createValidOrderData({
      userId: customerUser._id,
      customerEmail: customerUser.email,
      items: [{
        productId: testProduct._id,
        productName: testProduct.name,
        productSlug: testProduct.slug,
        quantity: 1,
        unitPrice: testProduct.price,
        totalPrice: testProduct.price
      }],
      subtotal: testProduct.price,
      totalAmount: testProduct.price + 10 // Add shipping
    }));
    await testOrder.save();

    // Generate tokens
    adminToken = generateAdminToken({
      userId: adminUser._id,
      email: adminUser.email,
      role: 'admin'
    });

    customerToken = generateTestToken({
      userId: customerUser._id,
      email: customerUser.email,
      role: 'customer'
    });
  });

  afterEach(async () => {
    await testConfig.afterEach();
  });

  describe('Authentication & Authorization', () => {
    it('should deny access without authentication', async () => {
      const response = await request(testConfig.app)
        .get('/api/admin/dashboard')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should deny access to non-admin users', async () => {
      const response = await request(testConfig.app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should allow access to admin users', async () => {
      const response = await request(testConfig.app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('Dashboard', () => {
    it('should get admin dashboard statistics', async () => {
      const response = await request(testConfig.app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.orders).toBeDefined();
      expect(response.body.data.revenue).toBeDefined();
      expect(response.body.data.customers).toBeDefined();
      expect(response.body.data.lastUpdated).toBeDefined();
    });
  });

  describe('User Management', () => {
    it('should get list of users', async () => {
      const response = await request(testConfig.app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.users).toBeDefined();
      expect(Array.isArray(response.body.data.users)).toBe(true);
    });

    it('should get specific user by ID', async () => {
      const response = await request(testConfig.app)
        .get(`/api/admin/users/${customerUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user._id).toBe(customerUser._id.toString());
      expect(response.body.data.user.email).toBe(customerUser.email);
    });

    it('should update user status', async () => {
      const response = await request(testConfig.app)
        .put(`/api/admin/users/${customerUser._id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ newStatus: 'disabled' })
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify status was updated
      const updatedUser = await User.findById(customerUser._id);
      expect(updatedUser.accountStatus).toBe('disabled');
    });

    it('should fail to get non-existent user', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(testConfig.app)
        .get(`/api/admin/users/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Order Management', () => {
    it('should get list of orders', async () => {
      const response = await request(testConfig.app)
        .get('/api/admin/orders')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.orders).toBeDefined();
      expect(Array.isArray(response.body.data.orders)).toBe(true);
      expect(response.body.data.orders.length).toBeGreaterThan(0);
    });

    it('should get specific order by ID', async () => {
      const response = await request(testConfig.app)
        .get(`/api/admin/orders/${testOrder._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.order._id).toBe(testOrder._id.toString());
      expect(response.body.data.order.customer.email).toBe(customerUser.email);
    });

    it('should update order status', async () => {
      const response = await request(testConfig.app)
        .put(`/api/admin/orders/${testOrder._id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ newStatus: 'processing' })
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify status was updated
      const updatedOrder = await Order.findById(testOrder._id);
      expect(updatedOrder.status).toBe('processing');
    });

    it('should fail to get non-existent order', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(testConfig.app)
        .get(`/api/admin/orders/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid user ID format', async () => {
      const response = await request(testConfig.app)
        .get('/api/admin/users/invalid-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should handle invalid order ID format', async () => {
      const response = await request(testConfig.app)
        .get('/api/admin/orders/invalid-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });
});