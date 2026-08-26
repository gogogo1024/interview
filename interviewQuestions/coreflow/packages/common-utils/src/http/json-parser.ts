import type { IncomingMessage } from 'http';

/**
 * Parse JSON from an HTTP request body
 * 
 * @param req - The incoming HTTP request
 * @param maxSize - Maximum size in bytes (default: 1MB)
 * @returns Parsed JSON object, or empty object if body is empty
 * @throws Error if JSON parsing fails or body exceeds maxSize
 * 
 * @example
 * ```typescript
 * const body = await parseRequestJson(req);
 * ```
 */
export async function parseRequestJson<T = any>(
  req: IncomingMessage,
  maxSize: number = 1024 * 1024, // 1MB default
): Promise<T> {
  return new Promise((resolve, reject) => {
    let data = '';
    let size = 0;

    req.on('data', (chunk: Buffer) => {
      size += chunk.length;
      if (size > maxSize) {
        reject(new Error(`Request body exceeds maximum size of ${maxSize} bytes`));
        req.destroy();
        return;
      }
      data += chunk.toString('utf8');
    });

    req.on('end', () => {
      if (!data) {
        return resolve({} as T);
      }
      try {
        resolve(JSON.parse(data));
      } catch (err) {
        reject(new Error(`Failed to parse JSON: ${(err as Error).message}`));
      }
    });

    req.on('error', reject);
  });
}
