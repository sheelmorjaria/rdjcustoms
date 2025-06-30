import { body, query, param } from 'express-validator';

export const createPromotionValidator = [
  body('name')
    .notEmpty().withMessage('Promotion name is required')
    .trim()
    .isLength({ min: 3, max: 100 }).withMessage('Name must be between 3 and 100 characters'),
  
  body('code')
    .notEmpty().withMessage('Promotion code is required')
    .trim()
    .isLength({ min: 3, max: 20 }).withMessage('Code must be between 3 and 20 characters')
    .matches(/^[A-Z0-9_]+$/i).withMessage('Code can only contain letters, numbers, and underscores'),
  
  body('type')
    .notEmpty().withMessage('Promotion type is required')
    .isIn(['percentage', 'fixed_amount', 'free_shipping']).withMessage('Invalid promotion type'),
  
  body('value')
    .if(body('type').isIn(['percentage', 'fixed_amount']))
    .notEmpty().withMessage('Value is required for this promotion type')
    .isFloat({ min: 0 }).withMessage('Value must be a positive number')
    .custom((value, { req }) => {
      if (req.body.type === 'percentage' && value > 100) {
        throw new Error('Percentage value cannot exceed 100');
      }
      return true;
    }),
  
  body('minimumOrderSubtotal')
    .optional()
    .isFloat({ min: 0 }).withMessage('Minimum order subtotal must be a positive number'),
  
  body('applicableProducts')
    .optional()
    .isArray().withMessage('Applicable products must be an array')
    .custom((value) => {
      if (value && value.length > 0) {
        return value.every(id => id.match(/^[0-9a-fA-F]{24}$/));
      }
      return true;
    }).withMessage('Invalid product ID format'),
  
  body('applicableCategories')
    .optional()
    .isArray().withMessage('Applicable categories must be an array')
    .custom((value) => {
      if (value && value.length > 0) {
        return value.every(id => id.match(/^[0-9a-fA-F]{24}$/));
      }
      return true;
    }).withMessage('Invalid category ID format'),
  
  body('totalUsageLimit')
    .optional()
    .isInt({ min: 1 }).withMessage('Total usage limit must be a positive integer'),
  
  body('perUserUsageLimit')
    .optional()
    .isInt({ min: 1 }).withMessage('Per user usage limit must be a positive integer'),
  
  body('startDate')
    .notEmpty().withMessage('Start date is required')
    .isISO8601().withMessage('Invalid start date format'),
  
  body('endDate')
    .notEmpty().withMessage('End date is required')
    .isISO8601().withMessage('Invalid end date format')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.startDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
  
  body('status')
    .optional()
    .isIn(['draft', 'active', 'inactive']).withMessage('Invalid status')
];

export const updatePromotionValidator = [
  param('promoId')
    .isMongoId().withMessage('Invalid promotion ID'),
  
  body('name')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 }).withMessage('Name must be between 3 and 100 characters'),
  
  body('code')
    .optional()
    .trim()
    .isLength({ min: 3, max: 20 }).withMessage('Code must be between 3 and 20 characters')
    .matches(/^[A-Z0-9_]+$/i).withMessage('Code can only contain letters, numbers, and underscores'),
  
  body('type')
    .optional()
    .isIn(['percentage', 'fixed_amount', 'free_shipping']).withMessage('Invalid promotion type'),
  
  body('value')
    .optional()
    .isFloat({ min: 0 }).withMessage('Value must be a positive number')
    .custom((value, { req }) => {
      if (req.body.type === 'percentage' && value > 100) {
        throw new Error('Percentage value cannot exceed 100');
      }
      return true;
    }),
  
  body('minimumOrderSubtotal')
    .optional()
    .isFloat({ min: 0 }).withMessage('Minimum order subtotal must be a positive number'),
  
  body('applicableProducts')
    .optional()
    .isArray().withMessage('Applicable products must be an array')
    .custom((value) => {
      if (value && value.length > 0) {
        return value.every(id => id.match(/^[0-9a-fA-F]{24}$/));
      }
      return true;
    }).withMessage('Invalid product ID format'),
  
  body('applicableCategories')
    .optional()
    .isArray().withMessage('Applicable categories must be an array')
    .custom((value) => {
      if (value && value.length > 0) {
        return value.every(id => id.match(/^[0-9a-fA-F]{24}$/));
      }
      return true;
    }).withMessage('Invalid category ID format'),
  
  body('totalUsageLimit')
    .optional()
    .isInt({ min: 1 }).withMessage('Total usage limit must be a positive integer'),
  
  body('perUserUsageLimit')
    .optional()
    .isInt({ min: 1 }).withMessage('Per user usage limit must be a positive integer'),
  
  body('startDate')
    .optional()
    .isISO8601().withMessage('Invalid start date format'),
  
  body('endDate')
    .optional()
    .isISO8601().withMessage('Invalid end date format')
    .custom((value, { req }) => {
      if (req.body.startDate && new Date(value) <= new Date(req.body.startDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
  
  body('status')
    .optional()
    .isIn(['draft', 'active', 'inactive', 'archived']).withMessage('Invalid status')
];

export const updatePromotionStatusValidator = [
  param('promoId')
    .isMongoId().withMessage('Invalid promotion ID'),
  
  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(['draft', 'active', 'inactive', 'archived']).withMessage('Invalid status')
];

export const getPromotionsValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Search term too long'),
  
  query('type')
    .optional()
    .isIn(['percentage', 'fixed_amount', 'free_shipping']).withMessage('Invalid promotion type'),
  
  query('status')
    .optional()
    .isIn(['draft', 'active', 'inactive', 'expired', 'archived']).withMessage('Invalid status'),
  
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'updatedAt', 'name', 'code', 'startDate', 'endDate', 'timesUsed']).withMessage('Invalid sort field'),
  
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc']).withMessage('Invalid sort order')
];

export const checkPromotionCodeValidator = [
  query('code')
    .notEmpty().withMessage('Code is required')
    .trim()
    .isLength({ min: 3, max: 20 }).withMessage('Code must be between 3 and 20 characters'),
  
  query('promoId')
    .optional()
    .isMongoId().withMessage('Invalid promotion ID')
];

export const deletePromotionValidator = [
  param('promoId')
    .isMongoId().withMessage('Invalid promotion ID')
];