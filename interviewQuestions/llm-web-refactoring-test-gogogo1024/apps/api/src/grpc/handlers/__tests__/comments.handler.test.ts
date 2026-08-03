import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { commentsHandler } from "../comments.handler";

// Mock the comments service
vi.mock("../../../services/comments.service", () => ({
	createComment: vi.fn(),
	getPostComments: vi.fn(),
	deleteComment: vi.fn(),
}));

// Mock the auth middleware
vi.mock("../../../middleware/auth", () => ({
	validateSessionToken: vi.fn(),
}));

import { validateSessionToken } from "../../../middleware/auth";
import { createComment, deleteComment, getPostComments } from "../../../services/comments.service";

describe("CommentsHandler", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.resetAllMocks();
	});

	describe("createComment", () => {
		it("creates a comment with valid session token", async () => {
			vi.mocked(validateSessionToken).mockReturnValue({
				userId: "user-123",
				username: "testuser",
				role: "user",
			});

			vi.mocked(createComment).mockResolvedValue({ commentId: "comment-456" });

			const result = await commentsHandler.createComment({
				sessionToken: "valid-token",
				postId: "post-123",
				content: "Great post!",
			});

			expect(result.success).toBe(true);
			expect(result.commentId).toBe("comment-456");
			expect(createComment).toHaveBeenCalledWith({
				postId: "post-123",
				content: "Great post!",
				authorId: "user-123",
				parentId: undefined,
			});
		});

		it("creates a reply to another comment", async () => {
			vi.mocked(validateSessionToken).mockReturnValue({
				userId: "user-123",
				username: "testuser",
				role: "user",
			});

			vi.mocked(createComment).mockResolvedValue({ commentId: "comment-789" });

			const result = await commentsHandler.createComment({
				sessionToken: "valid-token",
				postId: "post-123",
				content: "Thanks!",
				parentId: "comment-456",
			});

			expect(result.success).toBe(true);
			expect(createComment).toHaveBeenCalledWith({
				postId: "post-123",
				content: "Thanks!",
				authorId: "user-123",
				parentId: "comment-456",
			});
		});

		it("returns error for invalid session token", async () => {
			vi.mocked(validateSessionToken).mockImplementation(() => {
				throw new Error("Invalid or expired session token");
			});

			const result = await commentsHandler.createComment({
				sessionToken: "invalid-token",
				postId: "post-123",
				content: "Great post!",
			});

			expect(result.success).toBe(false);
			expect(result.commentId).toBe("");
			expect(result.error).toBe("Invalid or expired session token");
		});

		it("returns error when post not found", async () => {
			vi.mocked(validateSessionToken).mockReturnValue({
				userId: "user-123",
				username: "testuser",
				role: "user",
			});

			vi.mocked(createComment).mockRejectedValue(new Error("Post not found"));

			const result = await commentsHandler.createComment({
				sessionToken: "valid-token",
				postId: "non-existent",
				content: "Great post!",
			});

			expect(result.success).toBe(false);
			expect(result.error).toBe("Post not found");
		});
	});

	describe("getPostComments", () => {
		const mockComments = [
			{
				id: "comment-1",
				content: "First comment",
				createdAt: new Date(),
				parentId: null,
				author: { id: "user-1", username: "user1", displayName: "User 1", avatarUrl: null },
				likeCount: 5,
				isLiked: false,
				replies: [],
			},
			{
				id: "comment-2",
				content: "Second comment",
				createdAt: new Date(),
				parentId: null,
				author: { id: "user-2", username: "user2", displayName: "User 2", avatarUrl: null },
				likeCount: 3,
				isLiked: false,
				replies: [
					{
						id: "comment-3",
						content: "Reply",
						createdAt: new Date(),
						parentId: "comment-2",
						author: { id: "user-1", username: "user1", displayName: "User 1", avatarUrl: null },
						likeCount: 1,
						isLiked: false,
						replies: [],
					},
				],
			},
		];

		it("returns comments without authentication", async () => {
			vi.mocked(getPostComments).mockResolvedValue(mockComments);

			const result = await commentsHandler.getPostComments({
				postId: "post-123",
			});

			expect(result.comments).toHaveLength(2);
			expect(result.comments[0].content).toBe("First comment");
			expect(result.comments[1].replies).toHaveLength(1);
			expect(getPostComments).toHaveBeenCalledWith("post-123", undefined);
		});

		it("returns comments with isLiked for authenticated user", async () => {
			vi.mocked(validateSessionToken).mockReturnValue({
				userId: "user-123",
				username: "testuser",
				role: "user",
			});

			vi.mocked(getPostComments).mockResolvedValue(
				mockComments.map((c) => ({ ...c, isLiked: true })),
			);

			const result = await commentsHandler.getPostComments({
				postId: "post-123",
				sessionToken: "valid-token",
			});

			expect(result.comments[0].isLiked).toBe(true);
			expect(getPostComments).toHaveBeenCalledWith("post-123", "user-123");
		});

		it("ignores invalid token for public access", async () => {
			vi.mocked(validateSessionToken).mockImplementation(() => {
				throw new Error("Invalid token");
			});

			vi.mocked(getPostComments).mockResolvedValue(mockComments);

			const result = await commentsHandler.getPostComments({
				postId: "post-123",
				sessionToken: "invalid-token",
			});

			expect(result.comments).toHaveLength(2);
			expect(getPostComments).toHaveBeenCalledWith("post-123", undefined);
		});
	});

	describe("deleteComment", () => {
		it("deletes comment with valid session token", async () => {
			vi.mocked(validateSessionToken).mockReturnValue({
				userId: "user-123",
				username: "testuser",
				role: "user",
			});

			vi.mocked(deleteComment).mockResolvedValue({ success: true });

			const result = await commentsHandler.deleteComment({
				sessionToken: "valid-token",
				commentId: "comment-456",
			});

			expect(result.success).toBe(true);
			expect(deleteComment).toHaveBeenCalledWith("comment-456", "user-123");
		});

		it("returns error for invalid session token", async () => {
			vi.mocked(validateSessionToken).mockImplementation(() => {
				throw new Error("Invalid or expired session token");
			});

			const result = await commentsHandler.deleteComment({
				sessionToken: "invalid-token",
				commentId: "comment-456",
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

			vi.mocked(deleteComment).mockRejectedValue(
				new Error("You can only delete your own comments"),
			);

			const result = await commentsHandler.deleteComment({
				sessionToken: "valid-token",
				commentId: "comment-456",
			});

			expect(result.success).toBe(false);
			expect(result.error).toBe("You can only delete your own comments");
		});
	});
});
