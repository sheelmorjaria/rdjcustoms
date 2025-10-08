# CI/CD Setup Documentation

## Overview
This repository includes a comprehensive CI/CD pipeline using GitHub Actions to ensure code quality, security, and reliable deployments.

## Workflows

### 1. Main CI/CD Pipeline (`ci.yml`)
**Triggers**: Push/PR to `main` or `develop` branches

**Jobs**:
- **Backend Tests**: Unit, integration, and coverage tests
- **Frontend Tests**: Component, integration, and build tests  
- **E2E Tests**: Full application testing with Playwright
- **Security Scan**: Dependency audit and vulnerability scanning
- **Build & Deploy**: Automated deployment to staging/production
- **Notifications**: Slack notifications for pipeline results

**Services**:
- MongoDB 6.0 for database testing
- Node.js 18 environment

### 2. Basic Test Suite (`test-basic.yml`)
**Triggers**: Push/PR affecting backend, frontend, or workflow files

**Jobs**:
- **Quick Validation**: Package validation and lint checks
- **Test Structure**: Validates test file organization

## Required Secrets

Set these in your GitHub repository settings under Secrets and Variables > Actions:

### Required
- `SNYK_TOKEN`: Snyk security scanning token
- `MONGODB_URI`: MongoDB connection string for tests
- `JWT_SECRET`: JWT signing secret for tests
- `SESSION_SECRET`: Session secret for tests

### Optional (for notifications)
- `SLACK_WEBHOOK_URL`: Slack webhook for CI notifications

### Deployment (configure based on your deployment strategy)
- `AWS_ACCESS_KEY_ID`: AWS deployment credentials
- `AWS_SECRET_ACCESS_KEY`: AWS deployment credentials
- `VERCEL_TOKEN`: Vercel deployment token

## Test Requirements

### Backend
- MongoDB service running on port 27017
- Environment variables for database connection
- Test scripts: `test:unit`, `test:integration`, `test:coverage`

### Frontend  
- Vite build system
- Test scripts: `test:unit`, `test:integration`, `test:coverage`, `test:e2e`
- Playwright for E2E testing

## Coverage Requirements

- **Backend**: Minimum 80% line coverage
- **Frontend**: Minimum 75% line coverage
- **Critical paths**: 90%+ coverage required

## Security Scanning

- **npm audit**: Checks for known vulnerabilities
- **Snyk**: Advanced security scanning
- **Code scanning**: Checks for secrets in code

## Deployment Strategy

### Staging
- Automatic deployment on successful CI for `develop` branch
- Smoke tests run post-deployment
- Manual approval gate for production

### Production
- Automatic deployment on successful CI for `main` branch
- Blue-green deployment strategy
- Rollback capability

## Local Development

### Running Tests Locally

```bash
# Backend
cd backend
npm run test:unit
npm run test:integration
npm run test:coverage

# Frontend
cd frontend
npm run test:unit
npm run test:integration
npm run test:e2e
npm run test:coverage
```

### Pre-commit Hooks (Recommended)

```bash
# Install husky for git hooks
npm install -g husky

# Set up pre-commit testing
husky add .husky/pre-commit "npm run test:quick"
husky add .husky/pre-push "npm run test:full"
```

## Monitoring & Alerts

### Codecov Integration
- Coverage reports uploaded automatically
- PR comments with coverage diff
- Coverage trends tracked over time

### Slack Notifications
- Success/failure notifications
- Deployment status updates
- Coverage report summaries

## Troubleshooting

### Common Issues

1. **MongoDB Connection Failures**
   - Check MongoDB service health in workflow
   - Verify connection string format
   - Ensure authentication credentials

2. **Test Timeouts**
   - Increase timeout values in test configuration
   - Check for hanging promises in async tests
   - Review database cleanup between tests

3. **Build Failures**
   - Check for TypeScript errors
   - Verify all dependencies are installed
   - Review build configuration

4. **E2E Test Flakiness**
   - Add proper wait conditions
   - Use stable selectors
   - Review test data setup/teardown

### Debug Commands

```bash
# Run specific test suites
npm run test -- --testNamePattern="specific test"
npm run test -- --testPathPattern="path/to/test"

# Run with verbose output
npm run test -- --verbose

# Run coverage with detailed report
npm run test:coverage -- --verbose
```

## Best Practices

### Testing
- Write tests before implementing features (TDD)
- Maintain test isolation (no shared state)
- Use descriptive test names and organize with describe blocks
- Mock external dependencies
- Test both happy path and error scenarios

### CI/CD
- Keep pipeline fast (< 10 minutes total)
- Fail fast (run quick tests first)
- Cache dependencies to speed up builds
- Use parallel jobs where possible
- Monitor pipeline performance over time

### Security
- Never commit secrets to code
- Use environment variables for configuration
- Regularly update dependencies
- Review security scan results
- Implement proper input validation

## Metrics & KPIs

Track these metrics to monitor CI/CD health:

- **Pipeline Success Rate**: Target > 95%
- **Average Pipeline Duration**: Target < 10 minutes
- **Test Coverage**: Backend > 80%, Frontend > 75%
- **Time to Deploy**: Target < 30 minutes
- **Failed Deployment Rate**: Target < 5%

## Maintenance

### Weekly Tasks
- Review failed pipelines and fix issues
- Update dependencies
- Review security scan results
- Check coverage trends

### Monthly Tasks
- Review and optimize pipeline performance
- Update documentation
- Review and update secrets rotation
- Analyze metrics and trends

## Getting Help

- Check GitHub Actions logs for detailed error information
- Review this documentation for common issues
- Contact the development team for pipeline-specific issues
- Refer to official GitHub Actions documentation for workflow syntax