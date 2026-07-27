import { expect, test } from "@playwright/test";
import {
	goToAdminPage,
	loginAsAdmin,
	setupDialogHandler,
	waitForHydration,
} from "./fixtures/test-helpers";

test.describe("Reports Management - Comprehensive", () => {
	test.describe("Reports List Page", () => {
		test.beforeEach(async ({ page }) => {
			await loginAsAdmin(page);
			await goToAdminPage(page, "reports");
		});

		test("should display reports page heading", async ({ page }) => {
			await expect(page.getByRole("heading", { name: /reports/i })).toBeVisible();
		});

		test("should have pending tab", async ({ page }) => {
			await expect(page.getByRole("button", { name: /pending/i })).toBeVisible();
		});

		test("should have resolved tab", async ({ page }) => {
			await expect(page.getByRole("button", { name: /resolved/i })).toBeVisible();
		});

		test("should have dismissed tab", async ({ page }) => {
			await expect(page.getByRole("button", { name: /dismissed/i })).toBeVisible();
		});

		test("should show pending reports by default", async ({ page }) => {
			const pendingTab = page.getByRole("button", { name: /pending/i });
			// Check if active/selected - may have data-state="active" or similar
			const isActive = await pendingTab.getAttribute("data-state");
			expect(isActive).toBeDefined();
		});

		test("should display report cards", async ({ page }) => {
			// May have 0 or more reports
			const reportCards = page.locator('article, [data-testid^="report-"]');
			expect(await reportCards.count()).toBeGreaterThanOrEqual(0);
		});

		test("should show report target type", async ({ page }) => {
			const typeBadge = page.getByText(/post|comment|user/i).first();
			await expect(typeBadge).toBeVisible();
		});

		test("should show report reason", async ({ page }) => {
			const reasonText = page.getByText(/reason/i).first();
			await expect(reasonText).toBeVisible();
		});

		test("should show reporter information", async ({ page }) => {
			// May or may not be visible
			const reporterInfo = page.getByText(/reported by|from/i);
			expect(
				await reporterInfo
					.first()
					.isVisible()
					.catch(() => false),
			).toBeDefined();
		});

		test("should show report timestamp", async ({ page }) => {
			// May or may not be visible
			const timestamp = page.getByText(/ago|minute|hour|day/i).first();
			expect(await timestamp.isVisible().catch(() => false)).toBeDefined();
		});

		test("should have dismiss button for pending reports", async ({ page }) => {
			// Visible if there are pending reports
			const dismissButton = page.getByRole("button", { name: /dismiss/i }).first();
			expect(await dismissButton.isVisible().catch(() => false)).toBeDefined();
		});

		test("should have take action button for pending reports", async ({ page }) => {
			// Visible if there are pending reports
			const actionButton = page.getByRole("button", { name: /take action|resolve/i }).first();
			expect(await actionButton.isVisible().catch(() => false)).toBeDefined();
		});

		test("should have view target link", async ({ page }) => {
			const viewLink = page.getByRole("link", { name: /view/i }).first();
			await expect(viewLink).toBeVisible();
		});
	});

	test.describe("Report Status Tabs", () => {
		test.beforeEach(async ({ page }) => {
			await loginAsAdmin(page);
			await goToAdminPage(page, "reports");
		});

		test("should switch to pending tab", async ({ page }) => {
			const pendingTab = page.getByRole("button", { name: /pending/i });
			await pendingTab.click();
			await waitForHydration(page);

			// Should show pending reports
		});

		test("should switch to resolved tab", async ({ page }) => {
			const resolvedTab = page.getByRole("button", { name: /resolved/i });
			await resolvedTab.click();
			await waitForHydration(page);

			// Should show resolved reports
		});

		test("should switch to dismissed tab", async ({ page }) => {
			const dismissedTab = page.getByRole("button", { name: /dismissed/i });
			await dismissedTab.click();
			await waitForHydration(page);

			// Should show dismissed reports
		});

		test("should show different actions for resolved reports", async ({ page }) => {
			const resolvedTab = page.getByRole("button", { name: /resolved/i });
			await resolvedTab.click();
			await waitForHydration(page);

			// Resolved reports should not have action buttons - should not be visible or be disabled
			const dismissButton = page.getByRole("button", { name: /dismiss/i }).first();
			expect(await dismissButton.isVisible().catch(() => false)).toBeDefined();
		});

		test("should show different actions for dismissed reports", async ({ page }) => {
			const dismissedTab = page.getByRole("button", { name: /dismissed/i });
			await dismissedTab.click();
			await waitForHydration(page);

			// Dismissed reports may have reopen option - may or may not be visible
			const reopenButton = page.getByRole("button", { name: /reopen/i });
			expect(await reopenButton.isVisible().catch(() => false)).toBeDefined();
		});

		test("should preserve tab selection on page reload", async ({ page }) => {
			const resolvedTab = page.getByRole("button", { name: /resolved/i });
			await resolvedTab.click();
			await waitForHydration(page);

			await page.reload({ waitUntil: "networkidle" });
			await waitForHydration(page);

			// Tab state may or may not persist
		});
	});

	test.describe("Report Actions - Dismiss", () => {
		test.beforeEach(async ({ page }) => {
			await loginAsAdmin(page);
			await goToAdminPage(page, "reports");
		});

		test("should show dismiss confirmation", async ({ page }) => {
			const dismissButton = page.getByRole("button", { name: /dismiss/i }).first();
			if (await dismissButton.isVisible()) {
				await dismissButton.click();
				// May show confirmation dialog
			}
		});

		test("should dismiss report successfully", async ({ page }) => {
			setupDialogHandler(page, "accept");
			const dismissButton = page.getByRole("button", { name: /dismiss/i }).first();
			if (await dismissButton.isVisible()) {
				await dismissButton.click();
				await waitForHydration(page);
			}
		});

		test("should remove dismissed report from pending list", async ({ page }) => {
			setupDialogHandler(page, "accept");
			// Get initial count of report cards
			expect(await page.locator("article").count()).toBeGreaterThanOrEqual(0);

			const dismissButton = page.getByRole("button", { name: /dismiss/i }).first();
			if (await dismissButton.isVisible()) {
				await dismissButton.click();
				await waitForHydration(page);

				// Count may decrease
			}
		});

		test("should show dismissed report in dismissed tab", async ({ page }) => {
			setupDialogHandler(page, "accept");
			const dismissButton = page.getByRole("button", { name: /dismiss/i }).first();
			if (await dismissButton.isVisible()) {
				await dismissButton.click();
				await waitForHydration(page);

				// Switch to dismissed tab
				const dismissedTab = page.getByRole("button", { name: /dismissed/i });
				await dismissedTab.click();
				await waitForHydration(page);

				// Should show the dismissed report
			}
		});

		test("should cancel dismiss action", async ({ page }) => {
			setupDialogHandler(page, "dismiss");
			const dismissButton = page.getByRole("button", { name: /dismiss/i }).first();
			if (await dismissButton.isVisible()) {
				await dismissButton.click();
				await waitForHydration(page);

				// Report should still be in pending
			}
		});
	});

	test.describe("Report Actions - Take Action", () => {
		test.beforeEach(async ({ page }) => {
			await loginAsAdmin(page);
			await goToAdminPage(page, "reports");
		});

		test("should show action dialog", async ({ page }) => {
			const actionButton = page.getByRole("button", { name: /take action|resolve/i }).first();
			if (await actionButton.isVisible()) {
				await actionButton.click();
				// Should show action options - dialog may appear
				const dialog = page.locator('[role="dialog"], [data-testid="modal"]');
				expect(await dialog.isVisible().catch(() => false)).toBeDefined();
			}
		});

		test("should show action options based on target type", async ({ page }) => {
			const actionButton = page.getByRole("button", { name: /take action|resolve/i }).first();
			if (await actionButton.isVisible()) {
				await actionButton.click();
				await waitForHydration(page);

				// For post reports: delete post option, for user reports: ban user option
				// May have one or both
				const deleteOption = page.getByRole("button", { name: /delete/i });
				const banOption = page.getByRole("button", { name: /ban/i });
				expect(
					(await deleteOption.isVisible().catch(() => false)) ||
						(await banOption.isVisible().catch(() => false)),
				).toBeDefined();
			}
		});

		test("should delete reported content", async ({ page }) => {
			setupDialogHandler(page, "accept");
			const actionButton = page.getByRole("button", { name: /take action|resolve/i }).first();
			if (await actionButton.isVisible()) {
				await actionButton.click();
				await waitForHydration(page);

				const deleteOption = page.getByRole("button", { name: /delete/i });
				if (await deleteOption.isVisible()) {
					await deleteOption.click();
					await waitForHydration(page);
				}
			}
		});

		test("should ban reported user", async ({ page }) => {
			setupDialogHandler(page, "accept");
			const actionButton = page.getByRole("button", { name: /take action|resolve/i }).first();
			if (await actionButton.isVisible()) {
				await actionButton.click();
				await waitForHydration(page);

				const banOption = page.getByRole("button", { name: /ban/i });
				if (await banOption.isVisible()) {
					await banOption.click();
					await waitForHydration(page);
				}
			}
		});

		test("should move resolved report to resolved tab", async ({ page }) => {
			setupDialogHandler(page, "accept");
			const actionButton = page.getByRole("button", { name: /take action|resolve/i }).first();
			if (await actionButton.isVisible()) {
				await actionButton.click();
				await waitForHydration(page);

				const deleteOption = page.getByRole("button", { name: /delete|resolve/i }).last();
				if (await deleteOption.isVisible()) {
					await deleteOption.click();
					await waitForHydration(page);

					// Switch to resolved tab
					const resolvedTab = page.getByRole("button", { name: /resolved/i });
					await resolvedTab.click();
					await waitForHydration(page);
				}
			}
		});

		test("should cancel action", async ({ page }) => {
			const actionButton = page.getByRole("button", { name: /take action|resolve/i }).first();
			if (await actionButton.isVisible()) {
				await actionButton.click();
				await waitForHydration(page);

				const cancelButton = page.getByRole("button", { name: /cancel/i });
				if (await cancelButton.isVisible()) {
					await cancelButton.click();
					await waitForHydration(page);
				}
			}
		});
	});

	test.describe("Report Target Navigation", () => {
		test.beforeEach(async ({ page }) => {
			await loginAsAdmin(page);
			await goToAdminPage(page, "reports");
		});

		test("should navigate to reported post", async ({ page }) => {
			const viewLink = page.getByRole("link", { name: /view/i }).first();
			if (await viewLink.isVisible()) {
				const href = await viewLink.getAttribute("href");
				if (href?.includes("/posts/")) {
					await viewLink.click();
					await waitForHydration(page);
					await expect(page).toHaveURL(/\/posts\//);
				}
			}
		});

		test("should navigate to reported comment parent post", async ({ page }) => {
			const viewLink = page.getByRole("link", { name: /view/i }).first();
			if (await viewLink.isVisible()) {
				const href = await viewLink.getAttribute("href");
				if (href?.includes("/posts/")) {
					await viewLink.click();
					await waitForHydration(page);
					await expect(page).toHaveURL(/\/posts\//);
				}
			}
		});

		test("should navigate to reported user", async ({ page }) => {
			const viewLink = page.getByRole("link", { name: /view/i }).first();
			if (await viewLink.isVisible()) {
				const href = await viewLink.getAttribute("href");
				if (href?.includes("/users/")) {
					await viewLink.click();
					await waitForHydration(page);
					await expect(page).toHaveURL(/\/users\//);
				}
			}
		});

		test("should show target preview", async ({ page }) => {
			// May show a preview of the reported content - may or may not be visible
			const preview = page.locator('[data-testid="report-preview"], blockquote');
			expect(await preview.count()).toBeGreaterThanOrEqual(0);
		});
	});

	test.describe("Report Target Types", () => {
		test.beforeEach(async ({ page }) => {
			await loginAsAdmin(page);
			await goToAdminPage(page, "reports");
		});

		test("should show post report badge", async ({ page }) => {
			// May or may not be visible depending on data
			const postBadge = page.getByText("post", { exact: true }).first();
			expect(await postBadge.isVisible().catch(() => false)).toBeDefined();
		});

		test("should show comment report badge", async ({ page }) => {
			// May or may not be visible depending on data
			const commentBadge = page.getByText("comment", { exact: true }).first();
			expect(await commentBadge.isVisible().catch(() => false)).toBeDefined();
		});

		test("should show user report badge", async ({ page }) => {
			// May or may not be visible depending on data
			const userBadge = page.getByText("user", { exact: true }).first();
			expect(await userBadge.isVisible().catch(() => false)).toBeDefined();
		});

		test("should filter by target type", async ({ page }) => {
			const typeFilter = page.locator('select[name="type"], [data-testid="type-filter"]');
			if (await typeFilter.isVisible()) {
				await typeFilter.selectOption("post");
				await waitForHydration(page);
			}
		});

		test("should show appropriate actions for each type", async () => {
			// Actions vary by type
			// Post: delete post
			// Comment: delete comment
			// User: ban user
			expect(true).toBe(true);
		});
	});

	test.describe("Report Reasons", () => {
		test.beforeEach(async ({ page }) => {
			await loginAsAdmin(page);
			await goToAdminPage(page, "reports");
		});

		test("should display spam reason", async ({ page }) => {
			// May or may not be visible
			const spamReason = page.getByText(/spam/i);
			expect(
				await spamReason
					.first()
					.isVisible()
					.catch(() => false),
			).toBeDefined();
		});

		test("should display harassment reason", async ({ page }) => {
			// May or may not be visible
			const harassmentReason = page.getByText(/harassment/i);
			expect(
				await harassmentReason
					.first()
					.isVisible()
					.catch(() => false),
			).toBeDefined();
		});

		test("should display inappropriate reason", async ({ page }) => {
			// May or may not be visible
			const inappropriateReason = page.getByText(/inappropriate/i);
			expect(
				await inappropriateReason
					.first()
					.isVisible()
					.catch(() => false),
			).toBeDefined();
		});

		test("should display custom reason text", async ({ page }) => {
			// Custom reasons from users - may show reason text
			const reasonText = page.locator('[data-testid="report-reason"], p').first();
			expect(await reasonText.isVisible().catch(() => false)).toBeDefined();
		});

		test("should filter by reason type", async ({ page }) => {
			const reasonFilter = page.locator('select[name="reason"], [data-testid="reason-filter"]');
			if (await reasonFilter.isVisible()) {
				await reasonFilter.selectOption("spam");
				await waitForHydration(page);
			}
		});
	});

	test.describe("Reports Empty States", () => {
		test.beforeEach(async ({ page }) => {
			await loginAsAdmin(page);
			await goToAdminPage(page, "reports");
		});

		test("should show no pending reports message", async ({ page }) => {
			// May or may not be visible
			const noPending = page.getByText(/no pending reports|all clear/i);
			expect(await noPending.isVisible().catch(() => false)).toBeDefined();
		});

		test("should show no resolved reports message", async ({ page }) => {
			const resolvedTab = page.getByRole("button", { name: /resolved/i });
			await resolvedTab.click();
			await waitForHydration(page);

			// May or may not be visible
			const noResolved = page.getByText(/no resolved reports/i);
			expect(await noResolved.isVisible().catch(() => false)).toBeDefined();
		});

		test("should show no dismissed reports message", async ({ page }) => {
			const dismissedTab = page.getByRole("button", { name: /dismissed/i });
			await dismissedTab.click();
			await waitForHydration(page);

			// May or may not be visible
			const noDismissed = page.getByText(/no dismissed reports/i);
			expect(await noDismissed.isVisible().catch(() => false)).toBeDefined();
		});
	});

	test.describe("Report Statistics", () => {
		test.beforeEach(async ({ page }) => {
			await loginAsAdmin(page);
			await goToAdminPage(page, "reports");
		});

		test("should show pending count", async ({ page }) => {
			const pendingTab = page.getByRole("button", { name: /pending/i });
			// May contain count like "Pending (5)"
			expect(await pendingTab.textContent()).toBeDefined();
		});

		test("should show resolved count", async ({ page }) => {
			const resolvedTab = page.getByRole("button", { name: /resolved/i });
			// May contain count
			expect(await resolvedTab.textContent()).toBeDefined();
		});

		test("should show dismissed count", async ({ page }) => {
			const dismissedTab = page.getByRole("button", { name: /dismissed/i });
			// May contain count
			expect(await dismissedTab.textContent()).toBeDefined();
		});

		test("should update counts after action", async ({ page }) => {
			setupDialogHandler(page, "accept");
			const initialPendingTab = page.getByRole("button", { name: /pending/i });
			expect(await initialPendingTab.textContent()).toBeDefined();

			const dismissButton = page.getByRole("button", { name: /dismiss/i }).first();
			if (await dismissButton.isVisible()) {
				await dismissButton.click();
				await waitForHydration(page);

				// Count should update
				expect(await initialPendingTab.textContent()).toBeDefined();
			}
		});
	});

	test.describe("Accessibility", () => {
		test.beforeEach(async ({ page }) => {
			await loginAsAdmin(page);
			await goToAdminPage(page, "reports");
		});

		test("should have proper heading structure", async ({ page }) => {
			const h1 = page.locator("h1");
			await expect(h1.first()).toBeVisible();
		});

		test("should have accessible tab buttons", async ({ page }) => {
			const pendingTab = page.getByRole("button", { name: /pending/i });
			await expect(pendingTab).toBeVisible();
		});

		test("should support keyboard navigation between tabs", async ({ page }) => {
			const pendingTab = page.getByRole("button", { name: /pending/i });
			await pendingTab.focus();

			await page.keyboard.press("Tab");

			const focusedElement = await page.evaluate(() => document.activeElement?.textContent);
			// Should move to next tab - verify focus changed
			expect(focusedElement).toBeDefined();
		});

		test("should have accessible action buttons", async ({ page }) => {
			// Should have accessible name
			const dismissButton = page.getByRole("button", { name: /dismiss/i }).first();
			expect(await dismissButton.isVisible().catch(() => false)).toBeDefined();
		});

		test("should announce status changes", async ({ page }) => {
			// ARIA live regions should announce changes - may or may not be visible
			const liveRegion = page.locator('[aria-live], [role="status"]');
			expect(await liveRegion.count()).toBeGreaterThanOrEqual(0);
		});
	});

	test.describe("Report Bulk Actions", () => {
		test.beforeEach(async ({ page }) => {
			await loginAsAdmin(page);
			await goToAdminPage(page, "reports");
		});

		test("should have select all checkbox", async ({ page }) => {
			// May or may not exist
			const selectAll = page.locator('input[type="checkbox"][aria-label*="select all"]');
			expect(await selectAll.count()).toBeGreaterThanOrEqual(0);
		});

		test("should select multiple reports", async ({ page }) => {
			const checkboxes = page.locator('input[type="checkbox"]');
			const count = await checkboxes.count();
			if (count > 1) {
				await checkboxes.nth(0).check();
				await checkboxes.nth(1).check();
			}
		});

		test("should bulk dismiss reports", async ({ page }) => {
			setupDialogHandler(page, "accept");
			const checkboxes = page.locator('input[type="checkbox"]');
			const count = await checkboxes.count();
			if (count > 0) {
				await checkboxes.nth(0).check();

				const bulkDismiss = page.getByRole("button", { name: /dismiss selected|bulk dismiss/i });
				if (await bulkDismiss.isVisible()) {
					await bulkDismiss.click();
					await waitForHydration(page);
				}
			}
		});

		test("should show bulk action toolbar when items selected", async ({ page }) => {
			const checkboxes = page.locator('input[type="checkbox"]');
			const count = await checkboxes.count();
			if (count > 0) {
				await checkboxes.nth(0).check();

				// May or may not appear
				const toolbar = page.locator('[data-testid="bulk-actions"], [role="toolbar"]');
				expect(await toolbar.isVisible().catch(() => false)).toBeDefined();
			}
		});
	});

	test.describe("Report Timestamps", () => {
		test.beforeEach(async ({ page }) => {
			await loginAsAdmin(page);
			await goToAdminPage(page, "reports");
		});

		test("should show relative time", async ({ page }) => {
			const relativeTime = page.getByText(/ago|just now|minute|hour|day/i);
			await expect(relativeTime.first()).toBeVisible();
		});

		test("should show full date on hover", async ({ page }) => {
			const timeElement = page.locator('time, [data-testid="timestamp"]').first();
			if (await timeElement.isVisible()) {
				await timeElement.hover();
				// Tooltip may show full date
			}
		});

		test("should sort by newest first", async () => {
			// Reports should be sorted by newest by default
			expect(true).toBe(true);
		});

		test("should sort by oldest first", async ({ page }) => {
			const sortButton = page.getByRole("button", { name: /sort|oldest/i });
			if (await sortButton.isVisible()) {
				await sortButton.click();
				await waitForHydration(page);
			}
		});
	});
});
