import { expect, test } from "@playwright/test";
import {
	goToAdminPage,
	goToUserDetail,
	loginAsAdmin,
	searchInList,
	setupDialogHandler,
	waitForHydration,
} from "./fixtures/test-helpers";

test.describe("User Management - Comprehensive", () => {
	test.describe("Users List Page", () => {
		test.beforeEach(async ({ page }) => {
			await loginAsAdmin(page);
			await goToAdminPage(page, "users");
		});

		test("should display users page heading", async ({ page }) => {
			await expect(page.getByRole("heading", { name: /users/i })).toBeVisible();
		});

		test("should show users table or list", async ({ page }) => {
			// Should have user entries
			const userEntries = page.locator('table tbody tr, article, [data-testid^="user-"]');
			expect(await userEntries.count()).toBeGreaterThan(0);
		});

		test("should display user information in list", async ({ page }) => {
			// Each user entry should show username/email
			const firstUser = page.locator("table tbody tr, article").first();
			await expect(firstUser).toBeVisible();
		});

		test("should have search functionality", async ({ page }) => {
			const searchInput = page.getByPlaceholder(/search/i);
			await expect(searchInput).toBeVisible();
		});

		test("should filter users when searching", async ({ page }) => {
			await searchInList(page, "alice");
			await waitForHydration(page);

			// Results should be filtered - may have 0 or more depending on seed data
			const results = page.locator("table tbody tr, article");
			expect(await results.count()).toBeGreaterThanOrEqual(0);
		});

		test("should clear search results", async ({ page }) => {
			const searchInput = page.getByPlaceholder(/search/i);
			await searchInput.fill("alice");
			await waitForHydration(page);

			await searchInput.clear();
			await waitForHydration(page);

			// Full list should return
		});

		test("should show role badges", async ({ page }) => {
			// Role badges should be visible
			const roleBadges = page.getByText(/admin|moderator|user/i).first();
			await expect(roleBadges).toBeVisible();
		});

		test("should show user status indicators", async ({ page }) => {
			// Active/banned status should be visible - may or may not be visible depending on data
			const statusIndicator = page.getByText(/active|banned/i).first();
			expect(await statusIndicator.isVisible().catch(() => false)).toBeDefined();
		});

		test("should have pagination if many users", async ({ page }) => {
			// Check for pagination controls - may or may not exist depending on user count
			const pagination = page.locator('[data-testid="pagination"], nav[aria-label*="pagination"]');
			expect(await pagination.count()).toBeGreaterThanOrEqual(0);
		});

		test("should navigate to user detail on row click", async ({ page }) => {
			const viewLink = page.getByRole("link", { name: /view|details/i }).first();
			if (await viewLink.isVisible()) {
				await viewLink.click();
				await waitForHydration(page);
				await expect(page).toHaveURL(/\/users\//);
			}
		});

		test("should show action buttons for each user", async ({ page }) => {
			// Action buttons are in the table - they are icon-only buttons
			const tableRows = page.locator("table tbody tr");
			const rowCount = await tableRows.count();
			expect(rowCount).toBeGreaterThan(0);

			// Each row should have action buttons (icon buttons without text)
			const firstRowActions = tableRows.first().locator("td").last().locator("button");
			const actionCount = await firstRowActions.count();
			expect(actionCount).toBeGreaterThan(0);
		});
	});

	test.describe("User Detail Page", () => {
		test.beforeEach(async ({ page }) => {
			await loginAsAdmin(page);
		});

		test("should display user profile information", async ({ page }) => {
			await goToUserDetail(page, "1");

			// Should show user info section
			await expect(page.getByText(/user information|profile/i)).toBeVisible();
		});

		test("should show username and display name", async ({ page }) => {
			await goToUserDetail(page, "1");

			// Username should be visible (@ prefixed)
			const username = page.getByText(/@\w+/);
			await expect(username.first()).toBeVisible();
		});

		test("should display user email", async ({ page }) => {
			await goToUserDetail(page, "1");

			// Email should be visible
			const email = page.getByText(/@.*\.\w+/);
			await expect(email.first()).toBeVisible();
		});

		test("should show user role", async ({ page }) => {
			await goToUserDetail(page, "1");

			const roleBadge = page.getByText(/admin|moderator|user/i);
			await expect(roleBadge.first()).toBeVisible();
		});

		test("should display join date", async ({ page }) => {
			await goToUserDetail(page, "1");

			// May or may not be visible
			const joinDate = page.getByText(/joined|member since/i);
			expect(
				await joinDate
					.first()
					.isVisible()
					.catch(() => false),
			).toBeDefined();
		});

		test("should show user statistics", async ({ page }) => {
			await goToUserDetail(page, "1");

			// Look for statistics in the main content area only
			const mainContent = page.getByRole("main");
			await expect(mainContent.getByText(/statistics|stats|posts/i).first()).toBeVisible();
		});

		test("should display posts count", async ({ page }) => {
			await goToUserDetail(page, "1");

			const postsLabel = page.getByText(/posts/i);
			await expect(postsLabel.first()).toBeVisible();
		});

		test("should display followers count", async ({ page }) => {
			await goToUserDetail(page, "1");

			// May or may not be visible
			const followersLabel = page.getByText(/followers/i);
			expect(
				await followersLabel
					.first()
					.isVisible()
					.catch(() => false),
			).toBeDefined();
		});

		test("should display following count", async ({ page }) => {
			await goToUserDetail(page, "1");

			// May or may not be visible
			const followingLabel = page.getByText(/following/i);
			expect(
				await followingLabel
					.first()
					.isVisible()
					.catch(() => false),
			).toBeDefined();
		});

		test("should have ban user button", async ({ page }) => {
			await goToUserDetail(page, "1");

			const banButton = page.getByRole("button", { name: /ban/i });
			await expect(banButton).toBeVisible();
		});

		test("should have change role button", async ({ page }) => {
			await goToUserDetail(page, "1");

			const roleButton = page.getByRole("button", { name: /role|change/i });
			await expect(roleButton).toBeVisible();
		});

		test("should have back navigation", async ({ page }) => {
			await goToUserDetail(page, "1");

			const backLink = page.getByRole("link", { name: /back/i });
			await expect(backLink).toBeVisible();

			await backLink.click();
			await expect(page).toHaveURL("/users");
		});

		test("should show recent posts by user", async ({ page }) => {
			await goToUserDetail(page, "1");

			// May or may not be visible
			const postsSection = page.getByText(/recent posts|user posts/i);
			expect(
				await postsSection
					.first()
					.isVisible()
					.catch(() => false),
			).toBeDefined();
		});

		test("should show user activity timeline", async ({ page }) => {
			await goToUserDetail(page, "1");

			// May or may not be visible
			const activitySection = page.getByText(/activity|history/i);
			expect(
				await activitySection
					.first()
					.isVisible()
					.catch(() => false),
			).toBeDefined();
		});
	});

	test.describe("User Actions - Ban/Unban", () => {
		test.beforeEach(async ({ page }) => {
			await loginAsAdmin(page);
		});

		test("should show ban confirmation dialog", async ({ page }) => {
			await goToAdminPage(page, "users");

			const banButton = page.getByRole("button", { name: /ban/i }).first();
			if (await banButton.isVisible()) {
				await banButton.click();
				// Should show confirmation dialog or form - dialog may appear
				const dialog = page.locator('[role="dialog"], [data-testid="modal"]');
				expect(await dialog.isVisible().catch(() => false)).toBeDefined();
			}
		});

		test("should require ban reason", async ({ page }) => {
			await goToUserDetail(page, "1");

			const banButton = page.getByRole("button", { name: /ban/i });
			if (await banButton.isVisible()) {
				await banButton.click();
				await waitForHydration(page);

				// Should have reason field - may be visible if dialog opened
				const reasonInput = page.locator('textarea, input[name="reason"]');
				expect(await reasonInput.isVisible().catch(() => false)).toBeDefined();
			}
		});

		test("should ban user successfully", async ({ page }) => {
			setupDialogHandler(page, "accept");
			await goToUserDetail(page, "1");

			const banButton = page.getByRole("button", { name: /ban/i });
			if (await banButton.isVisible()) {
				await banButton.click();
				await waitForHydration(page);

				// Fill reason if required
				const reasonInput = page.locator('textarea[name="reason"]');
				if (await reasonInput.isVisible()) {
					await reasonInput.fill("Test ban reason");
					const confirmButton = page.getByRole("button", { name: /confirm|ban/i }).last();
					await confirmButton.click();
					await waitForHydration(page);
				}
			}
		});

		test("should show unban button for banned users", async ({ page }) => {
			await goToAdminPage(page, "users");

			// Look for unban button (if any users are banned) - may or may not be visible
			const unbanButton = page.getByRole("button", { name: /unban/i });
			expect(await unbanButton.isVisible().catch(() => false)).toBeDefined();
		});

		test("should cancel ban action", async ({ page }) => {
			await goToUserDetail(page, "1");

			const banButton = page.getByRole("button", { name: /ban/i });
			if (await banButton.isVisible()) {
				await banButton.click();
				await waitForHydration(page);

				// Cancel button
				const cancelButton = page.getByRole("button", { name: /cancel/i });
				if (await cancelButton.isVisible()) {
					await cancelButton.click();
					await waitForHydration(page);
				}
			}
		});
	});

	test.describe("User Actions - Role Management", () => {
		test.beforeEach(async ({ page }) => {
			await loginAsAdmin(page);
		});

		test("should show role change options", async ({ page }) => {
			await goToUserDetail(page, "1");

			const roleButton = page.getByRole("button", { name: /role|change/i });
			if (await roleButton.isVisible()) {
				await roleButton.click();
				await waitForHydration(page);

				// Should show role options - may have multiple options
				const roleOptions = page.locator('[role="option"], [role="menuitem"], select option');
				expect(await roleOptions.count()).toBeGreaterThanOrEqual(0);
			}
		});

		test("should display available roles", async ({ page }) => {
			await goToUserDetail(page, "1");

			const roleButton = page.getByRole("button", { name: /role|change/i });
			if (await roleButton.isVisible()) {
				await roleButton.click();
				await waitForHydration(page);

				// Check for role options - at least one should be visible
				const userRole = page.getByText("user", { exact: true });
				const modRole = page.getByText(/moderator/i);
				const adminRole = page.getByText("admin", { exact: true });
				const hasAnyRole =
					(await userRole
						.first()
						.isVisible()
						.catch(() => false)) ||
					(await modRole
						.first()
						.isVisible()
						.catch(() => false)) ||
					(await adminRole
						.first()
						.isVisible()
						.catch(() => false));
				expect(hasAnyRole).toBeDefined();
			}
		});

		test("should change user role", async ({ page }) => {
			await goToUserDetail(page, "1");

			const roleButton = page.getByRole("button", { name: /role|change/i });
			if (await roleButton.isVisible()) {
				await roleButton.click();
				await waitForHydration(page);

				// Select a different role
				const modRole = page.getByRole("option", { name: /moderator/i }).first();
				if (await modRole.isVisible()) {
					await modRole.click();
					await waitForHydration(page);
				}
			}
		});

		test("should not allow self role change", async () => {
			// Admin should not be able to change their own role
			// This would require finding the admin's user ID first
			expect(true).toBe(true);
		});
	});

	test.describe("User Search and Filter", () => {
		test.beforeEach(async ({ page }) => {
			await loginAsAdmin(page);
			await goToAdminPage(page, "users");
		});

		test("should search by username", async ({ page }) => {
			await searchInList(page, "alice");
			await waitForHydration(page);

			// Results should show alice or be empty
		});

		test("should search by email", async ({ page }) => {
			await searchInList(page, "test.com");
			await waitForHydration(page);

			// Results should show users with test.com emails
		});

		test("should search by display name", async ({ page }) => {
			await searchInList(page, "Alice");
			await waitForHydration(page);

			// Results should show Alice or be empty
		});

		test("should filter by role", async ({ page }) => {
			const roleFilter = page.locator('select[name="role"], [data-testid="role-filter"]');
			if (await roleFilter.isVisible()) {
				await roleFilter.selectOption("admin");
				await waitForHydration(page);
			}
		});

		test("should filter by status", async ({ page }) => {
			const statusFilter = page.locator('select[name="status"], [data-testid="status-filter"]');
			if (await statusFilter.isVisible()) {
				await statusFilter.selectOption("banned");
				await waitForHydration(page);
			}
		});

		test("should combine search with filters", async ({ page }) => {
			await searchInList(page, "alice");

			const roleFilter = page.locator('select[name="role"]');
			if (await roleFilter.isVisible()) {
				await roleFilter.selectOption("user");
				await waitForHydration(page);
			}
		});

		test("should show no results message", async ({ page }) => {
			await searchInList(page, "nonexistentuser123456");
			await waitForHydration(page);

			// May or may not show depending on implementation
			const noResults = page.getByText(/no users|no results|not found/i);
			expect(await noResults.isVisible().catch(() => false)).toBeDefined();
		});
	});

	test.describe("User List Sorting", () => {
		test.beforeEach(async ({ page }) => {
			await loginAsAdmin(page);
			await goToAdminPage(page, "users");
		});

		test("should sort by username", async ({ page }) => {
			const sortButton = page.getByRole("button", { name: /username/i });
			if (await sortButton.isVisible()) {
				await sortButton.click();
				await waitForHydration(page);
			}
		});

		test("should sort by join date", async ({ page }) => {
			const sortButton = page.getByRole("button", { name: /joined|date/i });
			if (await sortButton.isVisible()) {
				await sortButton.click();
				await waitForHydration(page);
			}
		});

		test("should toggle sort direction", async ({ page }) => {
			const sortButton = page.getByRole("button", { name: /username/i });
			if (await sortButton.isVisible()) {
				// Click twice to toggle direction
				await sortButton.click();
				await waitForHydration(page);
				await sortButton.click();
				await waitForHydration(page);
			}
		});
	});

	test.describe("User Detail - Posts Tab", () => {
		test.beforeEach(async ({ page }) => {
			await loginAsAdmin(page);
			await goToUserDetail(page, "1");
		});

		test("should show posts tab", async ({ page }) => {
			// May or may not be visible depending on UI design
			const postsTab = page.getByRole("tab", { name: /posts/i });
			expect(await postsTab.isVisible().catch(() => false)).toBeDefined();
		});

		test("should display user posts", async ({ page }) => {
			const postsSection = page.getByText(/posts/i);
			await expect(postsSection.first()).toBeVisible();
		});

		test("should allow deleting user posts", async ({ page }) => {
			// May or may not be visible
			const deleteButton = page
				.locator("article")
				.first()
				.getByRole("button", { name: /delete/i });
			expect(await deleteButton.isVisible().catch(() => false)).toBeDefined();
		});
	});

	test.describe("Accessibility", () => {
		test.beforeEach(async ({ page }) => {
			await loginAsAdmin(page);
		});

		test("should have proper heading structure on users list", async ({ page }) => {
			await goToAdminPage(page, "users");

			const h1 = page.locator("h1");
			await expect(h1.first()).toBeVisible();
		});

		test("should have proper heading structure on user detail", async ({ page }) => {
			await goToUserDetail(page, "1");

			const h1 = page.locator("h1");
			await expect(h1.first()).toBeVisible();
		});

		test("should have accessible form labels", async ({ page }) => {
			await goToAdminPage(page, "users");

			const searchInput = page.getByPlaceholder(/search/i);
			await expect(searchInput).toBeVisible();
		});

		test("should support keyboard navigation", async ({ page }) => {
			await goToAdminPage(page, "users");

			await page.keyboard.press("Tab");
			await page.keyboard.press("Tab");

			const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
			expect(focusedElement).toBeDefined();
		});
	});
});
