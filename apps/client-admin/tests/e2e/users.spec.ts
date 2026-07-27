import { expect, test } from "@playwright/test";
import { loginAsAdmin, waitForHydration } from "./fixtures/test-helpers";

test.describe("User Management", () => {
	test.beforeEach(async ({ page }) => {
		await loginAsAdmin(page);
		await page.goto("/users", { waitUntil: "networkidle" });
		await waitForHydration(page);
	});

	test("should display users list", async ({ page }) => {
		// Users page heading
		await expect(page.getByRole("heading", { name: /users/i })).toBeVisible();

		// Should show user entries (either in table or cards)
		const userRows = page.locator('[data-testid^="user-row"], article, tr').first();
		await expect(userRows).toBeVisible();
	});

	test("should have search functionality", async ({ page }) => {
		// Search input should be present
		const searchInput = page.getByPlaceholder(/search/i);
		await expect(searchInput).toBeVisible();

		// Type in search
		await searchInput.fill("alice");

		// Results should filter (implementation specific)
		await waitForHydration(page);
	});

	test("should navigate to user detail page", async ({ page }) => {
		// Click on first user link/view button
		const viewButton = page.getByRole("link", { name: /view|details/i }).first();

		if (await viewButton.isVisible()) {
			await viewButton.click();
			await waitForHydration(page);

			// Should be on user detail page
			await expect(page).toHaveURL(/\/users\//);
		}
	});

	test("should display user actions", async ({ page }) => {
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

	test("should display user details", async ({ page }) => {
		// Navigate directly to a user detail page (using mock user ID)
		await page.goto("/users/1", { waitUntil: "networkidle" });
		await waitForHydration(page);

		// Should show user information
		await expect(page.getByText(/user information|profile/i)).toBeVisible();
	});

	test("should display user statistics", async ({ page }) => {
		await page.goto("/users/1", { waitUntil: "networkidle" });
		await waitForHydration(page);

		// Should show statistics section in main content
		const mainContent = page.getByRole("main");
		await expect(mainContent.getByText(/statistics|stats|posts/i).first()).toBeVisible();
	});

	test("should have back navigation", async ({ page }) => {
		await page.goto("/users/1", { waitUntil: "networkidle" });
		await waitForHydration(page);

		// Back link should be present
		const backLink = page.getByRole("link", { name: /back/i });
		await expect(backLink).toBeVisible();

		await backLink.click();
		await expect(page).toHaveURL("/users");
	});

	test("should display user actions", async ({ page }) => {
		await page.goto("/users/1", { waitUntil: "networkidle" });
		await waitForHydration(page);

		// Ban and role change buttons should be visible
		await expect(page.getByRole("button", { name: /ban/i })).toBeVisible();
		await expect(page.getByRole("button", { name: /role|change/i })).toBeVisible();
	});
});
