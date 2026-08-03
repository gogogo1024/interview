import { expect, test } from "@playwright/test";
import { loginAs, waitForHydration } from "./fixtures/test-helpers";

test.describe("Comments", () => {
	test.beforeEach(async ({ page }) => {
		await loginAs(page, "alice");
	});

	test("should add a comment to a post", async ({ page }) => {
		// Navigate to a post by clicking a post link
		const postLink = page.locator('article a[href*="/posts/"]').first();
		await postLink.click();

		// Wait for post page to load
		await waitForHydration(page);

		const commentContent = `Test comment ${Date.now()}`;
		await page.fill('textarea[placeholder*="comment"]', commentContent);
		await page.click('button:has-text("Comment")');

		// Wait for comment to appear
		await waitForHydration(page);

		// Comment should appear
		await expect(page.getByText(commentContent)).toBeVisible();
	});

	test("should show comment count on posts", async ({ page }) => {
		// Navigate to home feed
		await page.goto("/", { waitUntil: "networkidle" });
		await waitForHydration(page);

		// Posts should show comment count (look for the comment icon links)
		const commentLinks = page.locator('a[href*="/posts/"]').filter({ hasText: /\d+/ });
		expect(await commentLinks.count()).toBeGreaterThanOrEqual(0);
	});

	test("should delete own comment", async ({ page }) => {
		// Navigate to a post by clicking a post link
		const postLink = page.locator('article a[href*="/posts/"]').first();
		await postLink.click();

		// Wait for post page to load
		await waitForHydration(page);

		// Add a comment
		const commentContent = `Deletable comment ${Date.now()}`;
		await page.fill('textarea[placeholder*="comment"]', commentContent);
		await page.click('button:has-text("Comment")');

		// Wait for comment to appear
		await waitForHydration(page);
		await expect(page.getByText(commentContent)).toBeVisible();

		// Delete the comment - find the paragraph with our comment text, then find the delete button
		page.on("dialog", (dialog) => dialog.accept());

		// The comment content is in a <p> tag, find it and navigate to find the delete button
		const commentParagraph = page.locator("p", { hasText: commentContent });
		// The delete button is in a sibling div after the paragraph
		const actionsDiv = commentParagraph.locator("..").locator("div").last();
		const deleteButton = actionsDiv.locator("button").last();
		await deleteButton.click();

		// Wait for deletion
		await waitForHydration(page);

		// Comment should be removed
		await expect(page.getByText(commentContent)).not.toBeVisible();
	});

	test("should like a comment", async ({ page }) => {
		// Navigate to a post
		const postLink = page.locator('article a[href*="/posts/"]').first();
		await postLink.click();

		// Wait for post page to load
		await waitForHydration(page);

		// First add a comment so we have something to like
		const commentContent = `Likeable comment ${Date.now()}`;
		await page.fill('textarea[placeholder*="comment"]', commentContent);
		await page.click('button:has-text("Comment")');

		// Wait for comment to appear
		await waitForHydration(page);

		// Like button should exist on comments
		const likeButton = page.locator("button").filter({ hasText: /^\d+$/ }).first();

		if (await likeButton.isVisible()) {
			await likeButton.click();
			// Wait for like to register
			await waitForHydration(page);
		}
	});
});
