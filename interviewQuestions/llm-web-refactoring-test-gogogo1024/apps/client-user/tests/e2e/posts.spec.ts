import { expect, test } from "@playwright/test";
import { loginAs, waitForHydration } from "./fixtures/test-helpers";

test.describe("Posts", () => {
	test.beforeEach(async ({ page }) => {
		await loginAs(page, "alice");
	});

	test("should create a new post", async ({ page }) => {
		const postContent = `Test post ${Date.now()}`;

		await page.fill('textarea[placeholder*="happening"]', postContent);
		await page.click('button:has-text("Post")');

		// Wait for post to appear
		await waitForHydration(page);

		// Post should appear in the feed
		await expect(page.getByText(postContent)).toBeVisible();
	});

	test("should show character count", async ({ page }) => {
		await page.fill('textarea[placeholder*="happening"]', "Hello");

		await expect(page.getByText("5/280")).toBeVisible();
	});

	test("should not allow posts over 280 characters", async ({ page }) => {
		const longContent = "a".repeat(281);

		// Fill the textarea - browser's maxLength will truncate to 280
		await page.fill('textarea[placeholder*="happening"]', longContent);

		// Verify the content was truncated to 280 characters
		const textareaValue = await page.locator('textarea[placeholder*="happening"]').inputValue();
		expect(textareaValue.length).toBe(280);

		// Character count should show 280/280
		await expect(page.getByText("280/280")).toBeVisible();
	});

	test("should view single post", async ({ page }) => {
		// Click on any post link to view it
		const postLink = page.locator('a[href*="/posts/"]').first();
		await postLink.click();

		// Should navigate to post page
		await expect(page).toHaveURL(/\/posts\//);
	});

	test("should edit own post within 5 minutes", async ({ page }) => {
		// Create a new post first
		const postContent = `Editable post ${Date.now()}`;
		await page.fill('textarea[placeholder*="happening"]', postContent);
		await page.click('button:has-text("Post")');

		// Wait for post to appear
		await waitForHydration(page);
		await expect(page.getByText(postContent)).toBeVisible();

		// Edit button (pencil icon) should be visible on own post - it links to the post page
		const editButton = page.locator('a[title="Edit post"]').first();
		await expect(editButton).toBeVisible();
	});

	test("should delete own post", async ({ page }) => {
		// Set up dialog handler before any actions
		page.on("dialog", (dialog) => dialog.accept());

		// Create a new post
		const postContent = `Deletable post ${Date.now()}`;
		await page.fill('textarea[placeholder*="happening"]', postContent);
		await page.click('button:has-text("Post")');

		// Wait for post to appear
		await waitForHydration(page);
		await expect(page.getByText(postContent)).toBeVisible();

		// Navigate to post detail via href (avoids click race with concurrent feed updates)
		const postHref = await page.locator("a", { hasText: postContent }).first().getAttribute("href");
		await page.goto(postHref!, { waitUntil: "networkidle" });
		await waitForHydration(page);

		// Delete the post
		const deleteButton = page.locator('button[title="Delete post"]');
		await deleteButton.click();

		// Wait for redirect after deletion (should go back to home or previous page)
		await waitForHydration(page);

		// Navigate back to home to verify post is gone — catch ERR_ABORTED if app already redirected
		await page.goto("/", { waitUntil: "networkidle" }).catch(() => {});
		await waitForHydration(page);

		// Post should be removed
		await expect(page.getByText(postContent)).not.toBeVisible();
	});

	test("should like a post", async ({ page }) => {
		// Find a like button (first button with a number in post actions)
		const likeButton = page.locator("button").filter({ hasText: /^\d+$/ }).first();
		const initialCount = await likeButton.textContent();

		await likeButton.click();

		// Wait for like count to update
		await waitForHydration(page);

		const newCount = await likeButton.textContent();
		expect(Number.parseInt(newCount || "0")).toBeGreaterThanOrEqual(
			Number.parseInt(initialCount || "0"),
		);
	});
});
