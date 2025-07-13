import express from 'express';
import cors from 'cors';
import _helmet from 'helmet';
import _rateLimit from 'express-rate-limit';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

// Import routes
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import cartRoutes from './routes/cart.js';
import userRoutes from './routes/user.js';
import adminRoutes from './routes/admin.js';
import paymentRoutes from './routes/payment.js';
import shippingRoutes from './routes/shipping.js';
import supportRoutes from './routes/support.js';
import healthRoutes from './routes/health.js';
import internalOrderRoutes from './routes/internalOrderRoutes.js';
import securityRoutes from './routes/security.js';
import referralRoutes from './routes/referral.js';

// Import middleware
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';
import { inputSanitization } from './middleware/inputSanitization.js';
import { cspNonce, dynamicCSP, routeSpecificCSP, apiSecurityHeaders } from './middleware/csp.js';
import { responseSanitization, validateResponseContentType } from './middleware/responseSanitization.js';
import { securityAuditMiddleware, securityAuditLogger as _securityAuditLogger, SECURITY_EVENT_TYPES as _SECURITY_EVENT_TYPES } from './middleware/securityAuditLogger.js';
import { securityHeaders, corsConfig, rateLimiters } from './config/security.js';
import { referralTrackingMiddleware, addReferralContext } from './middleware/referralTracking.js';

const app = express();

// Trust proxy for correct IP addresses
app.set('trust proxy', 1);

// Enhanced security middleware stack
app.use(cspNonce); // Generate nonce for each request
app.use(securityHeaders); // Enhanced helmet configuration
app.use(dynamicCSP); // Dynamic CSP with nonce support

// CORS configuration
app.use(cors(corsConfig));

// Global rate limiting
app.use('/api/', rateLimiters.general);

// Route-specific rate limiting
app.use('/api/auth', rateLimiters.auth);
app.use('/api/search', rateLimiters.search);

// Input sanitization middleware
app.use(inputSanitization());

// Security audit logging
app.use(securityAuditMiddleware({
  logAllRequests: process.env.NODE_ENV === 'development',
  logFailedAuth: true,
  logSuspiciousActivity: true
}));

// Compression
app.use(compression());

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Referral tracking middleware
app.use(referralTrackingMiddleware);
app.use(addReferralContext);

// Response sanitization and content type validation
app.use(validateResponseContentType);
app.use(responseSanitization({
  enabled: true,
  sanitizeErrors: true,
  removeSensitive: true,
  logSanitization: process.env.NODE_ENV === 'development'
}));

// API Routes with route-specific security
app.use('/api/security', securityRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', routeSpecificCSP.admin, adminRoutes);
app.use('/api/payments', routeSpecificCSP.payment, paymentRoutes);
app.use('/api/shipping', shippingRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/internal/orders', internalOrderRoutes);
app.use('/api/referral', referralRoutes);

// Apply API-specific security headers to all API routes
app.use('/api/*', apiSecurityHeaders);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'RDJCustoms API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    status: 'operational'
  });
});

// 404 handler
app.use(notFound);

// Error handling middleware (must be last)
app.use(errorHandler);

export default app;