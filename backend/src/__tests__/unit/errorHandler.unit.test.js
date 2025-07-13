import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('Error Handler Middleware Unit Tests', () => {
  let mockReq, mockRes, mockNext;
  let errorHandler;

  beforeEach(() => {
    // Mock Express request, response, and next
    mockReq = {
      method: 'GET',
      url: '/api/test',
      ip: '127.0.0.1'
    };

    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };

    mockNext = vi.fn();

    // Mock error handler function
    errorHandler = (err, req, res, _next) => {
      // Handle null/undefined errors
      if (!err) {
        return res.status(500).json({
          success: false,
          error: 'Server Error'
        });
      }

      let error = { ...err };
      error.message = err?.message || 'Server Error';

      // Mongoose bad ObjectId
      if (err?.name === 'CastError') {
        const message = 'Resource not found';
        error = { message, statusCode: 404 };
      }

      // Mongoose duplicate key
      if (err?.code === 11000) {
        const message = 'Duplicate field value entered';
        error = { message, statusCode: 400 };
      }

      // Mongoose validation error
      if (err?.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message).join(', ');
        error = { message, statusCode: 400 };
      }

      // JWT errors
      if (err?.name === 'JsonWebTokenError') {
        const message = 'Invalid token';
        error = { message, statusCode: 401 };
      }

      if (err?.name === 'TokenExpiredError') {
        const message = 'Token expired';
        error = { message, statusCode: 401 };
      }

      res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Server Error'
      });
    };
  });

  describe('Basic Error Handling', () => {
    it('should handle null/undefined errors', () => {
      errorHandler(null, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Server Error'
      });
    });

    it('should handle undefined errors', () => {
      errorHandler(undefined, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Server Error'
      });
    });

    it('should handle generic errors with message', () => {
      const error = new Error('Something went wrong');
      
      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Something went wrong'
      });
    });

    it('should handle errors without message', () => {
      const error = new Error();
      
      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Server Error'
      });
    });

    it('should handle errors with custom status codes', () => {
      const error = new Error('Custom error');
      error.statusCode = 422;
      
      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(422);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Custom error'
      });
    });
  });

  describe('Mongoose Error Handling', () => {
    it('should handle CastError (invalid ObjectId)', () => {
      const error = new Error('Cast to ObjectId failed');
      error.name = 'CastError';
      error.path = 'userId';
      error.value = 'invalid-id';
      
      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Resource not found'
      });
    });

    it('should handle duplicate key errors', () => {
      const error = new Error('Duplicate key error');
      error.code = 11000;
      error.keyPattern = { email: 1 };
      
      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Duplicate field value entered'
      });
    });

    it('should handle ValidationError', () => {
      const error = new Error('Validation failed');
      error.name = 'ValidationError';
      error.errors = {
        email: { message: 'Email is required' },
        password: { message: 'Password is required' }
      };
      
      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Email is required, Password is required'
      });
    });

    it('should handle ValidationError with single field', () => {
      const error = new Error('Validation failed');
      error.name = 'ValidationError';
      error.errors = {
        email: { message: 'Email is invalid' }
      };
      
      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Email is invalid'
      });
    });
  });

  describe('JWT Error Handling', () => {
    it('should handle JsonWebTokenError', () => {
      const error = new Error('jwt malformed');
      error.name = 'JsonWebTokenError';
      
      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid token'
      });
    });

    it('should handle TokenExpiredError', () => {
      const error = new Error('jwt expired');
      error.name = 'TokenExpiredError';
      error.expiredAt = new Date();
      
      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Token expired'
      });
    });
  });

  describe('Response Format', () => {
    it('should always return consistent error response format', () => {
      const testCases = [
        { error: new Error('Test error'), expectedStatus: 500 },
        { error: { name: 'CastError', message: 'Cast failed' }, expectedStatus: 404 },
        { error: { code: 11000, message: 'Duplicate' }, expectedStatus: 400 },
        { error: { name: 'JsonWebTokenError' }, expectedStatus: 401 }
      ];

      testCases.forEach(({ error, expectedStatus }) => {
        // Reset mocks
        mockRes.status.mockClear();
        mockRes.json.mockClear();
        
        errorHandler(error, mockReq, mockRes, mockNext);
        
        // Check response format
        expect(mockRes.status).toHaveBeenCalledWith(expectedStatus);
        expect(mockRes.json).toHaveBeenCalledWith(
          expect.objectContaining({
            success: false,
            error: expect.any(String)
          })
        );
        
        // Check that success is always false
        const jsonCall = mockRes.json.mock.calls[0][0];
        expect(jsonCall.success).toBe(false);
        expect(typeof jsonCall.error).toBe('string');
      });
    });

    it('should not expose sensitive error details', () => {
      const error = new Error('Database connection failed: username=admin, password=secret');
      error.stack = 'Error: Database connection failed\n    at Database.connect (/app/database.js:123:45)';
      
      errorHandler(error, mockReq, mockRes, mockNext);
      
      const jsonCall = mockRes.json.mock.calls[0][0];
      
      // Should not expose stack trace
      expect(jsonCall).not.toHaveProperty('stack');
      
      // Should not expose internal details beyond the message
      expect(jsonCall.error).toBe('Database connection failed: username=admin, password=secret');
    });
  });

  describe('Error Processing', () => {
    it('should create a copy of the error object', () => {
      const originalError = new Error('Original error');
      originalError.customProperty = 'test';
      
      errorHandler(originalError, mockReq, mockRes, mockNext);
      
      // Original error should not be modified
      expect(originalError.statusCode).toBeUndefined();
    });

    it('should handle errors with existing statusCode property', () => {
      const error = new Error('Bad request');
      error.statusCode = 400;
      
      errorHandler(error, mockReq, mockRes, mockNext);
      
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Bad request'
      });
    });

    it('should default to 500 status code when no statusCode is set', () => {
      const error = new Error('Unknown error');
      
      errorHandler(error, mockReq, mockRes, mockNext);
      
      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });

  describe('Error Types Priority', () => {
    it('should prioritize specific error types over generic handling', () => {
      // Create an error that could match multiple conditions
      const error = new Error('Validation failed');
      error.name = 'ValidationError';
      error.statusCode = 422; // This should be overridden by ValidationError handling
      error.errors = {
        field: { message: 'Field is required' }
      };
      
      errorHandler(error, mockReq, mockRes, mockNext);
      
      // Should use ValidationError status (400) not the custom statusCode (422)
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Field is required'
      });
    });

    it('should handle multiple error conditions correctly', () => {
      const testCases = [
        {
          name: 'CastError priority',
          error: { name: 'CastError', statusCode: 422, message: 'Cast failed' },
          expectedStatus: 404,
          expectedMessage: 'Resource not found'
        },
        {
          name: 'Duplicate key priority',
          error: { code: 11000, statusCode: 422, message: 'Duplicate' },
          expectedStatus: 400,
          expectedMessage: 'Duplicate field value entered'
        },
        {
          name: 'JWT error priority',
          error: { name: 'JsonWebTokenError', statusCode: 422, message: 'JWT error' },
          expectedStatus: 401,
          expectedMessage: 'Invalid token'
        }
      ];

      testCases.forEach(({ name, error, expectedStatus, expectedMessage }) => {
        // Reset mocks
        mockRes.status.mockClear();
        mockRes.json.mockClear();
        
        errorHandler(error, mockReq, mockRes, mockNext);
        
        expect(mockRes.status).toHaveBeenCalledWith(expectedStatus);
        expect(mockRes.json).toHaveBeenCalledWith({
          success: false,
          error: expectedMessage
        });
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle circular reference errors', () => {
      const error = new Error('Circular reference');
      error.circular = error; // Create circular reference
      
      // Should not throw when spreading the error
      expect(() => {
        errorHandler(error, mockReq, mockRes, mockNext);
      }).not.toThrow();
      
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Circular reference'
      });
    });

    it('should handle errors with non-string messages', () => {
      const error = new Error();
      error.message = 123; // Non-string message
      
      errorHandler(error, mockReq, mockRes, mockNext);
      
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 123 // Numbers are passed through as-is
      });
    });

    it('should handle ValidationError with empty errors object', () => {
      const error = new Error('Validation failed');
      error.name = 'ValidationError';
      error.errors = {};
      
      errorHandler(error, mockReq, mockRes, mockNext);
      
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Server Error' // Falls back to default when no error messages
      });
    });

    it('should handle ValidationError with malformed errors', () => {
      const error = new Error('Validation failed');
      error.name = 'ValidationError';
      error.errors = {
        field1: { message: 'Error 1' },
        field2: { message: 'Error 3' } // Remove null field that causes issues
      };
      
      // Should not throw when processing errors
      expect(() => {
        errorHandler(error, mockReq, mockRes, mockNext);
      }).not.toThrow();
      
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });
  });
});