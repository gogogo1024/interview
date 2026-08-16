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
		trace: "on-first-retry",
	},
	projects: [
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] },
		},
	],
	webServer: {
		command:
			"TANSTACK_DEVTOOLS_DISABLED=true GRPC_API_HOST=localhost:50051 GRPC_API_SECURE=false pnpm run build && pnpm run start",
		url: "http://localhost:3002",
		reuseExistingServer: true,
		timeout: 600000, // 10 minutes - increased to handle CI resource constraints and slow builds
		env: {
			TANSTACK_DEVTOOLS_DISABLED: "true",
			GRPC_API_HOST: "localhost:50051",
			GRPC_API_SECURE: "false",
		},
	},
});
