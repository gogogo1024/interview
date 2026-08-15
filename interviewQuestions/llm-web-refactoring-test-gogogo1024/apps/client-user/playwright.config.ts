import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
	testDir: "./tests/e2e",
	timeout: 90000, // Increased to 90s to allow for slower SSR hydration
	// globalSetup: "./tests/e2e/global-setup.ts",
	fullyParallel: false,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: 1,
	reporter: "html",
	use: {
		baseURL: "http://localhost:3000",
		trace: "on-first-retry",
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
		timeout: 300000, // 5 minutes - increased to handle parallel startup and resource constraints
		readyTimeout: 30000, // Wait up to 30s for server to be ready after port opens
	},
});
