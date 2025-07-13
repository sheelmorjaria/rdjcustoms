import request from 'supertest';
import app from '../../app.js';
import mongoose from 'mongoose';
import { performance } from 'perf_hooks';
import Product from '../../models/Product.js';
import User from '../../models/User.js';
import Order from '../../models/Order.js';
import jwt from 'jsonwebtoken';

// Performance thresholds (in milliseconds)
const PERFORMANCE_THRESHOLDS = {
  AUTH: {
    LOGIN: 200,
    REGISTER: 300,
    TOKEN_VERIFICATION: 50,
  },
  PRODUCTS: {
    LIST: 150,
    SINGLE: 100,
    SEARCH: 200,
    FILTER: 250,
  },
  ORDERS: {
    CREATE: 500,
    LIST: 200,
    UPDATE: 300,
  },
  CART: {
    ADD: 150,
    UPDATE: 100,
    REMOVE: 100,
  },
  DATABASE: {
    QUERY: 100,
    INSERT: 150,
    UPDATE: 150,
    DELETE: 100,
  },
};

// Helper function to measure endpoint performance
const measureEndpointPerformance = async (method, endpoint, data = null, token = null) => {
  const startTime = performance.now();
  
  let req = request(app)[method](endpoint);
  
  if (token) {
    req = req.set('Authorization', `Bearer ${token}`);
  }
  
  if (data) {
    req = req.send(data);
  }
  
  const response = await req;
  const endTime = performance.now();
  
  return {
    response,
    duration: endTime - startTime,
  };
};

// Helper to create test data
const createTestData = async (count) => {
  const products = [];
  const users = [];
  
  // Create products
  for (let i = 0; i < count; i++) {
    products.push({
      name: `Product ${i}`,
      description: `Description for product ${i}`,
      price: Math.random() * 1000,
      category: ['electronics', 'clothing', 'home'][i % 3],
      stock: Math.floor(Math.random() * 100),
      images: [`/images/product-${i}.jpg`],
    });
  }
  
  // Create users
  for (let i = 0; i < count / 10; i++) {
    users.push({
      name: `User ${i}`,
      email: `user${i}@example.com`,
      password: 'SecurePassword123!',
    });
  }
  
  await Product.insertMany(products);
  await User.insertMany(users);
  
  return { products, users };
};

describe('API Performance Tests', () => {
  let authToken;
  let testUser;

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/rdjcustoms-test');
    
    // Create test user
    testUser = await User.create({
      name: 'Test User',
      email: 'testperf@example.com',
      password: 'TestPassword123!',
    });
    
    // Generate auth token
    authToken = jwt.sign(
      { userId: testUser._id, email: testUser.email },
      process.env.JWT_SECRET || 'test-secret'
    );
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  });

  describe('Authentication Performance', () => {
    it('should handle login requests within threshold', async () => {
      const loginData = {
        email: 'testperf@example.com',
        password: 'TestPassword123!',
      };

      const { duration } = await measureEndpointPerformance('post', '/api/auth/login', loginData);
      
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.AUTH.LOGIN);
    });

    it('should handle concurrent login attempts efficiently', async () => {
      const concurrentLogins = 10;
      const loginPromises = [];

      for (let i = 0; i < concurrentLogins; i++) {
        loginPromises.push(
          measureEndpointPerformance('post', '/api/auth/login', {
            email: 'testperf@example.com',
            password: 'TestPassword123!',
          })
        );
      }

      const results = await Promise.all(loginPromises);
      const averageDuration = results.reduce((sum, r) => sum + r.duration, 0) / concurrentLogins;
      
      expect(averageDuration).toBeLessThan(PERFORMANCE_THRESHOLDS.AUTH.LOGIN * 1.5);
    });

    it('should verify JWT tokens quickly', async () => {
      const { duration } = await measureEndpointPerformance('get', '/api/auth/verify', null, authToken);
      
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.AUTH.TOKEN_VERIFICATION);
    });
  });

  describe('Product API Performance', () => {
    beforeEach(async () => {
      await Product.deleteMany({});
      await createTestData(100);
    });

    it('should handle product listing with pagination efficiently', async () => {
      const { duration, response } = await measureEndpointPerformance('get', '/api/products?page=1&limit=20');
      
      expect(response.status).toBe(200);
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.PRODUCTS.LIST);
    });

    it('should handle product search queries efficiently', async () => {
      const searchQueries = ['Product', 'electronics', 'test', '50'];
      const durations = [];

      for (const query of searchQueries) {
        const { duration } = await measureEndpointPerformance('get', `/api/products/search?q=${query}`);
        durations.push(duration);
      }

      const averageDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
      expect(averageDuration).toBeLessThan(PERFORMANCE_THRESHOLDS.PRODUCTS.SEARCH);
    });

    it('should handle complex filter queries efficiently', async () => {
      const { duration } = await measureEndpointPerformance(
        'get',
        '/api/products?category=electronics&minPrice=100&maxPrice=500&sort=price&order=desc'
      );
      
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.PRODUCTS.FILTER);
    });

    it('should handle concurrent product requests', async () => {
      const concurrentRequests = 20;
      const requests = [];

      for (let i = 0; i < concurrentRequests; i++) {
        requests.push(measureEndpointPerformance('get', '/api/products'));
      }

      const startTime = performance.now();
      const _results = await Promise.all(requests);
      const totalTime = performance.now() - startTime;

      // Total time should be less than sequential time
      expect(totalTime).toBeLessThan(PERFORMANCE_THRESHOLDS.PRODUCTS.LIST * concurrentRequests * 0.3);
    });
  });

  describe('Order Processing Performance', () => {
    let testProduct;

    beforeEach(async () => {
      testProduct = await Product.create({
        name: 'Test Product',
        price: 99.99,
        stock: 100,
        category: 'test',
      });
    });

    it('should create orders within performance threshold', async () => {
      const orderData = {
        items: [
          {
            product: testProduct._id,
            quantity: 2,
            price: testProduct.price,
          },
        ],
        shippingAddress: {
          street: '123 Test St',
          city: 'London',
          postcode: 'SW1A 1AA',
          country: 'UK',
        },
        paymentMethod: 'paypal',
      };

      const { duration } = await measureEndpointPerformance('post', '/api/orders', orderData, authToken);
      
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.ORDERS.CREATE);
    });

    it('should handle order status updates efficiently', async () => {
      const order = await Order.create({
        user: testUser._id,
        items: [{
          product: testProduct._id,
          quantity: 1,
          price: testProduct.price,
        }],
        totalAmount: testProduct.price,
        status: 'pending',
      });

      const { duration } = await measureEndpointPerformance(
        'patch',
        `/api/orders/${order._id}/status`,
        { status: 'processing' },
        authToken
      );
      
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.ORDERS.UPDATE);
    });
  });

  describe('Database Query Performance', () => {
    it('should execute aggregation queries efficiently', async () => {
      await createTestData(1000);

      const startTime = performance.now();
      
      const _results = await Product.aggregate([
        { $match: { price: { $gte: 100, $lte: 500 } } },
        { $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgPrice: { $avg: '$price' },
        }},
        { $sort: { count: -1 } },
      ]);

      const duration = performance.now() - startTime;
      
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.DATABASE.QUERY * 2);
    });

    it('should handle complex join queries efficiently', async () => {
      const startTime = performance.now();
      
      const _orders = await Order.find()
        .populate('user', 'name email')
        .populate('items.product', 'name price')
        .limit(50)
        .lean();

      const duration = performance.now() - startTime;
      
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.DATABASE.QUERY * 3);
    });

    it('should use indexes effectively', async () => {
      // Create indexes
      await Product.createIndexes([
        { category: 1, price: 1 },
        { name: 'text', description: 'text' },
      ]);

      const startTime = performance.now();
      
      // Query that should use indexes
      const _products = await Product.find({
        category: 'electronics',
        price: { $gte: 100, $lte: 1000 },
      }).limit(20);

      const duration = performance.now() - startTime;
      
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.DATABASE.QUERY);
    });
  });

  describe('Caching Performance', () => {
    it('should serve cached responses faster', async () => {
      // First request (cache miss)
      const { duration: firstDuration } = await measureEndpointPerformance('get', '/api/products');
      
      // Second request (cache hit)
      const { duration: secondDuration } = await measureEndpointPerformance('get', '/api/products');
      
      // Cached response should be significantly faster
      expect(secondDuration).toBeLessThan(firstDuration * 0.5);
    });
  });

  describe('Rate Limiting Performance', () => {
    it('should handle rate limit checks efficiently', async () => {
      const requests = [];
      const requestCount = 50;

      for (let i = 0; i < requestCount; i++) {
        requests.push(measureEndpointPerformance('get', '/api/products'));
      }

      const results = await Promise.all(requests);
      
      // Rate limiter shouldn't add significant overhead
      const averageOverhead = results.reduce((sum, r) => sum + r.duration, 0) / requestCount;
      expect(averageOverhead).toBeLessThan(PERFORMANCE_THRESHOLDS.PRODUCTS.LIST * 1.2);
    });
  });

  describe('Memory Usage Tests', () => {
    it('should not have memory leaks during bulk operations', async () => {
      if (!global.gc) {
        console.warn('Garbage collection not exposed. Run with --expose-gc flag');
        return;
      }

      const initialMemory = process.memoryUsage().heapUsed;
      
      // Perform bulk operations
      for (let i = 0; i < 10; i++) {
        await createTestData(100);
        await Product.deleteMany({});
      }

      // Force garbage collection
      global.gc();
      
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Memory increase should be minimal (less than 50MB)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
    });
  });

  describe('Response Size Optimization', () => {
    it('should use efficient data serialization', async () => {
      await createTestData(50);

      const { response } = await measureEndpointPerformance('get', '/api/products');
      
      // Check response size
      const responseSize = JSON.stringify(response.body).length;
      const itemCount = response.body.products?.length || 0;
      
      if (itemCount > 0) {
        const averageSizePerItem = responseSize / itemCount;
        // Each product should serialize to less than 1KB on average
        expect(averageSizePerItem).toBeLessThan(1024);
      }
    });
  });
});