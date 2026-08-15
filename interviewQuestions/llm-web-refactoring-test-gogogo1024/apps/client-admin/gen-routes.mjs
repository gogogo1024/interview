import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const routeTreePath = path.join(__dirname, 'src', 'routeTree.gen.ts');

// If file doesn't exist, create a minimal placeholder with proper exports
if (!fs.existsSync(routeTreePath)) {
  console.log(`Generating ${routeTreePath}...`);
  const minimalRouteTree = `// Auto-generated route tree placeholder for typecheck
// Run vite build or dev to regenerate with actual routes
import { RootRoute } from '@tanstack/react-router';

export const __ROOT__ = new RootRoute({});
export const routeTree = __ROOT__.getRoutes();
`;
  fs.mkdirSync(path.dirname(routeTreePath), { recursive: true });
  fs.writeFileSync(routeTreePath, minimalRouteTree);
  console.log('Created minimal routeTree.gen.ts');
}
