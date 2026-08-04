import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [tsconfigPaths(), react()],
	test: {
		environment: "jsdom",
		globals: true,
		setupFiles: ["./tests/setup.ts"],
		include: ["tests/unit/**/*.test.{ts,tsx}", "tests/integration/**/*.test.{ts,tsx}"],
		coverage: {
			provider: "v8",
			reporter: ["text", "json", "html"],
		},
	},
	resolve: {
		alias: {
			"@stylexjs/stylex": new URL("./tests/mocks/stylex.ts", import.meta.url).pathname,
			"@tanstack/react-start/server": new URL("./tests/mocks/vinxi-http.ts", import.meta.url)
				.pathname,
			"@tanstack/react-start": new URL("./tests/mocks/tanstack-start.ts", import.meta.url).pathname,
		},
	},
});
