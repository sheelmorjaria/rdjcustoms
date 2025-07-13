import { vi, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Set test environment flag
process.env.NODE_ENV = 'test';
global.isTestEnvironment = true;

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
let useDocker = false;
const _sharedDockerContainer = null;

// Setup global test utilities
global.vi = vi;

// Import and setup session mocking for integration tests that use transactions
import { setupAdvancedSessionMocking } from './helpers/sessionMocks.js';

// Setup session mocking
global.sessionMocks = setupAdvancedSessionMocking();

// Shared container management
const SHARED_CONTAINER_NAME = 'rdjcustoms-test-shared';

/**
 * Check if Docker is available and running
 */
async function isDockerAvailable() {
  try {
    await execAsync('docker --version');
    await execAsync('docker info');
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Check if shared container is already running
 */
async function isSharedContainerRunning() {
  try {
    const { stdout } = await execAsync(`docker ps -q -f name=${SHARED_CONTAINER_NAME}`);
    return stdout.trim().length > 0;
  } catch (error) {
    return false;
  }
}

/**
 * Start or connect to shared MongoDB Docker container
 */
async function connectToSharedDocker() {
  try {
    if (await isSharedContainerRunning()) {
      console.log('Connecting to existing shared MongoDB container...');
      return 'mongodb://localhost:27017/rdjcustoms-test';
    }

    // Start new shared container
    console.log('Starting shared MongoDB Docker container...');
    
    // Remove any stopped container with the same name
    try {
      await execAsync(`docker rm -f ${SHARED_CONTAINER_NAME} 2>/dev/null`);
    } catch (error) {
      // Container doesn't exist, continue
    }

    const { stdout } = await execAsync(`
      docker run -d \
        --name ${SHARED_CONTAINER_NAME} \
        -p 27017:27017 \
        -e MONGO_INITDB_DATABASE=rdjcustoms-test \
        mongo:6.0
    `);
    
    sharedDockerContainer = stdout.trim();
    console.log('Shared MongoDB container started');
    
    // Wait for MongoDB to be ready
    let retries = 60; // Increased retries for better reliability
    while (retries > 0) {
      try {
        await execAsync(`docker exec ${SHARED_CONTAINER_NAME} mongosh --eval "db.adminCommand('ping')"`);
        console.log('MongoDB connection verified');
        break;
      } catch (error) {
        retries--;
        if (retries === 0) {
          throw new Error('MongoDB failed to start in Docker after 60 attempts');
        }
        await new Promise(resolve => setTimeout(resolve, 2000)); // Increased delay
      }
    }
    
    console.log('MongoDB is ready');
    return 'mongodb://localhost:27017/rdjcustoms-test';
  } catch (error) {
    console.error('Failed to start shared MongoDB Docker:', error);
    throw error;
  }
}

// Setup in-memory MongoDB for integration tests
beforeAll(async () => {
  try {
    // Skip if already connected
    if (mongoose.connection.readyState === 1) {
      console.log('Already connected to test database');
      return;
    }

    // Check environment variable for forced mode
    const forceMemoryServer = process.env.FORCE_MEMORY_SERVER === 'true';
    const useExistingMongo = process.env.MONGO_URI;
    const _keepDockerRunning = process.env.KEEP_DOCKER_RUNNING === 'true';
    
    if (useExistingMongo) {
      // Use existing MongoDB instance (e.g., in CI/CD)
      console.log('Using existing MongoDB instance');
      mongoUri = useExistingMongo;
    } else if (!forceMemoryServer && await isDockerAvailable()) {
      // Use shared Docker MongoDB
      useDocker = true;
      mongoUri = await connectToSharedDocker();
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
    
    // Connect to the database
    await mongoose.connect(mongoUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    });
    
    console.log(`Integration test database connected (${useDocker ? 'Docker Shared' : useExistingMongo ? 'External' : 'Memory Server'})`);
  } catch (error) {
    console.error('Failed to setup integration test database:', error);
    throw error;
  }
}, 60000);

afterAll(async () => {
  try {
    // Clean up session mocks first
    if (global.sessionMocks && global.sessionMocks.cleanup) {
      global.sessionMocks.cleanup();
    }
    
    // Keep connection open if we're using shared Docker
    const _keepDockerRunning = process.env.KEEP_DOCKER_RUNNING === 'true';
    
    if (!keepDockerRunning || !useDocker) {
      // Close database connection
      if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.close();
      }
      
      // Stop MongoDB Memory Server if used
      if (mongoServer) {
        await mongoServer.stop();
        mongoServer = null;
      }
    }
    
    // Note: We don't stop the shared Docker container here
    // It will be reused by other test runs
    console.log('Integration test cleanup completed');
  } catch (error) {
    console.error('Error during integration test cleanup:', error.message);
  }
}, 30000);

afterEach(() => {
  // Clear all mocks after each test
  vi.clearAllMocks();
});

// Process cleanup - only stop container if it's the last process
let isCleaningUp = false;
const cleanup = async () => {
  if (isCleaningUp) return;
  isCleaningUp = true;
  
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    
    // Only stop Docker if explicitly requested
    if (process.env.STOP_DOCKER_ON_EXIT === 'true' && useDocker) {
      console.log('Stopping shared Docker container...');
      await execAsync(`docker stop ${SHARED_CONTAINER_NAME}`);
      await execAsync(`docker rm ${SHARED_CONTAINER_NAME}`);
    }
    
    if (mongoServer) {
      await mongoServer.stop();
    }
  } catch (error) {
    console.error('Error during process cleanup:', error.message);
  }
};

// Only register cleanup handlers once
if (!global.__cleanupHandlersRegistered) {
  global.__cleanupHandlersRegistered = true;
  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
  process.on('beforeExit', cleanup);
}

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
    sendOrderConfirmationEmail: vi.fn().mockResolvedValue(true),
    sendOrderCancellationEmail: vi.fn().mockResolvedValue(true),
    sendOrderShippedEmail: vi.fn().mockResolvedValue(true),
    sendOrderDeliveredEmail: vi.fn().mockResolvedValue(true),
    sendSupportRequestEmail: vi.fn().mockResolvedValue(true),
    sendContactAcknowledgmentEmail: vi.fn().mockResolvedValue(true),
    sendReturnRequestConfirmationEmail: vi.fn().mockResolvedValue(true),
    sendRefundConfirmationEmail: vi.fn().mockResolvedValue(true),
    sendAccountDisabledEmail: vi.fn().mockResolvedValue(true),
    sendAccountReEnabledEmail: vi.fn().mockResolvedValue(true),
    sendPaymentConfirmationEmail: vi.fn().mockResolvedValue(true),
    sendPaymentNotification: vi.fn().mockResolvedValue(true),
    // Legacy aliases
    sendOrderConfirmation: vi.fn().mockResolvedValue(true)
  }
}));

// Mock PayPal SDK
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

// Mock logger
vi.mock('../utils/logger.js', () => ({
  default: {
    info: vi.fn(),
    warn: vi.fn().mockImplementation((...args) => console.warn('WARN:', ...args)),
    error: vi.fn().mockImplementation((...args) => console.error('ERROR:', ...args)),
    debug: vi.fn()
  },
  logError: vi.fn(),
  logInfo: vi.fn(),
  logPaymentEvent: vi.fn()
}));

// Enhanced request mocking for integration tests
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
  
  // Set up request/response mocking globals for tests that need them
  global.mockRequest = (overrides = {}) => ({
    body: {},
    params: {},
    query: {},
    headers: {
      'content-type': 'application/json',
      'user-agent': 'Test Agent',
      'x-forwarded-for': '127.0.0.1'
    },
    cookies: {},
    user: null,
    session: {},
    ip: '127.0.0.1',
    method: 'GET',
    url: '/test',
    get: vi.fn((header) => {
      const headers = {
        'user-agent': 'Test Agent',
        'x-forwarded-for': '127.0.0.1',
        'content-type': 'application/json',
        ...overrides.headers
      };
      return headers[header.toLowerCase()];
    }),
    ...overrides
  });
  
  // Helper for creating payment request objects with all required fields
  global.mockPaymentRequest = (overrides = {}) => global.mockRequest({
    body: {
      orderId: 'test-order-123',
      currency: 'GBP',
      shippingAddress: {
        fullName: 'Test User',
        addressLine1: '123 Test St',
        city: 'Test City',
        stateProvince: 'Test State',
        postalCode: 'TE5T 1NG',
        country: 'GB'
      },
      shippingMethodId: 'standard',
      ...overrides.body
    },
    user: {
      _id: 'test-user-123',
      email: 'test@example.com',
      role: 'customer'
    },
    ...overrides
  });
  
  global.mockResponse = (overrides = {}) => {
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis(),
      cookie: vi.fn().mockReturnThis(),
      clearCookie: vi.fn().mockReturnThis(),
      setHeader: vi.fn().mockReturnThis(),
      getHeader: vi.fn(),
      locals: {},
      ...overrides
    };
    return res;
  };
  
  global.mockNext = vi.fn();
});

// Export utilities
export const getMongoUri = () => mongoUri;
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
  orderNumber: `TEST-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
  status: 'pending',
  paymentStatus: 'pending',
  items: [
    {
      productId: new mongoose.Types.ObjectId(),
      productName: 'Test Product',
      productSlug: 'test-product',
      quantity: 1,
      unitPrice: 199.99,
      totalPrice: 199.99,
      lineTotal: 199.99
    }
  ],
  subtotalAmount: 199.99,
  taxAmount: 0,
  shippingCost: 9.99,
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
  statusHistory: [{
    status: 'pending',
    timestamp: new Date(),
    notes: 'Order created'
  }],
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