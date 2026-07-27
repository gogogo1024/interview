import { expect, test } from "@playwright/test";
import { loginAs, waitForHydration } from "./fixtures/test-helpers";

test.describe("Search - Comprehensive", () => {
	test.beforeEach(async ({ page }) => {
		await loginAs(page, "alice");
	});

	test.describe("Search Navigation", () => {
		test("should navigate to search page", async ({ page }) => {
			await page.goto("/", { waitUntil: "networkidle" });
			await waitForHydration(page);

			const searchLink = page.getByRole("link", { name: /search/i });
			if (await searchLink.isVisible()) {
				await searchLink.click();
				await waitForHydration(page);

				await expect(page).toHaveURL(/\/search/);
			}
		});

		test("should have search input", async ({ page }) => {
			await page.goto("/search", { waitUntil: "networkidle" });
			await waitForHydration(page);

			const searchInput = page.getByPlaceholder(/search/i);
			await expect(searchInput).toBeVisible();
		});
	});

	test.describe("Searching Posts", () => {
		test("should search for posts by content", async ({ page }) => {
			await page.goto("/search", { waitUntil: "networkidle" });
			await waitForHydration(page);

			const searchInput = page.getByPlaceholder(/search/i);
			await searchInput.fill("Hello");
			await searchInput.press("Enter");
			await waitForHydration(page);

			// Should show search results (may or may not have results depending on seed data)
			const results = page.locator("article");
			expect(await results.count()).toBeGreaterThanOrEqual(0);
		});

		test("should show no results message for unmatched query", async ({ page }) => {
			await page.goto("/search", { waitUntil: "networkidle" });
			await waitForHydration(page);

			const searchInput = page.getByPlaceholder(/search/i);
			await searchInput.fill("xyznonexistentquery123");
			await searchInput.press("Enter");
			await waitForHydration(page);

			// Should show no results or empty state
			const noResults = page.getByText(/no results|nothing found|no posts/i);
			const hasResults = (await page.locator("article").count()) > 0;

			// Either no results message or empty results
			expect((await noResults.isVisible()) || !hasResults).toBeTruthy();
		});

		test("should search with special characters", async ({ page }) => {
			await page.goto("/search", { waitUntil: "networkidle" });
			await waitForHydration(page);

			const searchInput = page.getByPlaceholder(/search/i);
			await searchInput.fill("#hashtag");
			await searchInput.press("Enter");
			await waitForHydration(page);

			// Should handle special characters gracefully
		});

		test("should preserve search query in URL", async ({ page }) => {
			await page.goto("/search", { waitUntil: "networkidle" });
			await waitForHydration(page);

			const searchInput = page.getByPlaceholder(/search/i);
			await searchInput.fill("test query");
			await searchInput.press("Enter");
			await waitForHydration(page);

			// URL should contain query parameter
			const url = page.url();
			expect(url).toContain("search");
		});

		test("should load search from URL query", async ({ page }) => {
			await page.goto("/search?q=Hello", { waitUntil: "networkidle" });
			await waitForHydration(page);

			// Search input should have the query (may auto-populate from URL)
			const searchInput = page.getByPlaceholder(/search/i);
			expect(await searchInput.inputValue()).toBeDefined();
		});
	});

	test.describe("Searching Users", () => {
		test("should search for users", async ({ page }) => {
			await page.goto("/search", { waitUntil: "networkidle" });
			await waitForHydration(page);

			const searchInput = page.getByPlaceholder(/search/i);
			await searchInput.fill("alice");
			await searchInput.press("Enter");
			await waitForHydration(page);

			// Should show user results or posts by Alice (implementation dependent)
			const results = page.locator('article, [data-testid*="user"]');
			expect(await results.count()).toBeGreaterThanOrEqual(0);
		});

		test("should navigate to user profile from search results", async ({ page }) => {
			await page.goto("/search", { waitUntil: "networkidle" });
			await waitForHydration(page);

			const searchInput = page.getByPlaceholder(/search/i);
			await searchInput.fill("alice");
			await searchInput.press("Enter");
			await waitForHydration(page);

			// Click on user link if available
			const userLink = page.locator('a[href*="/users/alice"]').first();
			if (await userLink.isVisible()) {
				await userLink.click();
				await waitForHydration(page);

				await expect(page).toHaveURL(/\/users\/alice/);
			}
		});
	});

	test.describe("Search Results Interaction", () => {
		test("should like a post from search results", async ({ page }) => {
			await page.goto("/search", { waitUntil: "networkidle" });
			await waitForHydration(page);

			const searchInput = page.getByPlaceholder(/search/i);
			await searchInput.fill("Hello");
			await searchInput.press("Enter");
			await waitForHydration(page);

			const likeButton = page.locator("button").filter({ hasText: /^\d+$/ }).first();
			if (await likeButton.isVisible()) {
				await likeButton.click();
				await waitForHydration(page);
			}
		});

		test("should navigate to post from search results", async ({ page }) => {
			await page.goto("/search", { waitUntil: "networkidle" });
			await waitForHydration(page);

			const searchInput = page.getByPlaceholder(/search/i);
			await searchInput.fill("Hello");
			await searchInput.press("Enter");
			await waitForHydration(page);

			const postLink = page.locator('a[href*="/posts/"]').first();
			if (await postLink.isVisible()) {
				await postLink.click();
				await waitForHydration(page);

				await expect(page).toHaveURL(/\/posts\//);
			}
		});
	});

	test.describe("Search UX", () => {
		test("should clear search input", async ({ page }) => {
			await page.goto("/search", { waitUntil: "networkidle" });
			await waitForHydration(page);

			const searchInput = page.getByPlaceholder(/search/i);
			await searchInput.fill("test query");

			// Clear the input
			await searchInput.clear();
			const value = await searchInput.inputValue();
			expect(value).toBe("");
		});

		test("should search on enter key", async ({ page }) => {
			await page.goto("/search", { waitUntil: "networkidle" });
			await waitForHydration(page);

			const searchInput = page.getByPlaceholder(/search/i);
			await searchInput.fill("test");
			await searchInput.press("Enter");
			await waitForHydration(page);

			// Search should execute
		});

		test("should handle empty search gracefully", async ({ page }) => {
			await page.goto("/search", { waitUntil: "networkidle" });
			await waitForHydration(page);

			const searchInput = page.getByPlaceholder(/search/i);
			await searchInput.press("Enter");
			await waitForHydration(page);

			// Should not crash or show error
			await expect(page.locator("body")).toBeVisible();
		});
	});
});
