# Integration Testing Guide

This guide explains the different options for running integration tests in the RDJCustoms backend.

## Testing Options

### 1. Docker MongoDB (Recommended)

The Docker approach provides the most consistent and performant testing environment.

#### Prerequisites
- Docker installed and running
- Port 27017 available

#### Running Tests with Docker

```bash
# Option 1: Manual Docker setup
npm run docker:test:up      # Start MongoDB container
npm run test:integration:docker  # Run tests
npm run docker:test:down    # Stop container

# Option 2: Automatic (Docker will start if available)
npm run test:integration:docker
```

### 2. MongoDB Memory Server (Fallback)

If Docker is not available, tests will automatically fall back to MongoDB Memory Server.

```bash
npm run test:integration
```

**Note:** First run may take time as it downloads MongoDB binaries (~81MB).

### 3. External MongoDB Instance

For CI/CD environments or when you have an existing MongoDB instance:

```bash
MONGO_URI=mongodb://localhost:27017/test-db npm run test:integration
```

## Environment Variables

- `MONGO_URI`: Use existing MongoDB instance
- `FORCE_MEMORY_SERVER=true`: Force MongoDB Memory Server even if Docker is available
- `MONGOD_PATH`: Path to system MongoDB binary (avoids download)

## Docker Compose Commands

```bash
# Start test database
npm run docker:test:up

# View logs
npm run docker:test:logs

# Stop and remove container
npm run docker:test:down
```

## Troubleshooting

### Docker Issues

1. **Port 27017 in use**
   ```bash
   # Check what's using the port
   lsof -i :27017
   # Or modify docker-compose.test.yml to use a different port
   ```

2. **Docker not running**
   ```bash
   # Start Docker daemon
   sudo systemctl start docker  # Linux
   # Or open Docker Desktop on Mac/Windows
   ```

### MongoDB Memory Server Issues

1. **Download timeout**
   - Use Docker approach instead
   - Or pre-download MongoDB:
   ```bash
   npx mongodb-memory-server-core download
   ```

2. **System MongoDB**
   ```bash
   # Use system MongoDB to avoid download
   MONGOD_PATH=$(which mongod) npm run test:integration
   ```

## Performance Comparison

| Method | First Run | Subsequent Runs | Consistency |
|--------|-----------|-----------------|-------------|
| Docker | ~5s | ~2s | High |
| Memory Server | ~2min | ~10s | Medium |
| External | ~1s | ~1s | Depends |

## Best Practices

1. **Local Development**: Use Docker for consistency
2. **CI/CD**: Use external MongoDB service or Docker
3. **Quick Tests**: Keep Docker container running between test sessions

## Example GitHub Actions Setup

```yaml
services:
  mongodb:
    image: mongo:6.0
    ports:
      - 27017:27017

steps:
  - uses: actions/checkout@v3
  - uses: actions/setup-node@v3
  - run: npm ci
  - run: MONGO_URI=mongodb://localhost:27017/test npm run test:integration
```