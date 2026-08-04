import { describe, expect, it } from "vitest";
import { createTestLike, createTestPost, createTestUser } from "../../tests/helpers";
import {
	createPost,
	deletePost,
	getPost,
	getPosts,
	getUserPosts,
	updatePost,
} from "./posts.service";

describe("PostsService", () => {
	describe("createPost", () => {
		it("creates a post with valid content", async () => {
			const user = await createTestUser();

			const result = await createPost({
				content: "Hello, world!",
				authorId: user.id,
			});

			expect(result.postId).toBeDefined();
		});

		it("rejects empty content", async () => {
			const user = await createTestUser();

			await expect(
				createPost({
					content: "",
					authorId: user.id,
				}),
			).rejects.toThrow("Post content is required");
		});

		it("rejects content over 280 characters", async () => {
			const user = await createTestUser();
			const longContent = "a".repeat(281);

			await expect(
				createPost({
					content: longContent,
					authorId: user.id,
				}),
			).rejects.toThrow("Post content must be 280 characters or less");
		});

		it("allows exactly 280 characters", async () => {
			const user = await createTestUser();
			const maxContent = "a".repeat(280);

			const result = await createPost({
				content: maxContent,
				authorId: user.id,
			});

			expect(result.postId).toBeDefined();
		});
	});

	describe("getPost", () => {
		it("returns post with author and counts", async () => {
			const user = await createTestUser();
			const postId = await createTestPost(user.id, "Test content");

			const post = await getPost(postId);

			expect(post.id).toBe(postId);
			expect(post.content).toBe("Test content");
			expect(post.author?.username).toBe(user.username);
			expect(post.likeCount).toBe(0);
			expect(post.commentCount).toBe(0);
			expect(post.isLiked).toBe(false);
		});

		it("shows correct like status for user", async () => {
			const author = await createTestUser();
			const liker = await createTestUser();
			const postId = await createTestPost(author.id, "Test content");
			await createTestLike(liker.id, postId);

			const postForLiker = await getPost(postId, liker.id);
			expect(postForLiker.isLiked).toBe(true);
			expect(postForLiker.likeCount).toBe(1);

			const postForOther = await getPost(postId, author.id);
			expect(postForOther.isLiked).toBe(false);
		});

		it("throws for non-existent post", async () => {
			await expect(getPost("nonexistent")).rejects.toThrow("Post not found");
		});
	});

	describe("updatePost", () => {
		it("updates post content within edit window", async () => {
			const user = await createTestUser();
			const postId = await createTestPost(user.id, "Original content");

			const result = await updatePost({
				postId,
				content: "Updated content",
				userId: user.id,
			});

			expect(result.success).toBe(true);

			const post = await getPost(postId);
			expect(post.content).toBe("Updated content");
		});

		it("rejects update by non-author", async () => {
			const author = await createTestUser();
			const otherUser = await createTestUser();
			const postId = await createTestPost(author.id, "Original content");

			await expect(
				updatePost({
					postId,
					content: "Hacked content",
					userId: otherUser.id,
				}),
			).rejects.toThrow("You can only edit your own posts");
		});

		it("rejects empty content", async () => {
			const user = await createTestUser();
			const postId = await createTestPost(user.id, "Original content");

			await expect(
				updatePost({
					postId,
					content: "",
					userId: user.id,
				}),
			).rejects.toThrow("Post content is required");
		});

		it("rejects content over 280 characters", async () => {
			const user = await createTestUser();
			const postId = await createTestPost(user.id, "Original content");

			await expect(
				updatePost({
					postId,
					content: "a".repeat(281),
					userId: user.id,
				}),
			).rejects.toThrow("Post content must be 280 characters or less");
		});
	});

	describe("deletePost", () => {
		it("deletes own post", async () => {
			const user = await createTestUser();
			const postId = await createTestPost(user.id, "To be deleted");

			const result = await deletePost(postId, user.id);
			expect(result.success).toBe(true);

			await expect(getPost(postId)).rejects.toThrow("Post not found");
		});

		it("rejects deletion by non-author", async () => {
			const author = await createTestUser();
			const otherUser = await createTestUser();
			const postId = await createTestPost(author.id, "Protected content");

			await expect(deletePost(postId, otherUser.id)).rejects.toThrow(
				"You can only delete your own posts",
			);
		});

		it("throws for non-existent post", async () => {
			const user = await createTestUser();

			await expect(deletePost("nonexistent", user.id)).rejects.toThrow("Post not found");
		});
	});

	describe("getPosts", () => {
		it("returns paginated posts with correct structure", async () => {
			const user = await createTestUser();
			await createTestPost(user.id, "Post 1");
			await createTestPost(user.id, "Post 2");
			await createTestPost(user.id, "Post 3");

			const posts = await getPosts({ limit: 2 });

			expect(posts).toHaveLength(2);
			// Verify structure
			expect(posts[0].content).toBeDefined();
			expect(posts[0].author).toBeDefined();
			expect(posts[0].likeCount).toBeDefined();
			expect(posts[0].commentCount).toBeDefined();
		});

		it("supports offset pagination", async () => {
			const user = await createTestUser();
			await createTestPost(user.id, "Post 1");
			await createTestPost(user.id, "Post 2");
			await createTestPost(user.id, "Post 3");

			const allPosts = await getPosts({ limit: 10 });
			const offsetPosts = await getPosts({ limit: 2, offset: 2 });

			expect(allPosts).toHaveLength(3);
			expect(offsetPosts).toHaveLength(1);
		});
	});

	describe("getUserPosts", () => {
		it("returns posts for specific user", async () => {
			const user1 = await createTestUser();
			const user2 = await createTestUser();
			await createTestPost(user1.id, "User 1 post");
			await createTestPost(user2.id, "User 2 post");

			const posts = await getUserPosts(user1.username);

			expect(posts).toHaveLength(1);
			expect(posts[0].content).toBe("User 1 post");
		});

		it("throws for non-existent user", async () => {
			await expect(getUserPosts("nonexistent")).rejects.toThrow("User not found");
		});
	});
});
