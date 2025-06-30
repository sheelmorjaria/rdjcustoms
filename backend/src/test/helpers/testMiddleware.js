/**
 * Common middleware setup for integration tests
 * Provides mock implementations for common middleware like cookies, sessions, etc.
 */

import { vi } from 'vitest';
import jwt from 'jsonwebtoken';
import express from 'express';

/**
 * Mock cookie parser middleware
 */
export const mockCookieParser = () => {
  return (req, res, next) => {
    // Set up basic cookies object
    req.cookies = {
      cartSessionId: `test-session-${Date.now()}`,
      ...req.cookies
    };
    
    // Mock response cookie methods
    res.cookie = vi.fn().mockReturnThis();
    res.clearCookie = vi.fn().mockReturnThis();
    
    next();
  };
};

/**
 * Mock session middleware
 */
export const mockSession = () => {
  return (req, res, next) => {
    req.session = {
      id: `sess_${Date.now()}`,
      cartSessionId: req.cookies?.cartSessionId || `test-session-${Date.now()}`,
      save: vi.fn((callback) => callback && callback()),
      destroy: vi.fn((callback) => callback && callback()),
      reload: vi.fn((callback) => callback && callback()),
      regenerate: vi.fn((callback) => callback && callback()),
      ...req.session
    };
    
    next();
  };
};

/**
 * Mock authentication middleware for testing
 */
export const mockAuth = () => {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        req.user = decoded;
        req.token = token;
      } catch (error) {
        // Invalid token - continue without user
      }
    }
    
    next();
  };
};

/**
 * Mock admin authentication middleware
 */
export const mockAdminAuth = (adminUser = null) => {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Access denied. No token provided.'
      });
    }
    
    const token = authHeader.substring(7);
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      
      // Use provided admin user or create default
      req.user = adminUser || {
        _id: decoded.userId,
        email: decoded.email,
        role: 'admin',
        firstName: 'Test',
        lastName: 'Admin',
        isActive: true
      };
      req.token = token;
      
      // Check admin role
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'Insufficient permissions.'
        });
      }
      
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }
  };
};

/**
 * Mock optional authentication middleware
 */
export const mockOptionalAuth = () => {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        req.user = decoded;
        req.token = token;
      } catch (error) {
        // Continue without user if token is invalid
      }
    }
    
    next();
  };
};

/**
 * Create a complete test app with all common middleware
 */
export const createTestApp = (additionalMiddleware = []) => {
  const app = express();
  
  // Basic middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  // Test-specific middleware
  app.use(mockCookieParser());
  app.use(mockSession());
  
  // Additional middleware
  additionalMiddleware.forEach(middleware => {
    app.use(middleware);
  });
  
  return app;
};

/**
 * Generate test JWT token
 */
export const generateTestToken = (userData = {}) => {
  const defaultUser = {
    userId: 'test-user-id',
    email: 'test@example.com',
    role: 'customer',
    ...userData
  };
  
  return jwt.sign(defaultUser, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '1h' });
};

/**
 * Generate admin JWT token
 */
export const generateAdminToken = (adminData = {}) => {
  const defaultAdmin = {
    userId: 'test-admin-id',
    email: 'admin@example.com',
    role: 'admin',
    ...adminData
  };
  
  return jwt.sign(defaultAdmin, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '1h' });
};

/**
 * Create authenticated request helper
 */
export const createAuthenticatedRequest = (app, token) => {
  return {
    get: (url) => request(app).get(url).set('Authorization', `Bearer ${token}`),
    post: (url) => request(app).post(url).set('Authorization', `Bearer ${token}`),
    put: (url) => request(app).put(url).set('Authorization', `Bearer ${token}`),
    delete: (url) => request(app).delete(url).set('Authorization', `Bearer ${token}`),
    patch: (url) => request(app).patch(url).set('Authorization', `Bearer ${token}`)
  };
};

/**
 * Mock error handling middleware
 */
export const mockErrorHandler = () => {
  return (error, req, res, next) => {
    console.error('Test Error:', error);
    
    if (res.headersSent) {
      return next(error);
    }
    
    res.status(error.status || 500).json({
      success: false,
      error: error.message || 'Internal server error',
      ...(process.env.NODE_ENV === 'test' && { stack: error.stack })
    });
  };
};

export default {
  mockCookieParser,
  mockSession,
  mockAuth,
  mockAdminAuth,
  mockOptionalAuth,
  createTestApp,
  generateTestToken,
  generateAdminToken,
  createAuthenticatedRequest,
  mockErrorHandler
};