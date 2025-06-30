import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../../../server.js';
import User from '../../models/User.js';
import Product from '../../models/Product.js';
import Cart from '../../models/Cart.js';
import jwt from 'jsonwebtoken';

// Integration test setup without problematic mongoose monkey patch
let mongoServer;

beforeAll(async () => {
  // Start in-memory MongoDB
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  // Close existing connection if any
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
  
  // Connect to test database
  await mongoose.connect(mongoUri);
  
  console.log('Wishlist integration test setup complete');
}, 60000);

afterAll(async () => {
  await mongoose.connection.close();
  if (mongoServer) {
    await mongoServer.stop();
  }
}, 30000);

describe('Wishlist Integration Tests - Story 6.4', () => {
  let testUser;
  let testProduct;
  let authToken;

  beforeEach(async () => {
    // Clean up
    await User.deleteMany({});
    await Product.deleteMany({});
    await Cart.deleteMany({});

    // Create test user
    testUser = new User({
      email: 'test@example.com',
      password: 'TestPassword123!',
      firstName: 'Test',
      lastName: 'User',
      emailVerified: true
    });
    await testUser.save();

    // Create test product
    testProduct = new Product({
      name: 'Test Product',
      slug: 'test-product',
      sku: 'TEST-001',
      price: 29.99,
      description: 'A test product for wishlist testing',
      shortDescription: 'Test product',
      images: ['test-image.jpg'],
      category: new mongoose.Types.ObjectId(),
      condition: 'new',
      stockStatus: 'in_stock',
      stockQuantity: 10,
      isActive: true,
      status: 'active'
    });
    await testProduct.save();

    authToken = jwt.sign({ userId: testUser._id }, process.env.JWT_SECRET || 'your-secret-key');
  });

  afterEach(async () => {
    await User.deleteMany({});
    await Product.deleteMany({});
    await Cart.deleteMany({});
  });

  // Task 6.4.14.1: Register a test user and create test products
  describe('Task 6.4.14.1 - Setup Test Data', () => {
    it('should have created test user and products successfully', async () => {
      expect(testUser._id).toBeDefined();
      expect(testProduct._id).toBeDefined();
      expect(authToken).toBeDefined();
    });
  });

  // Task 6.4.14.2: Add products to wishlist
  describe('Task 6.4.14.2 - Add Products to Wishlist', () => {
    it('should add product to wishlist successfully', async () => {
      const response = await request(app)
        .post('/api/user/wishlist')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ productId: testProduct._id });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Product added to wishlist successfully');
      expect(response.body.data.wishlistCount).toBe(1);

      // Verify in database
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.wishlist).toHaveLength(1);
      expect(updatedUser.wishlist[0].toString()).toBe(testProduct._id.toString());
    });

    it('should prevent adding duplicate products to wishlist', async () => {
      // Add product first time
      await request(app)
        .post('/api/user/wishlist')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ productId: testProduct._id });

      // Try to add same product again
      const response = await request(app)
        .post('/api/user/wishlist')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ productId: testProduct._id });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Product is already in wishlist');
    });

    it('should return 404 for non-existent product', async () => {
      const fakeProductId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .post('/api/user/wishlist')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ productId: fakeProductId });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Product not found');
    });

    it('should validate product ID format', async () => {
      const response = await request(app)
        .post('/api/user/wishlist')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ productId: 'invalid-id' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });
  });

  // Task 6.4.14.3: Fetch wishlist content
  describe('Task 6.4.14.3 - Fetch Wishlist Content', () => {
    beforeEach(async () => {
      // Add product to wishlist for testing
      const user = await User.findById(testUser._id);
      user.addToWishlist(testProduct._id);
      await user.save();
    });

    it('should fetch wishlist with product details', async () => {
      const response = await request(app)
        .get('/api/user/wishlist')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.wishlist).toHaveLength(1);
      expect(response.body.data.totalItems).toBe(1);

      const wishlistItem = response.body.data.wishlist[0];
      expect(wishlistItem.name).toBe('Test Product');
      expect(wishlistItem.price).toBe(29.99);
      expect(wishlistItem.slug).toBe('test-product');
      expect(wishlistItem.stockStatus).toBe('in_stock');
    });

    it('should return empty wishlist for user with no items', async () => {
      // Create another user with empty wishlist
      const emptyUser = new User({
        email: 'empty@example.com',
        password: 'TestPassword123!',
        firstName: 'Empty',
        lastName: 'User',
        emailVerified: true
      });
      await emptyUser.save();

      const emptyAuthToken = jwt.sign({ userId: emptyUser._id }, process.env.JWT_SECRET || 'your-secret-key');

      const response = await request(app)
        .get('/api/user/wishlist')
        .set('Authorization', `Bearer ${emptyAuthToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.wishlist).toHaveLength(0);
      expect(response.body.data.totalItems).toBe(0);
    });

    it('should only return active products in wishlist', async () => {
      // Create an inactive product and add to wishlist
      const inactiveProduct = new Product({
        name: 'Inactive Product',
        slug: 'inactive-product',
        sku: 'INACTIVE-001',
        price: 19.99,
        description: 'An inactive product',
        shortDescription: 'Inactive',
        images: ['inactive.jpg'],
        category: new mongoose.Types.ObjectId(),
        condition: 'new',
        stockStatus: 'in_stock',
        isActive: false, // Inactive
        status: 'archived'
      });
      await inactiveProduct.save();

      const user = await User.findById(testUser._id);
      user.addToWishlist(inactiveProduct._id);
      await user.save();

      const response = await request(app)
        .get('/api/user/wishlist')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.wishlist).toHaveLength(1); // Only active product
      expect(response.body.data.wishlist[0].name).toBe('Test Product');
    });
  });

  // Task 6.4.14.4: Remove products from wishlist
  describe('Task 6.4.14.4 - Remove Products from Wishlist', () => {
    beforeEach(async () => {
      // Add product to wishlist for testing
      const user = await User.findById(testUser._id);
      user.addToWishlist(testProduct._id);
      await user.save();
    });

    it('should remove product from wishlist successfully', async () => {
      const response = await request(app)
        .delete(`/api/user/wishlist/${testProduct._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Product removed from wishlist successfully');
      expect(response.body.data.wishlistCount).toBe(0);

      // Verify in database
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.wishlist).toHaveLength(0);
    });

    it('should return 404 for product not in wishlist', async () => {
      const anotherProduct = new Product({
        name: 'Another Product',
        slug: 'another-product',
        sku: 'ANOTHER-001',
        price: 39.99,
        description: 'Another test product',
        shortDescription: 'Another product',
        images: ['another.jpg'],
        category: new mongoose.Types.ObjectId(),
        condition: 'new',
        stockStatus: 'in_stock',
        isActive: true,
        status: 'active'
      });
      await anotherProduct.save();

      const response = await request(app)
        .delete(`/api/user/wishlist/${anotherProduct._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Product not found in wishlist');
    });
  });

  // Task 6.4.14.5: Test adding existing and non-existent products
  describe('Task 6.4.14.5 - Edge Cases for Add/Remove', () => {
    it('should handle adding non-existent product', async () => {
      const fakeProductId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .post('/api/user/wishlist')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ productId: fakeProductId });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Product not found');
    });

    it('should handle removing non-existent product', async () => {
      const fakeProductId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .delete(`/api/user/wishlist/${fakeProductId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Product not found in wishlist');
    });
  });

  // Task 6.4.14.6: Test unauthenticated access
  describe('Task 6.4.14.6 - Unauthenticated Access', () => {
    it('should prevent unauthenticated access to add to wishlist', async () => {
      const response = await request(app)
        .post('/api/user/wishlist')
        .send({ productId: testProduct._id });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should prevent unauthenticated access to get wishlist', async () => {
      const response = await request(app)
        .get('/api/user/wishlist');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should prevent unauthenticated access to remove from wishlist', async () => {
      const response = await request(app)
        .delete(`/api/user/wishlist/${testProduct._id}`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should handle invalid JWT token', async () => {
      const response = await request(app)
        .post('/api/user/wishlist')
        .set('Authorization', 'Bearer invalid-token')
        .send({ productId: testProduct._id });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  // Task 6.4.14.7: Test add to cart from wishlist
  describe('Task 6.4.14.7 - Add to Cart from Wishlist', () => {
    beforeEach(async () => {
      // Add product to wishlist for testing
      const user = await User.findById(testUser._id);
      user.addToWishlist(testProduct._id);
      await user.save();
    });

    it('should add product to cart from wishlist successfully', async () => {
      const response = await request(app)
        .post('/api/user/wishlist/add-to-cart')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ 
          productId: testProduct._id,
          quantity: 2,
          removeFromWishlistAfterAdd: true
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Product added to cart successfully');
      expect(response.body.data.productId).toBe(testProduct._id.toString());
      expect(response.body.data.quantity).toBe(2);
      expect(response.body.data.removedFromWishlist).toBe(true);
      expect(response.body.data.wishlistCount).toBe(0);

      // Verify cart was created and product added
      const cart = await Cart.findOne({ userId: testUser._id });
      expect(cart).toBeTruthy();
      expect(cart.items).toHaveLength(1);
      expect(cart.items[0].productId.toString()).toBe(testProduct._id.toString());
      expect(cart.items[0].quantity).toBe(2);
      expect(cart.totalItems).toBe(2);
      expect(cart.totalAmount).toBe(59.98); // 29.99 * 2

      // Verify product was removed from wishlist
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.wishlist).toHaveLength(0);
    });

    it('should add to cart without removing from wishlist when specified', async () => {
      const response = await request(app)
        .post('/api/user/wishlist/add-to-cart')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ 
          productId: testProduct._id,
          quantity: 1,
          removeFromWishlistAfterAdd: false
        });

      expect(response.status).toBe(200);
      expect(response.body.data.removedFromWishlist).toBe(false);
      expect(response.body.data.wishlistCount).toBe(1);

      // Verify product is still in wishlist
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.wishlist).toHaveLength(1);
    });

    it('should handle out-of-stock product', async () => {
      // Update product to be out of stock
      testProduct.stockStatus = 'out_of_stock';
      await testProduct.save();

      const response = await request(app)
        .post('/api/user/wishlist/add-to-cart')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ productId: testProduct._id });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Product is out of stock');
    });

    it('should handle insufficient stock quantity', async () => {
      // Update product stock quantity
      testProduct.stockQuantity = 1;
      await testProduct.save();

      const response = await request(app)
        .post('/api/user/wishlist/add-to-cart')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ 
          productId: testProduct._id,
          quantity: 5 // More than available
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Only 1 items available in stock');
    });

    it('should handle inactive product', async () => {
      // Update product to be inactive
      testProduct.isActive = false;
      await testProduct.save();

      const response = await request(app)
        .post('/api/user/wishlist/add-to-cart')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ productId: testProduct._id });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Product is not available');
    });

    it('should handle product not in wishlist', async () => {
      // Remove product from wishlist first
      const user = await User.findById(testUser._id);
      user.removeFromWishlist(testProduct._id);
      await user.save();

      const response = await request(app)
        .post('/api/user/wishlist/add-to-cart')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ productId: testProduct._id });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Product not found in wishlist');
    });
  });

  // Additional utility endpoints
  describe('Additional Wishlist Features', () => {
    beforeEach(async () => {
      // Add product to wishlist for testing
      const user = await User.findById(testUser._id);
      user.addToWishlist(testProduct._id);
      await user.save();
    });

    it('should check if product is in wishlist', async () => {
      const response = await request(app)
        .get(`/api/user/wishlist/check/${testProduct._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.isInWishlist).toBe(true);
    });

    it('should check if product is not in wishlist', async () => {
      const anotherProduct = new Product({
        name: 'Another Product',
        slug: 'another-product',
        sku: 'ANOTHER-001',
        price: 39.99,
        description: 'Another test product',
        shortDescription: 'Another product',
        images: ['another.jpg'],
        category: new mongoose.Types.ObjectId(),
        condition: 'new',
        stockStatus: 'in_stock',
        isActive: true,
        status: 'active'
      });
      await anotherProduct.save();

      const response = await request(app)
        .get(`/api/user/wishlist/check/${anotherProduct._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.isInWishlist).toBe(false);
    });

    it('should clear entire wishlist', async () => {
      const response = await request(app)
        .delete('/api/user/wishlist')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Wishlist cleared successfully');
      expect(response.body.data.wishlistCount).toBe(0);

      // Verify in database
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.wishlist).toHaveLength(0);
    });
  });

  // Cross-user security testing
  describe('Cross-User Security', () => {
    let otherUser;
    let otherAuthToken;

    beforeEach(async () => {
      // Create another user
      otherUser = new User({
        email: 'other@example.com',
        password: 'OtherPassword123!',
        firstName: 'Other',
        lastName: 'User',
        emailVerified: true
      });
      await otherUser.save();

      otherAuthToken = jwt.sign({ userId: otherUser._id }, process.env.JWT_SECRET || 'your-secret-key');

      // Add product to first user's wishlist
      const user = await User.findById(testUser._id);
      user.addToWishlist(testProduct._id);
      await user.save();
    });

    it('should not allow user to access another user\'s wishlist', async () => {
      const response = await request(app)
        .get('/api/user/wishlist')
        .set('Authorization', `Bearer ${otherAuthToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.wishlist).toHaveLength(0); // Should not see other user's wishlist
    });

    it('should maintain separate wishlists for different users', async () => {
      // Add different product to other user's wishlist
      const anotherProduct = new Product({
        name: 'Other User Product',
        slug: 'other-user-product',
        sku: 'OTHER-001',
        price: 49.99,
        description: 'Product for other user',
        shortDescription: 'Other product',
        images: ['other.jpg'],
        category: new mongoose.Types.ObjectId(),
        condition: 'new',
        stockStatus: 'in_stock',
        isActive: true,
        status: 'active'
      });
      await anotherProduct.save();

      await request(app)
        .post('/api/user/wishlist')
        .set('Authorization', `Bearer ${otherAuthToken}`)
        .send({ productId: anotherProduct._id });

      // Check first user's wishlist
      const firstUserResponse = await request(app)
        .get('/api/user/wishlist')
        .set('Authorization', `Bearer ${authToken}`);

      expect(firstUserResponse.body.data.wishlist).toHaveLength(1);
      expect(firstUserResponse.body.data.wishlist[0].name).toBe('Test Product');

      // Check second user's wishlist
      const secondUserResponse = await request(app)
        .get('/api/user/wishlist')
        .set('Authorization', `Bearer ${otherAuthToken}`);

      expect(secondUserResponse.body.data.wishlist).toHaveLength(1);
      expect(secondUserResponse.body.data.wishlist[0].name).toBe('Other User Product');
    });
  });
});