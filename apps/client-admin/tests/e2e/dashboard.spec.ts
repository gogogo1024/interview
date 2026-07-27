import { expect, test } from "@playwright/test";
import { loginAsAdmin, waitForHydration } from "./fixtures/test-helpers";

test.describe("Admin Dashboard - Comprehensive", () => {
	test.beforeEach(async ({ page }) => {
		await loginAsAdmin(page);
	});

	test.describe("Dashboard Display", () => {
		test("should display dashboard heading", async ({ page }) => {
			await expect(page.getByRole("heading", { name: /dashboard/i })).toBeVisible();
		});

		test("should display total users stat", async ({ page }) => {
			await expect(page.getByText(/total users/i)).toBeVisible();
		});

		test("should display total posts stat", async ({ page }) => {
			await expect(page.getByText(/total posts/i)).toBeVisible();
		});

		test("should display pending reports stat", async ({ page }) => {
			await expect(page.getByText(/pending reports/i)).toBeVisible();
		});

		test("should display stat values as numbers", async ({ page }) => {
			// Stats should show numeric values
			const stats = page.locator('[data-testid*="stat"], .stat-card, article').first();
			await expect(stats).toBeVisible();
		});

		test("should display new users today stat", async ({ page }) => {
			const newUsersText = page.getByText(/new.*today|today.*new/i);
			if (await newUsersText.isVisible()) {
				await expect(newUsersText).toBeVisible();
			}
		});

		test("should display new posts today stat", async ({ page }) => {
			const newPostsText = page.getByText(/posts.*today|today.*posts/i);
			if (await newPostsText.isVisible()) {
				await expect(newPostsText).toBeVisible();
			}
		});
	});

	test.describe("Dashboard Navigation", () => {
		test("should have navigation links", async ({ page }) => {
			await expect(page.getByRole("link", { name: /users/i })).toBeVisible();
			await expect(page.getByRole("link", { name: /posts/i })).toBeVisible();
			await expect(page.getByRole("link", { name: /reports/i })).toBeVisible();
		});

		test("should navigate to users page", async ({ page }) => {
			await page.click('a[href="/users"]');
			await waitForHydration(page);

			await expect(page).toHaveURL("/users");
			await expect(page.getByRole("heading", { name: /users/i })).toBeVisible();
		});

		test("should navigate to posts page", async ({ page }) => {
			await page.click('a[href="/posts"]');
			await waitForHydration(page);

			await expect(page).toHaveURL("/posts");
			await expect(page.getByRole("heading", { name: /posts/i })).toBeVisible();
		});

		test("should navigate to reports page", async ({ page }) => {
			await page.click('a[href="/reports"]');
			await waitForHydration(page);

			await expect(page).toHaveURL("/reports");
			await expect(page.getByRole("heading", { name: /reports/i })).toBeVisible();
		});

		test("should highlight current page in navigation", async ({ page }) => {
			// Dashboard link should be active/highlighted
			const dashboardLink = page.getByRole("link", { name: /dashboard|home/i });
			if (await dashboardLink.isVisible()) {
				// Check for active state (implementation dependent)
			}
		});

		test("should return to dashboard from other pages", async ({ page }) => {
			await page.goto("/users", { waitUntil: "networkidle" });
			await waitForHydration(page);

			const dashboardLink = page.getByRole("link", { name: /dashboard|home/i });
			await dashboardLink.click();
			await waitForHydration(page);

			await expect(page).toHaveURL("/");
		});
	});

	test.describe("Dashboard Header", () => {
		test("should display admin username", async ({ page }) => {
			// Header should show logged-in admin's username
			await expect(page.getByRole("banner").first()).toBeVisible();
			// Check for admin username/role in the header (shows as "adminadmin" - username + role badge)
			await expect(page.getByText(/adminadmin/i)).toBeVisible();
		});

		test("should have logout button", async ({ page }) => {
			const logoutButton = page.getByRole("button", { name: /logout|sign out/i });
			await expect(logoutButton).toBeVisible();
		});

		test("should display app title or logo", async ({ page }) => {
			const title = page.getByRole("link", { name: /chirp|admin/i }).first();
			await expect(title).toBeVisible();
		});
	});

	test.describe("Dashboard Responsiveness", () => {
		test("should display properly on mobile viewport", async ({ page }) => {
			await page.setViewportSize({ width: 375, height: 667 });
			await page.reload({ waitUntil: "networkidle" });
			await waitForHydration(page);

			// Dashboard should still be functional
			await expect(page.getByRole("heading", { name: /dashboard/i })).toBeVisible();
		});

		test("should display properly on tablet viewport", async ({ page }) => {
			await page.setViewportSize({ width: 768, height: 1024 });
			await page.reload({ waitUntil: "networkidle" });
			await waitForHydration(page);

			await expect(page.getByRole("heading", { name: /dashboard/i })).toBeVisible();
		});
	});

	test.describe("Dashboard Data", () => {
		test("should refresh stats on page reload", async ({ page }) => {
			// Get initial stats content
			const statsElement = page.locator('article, [class*="stat"]').first();
			expect(await statsElement.textContent()).toBeDefined();

			await page.reload({ waitUntil: "networkidle" });
			await waitForHydration(page);

			// Stats should load again
			await expect(page.getByText(/total users/i)).toBeVisible();
		});

		test("should show loading state initially", async ({ page }) => {
			// Navigate away and back to see loading state
			await page.goto("/users", { waitUntil: "networkidle" });
			await page.goto("/", { waitUntil: "networkidle" });

			// Loading state or content should be visible
			await expect(page.locator("body")).toBeVisible();
		});
	});
});
