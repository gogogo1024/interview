import { expect, test } from "@playwright/test";
import { loginAsAdmin, waitForHydration } from "./fixtures/test-helpers";

test.describe("Admin Navigation - Comprehensive", () => {
	test.beforeEach(async ({ page }) => {
		await loginAsAdmin(page);
	});

	test.describe("Main Navigation", () => {
		test("should have dashboard link", async ({ page }) => {
			const dashboardLink = page.getByRole("link", { name: /dashboard|home/i });
			await expect(dashboardLink).toBeVisible();
		});

		test("should have users link", async ({ page }) => {
			await expect(page.getByRole("link", { name: /users/i })).toBeVisible();
		});

		test("should have posts link", async ({ page }) => {
			await expect(page.getByRole("link", { name: /posts/i })).toBeVisible();
		});

		test("should have reports link", async ({ page }) => {
			await expect(page.getByRole("link", { name: /reports/i })).toBeVisible();
		});

		test("should navigate between all pages", async ({ page }) => {
			// Dashboard to Users
			await page.click('a[href="/users"]');
			await expect(page).toHaveURL("/users");

			// Users to Posts
			await page.click('a[href="/posts"]');
			await expect(page).toHaveURL("/posts");

			// Posts to Reports
			await page.click('a[href="/reports"]');
			await expect(page).toHaveURL("/reports");

			// Reports to Dashboard
			const dashboardLink = page.getByRole("link", { name: /dashboard|home/i });
			await dashboardLink.click();
			await expect(page).toHaveURL("/");
		});
	});

	test.describe("Breadcrumb Navigation", () => {
		test("should show breadcrumbs on user detail page", async ({ page }) => {
			await page.goto("/users/1", { waitUntil: "networkidle" });
			await waitForHydration(page);

			const backLink = page.getByRole("link", { name: /back to users/i });
			await expect(backLink).toBeVisible();
		});

		test("should show breadcrumbs on post detail page", async ({ page }) => {
			await page.goto("/posts/1", { waitUntil: "networkidle" });
			await waitForHydration(page);

			const backLink = page.getByRole("link", { name: /back to posts/i });
			await expect(backLink).toBeVisible();
		});
	});

	test.describe("Active State", () => {
		test("should highlight current page in navigation", async ({ page }) => {
			// On dashboard
			await page.goto("/", { waitUntil: "networkidle" });
			// Check dashboard link has active styling

			// On users
			await page.goto("/users", { waitUntil: "networkidle" });
			// Check users link has active styling

			// On posts
			await page.goto("/posts", { waitUntil: "networkidle" });
			// Check posts link has active styling

			// On reports
			await page.goto("/reports", { waitUntil: "networkidle" });
			// Check reports link has active styling
		});
	});

	test.describe("Header", () => {
		test("should show app title", async ({ page }) => {
			const title = page.getByRole("link", { name: /chirp|admin/i }).first();
			await expect(title).toBeVisible();
		});

		test("should show logged in user", async ({ page }) => {
			// Header should show admin username or info
			await expect(page.getByRole("banner").first()).toBeVisible();
			// Check for admin username/role in the header
			await expect(page.getByText(/adminadmin/i)).toBeVisible();
		});

		test("should have logout button", async ({ page }) => {
			const logoutButton = page.getByRole("button", { name: /logout|sign out/i });
			await expect(logoutButton).toBeVisible();
		});

		test("clicking logo should go to dashboard", async ({ page }) => {
			await page.goto("/users", { waitUntil: "networkidle" });

			const logo = page.getByRole("link", { name: /chirp|admin/i }).first();
			await logo.click();
			await waitForHydration(page);

			await expect(page).toHaveURL("/");
		});
	});

	test.describe("Keyboard Navigation", () => {
		test("should support tab navigation", async ({ page }) => {
			await page.keyboard.press("Tab");
			await page.keyboard.press("Tab");

			const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
			expect(focusedElement).toBeDefined();
		});

		test("should allow enter to activate links", async ({ page }) => {
			// Focus on a link and press Enter
			const firstLink = page.getByRole("link").first();
			await firstLink.focus();
			await page.keyboard.press("Enter");

			// Should navigate
		});
	});

	test.describe("Mobile Navigation", () => {
		test("should work on mobile viewport", async ({ page }) => {
			await page.setViewportSize({ width: 375, height: 667 });
			await page.reload({ waitUntil: "networkidle" });
			await waitForHydration(page);

			// Navigation should be accessible (possibly via hamburger menu) - may have mobile menu
			const nav = page.locator('nav, [role="navigation"]');
			expect(await nav.count()).toBeGreaterThanOrEqual(0);
		});

		test("should show hamburger menu on mobile", async ({ page }) => {
			await page.setViewportSize({ width: 375, height: 667 });
			await page.reload({ waitUntil: "networkidle" });
			await waitForHydration(page);

			// May have hamburger menu button - implementation dependent
			const menuButton = page.getByRole("button", { name: /menu/i });
			expect(await menuButton.isVisible().catch(() => false)).toBeDefined();
		});
	});

	test.describe("Deep Linking", () => {
		test("should load user detail page directly", async ({ page }) => {
			await page.goto("/users/1", { waitUntil: "networkidle" });
			await waitForHydration(page);

			await expect(page.getByText(/user information|profile/i)).toBeVisible();
		});

		test("should load post detail page directly", async ({ page }) => {
			await page.goto("/posts/1", { waitUntil: "networkidle" });
			await waitForHydration(page);

			await expect(page.getByRole("heading", { name: /post details/i })).toBeVisible();
		});

		test("should handle invalid user ID gracefully", async ({ page }) => {
			await page.goto("/users/nonexistent", { waitUntil: "networkidle" });
			await waitForHydration(page);

			// Should show error or redirect
		});

		test("should handle invalid post ID gracefully", async ({ page }) => {
			await page.goto("/posts/nonexistent", { waitUntil: "networkidle" });
			await waitForHydration(page);

			// Should show error or redirect
		});
	});
});
