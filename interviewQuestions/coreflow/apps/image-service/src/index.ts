import * as worker from './worker/main.js';

export async function start() {
  await worker.start();
}

export async function stop() {
  await worker.stop();
}

export default { start, stop };
