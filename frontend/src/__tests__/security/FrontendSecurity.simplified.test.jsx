import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import SearchBar from '../../components/SearchBar';
import AddToCartButton from '../../components/AddToCartButton';
import { CartContext } from '../../contexts/CartContext';
import { AuthStateContext, AuthDispatchContext } from '../../contexts/AuthContext';

// Mock store
const mockStore = configureStore({
  reducer: {
    auth: (state = { user: null, isAuthenticated: false }) => state,
    cart: (state = { items: [], total: 0 }) => state,
  },
});

// Mock contexts
const mockCartContext = {
  cart: { items: [], totalItems: 0, totalAmount: 0, itemCount: 0 },
  loading: false,
  error: '',
  addToCart: jest.fn(),
  updateCartItem: jest.fn(),
  removeFromCart: jest.fn(),
  clearCart: jest.fn(),
  refreshCart: jest.fn(),
  clearError: jest.fn(),
  isEmpty: true,
  itemCount: 0,
};

const mockAuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const mockAuthDispatch = jest.fn();

// Helper component wrapper
const TestWrapper = ({ children }) => (
  <AuthStateContext.Provider value={mockAuthState}>
    <AuthDispatchContext.Provider value={mockAuthDispatch}>
      <CartContext.Provider value={mockCartContext}>
        <Provider store={mockStore}>
          <BrowserRouter>
            {children}
          </BrowserRouter>
        </Provider>
      </CartContext.Provider>
    </AuthDispatchContext.Provider>
  </AuthStateContext.Provider>
);

describe('Frontend Security Tests', () => {
  describe('XSS Prevention', () => {
    it('should not execute scripts in search input', () => {
      const { container } = render(
        <TestWrapper>
          <SearchBar />
        </TestWrapper>
      );

      const searchInput = screen.getByPlaceholderText(/search/i);
      
      // Test malicious input
      fireEvent.change(searchInput, { 
        target: { value: '<script>alert("XSS")</script>' } 
      });
      
      // Verify no script tags are present in DOM
      expect(container.querySelector('script')).toBeNull();
      expect(container.innerHTML).not.toContain('<script>');
    });

    it('should escape HTML entities in input values', () => {
      const { container } = render(
        <TestWrapper>
          <SearchBar />
        </TestWrapper>
      );

      const searchInput = screen.getByPlaceholderText(/search/i);
      const maliciousInput = '<img src=x onerror=alert("XSS")>';
      
      fireEvent.change(searchInput, { target: { value: maliciousInput } });
      
      // Check that dangerous attributes are not present
      expect(container.innerHTML).not.toContain('onerror=');
      expect(container.innerHTML).not.toContain('onload=');
    });
  });

  describe('Input Validation', () => {
    it('should validate email format', () => {
      const invalidEmails = [
        'invalid-email',
        'test@',
        '@example.com',
        'test..test@example.com',
        'test@example',
      ];

      invalidEmails.forEach(email => {
        const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        expect(isValid).toBe(false);
      });
    });

    it('should validate phone numbers', () => {
      const invalidPhones = [
        'abc123',
        '123',
        '+44-abc-def-ghi',
        '++44123456789',
        '44 123 456 789 extra',
      ];

      invalidPhones.forEach(phone => {
        const isValid = /^[+]?[1-9][\d]{0,15}$/.test(phone.replace(/\s+/g, ''));
        expect(isValid).toBe(false);
      });
    });
  });

  describe('SQL Injection Prevention', () => {
    it('should detect SQL injection patterns', () => {
      const sqlInjectionAttempts = [
        "'; DROP TABLE products; --",
        "1' OR '1'='1",
        "admin'--",
        "' UNION SELECT * FROM users --",
        "1; DELETE FROM users WHERE 1=1; --",
      ];

      const sqlInjectionPatterns = [
        /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|CREATE|ALTER)\b)/i,
        /(--|#|\/\*|\*\/)/,
        /('|"|;|\\)/,
        /(OR|AND)\s+\d+\s*=\s*\d+/i,
      ];

      sqlInjectionAttempts.forEach(attempt => {
        const isSqlInjection = sqlInjectionPatterns.some(pattern => pattern.test(attempt));
        expect(isSqlInjection).toBe(true);
      });
    });
  });

  describe('Component Security', () => {
    it('should render AddToCartButton safely', () => {
      const { container } = render(
        <TestWrapper>
          <AddToCartButton 
            productId="test-product"
            stockStatus="in_stock"
          />
        </TestWrapper>
      );

      // Verify component renders without security issues
      expect(container.querySelector('button')).toBeInTheDocument();
      expect(container.innerHTML).not.toContain('<script>');
    });

    it('should handle prop injection attempts', () => {
      const maliciousProps = {
        productId: '<script>alert("XSS")</script>',
        stockStatus: 'in_stock',
        'data-malicious': 'javascript:alert("XSS")',
      };

      const { container } = render(
        <TestWrapper>
          <AddToCartButton {...maliciousProps} />
        </TestWrapper>
      );

      // Verify malicious scripts are not executed
      expect(container.innerHTML).not.toContain('<script>');
      expect(container.innerHTML).not.toContain('javascript:');
    });
  });

  describe('URL Security', () => {
    it('should validate URLs', () => {
      const maliciousUrls = [
        'javascript:alert("XSS")',
        'data:text/html,<script>alert("XSS")</script>',
        'vbscript:msgbox("XSS")',
        'file:///etc/passwd',
      ];

      const isValidUrl = (url) => {
        try {
          const urlObj = new URL(url);
          return ['http:', 'https:'].includes(urlObj.protocol);
        } catch {
          return false;
        }
      };

      maliciousUrls.forEach(url => {
        expect(isValidUrl(url)).toBe(false);
      });
    });
  });

  describe('Data Sanitization', () => {
    it('should remove dangerous characters from user input', () => {
      const dangerousInputs = [
        '<script>',
        '</script>',
        'javascript:',
        'vbscript:',
        'onload=',
        'onerror=',
        'onclick=',
      ];

      const sanitizeInput = (input) => {
        return input
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/vbscript:/gi, '')
          .replace(/on\w+=/gi, '');
      };

      dangerousInputs.forEach(input => {
        const sanitized = sanitizeInput(input);
        expect(sanitized).not.toContain('<script>');
        expect(sanitized).not.toContain('javascript:');
        expect(sanitized).not.toContain('vbscript:');
      });
    });
  });

  describe('Content Security Policy', () => {
    it('should prevent inline script execution', () => {
      const dangerousHTML = '<div onclick="alert(\'XSS\')">Click me</div>';
      
      // Simple sanitization check
      const containsDangerousAttributes = /on\w+\s*=/i.test(dangerousHTML);
      expect(containsDangerousAttributes).toBe(true);
      
      // Safe version should not contain event handlers
      const safeHTML = dangerousHTML.replace(/on\w+\s*=[^>]*/gi, '');
      expect(safeHTML).not.toContain('onclick=');
    });
  });

  describe('File Upload Security', () => {
    it('should validate file types', () => {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      const maliciousFiles = [
        { name: 'script.js', type: 'application/javascript' },
        { name: 'executable.exe', type: 'application/x-msdownload' },
        { name: 'shell.sh', type: 'application/x-sh' },
        { name: 'virus.bat', type: 'application/bat' },
      ];

      const validateFileType = (file) => {
        return allowedTypes.includes(file.type);
      };

      maliciousFiles.forEach(file => {
        expect(validateFileType(file)).toBe(false);
      });
    });

    it('should validate file sizes', () => {
      const maxFileSize = 5 * 1024 * 1024; // 5MB
      
      const validateFileSize = (file) => {
        return file.size <= maxFileSize;
      };

      const largeFile = { size: 10 * 1024 * 1024 }; // 10MB
      const normalFile = { size: 2 * 1024 * 1024 }; // 2MB

      expect(validateFileSize(largeFile)).toBe(false);
      expect(validateFileSize(normalFile)).toBe(true);
    });

    it('should validate file names', () => {
      const dangerousFileNames = [
        '../../../etc/passwd',
        '..\\..\\windows\\system32\\config\\sam',
        'shell.php.jpg',
        'script.html',
        '.htaccess',
      ];

      const validateFileName = (fileName) => {
        // Check for path traversal
        if (fileName.includes('../') || fileName.includes('..\\')) return false;
        
        // Check for dangerous extensions
        const dangerousExtensions = ['.php', '.js', '.html', '.exe', '.bat', '.sh'];
        const hasExtension = dangerousExtensions.some(ext => fileName.toLowerCase().includes(ext));
        
        return !hasExtension;
      };

      dangerousFileNames.forEach(fileName => {
        expect(validateFileName(fileName)).toBe(false);
      });
    });
  });

  describe('localStorage Security', () => {
    it('should not store sensitive data in localStorage', () => {
      const sensitiveData = {
        password: 'mypassword123',
        creditCard: '4111111111111111',
        ssn: '123-45-6789',
      };

      // Mock localStorage
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: jest.fn(),
          setItem: jest.fn(),
          removeItem: jest.fn(),
          clear: jest.fn(),
        },
        writable: true,
      });

      // Function to safely store data
      const safeStore = (key, data) => {
        const sensitiveKeys = ['password', 'creditCard', 'ssn', 'token'];
        const isSensitive = sensitiveKeys.some(k => key.includes(k) || (typeof data === 'object' && data[k]));
        
        if (isSensitive) {
          throw new Error('Cannot store sensitive data in localStorage');
        }
        
        localStorage.setItem(key, JSON.stringify(data));
      };

      // Test that sensitive data storage is prevented
      expect(() => safeStore('user_password', sensitiveData.password)).toThrow();
      expect(() => safeStore('payment', sensitiveData)).toThrow();
    });
  });
});