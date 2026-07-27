import { expect, test } from "@playwright/test";
import { waitForHydration } from "./fixtures/test-helpers";

test.describe("Authentication", () => {
	test("should register a new user", async ({ page }) => {
		await page.goto("/auth/register", { waitUntil: "networkidle" });
		await waitForHydration(page);

		await page.fill('input[name="email"]', `test${Date.now()}@example.com`);
		await page.fill('input[name="username"]', `testuser${Date.now()}`);
		await page.fill('input[name="displayName"]', "Test User");
		await page.fill('input[name="password"]', "password123");
		await page.fill('input[name="confirmPassword"]', "password123");

		await page.click('button[type="submit"]');

		// Should redirect to home feed after successful registration
		await expect(page).toHaveURL("/");
	});

	test("should login with existing user", async ({ page }) => {
		await page.goto("/auth/login", { waitUntil: "networkidle" });
		await waitForHydration(page);

		await page.fill('input[name="email"]', "alice@test.com");
		await page.fill('input[name="password"]', "password123");

		await page.click('button[type="submit"]');

		// Should redirect to home feed after successful login
		await expect(page).toHaveURL("/");
		// Verify we're on the home page by checking for the post form
		await expect(page.getByPlaceholder("What's happening?")).toBeVisible();
	});

	test("should show error for invalid credentials", async ({ page }) => {
		await page.goto("/auth/login", { waitUntil: "networkidle" });
		await waitForHydration(page);

		await page.fill('input[name="email"]', "alice@test.com");
		await page.fill('input[name="password"]', "wrongpassword");

		await page.click('button[type="submit"]');

		// Should show error message
		await expect(page.getByText(/invalid/i)).toBeVisible();
	});

	test("should protect routes from unauthenticated users", async ({ page }) => {
		// Note: The home page doesn't redirect - it shows "Please log in" message
		await page.goto("/", { waitUntil: "networkidle" });

		// Should show login prompt
		await expect(page.getByText("Please log in")).toBeVisible();
	});

	test("should validate password confirmation on register", async ({ page }) => {
		await page.goto("/auth/register", { waitUntil: "networkidle" });
		await waitForHydration(page);

		await page.fill('input[name="email"]', "new@example.com");
		await page.fill('input[name="username"]', "newuser");
		await page.fill('input[name="displayName"]', "New User");
		await page.fill('input[name="password"]', "password123");
		await page.fill('input[name="confirmPassword"]', "different");

		await page.click('button[type="submit"]');

		// Should show error for mismatched passwords
		await expect(page.getByText(/password.*match/i)).toBeVisible();
	});
});
