/**
 * Lightweight performance test setup without MongoDB Memory Server
 * Uses mocks to avoid database dependency and speed up tests
 */

import { vi, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
// import mongoose from 'mongoose';

// Setup global test utilities
global.vi = vi;

// Mock MongoDB connection for performance tests
const mockConnection = {
  readyState: 1, // Connected
  collections: {
    users: { deleteMany: vi.fn(), insertMany: vi.fn(), find: vi.fn() },
    products: { deleteMany: vi.fn(), insertMany: vi.fn(), find: vi.fn() },
    orders: { deleteMany: vi.fn(), insertMany: vi.fn(), find: vi.fn() },
    carts: { deleteMany: vi.fn(), insertMany: vi.fn(), find: vi.fn() },
    payments: { deleteMany: vi.fn(), insertMany: vi.fn(), find: vi.fn() }
  }
};

// Mock mongoose for performance testing
vi.mock('mongoose', async () => {
  const actual = await vi.importActual('mongoose');
  return {
    ...actual,
    connect: vi.fn().mockResolvedValue(true),
    disconnect: vi.fn().mockResolvedValue(true),
    connection: mockConnection,
    Types: {
      ObjectId: vi.fn(() => 'mock-object-id')
    }
  };
});

// Setup for performance tests - no database needed
beforeAll(async () => {
  try {
    console.log('Lightweight performance test setup initialized');
  } catch (error) {
    console.error('Failed to setup lightweight performance tests:', error);
    throw error;
  }
}, 5000); // Much shorter timeout

afterAll(async () => {
  try {
    console.log('Lightweight performance test cleanup completed');
  } catch (error) {
    console.error('Error during lightweight performance test cleanup:', error.message);
  }
}, 5000);

beforeEach(async () => {
  // Reset mock call counts
  vi.clearAllMocks();
});

afterEach(() => {
  // Clear all mocks after each test
  vi.clearAllMocks();
});

// Mock all external services with fast responses for performance testing
vi.mock('../../services/bitcoinService.js', () => ({
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

vi.mock('../../services/moneroService.js', () => ({
  default: {
    getExchangeRate: vi.fn().mockResolvedValue({
      rate: 0.008,
      validUntil: new Date(Date.now() + 300000)
    }),
    createPayment: vi.fn().mockResolvedValue({
      address: '4AdUndXHHZ6cfufTMvppY6JwXNouMBzSkbLYfpAV5Usx3skxNgYeYTRJ5AmD5H3F',
      amount: 1.234567890123,
      paymentId: 'globee-payment-id'
    })
  }
}));

vi.mock('../../services/paypalService.js', () => ({
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
    })
  }
}));

vi.mock('../../services/emailService.js', () => ({
  default: {
    sendEmail: vi.fn().mockResolvedValue(true),
    sendOrderConfirmation: vi.fn().mockResolvedValue(true)
  }
}));

// Mock models with fast responses
vi.mock('../../models/Product.js', () => ({
  default: {
    find: vi.fn().mockResolvedValue([]),
    findById: vi.fn().mockResolvedValue(null),
    create: vi.fn().mockResolvedValue({ _id: 'mock-product-id' }),
    updateOne: vi.fn().mockResolvedValue({ nModified: 1 }),
    deleteOne: vi.fn().mockResolvedValue({ deletedCount: 1 }),
    countDocuments: vi.fn().mockResolvedValue(0),
    aggregate: vi.fn().mockResolvedValue([])
  }
}));

vi.mock('../../models/User.js', () => ({
  default: {
    find: vi.fn().mockResolvedValue([]),
    findById: vi.fn().mockResolvedValue(null),
    findOne: vi.fn().mockResolvedValue(null),
    create: vi.fn().mockResolvedValue({ _id: 'mock-user-id' }),
    updateOne: vi.fn().mockResolvedValue({ nModified: 1 }),
    deleteOne: vi.fn().mockResolvedValue({ deletedCount: 1 })
  }
}));

vi.mock('../../models/Order.js', () => ({
  default: {
    find: vi.fn().mockResolvedValue([]),
    findById: vi.fn().mockResolvedValue(null),
    create: vi.fn().mockResolvedValue({ _id: 'mock-order-id' }),
    updateOne: vi.fn().mockResolvedValue({ nModified: 1 }),
    deleteOne: vi.fn().mockResolvedValue({ deletedCount: 1 }),
    populate: vi.fn().mockReturnThis(),
    sort: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis()
  }
}));

// Mock logger with minimal overhead
vi.mock('../../utils/logger.js', () => ({
  default: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn()
  },
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn()
  }
}));

// Export utilities for performance tests
export const getMongoUri = () => 'mock://mongodb-uri';
export const getMongoServer = () => null;

// Fast test data factories
export const createTestUsers = (count = 100) => {
  return Array.from({ length: count }, (_, i) => ({
    _id: `mock-user-id-${i}`,
    email: `perf.user${i}@example.com`,
    firstName: `Perf${i}`,
    lastName: 'User',
    isActive: true,
    role: 'customer'
  }));
};

export const createTestProducts = (count = 50) => {
  return Array.from({ length: count }, (_, i) => ({
    _id: `mock-product-id-${i}`,
    name: `Performance Test Product ${i}`,
    slug: `perf-test-product-${i}`,
    sku: `PERF-PROD-${i}`,
    price: Math.floor(Math.random() * 1000) + 100,
    description: `Performance test product ${i}`,
    condition: 'new',
    inStock: true,
    stockStatus: 'in_stock',
    status: 'active'
  }));
};

export const createTestOrders = (count = 25) => {
  return Array.from({ length: count }, (_, i) => ({
    _id: `mock-order-id-${i}`,
    userId: `mock-user-id-${i % 10}`,
    customerEmail: `perf.user${i}@example.com`,
    status: 'pending',
    paymentStatus: 'pending',
    totalAmount: Math.floor(Math.random() * 1500) + 159.99,
    items: [
      {
        productId: `mock-product-id-${i % 20}`,
        productName: `Performance Test Product ${i}`,
        quantity: Math.floor(Math.random() * 3) + 1,
        unitPrice: Math.floor(Math.random() * 500) + 50
      }
    ]
  }));
};

// Fast performance measurement utilities
export const measureExecutionTime = async (fn, _label = 'Operation') => {
  const start = process.hrtime.bigint();
  const result = await fn();
  const end = process.hrtime.bigint();
  const duration = Number(end - start) / 1000000; // Convert to milliseconds
  
  return { result, duration };
};

export const measureMemoryUsage = (_label = 'Memory') => {
  const usage = process.memoryUsage();
  return {
    rss: Math.round(usage.rss / 1024 / 1024),
    heapTotal: Math.round(usage.heapTotal / 1024 / 1024),
    heapUsed: Math.round(usage.heapUsed / 1024 / 1024),
    external: Math.round(usage.external / 1024 / 1024)
  };
};

// Mock database operations for performance testing
export const mockDatabaseOperations = {
  fastInsert: vi.fn().mockImplementation(async (collection, data) => {
    // Simulate fast database insert
    return { insertedId: `mock-${collection}-id`, insertedCount: Array.isArray(data) ? data.length : 1 };
  }),
  
  fastFind: vi.fn().mockImplementation(async (collection, _query = {}) => {
    // Simulate fast database find
    return [];
  }),
  
  fastUpdate: vi.fn().mockImplementation(async (_collection, _query, _update) => {
    // Simulate fast database update
    return { modifiedCount: 1, matchedCount: 1 };
  }),
  
  fastDelete: vi.fn().mockImplementation(async (_collection, _query) => {
    // Simulate fast database delete
    return { deletedCount: 1 };
  })
};