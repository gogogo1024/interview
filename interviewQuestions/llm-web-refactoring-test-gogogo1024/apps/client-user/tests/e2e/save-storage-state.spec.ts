import { test } from "@playwright/test";

test("save storage state (alice)", async ({ page }) => {
	// Navigate to login and perform UI login for seed user
	await page.goto("/auth/login", { waitUntil: "domcontentloaded" });
	await page.fill('input[name="email"]', "alice@test.com");
	await page.fill('input[name="password"]', "password123");

	// Submit and wait for the backend current-user response or server-fn
	await page.click('button[type="submit"]');
	try {
		await page.waitForResponse(
			(resp) =>
				(resp.url().includes("/api/current-user") || resp.url().includes("/_serverFn")) &&
				resp.status() === 200,
			{ timeout: 15_000 },
		);
	} catch {
		// best-effort
	}

	// Wait for expected logged-in UI element then save storage state for alice only
	// Use a per-user storage file to avoid polluting global test state.
	await page
		.waitForSelector('a[title="Notifications"], button[title="Logout"]', { timeout: 15_000 })
		.catch(() => {});
	await page.context().storageState({ path: "/tmp/playwright-storage-alice.json" });
});
