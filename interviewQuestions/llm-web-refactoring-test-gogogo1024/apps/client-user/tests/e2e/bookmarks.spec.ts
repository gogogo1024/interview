import { expect, test } from "@playwright/test";
import { loginAs, waitForHydration } from "./fixtures/test-helpers";

test.describe("Bookmarks", () => {
	test.beforeEach(async ({ page }) => {
		await loginAs(page, "alice");
	});

	test("should bookmark a post", async ({ page }) => {
		// Find a bookmark button (bookmark icon in post actions)
		const bookmarkButton = page.locator('button[title="Bookmark"]').first();
		await expect(bookmarkButton).toBeVisible();

		await bookmarkButton.click();
		await waitForHydration(page);

		// Button should change state (the same locator should now have "Remove bookmark" title)
		await expect(page.locator('button[title="Remove bookmark"]').first()).toBeVisible();
	});

	test("should unbookmark a post", async ({ page }) => {
		// First bookmark a post
		const bookmarkButton = page.locator('button[title="Bookmark"]').first();
		await bookmarkButton.click();
		await waitForHydration(page);

		// Now unbookmark it
		const unbookmarkButton = page.locator('button[title="Remove bookmark"]').first();
		await unbookmarkButton.click();
		await waitForHydration(page);

		// Button should revert to bookmark state
		await expect(page.locator('button[title="Bookmark"]').first()).toBeVisible();
	});

	test("should navigate to bookmarks page", async ({ page }) => {
		// Click bookmarks link in header navigation
		const bookmarksLink = page.locator('nav a[href="/bookmarks"]');
		await expect(bookmarksLink).toBeVisible();
		await bookmarksLink.click();

		await expect(page).toHaveURL("/bookmarks");
		await expect(page.getByRole("heading", { name: "Bookmarks" })).toBeVisible();
	});

	test("should show bookmarked posts on bookmarks page", async ({ page }) => {
		// Create and bookmark a post
		const postContent = `Bookmark test ${Date.now()}`;
		await page.fill('textarea[placeholder*="happening"]', postContent);
		await page.click('button:has-text("Post")');
		await waitForHydration(page);

		// Bookmark the post
		const postArticle = page.locator("article").filter({ hasText: postContent }).first();
		const bookmarkButton = postArticle.locator('button[title="Bookmark"]');
		await bookmarkButton.click();
		await waitForHydration(page);

		// Navigate to bookmarks page
		await page.goto("/bookmarks", { waitUntil: "networkidle" });
		await waitForHydration(page);

		// Post should appear on bookmarks page
		await expect(page.getByText(postContent)).toBeVisible();
	});

	test("should show bookmarks list or empty state", async ({ page }) => {
		// Navigate directly to bookmarks page
		await page.goto("/bookmarks", { waitUntil: "networkidle" });
		await waitForHydration(page);

		// Page should load with either bookmarks or empty state
		const hasBookmarks = await page.locator('button[title="Remove bookmark"]').first().isVisible();
		const hasEmptyState = await page.getByText("No bookmarks yet").isVisible();

		// One of these should be true
		expect(hasBookmarks || hasEmptyState).toBe(true);
	});
});
