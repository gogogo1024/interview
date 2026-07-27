import { expect, type Page } from "@playwright/test";

/**
 * Test user credentials from seed data
 */
export const TEST_USERS = {
	alice: {
		email: "alice@test.com",
		password: "password123",
		username: "alice",
		displayName: "Alice Johnson",
	},
	bob: {
		email: "bob@test.com",
		password: "password123",
		username: "bob",
		displayName: "Bob Smith",
	},
	charlie: {
		email: "charlie@test.com",
		password: "password123",
		username: "charlie",
		displayName: "Charlie Brown",
	},
	diana: {
		email: "diana@test.com",
		password: "password123",
		username: "diana",
		displayName: "Diana Ross",
	},
};

/**
 * Wait for the page to settle after navigation or action.
 * Uses networkidle to ensure React/TanStack hydration completes.
 */
export async function waitForHydration(page: Page): Promise<void> {
	await page.waitForLoadState("networkidle");
	// Remove Nitro dev server error overlay if present
	try {
		await page.evaluate(() => {
			for (const el of document.querySelectorAll("vite-error-overlay")) el.remove();
		});
	} catch {
		// Context may have been destroyed by a concurrent navigation
	}
}

/**
 * Login as a specific test user
 */
export async function loginAs(
	page: Page,
	user: keyof typeof TEST_USERS | { email: string; password: string },
): Promise<void> {
	const credentials = typeof user === "string" ? TEST_USERS[user] : user;

	// Neutralize Nitro dev server error overlays via CSS for this browser context.
	// The overlay is injected by Vite's HMR client when Nitro encounters a
	// "Response body object should not be disturbed or locked" race condition
	// under concurrent test load. CSS is more reliable than MutationObserver
	// because it applies declaratively regardless of injection timing.
	await page.addInitScript(() => {
		function injectOverlayStyle() {
			const style = document.createElement("style");
			style.textContent =
				"vite-error-overlay { display: none !important; pointer-events: none !important; }";
			document.head.appendChild(style);
		}
		if (document.head) {
			injectOverlayStyle();
		} else {
			document.addEventListener("DOMContentLoaded", injectOverlayStyle);
		}
	});

	await page.goto("/auth/login", { waitUntil: "networkidle" });
	await waitForHydration(page);

	await page.fill('input[name="email"]', credentials.email);
	await page.fill('input[name="password"]', credentials.password);
	await page.click('button[type="submit"]');

	await expect(page).toHaveURL("/");

	// Reload the page to ensure session cookie is properly picked up by Header
	await page.reload({ waitUntil: "networkidle" });
	await waitForHydration(page);

	// Wait for user state to be loaded in Header (logout button appears)
	await expect(page.locator('button[title="Logout"]')).toBeVisible({ timeout: 10000 });
}

/**
 * Logout the current user
 */
export async function logout(page: Page): Promise<void> {
	// Click on user menu/avatar in header
	const userMenu = page.locator("header button, header a").filter({ hasText: /@/ }).first();
	if (await userMenu.isVisible()) {
		await userMenu.click();
		await waitForHydration(page);
	}

	// Look for logout button/link
	const logoutButton = page.getByRole("button", { name: /logout|sign out/i });
	if (await logoutButton.isVisible()) {
		await logoutButton.click();
		await expect(page).toHaveURL(/\/(auth\/login)?$/);
	}
}

/**
 * Create a new post with given content
 */
export async function createPost(page: Page, content: string): Promise<void> {
	await page.fill('textarea[placeholder*="happening"]', content);
	await page.click('button:has-text("Post")');
	await waitForHydration(page);
	await expect(page.getByText(content)).toBeVisible();
}

/**
 * Navigate to a user's profile
 */
export async function goToProfile(page: Page, username: string): Promise<void> {
	await page.goto(`/users/${username}`, { waitUntil: "networkidle" });
	await waitForHydration(page);
}

/**
 * Navigate to a specific post
 */
export async function goToPost(page: Page, postId: string): Promise<void> {
	await page.goto(`/posts/${postId}`, { waitUntil: "networkidle" });
	await waitForHydration(page);
}

/**
 * Generate a unique string for test data
 */
export function uniqueId(prefix = "test"): string {
	return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(7)}`;
}

/**
 * Accept browser dialog (confirm/alert)
 */
export function setupDialogHandler(page: Page, action: "accept" | "dismiss" = "accept"): void {
	page.on("dialog", (dialog) => {
		if (action === "accept") {
			dialog.accept();
		} else {
			dialog.dismiss();
		}
	});
}

/**
 * Wait for navigation to complete
 */
export async function waitForNavigation(page: Page, urlPattern: string | RegExp): Promise<void> {
	await page.waitForURL(urlPattern, { timeout: 10000 });
	await waitForHydration(page);
}

/**
 * Check if element is visible with optional text
 */
export async function isVisible(page: Page, selector: string, text?: string): Promise<boolean> {
	const locator = text ? page.locator(selector).filter({ hasText: text }) : page.locator(selector);
	return locator.first().isVisible();
}
