import type { FullConfig } from "@playwright/test";

/**
 * Warm up Vite's on-demand compilation before any tests start.
 * Without this, the first 5 parallel workers all hit an uncompiled
 * Vite server, causing 60s+ timeouts on cold starts.
 */
async function globalSetup(_config: FullConfig) {
	const baseURL = "http://localhost:3002";

	// Fetch the login page to trigger Vite's initial module compilation.
	for (let attempt = 0; attempt < 3; attempt++) {
		try {
			const response = await fetch(`${baseURL}/login`);
			if (response.ok) {
				await new Promise((resolve) => setTimeout(resolve, 2000));
				return;
			}
		} catch {
			await new Promise((resolve) => setTimeout(resolve, 2000));
		}
	}
}

export default globalSetup;
