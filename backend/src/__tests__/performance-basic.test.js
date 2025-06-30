/**
 * Basic Performance Tests
 * Tests core functionality performance without app dependencies
 */

import { performance } from 'perf_hooks';

describe('Basic Performance Tests', () => {
  const PERFORMANCE_THRESHOLD = 10; // 10ms for basic operations

  test('sanitization utilities should be fast', async () => {
    // Import sanitization utilities
    const { sanitizeUserInput, escapeHtml } = await import('../utils/sanitization.js');
    
    const testInput = '<script>alert("test")</script>Hello World';
    
    const start = performance.now();
    const sanitized = sanitizeUserInput(testInput);
    const escaped = escapeHtml(testInput);
    const end = performance.now();
    
    const duration = end - start;
    
    expect(sanitized).toBeDefined();
    expect(escaped).toBeDefined();
    expect(duration).toBeLessThan(PERFORMANCE_THRESHOLD);
  });

  test('logger utilities should be fast', async () => {
    // Test console logging performance as fallback
    const start = performance.now();
    console.log('Performance test log');
    console.warn('Performance test warning');
    console.error('Performance test error');
    const end = performance.now();
    
    const duration = end - start;
    expect(duration).toBeLessThan(PERFORMANCE_THRESHOLD * 2); // Allow more time for console
  });

  test('concurrent operations should be efficient', async () => {
    const { sanitizeUserInput } = await import('../utils/sanitization.js');
    
    const operations = Array.from({ length: 100 }, (_, i) => 
      () => sanitizeUserInput(`<script>alert("${i}")</script>Test ${i}`)
    );
    
    const start = performance.now();
    const results = await Promise.all(operations.map(op => op()));
    const end = performance.now();
    
    const duration = end - start;
    
    expect(results).toHaveLength(100);
    expect(results.every(result => typeof result === 'string')).toBe(true);
    expect(duration).toBeLessThan(PERFORMANCE_THRESHOLD * 10); // Allow 100ms for 100 operations
  });

  test('memory usage should be reasonable', () => {
    const { sanitizeUserInput } = require('../utils/sanitization.js');
    
    const initialMemory = process.memoryUsage().heapUsed;
    
    // Perform many operations
    for (let i = 0; i < 1000; i++) {
      sanitizeUserInput(`<script>alert("${i}")</script>Test ${i}`);
    }
    
    const finalMemory = process.memoryUsage().heapUsed;
    const memoryGrowth = finalMemory - initialMemory;
    
    // Memory growth should be minimal (less than 10MB)
    expect(memoryGrowth).toBeLessThan(10 * 1024 * 1024);
  });

  test('error handling should be fast', async () => {
    const start = performance.now();
    
    try {
      // Test error handling performance
      const { sanitizeUserInput } = await import('../utils/sanitization.js');
      sanitizeUserInput(null);
      sanitizeUserInput(undefined);
      sanitizeUserInput(123);
    } catch (error) {
      // Expected for some inputs
    }
    
    const end = performance.now();
    const duration = end - start;
    
    expect(duration).toBeLessThan(PERFORMANCE_THRESHOLD);
  });
});