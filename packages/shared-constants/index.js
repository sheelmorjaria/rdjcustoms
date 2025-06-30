// Main exports for shared constants
export * from './orderStatus.js';
export * from './paymentMethods.js';
export * from './productConditions.js';

// API Configuration
export const API_ENDPOINTS = {
  PRODUCTS: '/api/products',
  ORDERS: '/api/orders',
  USERS: '/api/users',
  CART: '/api/cart',
  PAYMENTS: '/api/payments',
  SHIPPING: '/api/shipping',
  ADMIN: '/api/admin',
  AUTH: '/api/auth',
  SUPPORT: '/api/support'
};

// Application Constants
export const APP_CONFIG = {
  DEFAULT_PAGE_SIZE: 12,
  MAX_PAGE_SIZE: 100,
  DEFAULT_CURRENCY: 'GBP',
  STORE_NAME: 'RDJCustoms',
  SUPPORT_EMAIL: 'support@rdjcustoms.com'
};

// Validation Constants
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  EMAIL_MAX_LENGTH: 254,
  NAME_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 2000,
  PRODUCT_IMAGES_MAX: 10
};