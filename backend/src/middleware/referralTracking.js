import { processReferralRegistration } from '../controllers/referralController.js';
import logger from '../utils/logger.js';

// Middleware to detect and store referral codes in cookies/sessions
export const referralTrackingMiddleware = (req, res, next) => {
  try {
    const referralCode = req.query.ref || req.query.referral;
    
    if (referralCode) {
      // Store referral code in cookie for 60 days
      const cookieOptions = {
        maxAge: 60 * 24 * 60 * 60 * 1000, // 60 days in milliseconds
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/'
      };
      
      res.cookie('referralCode', referralCode.toUpperCase(), cookieOptions);
      
      // Also store in session if available
      if (req.session) {
        req.session.referralCode = referralCode.toUpperCase();
      }
      
      logger.info('Referral code detected and stored', {
        referralCode: referralCode.toUpperCase(),
        ip: req.ip,
        userAgent: req.get('user-agent'),
        action: 'referral_code_detected'
      });
    }
    
    next();
  } catch (error) {
    logger.error('Referral tracking middleware error', {
      error: error.message,
      stack: error.stack
    });
    
    // Don't block the request if referral tracking fails
    next();
  }
};

// Middleware to process referral registration after user signup
export const processReferralAfterRegistration = async (req, res, next) => {
  try {
    // This middleware should be called after user registration
    if (req.newUser && req.newUser._id) {
      const referralCode = req.cookies?.referralCode || req.session?.referralCode;
      
      if (referralCode) {
        // Process the referral registration in the background
        setImmediate(async () => {
          try {
            await processReferralRegistration(
              req.newUser._id,
              referralCode,
              req.newUser.email
            );
            
            // Clear the referral code from cookies/session after processing
            res.clearCookie('referralCode');
            if (req.session) {
              delete req.session.referralCode;
            }
            
            logger.info('Referral processed after registration', {
              userId: req.newUser._id,
              referralCode,
              email: req.newUser.email,
              action: 'referral_processed_after_registration'
            });
          } catch (error) {
            logger.error('Failed to process referral after registration', {
              userId: req.newUser._id,
              referralCode,
              error: error.message
            });
          }
        });
      }
    }
    
    next();
  } catch (error) {
    logger.error('Process referral after registration middleware error', {
      error: error.message,
      stack: error.stack
    });
    
    // Don't block the request if referral processing fails
    next();
  }
};

// Utility function to get referral code from request
export const getReferralCodeFromRequest = (req) => {
  return req.cookies?.referralCode || 
         req.session?.referralCode || 
         req.query.ref || 
         req.query.referral;
};

// Middleware to add referral context to requests
export const addReferralContext = (req, res, next) => {
  try {
    const referralCode = getReferralCodeFromRequest(req);
    
    if (referralCode) {
      req.referralContext = {
        code: referralCode.toUpperCase(),
        source: req.query.utm_source || 'direct',
        medium: req.query.utm_medium || 'referral',
        campaign: req.query.utm_campaign || 'friend_referral'
      };
    }
    
    next();
  } catch (error) {
    logger.error('Add referral context middleware error', {
      error: error.message
    });
    
    next();
  }
};