import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
	testDir: "./tests/e2e",
	timeout: 60000,
	globalSetup: "./tests/e2e/global-setup.ts",
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 1 : undefined,
	reporter: "html",
	use: {
		baseURL: "http://localhost:3002",
		trace: "off",
		// Allow overriding storage state path via env var to avoid cross-project collisions.
		// When not set, no global storage state will be loaded.
		storageState: process.env.PLAYWRIGHT_STORAGE_STATE || undefined,
	},
	projects: [
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] },
		},
	],
	webServer: {
		command: "pnpm run dev",
		url: "http://localhost:3002",
		reuseExistingServer: true,
		timeout: 60000,
	},
});
