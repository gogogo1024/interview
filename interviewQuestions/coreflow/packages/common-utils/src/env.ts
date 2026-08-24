type SchemaType = 'string' | 'number' | 'boolean' | 'json';

type SchemaEntry = { type: SchemaType; required?: boolean; default?: any };

export function getEnv(name: string, opts?: { required?: boolean; default?: any; parse?: SchemaType }) {
  const raw = process.env[name];
  if ((raw === undefined || raw === '') && opts?.required && opts?.default === undefined) {
    throw new Error(`Missing required env ${name}`);
  }
  const val = raw === undefined || raw === '' ? opts?.default : raw;
  if (val === undefined) return val;
  if (opts?.parse === 'number') return Number(val);
  if (opts?.parse === 'boolean') return val === 'true' || val === '1';
  if (opts?.parse === 'json') return JSON.parse(String(val));
  return val;
}

export function requireEnv(name: string) {
  const val = process.env[name];
  if (val === undefined || val === '') throw new Error(`Missing required env ${name}`);
  return val;
}

export function validateSchema(schema: Record<string, SchemaEntry>) {
  const out: Record<string, any> = {};
  for (const [k, def] of Object.entries(schema)) {
    const raw = process.env[k];
    if ((raw === undefined || raw === '') && def.required && def.default === undefined) {
      throw new Error(`Missing required env ${k}`);
    }
    const val = raw === undefined || raw === '' ? def.default : raw;
    if (val === undefined) {
      out[k] = undefined;
      continue;
    }
    switch (def.type) {
      case 'number':
        out[k] = Number(val);
        break;
      case 'boolean':
        out[k] = val === 'true' || val === '1';
        break;
      case 'json':
        out[k] = JSON.parse(String(val));
        break;
      default:
        out[k] = String(val);
    }
  }
  return out as Record<string, any>;
}
