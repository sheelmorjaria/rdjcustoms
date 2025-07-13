/**
 * Centralized test configuration and setup helpers
 * Provides standardized configuration patterns for different types of tests
 */

import { createTestApp, generateTestToken, generateAdminToken } from './testMiddleware.js';
import { createValidUserData, createValidProductData, createValidOrderData } from './testDataFactory.js';
import { resetAllModelMocks } from './modelMocks.js';
import User from '../../models/User.js';
import Product from '../../models/Product.js';
import Order from '../../models/Order.js';
import Cart from '../../models/Cart.js';
import Category from '../../models/Category.js';

/**
 * Standard test environment configuration
 */
export const getTestEnvironmentConfig = () => ({
  JWT_SECRET: 'test-jwt-secret-key',
  NODE_ENV: 'test',
  MONGODB_TEST_URI: process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/test',
  
  // Payment provider test configuration
  PAYPAL_CLIENT_ID: 'test-paypal-client-id',
  PAYPAL_CLIENT_SECRET: 'test-paypal-client-secret',
  PAYPAL_ENVIRONMENT: 'sandbox',
  
  // Bitcoin/Crypto test configuration
  BITCOIN_NETWORK: 'testnet',
  BLOCKONOMICS_API_KEY: 'test-blockonomics-key',
  
  // Monero test configuration
  GLOBEE_API_KEY: 'test-globee-key',
  GLOBEE_API_SECRET: 'test-globee-secret',
  
  // Email service test configuration
  EMAIL_PROVIDER: 'test',
  SENDGRID_API_KEY: 'test-sendgrid-key'
});

/**
 * Apply test environment configuration
 */
export const configureTestEnvironment = () => {
  const config = getTestEnvironmentConfig();
  Object.keys(config).forEach(key => {
    if (!process.env[key]) {
      process.env[key] = config[key];
    }
  });
};

/**
 * Standard test database cleanup
 */
export const cleanupTestDatabase = async () => {
  const models = [User, Product, Order, Cart, Category];
  
  for (const model of models) {
    try {
      await model.deleteMany({});
    } catch (error) {
      console.warn(`Failed to cleanup ${model.modelName}:`, error.message);
    }
  }
};

/**
 * Create test users with standard configurations
 */
export const createTestUsers = async () => {
  const adminUser = await User.create(createValidUserData({
    email: 'admin@test.com',
    firstName: 'Test',
    lastName: 'Admin',
    role: 'admin'
  }));

  const customerUser = await User.create(createValidUserData({
    email: 'customer@test.com',
    firstName: 'Test',
    lastName: 'Customer',
    role: 'customer'
  }));

  const adminToken = generateAdminToken({
    userId: adminUser._id,
    email: adminUser.email,
    role: 'admin'
  });

  const customerToken = generateTestToken({
    userId: customerUser._id,
    email: customerUser.email,
    role: 'customer'
  });

  return {
    adminUser,
    customerUser,
    adminToken,
    customerToken
  };
};

/**
 * Create standard test products
 */
export const createTestProducts = async (categoryId = null) => {
  const products = [
    createValidProductData({
      name: 'Test Smartphone',
      price: 699.99,
      stockQuantity: 20,
      category: categoryId
    }),
    createValidProductData({
      name: 'Test Laptop',
      price: 1299.99,
      stockQuantity: 10,
      category: categoryId
    }),
    createValidProductData({
      name: 'Test Accessory',
      price: 49.99,
      stockQuantity: 50,
      category: categoryId
    })
  ];

  return Product.create(products);
};

/**
 * Integration test configuration builder
 */
export class IntegrationTestConfig {
  constructor() {
    this.app = null;
    this.users = null;
    this.products = null;
    this.beforeEachCallbacks = [];
    this.afterEachCallbacks = [];
  }

  /**
   * Set up Express app with middleware
   */
  withApp(routesSetup = () => {}) {
    this.app = createTestApp();
    routesSetup(this.app);
    return this;
  }

  /**
   * Set up test users
   */
  withUsers() {
    this.beforeEachCallbacks.push(async () => {
      this.users = await createTestUsers();
    });
    return this;
  }

  /**
   * Set up test products
   */
  withProducts() {
    this.beforeEachCallbacks.push(async () => {
      this.products = await createTestProducts();
    });
    return this;
  }

  /**
   * Add custom setup callback
   */
  withSetup(callback) {
    this.beforeEachCallbacks.push(callback);
    return this;
  }

  /**
   * Add custom cleanup callback
   */
  withCleanup(callback) {
    this.afterEachCallbacks.push(callback);
    return this;
  }

  /**
   * Get the configured beforeEach function
   */
  getBeforeEach() {
    return async () => {
      configureTestEnvironment();
      await cleanupTestDatabase();
      resetAllModelMocks();

      for (const callback of this.beforeEachCallbacks) {
        await callback.call(this);
      }
    };
  }

  /**
   * Get the configured afterEach function
   */
  getAfterEach() {
    return async () => {
      for (const callback of this.afterEachCallbacks) {
        await callback.call(this);
      }
    };
  }

  /**
   * Get the complete test configuration
   */
  build() {
    return {
      app: this.app,
      users: this.users,
      products: this.products,
      beforeEach: this.getBeforeEach(),
      afterEach: this.getAfterEach()
    };
  }
}

/**
 * Quick setup functions for common test patterns
 */

/**
 * Controller test setup with authentication
 */
export const setupControllerTest = (routesSetup) => {
  return new IntegrationTestConfig()
    .withApp(routesSetup)
    .withUsers()
    .build();
};

/**
 * API integration test setup with products and users
 */
export const setupApiTest = (routesSetup) => {
  return new IntegrationTestConfig()
    .withApp(routesSetup)
    .withUsers()
    .withProducts()
    .build();
};

/**
 * Admin-only test setup
 */
export const setupAdminTest = (routesSetup) => {
  return new IntegrationTestConfig()
    .withApp(routesSetup)
    .withUsers()
    .withSetup(async function() {
      // Additional admin-specific setup can be added here
      this.adminToken = this.users.adminToken;
    })
    .build();
};

/**
 * Unit test configuration (no database, minimal setup)
 */
export const setupUnitTest = () => {
  configureTestEnvironment();
  resetAllModelMocks();
  
  return {
    testData: {
      validUser: createValidUserData(),
      validProduct: createValidProductData(),
      validOrder: createValidOrderData()
    }
  };
};

/**
 * Performance test configuration
 */
export const setupPerformanceTest = () => {
  configureTestEnvironment();
  
  return {
    timeout: 30000, // 30 second timeout for performance tests
    concurrent: true, // Allow concurrent test execution
    iterations: 100, // Standard iteration count
    
    // Helper to measure execution time
    measureTime: async (fn) => {
      const start = Date.now();
      await fn();
      return Date.now() - start;
    },
    
    // Helper to run multiple iterations
    runIterations: async (fn, count = 100) => {
      const times = [];
      for (let i = 0; i < count; i++) {
        const time = await fn();
        times.push(time);
      }
      return {
        average: times.reduce((a, b) => a + b, 0) / times.length,
        min: Math.min(...times),
        max: Math.max(...times),
        times
      };
    }
  };
};

export default {
  IntegrationTestConfig,
  configureTestEnvironment,
  cleanupTestDatabase,
  createTestUsers,
  createTestProducts,
  setupControllerTest,
  setupApiTest,
  setupAdminTest,
  setupUnitTest,
  setupPerformanceTest,
  getTestEnvironmentConfig
};