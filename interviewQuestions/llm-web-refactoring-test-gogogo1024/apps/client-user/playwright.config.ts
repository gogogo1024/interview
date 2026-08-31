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
		// In CI, build outputs are restored from artifacts, so skip build step
		command: process.env.CI
			? "TANSTACK_DEVTOOLS_DISABLED=true GRPC_API_HOST=localhost:50051 GRPC_API_SECURE=false PORT=3000 pnpm run start"
			: "TANSTACK_DEVTOOLS_DISABLED=true GRPC_API_HOST=localhost:50051 GRPC_API_SECURE=false PORT=3000 pnpm run build && pnpm run start",
		url: "http://localhost:3000",
		reuseExistingServer: true,
		timeout: 1200000, // 20 minutes - increased to handle CI resource constraints and slow builds
		env: {
			PORT: "3000",
			TANSTACK_DEVTOOLS_DISABLED: "true",
			GRPC_API_HOST: "localhost:50051",
			GRPC_API_SECURE: "false",
		},
	},
});
