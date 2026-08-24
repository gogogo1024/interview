export type LogMeta = Record<string, any> | undefined;

export function createLogger(name?: string) {
  const env = process.env.NODE_ENV || 'development';
  const isProd = env === 'production';

  function format(level: string, message: string, meta?: LogMeta) {
    const record: any = { ts: new Date().toISOString(), level, name, message };
    if (meta) record.meta = meta;
    return record;
  }

  function output(level: 'debug' | 'info' | 'warn' | 'error', message: string, meta?: LogMeta) {
    const rec = format(level, message, meta);
    if (isProd) {
      // structured JSON in production
      console[level === 'debug' ? 'log' : level](JSON.stringify(rec));
    } else {
      // readable in development
      const base = `[${rec.ts}] [${rec.level}]${name ? ' ' + name : ''} ${rec.message}`;
      if (meta) console.log(base, meta);
      else console.log(base);
    }
  }

  return {
    debug: (message: string, meta?: LogMeta) => output('debug', message, meta),
    info: (message: string, meta?: LogMeta) => output('info', message, meta),
    warn: (message: string, meta?: LogMeta) => output('warn', message, meta),
    error: (message: string, meta?: LogMeta) => output('error', message, meta),
    child: (childName?: string) => createLogger(childName ? `${name || 'logger'}/${childName}` : name),
  };
}
