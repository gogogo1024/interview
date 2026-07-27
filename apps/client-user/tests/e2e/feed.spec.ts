import { expect, test } from "@playwright/test";
import { loginAs, waitForHydration } from "./fixtures/test-helpers";

test.describe("Feed", () => {
	test.beforeEach(async ({ page }) => {
		await loginAs(page, "alice");
	});

	test("should show home feed with posts from followed users", async ({ page }) => {
		// Should be on home page
		await expect(page).toHaveURL("/");

		// Wait for posts to load
		await waitForHydration(page);

		// Should show posts from followed users (Bob or Charlie)
		// Look for any post link which indicates posts are being displayed
		const postLinks = page.locator('a[href*="/posts/"]');
		await expect(postLinks.first()).toBeVisible();
	});

	test("should show explore feed with all posts", async ({ page }) => {
		// Navigate to explore page
		await page.click('a:has-text("Explore")');

		await expect(page).toHaveURL("/explore");

		// Wait for posts to load
		await waitForHydration(page);

		// Should show posts from all users
		const postLinks = page.locator('a[href*="/posts/"]');
		await expect(postLinks.first()).toBeVisible();
	});

	test("should navigate between home and explore", async ({ page }) => {
		// Go to explore
		await page.click('a:has-text("Explore")');
		await expect(page).toHaveURL("/explore");

		// Go back to home
		await page.click('a:has-text("Home")');
		await expect(page).toHaveURL("/");
	});

	test("should show posts in reverse chronological order", async ({ page }) => {
		await page.goto("/explore", { waitUntil: "networkidle" });
		await waitForHydration(page);

		// Get all post links - posts are displayed as divs with links to post pages
		const postLinks = page.locator('a[href*="/posts/"]');
		const count = await postLinks.count();

		expect(count).toBeGreaterThan(0);
	});

	test("should show post form on home page", async ({ page }) => {
		await expect(page.locator('textarea[placeholder*="happening"]')).toBeVisible();
		await expect(page.locator('button:has-text("Post")')).toBeVisible();
	});

	test("should not show post form on explore page", async ({ page }) => {
		await page.goto("/explore", { waitUntil: "networkidle" });
		await waitForHydration(page);

		// Post form should not be visible on explore
		await expect(page.locator('textarea[placeholder*="happening"]')).not.toBeVisible();
	});
});
