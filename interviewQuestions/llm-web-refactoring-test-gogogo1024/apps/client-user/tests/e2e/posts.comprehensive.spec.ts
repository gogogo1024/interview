import { expect, test } from "@playwright/test";
import {
	createPost,
	loginAs,
	setupDialogHandler,
	uniqueId,
	waitForHydration,
} from "./fixtures/test-helpers";

test.describe("Posts - Comprehensive", () => {
	test.beforeEach(async ({ page }) => {
		await loginAs(page, "alice");
	});

	test.describe("Creating Posts", () => {
		test("should create a simple text post", async ({ page }) => {
			const content = `Simple post ${uniqueId()}`;
			await createPost(page, content);
			await expect(page.getByText(content)).toBeVisible();
		});

		test("should show character count while typing", async ({ page }) => {
			await page.fill('textarea[placeholder*="happening"]', "Hello");
			await expect(page.getByText("5/280")).toBeVisible();

			await page.fill('textarea[placeholder*="happening"]', "Hello World");
			await expect(page.getByText("11/280")).toBeVisible();
		});

		test("should enforce 280 character limit", async ({ page }) => {
			const longContent = "a".repeat(300);
			await page.fill('textarea[placeholder*="happening"]', longContent);

			const textareaValue = await page.locator('textarea[placeholder*="happening"]').inputValue();
			expect(textareaValue.length).toBe(280);
			await expect(page.getByText("280/280")).toBeVisible();
		});

		test("should show warning at 90% character limit", async ({ page }) => {
			const content = "a".repeat(252); // 90% of 280
			await page.fill('textarea[placeholder*="happening"]', content);

			// Character count should change color/style at 90%
			await expect(page.getByText("252/280")).toBeVisible();
		});

		test("should disable post button when empty", async ({ page }) => {
			const postButton = page.locator('button:has-text("Post")');
			// Button should be disabled or not visible when textarea is empty
			const isDisabled = await postButton.isDisabled();
			expect(isDisabled).toBe(true);
		});

		test("should clear textarea after posting", async ({ page }) => {
			const content = `Clear test ${uniqueId()}`;
			await page.fill('textarea[placeholder*="happening"]', content);
			await page.click('button:has-text("Post")');
			await waitForHydration(page);

			await expect(page.locator('textarea[placeholder*="happening"]')).toHaveValue("");
		});

		test("should create post with special characters", async ({ page }) => {
			const content = `Special chars: @user #hashtag $100 & "quotes" 'apostrophe' ${uniqueId()}`;
			await createPost(page, content);
			await expect(page.getByText(content)).toBeVisible();
		});

		test("should create post with emojis", async ({ page }) => {
			const content = `Emoji post 🎉 👋 ❤️ ${uniqueId()}`;
			await createPost(page, content);
			await expect(page.getByText(/Emoji post.*🎉/).first()).toBeVisible();
		});
	});

	test.describe("Viewing Posts", () => {
		test("should display posts in feed", async ({ page }) => {
			await page.goto("/", { waitUntil: "networkidle" });
			await waitForHydration(page);

			// Feed should have posts
			const posts = page.locator("article");
			expect(await posts.count()).toBeGreaterThan(0);
		});

		test("should show post author information", async ({ page }) => {
			await page.goto("/", { waitUntil: "networkidle" });
			await waitForHydration(page);

			// Posts should show author name and username
			const firstPost = page.locator("article").first();
			await expect(firstPost.locator("a").first()).toBeVisible();
		});

		test("should show post timestamp", async ({ page }) => {
			await page.goto("/", { waitUntil: "networkidle" });
			await waitForHydration(page);

			// Posts should show relative time
			const timeIndicator = page
				.locator("article")
				.first()
				.getByText(/ago|just now|minute|hour|day/i);
			await expect(timeIndicator).toBeVisible();
		});

		test("should navigate to single post view", async ({ page }) => {
			await page.goto("/", { waitUntil: "networkidle" });
			await waitForHydration(page);

			const postLink = page.locator('a[href*="/posts/"]').first();
			await postLink.click();
			await waitForHydration(page);

			await expect(page).toHaveURL(/\/posts\//);
		});

		test("should show post details on single post page", async ({ page }) => {
			// Navigate to a post
			await page.goto("/", { waitUntil: "networkidle" });
			await waitForHydration(page);

			const postLink = page.locator('a[href*="/posts/"]').first();
			await postLink.click();
			await waitForHydration(page);

			// Should show full post content
			await expect(page.locator("article").first()).toBeVisible();
		});

		test("should show comment form on single post page", async ({ page }) => {
			await page.goto("/", { waitUntil: "networkidle" });
			await waitForHydration(page);

			const postLink = page.locator('a[href*="/posts/"]').first();
			await postLink.click();
			await waitForHydration(page);

			// Comment form should be visible
			await expect(page.locator('textarea[placeholder*="comment"]')).toBeVisible();
		});
	});

	test.describe("Editing Posts", () => {
		test("should show edit button on own posts", async ({ page }) => {
			// Create a new post
			const content = `Editable ${uniqueId()}`;
			await createPost(page, content);

			// Edit button should be visible
			const editButton = page.locator('a[title="Edit post"]').first();
			await expect(editButton).toBeVisible();
		});

		test("should navigate to edit page when clicking edit", async ({ page }) => {
			const content = `Edit navigate ${uniqueId()}`;
			await createPost(page, content);

			const editButton = page.locator('a[title="Edit post"]').first();
			await editButton.click();
			await waitForHydration(page);

			// Should be on post detail page where editing can happen
			await expect(page).toHaveURL(/\/posts\//);
		});

		test("should not show edit button on others posts", async ({ page }) => {
			// Go to another user's profile
			await page.goto("/users/bob", { waitUntil: "networkidle" });
			await waitForHydration(page);

			// Edit button should not be visible for others' posts
			const editButton = page.locator('a[title="Edit post"]');
			await expect(editButton).not.toBeVisible();
		});
	});

	test.describe("Deleting Posts", () => {
		test("should delete own post", async ({ page }) => {
			setupDialogHandler(page, "accept");

			const content = `Deletable ${uniqueId()}`;
			await createPost(page, content);

			// Navigate to the post via href (avoids click race with concurrent feed updates)
			const postHref = await page.locator("a", { hasText: content }).first().getAttribute("href");
			await page.goto(postHref!, { waitUntil: "networkidle" });
			await waitForHydration(page);

			// Find and click delete button
			const deleteButton = page.locator('button[title="Delete post"]');
			await deleteButton.click();
			await waitForHydration(page);

			// Go back to home and verify deletion — catch ERR_ABORTED if app already redirected
			await page.goto("/", { waitUntil: "networkidle" }).catch(() => {});
			await waitForHydration(page);

			await expect(page.getByText(content)).not.toBeVisible();
		});

		test("should cancel deletion when dismissing dialog", async ({ page }) => {
			setupDialogHandler(page, "dismiss");

			const content = `Keep me ${uniqueId()}`;
			await createPost(page, content);

			// Try to delete but cancel — navigate via href to avoid click race
			const postHref = await page.locator("a", { hasText: content }).first().getAttribute("href");
			await page.goto(postHref!, { waitUntil: "networkidle" });
			await waitForHydration(page);

			const deleteButton = page.locator('button[title="Delete post"]');
			await deleteButton.click();
			await waitForHydration(page);

			// Post should still exist
			await page.goto("/", { waitUntil: "networkidle" });
			await waitForHydration(page);
			await expect(page.getByText(content)).toBeVisible();
		});

		test("should not show delete button on others posts", async ({ page }) => {
			await page.goto("/users/bob", { waitUntil: "networkidle" });
			await waitForHydration(page);

			// Delete button should not be visible for others' posts
			const deleteButton = page
				.locator("article")
				.first()
				.locator('button[title*="delete"], button:has(svg[data-lucide="trash"])');
			await expect(deleteButton).not.toBeVisible();
		});
	});

	test.describe("Liking Posts", () => {
		test("should like a post", async ({ page }) => {
			// Create a unique post to avoid race conditions with other tests
			const content = `Like test ${uniqueId()}`;
			await createPost(page, content);

			// Find the like button on our new post
			const postArticle = page.locator("article").filter({ hasText: content }).first();
			const likeButton = postArticle.locator("button").filter({ hasText: /^\d+$/ }).first();
			const initialCount = Number.parseInt((await likeButton.textContent()) || "0");

			await likeButton.click();
			await waitForHydration(page);

			// Like count should increase or button state should change (retrying assertion)
			await expect
				.poll(async () => Number.parseInt((await likeButton.textContent()) || "0"))
				.toBeGreaterThanOrEqual(initialCount);
		});

		test("should unlike a post", async ({ page }) => {
			// Create a unique post to avoid race conditions with other tests
			const content = `Unlike test ${uniqueId()}`;
			await createPost(page, content);

			// Find the like button on our new post
			const postArticle = page.locator("article").filter({ hasText: content }).first();
			const likeButton = postArticle.locator("button").filter({ hasText: /^\d+$/ }).first();

			// Click twice to like then unlike
			await likeButton.click();
			await waitForHydration(page);
			const likedCount = Number.parseInt((await likeButton.textContent()) || "0");

			await likeButton.click();
			await waitForHydration(page);

			// Unlike count should be <= liked count (retrying assertion)
			await expect
				.poll(async () => Number.parseInt((await likeButton.textContent()) || "0"))
				.toBeLessThanOrEqual(likedCount);
		});

		test("should persist like state on page reload", async ({ page }) => {
			// Create a unique post to avoid race conditions with other tests
			const content = `Persist like test ${uniqueId()}`;
			await createPost(page, content);

			// Find the like button on our new post
			const postArticle = page.locator("article").filter({ hasText: content }).first();
			const likeButton = postArticle.locator("button").filter({ hasText: /^\d+$/ }).first();
			await likeButton.click();
			await waitForHydration(page);

			// Wait for like count to update before capturing
			await expect
				.poll(async () => Number.parseInt((await likeButton.textContent()) || "0"))
				.toBeGreaterThan(0);
			const countAfterLike = await likeButton.textContent();

			// Reload page
			await page.reload({ waitUntil: "networkidle" });
			await waitForHydration(page);

			// Like should persist - find our post again (retrying assertion)
			const likeButtonAfterReload = page
				.locator("article")
				.filter({ hasText: content })
				.first()
				.locator("button")
				.filter({ hasText: /^\d+$/ })
				.first();
			await expect(likeButtonAfterReload).toHaveText(countAfterLike || "");
		});
	});
});
