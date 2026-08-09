import os from "node:os";
import { defineConfig, devices } from "@playwright/test";

// Auto-configure workers: prefer PW_WORKERS env, on CI use 1, otherwise use
// (cpus - 1) locally to leave one core free for system tasks.
const cpuCount = os.cpus()?.length || 2;
const defaultWorkers = process.env.PW_WORKERS
	? Number(process.env.PW_WORKERS)
	: process.env.CI
		? 1
		: Math.max(1, cpuCount - 1);

export default defineConfig({
	testDir: "./tests/e2e",
	timeout: 90000, // Increased to 90s to allow for slower SSR hydration
	// globalSetup: "./tests/e2e/global-setup.ts",
	fullyParallel: false, // keep tests in a file sequential; enable only if tests are fully isolated
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: defaultWorkers,
	reporter: "html",
	use: {
		baseURL: "http://localhost:3000",
		trace: "off",
	},
	projects: [
		{
			name: "chromium",
			use: {
				...devices["Desktop Chrome"],
				// Workaround for macOS CVDisplayLink crash (CVReturn: -6670)
				// Use software rendering instead of GPU to avoid display driver issues
				launchOptions: {
					args: [
						"--disable-features=VizDisplayCompositor",
						"--disable-gpu-compositing",
						"--disable-gpu",
						"--use-software-rasterizer",
					],
				},
			},
		},
	],
	webServer: {
		// Use production build to avoid dev mode Nitro environment issues
		command: "pnpm run build && pnpm run start",
		url: "http://localhost:3000",
		reuseExistingServer: true,
		timeout: 180000, // 3 minutes to allow build + start
	},
});
