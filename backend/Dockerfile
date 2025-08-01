# Backend Dockerfile
FROM node:18-alpine AS base

# Install dependencies for bcrypt and other native modules
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy root package files (monorepo)
COPY package*.json ./
COPY packages/shared-constants/package.json ./packages/shared-constants/

# Copy backend package files
COPY backend/package*.json ./backend/

# Development stage
FROM base AS dev
ENV NODE_ENV=development
RUN npm ci --workspace=@rdjcustoms/backend
COPY packages/shared-constants ./packages/shared-constants
COPY backend ./backend
WORKDIR /app/backend
EXPOSE 5000
CMD ["npm", "run", "dev"]

# Production dependencies stage
FROM base AS prod-deps
ENV NODE_ENV=production
RUN npm ci --workspace=@rdjcustoms/backend --omit=dev

# Build stage
FROM base AS build
ENV NODE_ENV=production
RUN npm ci --workspace=@rdjcustoms/backend
COPY packages/shared-constants ./packages/shared-constants
COPY backend ./backend
# If you have a build step, uncomment the next line
# RUN npm run build

# Production stage
FROM node:18-alpine AS production
RUN apk add --no-cache tini
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy production dependencies and shared packages
COPY --from=prod-deps --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=prod-deps --chown=nodejs:nodejs /app/packages ./packages
COPY --from=prod-deps --chown=nodejs:nodejs /app/backend/node_modules ./backend/node_modules

# Copy application code
COPY --chown=nodejs:nodejs packages/shared-constants ./packages/shared-constants
COPY --chown=nodejs:nodejs backend ./backend

WORKDIR /app/backend

# Create uploads directory with proper permissions
RUN mkdir -p uploads/products && \
    chown -R nodejs:nodejs uploads

# Create logs directory
RUN mkdir -p logs && \
    chown -R nodejs:nodejs logs

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 5000

# Use tini to handle signals properly
ENTRYPOINT ["/sbin/tini", "--"]

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1); })"

# Start the application
CMD ["node", "server.js"]