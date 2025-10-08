# Production Deployment Guide

## Pre-Deployment Checklist

### 1. Environment Variables

#### Backend Required Environment Variables
```bash
# Database
MONGODB_URI=mongodb://localhost:27017/graphene-store-prod
DB_NAME=graphene-store-prod

# JWT
JWT_SECRET=your-very-secure-jwt-secret-here
JWT_EXPIRES_IN=7d

# PayPal Configuration
PAYPAL_CLIENT_ID=your-production-paypal-client-id
PAYPAL_CLIENT_SECRET=your-production-paypal-client-secret
PAYPAL_ENVIRONMENT=live

# Bitcoin Configuration (Blockonomics)
BLOCKONOMICS_API_KEY=your-blockonomics-api-key

# Monero Configuration (GloBee)
GLOBEE_API_URL=https://api.globee.com/v1
GLOBEE_API_KEY=your-globee-api-key
GLOBEE_SECRET=your-globee-secret

# Email Configuration (AWS SES)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
FROM_EMAIL=noreply@yourdomain.com
ADMIN_EMAIL=admin@yourdomain.com

# Application Configuration
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://yourdomain.com
CORS_ORIGIN=https://yourdomain.com

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100

# Logging (New Relic)
NEW_RELIC_LICENSE_KEY=your-newrelic-license-key
NEW_RELIC_APP_NAME=GrapheneOS-Store-Backend

# Error Tracking (Sentry)
SENTRY_DSN=your-sentry-dsn
```

#### Frontend Required Environment Variables
```bash
# API Configuration
VITE_API_URL=https://api.yourdomain.com
VITE_APP_NAME=RDJCustoms

# PayPal Configuration
VITE_PAYPAL_CLIENT_ID=your-production-paypal-client-id

# Analytics (optional)
VITE_GA_TRACKING_ID=your-google-analytics-id
```

### 2. Database Setup

#### MongoDB Production Configuration
```bash
# Create production database
use graphene-store-prod

# Create indexes for performance
db.products.createIndex({ "slug": 1 }, { unique: true })
db.products.createIndex({ "category": 1 })
db.products.createIndex({ "price": 1 })
db.products.createIndex({ "isActive": 1 })

db.orders.createIndex({ "orderNumber": 1 }, { unique: true })
db.orders.createIndex({ "userId": 1 })
db.orders.createIndex({ "paymentStatus": 1 })
db.orders.createIndex({ "status": 1 })
db.orders.createIndex({ "createdAt": -1 })

db.users.createIndex({ "email": 1 }, { unique: true })
db.users.createIndex({ "isEmailVerified": 1 })

db.carts.createIndex({ "userId": 1 })
db.carts.createIndex({ "sessionId": 1 })
db.carts.createIndex({ "updatedAt": 1 })
```

### 3. SSL/TLS Configuration

#### Nginx Configuration Example
```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /path/to/your/cert.pem;
    ssl_certificate_key /path/to/your/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;

    # Backend API
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Frontend static files
    location / {
        root /path/to/frontend/dist;
        try_files $uri $uri/ /index.html;
        
        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;
        add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.paypal.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.yourdomain.com;" always;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

### 4. Application Security

#### Security Headers (handled by helmet middleware)
- Content Security Policy
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection
- Strict-Transport-Security

#### Rate Limiting Configuration
```javascript
// Already implemented in production
const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});
```

### 5. Payment Gateway Configuration

#### PayPal Production Setup
1. Switch to live PayPal environment
2. Update webhook URLs to production endpoints
3. Verify IPN/webhook security
4. Test payment flows in production

#### Cryptocurrency Setup
1. Configure Blockonomics for Bitcoin
2. Set up GloBee for Monero
3. Verify webhook endpoints are accessible
4. Test payment confirmations

### 6. Monitoring and Logging

#### Application Performance Monitoring (New Relic)
```javascript
// Already configured in logger.js
// Ensure NEW_RELIC_LICENSE_KEY is set
```

#### Error Tracking (Sentry)
```javascript
// Already configured in logger.js
// Ensure SENTRY_DSN is set
```

#### Log Management
- Centralized logging via AWS CloudWatch
- Error alerts configured
- Performance monitoring active

## Deployment Process

### 1. Build Applications

#### Backend
```bash
cd backend
npm ci --production
npm run test
npm run lint
```

#### Frontend
```bash
cd frontend
npm ci
npm run build
npm run lint
```

### 2. Deploy Backend

#### Using PM2 (Process Manager)
```bash
# Install PM2 globally
npm install -g pm2

# Create ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'graphene-backend',
    script: './server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
}
EOF

# Start application
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 3. Deploy Frontend

#### Static File Deployment
```bash
# Build for production
npm run build

# Deploy to web server
rsync -av dist/ user@server:/var/www/yourdomain.com/
```

### 4. Database Migration

#### Create Admin User
```bash
cd backend
node src/scripts/createAdminUser.js
```

#### Seed Initial Data (if needed)
```bash
# Add categories, shipping methods, etc.
node src/scripts/seedData.js
```

## Post-Deployment Verification

### 1. Health Checks

#### API Health Check
```bash
curl https://api.yourdomain.com/api/health
# Expected: {"status": "ok", "timestamp": "..."}
```

#### Payment Gateway Tests
```bash
# Test PayPal integration
curl -X POST https://api.yourdomain.com/api/payments/methods
# Verify all payment methods are available
```

### 2. Functional Testing

#### Critical User Flows
1. User registration and login
2. Product browsing and search
3. Add to cart functionality
4. Checkout process
5. Payment processing (PayPal, Bitcoin, Monero)
6. Order confirmation
7. Admin dashboard access

### 3. Performance Testing

#### Load Testing
```bash
# Use artillery or similar tool
npm install -g artillery
artillery run load-test-config.yml
```

### 4. Security Testing

#### SSL Configuration
```bash
# Test SSL configuration
ssllabs.com/ssltest/analyze.html?d=yourdomain.com
```

#### Security Headers
```bash
# Check security headers
curl -I https://yourdomain.com
```

## Monitoring and Maintenance

### 1. Application Monitoring

#### Metrics to Monitor
- Response times
- Error rates
- Payment success rates
- Database performance
- Memory usage
- CPU utilization

#### Alert Thresholds
- API response time > 2 seconds
- Error rate > 5%
- Payment failure rate > 2%
- Database connection failures

### 2. Log Analysis

#### Key Logs to Monitor
- Application errors
- Payment processing logs
- Authentication failures
- API rate limit hits
- Database query performance

### 3. Backup Strategy

#### Database Backups
```bash
# Daily MongoDB backup
mongodump --uri="mongodb://localhost:27017/graphene-store-prod" --out=/backups/$(date +%Y%m%d)
```

#### Application Backups
- Source code versioning (Git)
- Environment configuration backups
- SSL certificate backups

### 4. Update Process

#### Security Updates
1. Monitor security advisories
2. Test updates in staging
3. Deploy during maintenance windows
4. Verify functionality post-update

#### Application Updates
1. Use blue-green deployment
2. Database migration scripts
3. Rollback procedures
4. Feature flag management

## Troubleshooting

### Common Issues

#### Database Connection Issues
```bash
# Check MongoDB status
systemctl status mongod
# Check connection string and credentials
```

#### Payment Gateway Issues
```bash
# Check webhook endpoints
curl -X POST https://api.yourdomain.com/api/payments/paypal/webhook
# Verify API credentials
```

#### SSL Certificate Issues
```bash
# Check certificate expiry
openssl x509 -in /path/to/cert.pem -text -noout | grep "Not After"
```

### Emergency Contacts

#### Service Providers
- PayPal Merchant Support
- MongoDB Atlas Support
- AWS Support
- Domain/SSL Provider Support

#### Internal Team
- Development Team Lead
- DevOps Engineer
- System Administrator

## Security Considerations

### 1. Data Protection
- PCI DSS compliance for payment data
- GDPR compliance for user data
- Regular security audits
- Penetration testing

### 2. Access Control
- Multi-factor authentication for admin access
- Role-based permissions
- Regular access reviews
- Secure key management

### 3. Incident Response
- Security incident procedures
- Data breach notification process
- Forensic analysis capabilities
- Recovery procedures

This guide ensures a secure, scalable, and maintainable production deployment of the RDJCustoms application.