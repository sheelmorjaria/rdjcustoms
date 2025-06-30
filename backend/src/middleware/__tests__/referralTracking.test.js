import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  referralTrackingMiddleware,
  processReferralAfterRegistration,
  getReferralCodeFromRequest,
  addReferralContext
} from '../referralTracking.js';

// Mock the referral controller
vi.mock('../../controllers/referralController.js', () => ({
  processReferralRegistration: vi.fn()
}));

// Mock logger
vi.mock('../../utils/logger.js', () => ({
  default: {
    info: vi.fn(),
    error: vi.fn()
  }
}));

describe('Referral Tracking Middleware Tests', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      query: {},
      ip: '127.0.0.1',
      headers: {},
      cookies: {},
      session: null
    };
    res = {
      cookie: vi.fn(),
      clearCookie: vi.fn()
    };
    next = vi.fn();

    // Mock user-agent header
    req.get = vi.fn((header) => {
      if (header === 'user-agent') return 'Test Browser';
      return null;
    });

    // Clear all mocks
    vi.clearAllMocks();

    // Reset NODE_ENV
    process.env.NODE_ENV = 'test';
  });

  describe('referralTrackingMiddleware', () => {
    it('should store referral code from query parameter "ref"', () => {
      req.query.ref = 'TESTREF123';

      referralTrackingMiddleware(req, res, next);

      expect(res.cookie).toHaveBeenCalledWith(
        'referralCode',
        'TESTREF123',
        expect.objectContaining({
          maxAge: 60 * 24 * 60 * 60 * 1000, // 60 days
          httpOnly: true,
          secure: false, // test environment
          sameSite: 'lax',
          path: '/'
        })
      );
      expect(next).toHaveBeenCalled();
    });

    it('should store referral code from query parameter "referral"', () => {
      req.query.referral = 'testref456';

      referralTrackingMiddleware(req, res, next);

      expect(res.cookie).toHaveBeenCalledWith(
        'referralCode',
        'TESTREF456', // Should be uppercase
        expect.any(Object)
      );
      expect(next).toHaveBeenCalled();
    });

    it('should convert referral code to uppercase', () => {
      req.query.ref = 'lowercase123';

      referralTrackingMiddleware(req, res, next);

      expect(res.cookie).toHaveBeenCalledWith(
        'referralCode',
        'LOWERCASE123',
        expect.any(Object)
      );
    });

    it('should store referral code in session if available', () => {
      req.query.ref = 'SESSIONTEST';
      req.session = {};

      referralTrackingMiddleware(req, res, next);

      expect(req.session.referralCode).toBe('SESSIONTEST');
      expect(next).toHaveBeenCalled();
    });

    it('should set secure cookie in production', () => {
      process.env.NODE_ENV = 'production';
      req.query.ref = 'PRODTEST';

      referralTrackingMiddleware(req, res, next);

      expect(res.cookie).toHaveBeenCalledWith(
        'referralCode',
        'PRODTEST',
        expect.objectContaining({
          secure: true
        })
      );
    });

    it('should continue without referral code if none provided', () => {
      referralTrackingMiddleware(req, res, next);

      expect(res.cookie).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
    });

    it('should handle errors gracefully', () => {
      req.query.ref = 'ERRORTEST';
      // Make res.cookie throw an error
      res.cookie.mockImplementation(() => {
        throw new Error('Cookie error');
      });

      referralTrackingMiddleware(req, res, next);

      // Should still call next despite error
      expect(next).toHaveBeenCalled();
    });

    it('should prefer "ref" over "referral" when both present', () => {
      req.query.ref = 'PREFERRED';
      req.query.referral = 'NOTUSED';

      referralTrackingMiddleware(req, res, next);

      expect(res.cookie).toHaveBeenCalledWith(
        'referralCode',
        'PREFERRED',
        expect.any(Object)
      );
    });
  });

  describe('processReferralAfterRegistration', () => {
    let mockProcessReferralRegistration;

    beforeEach(async () => {
      const { processReferralRegistration } = await import('../../controllers/referralController.js');
      mockProcessReferralRegistration = processReferralRegistration;
    });

    it('should process referral after user registration with cookie', async () => {
      req.newUser = {
        _id: 'user123',
        email: 'newuser@test.com'
      };
      req.cookies = {
        referralCode: 'COOKIEREF123'
      };

      await processReferralAfterRegistration(req, res, next);

      // Wait for setImmediate
      await new Promise(resolve => setImmediate(resolve));

      expect(mockProcessReferralRegistration).toHaveBeenCalledWith(
        'user123',
        'COOKIEREF123',
        'newuser@test.com'
      );
      expect(res.clearCookie).toHaveBeenCalledWith('referralCode');
      expect(next).toHaveBeenCalled();
    });

    it('should process referral after user registration with session', async () => {
      req.newUser = {
        _id: 'user456',
        email: 'sessionuser@test.com'
      };
      req.session = {
        referralCode: 'SESSIONREF456'
      };

      await processReferralAfterRegistration(req, res, next);

      // Wait for setImmediate
      await new Promise(resolve => setImmediate(resolve));

      expect(mockProcessReferralRegistration).toHaveBeenCalledWith(
        'user456',
        'SESSIONREF456',
        'sessionuser@test.com'
      );
      expect(next).toHaveBeenCalled();
    });

    it('should not process if no new user', async () => {
      req.cookies = {
        referralCode: 'NOUSER123'
      };

      await processReferralAfterRegistration(req, res, next);

      expect(mockProcessReferralRegistration).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
    });

    it('should not process if no referral code', async () => {
      req.newUser = {
        _id: 'user789',
        email: 'noref@test.com'
      };

      await processReferralAfterRegistration(req, res, next);

      expect(mockProcessReferralRegistration).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
    });

    it('should handle processing errors gracefully', async () => {
      req.newUser = {
        _id: 'erroruser',
        email: 'error@test.com'
      };
      req.cookies = {
        referralCode: 'ERRORREF'
      };

      // Make processReferralRegistration throw an error
      mockProcessReferralRegistration.mockRejectedValue(new Error('Processing failed'));

      await processReferralAfterRegistration(req, res, next);

      // Should still call next
      expect(next).toHaveBeenCalled();
    });

    it('should clear session referral code after processing', async () => {
      req.newUser = {
        _id: 'user999',
        email: 'clear@test.com'
      };
      req.session = {
        referralCode: 'CLEARME',
        otherData: 'keep'
      };

      await processReferralAfterRegistration(req, res, next);

      // Wait for setImmediate
      await new Promise(resolve => setImmediate(resolve));

      expect(req.session.referralCode).toBeUndefined();
      expect(req.session.otherData).toBe('keep');
    });
  });

  describe('getReferralCodeFromRequest', () => {
    it('should get referral code from cookies first', () => {
      req.cookies = { referralCode: 'COOKIECODE' };
      req.session = { referralCode: 'SESSIONCODE' };
      req.query = { ref: 'QUERYCODE' };

      const result = getReferralCodeFromRequest(req);

      expect(result).toBe('COOKIECODE');
    });

    it('should get referral code from session if no cookie', () => {
      req.session = { referralCode: 'SESSIONCODE' };
      req.query = { ref: 'QUERYCODE' };

      const result = getReferralCodeFromRequest(req);

      expect(result).toBe('SESSIONCODE');
    });

    it('should get referral code from query "ref" if no cookie or session', () => {
      req.query = { ref: 'QUERYREF' };

      const result = getReferralCodeFromRequest(req);

      expect(result).toBe('QUERYREF');
    });

    it('should get referral code from query "referral" if no other sources', () => {
      req.query = { referral: 'QUERYREFERRAL' };

      const result = getReferralCodeFromRequest(req);

      expect(result).toBe('QUERYREFERRAL');
    });

    it('should return undefined if no referral code found', () => {
      const result = getReferralCodeFromRequest(req);

      expect(result).toBeUndefined();
    });

    it('should handle missing cookies/session gracefully', () => {
      req.cookies = null;
      req.session = null;
      req.query = { ref: 'ONLYQUERY' };

      const result = getReferralCodeFromRequest(req);

      expect(result).toBe('ONLYQUERY');
    });
  });

  describe('addReferralContext', () => {
    it('should add referral context when referral code exists', () => {
      req.cookies = { referralCode: 'CONTEXTTEST' };
      req.query = {
        utm_source: 'facebook',
        utm_medium: 'social',
        utm_campaign: 'spring_referral'
      };

      addReferralContext(req, res, next);

      expect(req.referralContext).toEqual({
        code: 'CONTEXTTEST',
        source: 'facebook',
        medium: 'social',
        campaign: 'spring_referral'
      });
      expect(next).toHaveBeenCalled();
    });

    it('should use default UTM values if not provided', () => {
      req.query = { ref: 'DEFAULTUTM' };

      addReferralContext(req, res, next);

      expect(req.referralContext).toEqual({
        code: 'DEFAULTUTM',
        source: 'direct',
        medium: 'referral',
        campaign: 'friend_referral'
      });
    });

    it('should convert referral code to uppercase in context', () => {
      req.query = { ref: 'lowercase' };

      addReferralContext(req, res, next);

      expect(req.referralContext.code).toBe('LOWERCASE');
    });

    it('should not add context if no referral code', () => {
      addReferralContext(req, res, next);

      expect(req.referralContext).toBeUndefined();
      expect(next).toHaveBeenCalled();
    });

    it('should handle errors gracefully', () => {
      req.cookies = { referralCode: 'ERRORTEST' };
      // Make getReferralCodeFromRequest indirectly cause an error
      req.cookies = { get referralCode() { throw new Error('Cookie access error'); } };

      addReferralContext(req, res, next);

      // Should still call next despite error
      expect(next).toHaveBeenCalled();
    });

    it('should handle partial UTM parameters', () => {
      req.query = { 
        ref: 'PARTIALUTM',
        utm_source: 'twitter'
        // utm_medium and utm_campaign missing
      };

      addReferralContext(req, res, next);

      expect(req.referralContext).toEqual({
        code: 'PARTIALUTM',
        source: 'twitter',
        medium: 'referral', // default
        campaign: 'friend_referral' // default
      });
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle complete referral tracking flow', () => {
      // 1. Initial page visit with referral code
      req.query.ref = 'FULLFLOW123';
      req.query.utm_source = 'email';

      referralTrackingMiddleware(req, res, next);

      expect(res.cookie).toHaveBeenCalledWith(
        'referralCode',
        'FULLFLOW123',
        expect.any(Object)
      );

      // 2. Add context on subsequent requests
      req.cookies = { referralCode: 'FULLFLOW123' };
      req.query = { utm_source: 'email' };

      addReferralContext(req, res, next);

      expect(req.referralContext).toEqual({
        code: 'FULLFLOW123',
        source: 'email',
        medium: 'referral',
        campaign: 'friend_referral'
      });
    });

    it('should handle multiple referral codes prioritizing most recent', () => {
      // Existing cookie
      req.cookies = { referralCode: 'OLDREF' };
      
      // New referral code in query
      req.query.ref = 'NEWREF';

      referralTrackingMiddleware(req, res, next);

      // Should update with new referral code
      expect(res.cookie).toHaveBeenCalledWith(
        'referralCode',
        'NEWREF',
        expect.any(Object)
      );
    });

    it('should maintain referral context across different middleware calls', () => {
      // Set up referral tracking
      req.query.ref = 'PERSISTENT';
      referralTrackingMiddleware(req, res, next);

      // Clear query but keep cookie
      req.query = {};
      req.cookies = { referralCode: 'PERSISTENT' };

      // Should still add context
      addReferralContext(req, res, next);

      expect(req.referralContext).toBeDefined();
      expect(req.referralContext.code).toBe('PERSISTENT');
    });
  });
});