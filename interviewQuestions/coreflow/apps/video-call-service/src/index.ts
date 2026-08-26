// Public startup module for video-call-service
import * as signaling from './signaling/main.js';
import MediaServer from './sfu/media-server.js';

let sfu: MediaServer | undefined;

export async function start() {
  await signaling.start();
  sfu = new MediaServer();
  await sfu.start();
}

export async function stop() {
  try {
    await signaling.stop();
  } catch (e) {
    // ignore
  }
  try {
    await sfu?.stop();
  } catch (e) {
    // ignore
  }
  sfu = undefined;
}

export default { start, stop };
