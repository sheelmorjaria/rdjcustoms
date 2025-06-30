/**
 * Centralized unique field generation for test data
 * Ensures no conflicts across different test scenarios
 */

import mongoose from 'mongoose';

// Counter for ensuring uniqueness within the same millisecond
let counter = 0;

/**
 * Generate a unique identifier
 */
export const generateUniqueId = () => {
  return `${Date.now()}-${Math.floor(Math.random() * 10000)}-${++counter}`;
};

/**
 * Generate unique email address
 */
export const generateUniqueEmail = (prefix = 'test', domain = 'example.com') => {
  return `${prefix}-${generateUniqueId()}@${domain}`;
};

/**
 * Generate unique username
 */
export const generateUniqueUsername = (prefix = 'user') => {
  return `${prefix}-${generateUniqueId()}`;
};

/**
 * Generate unique SKU
 */
export const generateUniqueSku = (prefix = 'TEST') => {
  return `${prefix}-${generateUniqueId().toUpperCase()}`;
};

/**
 * Generate unique slug
 */
export const generateUniqueSlug = (baseName = 'test-item') => {
  return `${baseName}-${generateUniqueId()}`;
};

/**
 * Generate unique order number (max 20 characters)
 */
export const generateUniqueOrderNumber = (prefix = 'ORD') => {
  const shortId = `${Date.now().toString().slice(-8)}-${Math.floor(Math.random() * 999)}`;
  return `${prefix}-${shortId}`;
};

/**
 * Generate unique phone number
 */
export const generateUniquePhoneNumber = (countryCode = '+44') => {
  const number = `${countryCode}${Math.floor(Math.random() * 10000000000)}`;
  return number.substring(0, 15); // Limit to reasonable phone number length
};

/**
 * Generate unique session ID
 */
export const generateUniqueSessionId = (prefix = 'session') => {
  return `${prefix}-${generateUniqueId()}`;
};

/**
 * Generate unique token
 */
export const generateUniqueToken = (length = 32) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < length; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${token}-${Date.now()}`;
};

/**
 * Generate unique MongoDB ObjectId
 */
export const generateUniqueObjectId = () => {
  return new mongoose.Types.ObjectId();
};

/**
 * Generate unique address
 */
export const generateUniqueAddress = () => {
  const streetNumber = Math.floor(Math.random() * 9999) + 1;
  const streetNames = ['Test Street', 'Sample Road', 'Demo Avenue', 'Mock Lane', 'Example Close'];
  const streetName = streetNames[Math.floor(Math.random() * streetNames.length)];
  return `${streetNumber} ${streetName}`;
};

/**
 * Generate unique postcode (UK format)
 */
export const generateUniquePostcode = () => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  
  const area = letters.charAt(Math.floor(Math.random() * letters.length)) + 
               letters.charAt(Math.floor(Math.random() * letters.length));
  const district = Math.floor(Math.random() * 99) + 1;
  const sector = Math.floor(Math.random() * 9) + 1;
  const unit = letters.charAt(Math.floor(Math.random() * letters.length)) + 
              letters.charAt(Math.floor(Math.random() * letters.length));
  
  return `${area}${district} ${sector}${unit}`;
};

/**
 * Generate unique company name
 */
export const generateUniqueCompanyName = () => {
  const adjectives = ['Innovative', 'Dynamic', 'Creative', 'Advanced', 'Premium'];
  const nouns = ['Solutions', 'Technologies', 'Systems', 'Services', 'Enterprises'];
  
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  
  return `${adjective} ${noun} ${generateUniqueId()}`;
};

/**
 * Generate unique price (with reasonable ranges)
 */
export const generateUniquePrice = (min = 1, max = 1000) => {
  const price = Math.random() * (max - min) + min;
  return Math.round(price * 100) / 100; // Round to 2 decimal places
};

/**
 * Generate unique date within a range
 */
export const generateUniqueDate = (daysFromNow = 0, rangeDays = 30) => {
  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() + daysFromNow);
  
  const randomDays = Math.floor(Math.random() * rangeDays);
  baseDate.setDate(baseDate.getDate() + randomDays);
  
  return baseDate;
};

/**
 * Reset counter (useful for test isolation)
 */
export const resetCounter = () => {
  counter = 0;
};

/**
 * Field generators grouped by common usage patterns
 */
export const userFieldGenerators = {
  email: generateUniqueEmail,
  username: generateUniqueUsername,
  phoneNumber: generateUniquePhoneNumber
};

export const productFieldGenerators = {
  sku: generateUniqueSku,
  slug: generateUniqueSlug,
  price: generateUniquePrice
};

export const orderFieldGenerators = {
  orderNumber: generateUniqueOrderNumber,
  date: generateUniqueDate
};

export const addressFieldGenerators = {
  street: generateUniqueAddress,
  postcode: generateUniquePostcode
};

/**
 * Generate all unique fields for a specific model type
 */
export const generateUniqueFieldsFor = (modelType) => {
  const generators = {
    User: {
      email: generateUniqueEmail(),
      username: generateUniqueUsername(),
      phoneNumber: generateUniquePhoneNumber()
    },
    Product: {
      sku: generateUniqueSku(),
      slug: generateUniqueSlug('product'),
      price: generateUniquePrice(10, 1000)
    },
    Order: {
      orderNumber: generateUniqueOrderNumber(),
      createdAt: generateUniqueDate(-30, 60)
    },
    Category: {
      slug: generateUniqueSlug('category')
    },
    Cart: {
      sessionId: generateUniqueSessionId()
    }
  };

  return generators[modelType] || {};
};

export default {
  generateUniqueId,
  generateUniqueEmail,
  generateUniqueUsername,
  generateUniqueSku,
  generateUniqueSlug,
  generateUniqueOrderNumber,
  generateUniquePhoneNumber,
  generateUniqueSessionId,
  generateUniqueToken,
  generateUniqueObjectId,
  generateUniqueAddress,
  generateUniquePostcode,
  generateUniqueCompanyName,
  generateUniquePrice,
  generateUniqueDate,
  resetCounter,
  generateUniqueFieldsFor
};