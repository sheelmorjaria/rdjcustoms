# RDJCustoms Troubleshooting Guide

## Common Issues and Solutions

### "Failed to fetch" Error When Loading Products

This error typically occurs when the frontend cannot connect to the backend API.

#### Immediate Solutions:

1. **Check Environment Variables**
   - In Render dashboard, go to your frontend service
   - Ensure `VITE_API_BASE_URL` is set correctly
   - Should be: `https://rdjcustoms-api.onrender.com` (or your custom domain)
   - **NOT** `VITE_API_URL` (common mistake)

2. **Verify Backend is Running**
   - Visit: `https://rdjcustoms-api.onrender.com/api/health`
   - Should return a JSON response with health status
   - If not accessible, check backend logs in Render

3. **Check CORS Configuration**
   - In backend service environment variables:
   - `FRONTEND_URL` should match your frontend URL exactly
   - `CORS_ORIGINS` should include all frontend URLs (comma-separated)
   - Example: `https://rdjcustoms-frontend.onrender.com,https://yourdomain.com`

4. **Clear Browser Cache**
   - Hard refresh: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
   - Try incognito/private browsing mode
   - Check browser console for specific error messages

#### Debugging Steps:

1. **Check Browser Console**
   ```javascript
   // Open browser console and check:
   console.log(import.meta.env.VITE_API_BASE_URL);
   // Should show your backend URL
   ```

2. **Test API Directly**
   ```bash
   curl https://rdjcustoms-api.onrender.com/api/products
   # Should return product data
   ```

3. **Check Network Tab**
   - Open browser DevTools → Network tab
   - Refresh page
   - Look for failed requests to /api/products
   - Check request headers and response

### CORS Errors

#### Symptoms:
- "Access to fetch at '...' from origin '...' has been blocked by CORS policy"
- "No 'Access-Control-Allow-Origin' header is present"

#### Solutions:

1. **Update Backend CORS Settings**
   ```javascript
   // Ensure backend includes your frontend URL
   CORS_ORIGINS=https://your-frontend-url.com
   ```

2. **Check Protocol Mismatch**
   - Both frontend and backend must use HTTPS
   - No mixing HTTP and HTTPS

3. **Trailing Slashes**
   - Remove trailing slashes from URLs
   - ❌ `https://example.com/`
   - ✅ `https://example.com`

### Build Failures

#### Frontend Build Issues:

1. **Missing Dependencies**
   ```bash
   npm install
   npm run build --workspace=@rdjcustoms/frontend
   ```

2. **Environment Variables**
   - Build-time variables must start with `VITE_`
   - Set in Render dashboard before build

#### Backend Build Issues:

1. **Module Resolution**
   - Check all imports use correct paths
   - Verify shared packages are properly linked

### Database Connection Issues

#### Symptoms:
- "MongooseServerSelectionError"
- API returns 500 errors

#### Solutions:

1. **Check MongoDB URI**
   - Format: `mongodb+srv://username:password@cluster.mongodb.net/database`
   - Special characters in password must be URL-encoded

2. **IP Whitelist**
   - In MongoDB Atlas: Network Access → Add IP
   - For Render: Allow access from anywhere (0.0.0.0/0)

3. **Connection String Options**
   ```
   MONGODB_URI=mongodb+srv://...?retryWrites=true&w=majority
   ```

### SSL Certificate Issues

#### Symptoms:
- Browser shows "Not Secure" warning
- HTTPS not working after domain setup

#### Solutions:

1. **Wait for Provisioning**
   - SSL certificates take 10-30 minutes
   - Check Render dashboard → Custom Domains

2. **DNS Configuration**
   - Ensure DNS records point to Render
   - Use `dig` or `nslookup` to verify

### Performance Issues

#### Slow API Responses:

1. **Check Service Plan**
   - Free tier may sleep after inactivity
   - Upgrade to paid plan for always-on

2. **Database Indexes**
   - Ensure proper indexes on frequently queried fields
   - Check MongoDB Atlas performance tab

3. **Enable Caching**
   - Implement Redis for session/cache
   - Use CDN for static assets

### Authentication Issues

#### "Unauthorized" Errors:

1. **Check JWT Secrets**
   - `JWT_SECRET` and `JWT_REFRESH_SECRET` must be set
   - Must be the same values used when creating tokens

2. **Cookie Settings**
   - Ensure `sameSite` and `secure` settings match deployment
   - Production requires `secure: true` for HTTPS

3. **Token Expiration**
   - Check token expiry times
   - Implement refresh token rotation

### Payment Integration Issues

#### PayPal Not Working:

1. **Environment Mismatch**
   - Sandbox credentials for development
   - Live credentials for production
   - Check `PAYPAL_ENVIRONMENT` setting

2. **Client ID Sync**
   - Frontend `VITE_PAYPAL_CLIENT_ID` must match backend

#### Cryptocurrency Payments:

1. **API Keys**
   - Verify Blockonomics/GloBee API keys
   - Check for IP restrictions

2. **Webhook URLs**
   - Update webhook URLs in provider dashboard
   - Must be publicly accessible

### Email Sending Issues

1. **AWS SES Configuration**
   - Verify sender email address
   - Check AWS region settings
   - Ensure IAM permissions

2. **SMTP Fallback**
   - Configure alternative SMTP if SES fails
   - Check spam folders

### Debugging Tools

1. **Render Logs**
   ```bash
   # View live logs in Render dashboard
   # Or use Render CLI:
   render logs --service rdjcustoms-api --tail
   ```

2. **Health Check**
   ```bash
   curl https://your-api-url/api/health/detailed
   ```

3. **Environment Verification**
   ```bash
   # Add temporary endpoint to verify env vars (remove in production)
   app.get('/api/debug/env', (req, res) => {
     res.json({
       frontend_url: process.env.FRONTEND_URL,
       cors_configured: !!process.env.CORS_ORIGINS,
       db_connected: mongoose.connection.readyState === 1
     });
   });
   ```

### Getting Help

1. **Check Logs First**
   - Render service logs
   - Browser console
   - Network tab

2. **Provide Information**
   - Error messages
   - Steps to reproduce
   - Environment (production/staging)
   - Recent changes

3. **Contact Support**
   - Render support for deployment issues
   - MongoDB Atlas support for database issues
   - GitHub issues for application bugs