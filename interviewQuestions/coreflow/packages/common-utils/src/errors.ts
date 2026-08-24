export class AppError extends Error {
  public code: string;
  public status: number;
  public details?: any;

  constructor(code: string, message: string, status = 500, details?: any) {
    super(message);
    this.code = code;
    this.status = status;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }

  toJSON() {
    return { code: this.code, message: this.message, status: this.status, details: this.details };
  }
}

export function isAppError(err: any): err is AppError {
  return Boolean(err && typeof err.code === 'string' && typeof err.status === 'number');
}

export const BadRequest = (message = 'Bad Request', details?: any) => new AppError('BAD_REQUEST', message, 400, details);
export const Unauthorized = (message = 'Unauthorized', details?: any) => new AppError('UNAUTHORIZED', message, 401, details);
export const Forbidden = (message = 'Forbidden', details?: any) => new AppError('FORBIDDEN', message, 403, details);
export const NotFound = (message = 'Not Found', details?: any) => new AppError('NOT_FOUND', message, 404, details);
export const Conflict = (message = 'Conflict', details?: any) => new AppError('CONFLICT', message, 409, details);
export const Internal = (message = 'Internal Error', details?: any) => new AppError('INTERNAL_ERROR', message, 500, details);

export function wrapAsync(fn: Function) {
  return function (req: any, res: any, next: any) {
    Promise.resolve()
      .then(() => fn(req, res, next))
      .catch(next);
  };
}
