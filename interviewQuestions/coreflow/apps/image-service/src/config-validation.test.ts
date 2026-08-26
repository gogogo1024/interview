/**
 * Configuration validation tests
 * Validates AppConfig schema and example files
 */

import assert from 'assert';
import { readFileSync } from 'fs';
import { join } from 'path';

const appDir = new URL('..', import.meta.url).pathname;

// Load configuration files
function loadJsonFile(filename: string) {
  const filePath = join(appDir, filename);
  const content = readFileSync(filePath, 'utf-8');
  return JSON.parse(content);
}

// Test 1: Schema file exists and is valid JSON
export function testSchemaFileValidity() {
  console.log('\n📋 Test 1: Schema file validity');
  
  try {
    const schema = loadJsonFile('appconfig-schema.json');
    
    assert(schema, 'Schema should exist');
    assert(schema.$schema, 'Schema should have $schema property');
    assert.strictEqual(schema.type, 'object', 'Schema type should be object');
    assert(schema.properties, 'Schema should have properties');
    
    console.log('  ✓ Schema file is valid JSON');
    console.log('  ✓ Schema structure is correct');
    
    return schema;
  } catch (error) {
    throw new Error(`Failed to load schema: ${(error as Error).message}`);
  }
}

// Test 2: Schema defines required tunable parameters
export function testSchemaDefinesAllTunableParams(schema: any) {
  console.log('\n📋 Test 2: Schema defines all tunable parameters');
  
  const requiredParams = ['scheduler', 'inference'];
  
  for (const param of requiredParams) {
    assert(
      schema.properties[param],
      `Schema should define ${param} property`
    );
  }
  
  // Verify scheduler properties
  const schedulerProps = schema.properties.scheduler.properties;
  assert(schedulerProps.pollMs, 'Scheduler should have pollMs property');
  assert.strictEqual(schedulerProps.pollMs.type, 'number', 'pollMs should be number type');
  assert.strictEqual(schedulerProps.pollMs.minimum, 100, 'pollMs should have minimum=100');
  assert.strictEqual(schedulerProps.pollMs.maximum, 60000, 'pollMs should have maximum=60000');
  
  // Verify inference properties
  const inferenceProps = schema.properties.inference.properties;
  assert(inferenceProps.maxBatchSize, 'Inference should have maxBatchSize');
  assert(inferenceProps.maxBatchWaitMs, 'Inference should have maxBatchWaitMs');
  assert(inferenceProps.defaultTimeoutMs, 'Inference should have defaultTimeoutMs');
  
  console.log('  ✓ scheduler.pollMs defined with correct constraints');
  console.log('  ✓ inference.maxBatchSize defined');
  console.log('  ✓ inference.maxBatchWaitMs defined');
  console.log('  ✓ inference.defaultTimeoutMs defined');
}

// Test 3: Example file is valid JSON
export function testExampleFileValidity() {
  console.log('\n📋 Test 3: Example file validity');
  
  try {
    const example = loadJsonFile('appconfig-example.json');
    
    assert(example, 'Example should exist');
    assert(example.scheduler, 'Example should have scheduler object');
    assert(example.inference, 'Example should have inference object');
    
    console.log('  ✓ Example file is valid JSON');
    console.log('  ✓ Example has scheduler and inference objects');
    
    return example;
  } catch (error) {
    throw new Error(`Failed to load example: ${(error as Error).message}`);
  }
}

// Test 4: Example values are within schema constraints
export function testExampleConformsToSchema(schema: any, example: any) {
  console.log('\n📋 Test 4: Example conforms to schema');
  
  // Validate scheduler.pollMs
  const pollMs = example.scheduler.pollMs;
  const pollMsSchema = schema.properties.scheduler.properties.pollMs;
  assert(
    pollMs >= pollMsSchema.minimum && pollMs <= pollMsSchema.maximum,
    `Example pollMs=${pollMs} should be within range [${pollMsSchema.minimum}, ${pollMsSchema.maximum}]`
  );
  
  // Validate inference parameters
  const batchSize = example.inference.maxBatchSize;
  const batchSizeSchema = schema.properties.inference.properties.maxBatchSize;
  assert(
    batchSize >= batchSizeSchema.minimum && batchSize <= batchSizeSchema.maximum,
    `Example maxBatchSize=${batchSize} should be within range [${batchSizeSchema.minimum}, ${batchSizeSchema.maximum}]`
  );
  
  const batchWaitMs = example.inference.maxBatchWaitMs;
  const batchWaitSchema = schema.properties.inference.properties.maxBatchWaitMs;
  assert(
    batchWaitMs >= batchWaitSchema.minimum && batchWaitMs <= batchWaitSchema.maximum,
    `Example maxBatchWaitMs=${batchWaitMs} should be within range [${batchWaitSchema.minimum}, ${batchWaitSchema.maximum}]`
  );
  
  const timeoutMs = example.inference.defaultTimeoutMs;
  const timeoutSchema = schema.properties.inference.properties.defaultTimeoutMs;
  assert(
    timeoutMs >= timeoutSchema.minimum && timeoutMs <= timeoutSchema.maximum,
    `Example defaultTimeoutMs=${timeoutMs} should be within range [${timeoutSchema.minimum}, ${timeoutSchema.maximum}]`
  );
  
  console.log('  ✓ Example scheduler.pollMs within constraints');
  console.log('  ✓ Example inference.maxBatchSize within constraints');
  console.log('  ✓ Example inference.maxBatchWaitMs within constraints');
  console.log('  ✓ Example inference.defaultTimeoutMs within constraints');
}

// Test 5: Schema has proper descriptions for all parameters
export function testSchemaDocumentation(schema: any) {
  console.log('\n📋 Test 5: Schema documentation');
  
  const schedulerProps = schema.properties.scheduler.properties;
  assert(schedulerProps.pollMs.description, 'pollMs should have description');
  
  const inferenceProps = schema.properties.inference.properties;
  assert(inferenceProps.maxBatchSize.description, 'maxBatchSize should have description');
  assert(inferenceProps.maxBatchWaitMs.description, 'maxBatchWaitMs should have description');
  assert(inferenceProps.defaultTimeoutMs.description, 'defaultTimeoutMs should have description');
  
  console.log('  ✓ pollMs has description:', schedulerProps.pollMs.description.substring(0, 50) + '...');
  console.log('  ✓ maxBatchSize has description:', inferenceProps.maxBatchSize.description.substring(0, 50) + '...');
  console.log('  ✓ maxBatchWaitMs has description:', inferenceProps.maxBatchWaitMs.description.substring(0, 50) + '...');
  console.log('  ✓ defaultTimeoutMs has description:', inferenceProps.defaultTimeoutMs.description.substring(0, 50) + '...');
}

// Test 6: Schema has example values
export function testSchemaExamples(schema: any) {
  console.log('\n📋 Test 6: Schema example values');
  
  assert(schema.examples, 'Schema should have examples array');
  assert(schema.examples.length > 0, 'Schema should have at least one example');
  
  for (let i = 0; i < schema.examples.length; i++) {
    const example = schema.examples[i];
    assert(example.scheduler, `Example ${i} should have scheduler`);
    assert(example.inference, `Example ${i} should have inference`);
    console.log(`  ✓ Example ${i + 1}: scheduler.pollMs=${example.scheduler.pollMs}, inference.maxBatchSize=${example.inference.maxBatchSize}`);
  }
}

// Test 7: Verify APPCONFIG.md exists and has required sections
export function testDocumentationFile() {
  console.log('\n📋 Test 7: Documentation file');
  
  try {
    const docPath = join(appDir, 'APPCONFIG.md');
    const content = readFileSync(docPath, 'utf-8');
    
    assert(content, 'APPCONFIG.md should exist');
    
    // Check for required sections
    const requiredSections = [
      '## 概述',
      '## 在 AWS AppConfig 中创建配置',
      '## 性能调优指南',
      '## 限制和注意事项',
      '## 故障排查',
    ];
    
    for (const section of requiredSections) {
      assert(
        content.includes(section),
        `Documentation should have section: ${section}`
      );
    }
    
    console.log('  ✓ APPCONFIG.md exists');
    console.log('  ✓ Has 概述 section');
    console.log('  ✓ Has 配置创建指南 section');
    console.log('  ✓ Has 性能调优指南 section');
    console.log('  ✓ Has 限制注意事项 section');
    console.log('  ✓ Has 故障排查 section');
  } catch (error) {
    throw new Error(`Failed to validate documentation: ${(error as Error).message}`);
  }
}

// Test 8: Parameter types consistency
export function testParameterTypeConsistency(schema: any, example: any) {
  console.log('\n📋 Test 8: Parameter type consistency');
  
  // Check scheduler.pollMs type
  assert.strictEqual(schema.properties.scheduler.properties.pollMs.type, 'number');
  assert.strictEqual(typeof example.scheduler.pollMs, 'number');
  console.log('  ✓ scheduler.pollMs type is consistent (number)');
  
  // Check inference.maxBatchSize type
  assert.strictEqual(schema.properties.inference.properties.maxBatchSize.type, 'number');
  assert.strictEqual(typeof example.inference.maxBatchSize, 'number');
  console.log('  ✓ inference.maxBatchSize type is consistent (number)');
  
  // Check inference.maxBatchWaitMs type
  assert.strictEqual(schema.properties.inference.properties.maxBatchWaitMs.type, 'number');
  assert.strictEqual(typeof example.inference.maxBatchWaitMs, 'number');
  console.log('  ✓ inference.maxBatchWaitMs type is consistent (number)');
  
  // Check inference.defaultTimeoutMs type
  assert.strictEqual(schema.properties.inference.properties.defaultTimeoutMs.type, 'number');
  assert.strictEqual(typeof example.inference.defaultTimeoutMs, 'number');
  console.log('  ✓ inference.defaultTimeoutMs type is consistent (number)');
}

// Run all configuration validation tests
export async function runAllConfigTests() {
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('🧪 Configuration Validation Tests');
  console.log('═══════════════════════════════════════════════════════');
  
  try {
    const schema = testSchemaFileValidity();
    testSchemaDefinesAllTunableParams(schema);
    
    const example = testExampleFileValidity();
    testExampleConformsToSchema(schema, example);
    
    testSchemaDocumentation(schema);
    testSchemaExamples(schema);
    testDocumentationFile();
    testParameterTypeConsistency(schema, example);
    
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('✅ All configuration validation tests passed!');
    console.log('═══════════════════════════════════════════════════════\n');
    return true;
  } catch (error) {
    console.error('\n❌ Configuration validation test failed:', error);
    return false;
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllConfigTests().then((success) => process.exit(success ? 0 : 1));
}
