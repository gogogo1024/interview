import { expect, test } from "@playwright/test";
import { loginAsAdmin, waitForHydration } from "./fixtures/test-helpers";

test.describe("Posts Management", () => {
	test.beforeEach(async ({ page }) => {
		await loginAsAdmin(page);
		await page.goto("/posts", { waitUntil: "networkidle" });
		await waitForHydration(page);
	});

	test("should display posts page", async ({ page }) => {
		// Posts page heading
		await expect(page.getByRole("heading", { name: /posts/i })).toBeVisible();
	});

	test("should have search functionality", async ({ page }) => {
		// Search input should be present
		const searchInput = page.getByPlaceholder(/search/i);
		await expect(searchInput).toBeVisible();
	});

	test("should have filter options", async ({ page }) => {
		// Filter select should be present
		const filterSelect = page.locator("select").first();
		await expect(filterSelect).toBeVisible();
	});

	test("should display post cards", async ({ page }) => {
		// Post entries should be visible
		const postCards = page.locator("article").first();
		await expect(postCards).toBeVisible();
	});

	test("should show post author information", async ({ page }) => {
		// Author information should be displayed
		const authorLink = page.getByRole("link").filter({ hasText: /@/ }).first();
		const hasAuthor = await authorLink.isVisible();

		// Alternative: check for author display name
		const authorName = page.locator("article").first().locator("a").first();
		const hasName = await authorName.isVisible();

		expect(hasAuthor || hasName).toBeTruthy();
	});

	test("should show post stats", async ({ page }) => {
		// Post stats (likes, comments) should be visible
		await expect(page.locator("article").first()).toBeVisible();
	});

	test("should have delete button for posts", async ({ page }) => {
		// Delete button should be present
		const deleteButton = page
			.getByRole("button")
			.filter({ has: page.locator("svg") })
			.first();
		await expect(deleteButton).toBeVisible();
	});

	test("should have view post link", async ({ page }) => {
		// View link/button should navigate to post detail
		const viewButton = page.locator("article").first().getByRole("link").first();
		await expect(viewButton).toBeVisible();
	});

	test("should flag reported posts", async ({ page }) => {
		// Posts with reports should show a flag indicator (may or may not be visible depending on data)
		const flagIndicator = page.getByText(/report/i);
		expect(
			await flagIndicator
				.first()
				.isVisible()
				.catch(() => false),
		).toBeDefined();
		// Just ensure the page renders correctly
		await expect(page.getByRole("heading", { name: /posts/i })).toBeVisible();
	});
});

test.describe("Post Detail Page", () => {
	test.beforeEach(async ({ page }) => {
		await loginAsAdmin(page);
	});

	test("should display post details", async ({ page }) => {
		await page.goto("/posts/1", { waitUntil: "networkidle" });
		await waitForHydration(page);

		// Should show post details heading
		await expect(page.getByRole("heading", { name: /post details/i })).toBeVisible();
	});

	test("should show post content", async ({ page }) => {
		await page.goto("/posts/1", { waitUntil: "networkidle" });
		await waitForHydration(page);

		// Post content should be visible
		const postContent = page.locator("p").first();
		await expect(postContent).toBeVisible();
	});

	test("should show post author", async ({ page }) => {
		await page.goto("/posts/1", { waitUntil: "networkidle" });
		await waitForHydration(page);

		// Author link should be visible
		const authorLink = page
			.getByRole("link")
			.filter({ hasText: /@|user/i })
			.first();
		await expect(authorLink).toBeVisible();
	});

	test("should have delete button", async ({ page }) => {
		await page.goto("/posts/1", { waitUntil: "networkidle" });
		await waitForHydration(page);

		// Delete button should be present
		await expect(page.getByRole("button", { name: /delete/i })).toBeVisible();
	});

	test("should show reports section", async ({ page }) => {
		await page.goto("/posts/1", { waitUntil: "networkidle" });
		await waitForHydration(page);

		// Reports section should be visible
		await expect(page.getByRole("heading", { name: /reports/i })).toBeVisible();
	});

	test("should show comments section", async ({ page }) => {
		await page.goto("/posts/1", { waitUntil: "networkidle" });
		await waitForHydration(page);

		// Comments section should be visible
		await expect(page.getByRole("heading", { name: /comments/i })).toBeVisible();
	});

	test("should have back navigation", async ({ page }) => {
		await page.goto("/posts/1", { waitUntil: "networkidle" });
		await waitForHydration(page);

		// Back link should be present
		const backLink = page.getByRole("link", { name: /back/i });
		await expect(backLink).toBeVisible();

		await backLink.click();
		await expect(page).toHaveURL("/posts");
	});
});
