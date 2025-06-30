/**
 * Simple API Performance Tests
 * Basic performance verification without heavy dependencies
 */

import request from 'supertest';
import app from '../app.js';

describe('Simple API Performance Tests', () => {
  const RESPONSE_TIME_THRESHOLD = 100; // 100ms threshold

  test('health endpoint should respond quickly', async () => {
    const start = Date.now();
    const response = await request(app).get('/api/health');
    const duration = Date.now() - start;

    expect(response.status).toBe(200);
    expect(duration).toBeLessThan(RESPONSE_TIME_THRESHOLD);
  });

  test('root endpoint should respond quickly', async () => {
    const start = Date.now();
    const response = await request(app).get('/');
    const duration = Date.now() - start;

    expect(response.status).toBe(200);
    expect(duration).toBeLessThan(RESPONSE_TIME_THRESHOLD);
  });

  test('security status should respond quickly', async () => {
    const start = Date.now();
    const response = await request(app).get('/api/security/status');
    const duration = Date.now() - start;

    expect(response.status).toBe(200);
    expect(duration).toBeLessThan(RESPONSE_TIME_THRESHOLD);
  });

  test('concurrent requests should be handled efficiently', async () => {
    const concurrentRequests = 5;
    const start = Date.now();
    
    const requests = Array.from({ length: concurrentRequests }, () =>
      request(app).get('/api/health')
    );
    
    const responses = await Promise.all(requests);
    const duration = Date.now() - start;
    
    // All should succeed
    responses.forEach(response => {
      expect(response.status).toBe(200);
    });
    
    // Total time should be reasonable
    expect(duration).toBeLessThan(RESPONSE_TIME_THRESHOLD * 2);
  });

  test('error responses should be fast', async () => {
    const start = Date.now();
    const response = await request(app).get('/api/nonexistent');
    const duration = Date.now() - start;

    expect(response.status).toBe(404);
    expect(duration).toBeLessThan(RESPONSE_TIME_THRESHOLD);
  });
});