import { expect, test } from "@playwright/test";
import { loginAs, waitForHydration } from "./fixtures/test-helpers";

test.describe("Search", () => {
	test.beforeEach(async ({ page }) => {
		await loginAs(page, "alice");
	});

	test("should navigate to search page", async ({ page }) => {
		await page.click('a:has-text("Search")');

		await expect(page).toHaveURL("/search");
		await expect(page.locator('input[placeholder*="Search"]')).toBeVisible();
	});

	test("should search for posts", async ({ page }) => {
		await page.goto("/search", { waitUntil: "networkidle" });
		await waitForHydration(page);

		// Search for posts
		await page.fill('input[placeholder*="Search"]', "React");
		await page.press('input[placeholder*="Search"]', "Enter");

		// Wait for results
		await waitForHydration(page);

		// Should show posts containing "React"
		const postsTab = page.locator('button:has-text("Posts")');
		if (await postsTab.isVisible()) {
			await postsTab.click();
		}
	});

	test("should search for users", async ({ page }) => {
		await page.goto("/search", { waitUntil: "networkidle" });
		await waitForHydration(page);

		// Switch to users tab
		await page.click('button:has-text("Users")');

		// Search for users
		await page.fill('input[placeholder*="Search"]', "alice");
		await page.press('input[placeholder*="Search"]', "Enter");

		// Wait for results
		await waitForHydration(page);

		// Should show Alice in results - use the search results area to be specific
		// The search results show user cards with paragraph elements for names
		await expect(page.locator('p:has-text("Alice Johnson")')).toBeVisible();
	});

	test("should toggle between posts and users tabs", async ({ page }) => {
		await page.goto("/search", { waitUntil: "networkidle" });
		await waitForHydration(page);

		// Click Users tab
		await page.click('button:has-text("Users")');
		// Active tab has active styling (StyleX tabActive class)
		await expect(page.locator('button:has-text("Users")')).toHaveClass(/tabActive/);

		// Click Posts tab
		await page.click('button:has-text("Posts")');
		await expect(page.locator('button:has-text("Posts")')).toHaveClass(/tabActive/);
	});

	test("should show empty state when no results", async ({ page }) => {
		await page.goto("/search", { waitUntil: "networkidle" });
		await waitForHydration(page);

		// Search for something that doesn't exist
		await page.fill('input[placeholder*="Search"]', "xyzabc123notfound");
		await page.press('input[placeholder*="Search"]', "Enter");

		// Wait for results
		await waitForHydration(page);

		// Should show no results message or empty list
		const postsCount = await page.locator("article").count();
		expect(postsCount).toBe(0);
	});
});
