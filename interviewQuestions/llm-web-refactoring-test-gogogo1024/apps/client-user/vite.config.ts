import path from "node:path";
import fs from "node:fs";
import stylexUnplugin from "@stylexjs/unplugin";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { fileURLToPath, URL } from "url";
import { defineConfig } from "vite";
import type { Plugin } from "vite";
import viteTsConfigPaths from "vite-tsconfig-paths";

const currentDir = fileURLToPath(new URL(".", import.meta.url));
const rootDir = path.resolve(currentDir, "../..");
const uiPackageDir = path.resolve(rootDir, "packages/ui/src");

/**
 * Plugin to filter out invalid preloads from TanStack Start manifest
 * and remove server-only imports from client bundles
 */
const filterInvalidPreloadsPlugin = (): Plugin => ({
	name: "filter-invalid-preloads",
	closeBundle: async () => {
		// Define server-only packages
		const serverOnlyPackages = [
			"@chirp/grpc-client",
			"@chirp/db-schema",
			"@grpc/",
			"drizzle",
		];

		// 1. Clean manifest file
		const outDir = path.resolve(currentDir, ".output");
		const serverDir = path.join(outDir, "server/_ssr");
		
		if (fs.existsSync(serverDir)) {
			const files = fs.readdirSync(serverDir);
			const manifestFile = files.find((f) =>
				f.match(/^_tanstack-start-manifest_v-.*\.mjs$/),
			);

			if (manifestFile) {
				const manifestPath = path.join(serverDir, manifestFile);
				let content = fs.readFileSync(manifestPath, "utf-8");

				// Remove invalid preloads from manifest
				for (const pkg of serverOnlyPackages) {
					const escapedPkg = pkg.replace(/\//g, "\\/").replace(/\./g, "\\.");
					const pattern1 = `"/\\?${escapedPkg.replace(/^@/, "").replace(/\//g, "\\/")}[^"]*"`;
					const pattern2 = `"/${escapedPkg}[^"]*"`;
					const pattern3 = `"${escapedPkg}[^"]*"`;
					
					[pattern1, pattern2, pattern3].forEach((pattern) => {
						const regex = new RegExp(pattern, "g");
						content = content.replace(regex, "");
					});
				}

				// Clean up commas
				content = content.replace(/,\s*,/g, ",");
				content = content.replace(/,\s*(\])/g, "$1");
				content = content.replace(/\[\s*,/g, "[");

				fs.writeFileSync(manifestPath, content, "utf-8");
				console.log(`✓ Cleaned manifest: removed invalid preloads`);
			}
		}

		// 2. Remove server-only imports from client JavaScript bundles
		const publicDir = path.join(outDir, "public/assets");
		if (fs.existsSync(publicDir)) {
			const files = fs.readdirSync(publicDir);
			const jsFiles = files.filter((f) => f.endsWith(".js"));

			for (const file of jsFiles) {
				const filePath = path.join(publicDir, file);
				let content = fs.readFileSync(filePath, "utf-8");
				let modified = false;

				// Remove import statements for server-only packages
				for (const pkg of serverOnlyPackages) {
					const escapedPkg = pkg.replace(/\//g, "\\/").replace(/\./g, "\\.");
					
					// Match patterns in minified code:
					// import"package" or import "package"
					// import{...}from"package" or from"package" (but only in import context)
					const patterns = [
						// Pattern 1: import"package" or import "package"
						`import\\s*"${escapedPkg}[^"]*"`,
						// Pattern 2: import{...}from"package"
						`import\\s*\\{[^}]*\\}\\s*from\\s*"${escapedPkg}[^"]*"`,
						// Pattern 3: import*from"package" (for default imports like import $from)
						`import\\s+\\w+\\s+from\\s*"${escapedPkg}[^"]*"`,
					];
					
					for (const pattern of patterns) {
						const regex = new RegExp(pattern, "g");
						if (regex.test(content)) {
							content = content.replace(regex, "");
							modified = true;
						}
					}
				}

				if (modified) {
					// Clean up any trailing commas or semicolons
					content = content.replace(/;+/g, ";");
					fs.writeFileSync(filePath, content, "utf-8");
				}
			}
			
			console.log(`✓ Removed server imports from ${jsFiles.length} client bundles`);
		}
	},
});

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
		filterInvalidPreloadsPlugin(),
	],
});

export default config;

