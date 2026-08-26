import { createServer } from 'net';
import { fileURLToPath } from 'url';

interface ServiceConfig {
  name: string;
  path: string;
  envVar: string;
  defaultPort: number;
}

const services: ServiceConfig[] = [
  { name: 'image-service', path: '@coreflow/image-service', envVar: 'IMAGE_SERVICE_PORT', defaultPort: 3001 },
  { name: 'model-platform', path: '@coreflow/model-platform', envVar: 'MODEL_PLATFORM_PORT', defaultPort: 3002 },
  { name: 'video-call-service', path: '@coreflow/video-call-service', envVar: 'VIDEO_CALL_PORT', defaultPort: 3003 },
];

interface ParsedArgs {
  only?: string[];
  skip?: string[];
  force?: boolean;
}

interface LoadedService {
  name: string;
  mod: any;
}

const loaded: LoadedService[] = [];

function parseArgs(): ParsedArgs {
  const args = process.argv.slice(2);
  const result: ParsedArgs = {};

  for (const arg of args) {
    if (arg.startsWith('--only=')) {
      result.only = arg.slice(7).split(',');
    } else if (arg.startsWith('--skip=')) {
      result.skip = arg.slice(7).split(',');
    } else if (arg === '--force') {
      result.force = true;
    }
  }

  return result;
}

function isPortFree(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = createServer();
    server.once('error', () => resolve(false));
    server.once('listening', () => {
      server.close();
      resolve(true);
    });
    server.listen(port);
  });
}

async function findFreePort(start: number, maxAttempts = 50): Promise<number> {
  for (let i = 0; i < maxAttempts; i++) {
    const port = start + i;
    if (await isPortFree(port)) {
      return port;
    }
  }
  throw new Error(`No free port found starting from ${start}`);
}

async function startAll() {
  const opts = parseArgs();

  if ((process.env.NODE_ENV || 'development') === 'production' && !opts.force) {
    console.error('Refusing to run dev-supervised in production. Use --force to override.');
    process.exit(1);
  }

  // Log startup plan
  console.log('\n' + '='.repeat(60));
  console.log('DEV-SUPERVISED STARTUP PLAN');
  console.log('='.repeat(60));
  console.log(`NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Options: only=${opts.only?.join(',') || 'all'} skip=${opts.skip?.join(',') || 'none'}`);
  console.log('\nServices:');

  const plan: Array<{ name: string; status: 'start' | 'skip'; reason?: string }> = [];
  for (const s of services) {
    if (opts.only && !opts.only.includes(s.name)) {
      plan.push({ name: s.name, status: 'skip', reason: 'not in --only list' });
    } else if (opts.skip && opts.skip.includes(s.name)) {
      plan.push({ name: s.name, status: 'skip', reason: 'in --skip list' });
    } else {
      plan.push({ name: s.name, status: 'start' });
    }
  }

  for (const p of plan) {
    const symbol = p.status === 'start' ? '✓' : '✗';
    const info = p.reason ? ` (${p.reason})` : '';
    console.log(`  ${symbol} ${p.name}${info}`);
  }
  console.log('='.repeat(60) + '\n');

  for (const s of services) {
    if (opts.only && !opts.only.includes(s.name)) continue;
    if (opts.skip && opts.skip.includes(s.name)) continue;

    try {
      const desired = Number(process.env[s.envVar] ?? s.defaultPort);
      let assigned = desired;
      try {
        assigned = await findFreePort(desired);
        if (assigned !== desired) {
          console.log(`[${s.name}] port ${desired} in use; assigned fallback port ${assigned}`);
          process.env[s.envVar] = String(assigned);
        } else {
          console.log(`[${s.name}] port ${assigned} available`);
        }
      } catch (err) {
        console.warn(`[${s.name}] ERROR: no free port found starting at ${desired}; skipping service`);
        continue;
      }

      // dynamic import so each service runs in same node process
      const mod = await import(s.path);
      if (mod?.start) {
        console.log(`[${s.name}] starting... (port=${process.env[s.envVar]})`);
        await mod.start();
        loaded.push({ name: s.name, mod });
        console.log(`[${s.name}] ✓ started`);
      } else {
        console.warn(`module ${s.path} has no start()`);
      }
    } catch (err) {
      console.error(`[${s.name}] ERROR: failed to start:`, err);
    }
  }

  if (loaded.length === 0) {
    console.warn('\nNo services started. Check options and logs above.');
    process.exit(1);
  }

  console.log(`\n✓ All ${loaded.length} service(s) started. Press Ctrl+C to stop.\n`);
}

async function stopAll() {
  console.log('\nShutting down services in reverse order...');
  for (const item of [...loaded].reverse()) {
    try {
      if (item.mod?.stop) {
        console.log(`[${item.name}] stopping...`);
        await item.mod.stop();
        console.log(`[${item.name}] ✓ stopped`);
      }
    } catch (err) {
      console.error(`[${item.name}] ERROR during stop:`, err);
    }
  }
  console.log('All services stopped.\n');
}

async function main() {
  await startAll();

  process.on('SIGINT', async () => {
    console.log('\n\nCaught SIGINT — graceful shutdown initiated');
    await stopAll();
    process.exit(0);
  });

  process.on('uncaughtException', async (err) => {
    console.error('\n\nUncaughtException — emergency shutdown:', err);
    await stopAll();
    process.exit(1);
  });
}

main().catch(async (err) => {
  console.error('dev-supervised startup failed:', err);
  await stopAll();
  process.exit(1);
});
