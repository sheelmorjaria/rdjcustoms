import { vi, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Set PayPal environment variables early for proper client initialization
process.env.PAYPAL_CLIENT_ID = 'test-paypal-client-id';
process.env.PAYPAL_CLIENT_SECRET = 'test-paypal-client-secret';
process.env.PAYPAL_ENVIRONMENT = 'sandbox';

// Handle Mongoose model recompilation issues in tests
const originalModel = mongoose.model;
mongoose.model = function(name, schema, collection, options) {
  try {
    // Try to get existing model first
    return originalModel.call(this, name);
  } catch (error) {
    // Model doesn't exist, create it with original function
    return originalModel.call(this, name, schema, collection, options);
  }
};

let mongoServer;
let mongoUri;
let dockerContainerId;
let useDocker = false;

// Setup global test utilities
global.vi = vi;

/**
 * Check if Docker is available and running
 */
async function isDockerAvailable() {
  try {
    const { stdout } = await execAsync('docker --version');
    console.log('Docker detected:', stdout.trim());
    
    // Check if Docker daemon is running
    await execAsync('docker info');
    return true;
  } catch (error) {
    console.log('Docker not available:', error.message);
    return false;
  }
}

/**
 * Start MongoDB Docker container for tests
 */
async function startMongoDocker() {
  try {
    // Check if test container already exists
    try {
      const { stdout: existingContainer } = await execAsync('docker ps -aq -f name=mongodb-test');
      if (existingContainer.trim()) {
        console.log('Removing existing test container...');
        await execAsync('docker rm -f mongodb-test');
      }
    } catch (error) {
      // Container doesn't exist, continue
    }

    // Start new MongoDB container
    console.log('Starting MongoDB Docker container...');
    const { stdout } = await execAsync(`
      docker run -d \
        --name mongodb-test \
        -p 27017:27017 \
        -e MONGO_INITDB_DATABASE=rdjcustoms-test \
        mongo:6.0
    `);
    
    dockerContainerId = stdout.trim();
    console.log('MongoDB container started:', dockerContainerId);
    
    // Wait for MongoDB to be ready
    let retries = 30;
    while (retries > 0) {
      try {
        await execAsync('docker exec mongodb-test mongosh --eval "db.adminCommand(\'ping\')"');
        console.log('MongoDB is ready');
        break;
      } catch (error) {
        retries--;
        if (retries === 0) {
          throw new Error('MongoDB failed to start in Docker');
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return 'mongodb://localhost:27017/rdjcustoms-test';
  } catch (error) {
    console.error('Failed to start MongoDB Docker:', error);
    throw error;
  }
}

/**
 * Stop MongoDB Docker container
 */
async function stopMongoDocker() {
  if (dockerContainerId) {
    try {
      console.log('Stopping MongoDB Docker container...');
      await execAsync(`docker stop ${dockerContainerId}`);
      await execAsync(`docker rm ${dockerContainerId}`);
      console.log('MongoDB container stopped and removed');
    } catch (error) {
      console.error('Error stopping Docker container:', error.message);
    }
  }
}

// Setup in-memory MongoDB for integration tests
beforeAll(async () => {
  try {
    // Check environment variable for forced mode
    const forceMemoryServer = process.env.FORCE_MEMORY_SERVER === 'true';
    const useExistingMongo = process.env.MONGO_URI;
    
    if (useExistingMongo) {
      // Use existing MongoDB instance (e.g., in CI/CD)
      console.log('Using existing MongoDB instance');
      mongoUri = useExistingMongo;
    } else if (!forceMemoryServer && await isDockerAvailable()) {
      // Use Docker MongoDB
      useDocker = true;
      mongoUri = await startMongoDocker();
    } else {
      // Fall back to MongoDB Memory Server
      console.log('Using MongoDB Memory Server (this may take a while on first run)...');
      mongoServer = await MongoMemoryServer.create({
        instance: {
          storageEngine: 'wiredTiger'
        },
        binary: {
          // Use system MongoDB if available to avoid download
          systemBinary: process.env.MONGOD_PATH || undefined
        }
      });
      mongoUri = mongoServer.getUri();
    }
    
    // Disconnect from any existing connection
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    
    // Connect to the database
    await mongoose.connect(mongoUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log(`Integration test database connected successfully (${useDocker ? 'Docker' : useExistingMongo ? 'External' : 'Memory Server'})`);
  } catch (error) {
    console.error('Failed to setup integration test database:', error);
    throw error;
  }
}, 60000);

afterAll(async () => {
  try {
    // Close database connection
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    
    // Stop appropriate MongoDB instance
    if (useDocker) {
      await stopMongoDocker();
    } else if (mongoServer) {
      await mongoServer.stop();
      mongoServer = null;
    }
    
    console.log('Integration test database cleanup completed');
  } catch (error) {
    console.error('Error during integration test cleanup:', error.message);
  }
}, 30000);

beforeEach(async () => {
  // Clean up test data before each test
  if (mongoose.connection.readyState === 1) {
    const collections = mongoose.connection.collections;
    
    for (const collection of Object.values(collections)) {
      try {
        await collection.deleteMany({});
      } catch (error) {
        console.warn(`Failed to clean collection ${collection.collectionName}:`, error.message);
      }
    }
  }
});

afterEach(() => {
  // Clear all mocks after each test
  vi.clearAllMocks();
});

// Mock external services for integration tests
vi.mock('../services/bitcoinService.js', () => ({
  default: {
    generateAddress: vi.fn().mockResolvedValue({
      address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
      qrCode: 'data:image/png;base64,mock-qr-code'
    }),
    getExchangeRate: vi.fn().mockResolvedValue({
      rate: 0.000025,
      validUntil: new Date(Date.now() + 300000)
    }),
    getAddressInfo: vi.fn().mockResolvedValue({
      balance: 0,
      transactions: []
    })
  }
}));

vi.mock('../services/moneroService.js', () => ({
  default: {
    getExchangeRate: vi.fn().mockResolvedValue({
      rate: 0.008,
      validUntil: new Date(Date.now() + 300000)
    }),
    convertGbpToXmr: vi.fn().mockResolvedValue({
      xmrAmount: 1.234567890123,
      exchangeRate: 0.008,
      validUntil: new Date(Date.now() + 300000)
    }),
    createPayment: vi.fn().mockResolvedValue({
      address: '4AdUndXHHZ6cfufTMvppY6JwXNouMBzSkbLYfpAV5Usx3skxNgYeYTRJ5AmD5H3F',
      amount: 1.234567890123,
      paymentId: 'globee-payment-id'
    }),
    createPaymentRequest: vi.fn().mockResolvedValue({
      paymentId: 'globee-payment-id',
      address: '4AdUndXHHZ6cfufTMvppY6JwXNouMBzSkbLYfpAV5Usx3skxNgYeYTRJ5AmD5H3F',
      paymentUrl: 'https://globee.com/payment/mock-payment-id',
      expirationTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
      requiredConfirmations: 10,
      paymentWindow: 24
    }),
    verifyWebhookSignature: vi.fn().mockReturnValue(true),
    getPaymentStatus: vi.fn().mockResolvedValue({
      status: 'pending',
      confirmations: 0,
      paid_amount: 0,
      transaction_hash: null
    }),
    isPaymentExpired: vi.fn().mockImplementation((createdAt) => {
      // Check if payment is older than 24 hours (default expiration)
      const expirationTime = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000);
      return new Date() > expirationTime;
    }),
    getRequiredConfirmations: vi.fn().mockReturnValue(10),
    processWebhookNotification: vi.fn().mockImplementation((payload) => ({
      orderId: payload.order_id || 'test-order-id',
      status: payload.status === 'paid' ? 'confirmed' : payload.status,
      confirmations: payload.confirmations || 0,
      paidAmount: payload.paid_amount || 0,
      transactionHash: payload.transaction_hash || null
    }))
  }
}));

vi.mock('../services/paypalService.js', () => ({
  default: {
    createOrder: vi.fn().mockResolvedValue({
      id: 'paypal-order-id',
      status: 'CREATED',
      links: [
        {
          rel: 'approve',
          href: 'https://www.sandbox.paypal.com/checkoutnow?token=mock-token'
        }
      ]
    }),
    captureOrder: vi.fn().mockResolvedValue({
      id: 'paypal-capture-id',
      status: 'COMPLETED'
    }),
    refundPayment: vi.fn().mockResolvedValue({
      id: 'paypal-refund-id',
      status: 'COMPLETED'
    })
  }
}));

// Mock email service
vi.mock('../services/emailService.js', () => ({
  default: {
    sendEmail: vi.fn().mockResolvedValue(true),
    sendOrderConfirmation: vi.fn().mockResolvedValue(true),
    sendPaymentNotification: vi.fn().mockResolvedValue(true)
  }
}));

// Mock PayPal SDK to prevent client initialization issues
vi.mock('@paypal/paypal-server-sdk', () => ({
  Client: vi.fn().mockImplementation(() => ({
    ordersController: {
      ordersCreate: vi.fn().mockResolvedValue({
        result: {
          id: 'mock-paypal-order-id',
          status: 'CREATED',
          links: [{ rel: 'approve', href: 'https://sandbox.paypal.com/mock-approval-url' }]
        }
      }),
      ordersCapture: vi.fn().mockResolvedValue({
        result: {
          id: 'mock-capture-id',
          status: 'COMPLETED'
        }
      })
    },
    paymentsController: {
      capturesRefund: vi.fn().mockResolvedValue({
        result: {
          id: 'mock-refund-id',
          status: 'COMPLETED'
        }
      })
    }
  })),
  Environment: {
    Sandbox: 'sandbox',
    Production: 'production'
  }
}));

// Mock logger but allow some output for debugging
vi.mock('../utils/logger.js', () => ({
  default: {
    info: vi.fn().mockImplementation((...args) => console.log('INFO:', ...args)),
    warn: vi.fn().mockImplementation((...args) => console.warn('WARN:', ...args)),
    error: vi.fn().mockImplementation((...args) => console.error('ERROR:', ...args)),
    debug: vi.fn()
  },
  logError: vi.fn(),
  logInfo: vi.fn(),
  logPaymentEvent: vi.fn()
}));

// Export utilities for integration tests
export const getMongoUri = () => mongoUri;
export const getMongoServer = () => mongoServer;
export const isUsingDocker = () => useDocker;

// Test data factories
export const createTestUser = (overrides = {}) => ({
  email: 'test@example.com',
  password: 'hashedPassword123',
  firstName: 'Test',
  lastName: 'User',
  isActive: true,
  role: 'customer',
  ...overrides
});

export const createTestProduct = (overrides = {}) => ({
  name: 'Test Product',
  slug: 'test-product',
  sku: 'TEST-PROD-001',
  price: 199.99,
  description: 'A test product',
  shortDescription: 'A test product for testing',
  category: new mongoose.Types.ObjectId(),
  condition: 'new',
  inStock: true,
  stockStatus: 'in_stock',
  status: 'active',
  isActive: true,
  ...overrides
});

export const createTestOrder = (overrides = {}) => ({
  userId: new mongoose.Types.ObjectId(),
  customerEmail: 'test@example.com',
  status: 'pending',
  paymentStatus: 'pending',
  items: [
    {
      productId: new mongoose.Types.ObjectId(),
      productName: 'Test Product',
      productSlug: 'test-product',
      quantity: 1,
      unitPrice: 199.99,
      totalPrice: 199.99
    }
  ],
  subtotal: 199.99,
  tax: 0,
  shipping: 9.99,
  totalAmount: 209.98,
  shippingAddress: {
    fullName: 'Test User',
    addressLine1: '123 Test St',
    city: 'Test City',
    stateProvince: 'Test State',
    postalCode: 'TE5T 1NG',
    country: 'GB'
  },
  billingAddress: {
    fullName: 'Test User',
    addressLine1: '123 Test St',
    city: 'Test City',
    stateProvince: 'Test State',
    postalCode: 'TE5T 1NG',
    country: 'GB'
  },
  shippingMethod: {
    id: new mongoose.Types.ObjectId(),
    name: 'Standard Shipping',
    cost: 9.99
  },
  paymentMethod: {
    type: 'paypal',
    name: 'PayPal'
  },
  ...overrides
});

export const createTestCart = (overrides = {}) => ({
  userId: new mongoose.Types.ObjectId(),
  items: [
    {
      productId: new mongoose.Types.ObjectId(),
      productName: 'Test Product',
      productSlug: 'test-product',
      unitPrice: 199.99,
      quantity: 1,
      subtotal: 199.99
    }
  ],
  totalItems: 1,
  totalAmount: 199.99,
  ...overrides
});

// Process cleanup handlers
const cleanup = async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    if (useDocker) {
      await stopMongoDocker();
    } else if (mongoServer) {
      await mongoServer.stop();
    }
  } catch (error) {
    console.error('Error during process cleanup:', error.message);
  }
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('beforeExit', cleanup);