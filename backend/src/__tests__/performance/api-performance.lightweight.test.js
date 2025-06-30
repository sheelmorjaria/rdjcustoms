/**
 * Lightweight API Performance Tests
 * Fast performance tests without database dependencies
 */

import request from 'supertest';
import app from '../../app.js';
import { performance } from 'perf_hooks';
import { measureExecutionTime, measureMemoryUsage } from '../../test/setup.performance.lightweight.js';

// Performance thresholds (in milliseconds) - more aggressive for lightweight tests
const PERFORMANCE_THRESHOLDS = {
  API_RESPONSE: 50, // API should respond within 50ms
  MEMORY_LIMIT: 100, // Memory usage should be under 100MB
  CONCURRENT_REQUESTS: 200, // 10 concurrent requests should complete within 200ms
};

// Helper function to measure endpoint performance
const measureEndpointPerformance = async (method, endpoint, data = null) => {
  const startTime = performance.now();
  
  let req = request(app)[method](endpoint);
  
  if (data) {
    req = req.send(data);
  }
  
  const response = await req;
  const endTime = performance.now();
  
  return {
    duration: endTime - startTime,
    status: response.status,
    response
  };
};

describe('Lightweight API Performance Tests', () => {
  describe('Basic Endpoint Performance', () => {
    test('Health check should respond quickly', async () => {
      const { duration, status } = await measureEndpointPerformance('get', '/api/health');
      
      expect(status).toBe(200);
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.API_RESPONSE);
    });

    test('Root endpoint should respond quickly', async () => {
      const { duration, status } = await measureEndpointPerformance('get', '/');
      
      expect(status).toBe(200);
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.API_RESPONSE);
    });

    test('Security status should respond quickly', async () => {
      const { duration, status } = await measureEndpointPerformance('get', '/api/security/status');
      
      expect(status).toBe(200);
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.API_RESPONSE);
    });
  });

  describe('Product API Performance', () => {
    test('Product list endpoint should be fast', async () => {
      const { duration, status } = await measureEndpointPerformance('get', '/api/products');
      
      expect(status).toBe(200);
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.API_RESPONSE * 2); // Allow slightly more for data operations
    });

    test('Product search should be fast', async () => {
      const { duration, status } = await measureEndpointPerformance('get', '/api/products?search=test');
      
      expect(status).toBe(200);
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.API_RESPONSE * 2);
    });
  });

  describe('Security API Performance', () => {
    test('Security test endpoint should be fast', async () => {
      const testData = {
        testType: 'xss',
        payload: '<script>alert("test")</script>'
      };

      const { duration, status } = await measureEndpointPerformance('post', '/api/security/test', testData);
      
      expect(status).toBe(200);
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.API_RESPONSE);
    });

    test('Security metrics should respond quickly', async () => {
      const { duration, status } = await measureEndpointPerformance('get', '/api/security/metrics');
      
      expect(status).toBe(200);
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.API_RESPONSE);
    });
  });

  describe('Concurrent Request Performance', () => {
    test('should handle multiple concurrent requests efficiently', async () => {
      const concurrentRequests = 10;
      const startTime = performance.now();
      
      const requests = Array.from({ length: concurrentRequests }, () =>
        measureEndpointPerformance('get', '/api/health')
      );
      
      const results = await Promise.all(requests);
      const endTime = performance.now();
      const totalDuration = endTime - startTime;
      
      // All requests should succeed
      results.forEach(result => {
        expect(result.status).toBe(200);
      });
      
      // Total time should be reasonable
      expect(totalDuration).toBeLessThan(PERFORMANCE_THRESHOLDS.CONCURRENT_REQUESTS);
      
      // Average response time should be good
      const avgDuration = results.reduce((sum, result) => sum + result.duration, 0) / results.length;
      expect(avgDuration).toBeLessThan(PERFORMANCE_THRESHOLDS.API_RESPONSE);
    });
  });

  describe('Memory Usage Performance', () => {
    test('should not consume excessive memory during operations', async () => {
      const initialMemory = measureMemoryUsage('Initial');
      
      // Perform several operations
      await measureEndpointPerformance('get', '/api/health');
      await measureEndpointPerformance('get', '/api/products');
      await measureEndpointPerformance('get', '/api/security/status');
      
      const finalMemory = measureMemoryUsage('Final');
      
      // Memory growth should be minimal
      const memoryGrowth = finalMemory.heapUsed - initialMemory.heapUsed;
      expect(memoryGrowth).toBeLessThan(PERFORMANCE_THRESHOLDS.MEMORY_LIMIT);
    });
  });

  describe('Response Time Consistency', () => {
    test('response times should be consistent across multiple calls', async () => {
      const iterations = 20;
      const durations = [];
      
      for (let i = 0; i < iterations; i++) {
        const { duration } = await measureEndpointPerformance('get', '/api/health');
        durations.push(duration);
      }
      
      // Calculate statistics
      const avgDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;
      const maxDuration = Math.max(...durations);
      const minDuration = Math.min(...durations);
      const variance = durations.reduce((sum, d) => sum + Math.pow(d - avgDuration, 2), 0) / durations.length;
      const stdDeviation = Math.sqrt(variance);
      
      // All responses should be fast
      expect(maxDuration).toBeLessThan(PERFORMANCE_THRESHOLDS.API_RESPONSE);
      expect(avgDuration).toBeLessThan(PERFORMANCE_THRESHOLDS.API_RESPONSE / 2);
      
      // Response times should be consistent (low standard deviation)
      expect(stdDeviation).toBeLessThan(PERFORMANCE_THRESHOLDS.API_RESPONSE / 4);
    });
  });

  describe('Error Handling Performance', () => {
    test('404 errors should be handled quickly', async () => {
      const { duration, status } = await measureEndpointPerformance('get', '/api/nonexistent');
      
      expect(status).toBe(404);
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.API_RESPONSE);
    });

    test('malformed requests should be rejected quickly', async () => {
      const { duration, status } = await measureEndpointPerformance('post', '/api/security/test', 'invalid-json');
      
      expect(status).toBeGreaterThanOrEqual(400);
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.API_RESPONSE);
    });
  });

  describe('Middleware Performance', () => {
    test('security middleware should not significantly impact performance', async () => {
      // Measure with all security middleware
      const { duration: secureEndpointDuration } = await measureEndpointPerformance('get', '/api/security/status');
      
      // Should still be fast even with all security checks
      expect(secureEndpointDuration).toBeLessThan(PERFORMANCE_THRESHOLDS.API_RESPONSE * 1.5);
    });

    test('rate limiting should respond quickly even when limiting', async () => {
      // Make multiple rapid requests to trigger rate limiting
      const requests = Array.from({ length: 5 }, () =>
        measureEndpointPerformance('post', '/api/security/test', { testType: 'xss', payload: 'test' })
      );
      
      const results = await Promise.all(requests);
      
      // Even rate-limited responses should be fast
      results.forEach(result => {
        expect(result.duration).toBeLessThan(PERFORMANCE_THRESHOLDS.API_RESPONSE);
      });
    });
  });

  describe('Payload Size Performance', () => {
    test('should handle small payloads efficiently', async () => {
      const smallPayload = { testType: 'xss', payload: 'small' };
      const { duration, status } = await measureEndpointPerformance('post', '/api/security/test', smallPayload);
      
      expect(status).toBe(200);
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.API_RESPONSE);
    });

    test('should handle medium payloads efficiently', async () => {
      const mediumPayload = {
        testType: 'xss',
        payload: 'x'.repeat(1000) // 1KB payload
      };
      const { duration, status } = await measureEndpointPerformance('post', '/api/security/test', mediumPayload);
      
      expect(status).toBe(200);
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.API_RESPONSE * 2);
    });
  });
});