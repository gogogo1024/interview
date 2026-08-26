function mergeInto(target: Record<string, any>, src: Record<string, any>) {
  // simple deep merge
  for (const k of Object.keys(src)) {
    const v = (src as any)[k];
    if (v && typeof v === 'object' && !Array.isArray(v) && typeof target[k] === 'object') {
      mergeInto(target[k], v);
    } else {
      target[k] = v;
    }
  }
}

export async function loadConfigFromAws(opts: {
  region?: string;
  ssmPaths?: string[];
  secretNames?: string[];
  // appconfig fields (optional)
  appConfigApplication?: string;
  appConfigEnvironment?: string;
  appConfigProfile?: string;
}) {
  const out: Record<string, any> = {};

  // Load from SSM Parameters
  if (opts.ssmPaths && opts.ssmPaths.length > 0) {
    try {
      const { SSMClient, GetParametersCommand } = await import('@aws-sdk/client-ssm');
      const client = new SSMClient({ region: opts.region });
      const cmd = new GetParametersCommand({ Names: opts.ssmPaths, WithDecryption: true });
      const resp: any = await client.send(cmd as any);
      for (const p of resp.Parameters || []) {
        try {
          const parsed = JSON.parse(p.Value);
          mergeInto(out, parsed);
        } catch {
          // store raw
          out[p.Name] = p.Value;
        }
      }
    } catch (err) {
      throw new Error(`SSM load failed: ${(err as Error).message}`);
    }
  }

  // Load from Secrets Manager
  if (opts.secretNames && opts.secretNames.length > 0) {
    try {
      const { SecretsManagerClient, GetSecretValueCommand } = await import('@aws-sdk/client-secrets-manager');
      const client = new SecretsManagerClient({ region: opts.region });
      for (const name of opts.secretNames) {
        const resp: any = await client.send(new GetSecretValueCommand({ SecretId: name }) as any);
        if (resp.SecretString) {
          try {
            const parsed = JSON.parse(resp.SecretString);
            mergeInto(out, parsed);
          } catch {
            out[name] = resp.SecretString;
          }
        }
      }
    } catch (err) {
      throw new Error(`SecretsManager load failed: ${(err as Error).message}`);
    }
  }

  // AppConfigData support is optional (complex token flow). Try if identifiers provided and SDK installed.
  if (opts.appConfigApplication && opts.appConfigEnvironment && opts.appConfigProfile) {
    try {
      const { AppConfigDataClient, StartConfigurationSessionCommand, GetLatestConfigurationCommand } = await import('@aws-sdk/client-appconfigdata');
      const client = new AppConfigDataClient({ region: opts.region });
      const start = await client.send(new StartConfigurationSessionCommand({
        ApplicationIdentifier: opts.appConfigApplication,
        EnvironmentIdentifier: opts.appConfigEnvironment,
        ConfigurationProfileIdentifier: opts.appConfigProfile,
      }) as any);
      const token = start.InitialConfigurationToken;
      if (token) {
        const resp: any = await client.send(new GetLatestConfigurationCommand({ ConfigurationToken: token }) as any);
        if (resp.Configuration) {
          // Configuration may be a Uint8Array-like
          const buf = Buffer.from(resp.Configuration as any);
          const txt = buf.toString('utf8');
          try {
            const parsed = JSON.parse(txt);
            mergeInto(out, parsed);
          } catch {
            // ignore non-JSON
          }
        }
      }
    } catch (err) {
      // if the SDK is not present or AppConfig fails, surface a warning via thrown error
      throw new Error(`AppConfig load failed: ${(err as Error).message}`);
    }
  }

  return out;
}

export async function startAwsConfigPoll(opts: {
  region?: string;
  ssmPaths?: string[];
  secretNames?: string[];
  appConfigApplication?: string;
  appConfigEnvironment?: string;
  appConfigProfile?: string;
  pollMs?: number;
  onUpdate?: (cfg: Record<string, any>) => void;
}) {
  let last: string | null = null;
  const runner = async () => {
    try {
      const cfg = await loadConfigFromAws({
        region: opts.region,
        ssmPaths: opts.ssmPaths,
        secretNames: opts.secretNames,
        appConfigApplication: opts.appConfigApplication,
        appConfigEnvironment: opts.appConfigEnvironment,
        appConfigProfile: opts.appConfigProfile,
      });
      const s = JSON.stringify(cfg);
      if (s !== last) {
        last = s;
        if (opts.onUpdate) opts.onUpdate(cfg);
      }
    } catch (err) {
      // swallow to avoid crashing polling loop
    }
  };

  await runner();
  if (opts.pollMs && opts.pollMs > 0) setInterval(runner, opts.pollMs);
}

