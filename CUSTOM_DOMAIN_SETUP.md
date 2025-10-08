# Custom Domain Setup for RDJCustoms on Render

This guide explains how to attach your own domain to your Render-deployed RDJCustoms application.

## Overview

You'll need to set up:
1. **Frontend**: yourdomain.com (or www.yourdomain.com)
2. **Backend API**: api.yourdomain.com
3. **DNS records** pointing to Render

## Prerequisites

- Domain registered with a domain registrar (GoDaddy, Namecheap, Cloudflare, etc.)
- Access to your domain's DNS settings
- Render services deployed and running

## Step 1: Add Custom Domains in Render

### For Frontend (Static Site)

1. Go to your Render dashboard
2. Click on your frontend service (`rdjcustoms-frontend`)
3. Go to **Settings** → **Custom Domains**
4. Click **Add Custom Domain**
5. Enter your domain:
   - For apex domain: `yourdomain.com`
   - For www subdomain: `www.yourdomain.com`
   - (You can add both)
6. Click **Save**
7. Copy the provided DNS target (will look like `rdjcustoms-frontend.onrender.com`)

### For Backend API

1. Click on your backend service (`rdjcustoms-api`)
2. Go to **Settings** → **Custom Domains**
3. Click **Add Custom Domain**
4. Enter: `api.yourdomain.com`
5. Click **Save**
6. Copy the provided DNS target (will look like `rdjcustoms-api.onrender.com`)

## Step 2: Configure DNS Records

Log into your domain registrar's DNS management panel and add these records:

### Option A: Using CNAME Records (Recommended)

```
Type    Name    Value                                   TTL
----    ----    -----                                   ---
CNAME   www     rdjcustoms-frontend.onrender.com       300
CNAME   api     rdjcustoms-api.onrender.com            300
```

For apex domain (yourdomain.com without www):
- Some registrars support ALIAS/ANAME records for apex domains
- If not supported, use Option B below

### Option B: Using A Records (If CNAME not supported for apex)

First, get Render's IP addresses from their documentation, then:

```
Type    Name    Value           TTL
----    ----    -----           ---
A       @       XX.XX.XX.XX     300
A       @       YY.YY.YY.YY     300
CNAME   www     @               300
CNAME   api     rdjcustoms-api.onrender.com  300
```

### Option C: Using Cloudflare (Recommended for apex domains)

1. Add your domain to Cloudflare (free plan works)
2. Update your domain's nameservers to Cloudflare's
3. In Cloudflare DNS settings:

```
Type    Name    Content                             Proxy
----    ----    -------                             -----
CNAME   @       rdjcustoms-frontend.onrender.com   Proxied (orange cloud ON)
CNAME   www     rdjcustoms-frontend.onrender.com   Proxied
CNAME   api     rdjcustoms-api.onrender.com        DNS only (gray cloud OFF)
```

**Important**: Set API subdomain to "DNS only" to avoid CORS issues.

## Step 3: Update Environment Variables

After DNS propagation (5-30 minutes), update your services' environment variables:

### Backend Service Environment Variables

```bash
FRONTEND_URL=https://yourdomain.com
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### Frontend Service Environment Variables

```bash
VITE_API_BASE_URL=https://api.yourdomain.com
```

## Step 4: Update Application Configuration

### Update CORS in backend (if needed)

Edit `/backend/src/app.js` to include your domain:

```javascript
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://yourdomain.com',
  'https://www.yourdomain.com',
  process.env.FRONTEND_URL
].filter(Boolean);
```

### Update any hardcoded URLs

Search for any hardcoded URLs in your codebase:
```bash
grep -r "onrender.com" .
grep -r "localhost" .
```

## Step 5: SSL Certificates

Render automatically provisions SSL certificates for custom domains using Let's Encrypt. This process:
- Starts automatically after DNS is properly configured
- Takes 10-30 minutes
- Shows in your service's Custom Domains section

## Step 6: Testing

1. **DNS Propagation**: Check if DNS has propagated:
   ```bash
   nslookup yourdomain.com
   nslookup api.yourdomain.com
   ```

2. **SSL Certificate**: Verify HTTPS works:
   - https://yourdomain.com
   - https://api.yourdomain.com/api/health

3. **Frontend-Backend Communication**: 
   - Open browser console
   - Visit your site
   - Check for CORS errors
   - Verify API calls go to api.yourdomain.com

## Step 7: Redirects (Optional)

### Redirect www to non-www (or vice versa)

Add to your frontend's `public/_redirects` file:

```
# Redirect www to non-www
https://www.yourdomain.com/* https://yourdomain.com/:splat 301!

# Or redirect non-www to www
https://yourdomain.com/* https://www.yourdomain.com/:splat 301!
```

### Force HTTPS

Render automatically redirects HTTP to HTTPS, but you can add headers for extra security.

## Troubleshooting

### DNS Issues
- **Problem**: Site not accessible after adding domain
- **Solution**: 
  - Wait for DNS propagation (up to 48 hours, usually 5-30 minutes)
  - Verify DNS records are correct
  - Use `dig` or `nslookup` to check DNS resolution

### SSL Certificate Issues
- **Problem**: Certificate warning or HTTPS not working
- **Solution**:
  - Ensure DNS is properly configured
  - Check Render dashboard for certificate status
  - Wait 30 minutes for auto-provisioning
  - Contact Render support if issues persist

### CORS Errors
- **Problem**: API calls blocked by CORS
- **Solution**:
  - Update `CORS_ORIGINS` environment variable
  - Ensure API subdomain uses "DNS only" in Cloudflare
  - Restart backend service after env var changes

### Mixed Content Warnings
- **Problem**: Browser blocks insecure requests
- **Solution**:
  - Ensure all API calls use HTTPS
  - Update `VITE_API_URL` to use https://
  - Check for hardcoded http:// URLs

## Best Practices

1. **Use Subdomains**: Keep API on subdomain (api.yourdomain.com) for clear separation
2. **Environment Variables**: Never hardcode domains in code
3. **WWW Consistency**: Choose either www or non-www and redirect the other
4. **Monitoring**: Set up uptime monitoring for both domains
5. **Backup DNS**: Keep a record of your DNS settings

## Multiple Environments

For staging/development environments:

```
Production:
- Frontend: yourdomain.com
- API: api.yourdomain.com

Staging:
- Frontend: staging.yourdomain.com
- API: api-staging.yourdomain.com

Development:
- Frontend: dev.yourdomain.com
- API: api-dev.yourdomain.com
```

## Email Domain Configuration

If using custom email domain:

1. Add MX records for email provider
2. Configure SPF, DKIM, and DMARC records
3. Update `FROM_EMAIL` in backend environment variables

Example SPF record:
```
v=spf1 include:amazonses.com include:_spf.google.com ~all
```

## Next Steps

After domain setup:
1. Update all marketing materials with new domain
2. Set up 301 redirects from old domains
3. Update Google Search Console
4. Submit new sitemap
5. Update social media links
6. Configure email sending domain