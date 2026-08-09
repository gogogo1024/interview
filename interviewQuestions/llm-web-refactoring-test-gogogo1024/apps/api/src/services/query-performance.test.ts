import { describe, expect, it } from "vitest";
import { createTestFollow, createTestPost, createTestUser } from "../../tests/helpers";
import { getBookmarkedPosts, toggleBookmark } from "./bookmarks.service";
import { getHomeFeed } from "./feed.service";
import { getUser } from "./users.service";

/**
 * These tests assert the number of SQL statements executed for common read
 * operations to prevent regressions that re-introduce N+1 query patterns.
 *
 * Expected (optimized) query counts per operation:
 * - getHomeFeed (10 posts): 5 queries
 *   1) fetch following ids
 *   2) fetch posts (+ join users)
 *   3) like counts (grouped)
 *   4) comment counts (grouped)
 *   5) liked-by-requester (optional single query)
 *
 * - getUser (profile): 5 queries (user select + follower/following/post counts + isFollowing check)
 * - getBookmarkedPosts (10 bookmarks): 5 queries (bookmarks select, posts select, + 3 counts queries)
 */

describe("Query performance (N+1 guards)", () => {
	it("getHomeFeed executes expected number of queries (10 posts)", async () => {
		const current = await createTestUser();

		// Create 10 authors, have current follow them, and each create one post
		for (let i = 0; i < 10; i++) {
			const author = await createTestUser();
			await createTestFollow(current.id, author.id);
			await createTestPost(author.id, `post-${i}`);
		}

		const dbMod = (await import("../db")) as unknown as {
			client: { execute: (...args: unknown[]) => Promise<unknown> };
		};
		const client = dbMod.client;
		const orig = client.execute.bind(client);
		let sqlCount = 0;
		(client as { execute: (...args: unknown[]) => Promise<unknown> }).execute = async (
			...args: unknown[]
		) => {
			sqlCount++;
			return orig(...args);
		};

		const feed = await getHomeFeed(current.id, { limit: 10 });
		expect(feed.length).toBe(10);
		expect(sqlCount).toBe(5);

		(client as { execute: (...args: unknown[]) => Promise<unknown> }).execute = orig;
	});

	it("getUser (profile) executes expected number of queries", async () => {
		const target = await createTestUser();
		const follower = await createTestUser();
		const other1 = await createTestUser();
		const other2 = await createTestUser();

		// followers
		await createTestFollow(follower.id, target.id);
		await createTestFollow(other1.id, target.id);

		// following
		await createTestFollow(target.id, other2.id);

		// some posts
		await createTestPost(target.id, "p1");
		await createTestPost(target.id, "p2");

		const dbMod = (await import("../db")) as unknown as {
			client: { execute: (...args: unknown[]) => Promise<unknown> };
		};
		const client = dbMod.client;
		const orig = client.execute.bind(client);
		let sqlCount = 0;
		(client as { execute: (...args: unknown[]) => Promise<unknown> }).execute = async (
			...args: unknown[]
		) => {
			sqlCount++;
			return orig(...args);
		};

		const profile = await getUser(target.username, follower.id);
		expect(profile).toBeDefined();
		// user select + follower count + following count + post count + isFollowing check
		expect(sqlCount).toBe(5);

		(client as { execute: (...args: unknown[]) => Promise<unknown> }).execute = orig;
	});

	it("getBookmarkedPosts executes expected number of queries (10 bookmarks)", async () => {
		const current = await createTestUser();

		// create 10 posts and bookmark them
		for (let i = 0; i < 10; i++) {
			const author = await createTestUser();
			const postId = await createTestPost(author.id, `bm-${i}`);
			await toggleBookmark(postId, current.id);
		}

		const dbMod = (await import("../db")) as unknown as {
			client: { execute: (...args: unknown[]) => Promise<unknown> };
		};
		const client = dbMod.client;
		const orig = client.execute.bind(client);
		let sqlCount = 0;
		(client as { execute: (...args: unknown[]) => Promise<unknown> }).execute = async (
			...args: unknown[]
		) => {
			sqlCount++;
			return orig(...args);
		};

		const bookmarks = await getBookmarkedPosts(current.id, current.id, 10, 0);
		expect(bookmarks.length).toBe(10);
		expect(sqlCount).toBe(5);

		(client as { execute: (...args: unknown[]) => Promise<unknown> }).execute = orig;
	});
});
