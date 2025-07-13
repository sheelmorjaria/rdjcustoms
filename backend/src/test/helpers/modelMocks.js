/**
 * Enhanced model mocking system for integration tests
 * Provides realistic Mongoose document behavior for testing
 */

import { vi } from 'vitest';
import mongoose from 'mongoose';

/**
 * Create a mock Mongoose document that behaves like a real document
 */
export const createMockDocument = (data = {}, modelName = 'MockModel') => {
  const docData = {
    _id: new mongoose.Types.ObjectId(),
    ...data
  };

  // Create a mock document with Mongoose-like behavior
  const mockDoc = {
    ...docData,
    
    // Mongoose document methods (will be set after object creation)
    save: vi.fn(),
    remove: vi.fn(),
    deleteOne: vi.fn().mockResolvedValue({ deletedCount: 1 }),
    updateOne: vi.fn().mockResolvedValue({ modifiedCount: 1 }),
    populate: vi.fn(),
    toJSON: vi.fn().mockReturnValue(docData),
    toObject: vi.fn().mockReturnValue(docData),
    
    // Validation methods
    validate: vi.fn().mockResolvedValue(true),
    validateSync: vi.fn().mockReturnValue(null),
    
    // State methods
    isNew: false,
    isModified: vi.fn().mockReturnValue(false),
    isSelected: vi.fn().mockReturnValue(true),
    
    // Schema properties
    $isDefault: vi.fn().mockReturnValue(false),
    $isEmpty: vi.fn().mockReturnValue(false),
    
    // Collection name
    constructor: {
      modelName,
      collection: { collectionName: modelName.toLowerCase() + 's' }
    }
  };

  // Add getter/setter behavior for document properties
  Object.keys(docData).forEach(key => {
    Object.defineProperty(mockDoc, key, {
      get: () => docData[key],
      set: (value) => {
        docData[key] = value;
        return value;
      },
      enumerable: true,
      configurable: true
    });
  });

  // Set up circular references after object creation
  mockDoc.save.mockResolvedValue(mockDoc);
  mockDoc.remove.mockResolvedValue(mockDoc);
  mockDoc.populate.mockResolvedValue(mockDoc);

  return mockDoc;
};

/**
 * Create a mock Mongoose model with realistic behavior
 */
export const createMockModel = (modelName, defaultData = {}) => {
  const mockModel = vi.fn().mockImplementation((data = {}) => {
    return createMockDocument({ ...defaultData, ...data }, modelName);
  });

  // Static methods
  mockModel.find = vi.fn().mockImplementation((_query = {}) => {
    const mockQuery = createMockQuery([]);
    return mockQuery;
  });

  mockModel.findOne = vi.fn().mockImplementation((_query = {}) => {
    const mockQuery = createMockQuery(null);
    return mockQuery;
  });

  mockModel.findById = vi.fn().mockImplementation((_id) => {
    const mockQuery = createMockQuery(null);
    return mockQuery;
  });

  mockModel.findByIdAndUpdate = vi.fn().mockImplementation((_id, update, _options = {}) => {
    const mockQuery = createMockQuery(null);
    return mockQuery;
  });

  mockModel.findOneAndUpdate = vi.fn().mockImplementation((query, update, _options = {}) => {
    const mockQuery = createMockQuery(null);
    return mockQuery;
  });

  mockModel.create = vi.fn().mockImplementation((data) => {
    if (Array.isArray(data)) {
      return Promise.resolve(data.map(item => createMockDocument(item, modelName)));
    }
    return Promise.resolve(createMockDocument(data, modelName));
  });

  mockModel.insertMany = vi.fn().mockImplementation((docs) => {
    return Promise.resolve(docs.map(doc => createMockDocument(doc, modelName)));
  });

  mockModel.updateOne = vi.fn().mockResolvedValue({ modifiedCount: 1 });
  mockModel.updateMany = vi.fn().mockResolvedValue({ modifiedCount: 1 });
  mockModel.deleteOne = vi.fn().mockResolvedValue({ deletedCount: 1 });
  mockModel.deleteMany = vi.fn().mockResolvedValue({ deletedCount: 1 });
  mockModel.countDocuments = vi.fn().mockResolvedValue(0);
  mockModel.estimatedDocumentCount = vi.fn().mockResolvedValue(0);

  // Aggregation
  mockModel.aggregate = vi.fn().mockReturnValue(createMockAggregate([]));

  // Model properties
  mockModel.modelName = modelName;
  mockModel.collection = { 
    collectionName: modelName.toLowerCase() + 's',
    indexes: vi.fn().mockResolvedValue([])
  };

  return mockModel;
};

/**
 * Create a mock Mongoose query with chainable methods
 */
export const createMockQuery = (defaultResult) => {
  const mockQuery = {
    // Execution methods
    exec: vi.fn().mockResolvedValue(defaultResult),
    then: vi.fn().mockImplementation((resolve) => {
      return Promise.resolve(defaultResult).then(resolve);
    }),
    catch: vi.fn().mockImplementation((reject) => {
      return Promise.resolve(defaultResult).catch(reject);
    }),

    // Query building methods (chainable)
    where: vi.fn().mockReturnThis(),
    equals: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    populate: vi.fn().mockReturnThis(),
    sort: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    skip: vi.fn().mockReturnThis(),
    lean: vi.fn().mockReturnThis(),
    distinct: vi.fn().mockReturnThis(),

    // Comparison operators
    gt: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lt: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    nin: vi.fn().mockReturnThis(),
    ne: vi.fn().mockReturnThis(),
    regex: vi.fn().mockReturnThis(),

    // Logical operators
    and: vi.fn().mockReturnThis(),
    or: vi.fn().mockReturnThis(),
    nor: vi.fn().mockReturnThis(),

    // Update methods
    set: vi.fn().mockReturnThis(),
    unset: vi.fn().mockReturnThis(),
    inc: vi.fn().mockReturnThis(),
    
    // Result modification
    setOptions: vi.fn().mockReturnThis(),
    getOptions: vi.fn().mockReturnValue({}),
    getQuery: vi.fn().mockReturnValue({}),
    getUpdate: vi.fn().mockReturnValue({})
  };

  // Make the query thenable (Promise-like)
  Object.defineProperty(mockQuery, Symbol.toStringTag, {
    value: 'Promise',
    configurable: true
  });

  return mockQuery;
};

/**
 * Create a mock aggregation pipeline
 */
export const createMockAggregate = (defaultResult) => {
  const mockAggregate = {
    exec: vi.fn().mockResolvedValue(defaultResult),
    then: vi.fn().mockImplementation((resolve) => {
      return Promise.resolve(defaultResult).then(resolve);
    }),
    catch: vi.fn().mockImplementation((reject) => {
      return Promise.resolve(defaultResult).catch(reject);
    }),

    // Aggregation stages (chainable)
    match: vi.fn().mockReturnThis(),
    group: vi.fn().mockReturnThis(),
    sort: vi.fn().mockReturnThis(),
    project: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    skip: vi.fn().mockReturnThis(),
    unwind: vi.fn().mockReturnThis(),
    lookup: vi.fn().mockReturnThis(),
    addFields: vi.fn().mockReturnThis(),
    replaceRoot: vi.fn().mockReturnThis(),
    facet: vi.fn().mockReturnThis(),
    bucket: vi.fn().mockReturnThis(),
    sample: vi.fn().mockReturnThis(),

    // Pipeline methods
    pipeline: vi.fn().mockReturnValue([]),
    append: vi.fn().mockReturnThis(),
    prepend: vi.fn().mockReturnThis()
  };

  return mockAggregate;
};

/**
 * Helper to set up model mocks with specific behavior
 */
export const setupModelMock = (ModelClass, modelName, customBehavior = {}) => {
  const mockModel = createMockModel(modelName);
  
  // Apply custom behavior
  Object.keys(customBehavior).forEach(method => {
    if (typeof customBehavior[method] === 'function') {
      mockModel[method] = customBehavior[method];
    }
  });

  // Replace the actual model with our mock
  vi.mocked(ModelClass).mockImplementation(mockModel);
  Object.assign(ModelClass, mockModel);
  
  return mockModel;
};

/**
 * Create realistic test data that mimics Mongoose document structure
 */
export const createRealisticTestData = (modelName, overrides = {}) => {
  const baseData = {
    _id: new mongoose.Types.ObjectId(),
    createdAt: new Date(),
    updatedAt: new Date(),
    __v: 0
  };

  // Model-specific default data
  const modelDefaults = {
    User: {
      email: `test-${Date.now()}@example.com`,
      firstName: 'Test',
      lastName: 'User',
      role: 'customer',
      isActive: true,
      emailVerified: true
    },
    Product: {
      name: `Test Product ${Date.now()}`,
      slug: `test-product-${Date.now()}`,
      sku: `TEST-${Date.now()}`,
      price: 99.99,
      condition: 'new',
      stockStatus: 'in_stock',
      stockQuantity: 10,
      isActive: true,
      status: 'active'
    },
    Cart: {
      userId: new mongoose.Types.ObjectId(),
      sessionId: `session-${Date.now()}`,
      items: [],
      totalItems: 0,
      totalAmount: 0
    },
    Order: {
      userId: new mongoose.Types.ObjectId(),
      orderNumber: `ORD-${Date.now()}`,
      status: 'pending',
      items: [],
      subtotal: 0,
      tax: 0,
      shipping: 0,
      totalAmount: 0
    },
    Category: {
      name: `Test Category ${Date.now()}`,
      slug: `test-category-${Date.now()}`,
      description: 'Test category description',
      isActive: true
    }
  };

  return {
    ...baseData,
    ...(modelDefaults[modelName] || {}),
    ...overrides
  };
};

/**
 * Helper to reset all mocks
 */
export const resetAllModelMocks = () => {
  vi.clearAllMocks();
};

export default {
  createMockDocument,
  createMockModel,
  createMockQuery,
  createMockAggregate,
  setupModelMock,
  createRealisticTestData,
  resetAllModelMocks
};