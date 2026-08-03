import { expect, type Page } from "@playwright/test";

/**
 * Admin test user credentials
 */
export const ADMIN_USERS = {
	admin: {
		email: "admin@chirp.test",
		password: "admin123",
		username: "admin",
		displayName: "Admin User",
		role: "admin" as const,
	},
	moderator: {
		email: "moderator@chirp.test",
		password: "mod123",
		username: "moderator",
		displayName: "Moderator User",
		role: "moderator" as const,
	},
};

/**
 * Regular users for testing (should not have admin access)
 */
export const REGULAR_USERS = {
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
 * Login as an admin user
 */
export async function loginAsAdmin(
	page: Page,
	user: keyof typeof ADMIN_USERS = "admin",
): Promise<void> {
	const credentials = ADMIN_USERS[user];

	// Neutralize Nitro dev server error overlays via CSS for this browser context.
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

	await page.goto("/login", { waitUntil: "networkidle" });
	await waitForHydration(page);

	await page.fill('input[name="email"]', credentials.email);
	await page.fill('input[name="password"]', credentials.password);
	await page.click('button[type="submit"]');

	// Wait for redirect to dashboard
	await expect(page).toHaveURL("/");
}

/**
 * Attempt login with credentials (may fail for non-admin)
 */
export async function attemptLogin(page: Page, email: string, password: string): Promise<void> {
	await page.goto("/login", { waitUntil: "networkidle" });
	await waitForHydration(page);

	await page.fill('input[name="email"]', email);
	await page.fill('input[name="password"]', password);
	await page.click('button[type="submit"]');
	await waitForHydration(page);
}

/**
 * Logout the current admin user
 */
export async function logoutAdmin(page: Page): Promise<void> {
	const logoutButton = page.getByRole("button", { name: /logout|sign out/i });
	if (await logoutButton.isVisible()) {
		await logoutButton.click();
		await expect(page).toHaveURL("/login");
	}
}

/**
 * Navigate to admin page
 */
export async function goToAdminPage(
	page: Page,
	path: "users" | "posts" | "reports" | "dashboard",
): Promise<void> {
	const urlPath = path === "dashboard" ? "/" : `/${path}`;
	await page.goto(urlPath, { waitUntil: "networkidle" });
	await waitForHydration(page);
}

/**
 * Navigate to user detail page
 */
export async function goToUserDetail(page: Page, userId: string): Promise<void> {
	await page.goto(`/users/${userId}`, { waitUntil: "networkidle" });
	await waitForHydration(page);
}

/**
 * Navigate to post detail page
 */
export async function goToPostDetail(page: Page, postId: string): Promise<void> {
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
 * Search in a table/list
 */
export async function searchInList(page: Page, query: string): Promise<void> {
	const searchInput = page.getByPlaceholder(/search/i);
	await searchInput.fill(query);
	await waitForHydration(page);
}

/**
 * Get count from a stat card
 */
export async function getStatValue(page: Page, label: string): Promise<number> {
	const stat = page.getByText(label).locator("..").locator("p, span, div").first();
	const text = await stat.textContent();
	return Number.parseInt(text?.replace(/\D/g, "") || "0");
}

/**
 * Click action button (ban, delete, etc.)
 */
export async function clickActionButton(
	page: Page,
	action: "ban" | "unban" | "delete" | "resolve" | "dismiss" | "change role",
): Promise<void> {
	const button = page.getByRole("button", { name: new RegExp(action, "i") });
	await button.click();
	await waitForHydration(page);
}
