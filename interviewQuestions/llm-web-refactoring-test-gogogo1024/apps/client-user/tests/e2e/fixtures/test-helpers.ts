import { type Cookie, expect, type Page, type Response } from "@playwright/test";

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
 * Prefer `networkidle` but fall back to heuristics for root selectors.
 */
export async function waitForHydration(page: Page): Promise<void> {
	// Remove Nitro / Vite error overlay if present
	try {
		await page.evaluate(() => {
			document.querySelectorAll("vite-error-overlay").forEach((el) => {
				el.remove();
			});
		});
	} catch (_e) {
		// ignore
	}

	const CONTENT_SELECTORS = [
		'[data-testid="app-root"]',
		"#app-root",
		"#app",
		"#root",
		'[role="application"]',
		"main",
		".login__styles.wrapper",
	];

	for (const sel of CONTENT_SELECTORS) {
		try {
			const count = await page.locator(sel).count();
			if (count > 0) {
				await page.waitForTimeout(300);
				return;
			}
		} catch {
			// ignore
		}
	}

	// Fallback
	try {
		await page.waitForLoadState("networkidle", { timeout: 60_000 });
	} catch {
		// give up — page may still be interactive
	}
}

export async function waitForCommentForm(page: Page, timeout = 15000) {
	const candidates = [
		'textarea[placeholder="Write a comment..."]',
		'textarea[placeholder*="comment"]',
		'form:has(button:has-text("Comment")) textarea',
		'[data-test="comment-form"] textarea',
		'[data-testid="comment-form"] textarea',
	];

	// Remove common dev overlays that can block visibility
	try {
		await page.evaluate(() => {
			document.querySelectorAll("vite-error-overlay").forEach((el) => {
				el.remove();
			});
		});
	} catch {}

	const perTry = Math.max(2000, Math.floor(timeout / candidates.length));

	// Try a few candidate selectors progressively
	for (const sel of candidates) {
		try {
			await page.waitForSelector(sel, { state: "visible", timeout: perTry });
			const locator = page.locator(sel).first();
			try {
				await expect(locator).toBeEditable({ timeout: 1000 });
			} catch {}
			await locator.scrollIntoViewIfNeeded().catch(() => {});
			return locator;
		} catch {
			// continue to next candidate
		}
	}

	// If not found, try clicking common "reveal comments" controls then re-check
	const revealBtns = [
		'button:has-text("Show comments")',
		'button:has-text("Comments")',
		'a:has-text("Comments")',
		'button[aria-expanded="false"][aria-controls*="comments"]',
	];
	for (const btnSel of revealBtns) {
		try {
			const btn = page.locator(btnSel).first();
			if (await btn.isVisible().catch(() => false)) {
				await btn.click().catch(() => {});
				await page.waitForTimeout(500);
				for (const sel of candidates) {
					try {
						await page.waitForSelector(sel, { state: "visible", timeout: 2000 });
						const locator = page.locator(sel).first();
						try {
							await expect(locator).toBeEditable({ timeout: 1000 });
						} catch {}
						return locator;
					} catch {}
				}
			}
		} catch {}
	}

	// Final fallback: return any visible textarea (best-effort) before giving up
	try {
		await page.waitForSelector("textarea", { state: "visible", timeout: 3000 });
		const ta = page.locator("textarea").first();
		await ta.scrollIntoViewIfNeeded().catch(() => {});
		return ta;
	} catch {}

	throw new Error(
		`waitForCommentForm: timed out after ${timeout}ms; tried selectors: ${candidates.join(", ")}`,
	);
}

export async function clearBrowserState(page: Page): Promise<void> {
	try {
		await page.context().clearCookies();
		await page.evaluate(() => {
			try {
				window.localStorage.clear();
				window.sessionStorage.clear();
			} catch {}
		});
	} catch (_e) {
		// ignore
	}
	// Neutral blank page
	try {
		await page.goto("about:blank");
	} catch {}
}

export function uniqueId(prefix = "test"): string {
	return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Register a fresh test user via the UI and ensure session is established.
 * Returns the credentials used for assertions in tests.
 */
export async function registerAndLogin(
	page: Page,
	opts?: { email?: string; password?: string; username?: string; displayName?: string },
): Promise<{ email: string; password: string; username: string; displayName: string }> {
	const id = uniqueId("u");
	const email = opts?.email ?? `${id}@test.com`;
	const username = opts?.username ?? `${id}`;
	const displayName = opts?.displayName ?? `Test ${id.slice(-4)}`;
	const password = opts?.password ?? "password123";

	await clearBrowserState(page);

	await page.goto("/auth/register", { waitUntil: "domcontentloaded" });
	await waitForHydration(page);

	await page.fill('input[name="email"]', email);
	await page.fill('input[name="username"]', username);
	await page.fill('input[name="displayName"]', displayName);
	await page.fill('input[name="password"]', password);
	await page.fill('input[name="confirmPassword"]', password);

	// Submit and wait for navigation away from register page (use Playwright wait)
	await Promise.all([
		page.click('button[type="submit"]'),
		page.waitForURL(/^(?!.*\/auth\/register).*$/, { timeout: 30_000 }).catch(() => {}),
	]);

	await waitForHydration(page);

	const logoutBtn = page.locator(
		'button[title="Logout"], button[aria-label="Logout"], button:has-text("Logout"), button:has-text("Sign out")',
	);
	try {
		await expect(logoutBtn.first()).toBeVisible({ timeout: 5000 });
	} catch {
		// If the logout button isn't visible, still return credentials — tests can decide
	}

	return { email, password, username, displayName };
}

/**
 * Login as a seed user or provided credentials.
 */
export async function loginAs(
	page: Page,
	user: keyof typeof TEST_USERS | { email: string; password: string },
): Promise<void> {
	const credentials = typeof user === "string" ? TEST_USERS[user] : user;

	await clearBrowserState(page);

	// Prefer Node-side API login: call server fn from Node test runner,
	// extract Set-Cookie and inject into browser context via addCookies().
	// Falls back to the page-eval apiLoginAs() and finally UI login.
	// Try Node-side API login then page-based server-fn login. Avoid manual polling;
	// use Playwright waiting primitives to observe UI/network changes.
	await nodeApiLoginAs(page, credentials).catch(() => {});
	try {
		await page.waitForSelector('a[title="Notifications"]', { timeout: 5000 });
		return;
	} catch {
		// fallback to page-based server-fn login
	}

	await apiLoginAs(page, credentials).catch(() => {});
	try {
		await page.waitForSelector('a[title="Notifications"]', { timeout: 5000 });
		return;
	} catch {
		// fall through to UI login
	}

	// Capture network responses around login for debugging flaky auth
	const netLogs: Array<{ url: string; status: number; ok: boolean; body?: string }> = [];
	const onResponse = async (res: Response) => {
		try {
			const url = res.url();
			if (
				url.includes("/auth") ||
				url.includes("/login") ||
				url.includes("/_server") ||
				url.includes("/_rpc") ||
				url.includes("/auth/login")
			) {
				const entry: { url: string; status: number; ok: boolean; body?: string } = {
					url,
					status: res.status(),
					ok: res.ok(),
				};
				try {
					const ct = (
						res.headers()["content-type"] ||
						res.headers()["Content-Type"] ||
						""
					).toString();
					if (ct.includes("application/json") || ct.includes("text")) {
						const txt = await res.text();
						entry.body = txt.slice(0, 1000);
					}
				} catch {}
				netLogs.push(entry);
			}
		} catch {}
	};
	page.on("response", onResponse);

	await page.goto("/auth/login", { waitUntil: "domcontentloaded" });
	await waitForHydration(page);

	await page.fill('input[name="email"]', credentials.email);
	await page.fill('input[name="password"]', credentials.password);

	// Submit and wait for client-side navigation away from login page
	// Submit and wait for a definitive network/UI event — no polling or retries.
	await page.click('button[type="submit"]');
	try {
		await page.waitForResponse(
			(resp) =>
				(resp.url().includes("/api/current-user") || resp.url().includes("/_serverFn")) &&
				resp.status() === 200,
			{ timeout: 15_000 },
		);
	} catch {
		// If no matching response, at least wait for navigation away from login page.
		try {
			await page.waitForURL(/^(?!.*\/auth\/login).*$/, { timeout: 15_000 });
		} catch {
			// give up — caller will perform final checks
		}
	}

	await waitForHydration(page);
	// best-effort check — don't hard-fail here
	const logoutBtn = page.locator(
		'button[title="Logout"], button[aria-label="Logout"], button:has-text("Logout"), button:has-text("Sign out")',
	);
	try {
		await expect(logoutBtn.first()).toBeVisible({ timeout: 5000 });
	} catch {}

	// Dump collected network logs for debugging then remove listener
	try {
		page.off("response", onResponse);
		if (netLogs.length) {
			// Print compact JSON to test output
			console.log("[E2E-NET-LOG]", JSON.stringify(netLogs.slice(0, 20)));
		}
		// Dump cookies to help debug session being set in browser
		try {
			const cookies = await page.context().cookies();
			console.log("[E2E-COOKIES]", JSON.stringify(cookies));
		} catch (_e) {
			// ignore cookie dump errors
		}
		// After cookie injection/reload, wait for the backend current-user call
		// and for the header UI to render. Avoid polling; rely on network/UI waits.
		try {
			try {
				await page.goto("/", { waitUntil: "networkidle" });
			} catch {}

			// Wait for server to respond with current user (adjust endpoint if needed)
			await page
				.waitForResponse(
					(resp) => resp.url().includes("/api/current-user") && resp.status() === 200,
					{ timeout: 10_000 },
				)
				.catch(() => {});

			await waitForHydration(page);

			// Wait for header elements to appear (notifications or logout)
			await page
				.waitForSelector(
					'a[title="Notifications"], button[title="Logout"], button:has-text("Logout")',
					{ timeout: 15_000 },
				)
				.catch(() => {});
		} catch (_e) {
			// ignore waiting errors
		}
	} catch (_e) {
		// ignore
	}
}

/**
 * Perform a server-function API login from the browser context.
 * This invokes the server-side `loginUser` function so the server sets the
 * session cookie (`chirp-session`) directly on the response. We call it from
 * the page context (fetch with `credentials: 'same-origin'`) so the browser
 * stores the cookie automatically.
 */
export async function apiLoginAs(
	page: Page,
	user: keyof typeof TEST_USERS | { email: string; password: string },
): Promise<void> {
	const credentials = typeof user === "string" ? TEST_USERS[user] : user;

	// Server function id (from build artifacts). This is stable across builds.
	const LOGIN_FN_ID = "8eedfecaf0386955b79cfc59f730a31dae95768ee62cbe560d2d924d4d9c7cc4";

	// Ensure we're on the app origin so fetch is same-origin and will accept Set-Cookie
	try {
		await page.goto("/", { waitUntil: "networkidle" });
	} catch {}

	// Call the server function endpoint from the page so the browser will receive
	// and persist the HttpOnly session cookie set by the server.
	try {
		await page.evaluate(
			async ({ fnUrl, email, password }: { fnUrl: string; email: string; password: string }) => {
				try {
					await fetch(fnUrl, {
						method: "POST",
						credentials: "same-origin",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({ args: [{ data: { email, password } }] }),
					});
				} catch (_e) {
					// ignore
				}
			},
			{
				fnUrl: `/_serverFn/${LOGIN_FN_ID}`.replace(/\s+/g, ""),
				email: credentials.email,
				password: credentials.password,
			},
		);

		// Give the browser a moment to persist cookie and let client re-fetch user
		try {
			await page.reload({ waitUntil: "networkidle" });
		} catch {}
		await waitForHydration(page);
	} catch (_e) {
		// swallow - fallback handled by caller
	}
}

/**
 * Node-side login: perform a login request from the test runner (Node),
 * capture Set-Cookie header and inject cookies into the Playwright context
 * using `context.addCookies()` so the browser has the HttpOnly session.
 */
export async function nodeApiLoginAs(
	page: Page,
	user: keyof typeof TEST_USERS | { email: string; password: string },
): Promise<void> {
	const credentials = typeof user === "string" ? TEST_USERS[user] : user;
	// Prefer a small E2E-only HTTP endpoint that sets the session cookie
	// on the response. This avoids Seroval/browser-edge cases and lets the
	// test runner read Set-Cookie and inject into the Playwright context.
	const url = `http://localhost:3000/api/e2e/login`;

	try {
		type FetchResponse = { headers?: { raw?: () => Record<string, string[]> } };
		type FetchFn = (
			url: string,
			init?: {
				method?: string;
				headers?: Record<string, string>;
				body?: string;
				redirect?: string;
			},
		) => Promise<FetchResponse>;

		const fetch = (await import("node-fetch")).default as unknown as FetchFn;
		const res = await fetch(url, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ email: credentials.email, password: credentials.password }),
			redirect: "manual",
		});

		const raw = res.headers?.raw ? (res.headers.raw() as Record<string, string[]>) : {};
		const setCookie = raw["set-cookie"] || raw["Set-Cookie"] || [];
		if (!setCookie || setCookie.length === 0) {
			// no cookie set — let caller fallback to apiLoginAs/UI
			return;
		}

		const cookies = setCookie.flatMap((sc) => {
			const [pair, ...attrs] = sc.split(";").map((s) => s.trim());
			const eq = pair.indexOf("=");
			if (eq === -1) return [];
			const name = pair.slice(0, eq);
			const value = pair.slice(eq + 1);
			const cookie = { name, value, url: "http://localhost", path: "/" } as unknown as Cookie;
			for (const a of attrs) {
				const [k, v] = a.split("=");
				const key = k.toLowerCase();
				if (key === "expires") cookie.expires = Math.floor(new Date(v).getTime() / 1000);
				if (key === "domain") cookie.domain = v;
				if (key === "path") cookie.path = v;
				if (key === "httponly") cookie.httpOnly = true;
				if (key === "secure") cookie.secure = true;
				if (key === "samesite") {
					const s = v ? (v.charAt(0).toUpperCase() + v.slice(1).toLowerCase()) : undefined;
					if (s === "Lax" || s === "Strict" || s === "None")
						cookie.sameSite = s as "Lax" | "Strict" | "None";
				}
			}
			return [cookie];
		});

		if (cookies.length) {
			await page.context().addCookies(cookies);
			try {
				await page.goto("/", { waitUntil: "networkidle" });
			} catch {}
			await waitForHydration(page);
		}
	} catch (_e) {
		// swallow errors — fallback handled by loginAs
		return;
	}
}

export async function logout(page: Page): Promise<void> {
	const logoutButton = page.getByRole("button", { name: /logout|sign out/i });
	if (await logoutButton.isVisible().catch(() => false)) {
		await logoutButton.click();
		await page
			.waitForURL(/\/auth\/login|\/login|\/auth\/register/, { timeout: 5000 })
			.catch(() => {});
		return;
	}

	// Fallback: open header menu then click logout
	const userMenu = page.locator("header button, header a").filter({ hasText: /@/ }).first();
	if (await userMenu.isVisible().catch(() => false)) {
		await userMenu.click();
		await waitForHydration(page);
		if (await logoutButton.isVisible().catch(() => false)) {
			await logoutButton.click();
		}
	}
}

export async function createPost(page: Page, content: string): Promise<void> {
	// Ensure textarea is present and fill content
	const textarea = page.locator(
		"textarea[placeholder=\"What's happening?\"], textarea[placeholder*='happening'], textarea",
	);
	await textarea.first().fill(content, { timeout: 5000 });

	const postButton = page.locator('button:has-text("Post")').first();
	// Wait for the post button to become enabled (after input validation)
	await expect(postButton).toBeEnabled({ timeout: 10000 });
	await postButton.click();

	// Verify the new post appeared
	await expect(page.getByText(content)).toBeVisible({ timeout: 10000 });
}

export async function goToProfile(page: Page, username: string): Promise<void> {
	await page.goto(`/users/${username}`, { waitUntil: "networkidle" });
	await waitForHydration(page);
}

export async function goToPost(page: Page, postId: string): Promise<void> {
	await page.goto(`/posts/${postId}`, { waitUntil: "networkidle" });
	await waitForHydration(page);
}

export function setupDialogHandler(page: Page, action: "accept" | "dismiss" = "accept"): void {
	page.on("dialog", (dialog) => {
		if (action === "accept") dialog.accept();
		else dialog.dismiss();
	});
}

export async function waitForNavigation(page: Page, urlPattern: string | RegExp): Promise<void> {
	await page.waitForURL(urlPattern, { timeout: 10000 });
	await waitForHydration(page);
}

export async function isVisible(page: Page, selector: string, text?: string): Promise<boolean> {
	const locator = text ? page.locator(selector).filter({ hasText: text }) : page.locator(selector);
	return locator
		.first()
		.isVisible()
		.catch(() => false);
}

/**
 * Wait until either notifications are rendered or the empty-state text appears.
 * This guards against a brief intermediate DOM state where neither exists.
 */
export async function waitForNotificationsSettled(page: Page, timeout = 15_000): Promise<void> {
	try {
		await page.waitForFunction(
			() => {
				try {
					// Prefer checking inside the notifications card to avoid matching unrelated buttons
					const card = document.querySelector(
						'[class*="notifications__styles.card"], [data-test="notifications-card"]',
					);
					if (card) {
						// look for typical notification item elements inside the card
						if (
							card.querySelector(
								'button, article, [role="listitem"], [class*="NotificationItem__styles"], [data-test="notification-item"]',
							)
						)
							return true;
						// empty-state text may be rendered inside the card
						if (card.textContent && /no notifications yet/i.test(card.textContent)) return true;
					}
					// fallback: global empty-state text
					if (document.body?.innerText && /no notifications yet/i.test(document.body.innerText))
						return true;
					return false;
				} catch {
					return false;
				}
			},
			undefined,
			{ timeout },
		);
	} catch {
		// If it times out, let the calling test assert and fail as appropriate.
	}
}
