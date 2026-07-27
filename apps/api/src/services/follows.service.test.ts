import { describe, expect, it } from "vitest";
import { createTestUser } from "../../tests/helpers";
import {
	getFollowerCount,
	getFollowingCount,
	getFollowStatus,
	toggleFollow,
} from "./follows.service";

describe("FollowsService", () => {
	describe("toggleFollow", () => {
		it("follows a user", async () => {
			const follower = await createTestUser();
			const target = await createTestUser();

			const result = await toggleFollow(target.username, follower.id);

			expect(result.following).toBe(true);
		});

		it("unfollows a followed user", async () => {
			const follower = await createTestUser();
			const target = await createTestUser();

			await toggleFollow(target.username, follower.id);
			const result = await toggleFollow(target.username, follower.id);

			expect(result.following).toBe(false);
		});

		it("prevents self-follow", async () => {
			const user = await createTestUser();

			await expect(toggleFollow(user.username, user.id)).rejects.toThrow(
				"You cannot follow yourself",
			);
		});

		it("throws for non-existent user", async () => {
			const follower = await createTestUser();

			await expect(toggleFollow("nonexistent", follower.id)).rejects.toThrow("User not found");
		});
	});

	describe("getFollowStatus", () => {
		it("returns following status for followed user", async () => {
			const follower = await createTestUser();
			const target = await createTestUser();

			await toggleFollow(target.username, follower.id);

			const status = await getFollowStatus(target.username, follower.id);
			expect(status.following).toBe(true);
		});

		it("returns not following for unfollowed user", async () => {
			const follower = await createTestUser();
			const target = await createTestUser();

			const status = await getFollowStatus(target.username, follower.id);
			expect(status.following).toBe(false);
		});

		it("throws for non-existent user", async () => {
			const follower = await createTestUser();

			await expect(getFollowStatus("nonexistent", follower.id)).rejects.toThrow("User not found");
		});
	});

	describe("getFollowerCount", () => {
		it("returns correct follower count", async () => {
			const target = await createTestUser();
			const follower1 = await createTestUser();
			const follower2 = await createTestUser();

			await toggleFollow(target.username, follower1.id);
			await toggleFollow(target.username, follower2.id);

			const result = await getFollowerCount(target.username);
			expect(result.count).toBe(2);
		});

		it("returns zero for user with no followers", async () => {
			const user = await createTestUser();

			const result = await getFollowerCount(user.username);
			expect(result.count).toBe(0);
		});

		it("throws for non-existent user", async () => {
			await expect(getFollowerCount("nonexistent")).rejects.toThrow("User not found");
		});
	});

	describe("getFollowingCount", () => {
		it("returns correct following count", async () => {
			const follower = await createTestUser();
			const target1 = await createTestUser();
			const target2 = await createTestUser();

			await toggleFollow(target1.username, follower.id);
			await toggleFollow(target2.username, follower.id);

			const result = await getFollowingCount(follower.username);
			expect(result.count).toBe(2);
		});

		it("returns zero for user following no one", async () => {
			const user = await createTestUser();

			const result = await getFollowingCount(user.username);
			expect(result.count).toBe(0);
		});

		it("throws for non-existent user", async () => {
			await expect(getFollowingCount("nonexistent")).rejects.toThrow("User not found");
		});
	});
});
