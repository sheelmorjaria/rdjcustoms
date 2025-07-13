import express from 'express';
import { 
  trackReferralClick,
  validateReferralCode,
  getReferralProgramSettings
} from '../controllers/referralController.js';
import { param, body } from 'express-validator';
import { validate } from '../middleware/validation.js';

const router = express.Router();

// Validation middleware
const _validateReferralCodeMiddleware = [
  param('referralCode')
    .isAlphanumeric()
    .isLength({ min: 8, max: 20 })
    .withMessage('Invalid referral code format'),
  validate
];

const validateReferralCodeParam = [
  param('code')
    .isAlphanumeric()
    .isLength({ min: 8, max: 20 })
    .withMessage('Invalid referral code format'),
  validate
];

const validateTrackClick = [
  param('referralCode')
    .isAlphanumeric()
    .isLength({ min: 8, max: 20 })
    .withMessage('Invalid referral code format'),
  body('source')
    .optional()
    .isIn(['direct', 'email', 'social_facebook', 'social_twitter', 'social_whatsapp', 'other'])
    .withMessage('Invalid referral source'),
  validate
];

// Public routes (no authentication required)

// GET /api/referral/validate/:code - Validate referral code
router.get('/validate/:code', validateReferralCodeParam, validateReferralCode);

// POST /api/referral/track/:referralCode - Track referral click
router.post('/track/:referralCode', validateTrackClick, trackReferralClick);

// GET /api/referral/program-settings - Get referral program settings
router.get('/program-settings', getReferralProgramSettings);

export default router;