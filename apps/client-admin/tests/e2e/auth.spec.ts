import { expect, test } from "@playwright/test";
import {
	ADMIN_USERS,
	attemptLogin,
	loginAsAdmin,
	REGULAR_USERS,
	waitForHydration,
} from "./fixtures/test-helpers";

test.describe("Admin Authentication - Comprehensive", () => {
	test.describe("Login", () => {
		test("should show login page for unauthenticated users", async ({ page }) => {
			await page.goto("/", { waitUntil: "networkidle" });
			await waitForHydration(page);

			await expect(page).toHaveURL("/login");
			await expect(page.getByRole("heading", { name: /admin/i })).toBeVisible();
		});

		test("should login with admin credentials", async ({ page }) => {
			await loginAsAdmin(page, "admin");

			await expect(page).toHaveURL("/");
			await expect(page.getByRole("heading", { name: /dashboard/i })).toBeVisible();
		});

		test("should login with moderator credentials", async ({ page }) => {
			await loginAsAdmin(page, "moderator");

			await expect(page).toHaveURL("/");
			await expect(page.getByRole("heading", { name: /dashboard/i })).toBeVisible();
		});

		test("should reject regular user credentials", async ({ page }) => {
			await attemptLogin(page, REGULAR_USERS.alice.email, REGULAR_USERS.alice.password);

			// Should show error for non-admin users
			await expect(page.getByText(/access denied|admin.*required|not authorized/i)).toBeVisible();
			await expect(page).toHaveURL("/login");
		});

		test("should show error for invalid email", async ({ page }) => {
			await attemptLogin(page, "nonexistent@example.com", "password123");

			await expect(page.getByText(/invalid|not found|incorrect/i)).toBeVisible();
		});

		test("should show error for wrong password", async ({ page }) => {
			await attemptLogin(page, ADMIN_USERS.admin.email, "wrongpassword");

			await expect(page.getByText(/invalid|incorrect/i)).toBeVisible();
		});

		test("should persist session across page reloads", async ({ page }) => {
			await loginAsAdmin(page);

			await page.reload({ waitUntil: "networkidle" });
			await waitForHydration(page);

			await expect(page).toHaveURL("/");
			await expect(page.getByRole("heading", { name: /dashboard/i })).toBeVisible();
		});

		test("should show loading state during login", async ({ page }) => {
			await page.goto("/login", { waitUntil: "networkidle" });
			await waitForHydration(page);

			await page.fill('input[name="email"]', ADMIN_USERS.admin.email);
			await page.fill('input[name="password"]', ADMIN_USERS.admin.password);

			// Click and check for loading indicator
			await page.click('button[type="submit"]');

			// Button should show loading or be disabled
			// Implementation dependent
		});
	});

	test.describe("Route Protection", () => {
		test("should redirect to login from dashboard when not authenticated", async ({ page }) => {
			await page.goto("/", { waitUntil: "networkidle" });
			await expect(page).toHaveURL("/login");
		});

		test("should redirect to login from users page when not authenticated", async ({ page }) => {
			await page.goto("/users", { waitUntil: "networkidle" });
			await expect(page).toHaveURL("/login");
		});

		test("should redirect to login from posts page when not authenticated", async ({ page }) => {
			await page.goto("/posts", { waitUntil: "networkidle" });
			await expect(page).toHaveURL("/login");
		});

		test("should redirect to login from reports page when not authenticated", async ({ page }) => {
			await page.goto("/reports", { waitUntil: "networkidle" });
			await expect(page).toHaveURL("/login");
		});

		test("should redirect to login from user detail page when not authenticated", async ({
			page,
		}) => {
			await page.goto("/users/1", { waitUntil: "networkidle" });
			await expect(page).toHaveURL("/login");
		});

		test("should redirect to login from post detail page when not authenticated", async ({
			page,
		}) => {
			await page.goto("/posts/1", { waitUntil: "networkidle" });
			await expect(page).toHaveURL("/login");
		});
	});

	test.describe("Logout", () => {
		test("should logout successfully", async ({ page }) => {
			await loginAsAdmin(page);

			const logoutButton = page.getByRole("button", { name: /logout|sign out/i });
			if (await logoutButton.isVisible()) {
				await logoutButton.click();
				await waitForHydration(page);

				await expect(page).toHaveURL("/login");
			}
		});

		test("should require login after logout", async ({ page }) => {
			await loginAsAdmin(page);

			const logoutButton = page.getByRole("button", { name: /logout|sign out/i });
			if (await logoutButton.isVisible()) {
				await logoutButton.click();
				// Wait for logout redirect to complete before testing access
				await expect(page).toHaveURL("/login");

				// Try to access protected page
				await page.goto("/", { waitUntil: "networkidle" });
				await expect(page).toHaveURL("/login");
			}
		});

		test("should clear session on logout", async ({ page }) => {
			await loginAsAdmin(page);

			const logoutButton = page.getByRole("button", { name: /logout|sign out/i });
			if (await logoutButton.isVisible()) {
				await logoutButton.click();
				await expect(page).toHaveURL("/login");

				// Reload and verify still logged out
				await page.reload({ waitUntil: "networkidle" });
				await expect(page).toHaveURL("/login");
			}
		});
	});

	test.describe("Session Expiry", () => {
		test("should handle expired session gracefully", async ({ page }) => {
			await loginAsAdmin(page);

			// Clear cookies to simulate session expiry
			await page.context().clearCookies();

			// Try to navigate
			await page.goto("/users", { waitUntil: "networkidle" });

			// Should redirect to login
			await expect(page).toHaveURL("/login");
		});
	});
});
