# RDJCustoms Deployment Guide

This guide covers deploying the RDJCustoms monorepo to Render.

## Prerequisites

1. A Render account (https://render.com)
2. A MongoDB Atlas account or existing MongoDB instance
3. PayPal developer account
4. Cryptocurrency payment provider accounts (Blockonomics, GloBee)
5. AWS account for email services (SES)
6. GitHub repository with the monorepo code

## Deployment Steps

### 1. Fork/Clone and Push to GitHub

```bash
git clone <your-repo-url>
cd rdjcustoms-monorepo
git remote add origin https://github.com/YOUR_USERNAME/rdjcustoms-monorepo
git push -u origin main
```

### 2. Update render.yaml

Edit `render.yaml` and replace `YOUR_GITHUB_USERNAME` with your actual GitHub username.

### 3. Create MongoDB Database

- Option 1: Use MongoDB Atlas (recommended)
  - Create a free cluster at https://www.mongodb.com/cloud/atlas
  - Get your connection string
  
- Option 2: Use Render's MongoDB service
  - This will be created automatically from render.yaml

### 4. Deploy to Render

1. Go to https://dashboard.render.com
2. Click "New +" → "Blueprint"
3. Connect your GitHub repository
4. Select the repository containing your code
5. Render will detect the `render.yaml` file
6. Review the services and click "Apply"

### 5. Configure Environment Variables

After deployment, go to each service's dashboard and set the following environment variables:

#### Backend Service (rdjcustoms-api)

Required:
- `JWT_SECRET`: Generate a secure random string
- `JWT_REFRESH_SECRET`: Generate another secure random string
- `PAYPAL_CLIENT_ID`: From PayPal developer dashboard
- `PAYPAL_CLIENT_SECRET`: From PayPal developer dashboard

Optional:
- `BLOCKONOMICS_API_KEY`: For Bitcoin payments
- `GLOBEE_API_KEY`: For Monero payments
- `GLOBEE_SECRET`: For Monero payments
- `AWS_ACCESS_KEY_ID`: For email sending
- `AWS_SECRET_ACCESS_KEY`: For email sending
- `SENTRY_DSN`: For error tracking
- `NEW_RELIC_LICENSE_KEY`: For performance monitoring

#### Frontend Service (rdjcustoms-frontend)

- `VITE_API_BASE_URL`: Your backend API URL (will be set automatically to your Render backend URL)
- `VITE_PAYPAL_CLIENT_ID`: Same as backend's PAYPAL_CLIENT_ID

### 6. Update CORS Settings

After deployment, update the backend's environment variables:
- `FRONTEND_URL`: Set to your Render frontend URL (e.g., https://rdjcustoms-frontend.onrender.com)
- `CORS_ORIGINS`: Same as FRONTEND_URL

### 7. Initialize Database

SSH into your backend service or run locally:

```bash
npm run seed
npm run create-admin
```

### 8. Custom Domain (Optional)

1. Go to your service's Settings in Render
2. Add your custom domain
3. Follow Render's DNS configuration instructions

## Post-Deployment Checklist

- [ ] Health check endpoint responding (/api/health)
- [ ] Frontend can communicate with backend
- [ ] PayPal checkout working
- [ ] Admin login functional
- [ ] Products displaying correctly
- [ ] SSL certificates active
- [ ] Environment variables all set
- [ ] Database seeded with initial data

## Monitoring

- Backend health: https://rdjcustoms-api.onrender.com/api/health
- Frontend: https://rdjcustoms-frontend.onrender.com

## Troubleshooting

### CORS Issues
- Ensure FRONTEND_URL and CORS_ORIGINS match your frontend URL exactly
- Check that credentials: true is set in frontend API calls

### Database Connection
- Verify MONGODB_URI is correct
- Check if database user has proper permissions
- Ensure IP whitelist includes Render's IPs (or allow all: 0.0.0.0/0)

### Build Failures
- Check build logs in Render dashboard
- Ensure all dependencies are in package.json
- Verify Node.js version compatibility

### Environment Variables
- Double-check all required variables are set
- No quotes needed in Render's env var interface
- Restart service after changing env vars

## Scaling

To scale your application:
1. Upgrade your Render plan
2. Enable auto-scaling in service settings
3. Consider using Render's Redis for session management
4. Set up CDN for static assets