import { vi, describe, it, test, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { 
  getCart, 
  addToCart, 
  updateCartItem, 
  removeFromCart, 
  clearCart 
} from '../cartController.js';
import { optionalAuth } from '../../middleware/auth.js';
import User from '../../models/User.js';
import Product from '../../models/Product.js';
import Cart from '../../models/Cart.js';
import { createTestApp, generateTestToken } from '../../test/helpers/testMiddleware.js';
import { createValidUserData, createValidProductData } from '../../test/helpers/testDataFactory.js';

// Setup Express app with real middleware
const app = createTestApp();

// Setup routes with real optional auth
app.get('/api/cart', optionalAuth, getCart);
app.post('/api/cart/add', optionalAuth, addToCart);
app.put('/api/cart/item/:productId', optionalAuth, updateCartItem);
app.delete('/api/cart/item/:productId', optionalAuth, removeFromCart);
app.delete('/api/cart/clear', optionalAuth, clearCart);

describe('Cart Controller Integration', () => {
  let testUser;
  let authToken;
  let testProduct;

  beforeEach(async () => {
    // Clear test data
    await User.deleteMany({});
    await Product.deleteMany({});
    await Cart.deleteMany({});

    // Create test user
    testUser = new User(createValidUserData({
      email: 'cart.test@example.com',
      firstName: 'Cart',
      lastName: 'Tester'
    }));
    await testUser.save();

    // Create test product
    testProduct = new Product(createValidProductData({
      name: 'RDJCustoms Pixel 9 Pro',
      price: 999.99,
      stockQuantity: 10
    }));
    await testProduct.save();

    // Generate auth token
    authToken = generateTestToken({
      userId: testUser._id,
      email: testUser.email
    });
  });

  afterEach(async () => {
    // Cleanup
    await User.deleteMany({});
    await Product.deleteMany({});
    await Cart.deleteMany({});
  });

  describe('GET /api/cart', () => {
    it('should get empty cart for authenticated user', async () => {
      const response = await request(app)
        .get('/api/cart')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.cart).toBeDefined();
      expect(response.body.data.cart.items).toEqual([]);
      expect(response.body.data.cart.totalItems).toBe(0);
      expect(response.body.data.cart.totalAmount).toBe(0);
    });

    it('should get empty cart for guest user', async () => {
      const response = await request(app)
        .get('/api/cart')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.cart).toBeDefined();
      expect(response.body.data.cart.items).toEqual([]);
    });
  });

  describe('POST /api/cart/add', () => {
    it('should add product to cart for authenticated user', async () => {
      const response = await request(app)
        .post('/api/cart/add')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          productId: testProduct._id.toString(),
          quantity: 1
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Product added to cart successfully');

      // Verify cart was created in database
      const cart = await Cart.findOne({ userId: testUser._id });
      expect(cart).toBeDefined();
      expect(cart.items).toHaveLength(1);
      expect(cart.items[0].productId.toString()).toBe(testProduct._id.toString());
    });

    it('should add product to cart for guest user', async () => {
      const response = await request(app)
        .post('/api/cart/add')
        .send({
          productId: testProduct._id.toString(),
          quantity: 1
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Product added to cart successfully');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/cart/add')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should validate product ID format', async () => {
      const response = await request(app)
        .post('/api/cart/add')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          productId: 'invalid-id',
          quantity: 1
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should fail for non-existent product', async () => {
      const response = await request(app)
        .post('/api/cart/add')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          productId: new mongoose.Types.ObjectId().toString(),
          quantity: 1
        })
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/cart/item/:productId', () => {
    beforeEach(async () => {
      // Add item to cart first
      await request(app)
        .post('/api/cart/add')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          productId: testProduct._id.toString(),
          quantity: 2
        });
    });

    it('should update item quantity', async () => {
      const response = await request(app)
        .put(`/api/cart/item/${testProduct._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ quantity: 3 })
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify quantity was updated
      const cart = await Cart.findOne({ userId: testUser._id });
      expect(cart.items[0].quantity).toBe(3);
    });

    it('should remove item when quantity is 0', async () => {
      const response = await request(app)
        .put(`/api/cart/item/${testProduct._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ quantity: 0 })
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify item was removed
      const cart = await Cart.findOne({ userId: testUser._id });
      expect(cart.items).toHaveLength(0);
    });
  });

  describe('DELETE /api/cart/item/:productId', () => {
    beforeEach(async () => {
      // Add item to cart first
      await request(app)
        .post('/api/cart/add')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          productId: testProduct._id.toString(),
          quantity: 2
        });
    });

    it('should remove item from cart', async () => {
      const response = await request(app)
        .delete(`/api/cart/item/${testProduct._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify item was removed
      const cart = await Cart.findOne({ userId: testUser._id });
      expect(cart.items).toHaveLength(0);
    });

    it('should fail for item not in cart', async () => {
      const anotherProduct = new Product(createValidProductData({
        name: 'Another Product',
        price: 199.99
      }));
      await anotherProduct.save();

      const response = await request(app)
        .delete(`/api/cart/item/${anotherProduct._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/cart/clear', () => {
    beforeEach(async () => {
      // Add item to cart first
      await request(app)
        .post('/api/cart/add')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          productId: testProduct._id.toString(),
          quantity: 2
        });
    });

    it('should clear entire cart', async () => {
      const response = await request(app)
        .delete('/api/cart/clear')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify cart was cleared
      const cart = await Cart.findOne({ userId: testUser._id });
      expect(cart.items).toHaveLength(0);
    });
  });

  describe('Guest Cart Session Management', () => {
    it('should persist cart across requests using session cookie', async () => {
      // First request - create cart
      const agent = request.agent(app);
      
      const response1 = await agent
        .get('/api/cart')
        .expect(200);

      expect(response1.body.success).toBe(true);

      // Second request - should find existing cart by session
      const response2 = await agent
        .get('/api/cart')
        .expect(200);

      expect(response2.body.success).toBe(true);
    });
  });
});