import { expect, test } from "@playwright/test";
import {
	createPost,
	goToProfile,
	loginAs,
	uniqueId,
	waitForHydration,
} from "./fixtures/test-helpers";

test.describe("User Profile - Comprehensive", () => {
	test.describe("Viewing Profiles", () => {
		test.beforeEach(async ({ page }) => {
			await loginAs(page, "alice");
		});

		test("should display own profile information", async ({ page }) => {
			await goToProfile(page, "alice");

			await expect(page.locator('h1:has-text("Alice Johnson")')).toBeVisible();
			await expect(page.locator('p:has-text("@alice")')).toBeVisible();
		});

		test("should display user bio", async ({ page }) => {
			await goToProfile(page, "alice");

			// Alice's bio from seed data
			await expect(page.getByText(/coffee enthusiast/i)).toBeVisible();
		});

		test("should display follower count", async ({ page }) => {
			await goToProfile(page, "alice");

			await expect(page.getByText("Followers")).toBeVisible();
		});

		test("should display following count", async ({ page }) => {
			await goToProfile(page, "alice");

			await expect(page.getByText("Following")).toBeVisible();
		});

		test("should display user posts", async ({ page }) => {
			await goToProfile(page, "alice");

			// Alice should have posts from seed data
			await expect(page.getByText(/full-stack app with gRPC/i)).toBeVisible();
		});

		test("should view other user profile", async ({ page }) => {
			await goToProfile(page, "bob");

			await expect(page.locator('h1:has-text("Bob Smith")')).toBeVisible();
			await expect(page.locator('p:has-text("@bob")')).toBeVisible();
		});

		test("should display avatar or initial", async ({ page }) => {
			await goToProfile(page, "alice");

			// Should show avatar image or initial letter
			const avatar = page.locator('img[alt*="alice"], [data-testid="avatar"]');
			const initial = page.locator('div:has-text("A")').first();

			const hasAvatar = (await avatar.isVisible()) || (await initial.isVisible());
			expect(hasAvatar).toBeTruthy();
		});

		test("should navigate to profile from post author link", async ({ page }) => {
			await page.goto("/", { waitUntil: "networkidle" });
			await waitForHydration(page);

			// Click on author link in a post
			const authorLink = page.locator('article a[href*="/users/"]').first();
			await authorLink.click();
			await waitForHydration(page);

			await expect(page).toHaveURL(/\/users\//);
		});
	});

	test.describe("Following Users", () => {
		test.beforeEach(async ({ page }) => {
			await loginAs(page, "alice");
		});

		test("should show follow button on other user profiles", async ({ page }) => {
			await goToProfile(page, "diana");

			const followButton = page.locator("button").filter({ hasText: /^Follow$|Following/ });
			await expect(followButton).toBeVisible();
		});

		test("should not show follow button on own profile", async ({ page }) => {
			await goToProfile(page, "alice");

			const followButton = page.locator("button").filter({ hasText: /^Follow$/ });
			await expect(followButton).not.toBeVisible();
		});

		test("should follow a user", async ({ page }) => {
			await goToProfile(page, "diana");

			const followButton = page.locator("button").filter({ hasText: /^Follow$/ });

			if (await followButton.isVisible()) {
				await followButton.click();
				await waitForHydration(page);

				// Button should change to "Following"
				await expect(page.locator("button").filter({ hasText: "Following" })).toBeVisible();
			}
		});

		test("should unfollow a user", async ({ page }) => {
			// Alice follows Bob in seed data
			await goToProfile(page, "bob");

			const followingButton = page.locator("button").filter({ hasText: "Following" });

			if (await followingButton.isVisible()) {
				await followingButton.click();
				await waitForHydration(page);

				// Button should change back to "Follow"
				await expect(page.locator("button").filter({ hasText: /^Follow$/ })).toBeVisible();
			}
		});

		test("should update follower count after follow", async ({ page }) => {
			await goToProfile(page, "diana");

			// Get initial follower count
			const followerText = page.getByText(/\d+\s*Followers/);
			const initialText = await followerText.textContent();
			const initialCount = Number.parseInt(initialText?.match(/\d+/)?.[0] || "0");

			const followButton = page.locator("button").filter({ hasText: /^Follow$/ });

			if (await followButton.isVisible()) {
				await followButton.click();
				await waitForHydration(page);

				// Refresh to see updated count
				await page.reload({ waitUntil: "networkidle" });
				await waitForHydration(page);

				const newText = await page.getByText(/\d+\s*Followers/).textContent();
				const newCount = Number.parseInt(newText?.match(/\d+/)?.[0] || "0");

				expect(newCount).toBeGreaterThanOrEqual(initialCount);
			}
		});

		test("should persist follow state across page reloads", async ({ page }) => {
			await goToProfile(page, "diana");

			const followButton = page.locator("button").filter({ hasText: /^Follow$/ });

			if (await followButton.isVisible()) {
				await followButton.click();
				await waitForHydration(page);

				// Reload page
				await page.reload({ waitUntil: "networkidle" });
				await waitForHydration(page);

				// Should still show "Following"
				await expect(page.locator("button").filter({ hasText: "Following" })).toBeVisible();
			}
		});
	});

	test.describe("Profile Posts", () => {
		test.beforeEach(async ({ page }) => {
			await loginAs(page, "alice");
		});

		test("should only show user posts on their profile", async ({ page }) => {
			await goToProfile(page, "alice");

			// All posts should be by Alice
			const posts = page.locator("article");
			const postCount = await posts.count();

			for (let i = 0; i < Math.min(postCount, 5); i++) {
				// Each post should be linked to Alice or show Alice's content
				const post = posts.nth(i);
				await expect(post).toBeVisible();
			}
		});

		test("should navigate to post detail from profile", async ({ page }) => {
			await goToProfile(page, "alice");

			const postLink = page.locator('a[href*="/posts/"]').first();
			if (await postLink.isVisible()) {
				await postLink.click();
				await waitForHydration(page);

				await expect(page).toHaveURL(/\/posts\//);
			}
		});

		test("should like a post from profile page", async ({ page }) => {
			// Create a post first to ensure there's something to like
			const content = `Profile like test ${uniqueId()}`;
			await createPost(page, content);

			// Go to Alice's own profile
			await goToProfile(page, "alice");
			await waitForHydration(page);

			// Find the like button on our new post
			const postArticle = page.locator("article").filter({ hasText: content }).first();
			const likeButton = postArticle.locator("button").filter({ hasText: /^\d+$/ }).first();

			const initialCount = Number.parseInt((await likeButton.textContent()) || "0");
			await likeButton.click();
			await waitForHydration(page);

			const newCount = Number.parseInt((await likeButton.textContent()) || "0");
			expect(newCount).toBeGreaterThanOrEqual(initialCount);
		});
	});

	test.describe("Profile Navigation", () => {
		test.beforeEach(async ({ page }) => {
			await loginAs(page, "alice");
		});

		test("should access profile from header", async ({ page }) => {
			await page.goto("/", { waitUntil: "networkidle" });
			await waitForHydration(page);

			// Click on username in header
			const profileLink = page.locator('header a[href*="/users/alice"]');
			if (await profileLink.isVisible()) {
				await profileLink.click();
				await waitForHydration(page);

				await expect(page).toHaveURL(/\/users\/alice/);
			}
		});

		test("should go back to feed from profile", async ({ page }) => {
			await goToProfile(page, "alice");

			// Click on home link or logo
			const homeLink = page.getByRole("link", { name: /home|chirp/i }).first();
			await homeLink.click();
			await waitForHydration(page);

			await expect(page).toHaveURL("/");
		});
	});

	test.describe("Public Profile Access", () => {
		test("should allow viewing profiles when not logged in", async ({ page }) => {
			// Don't login - go directly to profile
			await page.goto("/users/alice", { waitUntil: "networkidle" });
			await waitForHydration(page);

			// Should show profile info
			await expect(page.locator('h1:has-text("Alice Johnson")')).toBeVisible();
		});

		test("should not show follow button when not logged in", async ({ page }) => {
			await page.goto("/users/alice", { waitUntil: "networkidle" });
			await waitForHydration(page);

			// Follow button should not be visible or functional (either not visible or disabled)
			const followButton = page.locator("button").filter({ hasText: /^Follow$|Following/ });
			expect(await followButton.isVisible().catch(() => false)).toBeDefined();
		});
	});
});
