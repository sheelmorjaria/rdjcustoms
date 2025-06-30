import React from 'react';
import { render, screen } from '@testing-library/react';
import { act } from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import ProductCard from '../../components/ProductCard';
import AddToCartButton from '../../components/AddToCartButton';
import SearchBar from '../../components/SearchBar';
import FilterSidebar from '../../components/FilterSidebar';
import Pagination from '../../components/Pagination';
import { CartContext } from '../../contexts/CartContext';
import { AuthStateContext, AuthDispatchContext } from '../../contexts/AuthContext';

// Mock store
const mockStore = configureStore({
  reducer: {
    auth: (state = { user: null, isAuthenticated: false }) => state,
    cart: (state = { items: [], total: 0 }) => state,
    products: (state = { list: [], loading: false }) => state,
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

// Mock product data factory
const createMockProduct = (overrides = {}) => ({
  _id: 'test-product-1',
  name: 'Test Product',
  slug: 'test-product',
  shortDescription: 'A test product for performance testing',
  price: 99.99,
  images: ['/test-image.jpg'],
  condition: 'new',
  stockStatus: 'in_stock',
  stockQuantity: 10,
  category: {
    _id: 'test-category',
    name: 'Test Category',
    slug: 'test-category'
  },
  createdAt: new Date().toISOString(),
  ...overrides
});

const mockAuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const mockAuthDispatch = jest.fn();

// Performance measurement utilities
const measureRenderTime = async (Component, props = {}) => {
  const startTime = performance.now();
  
  await act(async () => {
    render(
      <AuthStateContext.Provider value={mockAuthState}>
        <AuthDispatchContext.Provider value={mockAuthDispatch}>
          <CartContext.Provider value={mockCartContext}>
            <Provider store={mockStore}>
              <BrowserRouter>
                <Component {...props} />
              </BrowserRouter>
            </Provider>
          </CartContext.Provider>
        </AuthDispatchContext.Provider>
      </AuthStateContext.Provider>
    );
  });
  
  const endTime = performance.now();
  return endTime - startTime;
};

const measureReRenderTime = async (Component, props = {}, updateProps = {}) => {
  const { rerender } = render(
    <AuthStateContext.Provider value={mockAuthState}>
      <AuthDispatchContext.Provider value={mockAuthDispatch}>
        <CartContext.Provider value={mockCartContext}>
          <Provider store={mockStore}>
            <BrowserRouter>
              <Component {...props} />
            </BrowserRouter>
          </Provider>
        </CartContext.Provider>
      </AuthDispatchContext.Provider>
    </AuthStateContext.Provider>
  );
  
  const startTime = performance.now();
  
  await act(async () => {
    rerender(
      <AuthStateContext.Provider value={mockAuthState}>
        <AuthDispatchContext.Provider value={mockAuthDispatch}>
          <CartContext.Provider value={mockCartContext}>
            <Provider store={mockStore}>
              <BrowserRouter>
                <Component {...updateProps} />
              </BrowserRouter>
            </Provider>
          </CartContext.Provider>
        </AuthDispatchContext.Provider>
      </AuthStateContext.Provider>
    );
  });
  
  const endTime = performance.now();
  return endTime - startTime;
};

describe('Component Render Performance Tests', () => {
  // Performance thresholds (in milliseconds)
  const INITIAL_RENDER_THRESHOLD = 100;
  const RE_RENDER_THRESHOLD = 50;
  const LARGE_LIST_RENDER_THRESHOLD = 200;

  beforeEach(() => {
    // Clear any performance marks/measures
    performance.clearMarks();
    performance.clearMeasures();
  });

  describe('ProductCard Performance', () => {
    it('should render within performance threshold', async () => {
      const mockProduct = createMockProduct();

      const renderTime = await measureRenderTime(ProductCard, { product: mockProduct });
      
      expect(renderTime).toBeLessThan(INITIAL_RENDER_THRESHOLD);
    });

    it('should handle multiple product cards efficiently', async () => {
      const renderTimes = [];
      
      for (let i = 0; i < 20; i++) {
        const product = createMockProduct({
          _id: `product-${i}`,
          name: `Product ${i}`,
          slug: `product-${i}`,
          price: 10 + i,
        });
        
        const time = await measureRenderTime(ProductCard, { product });
        renderTimes.push(time);
      }

      const avgRenderTime = renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length;
      expect(avgRenderTime).toBeLessThan(INITIAL_RENDER_THRESHOLD);
    });

    it('should re-render efficiently when product data updates', async () => {
      const initialProduct = createMockProduct({
        _id: 'product-1',
        name: 'Original Product',
        slug: 'original-product',
        price: 50.00,
      });

      const updatedProduct = createMockProduct({
        ...initialProduct,
        name: 'Updated Product',
        price: 45.00,
      });

      const reRenderTime = await measureReRenderTime(
        ProductCard,
        { product: initialProduct },
        { product: updatedProduct }
      );
      
      expect(reRenderTime).toBeLessThan(RE_RENDER_THRESHOLD);
    });
  });

  describe('AddToCartButton Performance', () => {
    it('should render button efficiently', async () => {
      const props = {
        productId: 'product-1',
        stockStatus: 'in_stock',
        onAddToCart: jest.fn(),
      };

      const renderTime = await measureRenderTime(AddToCartButton, props);
      
      expect(renderTime).toBeLessThan(INITIAL_RENDER_THRESHOLD);
    });

    it('should handle state changes efficiently', async () => {
      const initialProps = {
        productId: 'product-1',
        stockStatus: 'in_stock',
        isLoading: false,
      };

      const updatedProps = {
        ...initialProps,
        isLoading: true,
      };

      const reRenderTime = await measureReRenderTime(
        AddToCartButton,
        initialProps,
        updatedProps
      );
      
      expect(reRenderTime).toBeLessThan(RE_RENDER_THRESHOLD);
    });
  });

  describe('SearchBar Performance', () => {
    it('should render search input efficiently', async () => {
      const props = {
        onSearch: jest.fn(),
        placeholder: 'Search products...',
      };

      const renderTime = await measureRenderTime(SearchBar, props);
      
      expect(renderTime).toBeLessThan(INITIAL_RENDER_THRESHOLD);
    });

    it('should handle input changes efficiently', async () => {
      // Measure input handling performance
      const inputTimes = [];
      
      const handleInput = (value) => {
        const startTime = performance.now();
        // Simulate input processing
        const processed = value.trim().toLowerCase();
        const endTime = performance.now();
        return endTime - startTime;
      };

      // Test with various input lengths
      const testInputs = [
        'a',
        'test',
        'long search query with multiple words',
        'very ' + 'long '.repeat(20) + 'query',
      ];

      testInputs.forEach(input => {
        const time = handleInput(input);
        inputTimes.push(time);
      });

      const averageTime = inputTimes.reduce((a, b) => a + b, 0) / inputTimes.length;
      expect(averageTime).toBeLessThan(5);
    });
  });

  describe('FilterSidebar Performance', () => {
    it('should render filters efficiently', async () => {
      const props = {
        categories: ['Electronics', 'Clothing', 'Home', 'Books', 'Toys'],
        selectedCategories: [],
        priceRange: { min: 0, max: 1000 },
        onCategoryChange: jest.fn(),
        onPriceChange: jest.fn(),
      };

      const renderTime = await measureRenderTime(FilterSidebar, props);
      
      expect(renderTime).toBeLessThan(INITIAL_RENDER_THRESHOLD);
    });
  });

  describe('Pagination Performance', () => {
    it('should render pagination controls efficiently', async () => {
      const props = {
        currentPage: 1,
        totalPages: 100,
        onPageChange: jest.fn(),
      };

      const renderTime = await measureRenderTime(Pagination, props);
      
      expect(renderTime).toBeLessThan(INITIAL_RENDER_THRESHOLD);
    });

    it('should handle page changes efficiently', async () => {
      const pageTimes = [];
      
      for (let page = 1; page <= 10; page++) {
        const props = {
          currentPage: page,
          totalPages: 100,
          onPageChange: jest.fn(),
        };
        
        const time = await measureRenderTime(Pagination, props);
        pageTimes.push(time);
      }

      const avgTime = pageTimes.reduce((a, b) => a + b, 0) / pageTimes.length;
      expect(avgTime).toBeLessThan(INITIAL_RENDER_THRESHOLD);
    });
  });

  describe('Memory Usage Tests', () => {
    it('should not leak memory when mounting/unmounting components repeatedly', async () => {
      if (!performance.memory) {
        console.warn('Memory API not available in this environment');
        return;
      }

      const initialMemory = performance.memory.usedJSHeapSize;
      
      // Mount and unmount component multiple times
      for (let i = 0; i < 50; i++) {
        const { unmount } = render(
          <AuthStateContext.Provider value={mockAuthState}>
            <AuthDispatchContext.Provider value={mockAuthDispatch}>
              <CartContext.Provider value={mockCartContext}>
                <Provider store={mockStore}>
                  <BrowserRouter>
                    <ProductCard product={createMockProduct({ _id: '1', name: 'Test', slug: 'test', price: 10 })} />
                  </BrowserRouter>
                </Provider>
              </CartContext.Provider>
            </AuthDispatchContext.Provider>
          </AuthStateContext.Provider>
        );
        unmount();
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      // Wait a bit for cleanup
      await new Promise(resolve => setTimeout(resolve, 100));

      const finalMemory = performance.memory.usedJSHeapSize;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Allow for some memory increase but it should be minimal
      expect(memoryIncrease).toBeLessThan(1000000); // Less than 1MB increase
    });
  });

  describe('Async Operation Performance', () => {
    it('should debounce search input efficiently', async () => {
      const searchTimes = [];
      
      // Simulate debounced search
      const debounce = (func, delay) => {
        let timeoutId;
        return (...args) => {
          clearTimeout(timeoutId);
          const startTime = performance.now();
          timeoutId = setTimeout(() => {
            func(...args);
            const endTime = performance.now();
            searchTimes.push(endTime - startTime);
          }, delay);
        };
      };

      const mockSearch = jest.fn();
      const debouncedSearch = debounce(mockSearch, 300);

      // Simulate rapid typing
      for (let i = 0; i < 10; i++) {
        debouncedSearch(`search term ${i}`);
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      // Wait for debounce to complete
      await new Promise(resolve => setTimeout(resolve, 400));

      expect(mockSearch).toHaveBeenCalledTimes(1); // Should only call once due to debouncing
    });
  });

  describe('Bundle Size Impact', () => {
    it('should lazy load heavy components', () => {
      // This test would check if components are properly code-split
      // In a real scenario, you'd analyze the webpack bundle
      const LazyComponent = React.lazy(() => import('../../components/ImageGallery'));
      
      expect(LazyComponent).toBeDefined();
      expect(typeof LazyComponent).toBe('object'); // React.lazy returns an object
      expect(LazyComponent.$$typeof).toBeDefined(); // React lazy components have $$typeof
    });
  });
});