import { expect, test } from "@playwright/test";
import { loginAs, waitForHydration } from "./fixtures/test-helpers";

test.describe("Mentions", () => {
	test.beforeEach(async ({ page }) => {
		await loginAs(page, "alice");
	});

	test("should render mentions as clickable links in posts", async ({ page }) => {
		// Create a post with a mention
		const postContent = `Hey @bob check this out ${Date.now()}`;
		await page.fill('textarea[placeholder*="happening"]', postContent);
		await page.click('button:has-text("Post")');
		await waitForHydration(page);

		// The mention should be rendered as a link
		const mentionLink = page.locator('a[href="/users/bob"]').filter({ hasText: "@bob" });
		await expect(mentionLink.first()).toBeVisible();
	});

	test("should navigate to user profile when clicking mention", async ({ page }) => {
		// Create a post with a mention
		const postContent = `Hello @bob ${Date.now()}`;
		await page.fill('textarea[placeholder*="happening"]', postContent);
		await page.click('button:has-text("Post")');
		await waitForHydration(page);

		// Click on the mention
		const mentionLink = page.locator('a[href="/users/bob"]').filter({ hasText: "@bob" }).first();
		await mentionLink.click();

		// Should navigate to user profile
		await expect(page).toHaveURL("/users/bob");
	});

	test("should render multiple mentions in a post", async ({ page }) => {
		// Create a post with multiple mentions
		const postContent = `Hey @bob and @charlie! ${Date.now()}`;
		await page.fill('textarea[placeholder*="happening"]', postContent);
		await page.click('button:has-text("Post")');
		await waitForHydration(page);

		// Both mentions should be rendered as links
		const bobMention = page.locator('a[href="/users/bob"]').filter({ hasText: "@bob" });
		const charlieMention = page.locator('a[href="/users/charlie"]').filter({ hasText: "@charlie" });

		await expect(bobMention.first()).toBeVisible();
		await expect(charlieMention.first()).toBeVisible();
	});

	test("should render mentions in comments", async ({ page }) => {
		// Go to a post detail page
		const postLink = page.locator('article a[href*="/posts/"]').first();
		await postLink.click();
		await waitForHydration(page);

		// Add a comment with a mention
		const commentContent = `@bob great post! ${Date.now()}`;
		await page.fill('textarea[placeholder*="comment"]', commentContent);
		await page.click('button:has-text("Comment")');
		await waitForHydration(page);

		// The mention in the comment should be a link
		const mentionLink = page.locator('a[href="/users/bob"]').filter({ hasText: "@bob" });
		await expect(mentionLink.first()).toBeVisible();
	});

	test("should not break posts without mentions", async ({ page }) => {
		// Create a post without any mentions
		const postContent = `Just a regular post ${Date.now()}`;
		await page.fill('textarea[placeholder*="happening"]', postContent);
		await page.click('button:has-text("Post")');
		await waitForHydration(page);

		// Post should be visible without any issues
		await expect(page.getByText(postContent)).toBeVisible();
	});
});
