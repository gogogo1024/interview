import type { FullConfig } from "@playwright/test";

/**
 * Warm up Vite's on-demand compilation before any tests start.
 * Without this, the first 5 parallel workers all hit an uncompiled
 * Vite server, causing 60s+ timeouts on cold starts.
 */
async function globalSetup(_config: FullConfig) {
	const baseURL = "http://localhost:3000";

	// Fetch the login page to trigger Vite's initial module compilation.
	// This ensures all shared chunks (React, TanStack, etc.) are compiled
	// before parallel test workers start making requests.
	for (let attempt = 0; attempt < 3; attempt++) {
		try {
			const response = await fetch(`${baseURL}/auth/login`);
			if (response.ok) {
				// Wait a moment for Vite to finish any background compilation
				await new Promise((resolve) => setTimeout(resolve, 2000));
				return;
			}
		} catch {
			// Server might not be ready yet, retry
			await new Promise((resolve) => setTimeout(resolve, 2000));
		}
	}
}

export default globalSetup;
