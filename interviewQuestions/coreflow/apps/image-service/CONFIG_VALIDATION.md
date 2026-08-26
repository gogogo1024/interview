# Configuration Validation and Deployment Guide

## Overview

The image-service uses **Zod** for runtime configuration validation. All environment variables are validated when the application starts, ensuring that configuration errors are caught early before the service begins processing requests.

## Configuration Priority

Configuration values are loaded in this priority order:

1. **AWS AppConfig** (if ENABLE_REMOTE_CONFIG=true) - Hot-reload enabled
2. **Environment Variables** - Must be set for all required values
3. **Code Schema Defaults** - Only used in schema definitions, NOT as runtime fallbacks

⚠️ **Important**: There are NO hardcoded defaults in the application code. All configuration must come from environment variables.

## Validation Levels

### 1. Type Validation

All values are validated for correct types:

```
IMAGE_SERVICE_PORT: Must be a number (not a string like "4001")
WORKER_CONCURRENCY: Must be a number
ENABLE_REMOTE_CONFIG: Must be a boolean ("true" or "false")
```

### 2. Range Validation

Numeric values are validated to be within safe ranges:

```
Ports (IMAGE_SERVICE_PORT, REDIS_PORT):           1-65535
Batch size (MAX_BATCH_SIZE):                       1-256
Batch wait (MAX_WAIT_MS):                          10-5000ms
Timeout (DEFAULT_TIMEOUT_MS):                      1000-300000ms
Poll interval (SCHEDULE_POLL_MS):                  100-60000ms
Worker concurrency (WORKER_CONCURRENCY):           ≥1
```

### 3. String Validation

Required string values cannot be empty:

```
IMAGE_SERVICE_PORT: Not empty
REDIS_HOST: Not empty
TEMPORAL_HOST: Not empty
WORKER_ID: Not empty
```

## Container Deployment

### Docker Build

The Dockerfile does NOT include a .env file. All configuration must be provided at runtime:

```dockerfile
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
# ... copy and build ...
CMD ["node", "dist/scheduler/main.js"]
```

### Running the Container

Provide all required environment variables when running:

```bash
docker run \
  -e IMAGE_SERVICE_PORT=4001 \
  -e WORKER_CONCURRENCY=4 \
  -e REDIS_HOST=redis-service \
  -e TEMPORAL_HOST=temporal-service:7233 \
  -e SCHEDULE_POLL_MS=1000 \
  -e MAX_BATCH_SIZE=4 \
  -e MAX_WAIT_MS=50 \
  -e DEFAULT_TIMEOUT_MS=30000 \
  -e WORKER_ID=worker-1 \
  -e IMAGE_SERVICE_ENABLE_API=false \
  image-service:latest
```

### Kubernetes Deployment

Use ConfigMaps and Secrets:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: image-service-config
data:
  IMAGE_SERVICE_PORT: "4001"
  WORKER_CONCURRENCY: "4"
  REDIS_HOST: "redis.default.svc.cluster.local"
  TEMPORAL_HOST: "temporal.default.svc.cluster.local:7233"
  SCHEDULE_POLL_MS: "1000"
  MAX_BATCH_SIZE: "4"
  MAX_WAIT_MS: "50"
  DEFAULT_TIMEOUT_MS: "30000"
  WORKER_ID: "worker-1"
  IMAGE_SERVICE_ENABLE_API: "false"
  ENABLE_REMOTE_CONFIG: "true"
  REMOTE_CONFIG_POLL_MS: "60000"
  AWS_REGION: "us-east-1"
  AWS_APP_CONFIG_APPLICATION: "image-service-config"
  AWS_APP_CONFIG_ENVIRONMENT: "production"
  AWS_APP_CONFIG_PROFILE: "tunable-parameters"
  AWS_SSM_PATHS: "/app/image-service/config"
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: image-service-scheduler
spec:
  template:
    spec:
      containers:
      - name: scheduler
        image: image-service:latest
        envFrom:
        - configMapRef:
            name: image-service-config
        env:
        - name: AWS_ACCESS_KEY_ID
          valueFrom:
            secretKeyRef:
              name: aws-credentials
              key: access-key-id
        - name: AWS_SECRET_ACCESS_KEY
          valueFrom:
            secretKeyRef:
              name: aws-credentials
              key: secret-access-key
        ports:
        - containerPort: 4001
```

## Error Handling

### Startup Validation

When the service starts, all environment variables are validated:

```
✓ Image service configuration loaded and validated
  PORT: 4001
  REDIS_HOST: redis.default.svc.cluster.local
  TEMPORAL_HOST: temporal.default.svc.cluster.local:7233
```

### Validation Errors

If any environment variable is missing or invalid, the service will exit with an error:

```
Error: Environment variable validation failed:
  IMAGE_SERVICE_PORT: Must be between 1 and 65535 (received: 70000)
  REDIS_PORT: Must be between 1 and 65535 (received: invalid)
  
Fix the environment variables and restart the service.
```

### Runtime AppConfig Updates

When AppConfig is enabled, updates are validated before being applied:

```
INFO: Remote config updated: {
  updatedFields: ["inference", "scheduler"],
  tunableParams: {
    scheduler: { pollMs: 500 },
    inference: { maxBatchSize: 8 }
  }
}
```

If an AppConfig update contains invalid values, it is logged and rejected:

```
ERROR: Failed to apply remote config update: {
  error: "Validation error",
  validationError: [{
    path: ["inference", "maxBatchSize"],
    code: "too_big",
    maximum: 256,
    inclusive: true
  }]
}
```

## Migration from Hardcoded Defaults

**Before (with hardcoded defaults):**
```typescript
export function startApiServer(port = Number(getConfig().IMAGE_SERVICE_PORT || 4001)) {
  // If PORT env var missing, used hardcoded 4001
}
```

**After (with Zod validation):**
```typescript
export function startApiServer(port = Number(getConfig().IMAGE_SERVICE_PORT)) {
  // All values come from env vars - service fails fast if missing
}
```

## Benefits

1. **Fail Fast**: Configuration errors detected at startup, not during runtime
2. **Clear Error Messages**: Validation errors are specific and actionable
3. **Container Ready**: No hardcoded defaults means configuration is truly external
4. **Kubernetes Native**: Works seamlessly with ConfigMaps and Secrets
5. **Type Safe**: TypeScript enforces correct types across the codebase
6. **Production Hardened**: All required values must be explicitly set

## Testing Configuration

To test configuration in development:

```bash
# Set environment variables
export IMAGE_SERVICE_PORT=4001
export REDIS_HOST=localhost
export TEMPORAL_HOST=localhost:7233
export SCHEDULE_POLL_MS=1000
export MAX_BATCH_SIZE=4
export MAX_WAIT_MS=50
export DEFAULT_TIMEOUT_MS=30000
export WORKER_CONCURRENCY=4
export WORKER_ID=worker-1
export IMAGE_SERVICE_ENABLE_API=false

# Run the service
pnpm --filter @coreflow/image-service dev:scheduler
```

## Hot-Reload Configuration

If AppConfig is enabled (ENABLE_REMOTE_CONFIG=true):

1. Changes to tunable parameters are loaded every REMOTE_CONFIG_POLL_MS milliseconds
2. Updates are validated before being applied
3. Invalid updates are logged but do not stop the service
4. Components receive hot-reload callbacks for dynamic parameter updates

**Note**: Non-tunable parameters cannot be changed via AppConfig. They must be set via environment variables and require a service restart to take effect.

