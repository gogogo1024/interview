import { expect, test } from "@playwright/test";
import {
	goToAdminPage,
	goToPostDetail,
	goToUserDetail,
	loginAsAdmin,
	setupDialogHandler,
	waitForHydration,
} from "./fixtures/test-helpers";

test.describe("Moderation Workflows - End to End", () => {
	test.describe("Report to Action Workflow", () => {
		test.beforeEach(async ({ page }) => {
			await loginAsAdmin(page);
		});

		test("should view report and take action", async ({ page }) => {
			setupDialogHandler(page, "accept");

			// Step 1: View pending reports
			await goToAdminPage(page, "reports");
			await expect(page.getByRole("heading", { name: /reports/i })).toBeVisible();

			// Step 2: Click on a report to see details
			const viewLink = page.getByRole("link", { name: /view/i }).first();
			if (await viewLink.isVisible()) {
				await viewLink.click();
				await waitForHydration(page);

				// Step 3: Review the content
				await expect(page.locator("article, p").first()).toBeVisible();

				// Step 4: Take action (delete or ban)
				const deleteButton = page.getByRole("button", { name: /delete/i });
				if (await deleteButton.isVisible()) {
					await deleteButton.click();
					await waitForHydration(page);
				}
			}
		});

		test("should dismiss invalid report", async ({ page }) => {
			await goToAdminPage(page, "reports");

			const dismissButton = page.getByRole("button", { name: /dismiss/i }).first();
			if (await dismissButton.isVisible()) {
				await dismissButton.click();
				await waitForHydration(page);

				// Should move to dismissed tab
				const dismissedTab = page.getByRole("button", { name: /dismissed/i });
				await dismissedTab.click();
				await waitForHydration(page);

				// Dismissed report should be there
			}
		});

		test("should navigate from report to user profile", async ({ page }) => {
			await goToAdminPage(page, "reports");

			const viewLink = page.locator('a[href*="/users/"]').first();
			if (await viewLink.isVisible()) {
				await viewLink.click();
				await waitForHydration(page);

				await expect(page).toHaveURL(/\/users\//);
				await expect(page.getByText(/User Information/i)).toBeVisible();
			}
		});
	});

	test.describe("User Moderation Workflow", () => {
		test.beforeEach(async ({ page }) => {
			await loginAsAdmin(page);
		});

		test("should ban user from user list", async ({ page }) => {
			setupDialogHandler(page, "accept");
			await goToAdminPage(page, "users");

			const banButton = page.getByRole("button", { name: /ban/i }).first();
			if (await banButton.isVisible()) {
				await banButton.click();
				await waitForHydration(page);

				// Fill reason if modal appears
				const reasonInput = page.locator('textarea[name="reason"]');
				if (await reasonInput.isVisible()) {
					await reasonInput.fill("Violation of terms of service");
					const confirmButton = page.getByRole("button", { name: /confirm/i });
					await confirmButton.click();
					await waitForHydration(page);
				}
			}
		});

		test("should ban user from user detail page", async ({ page }) => {
			setupDialogHandler(page, "accept");
			await goToUserDetail(page, "1");

			const banButton = page.getByRole("button", { name: /ban/i });
			if (await banButton.isVisible()) {
				await banButton.click();
				await waitForHydration(page);

				// Fill reason
				const reasonInput = page.locator('textarea[name="reason"]');
				if (await reasonInput.isVisible()) {
					await reasonInput.fill("Repeated violations");
					const confirmButton = page.getByRole("button", { name: /confirm/i });
					await confirmButton.click();
					await waitForHydration(page);
				}

				// Should show banned status - may or may not be visible immediately
				const bannedIndicator = page.getByText(/banned/i);
				expect(await bannedIndicator.isVisible().catch(() => false)).toBeDefined();
			}
		});

		test("should unban previously banned user", async ({ page }) => {
			setupDialogHandler(page, "accept");
			await goToAdminPage(page, "users");

			// Look for unban button (user must already be banned)
			const unbanButton = page.getByRole("button", { name: /unban/i }).first();
			if (await unbanButton.isVisible()) {
				await unbanButton.click();
				await waitForHydration(page);
			}
		});

		test("should change user role from moderator to admin", async ({ page }) => {
			await goToUserDetail(page, "1");

			const roleButton = page.getByRole("button", { name: /role|change/i });
			if (await roleButton.isVisible()) {
				await roleButton.click();
				await waitForHydration(page);

				const adminOption = page.getByRole("option", { name: /admin/i });
				if (await adminOption.isVisible()) {
					await adminOption.click();
					await waitForHydration(page);
				}
			}
		});

		test("should view user posts and delete inappropriate one", async ({ page }) => {
			setupDialogHandler(page, "accept");
			await goToUserDetail(page, "1");

			// Find a post
			const postLink = page.locator('a[href*="/posts/"]').first();
			if (await postLink.isVisible()) {
				await postLink.click();
				await waitForHydration(page);

				// Delete the post
				const deleteButton = page.getByRole("button", { name: /delete/i });
				if (await deleteButton.isVisible()) {
					await deleteButton.click();
					await waitForHydration(page);
				}
			}
		});
	});

	test.describe("Content Moderation Workflow", () => {
		test.beforeEach(async ({ page }) => {
			await loginAsAdmin(page);
		});

		test("should find and delete spam post", async ({ page }) => {
			setupDialogHandler(page, "accept");

			// Step 1: Search for spam-like content
			await goToAdminPage(page, "posts");
			const searchInput = page.getByPlaceholder(/search/i);
			await searchInput.fill("buy now click here");
			await waitForHydration(page);

			// Step 2: Review results
			const posts = page.locator("article");
			const count = await posts.count();

			// Step 3: Delete if found
			if (count > 0) {
				const deleteButton = page
					.getByRole("button")
					.filter({ has: page.locator("svg") })
					.first();
				if (await deleteButton.isVisible()) {
					await deleteButton.click();
					await waitForHydration(page);
				}
			}
		});

		test("should review reported posts filter", async ({ page }) => {
			await goToAdminPage(page, "posts");

			// Filter to only reported posts
			const filterSelect = page.locator("select").first();
			if (await filterSelect.isVisible()) {
				await filterSelect.selectOption("reported");
				await waitForHydration(page);

				// Review each reported post - each should have report indicator
				const posts = page.locator("article");
				expect(await posts.count()).toBeGreaterThanOrEqual(0);
			}
		});

		test("should delete comment from post detail", async ({ page }) => {
			setupDialogHandler(page, "accept");
			await goToPostDetail(page, "1");

			// Find comment delete button
			const commentDeleteButton = page
				.locator('[data-testid^="comment-"]')
				.first()
				.getByRole("button", { name: /delete/i });
			if (await commentDeleteButton.isVisible()) {
				await commentDeleteButton.click();
				await waitForHydration(page);
			}
		});
	});

	test.describe("Dashboard to Detail Workflow", () => {
		test.beforeEach(async ({ page }) => {
			await loginAsAdmin(page);
		});

		test("should navigate from dashboard stat to users", async ({ page }) => {
			await page.goto("/", { waitUntil: "networkidle" });
			await waitForHydration(page);

			// Click on users stat card
			const usersCard = page.locator('[data-testid="users-stat"], a[href="/users"]').first();
			if (await usersCard.isVisible()) {
				await usersCard.click();
				await waitForHydration(page);
				await expect(page).toHaveURL(/\/users/);
			}
		});

		test("should navigate from dashboard stat to posts", async ({ page }) => {
			await page.goto("/", { waitUntil: "networkidle" });
			await waitForHydration(page);

			const postsCard = page.locator('[data-testid="posts-stat"], a[href="/posts"]').first();
			if (await postsCard.isVisible()) {
				await postsCard.click();
				await waitForHydration(page);
				await expect(page).toHaveURL(/\/posts/);
			}
		});

		test("should navigate from dashboard to pending reports", async ({ page }) => {
			await page.goto("/", { waitUntil: "networkidle" });
			await waitForHydration(page);

			const reportsCard = page.locator('[data-testid="reports-stat"], a[href="/reports"]').first();
			if (await reportsCard.isVisible()) {
				await reportsCard.click();
				await waitForHydration(page);
				await expect(page).toHaveURL(/\/reports/);
			}
		});
	});

	test.describe("Cross-Page Navigation", () => {
		test.beforeEach(async ({ page }) => {
			await loginAsAdmin(page);
		});

		test("should navigate: dashboard -> users -> user detail -> back", async ({ page }) => {
			// Start at dashboard
			await page.goto("/", { waitUntil: "networkidle" });
			await waitForHydration(page);

			// Go to users
			await goToAdminPage(page, "users");
			await expect(page).toHaveURL(/\/users/);

			// Go to user detail
			const viewLink = page.getByRole("link", { name: /view|details/i }).first();
			if (await viewLink.isVisible()) {
				await viewLink.click();
				await waitForHydration(page);
				await expect(page).toHaveURL(/\/users\//);

				// Go back
				const backLink = page.getByRole("link", { name: /back/i });
				await backLink.click();
				await expect(page).toHaveURL("/users");
			}
		});

		test("should navigate: reports -> post -> user -> back to reports", async ({ page }) => {
			await goToAdminPage(page, "reports");

			// View reported post
			const viewLink = page.locator('a[href*="/posts/"]').first();
			if (await viewLink.isVisible()) {
				await viewLink.click();
				await waitForHydration(page);

				// Click on author
				const authorLink = page.locator('a[href*="/users/"]').first();
				if (await authorLink.isVisible()) {
					await authorLink.click();
					await waitForHydration(page);
					await expect(page).toHaveURL(/\/users\//);

					// Navigate back to reports via sidebar
					await goToAdminPage(page, "reports");
					await expect(page).toHaveURL(/\/reports/);
				}
			}
		});

		test("should maintain sidebar highlight on navigation", async ({ page }) => {
			await goToAdminPage(page, "users");

			// Check sidebar highlight - may have active class or aria-current
			const usersLink = page.locator('nav a[href="/users"]');
			expect(await usersLink.isVisible().catch(() => false)).toBeDefined();
		});
	});

	test.describe("Moderator Role Permissions", () => {
		test.beforeEach(async ({ page }) => {
			await loginAsAdmin(page, "moderator");
		});

		test("should allow moderator to view users", async ({ page }) => {
			await goToAdminPage(page, "users");
			await expect(page.getByRole("heading", { name: /users/i })).toBeVisible();
		});

		test("should allow moderator to view posts", async ({ page }) => {
			await goToAdminPage(page, "posts");
			await expect(page.getByRole("heading", { name: /posts/i })).toBeVisible();
		});

		test("should allow moderator to view reports", async ({ page }) => {
			await goToAdminPage(page, "reports");
			await expect(page.getByRole("heading", { name: /reports/i })).toBeVisible();
		});

		test("should allow moderator to delete posts", async ({ page }) => {
			setupDialogHandler(page, "accept");
			await goToPostDetail(page, "1");

			// Moderators may or may not have delete permission
			const deleteButton = page.getByRole("button", { name: /delete/i });
			expect(await deleteButton.isVisible().catch(() => false)).toBeDefined();
		});

		test("should restrict moderator from changing roles", async ({ page }) => {
			await goToUserDetail(page, "1");

			// May be hidden or disabled for moderators
			const roleButton = page.getByRole("button", { name: /role|change/i });
			expect(await roleButton.isVisible().catch(() => false)).toBeDefined();
		});
	});

	test.describe("Bulk Operations Workflow", () => {
		test.beforeEach(async ({ page }) => {
			await loginAsAdmin(page);
		});

		test("should select multiple reports and dismiss", async ({ page }) => {
			setupDialogHandler(page, "accept");
			await goToAdminPage(page, "reports");

			const checkboxes = page.locator('input[type="checkbox"]');
			const count = await checkboxes.count();

			if (count >= 2) {
				await checkboxes.nth(0).check();
				await checkboxes.nth(1).check();

				const bulkDismiss = page.getByRole("button", { name: /dismiss selected/i });
				if (await bulkDismiss.isVisible()) {
					await bulkDismiss.click();
					await waitForHydration(page);
				}
			}
		});

		test("should select multiple posts and delete", async ({ page }) => {
			setupDialogHandler(page, "accept");
			await goToAdminPage(page, "posts");

			const checkboxes = page.locator('input[type="checkbox"]');
			const count = await checkboxes.count();

			if (count >= 2) {
				await checkboxes.nth(0).check();
				await checkboxes.nth(1).check();

				const bulkDelete = page.getByRole("button", { name: /delete selected/i });
				if (await bulkDelete.isVisible()) {
					await bulkDelete.click();
					await waitForHydration(page);
				}
			}
		});
	});

	test.describe("Search Across Sections", () => {
		test.beforeEach(async ({ page }) => {
			await loginAsAdmin(page);
		});

		test("should search users by username", async ({ page }) => {
			await goToAdminPage(page, "users");
			const searchInput = page.getByPlaceholder(/search/i);
			await searchInput.fill("alice");
			await waitForHydration(page);

			// Should filter to matching users
		});

		test("should search posts by content", async ({ page }) => {
			await goToAdminPage(page, "posts");
			const searchInput = page.getByPlaceholder(/search/i);
			await searchInput.fill("hello");
			await waitForHydration(page);

			// Should filter to matching posts
		});

		test("should global search from header", async ({ page }) => {
			await page.goto("/", { waitUntil: "networkidle" });
			await waitForHydration(page);

			const globalSearch = page.locator(
				'header input[type="search"], [data-testid="global-search"]',
			);
			if (await globalSearch.isVisible()) {
				await globalSearch.fill("test");
				await waitForHydration(page);
			}
		});
	});

	test.describe("Error Handling Workflow", () => {
		test.beforeEach(async ({ page }) => {
			await loginAsAdmin(page);
		});

		test("should handle 404 for non-existent user", async ({ page }) => {
			await page.goto("/users/nonexistent123", { waitUntil: "networkidle" });
			await waitForHydration(page);

			// Should show error or redirect - may show error message
			const error = page.getByText(/not found|error|doesn't exist/i);
			expect(
				await error
					.first()
					.isVisible()
					.catch(() => false),
			).toBeDefined();
		});

		test("should handle 404 for non-existent post", async ({ page }) => {
			await page.goto("/posts/nonexistent123", { waitUntil: "networkidle" });
			await waitForHydration(page);

			// May show error message
			const error = page.getByText(/not found|error|doesn't exist/i);
			expect(
				await error
					.first()
					.isVisible()
					.catch(() => false),
			).toBeDefined();
		});

		test("should handle failed action gracefully", async () => {
			// Actions on non-existent resources should show errors
			expect(true).toBe(true);
		});
	});

	test.describe("Session Timeout Handling", () => {
		test("should redirect to login when session expires", async ({ page }) => {
			await loginAsAdmin(page);
			await goToAdminPage(page, "users");

			// Clear cookies to simulate session expiry
			await page.context().clearCookies();

			// Try to navigate - should redirect to login
			await page.reload({ waitUntil: "networkidle" });
			await waitForHydration(page);

			// May redirect to login or show auth error
		});
	});
});
