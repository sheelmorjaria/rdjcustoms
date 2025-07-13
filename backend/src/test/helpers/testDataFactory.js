import mongoose from 'mongoose';
import { 
  generateUniqueId,
  generateUniqueEmail,
  generateUniqueSku as _generateUniqueSku,
  generateUniqueSlug as _generateUniqueSlug,
  generateUniqueOrderNumber as _generateUniqueOrderNumber,
  generateUniquePhoneNumber as _generateUniquePhoneNumber,
  generateUniquePrice as _generateUniquePrice,
  generateUniqueObjectId,
  generateUniqueFieldsFor
} from './uniqueFieldGenerator.js';

/**
 * Factory functions for creating valid test data that conforms to model schemas
 */

export const createValidOrderData = (overrides = {}) => {
  const defaultProductId = generateUniqueObjectId();
  const uniqueFields = generateUniqueFieldsFor('Order');
  
  const defaultOrder = {
    userId: generateUniqueObjectId(),
    customerEmail: generateUniqueEmail('customer'),
    orderNumber: uniqueFields.orderNumber,
    status: 'pending',
    items: [{
      productId: defaultProductId,
      productName: 'Test Product',
      productSlug: 'test-product',
      productImage: '/images/test-product.jpg',
      quantity: 1,
      unitPrice: 99.99,
      totalPrice: 99.99
    }],
    subtotal: 99.99,
    tax: 0,
    shipping: 10,
    totalAmount: 109.99,
    shippingAddress: {
      fullName: 'Test User',
      addressLine1: '123 Test Street',
      addressLine2: '',
      city: 'Test City',
      stateProvince: 'Test State',
      postalCode: '12345',
      country: 'US',
      phoneNumber: '+1234567890'
    },
    billingAddress: {
      fullName: 'Test User',
      addressLine1: '123 Test Street',
      addressLine2: '',
      city: 'Test City',
      stateProvince: 'Test State',
      postalCode: '12345',
      country: 'US',
      phoneNumber: '+1234567890'
    },
    shippingMethod: {
      id: new mongoose.Types.ObjectId(),
      name: 'Standard Shipping',
      cost: 10,
      estimatedDelivery: '3-5 business days'
    },
    paymentMethod: {
      type: 'paypal',
      name: 'PayPal'
    },
    paymentDetails: {
      transactionId: `PAYPAL-${Date.now()}`,
      status: 'pending'
    },
    paymentStatus: 'pending'
  };

  // Simple object spread to avoid ObjectId issues
  return { 
    ...defaultOrder,
    ...overrides,
    // Merge nested objects carefully
    shippingAddress: overrides.shippingAddress ? { ...defaultOrder.shippingAddress, ...overrides.shippingAddress } : defaultOrder.shippingAddress,
    billingAddress: overrides.billingAddress ? { ...defaultOrder.billingAddress, ...overrides.billingAddress } : defaultOrder.billingAddress,
    shippingMethod: overrides.shippingMethod ? { ...defaultOrder.shippingMethod, ...overrides.shippingMethod } : defaultOrder.shippingMethod,
    paymentMethod: overrides.paymentMethod ? { ...defaultOrder.paymentMethod, ...overrides.paymentMethod } : defaultOrder.paymentMethod,
    paymentDetails: overrides.paymentDetails ? { ...defaultOrder.paymentDetails, ...overrides.paymentDetails } : defaultOrder.paymentDetails,
    items: overrides.items || defaultOrder.items
  };
};

export const createValidUserData = (overrides = {}) => {
  const uniqueFields = generateUniqueFieldsFor('User');
  
  const defaultUser = {
    firstName: 'Test',
    lastName: 'User',
    email: uniqueFields.email,
    password: 'Password123!',
    role: 'customer',
    isActive: true,
    emailVerified: true
  };

  return { ...defaultUser, ...overrides };
};

export const createValidProductData = (overrides = {}) => {
  const uniqueFields = generateUniqueFieldsFor('Product');
  
  const defaultProduct = {
    name: 'Test Product',
    slug: uniqueFields.slug,
    description: 'Test product description',
    shortDescription: 'Test short description',
    price: uniqueFields.price,
    images: ['/images/test-product.jpg'],
    category: new mongoose.Types.ObjectId(),
    brand: 'Test Brand',
    sku: uniqueFields.sku,
    stockQuantity: 100,
    stockStatus: 'in_stock',
    condition: 'new',
    isActive: true
  };

  return { ...defaultProduct, ...overrides };
};

export const createValidCategoryData = (overrides = {}) => {
  const uniqueFields = generateUniqueFieldsFor('Category');
  
  const defaultCategory = {
    name: 'Test Category',
    slug: uniqueFields.slug,
    description: 'Test category description',
    isActive: true,
    parentCategory: null,
    sortOrder: 0
  };

  return { ...defaultCategory, ...overrides };
};

export const createValidShippingMethodData = (overrides = {}) => {
  const uniqueId = generateUniqueId();
  
  const defaultShippingMethod = {
    name: 'Test Shipping Method',
    code: `TEST_SHIPPING_${uniqueId}`,
    description: 'Test shipping method description',
    baseCost: 10.00,
    estimatedDeliveryDays: {
      min: 3,
      max: 5
    },
    isActive: true,
    criteria: {
      minOrderValue: 0,
      maxOrderValue: 10000,
      maxWeight: 10000,
      supportedCountries: ['GB', 'US']
    }
  };

  return { ...defaultShippingMethod, ...overrides };
};

export const createValidReturnRequestData = (order, overrides = {}) => {
  const uniqueId = generateUniqueId();
  
  const defaultReturn = {
    orderId: order._id,
    orderNumber: order.orderNumber,
    userId: order.userId,
    customerEmail: order.customerEmail,
    returnRequestNumber: `RET-${uniqueId}`,
    status: 'pending_review',
    items: order.items.map(item => ({
      productId: item.productId,
      productName: item.productName,
      productSlug: item.productSlug,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalRefundAmount: item.totalPrice,
      reason: 'defective_item',
      reasonDescription: 'Product defect'
    })),
    totalRefundAmount: order.totalAmount,
    totalItemsCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
    returnWindow: 30,
    isWithinReturnWindow: true
  };

  return deepMerge(defaultReturn, overrides);
};

// Helper function for deep merging objects
function deepMerge(target, source) {
  const output = { ...target };
  
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key] = deepMerge(target[key], source[key]);
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  
  return output;
}

function isObject(item) {
  return item && typeof item === 'object' && !Array.isArray(item);
}