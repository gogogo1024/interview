import { expect, test } from "@playwright/test";
import { loginAsAdmin, waitForHydration } from "./fixtures/test-helpers";

test.describe("Reports Management", () => {
	test.beforeEach(async ({ page }) => {
		await loginAsAdmin(page);
		await page.goto("/reports", { waitUntil: "networkidle" });
		await waitForHydration(page);
	});

	test("should display reports page", async ({ page }) => {
		// Reports page heading
		await expect(page.getByRole("heading", { name: /reports/i })).toBeVisible();
	});

	test("should have status filter tabs", async ({ page }) => {
		// Filter tabs should be present
		await expect(page.getByRole("button", { name: /pending/i })).toBeVisible();
		await expect(page.getByRole("button", { name: /resolved/i })).toBeVisible();
		await expect(page.getByRole("button", { name: /dismissed/i })).toBeVisible();
	});

	test("should display report cards", async ({ page }) => {
		// Report entries should be visible
		const reportCards = page.locator("article").first();
		await expect(reportCards).toBeVisible();
	});

	test("should show report reason", async ({ page }) => {
		// Report reason should be displayed
		await expect(page.getByText(/reason/i).first()).toBeVisible();
	});

	test("should have action buttons for pending reports", async ({ page }) => {
		// Action buttons for pending reports
		const dismissButton = page.getByRole("button", { name: /dismiss/i }).first();
		const actionButton = page.getByRole("button", { name: /take action|resolve/i }).first();

		// At least one action should be visible for pending reports
		const hasActions = (await dismissButton.isVisible()) || (await actionButton.isVisible());
		expect(hasActions).toBeTruthy();
	});

	test("should show report target type badge", async ({ page }) => {
		// Target type badges (post, comment, user) should be visible
		const postBadge = page.getByText("post", { exact: true }).first();
		const commentBadge = page.getByText("comment", { exact: true }).first();
		const userBadge = page.getByText("user", { exact: true }).first();

		// At least one target type should be visible
		const hasTargetType =
			(await postBadge.isVisible()) ||
			(await commentBadge.isVisible()) ||
			(await userBadge.isVisible());
		expect(hasTargetType).toBeTruthy();
	});

	test("should have view target link", async ({ page }) => {
		// Link to view the reported content
		const viewLink = page.getByRole("link", { name: /view/i }).first();
		await expect(viewLink).toBeVisible();
	});
});
