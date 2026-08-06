import { resolve } from 'node:path';
import { loadConfigFromFile } from 'vite';

const configPath = resolve(process.cwd(), 'interviewQuestions/llm-web-refactoring-test-gogogo1024/apps/client-user/vite.config.ts');
console.log('Loading config:', configPath);

const loaded = await loadConfigFromFile({ command: 'serve', mode: 'development' }, configPath);
if (!loaded) {
  console.error('No config returned from loadConfigFromFile');
  process.exit(2);
}
const cfg = loaded.config;
console.log('Resolved plugins count:', cfg.plugins.length);
cfg.plugins.forEach((p, i) => {
  try {
    console.log(String(i).padStart(2, '0'), p && p.name ? p.name : String(p));
  } catch (e) {
    console.log(String(i).padStart(2, '0'), '<error reading name>');
  }
});

console.log('\nFull plugin list JSON (names):');
console.log(JSON.stringify(cfg.plugins.map(p => p && p.name ? p.name : null), null, 2));
