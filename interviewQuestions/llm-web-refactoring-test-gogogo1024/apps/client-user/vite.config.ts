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
	resolve: {
		alias: {
			"@": path.resolve(currentDir, "src"),
			"@chirp/ui": uiPackageDir,
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
		// this is the plugin that enables path aliases
		viteTsConfigPaths({
			projects: ["./tsconfig.json"],
		}),

		tanstackStart(),
		viteReact(),
	],
});

export default config;
