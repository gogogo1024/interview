import { resolve } from 'node:path';
import { loadConfigFromFile } from 'vite';

const configPath = resolve(process.cwd(), 'vite.config.ts');
console.log('Loading config:', configPath);

const loaded = await loadConfigFromFile({ command: 'serve', mode: 'development' }, configPath);
if (!loaded) {
  console.error('No config returned from loadConfigFromFile');
  process.exit(2);
}
const cfg = loaded.config;
console.log('Resolved plugins count:', cfg.plugins.length);
// Helper to print plugin details, handling arrays and nested names.
function printPlugin(p, idx) {
  const label = String(idx).padStart(2, '0');
  if (Array.isArray(p)) {
    console.log(`${label} (array) -> length=${p.length}`);
    p.forEach((sub, j) => printPlugin(sub, `${idx}.${j}`));
    return;
  }
  const name = p && p.name ? p.name : null;
  const type = Array.isArray(name) ? 'array' : typeof name;
  console.log(`${label} nameType=${type} apply=${p && p.apply ? p.apply : 'n/a'} ->`, name);
}

cfg.plugins.forEach((p, i) => {
  try {
    printPlugin(p, i);
  } catch (e) {
    console.log(String(i).padStart(2, '0'), '<error reading plugin>');
  }
});

console.log('\nPlugin names flattened:');
const flatNames = [];
function collectNames(p) {
  if (Array.isArray(p)) return p.forEach(collectNames);
  const name = p && p.name ? p.name : null;
  if (Array.isArray(name)) name.forEach(n => flatNames.push(String(n)));
  else flatNames.push(String(name));
}
cfg.plugins.forEach(collectNames);
console.log(flatNames.map((n, i) => `${String(i).padStart(2,'0')} ${n}`).join('\n'));
