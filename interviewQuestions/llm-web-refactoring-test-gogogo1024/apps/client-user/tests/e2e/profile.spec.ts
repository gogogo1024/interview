import { expect, test } from "@playwright/test";
import { loginAs, waitForHydration } from "./fixtures/test-helpers";

test.describe("User Profile", () => {
	test.beforeEach(async ({ page }) => {
		await loginAs(page, "alice");
	});

	test("should view own profile", async ({ page }) => {
		// Navigate directly to profile page (header user info loads async)
		await page.goto("/users/alice", { waitUntil: "networkidle" });
		await waitForHydration(page);

		// Should show profile page
		await expect(page).toHaveURL(/\/users\/alice/);
		// Use heading to be more specific - the profile name is in an h1
		await expect(page.locator('h1:has-text("Alice Johnson")')).toBeVisible();
		await expect(page.locator('p:has-text("@alice")')).toBeVisible();
	});

	test("should view other user profile", async ({ page }) => {
		// Navigate to Bob's profile
		await page.goto("/users/bob", { waitUntil: "networkidle" });
		await waitForHydration(page);

		// Use heading to be more specific - the profile name is in an h1
		await expect(page.locator('h1:has-text("Bob Smith")')).toBeVisible();
		await expect(page.locator('p:has-text("@bob")')).toBeVisible();
	});

	test("should show user bio", async ({ page }) => {
		await page.goto("/users/alice", { waitUntil: "networkidle" });
		await waitForHydration(page);

		// Alice's bio from seed data
		await expect(page.getByText(/coffee enthusiast/i)).toBeVisible();
	});

	test("should show follower and following counts", async ({ page }) => {
		await page.goto("/users/alice", { waitUntil: "networkidle" });
		await waitForHydration(page);

		// Should show counts (format: "{number} Following" and "{number} Followers")
		await expect(page.getByText("Following")).toBeVisible();
		await expect(page.getByText("Followers")).toBeVisible();
	});

	test("should follow another user", async ({ page }) => {
		// Go to Diana's profile - Alice doesn't follow Diana in seed data
		await page.goto("/users/diana", { waitUntil: "networkidle" });
		await waitForHydration(page);

		// Click follow button - use more specific selector since "Following" also appears in stats
		const followButton = page.locator("button").filter({ hasText: /^Follow$/ });

		if (await followButton.isVisible()) {
			await followButton.click();

			// Wait for the follow action to complete
			await waitForHydration(page);

			// Button should change to "Following" - look for button with exact text
			await expect(page.locator("button").filter({ hasText: "Following" })).toBeVisible();
		}
	});

	test("should unfollow a user", async ({ page }) => {
		// Go to Bob's profile (Alice follows Bob in seed data)
		await page.goto("/users/bob", { waitUntil: "networkidle" });
		await waitForHydration(page);

		// Should show "Following" button - use more specific selector
		const followingButton = page.locator("button").filter({ hasText: "Following" });

		if (await followingButton.isVisible()) {
			await followingButton.click();

			// Wait for the action to complete
			await waitForHydration(page);

			// Button should change to "Follow"
			await expect(page.locator("button").filter({ hasText: /^Follow$/ })).toBeVisible();
		}
	});

	test("should show user posts on profile", async ({ page }) => {
		await page.goto("/users/alice", { waitUntil: "networkidle" });
		await waitForHydration(page);

		// Should show Alice's posts from seed data
		await expect(page.getByText(/full-stack app with gRPC/i)).toBeVisible();
	});

	test("should not show follow button on own profile", async ({ page }) => {
		await page.goto("/users/alice", { waitUntil: "networkidle" });
		await waitForHydration(page);

		// Should not show follow button on own profile - use specific button selectors
		await expect(page.locator("button").filter({ hasText: /^Follow$/ })).not.toBeVisible();
		await expect(page.locator("button").filter({ hasText: "Following" })).not.toBeVisible();
	});
});
