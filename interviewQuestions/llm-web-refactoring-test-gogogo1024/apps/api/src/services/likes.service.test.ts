import { describe, expect, it } from "vitest";
import { createTestComment, createTestPost, createTestUser } from "../../tests/helpers";
import {
	getCommentLikeStatus,
	getPostLikeStatus,
	toggleCommentLike,
	togglePostLike,
} from "./likes.service";

describe("LikesService", () => {
	describe("togglePostLike", () => {
		it("likes a post", async () => {
			const author = await createTestUser();
			const liker = await createTestUser();
			const postId = await createTestPost(author.id, "Test post");

			const result = await togglePostLike(postId, liker.id);

			expect(result.liked).toBe(true);
		});

		it("unlikes a liked post", async () => {
			const author = await createTestUser();
			const liker = await createTestUser();
			const postId = await createTestPost(author.id, "Test post");

			// Like first
			await togglePostLike(postId, liker.id);

			// Unlike
			const result = await togglePostLike(postId, liker.id);

			expect(result.liked).toBe(false);
		});

		it("toggles like multiple times", async () => {
			const author = await createTestUser();
			const liker = await createTestUser();
			const postId = await createTestPost(author.id, "Test post");

			const result1 = await togglePostLike(postId, liker.id);
			expect(result1.liked).toBe(true);

			const result2 = await togglePostLike(postId, liker.id);
			expect(result2.liked).toBe(false);

			const result3 = await togglePostLike(postId, liker.id);
			expect(result3.liked).toBe(true);
		});

		it("throws for non-existent post", async () => {
			const user = await createTestUser();

			await expect(togglePostLike("nonexistent", user.id)).rejects.toThrow("Post not found");
		});
	});

	describe("toggleCommentLike", () => {
		it("likes a comment", async () => {
			const author = await createTestUser();
			const liker = await createTestUser();
			const postId = await createTestPost(author.id, "Test post");
			const commentId = await createTestComment(postId, author.id, "Comment");

			const result = await toggleCommentLike(commentId, liker.id);

			expect(result.liked).toBe(true);
		});

		it("unlikes a liked comment", async () => {
			const author = await createTestUser();
			const liker = await createTestUser();
			const postId = await createTestPost(author.id, "Test post");
			const commentId = await createTestComment(postId, author.id, "Comment");

			await toggleCommentLike(commentId, liker.id);
			const result = await toggleCommentLike(commentId, liker.id);

			expect(result.liked).toBe(false);
		});

		it("throws for non-existent comment", async () => {
			const user = await createTestUser();

			await expect(toggleCommentLike("nonexistent", user.id)).rejects.toThrow("Comment not found");
		});
	});

	describe("getPostLikeStatus", () => {
		it("returns liked status for liked post", async () => {
			const author = await createTestUser();
			const liker = await createTestUser();
			const postId = await createTestPost(author.id, "Test post");

			await togglePostLike(postId, liker.id);

			const status = await getPostLikeStatus(postId, liker.id);
			expect(status.liked).toBe(true);
		});

		it("returns not liked for unliked post", async () => {
			const author = await createTestUser();
			const user = await createTestUser();
			const postId = await createTestPost(author.id, "Test post");

			const status = await getPostLikeStatus(postId, user.id);
			expect(status.liked).toBe(false);
		});
	});

	describe("getCommentLikeStatus", () => {
		it("returns liked status for liked comment", async () => {
			const author = await createTestUser();
			const liker = await createTestUser();
			const postId = await createTestPost(author.id, "Test post");
			const commentId = await createTestComment(postId, author.id, "Comment");

			await toggleCommentLike(commentId, liker.id);

			const status = await getCommentLikeStatus(commentId, liker.id);
			expect(status.liked).toBe(true);
		});

		it("returns not liked for unliked comment", async () => {
			const author = await createTestUser();
			const user = await createTestUser();
			const postId = await createTestPost(author.id, "Test post");
			const commentId = await createTestComment(postId, author.id, "Comment");

			const status = await getCommentLikeStatus(commentId, user.id);
			expect(status.liked).toBe(false);
		});
	});
});
