import { body, param, query } from 'express-validator';

export const createAddressValidator = [
  body('fullName')
    .notEmpty().withMessage('Full name is required')
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Full name must be between 2 and 100 characters'),
  
  body('company')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Company name cannot exceed 100 characters'),
  
  body('addressLine1')
    .notEmpty().withMessage('Address line 1 is required')
    .trim()
    .isLength({ min: 5, max: 100 }).withMessage('Address line 1 must be between 5 and 100 characters'),
  
  body('addressLine2')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Address line 2 cannot exceed 100 characters'),
  
  body('city')
    .notEmpty().withMessage('City is required')
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('City must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s\-'\.]+$/).withMessage('City contains invalid characters'),
  
  body('stateProvince')
    .notEmpty().withMessage('State/Province is required')
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('State/Province must be between 2 and 50 characters'),
  
  body('postalCode')
    .notEmpty().withMessage('Postal code is required')
    .trim()
    .isLength({ min: 3, max: 20 }).withMessage('Postal code must be between 3 and 20 characters')
    .matches(/^[A-Za-z0-9\s\-]+$/).withMessage('Invalid postal code format'),
  
  body('country')
    .notEmpty().withMessage('Country is required')
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('Country must be between 2 and 50 characters')
    .isIn([
      'United Kingdom', 'United States', 'Canada', 'Australia', 'Germany', 
      'France', 'Italy', 'Spain', 'Netherlands', 'Belgium', 'Sweden', 
      'Norway', 'Denmark', 'Ireland', 'New Zealand', 'Switzerland'
    ]).withMessage('Country not supported for shipping'),
  
  body('phoneNumber')
    .optional()
    .trim()
    .isLength({ max: 20 }).withMessage('Phone number cannot exceed 20 characters')
    .matches(/^[\+]?[1-9][\d\s\-\(\)]{0,20}$/).withMessage('Invalid phone number format'),
  
  body('setAsDefaultShipping')
    .optional()
    .isBoolean().withMessage('setAsDefaultShipping must be a boolean'),
  
  body('setAsDefaultBilling')
    .optional()
    .isBoolean().withMessage('setAsDefaultBilling must be a boolean')
];

export const updateAddressValidator = [
  param('addressId')
    .isMongoId().withMessage('Invalid address ID'),
  
  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Full name must be between 2 and 100 characters'),
  
  body('company')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Company name cannot exceed 100 characters'),
  
  body('addressLine1')
    .optional()
    .trim()
    .isLength({ min: 5, max: 100 }).withMessage('Address line 1 must be between 5 and 100 characters'),
  
  body('addressLine2')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Address line 2 cannot exceed 100 characters'),
  
  body('city')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('City must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s\-'\.]+$/).withMessage('City contains invalid characters'),
  
  body('stateProvince')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('State/Province must be between 2 and 50 characters'),
  
  body('postalCode')
    .optional()
    .trim()
    .isLength({ min: 3, max: 20 }).withMessage('Postal code must be between 3 and 20 characters')
    .matches(/^[A-Za-z0-9\s\-]+$/).withMessage('Invalid postal code format'),
  
  body('country')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('Country must be between 2 and 50 characters')
    .isIn([
      'United Kingdom', 'United States', 'Canada', 'Australia', 'Germany', 
      'France', 'Italy', 'Spain', 'Netherlands', 'Belgium', 'Sweden', 
      'Norway', 'Denmark', 'Ireland', 'New Zealand', 'Switzerland'
    ]).withMessage('Country not supported for shipping'),
  
  body('phoneNumber')
    .optional()
    .trim()
    .isLength({ max: 20 }).withMessage('Phone number cannot exceed 20 characters')
    .matches(/^[\+]?[1-9][\d\s\-\(\)]{0,20}$/).withMessage('Invalid phone number format'),
  
  body('setAsDefaultShipping')
    .optional()
    .isBoolean().withMessage('setAsDefaultShipping must be a boolean'),
  
  body('setAsDefaultBilling')
    .optional()
    .isBoolean().withMessage('setAsDefaultBilling must be a boolean')
];

export const deleteAddressValidator = [
  param('addressId')
    .isMongoId().withMessage('Invalid address ID')
];

export const setDefaultAddressValidator = [
  param('addressId')
    .isMongoId().withMessage('Invalid address ID'),
  
  body('type')
    .notEmpty().withMessage('Address type is required')
    .isIn(['shipping', 'billing']).withMessage('Address type must be either "shipping" or "billing"')
];

export const getAddressValidator = [
  param('addressId')
    .optional()
    .isMongoId().withMessage('Invalid address ID')
];

// Utility function to validate postal code based on country
export const validatePostalCodeByCountry = (postalCode, country) => {
  const patterns = {
    'United Kingdom': /^[A-Z]{1,2}[0-9][A-Z0-9]?\s?[0-9][A-Z]{2}$/i,
    'United States': /^\d{5}(-\d{4})?$/,
    'Canada': /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/i,
    'Germany': /^\d{5}$/,
    'France': /^\d{5}$/,
    'Netherlands': /^\d{4}\s?[A-Z]{2}$/i,
    'Australia': /^\d{4}$/,
    'Switzerland': /^\d{4}$/,
    'Sweden': /^\d{3}\s?\d{2}$/,
    'Norway': /^\d{4}$/,
    'Denmark': /^\d{4}$/
  };
  
  const pattern = patterns[country];
  return pattern ? pattern.test(postalCode) : true; // Default to true for unsupported countries
};

// Custom validator for conditional required fields
export const conditionalValidation = (field, condition) => {
  return body(field).custom((value, { req }) => {
    if (condition(req.body) && !value) {
      throw new Error(`${field} is required when ${condition.name}`);
    }
    return true;
  });
};