import type { CommentResponse, ICommentsService } from "@chirp/proto";
import { validateSessionToken } from "../../middleware/auth";
import { createComment, deleteComment, getPostComments } from "../../services/comments.service";
import { toProtoTimestamp } from "../../services/utils";

function toCommentResponse(comment: any): CommentResponse {
	return {
		id: comment.id,
		content: comment.content,
		createdAt: toProtoTimestamp(comment.createdAt),
		parentId: comment.parentId || undefined,
		author: comment.author
			? {
					id: comment.author.id || "",
					username: comment.author.username || "",
					displayName: comment.author.displayName || "",
					avatarUrl: comment.author.avatarUrl || undefined,
				}
			: { id: "", username: "", displayName: "" },
		likeCount: comment.likeCount || 0,
		isLiked: comment.isLiked || false,
		replies: (comment.replies || []).map(toCommentResponse),
	};
}

export const commentsHandler: ICommentsService = {
	async createComment(request) {
		try {
			const auth = validateSessionToken(request.sessionToken);
			const result = await createComment({
				postId: request.postId,
				content: request.content,
				authorId: auth.userId,
				parentId: request.parentId || undefined,
			});

			return {
				success: true,
				commentId: result.commentId,
			};
		} catch (error) {
			return {
				success: false,
				commentId: "",
				error: error instanceof Error ? error.message : "Failed to create comment",
			};
		}
	},

	async getPostComments(request) {
		let userId: string | undefined;
		if (request.sessionToken) {
			try {
				const auth = validateSessionToken(request.sessionToken);
				userId = auth.userId;
			} catch {
				// Ignore invalid token for public access
			}
		}

		const comments = await getPostComments(request.postId, userId);

		return {
			comments: comments.map(toCommentResponse),
		};
	},

	async deleteComment(request) {
		try {
			const auth = validateSessionToken(request.sessionToken);
			await deleteComment(request.commentId, auth.userId);

			return { success: true };
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : "Failed to delete comment",
			};
		}
	},
};
