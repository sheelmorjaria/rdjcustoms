# Playwright E2E Tests with MSW API Mocking

This directory contains comprehensive end-to-end tests using Playwright with Mock Service Worker (MSW) for API mocking.

## Overview

Our Playwright setup provides:
- **Cross-browser testing** (Chromium, Firefox, WebKit)
- **Mobile device testing** (iPhone, Android)
- **API mocking** with MSW for reliable, fast tests
- **Custom fixtures** for reusable test utilities
- **Page Object Model** helpers for maintainable tests
- **Visual regression testing** capabilities
- **Accessibility testing** integration
- **Performance monitoring** in tests

## Test Structure

```
src/__tests__/playwright/
├── fixtures/
│   └── test-fixtures.js          # Custom Playwright fixtures
├── mocks/
│   └── handlers.js               # MSW request handlers
├── utils/
│   └── test-helpers.js           # Page Object Model helpers
├── payment-flows.playwright.test.js       # Payment E2E tests
├── user-management.playwright.test.js     # Admin E2E tests
├── comprehensive-flows.playwright.test.js # Full user journeys
├── global-setup.js               # MSW server setup
├── global-teardown.js            # MSW cleanup
└── README.md                     # This file
```

## Installation & Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Install Playwright browsers:**
   ```bash
   npm run test:playwright:install
   ```

3. **Start the application server:**
   ```bash
   npm start
   # Server should be running on http://localhost:3000
   ```

## Running Tests

### Basic Commands

```bash
# Run all Playwright tests
npm run test:playwright

# Run tests with browser UI visible
npm run test:playwright:headed

# Run tests in debug mode (step through)
npm run test:playwright:debug

# Run Playwright UI mode (interactive)
npm run test:playwright:ui

# View HTML test report
npm run test:playwright:report
```

### Specific Test Suites

```bash
# Run only payment flow tests
npm run test:playwright:payments

# Run only user management tests
npm run test:playwright:users

# Run tests matching a pattern
npx playwright test --grep="PayPal"
```

### Browser-Specific Testing

```bash
# Run on specific browsers
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit

# Run on mobile devices
npx playwright test --project="Mobile Chrome"
npx playwright test --project="Mobile Safari"
```

## API Mocking with MSW

Our tests use MSW to mock all API calls, providing:

### Benefits
- **Reliable tests** - No dependency on external services
- **Fast execution** - No network delays
- **Predictable data** - Consistent test scenarios
- **Offline testing** - Works without internet

### Mock Data Management

```javascript
// In your test file
import { test, expect } from './fixtures/test-fixtures.js';

test('should handle custom test data', async ({ mockData, page }) => {
  // Add custom test product
  mockData.addProduct({
    _id: 'custom-product',
    name: 'Test Product',
    price: 99.99
  });
  
  // Your test code here
});
```

### Available Mock Utilities

The `mockData` fixture provides:
- `addProduct(product)` - Add test products
- `addOrder(order)` - Add test orders  
- `addUser(user)` - Add test users
- `updateOrder(id, updates)` - Update existing orders
- `clearAll()` - Reset all test data

## Test Helpers & Page Objects

### Payment Test Helpers

```javascript
test('payment flow example', async ({ page, testData }) => {
  const paymentHelpers = new PaymentTestHelpers(page);
  
  // Fill shipping address
  await paymentHelpers.fillShippingAddress(testData.validShippingAddress);
  
  // Select payment method
  await paymentHelpers.selectPaymentMethod('paypal');
  
  // Complete PayPal flow
  const result = await paymentHelpers.completePayPalPayment(testData.validShippingAddress);
});
```

### Admin Test Helpers

```javascript
test('admin workflow example', async ({ page, testData }) => {
  const adminHelpers = new AdminTestHelpers(page);
  
  // Login as admin
  await adminHelpers.loginAsAdmin(testData.adminUser);
  
  // Manage users
  await adminHelpers.updateUserStatus('user-123', 'inactive');
});
```

## Test Data

Pre-defined test data is available through the `testData` fixture:

```javascript
// Users
testData.adminUser      // Admin login credentials
testData.customerUser   // Customer login credentials

// Addresses
testData.validShippingAddress    // Complete shipping address
testData.invalidShippingAddress  // Incomplete address for error testing

// Products
testData.pixelPhone     // Google Pixel product
testData.privacyService // Privacy app service

// Orders
testData.sampleOrder    // Complete order data
```

## Writing New Tests

### Basic Test Structure

```javascript
import { test, expect } from './fixtures/test-fixtures.js';
import { PaymentTestHelpers } from './utils/test-helpers.js';

test.describe('My New Feature', () => {
  test.beforeEach(async ({ page, mockData }) => {
    // Setup before each test
    mockData.clearAll();
  });

  test('should perform specific action', async ({ 
    page, 
    api, 
    testData, 
    mockData 
  }) => {
    // Your test steps
    await page.goto('/my-feature');
    
    // Use API helpers
    const result = await api.getProducts();
    expect(result.success).toBe(true);
    
    // Use page interactions
    await page.click('[data-testid="my-button"]');
    await expect(page.locator('[data-testid="result"]')).toBeVisible();
  });
});
```

### Best Practices

1. **Use data-testid attributes** for reliable element selection
2. **Group related tests** in describe blocks
3. **Clear mock data** before each test
4. **Use meaningful test names** that describe the behavior
5. **Take screenshots** for visual verification
6. **Test error scenarios** as well as happy paths

### Adding New Mock Endpoints

To add new API endpoints to mock:

1. **Edit `mocks/handlers.js`:**
   ```javascript
   // Add new handler
   http.get('/api/new-endpoint', ({ request }) => {
     return HttpResponse.json({
       success: true,
       data: { message: 'Mock response' }
     });
   })
   ```

2. **Add to handlers array:**
   ```javascript
   export const handlers = [
     // ... existing handlers
     newEndpointHandler
   ];
   ```

## Debugging Tests

### Debug Mode
```bash
npm run test:playwright:debug
```
This opens the Playwright Inspector where you can:
- Step through tests line by line
- Inspect page state
- Modify selectors
- Take screenshots

### Browser Mode
```bash
npm run test:playwright:headed
```
Runs tests with browser visible so you can see what's happening.

### Console Logs
```javascript
test('debug example', async ({ page }) => {
  // Enable console logging
  page.on('console', msg => console.log(msg.text()));
  
  // Your test code
});
```

## Visual Testing

### Taking Screenshots
```javascript
// In your test
await testUtils.takeScreenshot(page, 'feature-name');
```

### Visual Regression Testing
```bash
# Update visual baselines
npx playwright test --update-snapshots

# Run visual comparisons
npx playwright test --grep="visual"
```

## Performance Testing

Tests include performance monitoring:

```javascript
test('should load quickly', async ({ page }) => {
  const loadTime = await testUtils.measurePageLoadTime(page, '/products');
  expect(loadTime).toBeLessThan(3000); // 3 second max
});
```

## Accessibility Testing

Basic accessibility checks are included:

```javascript
test('should be accessible', async ({ page }) => {
  await page.goto('/checkout');
  await testUtils.checkAccessibility(page);
});
```

## CI/CD Integration

Tests run automatically in GitHub Actions across:
- **3 browsers** (Chromium, Firefox, WebKit)
- **Mobile devices** (iPhone, Android)
- **Accessibility** validation
- **Performance** monitoring
- **Visual regression** detection

## Troubleshooting

### Common Issues

1. **Server not running:**
   ```bash
   # Ensure server is running
   npm start
   ```

2. **Port conflicts:**
   ```bash
   # Check if port 3000 is available
   lsof -i :3000
   ```

3. **Browser installation:**
   ```bash
   # Reinstall browsers
   npx playwright install --force
   ```

4. **Test timeouts:**
   - Increase timeout in `playwright.config.js`
   - Add `test.slow()` for complex tests

### Getting Help

- **Playwright docs:** https://playwright.dev/
- **MSW docs:** https://mswjs.io/
- **GitHub Issues:** Report problems in the project repository

## Examples

See the existing test files for comprehensive examples:
- `payment-flows.playwright.test.js` - Payment processing flows
- `user-management.playwright.test.js` - Admin user management
- `comprehensive-flows.playwright.test.js` - Full user journeys

Each test file demonstrates different patterns and best practices for E2E testing with Playwright and MSW.