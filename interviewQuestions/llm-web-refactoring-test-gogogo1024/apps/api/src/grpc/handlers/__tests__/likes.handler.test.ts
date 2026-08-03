import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { likesHandler } from "../likes.handler";

// Mock the likes service
vi.mock("../../../services/likes.service", () => ({
	togglePostLike: vi.fn(),
	toggleCommentLike: vi.fn(),
	getPostLikeStatus: vi.fn(),
	getCommentLikeStatus: vi.fn(),
}));

// Mock the auth middleware
vi.mock("../../../middleware/auth", () => ({
	validateSessionToken: vi.fn(),
}));

import { validateSessionToken } from "../../../middleware/auth";
import {
	getCommentLikeStatus,
	getPostLikeStatus,
	toggleCommentLike,
	togglePostLike,
} from "../../../services/likes.service";

describe("LikesHandler", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.resetAllMocks();
	});

	describe("togglePostLike", () => {
		it("likes a post with valid session token", async () => {
			vi.mocked(validateSessionToken).mockReturnValue({
				userId: "user-123",
				username: "testuser",
				role: "user",
			});

			vi.mocked(togglePostLike).mockResolvedValue({ liked: true });

			const result = await likesHandler.togglePostLike({
				sessionToken: "valid-token",
				postId: "post-456",
			});

			expect(result.success).toBe(true);
			expect(result.liked).toBe(true);
			expect(togglePostLike).toHaveBeenCalledWith("post-456", "user-123");
		});

		it("unlikes a post", async () => {
			vi.mocked(validateSessionToken).mockReturnValue({
				userId: "user-123",
				username: "testuser",
				role: "user",
			});

			vi.mocked(togglePostLike).mockResolvedValue({ liked: false });

			const result = await likesHandler.togglePostLike({
				sessionToken: "valid-token",
				postId: "post-456",
			});

			expect(result.success).toBe(true);
			expect(result.liked).toBe(false);
		});

		it("returns error for invalid session token", async () => {
			vi.mocked(validateSessionToken).mockImplementation(() => {
				throw new Error("Invalid or expired session token");
			});

			const result = await likesHandler.togglePostLike({
				sessionToken: "invalid-token",
				postId: "post-456",
			});

			expect(result.success).toBe(false);
			expect(result.liked).toBe(false);
			expect(result.error).toBe("Invalid or expired session token");
		});

		it("returns error when post not found", async () => {
			vi.mocked(validateSessionToken).mockReturnValue({
				userId: "user-123",
				username: "testuser",
				role: "user",
			});

			vi.mocked(togglePostLike).mockRejectedValue(new Error("Post not found"));

			const result = await likesHandler.togglePostLike({
				sessionToken: "valid-token",
				postId: "non-existent",
			});

			expect(result.success).toBe(false);
			expect(result.error).toBe("Post not found");
		});
	});

	describe("toggleCommentLike", () => {
		it("likes a comment with valid session token", async () => {
			vi.mocked(validateSessionToken).mockReturnValue({
				userId: "user-123",
				username: "testuser",
				role: "user",
			});

			vi.mocked(toggleCommentLike).mockResolvedValue({ liked: true });

			const result = await likesHandler.toggleCommentLike({
				sessionToken: "valid-token",
				commentId: "comment-456",
			});

			expect(result.success).toBe(true);
			expect(result.liked).toBe(true);
			expect(toggleCommentLike).toHaveBeenCalledWith("comment-456", "user-123");
		});

		it("unlikes a comment", async () => {
			vi.mocked(validateSessionToken).mockReturnValue({
				userId: "user-123",
				username: "testuser",
				role: "user",
			});

			vi.mocked(toggleCommentLike).mockResolvedValue({ liked: false });

			const result = await likesHandler.toggleCommentLike({
				sessionToken: "valid-token",
				commentId: "comment-456",
			});

			expect(result.success).toBe(true);
			expect(result.liked).toBe(false);
		});

		it("returns error for invalid session token", async () => {
			vi.mocked(validateSessionToken).mockImplementation(() => {
				throw new Error("Invalid or expired session token");
			});

			const result = await likesHandler.toggleCommentLike({
				sessionToken: "invalid-token",
				commentId: "comment-456",
			});

			expect(result.success).toBe(false);
			expect(result.liked).toBe(false);
			expect(result.error).toBe("Invalid or expired session token");
		});
	});

	describe("getPostLikeStatus", () => {
		it("returns liked status for valid session", async () => {
			vi.mocked(validateSessionToken).mockReturnValue({
				userId: "user-123",
				username: "testuser",
				role: "user",
			});

			vi.mocked(getPostLikeStatus).mockResolvedValue({ liked: true });

			const result = await likesHandler.getPostLikeStatus({
				sessionToken: "valid-token",
				postId: "post-456",
			});

			expect(result.liked).toBe(true);
			expect(getPostLikeStatus).toHaveBeenCalledWith("post-456", "user-123");
		});

		it("returns not liked when post is not liked", async () => {
			vi.mocked(validateSessionToken).mockReturnValue({
				userId: "user-123",
				username: "testuser",
				role: "user",
			});

			vi.mocked(getPostLikeStatus).mockResolvedValue({ liked: false });

			const result = await likesHandler.getPostLikeStatus({
				sessionToken: "valid-token",
				postId: "post-456",
			});

			expect(result.liked).toBe(false);
		});

		it("returns false for invalid token", async () => {
			vi.mocked(validateSessionToken).mockImplementation(() => {
				throw new Error("Invalid token");
			});

			const result = await likesHandler.getPostLikeStatus({
				sessionToken: "invalid-token",
				postId: "post-456",
			});

			expect(result.liked).toBe(false);
		});
	});

	describe("getCommentLikeStatus", () => {
		it("returns liked status for valid session", async () => {
			vi.mocked(validateSessionToken).mockReturnValue({
				userId: "user-123",
				username: "testuser",
				role: "user",
			});

			vi.mocked(getCommentLikeStatus).mockResolvedValue({ liked: true });

			const result = await likesHandler.getCommentLikeStatus({
				sessionToken: "valid-token",
				commentId: "comment-456",
			});

			expect(result.liked).toBe(true);
			expect(getCommentLikeStatus).toHaveBeenCalledWith("comment-456", "user-123");
		});

		it("returns false for invalid token", async () => {
			vi.mocked(validateSessionToken).mockImplementation(() => {
				throw new Error("Invalid token");
			});

			const result = await likesHandler.getCommentLikeStatus({
				sessionToken: "invalid-token",
				commentId: "comment-456",
			});

			expect(result.liked).toBe(false);
		});
	});
});
