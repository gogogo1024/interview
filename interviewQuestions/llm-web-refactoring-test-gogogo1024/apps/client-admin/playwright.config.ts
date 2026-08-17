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
		// Use production build to avoid dev mode Nitro environment issues
		// In CI, build outputs are restored from artifacts, so skip build step
		command: process.env.CI
			? "TANSTACK_DEVTOOLS_DISABLED=true GRPC_API_HOST=localhost:50051 GRPC_API_SECURE=false PORT=3002 pnpm run start"
			: "TANSTACK_DEVTOOLS_DISABLED=true GRPC_API_HOST=localhost:50051 GRPC_API_SECURE=false PORT=3002 pnpm run build && pnpm run start",
		url: "http://localhost:3002",
		reuseExistingServer: true,
		timeout: 1200000, // 20 minutes - increased to handle CI resource constraints and slow builds
		env: {
			PORT: "3002",
			TANSTACK_DEVTOOLS_DISABLED: "true",
			GRPC_API_HOST: "localhost:50051",
			GRPC_API_SECURE: "false",
		},
	},
});
