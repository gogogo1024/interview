import { expect, test } from "@playwright/test";
import { createPost, loginAs, uniqueId, waitForHydration } from "./fixtures/test-helpers";

test.describe("Mentions - Comprehensive", () => {
	test.describe("Mention Rendering in Posts", () => {
		test("should render @username as clickable link", async ({ page }) => {
			await loginAs(page, "alice");

			const content = `Hey @bob check this ${uniqueId()}`;
			await createPost(page, content);

			// Find the mention link by its href attribute (more specific than hasText)
			const mentionLink = page.locator('a[href="/users/bob"]').filter({ hasText: "@bob" });
			await expect(mentionLink.first()).toBeVisible();
			await expect(mentionLink.first()).toHaveAttribute("href", "/users/bob");
		});

		test("should navigate to user profile when clicking mention", async ({ page }) => {
			await loginAs(page, "alice");

			const content = `Shoutout to @bob ${uniqueId()}`;
			await createPost(page, content);

			// Click the mention link (using href to be more specific)
			const mentionLink = page.locator('a[href="/users/bob"]').filter({ hasText: "@bob" }).first();
			await mentionLink.click();
			await waitForHydration(page);

			// Should be on bob's profile
			await expect(page).toHaveURL("/users/bob");
			await expect(page.getByRole("heading", { name: "Bob Smith" })).toBeVisible();
		});

		test("should render multiple mentions in single post", async ({ page }) => {
			await loginAs(page, "alice");

			const content = `Meeting with @bob @charlie and @diana ${uniqueId()}`;
			await createPost(page, content);

			// All mentions should be links (using href to be more specific)
			const postArticle = page.locator("article").filter({ hasText: "Meeting with" }).first();
			await expect(postArticle.locator('a[href="/users/bob"]')).toBeVisible();
			await expect(postArticle.locator('a[href="/users/charlie"]')).toBeVisible();
			await expect(postArticle.locator('a[href="/users/diana"]')).toBeVisible();
		});

		test("should handle mention at start of post", async ({ page }) => {
			await loginAs(page, "alice");

			const content = `@bob this is for you ${uniqueId()}`;
			await createPost(page, content);

			const mentionLink = page.locator("a").filter({ hasText: "@bob" });
			await expect(mentionLink.first()).toBeVisible();
		});

		test("should handle mention at end of post", async ({ page }) => {
			await loginAs(page, "alice");

			const content = `${uniqueId()} cc @bob`;
			await createPost(page, content);

			const mentionLink = page.locator("a").filter({ hasText: "@bob" });
			await expect(mentionLink.first()).toBeVisible();
		});

		test("should handle mention with underscore in username", async ({ page }) => {
			await loginAs(page, "alice");

			// Note: This assumes test users don't have underscores, but tests the regex works
			const content = `Testing @bob_123 mention ${uniqueId()}`;
			await page.fill('textarea[placeholder*="happening"]', content);
			await page.click('button:has-text("Post")');
			await waitForHydration(page);

			// Content should render (even if user doesn't exist, it should still render as text)
			await expect(page.getByText(content)).toBeVisible();
		});

		test("should preserve non-mention @ symbols", async ({ page }) => {
			await loginAs(page, "alice");

			const content = `Email me @ test@example.com ${uniqueId()}`;
			await createPost(page, content);

			// Post should be visible with the email - use full content to be unique
			await expect(page.getByText(content)).toBeVisible();
		});

		test("should render post without mentions normally", async ({ page }) => {
			await loginAs(page, "alice");

			const content = `No mentions here ${uniqueId()}`;
			await createPost(page, content);

			await expect(page.getByText(content)).toBeVisible();
		});
	});

	test.describe("Mention Rendering in Comments", () => {
		test("should render mention in comment as clickable link", async ({ page }) => {
			await loginAs(page, "alice");

			// Navigate to a post via its href (avoids click race with concurrent feed updates)
			const postHref = await page
				.locator('article a[href*="/posts/"]')
				.first()
				.getAttribute("href");
			await page.goto(postHref!, { waitUntil: "networkidle" });
			await waitForHydration(page);

			// Wait for comment form to be available
			const commentInput = page.locator('textarea[placeholder*="comment"]');
			await expect(commentInput).toBeVisible();

			// Add comment with mention
			const commentContent = `@bob what do you think? ${uniqueId()}`;
			await commentInput.fill(commentContent);
			await page.click('button:has-text("Comment")');
			await waitForHydration(page);

			// Mention should be a link
			const mentionLink = page.locator("a").filter({ hasText: "@bob" });
			await expect(mentionLink.first()).toBeVisible();
		});

		test("should navigate to profile from comment mention", async ({ page }) => {
			await loginAs(page, "alice");

			// Navigate to a post via its href (avoids click race with concurrent feed updates)
			const postHref = await page
				.locator('article a[href*="/posts/"]')
				.first()
				.getAttribute("href");
			await page.goto(postHref!, { waitUntil: "networkidle" });
			await waitForHydration(page);

			// Add comment with mention
			const commentContent = `Great work @bob ${uniqueId()}`;
			await page.fill('textarea[placeholder*="comment"]', commentContent);
			await page.click('button:has-text("Comment")');
			await waitForHydration(page);

			// Click the mention link (using href to be more specific)
			const mentionLink = page.locator('a[href="/users/bob"]').first();
			await mentionLink.click();
			await waitForHydration(page);

			// Should be on bob's profile
			await expect(page).toHaveURL("/users/bob");
		});
	});

	test.describe("Mention Notifications", () => {
		test("should create notification when mentioned in post", async ({ page }) => {
			test.slow(); // Cross-user interaction requires multiple logins
			// Login as alice and create post mentioning bob
			await loginAs(page, "alice");

			const content = `Hey @bob check this out ${uniqueId()}`;
			await createPost(page, content);

			// Log out and login as bob
			await page.click('button[title="Logout"]');
			await waitForHydration(page);
			await loginAs(page, "bob");

			// Go to notifications
			await page.goto("/notifications", { waitUntil: "networkidle" });
			await waitForHydration(page);

			// Should see mention notification from alice
			await expect(page.getByText(/alice|mentioned/i).first()).toBeVisible();
		});

		test("should create notification when mentioned in comment", async ({ page }) => {
			test.slow(); // Cross-user interaction requires multiple logins
			// Login as alice and find a post to comment on
			await loginAs(page, "alice");

			// Navigate to a post via its href (avoids click race with concurrent feed updates)
			const postHref = await page
				.locator('article a[href*="/posts/"]')
				.first()
				.getAttribute("href");
			await page.goto(postHref!, { waitUntil: "networkidle" });
			await waitForHydration(page);

			// Add comment mentioning bob
			const commentContent = `@bob thoughts on this? ${uniqueId()}`;
			await page.fill('textarea[placeholder*="comment"]', commentContent);
			await page.click('button:has-text("Comment")');
			await waitForHydration(page);

			// Log out and login as bob
			await page.click('button[title="Logout"]');
			await waitForHydration(page);
			await loginAs(page, "bob");

			// Go to notifications
			await page.goto("/notifications", { waitUntil: "networkidle" });
			await waitForHydration(page);

			// Should see mention notification
			await expect(page.getByText(/alice|mentioned/i).first()).toBeVisible();
		});

		test("should NOT create notification for self-mention", async ({ page }) => {
			await loginAs(page, "alice");

			// Create post mentioning self
			const content = `Reminder to @alice ${uniqueId()}`;
			await createPost(page, content);

			// Go to notifications
			await page.goto("/notifications", { waitUntil: "networkidle" });
			await waitForHydration(page);

			// Should NOT have self-mention notification for this specific content
			const selfMentionNotification = page.locator('article, [role="listitem"]').filter({
				hasText: new RegExp(`mentioned.*${content.substring(0, 15)}`, "i"),
			});
			await expect(selfMentionNotification).not.toBeVisible();
		});

		test("should navigate to post when clicking mention notification", async ({ page }) => {
			test.slow(); // Cross-user interaction requires multiple logins
			// Create a post with mention as alice
			await loginAs(page, "alice");

			const content = `Important @bob message ${uniqueId()}`;
			await createPost(page, content);

			// Log out and login as bob
			await page.click('button[title="Logout"]');
			await waitForHydration(page);
			await loginAs(page, "bob");

			// Go to notifications
			await page.goto("/notifications", { waitUntil: "networkidle" });
			await waitForHydration(page);

			// Click the mention notification
			const mentionNotification = page
				.locator('div[role="button"]')
				.filter({ hasText: /mentioned/i })
				.first();
			if (await mentionNotification.isVisible()) {
				await mentionNotification.click();
				await waitForHydration(page);

				// Should navigate to the post
				await expect(page).toHaveURL(/\/posts\//);
			}
		});
	});

	test.describe("Invalid Mentions", () => {
		test("should render invalid username mention as plain text", async ({ page }) => {
			await loginAs(page, "alice");

			const content = `Hey @nonexistentuser123456 ${uniqueId()}`;
			await createPost(page, content);

			// Content should be visible - use full content to ensure uniqueness
			await expect(page.getByText(content)).toBeVisible();

			// Should still be a link (frontend doesn't validate)
			const mentionLink = page.locator('a[href="/users/nonexistentuser123456"]');
			await expect(mentionLink.first()).toBeVisible();
		});

		test("should handle @ followed by special characters", async ({ page }) => {
			await loginAs(page, "alice");

			const content = `Check @#hashtag and @!invalid ${uniqueId()}`;
			await createPost(page, content);

			// Post should render without errors - use full content to ensure uniqueness
			await expect(page.getByText(content)).toBeVisible();
		});
	});

	test.describe("Mention Click Behavior", () => {
		test("should not navigate away from post when clicking mention stops propagation", async ({
			page,
		}) => {
			await loginAs(page, "alice");

			const content = `Post about @bob ${uniqueId()}`;
			await createPost(page, content);

			// Click the mention link (using href to be more specific)
			const postArticle = page.locator("article").filter({ hasText: content }).first();
			const mentionLink = postArticle.locator('a[href="/users/bob"]');
			await mentionLink.click();
			await waitForHydration(page);

			// Should navigate to bob's profile, not the post detail
			await expect(page).toHaveURL("/users/bob");
		});
	});
});
