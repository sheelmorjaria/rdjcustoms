# Comprehensive Testing Documentation for Monero Payment System

## Overview

This document describes the comprehensive testing strategy implemented for the Monero payment system, covering all aspects from unit tests to end-to-end security testing.

## Test Architecture

### 1. Test Categories

#### 🧪 **Unit Tests**
- **Location**: `backend/src/services/__tests__/`, `frontend/src/components/__tests__/`
- **Purpose**: Test individual functions and components in isolation
- **Coverage**: MoneroService methods, React components, utility functions
- **Technology**: Jest (backend), Vitest (frontend)

#### 🔗 **Integration Tests**
- **Location**: `backend/src/__tests__/integration/`
- **Purpose**: Test API endpoints and service interactions
- **Coverage**: HTTP routes, database operations, external API mocking
- **Technology**: Supertest, MongoDB Memory Server

#### 🌐 **End-to-End (E2E) Tests**
- **Location**: `frontend/src/__tests__/e2e/`
- **Purpose**: Test complete user journeys across the application
- **Coverage**: Full payment flow from cart to confirmation
- **Technology**: Playwright

#### ⚡ **Load Tests**
- **Location**: `backend/src/__tests__/load/`
- **Purpose**: Test system performance under load
- **Coverage**: API rate limits, caching efficiency, concurrent requests
- **Technology**: Artillery, Custom performance tests

#### 🛡️ **Security Tests**
- **Location**: `backend/src/__tests__/security/`
- **Purpose**: Test security vulnerabilities and attack vectors
- **Coverage**: Webhook signature verification, input validation, injection attacks
- **Technology**: Custom security test suites

#### 📊 **Performance Tests**
- **Location**: `backend/src/__tests__/performance/`
- **Purpose**: Monitor and validate performance metrics
- **Coverage**: Response times, memory usage, regression detection
- **Technology**: Node.js Performance API

## Test Execution

### Quick Test Commands

```bash
# Run all tests comprehensively
node test-runner.js

# Individual test categories
cd backend
npm test                              # All backend tests
npm test -- --testPathPattern=unit   # Unit tests only
npm test -- --testPathPattern=load   # Load tests only

cd frontend
npm test                              # All frontend tests
npx playwright test                   # E2E tests only
```

### Continuous Integration

```bash
# CI-friendly test execution
npm run test:ci                       # Backend CI tests
npm run test:coverage                 # With coverage report
npx playwright test --reporter=junit  # E2E with CI reporting
```

## Test Implementation Details

### 1. Simplified Integration Tests

**File**: `backend/src/__tests__/integration/monero-payment-api.integration.test.js`

**Key Features**:
- Tests API boundaries without deep mocking
- Uses MongoDB Memory Server for isolated database testing
- Mocks external services (GloBee, CoinGecko) at the HTTP level
- Validates request/response formats and error handling

**Example**:
```javascript
it('should create Monero payment successfully', async () => {
  const response = await request(app)
    .post('/api/payments/monero/create')
    .send({ orderId: testOrder._id.toString() })
    .expect(200);

  expect(response.body.data.moneroAddress).toMatch(/^4[A-Za-z0-9]{94}$/);
});
```

### 2. E2E Testing with Playwright

**File**: `frontend/src/__tests__/e2e/monero-payment-flow.e2e.test.js`

**Key Features**:
- Tests complete user journey from cart to payment
- Mocks external APIs to prevent real transactions
- Validates responsive design and accessibility
- Tests error scenarios and edge cases

**Example**:
```javascript
test('Complete Monero payment journey', async ({ page }) => {
  await page.goto('/cart');
  await page.getByRole('button', { name: /proceed to checkout/i }).click();
  await page.getByText('Monero (XMR)').click();
  await page.getByRole('button', { name: /place order/i }).click();
  
  await expect(page).toHaveURL(/\/payment\/monero\//);
  await expect(page.getByText('Monero Payment')).toBeVisible();
});
```

### 3. Load Testing with Artillery

**File**: `backend/src/__tests__/load/monero-payment-load.yml`

**Key Features**:
- Tests multiple load phases (warm-up, steady, spike, cool-down)
- Validates caching efficiency under concurrent requests
- Monitors API rate limits and performance degradation
- Tests realistic user behavior patterns

**Configuration**:
```yaml
config:
  phases:
    - duration: 60
      arrivalRate: 5
      name: "Warm up"
    - duration: 120
      arrivalRate: 10
      name: "Steady load"
```

### 4. Security Testing

**File**: `backend/src/__tests__/security/webhook-security.test.js`

**Key Features**:
- Tests webhook signature verification
- Validates input sanitization and injection prevention
- Tests timing attack resistance
- Validates error message information disclosure

**Example**:
```javascript
it('should reject webhooks with invalid signatures', async () => {
  const response = await request(app)
    .post('/api/payments/monero/webhook')
    .set('X-GloBee-Signature', 'invalid-signature')
    .send(validPayload)
    .expect(401);
});
```

### 5. Performance Monitoring

**File**: `backend/src/__tests__/performance/monero-performance.test.js`

**Key Features**:
- Measures and validates response times
- Monitors memory usage and leak detection
- Tests concurrent operation performance
- Implements regression detection

**Example**:
```javascript
it('should achieve fast cache hit performance', async () => {
  const times = [];
  for (let i = 0; i < 1000; i++) {
    const startTime = performance.now();
    await moneroService.getExchangeRate();
    const endTime = performance.now();
    times.push(endTime - startTime);
  }
  
  const averageTime = times.reduce((a, b) => a + b, 0) / times.length;
  expect(averageTime).toBeLessThan(1); // Under 1ms average
});
```

## Test Data and Mocking

### External API Mocking

**CoinGecko Exchange Rate API**:
```javascript
axios.get.mockResolvedValue({
  data: { monero: { gbp: 161.23 } }
});
```

**GloBee Payment API**:
```javascript
axios.post.mockResolvedValue({
  data: {
    id: 'globee-payment-123',
    payment_address: '4AdUndXHHZ...',
    total: 1.2376,
    status: 'pending'
  }
});
```

### Database Testing

- Uses MongoDB Memory Server for isolated testing
- Automatic cleanup between tests
- Realistic data structures and relationships
- Transaction testing for webhook processing

### Browser Testing

- Multiple browser support (Chrome, Firefox, Safari)
- Mobile device simulation
- Network condition testing
- Accessibility validation

## Performance Benchmarks

### Response Time Targets

| Operation | Target | Maximum |
|-----------|--------|---------|
| Exchange Rate API | < 2000ms | < 5000ms |
| Cache Hit | < 1ms | < 10ms |
| Payment Creation | < 3000ms | < 10000ms |
| Status Check | < 1500ms | < 5000ms |
| Webhook Processing | < 5ms | < 50ms |

### Load Testing Scenarios

| Scenario | Concurrent Users | Duration | Success Rate |
|----------|------------------|----------|--------------|
| Normal Load | 10 users | 2 minutes | > 99% |
| Peak Load | 25 users | 1 minute | > 95% |
| Stress Test | 50 users | 30 seconds | > 90% |

## Security Test Coverage

### Webhook Security
- ✅ Signature verification (HMAC-SHA256)
- ✅ Timing attack resistance
- ✅ Input validation and sanitization
- ✅ Injection attack prevention
- ✅ Rate limiting validation
- ✅ Information disclosure prevention

### API Security
- ✅ Authentication and authorization
- ✅ Input validation
- ✅ Error handling
- ✅ Rate limiting
- ✅ CORS configuration

## Monitoring and Reporting

### Test Reports

- **JSON Format**: Detailed results with timestamps and metrics
- **Coverage Reports**: Code coverage analysis
- **Performance Metrics**: Response times and resource usage
- **Security Audit**: Vulnerability assessment results

### CI/CD Integration

```bash
# GitHub Actions example
- name: Run Comprehensive Tests
  run: |
    node test-runner.js
    
- name: Upload Test Results
  uses: actions/upload-artifact@v3
  with:
    name: test-results
    path: test-results.json
```

## Troubleshooting

### Common Issues

1. **Test Timeouts**: Increase timeout values for load tests
2. **Mock Conflicts**: Ensure proper mock cleanup between tests
3. **Database Conflicts**: Use separate test databases
4. **Network Issues**: Use offline mode for unit tests

### Debug Commands

```bash
# Verbose test output
npm test -- --verbose

# Run specific test file
npm test -- --testPathPattern=webhook-security

# Debug mode
node --inspect-brk node_modules/.bin/jest

# Coverage report
npm test -- --coverage
```

## Best Practices

### Test Organization
- Group related tests in describe blocks
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)
- Keep tests independent and isolated

### Performance Testing
- Use realistic data volumes
- Test under various load conditions
- Monitor resource usage
- Set clear performance thresholds

### Security Testing
- Test both positive and negative scenarios
- Use realistic attack vectors
- Validate all input sanitization
- Test error handling paths

### Maintenance
- Regular test review and updates
- Performance baseline updates
- Security test pattern updates
- Mock data freshness validation

## Future Enhancements

### Planned Improvements
- **Visual Regression Testing**: Screenshot comparison for UI changes
- **Chaos Engineering**: Fault injection testing
- **Contract Testing**: API contract validation with Pact
- **Accessibility Testing**: Automated a11y validation
- **Cross-browser Testing**: Expanded browser matrix

### Monitoring Integration
- **Real-time Alerts**: Performance threshold violations
- **Trend Analysis**: Performance regression tracking
- **Security Monitoring**: Continuous vulnerability scanning
- **Usage Analytics**: Test execution metrics and insights