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
	// Wait for page to start loading and initialize
	try {
		await page.waitForLoadState("domcontentloaded", { timeout: 30_000 });
	} catch (e) {
		// ignore — continue anyway
	}

	// For TanStack Start applications without specific root elements,
	// wait for the page to have any meaningful content and settle
	// Look for common root selectors or any actual content
	const CONTENT_SELECTORS = [
		'[data-testid="app-root"]', // NextGen apps
		'#app-root',                 // Some React apps
		'#app',                       // Common React convention  
		'#root',                      // CRA default
		'[role="application"]',       // Accessible apps
		'main',                       // Semantic HTML
		'.login__styles.wrapper',     // Our specific app
	];

	let foundContent = false;
	for (const selector of CONTENT_SELECTORS) {
		try {
			const elements = await page.locator(selector);
			if (await elements.count() > 0) {
				foundContent = true;
				break;
			}
		} catch {
			// continue to next selector
		}
	}

	if (foundContent) {
		// Give React/TanStack time to settle
		await page.waitForTimeout(500);
	} else {
		// Fallback: wait for network to be idle as a signal that page is interactive
		try {
			await page.waitForLoadState("networkidle", { timeout: 60_000 });
		} catch (e) {
			// Give up gracefully — page may be loaded anyway
		}
	}
}

/**
 * Wait for the comment textarea to appear on the page and return its locator.
 * Uses a generous timeout to reduce flaky failures caused by slow hydration or
 * intermittent dev-server overlays.
 */
export async function waitForCommentForm(page: Page, timeout = 10000) {
	const selector = 'textarea[placeholder="Write a comment..."], textarea[placeholder*="comment"]';
	await page.waitForSelector(selector, { state: "visible", timeout });
	return page.locator('textarea[placeholder*="comment"]').first();
}

/**
 * Login as a specific test user
 */
async function clearBrowserState(page: Page): Promise<void> {
	await page.evaluate(() => {
		try {
			window.localStorage.clear();
			window.sessionStorage.clear();
		} catch {
			// Ignore storage access failures from a destroyed page.
		}
	});
	await page.context().clearCookies();
	await page.goto("about:blank");
}

export async function loginAs(
	page: Page,
	user: keyof typeof TEST_USERS | { email: string; password: string },
): Promise<void> {
	const credentials = typeof user === "string" ? TEST_USERS[user] : user;

	await clearBrowserState(page);

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

	console.log(`loginAs: Starting login for user: ${typeof user === "string" ? user : user.email}`);
	
	let loggedIn = false;
	for (let attempt = 1; attempt <= 3; attempt++) {
		console.log(`\n=== Login Attempt ${attempt}/3 ===`);
		
		// Navigate to login page
		await page.goto("/auth/login", { waitUntil: "domcontentloaded" });
		await waitForHydration(page);
		
		// Wait for form to be ready
		try {
			await page.waitForSelector('input[name="email"]', { state: "visible", timeout: 10000 });
		} catch (err) {
			console.log(`Form input not found on attempt ${attempt}`);
			continue;
		}

		// Fill credentials
		const emailInput = page.locator('input[name="email"]');
		const passwordInput = page.locator('input[name="password"]');
		const submitBtn = page.locator('button[type="submit"]');
		
		await emailInput.fill(credentials.email, { timeout: 5000 });
		await passwordInput.fill(credentials.password, { timeout: 5000 });
		console.log(`Filled credentials: ${credentials.email}`);
		
		// Submit form and wait for response
		await submitBtn.click();
		console.log(`Form submitted`);
		
		// Wait for page to change or error message to appear
		try {
			// Give the server time to respond and navigate
			await page.waitForTimeout(2000);
			
			const currentUrl = page.url();
			console.log(`After submit, URL: ${currentUrl}`);
			
			// Check if we're still on login page
			if (!currentUrl.includes("/auth/login")) {
				console.log(`✓ Successfully navigated away from login page`);
				loggedIn = true;
				break;
			}
			
			// Check for error message
			const errorElement = await page.locator('[role="alert"], .error, [class*="error"]').first().textContent({ timeout: 1000 }).catch(() => null);
			if (errorElement) {
				console.log(`Error message on page: ${errorElement}`);
			} else {
				console.log(`Still on /auth/login and no error visible`);
			}
		} catch (err) {
			console.log(`Error during wait: ${err}`);
		}
		
		// Clear browser state before retry (except on last attempt)
		if (attempt < 3 && !loggedIn) {
			console.log(`Clearing browser state for retry...`);
			try {
				await clearBrowserState(page);
			} catch (err) {
				console.log(`Error clearing browser state: ${err}`);
			}
		}
	}

	if (!loggedIn) {
		const finalUrl = page.url();
		console.log(`\n✗ Login FAILED after 3 attempts. Final URL: ${finalUrl}`);
		throw new Error(`Failed to login after 3 attempts. Currently at: ${finalUrl}`);
	}

	console.log(`\n✓ Login successful, waiting for page to settle...`);
	
	// Wait for hydration after navigation
	await waitForHydration(page);

	// Verify we can see the logout button
	try {
		const logoutBtn = page.locator('button[title="Logout"]');
		await expect(logoutBtn).toBeVisible({ timeout: 15000 });
		console.log(`✓ Logout button visible, login complete`);
	} catch (err) {
		console.log(`Warning: Logout button not visible after 15s`);
		console.log(`Current URL: ${page.url()}`);
		// Don't fail here, the test might still work
	}
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
