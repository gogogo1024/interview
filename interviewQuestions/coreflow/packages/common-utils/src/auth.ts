export type VerifyFn = (token: string) => Promise<any | null>;

export function createExpressAuthMiddleware(verify: VerifyFn) {
  return async function (req: any, res: any, next: any) {
    try {
      const header = req.headers?.authorization ?? req.headers?.Authorization ?? '';
      if (!header) {
        res?.status?.(401);
        return next(new Error('Unauthorized'));
      }
      const token = header.startsWith('Bearer ') ? header.slice(7) : header;
      const payload = await verify(token);
      if (!payload) {
        res?.status?.(401);
        return next(new Error('Unauthorized'));
      }
      req.user = payload;
      return next();
    } catch (err) {
      return next(err);
    }
  };
}

export async function verifyJwtIfInstalled(token: string, secret: string) {
  try {
    const jwt = await import('jsonwebtoken');
    return jwt.verify(token, secret);
  } catch (err) {
    throw new Error('jsonwebtoken not installed or verification failed');
  }
}
