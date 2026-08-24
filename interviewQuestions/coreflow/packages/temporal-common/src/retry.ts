export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function exponentialBackoff(attempt: number, baseMs = 200, factor = 2, maxMs = 10000) {
  return Math.min(Math.round(baseMs * Math.pow(factor, attempt)), maxMs);
}

export async function retryWithBackoff<T>(fn: () => Promise<T>, attempts = 3, baseMs = 200, factor = 2): Promise<T> {
  let lastErr: any;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (i < attempts - 1) {
        const wait = exponentialBackoff(i, baseMs, factor);
        await sleep(wait);
      }
    }
  }
  throw lastErr;
}
