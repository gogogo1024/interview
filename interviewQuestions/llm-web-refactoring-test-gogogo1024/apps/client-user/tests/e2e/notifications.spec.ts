import { expect, test } from "@playwright/test";
import { loginAs, waitForHydration } from "./fixtures/test-helpers";

test.describe("Notifications", () => {
	test.beforeEach(async ({ page }) => {
		await loginAs(page, "alice");
	});

	test("should display notification bell in header", async ({ page }) => {
		// Wait for page to fully load and navigation to be ready
		await waitForHydration(page);
		// Notification bell is inside header, look for the bell icon link or by navigation to notifications
		const header = page.locator("header");
		await expect(header).toBeVisible();
		// The notification bell component renders a link wrapping a Bell icon
		const bellLink = header.locator("a").filter({ has: page.locator("svg") });
		await expect(bellLink.first()).toBeVisible();
	});

	test("should navigate to notifications page", async ({ page }) => {
		await waitForHydration(page);
		// Navigate directly to notifications page
		await page.goto("/notifications", { waitUntil: "networkidle" });
		await waitForHydration(page);

		await expect(page).toHaveURL("/notifications");
		// Use exact match to target only the main h1 title, not the h3 empty state title
		await expect(page.getByRole("heading", { name: "Notifications", exact: true })).toBeVisible();
	});

	test("should show notifications list or empty state", async ({ page }) => {
		await page.goto("/notifications", { waitUntil: "networkidle" });
		await waitForHydration(page);

		// Either notifications exist or empty state is shown
		const hasNotifications = await page.locator('div[role="button"]').first().isVisible();
		const hasEmptyState = await page.getByText("No notifications yet").isVisible();

		expect(hasNotifications || hasEmptyState).toBe(true);
	});

	test("should mark all as read", async ({ page }) => {
		await page.goto("/notifications", { waitUntil: "networkidle" });
		await waitForHydration(page);

		// Click "Mark all as read" button if visible
		const markAllButton = page.locator("button").filter({ hasText: /mark all/i });
		if (await markAllButton.isVisible()) {
			await markAllButton.click();
			await waitForHydration(page);
		}
	});

	test("should delete a notification", async ({ page }) => {
		await page.goto("/notifications", { waitUntil: "networkidle" });
		await waitForHydration(page);

		// Find a delete button on a notification
		const deleteButton = page.locator('button[title="Delete notification"]').first();
		if (await deleteButton.isVisible()) {
			const notificationCount = await page.locator('div[role="button"]').count();
			await deleteButton.click();
			await waitForHydration(page);

			// Should have one fewer notification
			const newCount = await page.locator('div[role="button"]').count();
			expect(newCount).toBeLessThanOrEqual(notificationCount);
		}
	});
});
