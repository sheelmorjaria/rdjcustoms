# Local Development Setup

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Backend** (Terminal 1)
   ```bash
   cd backend
   npm run dev
   ```
   Backend will run on http://localhost:3000

3. **Start Frontend** (Terminal 2)
   ```bash
   cd frontend
   npm run dev
   ```
   Frontend will run on http://localhost:5173

## Troubleshooting Local Setup

### "Failed to fetch" or No Products Showing

1. **Check Backend is Running**
   - Open http://localhost:3000/api/health
   - Should return JSON with health status

2. **Check Frontend Environment**
   - Frontend `.env` file should have:
     ```
     VITE_API_BASE_URL=http://localhost:3000
     ```
   - NOT `https://your-backend-ngrok-url.ngrok-free.app`

3. **Check MongoDB is Running**
   ```bash
   # Check if MongoDB is running
   sudo systemctl status mongod
   
   # Or if using MongoDB locally
   ps aux | grep mongod
   ```

4. **Seed the Database**
   ```bash
   cd backend
   npm run seed
   ```

5. **Check for Products in Database**
   ```bash
   cd backend
   node -e "
   import mongoose from 'mongoose';
   import Product from './src/models/Product.js';
   
   mongoose.connect('mongodb://localhost:27017/graphene-store')
     .then(async () => {
       const count = await Product.countDocuments();
       console.log('Total products:', count);
       const products = await Product.find().limit(5);
       console.log('Sample products:', products.map(p => p.name));
       process.exit(0);
     })
     .catch(err => {
       console.error('Error:', err);
       process.exit(1);
     });
   "
   ```

### Common Issues

1. **Port Already in Use**
   ```bash
   # Kill process on port 3000
   lsof -ti:3000 | xargs kill -9
   
   # Kill process on port 5173
   lsof -ti:5173 | xargs kill -9
   ```

2. **MongoDB Connection Failed**
   ```bash
   # Start MongoDB
   sudo systemctl start mongod
   
   # Or on Mac
   brew services start mongodb-community
   ```

3. **Environment Variables Not Loading**
   - After changing .env files, restart the dev servers
   - Vite requires `VITE_` prefix for frontend env vars

4. **CORS Errors**
   - Backend allows localhost:3000 and localhost:5173 by default
   - Check browser console for specific CORS error messages

## Verify Everything is Working

1. **Backend Health Check**
   ```bash
   curl http://localhost:3000/api/health
   ```

2. **Products API**
   ```bash
   curl http://localhost:3000/api/products
   ```

3. **Frontend Debug Page**
   - Navigate to http://localhost:5173/debug
   - Shows environment variables and API connection status

4. **API Test Page**
   - Navigate to http://localhost:5173/api-test.html
   - Tests API connectivity directly

## Development Tips

- Use the monorepo scripts from root directory:
  ```bash
  npm run dev  # Starts both frontend and backend
  ```

- Watch logs in both terminal windows for errors

- MongoDB connection string in backend/.env should be:
  ```
  MONGODB_URI=mongodb://localhost:27017/graphene-store
  ```

- Frontend will auto-reload on changes
- Backend uses nodemon for auto-reload