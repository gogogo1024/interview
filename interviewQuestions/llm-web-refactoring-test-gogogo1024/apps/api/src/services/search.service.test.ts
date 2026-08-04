import { describe, expect, it } from "vitest";
import { createTestPost, createTestUser } from "../../tests/helpers";
import { searchPosts, searchUsers } from "./search.service";

describe("SearchService", () => {
	it("returns matching posts for a keyword search", async () => {
		const author = await createTestUser();
		await createTestPost(author.id, "Hello from the search service");
		await createTestPost(author.id, "Another unrelated post");

		const results = await searchPosts("search service", author.id);

		expect(results).toHaveLength(1);
		expect(results[0].content).toContain("Hello from the search service");
		expect(results[0].author?.username).toBe(author.username);
	});

	it("returns an empty list for blank queries", async () => {
		const results = await searchPosts("   ");

		expect(results).toEqual([]);
	});

	it("returns matching users by username or display name", async () => {
		await createTestUser({ username: "alice-search", displayName: "Alice Example" });
		await createTestUser({ username: "bob", displayName: "Search Queen" });

		const byUsername = await searchUsers("alice");
		const byDisplayName = await searchUsers("queen");

		expect(byUsername.some((user) => user.username === "alice-search")).toBe(true);
		expect(byDisplayName.some((user) => user.displayName === "Search Queen")).toBe(true);
	});
});
