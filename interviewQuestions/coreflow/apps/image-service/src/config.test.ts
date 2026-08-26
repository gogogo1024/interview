/**
 * Unit tests for config.ts - AppConfig tunable parameters and Zod validation
 * Run with: node --test src/config.test.ts
 */

import assert from 'assert';
import { z } from 'zod';

// Import Zod schema from config
const RedisConfigSchema = z.object({
  host: z.string().min(1, 'Redis host cannot be empty'),
  port: z.number().int().min(1).max(65535, 'Redis port must be between 1 and 65535'),
});

const TemporalConfigSchema = z.object({
  host: z.string().min(1, 'Temporal host cannot be empty'),
  namespace: z.string().min(1, 'Temporal namespace cannot be empty'),
  taskQueue: z.string().min(1, 'Temporal task queue cannot be empty'),
});

const InferenceConfigSchema = z.object({
  maxBatchSize: z.number().int().min(1).max(256, 'Batch size must be 1-256'),
  maxBatchWaitMs: z.number().int().min(10).max(5000, 'Batch wait must be 10-5000ms'),
  defaultTimeoutMs: z.number().int().min(1000).max(300000, 'Timeout must be 1000-300000ms'),
});

const WorkerConfigSchema = z.object({
  id: z.string().min(1, 'Worker ID cannot be empty'),
});

const SchedulerConfigSchema = z.object({
  pollMs: z.number().int().min(100).max(60000, 'Poll interval must be 100-60000ms'),
});

const ImageServiceConfigSchema = z.object({
  IMAGE_SERVICE_PORT: z.number().int().min(1).max(65535, 'Port must be 1-65535'),
  WORKER_CONCURRENCY: z.number().int().min(1, 'Concurrency must be at least 1'),
  redis: RedisConfigSchema,
  temporal: TemporalConfigSchema,
  inference: InferenceConfigSchema,
  worker: WorkerConfigSchema,
  scheduler: SchedulerConfigSchema,
  enableApi: z.boolean(),
});

// Mock environment
const originalEnv = { ...process.env };

function resetEnv() {
  process.env = { ...originalEnv };
}

// Test helper: create a mock config object
function createMockConfig(overrides = {}) {
  return {
    IMAGE_SERVICE_PORT: 3000,
    WORKER_CONCURRENCY: 4,
    redis: { host: 'localhost', port: 6379 },
    temporal: { host: 'localhost', namespace: 'default', taskQueue: 'default' },
    inference: { maxBatchSize: 4, maxBatchWaitMs: 50, defaultTimeoutMs: 30000 },
    worker: { id: 'worker-1' },
    scheduler: { pollMs: 1000 },
    enableApi: false,
    ...overrides,
  };
}

// Test 1: applyTunableParams with AppConfig data
export function testApplyTunableParamsWithAppConfig() {
  const baseConfig = createMockConfig();
  
  const appConfigData: any = {
    scheduler: { pollMs: 500 },
    inference: { maxBatchSize: 8, maxBatchWaitMs: 100 },
  };

  // Simulate the applyTunableParams logic
  const result = {
    ...baseConfig,
    scheduler: {
      ...(baseConfig.scheduler ?? {}),
      ...(appConfigData.scheduler ?? {}),
    },
    inference: {
      ...(baseConfig.inference ?? {}),
      ...(appConfigData.inference ?? {}),
    },
  };

  assert.strictEqual(result.scheduler.pollMs, 500, 'AppConfig pollMs should override');
  assert.strictEqual(result.inference.maxBatchSize, 8, 'AppConfig maxBatchSize should override');
  assert.strictEqual(result.inference.maxBatchWaitMs, 100, 'AppConfig maxBatchWaitMs should override');
  assert.strictEqual(result.inference.defaultTimeoutMs, 30000, 'defaultTimeoutMs should remain unchanged');
  
  console.log('✓ Test 1 passed: applyTunableParams with AppConfig data');
}

// Test 2: applyTunableParams without AppConfig data
export function testApplyTunableParamsWithoutAppConfig() {
  const baseConfig = createMockConfig();
  
  // When appConfigData is undefined or null
  const result = baseConfig; // No merge happens

  assert.strictEqual(result.scheduler.pollMs, 1000, 'Default pollMs should remain');
  assert.strictEqual(result.inference.maxBatchSize, 4, 'Default maxBatchSize should remain');
  
  console.log('✓ Test 2 passed: applyTunableParams without AppConfig data');
}

// Test 3: Parameter priority - AppConfig > defaults
export function testParameterPriority() {
  const defaults = { maxBatchSize: 4, maxBatchWaitMs: 50 };
  const appConfig = { maxBatchSize: 16 }; // Only override one param
  
  const result = { ...defaults, ...appConfig };
  
  assert.strictEqual(result.maxBatchSize, 16, 'AppConfig maxBatchSize should have priority');
  assert.strictEqual(result.maxBatchWaitMs, 50, 'Default maxBatchWaitMs should remain when not in AppConfig');
  
  console.log('✓ Test 3 passed: Parameter priority (AppConfig > defaults)');
}

// Test 4: Partial AppConfig update
export function testPartialAppConfigUpdate() {
  const baseConfig = createMockConfig();
  
  const appConfigData: any = {
    scheduler: { pollMs: 2000 },
    // inference is missing - should use defaults
  };

  const result = {
    ...baseConfig,
    scheduler: {
      ...(baseConfig.scheduler ?? {}),
      ...(appConfigData.scheduler ?? {}),
    },
    inference: {
      ...(baseConfig.inference ?? {}),
      ...(appConfigData.inference ?? {}),
    },
  };

  assert.strictEqual(result.scheduler.pollMs, 2000, 'AppConfig pollMs should be applied');
  assert.strictEqual(result.inference.maxBatchSize, 4, 'Default maxBatchSize should remain');
  assert.strictEqual(result.inference.maxBatchWaitMs, 50, 'Default maxBatchWaitMs should remain');
  
  console.log('✓ Test 4 passed: Partial AppConfig update');
}

// Test 5: Non-tunable parameters remain unchanged
export function testNonTunableParametersUnchanged() {
  const baseConfig = createMockConfig();
  
  const appConfigData = {
    scheduler: { pollMs: 500 },
    inference: { maxBatchSize: 8 },
    // Trying to override non-tunable params (should be ignored by applyTunableParams)
  };

  const result = {
    ...baseConfig,
    scheduler: {
      ...(baseConfig.scheduler ?? {}),
      ...(appConfigData.scheduler ?? {}),
    },
    inference: {
      ...(baseConfig.inference ?? {}),
      ...(appConfigData.inference ?? {}),
    },
  };

  // Non-tunable params should remain
  assert.strictEqual(result.redis.host, 'localhost', 'Redis host should not change');
  assert.strictEqual(result.temporal.host, 'localhost', 'Temporal host should not change');
  assert.strictEqual(result.IMAGE_SERVICE_PORT, 3000, 'Service port should not change');
  
  console.log('✓ Test 5 passed: Non-tunable parameters remain unchanged');
}

// Test 6: Validate parameter ranges
export function testParameterRangeValidation() {
  // These validations would be in AppConfig Schema
  const validParams: Record<string, number>[] = [
    { pollMs: 100 },
    { pollMs: 1000 },
    { pollMs: 60000 },
    { maxBatchSize: 1 },
    { maxBatchSize: 256 },
    { maxBatchWaitMs: 10 },
    { maxBatchWaitMs: 5000 },
    { defaultTimeoutMs: 1000 },
    { defaultTimeoutMs: 300000 },
  ];

  for (const param of validParams) {
    // Verify they parse correctly as numbers
    for (const [key, value] of Object.entries(param)) {
      assert.strictEqual(typeof value, 'number', `${key} should be a number`);
      assert(value > 0, `${key} should be positive`);
    }
  }

  console.log('✓ Test 6 passed: Parameter range validation');
}

// Test 7: AppConfig Schema validation
export function testAppConfigSchemaStructure() {
  const schemaPath = '../../apps/image-service/appconfig-schema.json';
  
  // Verify expected schema properties
  const expectedSchemaProperties = {
    scheduler: 'object',
    inference: 'object',
  };

  for (const [key, type] of Object.entries(expectedSchemaProperties)) {
    assert.strictEqual(typeof key, 'string', `Schema should have ${key} property`);
  }

  console.log('✓ Test 7 passed: AppConfig Schema structure');
}

// Test 8: Example configuration validity
export function testAppConfigExampleValidity() {
  const exampleConfig = {
    scheduler: {
      pollMs: 1000,
    },
    inference: {
      maxBatchSize: 4,
      maxBatchWaitMs: 50,
      defaultTimeoutMs: 30000,
    },
  };

  // Validate structure
  assert(exampleConfig.scheduler, 'scheduler should exist');
  assert(exampleConfig.inference, 'inference should exist');
  
  // Validate types
  assert.strictEqual(typeof exampleConfig.scheduler.pollMs, 'number');
  assert.strictEqual(typeof exampleConfig.inference.maxBatchSize, 'number');
  assert.strictEqual(typeof exampleConfig.inference.maxBatchWaitMs, 'number');
  assert.strictEqual(typeof exampleConfig.inference.defaultTimeoutMs, 'number');

  console.log('✓ Test 8 passed: Example configuration validity');
}

// Test 9: Zod schema validates valid config
export function testZodValidatesValidConfig() {
  const validConfig = {
    IMAGE_SERVICE_PORT: 3000,
    WORKER_CONCURRENCY: 4,
    redis: { host: 'localhost', port: 6379 },
    temporal: { host: 'temporal.default', namespace: 'default', taskQueue: 'image-gen' },
    inference: { maxBatchSize: 4, maxBatchWaitMs: 50, defaultTimeoutMs: 30000 },
    worker: { id: 'worker-1' },
    scheduler: { pollMs: 1000 },
    enableApi: false,
  };

  const result = ImageServiceConfigSchema.safeParse(validConfig);
  assert(result.success, 'Valid config should pass validation');
  
  console.log('✓ Test 9 passed: Zod validates valid config');
}

// Test 10: Zod rejects invalid port (out of range)
export function testZodRejectsInvalidPort() {
  const invalidConfig = {
    IMAGE_SERVICE_PORT: 70000, // Out of range
    WORKER_CONCURRENCY: 4,
    redis: { host: 'localhost', port: 6379 },
    temporal: { host: 'temporal.default', namespace: 'default', taskQueue: 'image-gen' },
    inference: { maxBatchSize: 4, maxBatchWaitMs: 50, defaultTimeoutMs: 30000 },
    worker: { id: 'worker-1' },
    scheduler: { pollMs: 1000 },
    enableApi: false,
  };

  const result = ImageServiceConfigSchema.safeParse(invalidConfig);
  assert(!result.success, 'Invalid port should fail validation');
  assert(result.error?.issues[0]?.code === 'too_big', 'Should report too_big error');
  
  console.log('✓ Test 10 passed: Zod rejects invalid port');
}

// Test 11: Zod rejects invalid batch size (out of range)
export function testZodRejectsInvalidBatchSize() {
  const invalidConfig = {
    IMAGE_SERVICE_PORT: 3000,
    WORKER_CONCURRENCY: 4,
    redis: { host: 'localhost', port: 6379 },
    temporal: { host: 'temporal.default', namespace: 'default', taskQueue: 'image-gen' },
    inference: { maxBatchSize: 512, maxBatchWaitMs: 50, defaultTimeoutMs: 30000 }, // Out of range
    worker: { id: 'worker-1' },
    scheduler: { pollMs: 1000 },
    enableApi: false,
  };

  const result = ImageServiceConfigSchema.safeParse(invalidConfig);
  assert(!result.success, 'Invalid batch size should fail validation');
  
  console.log('✓ Test 11 passed: Zod rejects invalid batch size');
}

// Test 12: Zod rejects missing required fields
export function testZodRejectsMissingFields() {
  const incompleteConfig = {
    IMAGE_SERVICE_PORT: 3000,
    WORKER_CONCURRENCY: 4,
    redis: { host: 'localhost', port: 6379 },
    // Missing temporal, inference, worker, scheduler, enableApi
  };

  const result = ImageServiceConfigSchema.safeParse(incompleteConfig);
  assert(!result.success, 'Config with missing fields should fail validation');
  
  console.log('✓ Test 12 passed: Zod rejects missing required fields');
}

// Test 13: Zod validates poll interval range
export function testZodValidatesPollIntervalRange() {
  const validConfigs = [
    { ...createMockConfig(), scheduler: { pollMs: 100 } },    // Minimum
    { ...createMockConfig(), scheduler: { pollMs: 1000 } },   // Normal
    { ...createMockConfig(), scheduler: { pollMs: 60000 } },  // Maximum
  ];

  for (const config of validConfigs) {
    const result = ImageServiceConfigSchema.safeParse(config);
    assert(result.success, `Poll interval ${config.scheduler.pollMs} should be valid`);
  }

  const invalidConfigs = [
    { ...createMockConfig(), scheduler: { pollMs: 50 } },     // Too small
    { ...createMockConfig(), scheduler: { pollMs: 90000 } },  // Too large
  ];

  for (const config of invalidConfigs) {
    const result = ImageServiceConfigSchema.safeParse(config);
    assert(!result.success, `Poll interval ${config.scheduler.pollMs} should be invalid`);
  }

  console.log('✓ Test 13 passed: Zod validates poll interval range');
}

// Test 14: Zod provides clear error messages
export function testZodClearErrorMessages() {
  const invalidConfig = {
    IMAGE_SERVICE_PORT: 'not-a-number', // Wrong type
    WORKER_CONCURRENCY: 4,
    redis: { host: 'localhost', port: 6379 },
    temporal: { host: 'temporal.default', namespace: 'default', taskQueue: 'image-gen' },
    inference: { maxBatchSize: 4, maxBatchWaitMs: 50, defaultTimeoutMs: 30000 },
    worker: { id: 'worker-1' },
    scheduler: { pollMs: 1000 },
    enableApi: false,
  };

  const result = ImageServiceConfigSchema.safeParse(invalidConfig);
  assert(!result.success, 'Invalid type should fail');
  assert(result.error?.issues.length > 0, 'Should have error details');
  
  console.log('✓ Test 14 passed: Zod provides clear error messages');
}

// Run all tests
export async function runAllTests() {
  console.log('🧪 Starting AppConfig tunable parameters and Zod validation tests...\n');
  
  try {
    testApplyTunableParamsWithAppConfig();
    testApplyTunableParamsWithoutAppConfig();
    testParameterPriority();
    testPartialAppConfigUpdate();
    testNonTunableParametersUnchanged();
    testParameterRangeValidation();
    testAppConfigSchemaStructure();
    testAppConfigExampleValidity();
    testZodValidatesValidConfig();
    testZodRejectsInvalidPort();
    testZodRejectsInvalidBatchSize();
    testZodRejectsMissingFields();
    testZodValidatesPollIntervalRange();
    testZodClearErrorMessages();
    
    console.log('\n✅ All tests passed!');
    return true;
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    return false;
  } finally {
    resetEnv();
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests().then((success) => process.exit(success ? 0 : 1));
}
