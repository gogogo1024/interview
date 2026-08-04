import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { postsHandler } from "../posts.handler";

// Mock the posts service
vi.mock("../../../services/posts.service", () => ({
	createPost: vi.fn(),
	getPost: vi.fn(),
	updatePost: vi.fn(),
	deletePost: vi.fn(),
	getPosts: vi.fn(),
	getUserPosts: vi.fn(),
}));

// Mock the auth middleware
vi.mock("../../../middleware/auth", () => ({
	validateSessionToken: vi.fn(),
}));

import { validateSessionToken } from "../../../middleware/auth";
import {
	createPost,
	deletePost,
	getPost,
	getPosts,
	getUserPosts,
	updatePost,
} from "../../../services/posts.service";

describe("PostsHandler", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.resetAllMocks();
	});

	describe("createPost", () => {
		it("creates a post with valid session token", async () => {
			vi.mocked(validateSessionToken).mockReturnValue({
				userId: "user-123",
				username: "testuser",
				role: "user",
			});

			vi.mocked(createPost).mockResolvedValue({ postId: "post-456" });

			const result = await postsHandler.createPost({
				sessionToken: "valid-token",
				content: "Hello world!",
			});

			expect(result.success).toBe(true);
			expect(result.postId).toBe("post-456");
			expect(createPost).toHaveBeenCalledWith({
				content: "Hello world!",
				authorId: "user-123",
			});
		});

		it("returns error for invalid session token", async () => {
			vi.mocked(validateSessionToken).mockImplementation(() => {
				throw new Error("Invalid or expired session token");
			});

			const result = await postsHandler.createPost({
				sessionToken: "invalid-token",
				content: "Hello world!",
			});

			expect(result.success).toBe(false);
			expect(result.postId).toBe("");
			expect(result.error).toBe("Invalid or expired session token");
		});

		it("returns error when content exceeds limit", async () => {
			vi.mocked(validateSessionToken).mockReturnValue({
				userId: "user-123",
				username: "testuser",
				role: "user",
			});

			vi.mocked(createPost).mockRejectedValue(new Error("Post content exceeds 280 characters"));

			const result = await postsHandler.createPost({
				sessionToken: "valid-token",
				content: "a".repeat(300),
			});

			expect(result.success).toBe(false);
			expect(result.error).toBe("Post content exceeds 280 characters");
		});
	});

	describe("getPost", () => {
		const mockPost = {
			id: "post-123",
			content: "Test post",
			createdAt: new Date("2024-01-15"),
			updatedAt: new Date("2024-01-15"),
			author: {
				id: "user-123",
				username: "testuser",
				displayName: "Test User",
				avatarUrl: null,
			},
			likeCount: 5,
			commentCount: 2,
			isLiked: false,
		};

		it("returns post without authentication", async () => {
			vi.mocked(getPost).mockResolvedValue(mockPost);

			const result = await postsHandler.getPost({
				postId: "post-123",
			});

			expect(result.id).toBe("post-123");
			expect(result.content).toBe("Test post");
			expect(result.author?.username).toBe("testuser");
			expect(result.likeCount).toBe(5);
			expect(getPost).toHaveBeenCalledWith("post-123", undefined);
		});

		it("returns post with isLiked status for authenticated user", async () => {
			vi.mocked(validateSessionToken).mockReturnValue({
				userId: "user-456",
				username: "another",
				role: "user",
			});

			vi.mocked(getPost).mockResolvedValue({ ...mockPost, isLiked: true });

			const result = await postsHandler.getPost({
				postId: "post-123",
				sessionToken: "valid-token",
			});

			expect(result.isLiked).toBe(true);
			expect(getPost).toHaveBeenCalledWith("post-123", "user-456");
		});

		it("ignores invalid token for public access", async () => {
			vi.mocked(validateSessionToken).mockImplementation(() => {
				throw new Error("Invalid token");
			});

			vi.mocked(getPost).mockResolvedValue(mockPost);

			const result = await postsHandler.getPost({
				postId: "post-123",
				sessionToken: "invalid-token",
			});

			expect(result.id).toBe("post-123");
			expect(getPost).toHaveBeenCalledWith("post-123", undefined);
		});
	});

	describe("updatePost", () => {
		it("updates post with valid session token", async () => {
			vi.mocked(validateSessionToken).mockReturnValue({
				userId: "user-123",
				username: "testuser",
				role: "user",
			});

			vi.mocked(updatePost).mockResolvedValue({ success: true });

			const result = await postsHandler.updatePost({
				sessionToken: "valid-token",
				postId: "post-456",
				content: "Updated content",
			});

			expect(result.success).toBe(true);
			expect(updatePost).toHaveBeenCalledWith({
				postId: "post-456",
				content: "Updated content",
				userId: "user-123",
			});
		});

		it("returns error for invalid session token", async () => {
			vi.mocked(validateSessionToken).mockImplementation(() => {
				throw new Error("Invalid or expired session token");
			});

			const result = await postsHandler.updatePost({
				sessionToken: "invalid-token",
				postId: "post-456",
				content: "Updated content",
			});

			expect(result.success).toBe(false);
			expect(result.error).toBe("Invalid or expired session token");
		});

		it("returns error when edit window has passed", async () => {
			vi.mocked(validateSessionToken).mockReturnValue({
				userId: "user-123",
				username: "testuser",
				role: "user",
			});

			vi.mocked(updatePost).mockRejectedValue(new Error("Edit window has passed"));

			const result = await postsHandler.updatePost({
				sessionToken: "valid-token",
				postId: "post-456",
				content: "Updated content",
			});

			expect(result.success).toBe(false);
			expect(result.error).toBe("Edit window has passed");
		});

		it("returns error when user is not the author", async () => {
			vi.mocked(validateSessionToken).mockReturnValue({
				userId: "user-456",
				username: "other",
				role: "user",
			});

			vi.mocked(updatePost).mockRejectedValue(new Error("You can only edit your own posts"));

			const result = await postsHandler.updatePost({
				sessionToken: "valid-token",
				postId: "post-456",
				content: "Updated content",
			});

			expect(result.success).toBe(false);
			expect(result.error).toBe("You can only edit your own posts");
		});
	});

	describe("deletePost", () => {
		it("deletes post with valid session token", async () => {
			vi.mocked(validateSessionToken).mockReturnValue({
				userId: "user-123",
				username: "testuser",
				role: "user",
			});

			vi.mocked(deletePost).mockResolvedValue({ success: true });

			const result = await postsHandler.deletePost({
				sessionToken: "valid-token",
				postId: "post-456",
			});

			expect(result.success).toBe(true);
			expect(deletePost).toHaveBeenCalledWith("post-456", "user-123");
		});

		it("returns error for invalid session token", async () => {
			vi.mocked(validateSessionToken).mockImplementation(() => {
				throw new Error("Invalid or expired session token");
			});

			const result = await postsHandler.deletePost({
				sessionToken: "invalid-token",
				postId: "post-456",
			});

			expect(result.success).toBe(false);
			expect(result.error).toBe("Invalid or expired session token");
		});

		it("returns error when user is not the author", async () => {
			vi.mocked(validateSessionToken).mockReturnValue({
				userId: "user-456",
				username: "other",
				role: "user",
			});

			vi.mocked(deletePost).mockRejectedValue(new Error("You can only delete your own posts"));

			const result = await postsHandler.deletePost({
				sessionToken: "valid-token",
				postId: "post-456",
			});

			expect(result.success).toBe(false);
			expect(result.error).toBe("You can only delete your own posts");
		});
	});

	describe("getPosts", () => {
		const mockPosts = [
			{
				id: "post-1",
				content: "First post",
				createdAt: new Date(),
				updatedAt: new Date(),
				author: { id: "1", username: "user1", displayName: "User 1", avatarUrl: null },
				likeCount: 5,
				commentCount: 2,
				isLiked: false,
			},
			{
				id: "post-2",
				content: "Second post",
				createdAt: new Date(),
				updatedAt: new Date(),
				author: { id: "2", username: "user2", displayName: "User 2", avatarUrl: null },
				likeCount: 10,
				commentCount: 3,
				isLiked: false,
			},
		];

		it("returns posts without authentication", async () => {
			vi.mocked(getPosts).mockResolvedValue(mockPosts);

			const result = await postsHandler.getPosts({});

			expect(result.posts).toHaveLength(2);
			expect(result.posts[0].id).toBe("post-1");
			expect(result.posts[1].id).toBe("post-2");
			expect(getPosts).toHaveBeenCalledWith({
				limit: 20,
				offset: 0,
				userId: undefined,
			});
		});

		it("returns posts with pagination", async () => {
			vi.mocked(getPosts).mockResolvedValue([mockPosts[1]]);

			const result = await postsHandler.getPosts({
				pagination: { limit: 1, offset: 1 },
			});

			expect(result.posts).toHaveLength(1);
			expect(getPosts).toHaveBeenCalledWith({
				limit: 1,
				offset: 1,
				userId: undefined,
			});
		});

		it("returns posts with isLiked for authenticated user", async () => {
			vi.mocked(validateSessionToken).mockReturnValue({
				userId: "user-123",
				username: "testuser",
				role: "user",
			});

			vi.mocked(getPosts).mockResolvedValue(mockPosts.map((p) => ({ ...p, isLiked: true })));

			const result = await postsHandler.getPosts({
				sessionToken: "valid-token",
			});

			expect(result.posts[0].isLiked).toBe(true);
			expect(getPosts).toHaveBeenCalledWith({
				limit: 20,
				offset: 0,
				userId: "user-123",
			});
		});
	});

	describe("getUserPosts", () => {
		const mockPosts = [
			{
				id: "post-1",
				content: "User post",
				createdAt: new Date(),
				updatedAt: new Date(),
				author: { id: "1", username: "testuser", displayName: "Test User", avatarUrl: null },
				likeCount: 5,
				commentCount: 2,
				isLiked: false,
			},
		];

		it("returns posts for a specific user", async () => {
			vi.mocked(getUserPosts).mockResolvedValue(mockPosts);

			const result = await postsHandler.getUserPosts({
				username: "testuser",
			});

			expect(result.posts).toHaveLength(1);
			expect(result.posts[0].author?.username).toBe("testuser");
			expect(getUserPosts).toHaveBeenCalledWith("testuser", undefined);
		});

		it("returns posts with isLiked for authenticated user", async () => {
			vi.mocked(validateSessionToken).mockReturnValue({
				userId: "user-123",
				username: "viewer",
				role: "user",
			});

			vi.mocked(getUserPosts).mockResolvedValue(mockPosts.map((p) => ({ ...p, isLiked: true })));

			const result = await postsHandler.getUserPosts({
				username: "testuser",
				sessionToken: "valid-token",
			});

			expect(result.posts[0].isLiked).toBe(true);
			expect(getUserPosts).toHaveBeenCalledWith("testuser", "user-123");
		});

		it("ignores invalid token for public access", async () => {
			vi.mocked(validateSessionToken).mockImplementation(() => {
				throw new Error("Invalid token");
			});

			vi.mocked(getUserPosts).mockResolvedValue(mockPosts);

			const result = await postsHandler.getUserPosts({
				username: "testuser",
				sessionToken: "invalid-token",
			});

			expect(result.posts).toHaveLength(1);
			expect(getUserPosts).toHaveBeenCalledWith("testuser", undefined);
		});
	});
});
