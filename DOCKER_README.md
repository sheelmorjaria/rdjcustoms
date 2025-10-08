# Docker Setup for RDJCustoms

This document provides comprehensive instructions for running the RDJCustoms using Docker and Docker Compose.

## Prerequisites

- Docker 20.10+ and Docker Compose 2.0+
- Make (optional, for using Makefile commands)
- 4GB+ RAM and 10GB+ disk space

## Quick Start

1. **Clone and setup environment:**
   ```bash
   git clone <repository-url>
   cd graphene-mono
   make setup-env
   ```

2. **Edit configuration:**
   ```bash
   # Edit .env file with your settings
   nano .env
   ```

3. **Start development environment:**
   ```bash
   make dev
   ```

4. **Access the application:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000
   - MongoDB: localhost:27017

## Environment Configurations

### Development Environment
```bash
# Start development with hot reload
make dev

# Or manually:
docker-compose -f docker-compose.dev.yml up --build
```

**Features:**
- Hot reloading for both frontend and backend
- Source code mounted as volumes
- Debug logging enabled
- Development dependencies included

### Production Environment
```bash
# Start production environment
make prod

# Or manually:
docker-compose up --build -d
```

**Features:**
- Optimized builds
- Nginx reverse proxy
- SSL termination
- Production optimizations
- Health checks

### Test Environment
```bash
# Run test suite
make test

# Run E2E tests
make test-e2e
```

**Features:**
- Isolated test databases
- Temporary storage (tmpfs)
- Automated test execution
- Coverage reporting

## Services Overview

### Backend Service
- **Image**: Node.js 18 Alpine
- **Port**: 5000
- **Health Check**: `/api/health`
- **Volumes**: uploads, logs
- **Dependencies**: MongoDB, Redis

### Frontend Service
- **Development**: Vite dev server on port 5173
- **Production**: Nginx serving static files on port 8080
- **Health Check**: `/health`

### MongoDB Database
- **Image**: MongoDB 6.0
- **Port**: 27017
- **Initialization**: Custom script with sample data
- **Persistence**: Named volume

### Redis Cache
- **Image**: Redis 7 Alpine
- **Port**: 6379
- **Persistence**: Named volume
- **Password protected**

### Nginx Reverse Proxy (Production)
- **Image**: Nginx Alpine
- **Ports**: 80 (HTTP), 443 (HTTPS)
- **Features**: SSL termination, rate limiting, compression

## Configuration

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Application
NODE_ENV=production
PORT=5000

# Database
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=secure-password
MONGODB_URI=mongodb://admin:password@mongodb:27017/graphene_store

# Security
JWT_SECRET=your-long-random-secret
SESSION_SECRET=another-long-random-secret

# Payment Gateways
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-secret
BITCOIN_API_KEY=your-bitcoin-api-key
MONERO_API_KEY=your-monero-api-key

# AWS Services
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_REGION=eu-west-2
```

### SSL Configuration (Production)

1. **Generate SSL certificates:**
   ```bash
   mkdir -p nginx/ssl
   openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
     -keyout nginx/ssl/private.key \
     -out nginx/ssl/cert.pem
   ```

2. **Or use Let's Encrypt:**
   ```bash
   # Install certbot
   certbot certonly --webroot -w ./nginx/ssl -d yourdomain.com
   ```

## Makefile Commands

Use the included Makefile for common operations:

```bash
make help          # Show all available commands
make setup-env     # Create .env from example
make dev           # Start development environment
make prod          # Start production environment
make test          # Run test suite
make logs          # Show all service logs
make clean         # Remove all containers and volumes
make shell-backend # Open shell in backend container
make shell-db      # Open MongoDB shell
```

## Development Workflow

### 1. Initial Setup
```bash
make setup-env
# Edit .env file
make dev
```

### 2. Making Changes
- Backend changes: Files auto-reload in development
- Frontend changes: Vite hot reload
- Database changes: Use mongo shell or admin tools

### 3. Testing
```bash
# Run unit and integration tests
make test

# Run specific tests
docker-compose exec backend npm run test:unit
docker-compose exec frontend npm run test

# Run E2E tests
make test-e2e
```

### 4. Debugging
```bash
# View logs
make backend-logs
make frontend-logs
make db-logs

# Shell access
make shell-backend
make shell-db

# Monitor resources
make monitor
```

## Production Deployment

### 1. Build and Deploy
```bash
# Build production images
docker-compose build

# Start production stack
make prod

# Verify health
make health
```

### 2. Database Management
```bash
# Backup database
make db-backup

# Restore database
make db-restore

# Run migrations (if needed)
docker-compose exec backend npm run migrate
```

### 3. Monitoring
```bash
# Check service status
docker-compose ps

# Monitor resource usage
make monitor

# View logs
make logs
```

## Troubleshooting

### Common Issues

1. **Port conflicts:**
   ```bash
   # Check what's using ports
   lsof -i :5000
   lsof -i :3000
   lsof -i :27017
   
   # Stop conflicting services
   sudo systemctl stop mongodb
   ```

2. **Permission issues:**
   ```bash
   # Fix file permissions
   sudo chown -R $USER:$USER uploads/
   sudo chown -R $USER:$USER logs/
   ```

3. **MongoDB connection issues:**
   ```bash
   # Check MongoDB logs
   make db-logs
   
   # Test connection
   make shell-db
   ```

4. **Memory issues:**
   ```bash
   # Increase Docker memory limit
   # Docker Desktop: Settings > Resources > Memory
   
   # Monitor usage
   docker stats
   ```

### Performance Optimization

1. **Database indexing:**
   ```bash
   make shell-db
   # In MongoDB shell:
   db.products.createIndex({ name: "text" })
   db.orders.createIndex({ userId: 1, createdAt: -1 })
   ```

2. **Container resource limits:**
   ```yaml
   # In docker-compose.yml
   deploy:
     resources:
       limits:
         memory: 512M
         cpus: '0.5'
   ```

3. **Nginx optimization:**
   ```nginx
   # In nginx.conf
   worker_processes auto;
   worker_connections 2048;
   ```

## Security Considerations

### 1. Secrets Management
- Never commit `.env` files
- Use Docker secrets in production
- Rotate credentials regularly

### 2. Network Security
- Use internal networks for service communication
- Expose only necessary ports
- Implement rate limiting

### 3. Container Security
- Run containers as non-root users
- Use official, minimal base images
- Regularly update dependencies

### 4. SSL/TLS
- Use strong SSL ciphers
- Implement HSTS headers
- Regular certificate renewal

## Backup and Recovery

### Automated Backups
```bash
# Create backup script
cat > backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker-compose exec mongodb mongodump --out /backup/db_$DATE
docker-compose exec backend tar -czf /backup/uploads_$DATE.tar.gz /app/uploads
EOF

# Schedule with cron
crontab -e
# Add: 0 2 * * * /path/to/backup.sh
```

### Disaster Recovery
```bash
# Restore from backup
docker-compose down
docker volume rm graphene-mono_mongodb_data
docker-compose up -d mongodb
# Wait for MongoDB to start
make db-restore
docker-compose up -d
```

## Monitoring and Logging

### Log Management
```bash
# Centralized logging with ELK stack
docker-compose -f docker-compose.yml -f docker-compose.monitoring.yml up

# Log rotation
docker system prune --filter "until=24h"
```

### Health Monitoring
```bash
# Set up health checks
curl -f http://localhost:5000/api/health
curl -f http://localhost:3000/health

# Automated monitoring with Prometheus
# See docker-compose.monitoring.yml
```

## Contributing

When developing with Docker:

1. Use development environment: `make dev`
2. Write tests and ensure they pass: `make test`
3. Check logs for errors: `make logs`
4. Verify production build: `make prod`
5. Clean up when done: `make clean`

## Support

For issues related to Docker setup:

1. Check the logs: `make logs`
2. Verify configuration: `cat .env`
3. Test individual services: `docker-compose ps`
4. Review this documentation
5. Check Docker and Docker Compose versions