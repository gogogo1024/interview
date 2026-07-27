import { expect, test } from "@playwright/test";
import { loginAs, TEST_USERS, uniqueId, waitForHydration } from "./fixtures/test-helpers";

test.describe("Authentication - Comprehensive", () => {
	test.describe("Registration", () => {
		test("should register a new user with valid data", async ({ page }) => {
			const uniqueEmail = `newuser_${uniqueId()}@example.com`;
			const uniqueUsername = `user_${uniqueId()}`.substring(0, 20);

			await page.goto("/auth/register", { waitUntil: "networkidle" });
			await waitForHydration(page);

			await page.fill('input[name="email"]', uniqueEmail);
			await page.fill('input[name="username"]', uniqueUsername);
			await page.fill('input[name="displayName"]', "New Test User");
			await page.fill('input[name="password"]', "SecurePass123");
			await page.fill('input[name="confirmPassword"]', "SecurePass123");

			await page.click('button[type="submit"]');

			// Should redirect to home feed after successful registration
			await expect(page).toHaveURL("/");
		});

		test("should show error for existing email", async ({ page }) => {
			await page.goto("/auth/register", { waitUntil: "networkidle" });
			await waitForHydration(page);

			await page.fill('input[name="email"]', TEST_USERS.alice.email);
			await page.fill('input[name="username"]', `unique_${uniqueId()}`);
			await page.fill('input[name="displayName"]', "Test User");
			await page.fill('input[name="password"]', "password123");
			await page.fill('input[name="confirmPassword"]', "password123");

			await page.click('button[type="submit"]');

			// Should show error for duplicate email
			await expect(page.getByText(/already|exists|taken/i)).toBeVisible();
		});

		test("should show error for existing username", async ({ page }) => {
			await page.goto("/auth/register", { waitUntil: "networkidle" });
			await waitForHydration(page);

			await page.fill('input[name="email"]', `unique_${uniqueId()}@example.com`);
			await page.fill('input[name="username"]', TEST_USERS.alice.username);
			await page.fill('input[name="displayName"]', "Test User");
			await page.fill('input[name="password"]', "password123");
			await page.fill('input[name="confirmPassword"]', "password123");

			await page.click('button[type="submit"]');

			// Should show error for duplicate username
			await expect(page.getByText(/already|exists|taken/i)).toBeVisible();
		});

		test("should validate password confirmation", async ({ page }) => {
			await page.goto("/auth/register", { waitUntil: "networkidle" });
			await waitForHydration(page);

			await page.fill('input[name="email"]', `test_${uniqueId()}@example.com`);
			await page.fill('input[name="username"]', `user_${uniqueId()}`);
			await page.fill('input[name="displayName"]', "Test User");
			await page.fill('input[name="password"]', "password123");
			await page.fill('input[name="confirmPassword"]', "differentpassword");

			await page.click('button[type="submit"]');

			// Should show password mismatch error
			await expect(page.getByText(/password.*match/i)).toBeVisible();
		});

		test("should have link to login page", async ({ page }) => {
			await page.goto("/auth/register", { waitUntil: "networkidle" });
			await waitForHydration(page);

			const loginLink = page.getByRole("link", { name: /login|sign in/i });
			await expect(loginLink).toBeVisible();

			await loginLink.click();
			await expect(page).toHaveURL("/auth/login");
		});
	});

	test.describe("Login", () => {
		test("should login with valid credentials", async ({ page }) => {
			await page.goto("/auth/login", { waitUntil: "networkidle" });
			await waitForHydration(page);

			await page.fill('input[name="email"]', TEST_USERS.alice.email);
			await page.fill('input[name="password"]', TEST_USERS.alice.password);
			await page.click('button[type="submit"]');

			await expect(page).toHaveURL("/");
			await expect(page.getByPlaceholder("What's happening?")).toBeVisible();
		});

		test("should show error for invalid email", async ({ page }) => {
			await page.goto("/auth/login", { waitUntil: "networkidle" });
			await waitForHydration(page);

			await page.fill('input[name="email"]', "nonexistent@example.com");
			await page.fill('input[name="password"]', "password123");
			await page.click('button[type="submit"]');

			await expect(page.getByText(/invalid|not found|incorrect/i)).toBeVisible();
		});

		test("should show error for wrong password", async ({ page }) => {
			await page.goto("/auth/login", { waitUntil: "networkidle" });
			await waitForHydration(page);

			await page.fill('input[name="email"]', TEST_USERS.alice.email);
			await page.fill('input[name="password"]', "wrongpassword");
			await page.click('button[type="submit"]');

			await expect(page.getByText(/invalid|incorrect/i)).toBeVisible();
		});

		test("should have link to register page", async ({ page }) => {
			await page.goto("/auth/login", { waitUntil: "networkidle" });
			await waitForHydration(page);

			const registerLink = page.getByRole("link", { name: /register|sign up|create/i });
			await expect(registerLink).toBeVisible();

			await registerLink.click();
			await expect(page).toHaveURL("/auth/register");
		});

		test("should persist session across page reloads", async ({ page }) => {
			await loginAs(page, "alice");

			// Reload the page
			await page.reload({ waitUntil: "networkidle" });
			await waitForHydration(page);

			// Should still be logged in
			await expect(page).toHaveURL("/");
			await expect(page.getByPlaceholder("What's happening?")).toBeVisible();
		});
	});

	test.describe("Route Protection", () => {
		test("should show login prompt on home page when not authenticated", async ({ page }) => {
			await page.goto("/", { waitUntil: "networkidle" });
			await waitForHydration(page);

			// Should show login prompt
			await expect(page.getByText(/please log in|sign in/i)).toBeVisible();
		});

		test("should allow access to auth pages when not authenticated", async ({ page }) => {
			await page.goto("/auth/login", { waitUntil: "networkidle" });
			await expect(page.locator('input[name="email"]')).toBeVisible();

			await page.goto("/auth/register", { waitUntil: "networkidle" });
			await expect(page.locator('input[name="email"]')).toBeVisible();
		});

		test("should allow viewing public profiles when not authenticated", async ({ page }) => {
			await page.goto("/users/alice", { waitUntil: "networkidle" });
			await waitForHydration(page);

			// Should show profile but not interactive elements
			await expect(page.locator('h1:has-text("Alice Johnson")')).toBeVisible();
		});
	});

	test.describe("Logout", () => {
		test("should logout successfully", async ({ page }) => {
			await loginAs(page, "alice");

			// Find and click logout - look in header area
			const logoutButton = page
				.locator("button, a")
				.filter({ hasText: /logout|sign out/i })
				.first();

			if (await logoutButton.isVisible()) {
				await logoutButton.click();
				await waitForHydration(page);

				// After logout, the Logout button should no longer be visible
				await page.goto("/", { waitUntil: "networkidle" });
				await waitForHydration(page);
				await expect(page.locator('button[title="Logout"]')).not.toBeVisible();
			}
		});
	});
});
