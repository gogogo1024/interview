import path from "node:path";
import stylexUnplugin from "@stylexjs/unplugin";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { fileURLToPath, URL } from "url";
import { defineConfig } from "vite";
import viteTsConfigPaths from "vite-tsconfig-paths";

const currentDir = fileURLToPath(new URL(".", import.meta.url));
const rootDir = path.resolve(currentDir, "../..");
const uiPackageDir = path.resolve(rootDir, "packages/ui/src");

const config = defineConfig({
	ssr: {
		external: ["drizzle-orm"],
	},
	resolve: {
		alias: {
			"@": path.resolve(currentDir, "src"),
			"@chirp/ui": uiPackageDir,
		},
	},
	build: {
		rollupOptions: {
			external: (id) => {
				// Skip externalization for virtual modules (those starting with \0)
				if (id.startsWith("\0")) {
					return false;
				}

				// Externalize gRPC and server-only packages from browser bundle
				// These packages contain Node.js built-ins and should not be bundled for browser
				const serverOnlyPatterns = [
					"node:",               // All Node.js built-ins
					"@grpc/",              // All gRPC packages - server-only
					"@protobuf-ts/grpc",   // gRPC transport - server-only
					"@chirp/grpc-client",  // Our gRPC client wrapper
					"@chirp/db-schema",    // Database schema - server-only
					"drizzle",             // ORM - server-only
				];

				for (const pattern of serverOnlyPatterns) {
					if (id.startsWith(pattern)) {
						return true;
					}
				}
				return false;
			},
		},
	},
	plugins: [
		devtools(),
		nitro(),
		stylexUnplugin.vite({
			useCSSLayers: true,
			dev: true,
			unstable_moduleResolution: {
				type: "commonJS",
				rootDir,
			},
		}),
		viteTsConfigPaths({
			projects: ["./tsconfig.json"],
		}),
		tanstackStart(),
		viteReact(),
	],
});

export default config;

