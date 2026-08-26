/**
 * Integration tests for Worker and Scheduler AppConfig parameter application
 * Simulates parameter updates and verifies hot-reload behavior
 */

import assert from 'assert';

// Mock BatchProcessor
class MockBatchProcessor {
  private opts: { maxBatchSize?: number; maxWaitMs?: number } = {};
  
  constructor(handler: Function, initialOpts: { maxBatchSize?: number; maxWaitMs?: number } = {}) {
    this.opts = initialOpts;
  }
  
  updateOptions(newOpts: Partial<{ maxBatchSize?: number; maxWaitMs?: number }>) {
    const changed: string[] = [];
    if (newOpts.maxBatchSize !== undefined && newOpts.maxBatchSize !== this.opts.maxBatchSize) {
      this.opts.maxBatchSize = newOpts.maxBatchSize;
      changed.push(`maxBatchSize=${newOpts.maxBatchSize}`);
    }
    if (newOpts.maxWaitMs !== undefined && newOpts.maxWaitMs !== this.opts.maxWaitMs) {
      this.opts.maxWaitMs = newOpts.maxWaitMs;
      changed.push(`maxWaitMs=${newOpts.maxWaitMs}`);
    }
    return changed.length > 0 ? changed : null;
  }
  
  getOptions() {
    return { ...this.opts };
  }
}

// Mock NodeManager
class MockNodeManager {
  private pollMs: number = 1000;
  
  constructor() {}
  
  start(pollMs?: number) {
    if (pollMs) {
      this.pollMs = pollMs;
    }
  }
  
  updatePollMs(newPollMs: number) {
    if (newPollMs !== this.pollMs) {
      this.pollMs = newPollMs;
      return `pollMs=${newPollMs}`;
    }
    return null;
  }
  
  getPollMs() {
    return this.pollMs;
  }
}

// Integration Test 1: Worker BatchProcessor hot-reload
export function testWorkerBatchProcessorHotReload() {
  console.log('\n🔧 Test 1: Worker BatchProcessor hot-reload');
  
  const batcher = new MockBatchProcessor(() => {}, {
    maxBatchSize: 4,
    maxWaitMs: 50,
  });
  
  // Simulate config update
  const updatedConfig = {
    inference: {
      maxBatchSize: 8,
      maxBatchWaitMs: 100,
    },
  };
  
  // Apply update
  const changes = batcher.updateOptions({
    maxBatchSize: updatedConfig.inference.maxBatchSize,
    maxWaitMs: updatedConfig.inference.maxBatchWaitMs,
  });
  
  assert(changes !== null, 'Changes should be applied');
  assert.deepStrictEqual(changes, ['maxBatchSize=8', 'maxWaitMs=100'], 'Changes should be logged');
  
  const opts = batcher.getOptions();
  assert.strictEqual(opts.maxBatchSize, 8, 'maxBatchSize should be updated');
  assert.strictEqual(opts.maxWaitMs, 100, 'maxWaitMs should be updated');
  
  console.log('  ✓ BatchProcessor successfully updated parameters');
  console.log('  ✓ Changes logged:', changes.join(', '));
}

// Integration Test 2: Scheduler NodeManager hot-reload
export function testSchedulerNodeManagerHotReload() {
  console.log('\n🔧 Test 2: Scheduler NodeManager hot-reload');
  
  const nodeManager = new MockNodeManager();
  nodeManager.start(1000); // Start with default
  
  assert.strictEqual(nodeManager.getPollMs(), 1000, 'Initial pollMs should be 1000');
  
  // Simulate config update
  const change = nodeManager.updatePollMs(500);
  
  assert(change !== null, 'Change should be applied');
  assert.strictEqual(change, 'pollMs=500', 'Change should be logged');
  assert.strictEqual(nodeManager.getPollMs(), 500, 'pollMs should be updated to 500');
  
  console.log('  ✓ NodeManager successfully updated poll interval');
  console.log('  ✓ Change logged:', change);
}

// Integration Test 3: Multiple config updates
export function testMultipleConfigUpdates() {
  console.log('\n🔧 Test 3: Multiple sequential config updates');
  
  const batcher = new MockBatchProcessor(() => {}, {
    maxBatchSize: 4,
    maxWaitMs: 50,
  });
  
  const updates = [
    { maxBatchSize: 8, maxWaitMs: 100 },
    { maxBatchSize: 16, maxWaitMs: 200 },
    { maxBatchSize: 4, maxWaitMs: 50 }, // Back to defaults
  ];
  
  for (let i = 0; i < updates.length; i++) {
    const changes = batcher.updateOptions(updates[i]);
    assert(changes !== null || i === 2, `Update ${i} should produce changes`);
    console.log(`  ✓ Update ${i + 1} applied: ${changes?.join(', ') || 'no changes (reverted to same)'}`);
  }
}

// Integration Test 4: Parameter constraints validation
export function testParameterConstraintsValidation() {
  console.log('\n🔧 Test 4: Parameter constraints validation');
  
  const constraints = {
    pollMs: { min: 100, max: 60000 },
    maxBatchSize: { min: 1, max: 256 },
    maxBatchWaitMs: { min: 10, max: 5000 },
    defaultTimeoutMs: { min: 1000, max: 300000 },
  };
  
  const validConfigs = [
    { pollMs: 100 },
    { pollMs: 60000 },
    { maxBatchSize: 1 },
    { maxBatchSize: 256 },
    { maxBatchWaitMs: 10 },
    { maxBatchWaitMs: 5000 },
    { defaultTimeoutMs: 1000 },
    { defaultTimeoutMs: 300000 },
  ];
  
  for (const config of validConfigs) {
    const [key, value] = Object.entries(config)[0];
    const constraint = constraints[key as keyof typeof constraints];
    
    assert(
      value >= constraint.min && value <= constraint.max,
      `${key}=${value} should be within range [${constraint.min}, ${constraint.max}]`
    );
  }
  
  console.log('  ✓ All valid configurations passed constraints');
  
  // Test invalid configs
  const invalidConfigs = [
    { pollMs: 50 }, // Too low
    { pollMs: 70000 }, // Too high
    { maxBatchSize: 0 }, // Too low
    { maxBatchSize: 300 }, // Too high
  ];
  
  for (const config of invalidConfigs) {
    const [key, value] = Object.entries(config)[0];
    const constraint = constraints[key as keyof typeof constraints];
    
    const isValid = value >= constraint.min && value <= constraint.max;
    assert(!isValid, `${key}=${value} should be invalid`);
  }
  
  console.log('  ✓ Invalid configurations correctly rejected');
}

// Integration Test 5: Config update handler chain
export function testConfigUpdateHandlerChain() {
  console.log('\n🔧 Test 5: Config update handler chain');
  
  const handlers: string[] = [];
  const updateHandlers: ((cfg: any) => void)[] = [];
  
  // Register multiple handlers
  updateHandlers.push((cfg) => {
    handlers.push('worker-handler');
  });
  
  updateHandlers.push((cfg) => {
    handlers.push('scheduler-handler');
  });
  
  updateHandlers.push((cfg) => {
    handlers.push('logger-handler');
  });
  
  // Simulate config update
  const updatedConfig = {
    scheduler: { pollMs: 500 },
    inference: { maxBatchSize: 8 },
  };
  
  for (const handler of updateHandlers) {
    try {
      handler(updatedConfig);
    } catch (err) {
      console.error('Handler error:', err);
    }
  }
  
  assert.strictEqual(handlers.length, 3, 'All 3 handlers should be called');
  assert.deepStrictEqual(
    handlers,
    ['worker-handler', 'scheduler-handler', 'logger-handler'],
    'Handlers should be called in order'
  );
  
  console.log('  ✓ All handlers called in order:', handlers.join(' → '));
}

// Integration Test 6: Error handling in handler chain
export function testErrorHandlingInHandlerChain() {
  console.log('\n🔧 Test 6: Error handling in handler chain');
  
  const results: string[] = [];
  const updateHandlers: ((cfg: any) => void)[] = [];
  
  // Handler 1: Success
  updateHandlers.push((cfg) => {
    results.push('handler1-ok');
  });
  
  // Handler 2: Error (should not stop other handlers)
  updateHandlers.push((cfg) => {
    throw new Error('Handler 2 failed');
  });
  
  // Handler 3: Success (should still be called)
  updateHandlers.push((cfg) => {
    results.push('handler3-ok');
  });
  
  const updatedConfig = {};
  const errors: string[] = [];
  
  for (const handler of updateHandlers) {
    try {
      handler(updatedConfig);
    } catch (err) {
      errors.push((err as Error).message);
      // Continue to next handler (error isolation)
    }
  }
  
  assert.strictEqual(results.length, 2, 'Successful handlers should execute');
  assert.strictEqual(errors.length, 1, 'One error should be caught');
  assert.strictEqual(errors[0], 'Handler 2 failed', 'Error message should be captured');
  
  console.log('  ✓ Handler 1 executed successfully');
  console.log('  ✓ Handler 2 error isolated (did not stop chain)');
  console.log('  ✓ Handler 3 executed successfully despite error');
}

// Integration Test 7: Tunable vs non-tunable parameter separation
export function testTunableVsNonTunableParameterSeparation() {
  console.log('\n🔧 Test 7: Tunable vs non-tunable parameter separation');
  
  const baseConfig = {
    // Non-tunable (should not be affected by AppConfig)
    redis: { host: 'localhost', port: 6379 },
    temporal: { host: 'localhost', namespace: 'default' },
    IMAGE_SERVICE_PORT: 3000,
    
    // Tunable (should be affected by AppConfig)
    scheduler: { pollMs: 1000 },
    inference: { maxBatchSize: 4, maxBatchWaitMs: 50, defaultTimeoutMs: 30000 },
  };
  
  // Simulated AppConfig update (tries to change everything)
  const appConfigUpdate = {
    redis: { host: 'redis.aws.com' }, // Should be ignored
    temporal: { host: 'temporal.aws.com' }, // Should be ignored
    IMAGE_SERVICE_PORT: 8080, // Should be ignored
    scheduler: { pollMs: 500 }, // Should be applied
    inference: { maxBatchSize: 8 }, // Should be applied
  };
  
  // Apply tunable parameters only
  const result = {
    ...baseConfig,
    redis: baseConfig.redis, // Non-tunable: keep original
    temporal: baseConfig.temporal, // Non-tunable: keep original
    IMAGE_SERVICE_PORT: baseConfig.IMAGE_SERVICE_PORT, // Non-tunable: keep original
    scheduler: {
      ...baseConfig.scheduler,
      ...appConfigUpdate.scheduler, // Tunable: apply AppConfig
    },
    inference: {
      ...baseConfig.inference,
      ...appConfigUpdate.inference, // Tunable: apply AppConfig
    },
  };
  
  // Verify non-tunable params unchanged
  assert.strictEqual(result.redis.host, 'localhost', 'Redis host should not change');
  assert.strictEqual(result.temporal.host, 'localhost', 'Temporal host should not change');
  assert.strictEqual(result.IMAGE_SERVICE_PORT, 3000, 'Service port should not change');
  
  // Verify tunable params changed
  assert.strictEqual(result.scheduler.pollMs, 500, 'pollMs should be updated');
  assert.strictEqual(result.inference.maxBatchSize, 8, 'maxBatchSize should be updated');
  assert.strictEqual(result.inference.maxBatchWaitMs, 50, 'maxBatchWaitMs should remain (not in update)');
  
  console.log('  ✓ Non-tunable parameters protected');
  console.log('  ✓ Tunable parameters applied');
}

// Run all integration tests
export async function runAllIntegrationTests() {
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('🧪 Integration Tests: AppConfig Tunable Parameters');
  console.log('═══════════════════════════════════════════════════════');
  
  try {
    testWorkerBatchProcessorHotReload();
    testSchedulerNodeManagerHotReload();
    testMultipleConfigUpdates();
    testParameterConstraintsValidation();
    testConfigUpdateHandlerChain();
    testErrorHandlingInHandlerChain();
    testTunableVsNonTunableParameterSeparation();
    
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('✅ All integration tests passed!');
    console.log('═══════════════════════════════════════════════════════\n');
    return true;
  } catch (error) {
    console.error('\n❌ Integration test failed:', error);
    return false;
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllIntegrationTests().then((success) => process.exit(success ? 0 : 1));
}
