import { describe, expect, it } from "vitest";
import { createTestComment, createTestPost, createTestUser } from "../../tests/helpers";
import { createComment, deleteComment, getPostComments } from "./comments.service";

describe("CommentsService", () => {
	describe("createComment", () => {
		it("creates a comment on a post", async () => {
			const user = await createTestUser();
			const postId = await createTestPost(user.id, "Test post");

			const result = await createComment({
				postId,
				content: "Great post!",
				authorId: user.id,
			});

			expect(result.commentId).toBeDefined();
		});

		it("rejects empty content", async () => {
			const user = await createTestUser();
			const postId = await createTestPost(user.id, "Test post");

			await expect(
				createComment({
					postId,
					content: "",
					authorId: user.id,
				}),
			).rejects.toThrow("Comment content is required");
		});

		it("rejects comment on non-existent post", async () => {
			const user = await createTestUser();

			await expect(
				createComment({
					postId: "nonexistent",
					content: "Comment",
					authorId: user.id,
				}),
			).rejects.toThrow("Post not found");
		});

		it("creates a reply to a comment", async () => {
			const user = await createTestUser();
			const postId = await createTestPost(user.id, "Test post");
			const parentId = await createTestComment(postId, user.id, "Parent comment");

			const result = await createComment({
				postId,
				content: "Reply to parent",
				authorId: user.id,
				parentId,
			});

			expect(result.commentId).toBeDefined();
		});

		it("rejects nested replies (only one level allowed)", async () => {
			const user = await createTestUser();
			const postId = await createTestPost(user.id, "Test post");
			const parentId = await createTestComment(postId, user.id, "Parent comment");

			// Create a reply
			const { commentId: replyId } = await createComment({
				postId,
				content: "First reply",
				authorId: user.id,
				parentId,
			});

			// Try to reply to the reply
			await expect(
				createComment({
					postId,
					content: "Nested reply",
					authorId: user.id,
					parentId: replyId,
				}),
			).rejects.toThrow("Cannot reply to a reply");
		});

		it("rejects reply to non-existent parent", async () => {
			const user = await createTestUser();
			const postId = await createTestPost(user.id, "Test post");

			await expect(
				createComment({
					postId,
					content: "Reply",
					authorId: user.id,
					parentId: "nonexistent",
				}),
			).rejects.toThrow("Parent comment not found");
		});
	});

	describe("getPostComments", () => {
		it("returns comments with author info", async () => {
			const user = await createTestUser();
			const postId = await createTestPost(user.id, "Test post");
			await createTestComment(postId, user.id, "Comment 1");
			await createTestComment(postId, user.id, "Comment 2");

			const comments = await getPostComments(postId);

			expect(comments).toHaveLength(2);
			expect(comments[0].author).toBeDefined();
			expect(comments[0].likeCount).toBeDefined();
		});

		it("returns comments with replies nested", async () => {
			const user = await createTestUser();
			const postId = await createTestPost(user.id, "Test post");
			const parentId = await createTestComment(postId, user.id, "Parent");

			await createComment({
				postId,
				content: "Reply 1",
				authorId: user.id,
				parentId,
			});

			const comments = await getPostComments(postId);

			expect(comments).toHaveLength(1);
			expect(comments[0].replies).toHaveLength(1);
			expect(comments[0].replies[0].content).toBe("Reply 1");
		});
	});

	describe("deleteComment", () => {
		it("deletes own comment", async () => {
			const user = await createTestUser();
			const postId = await createTestPost(user.id, "Test post");
			const commentId = await createTestComment(postId, user.id, "To delete");

			const result = await deleteComment(commentId, user.id);

			expect(result.success).toBe(true);

			const comments = await getPostComments(postId);
			expect(comments).toHaveLength(0);
		});

		it("rejects deletion by non-author", async () => {
			const author = await createTestUser();
			const otherUser = await createTestUser();
			const postId = await createTestPost(author.id, "Test post");
			const commentId = await createTestComment(postId, author.id, "Comment");

			await expect(deleteComment(commentId, otherUser.id)).rejects.toThrow(
				"You can only delete your own comments",
			);
		});

		it("throws for non-existent comment", async () => {
			const user = await createTestUser();

			await expect(deleteComment("nonexistent", user.id)).rejects.toThrow("Comment not found");
		});
	});
});
