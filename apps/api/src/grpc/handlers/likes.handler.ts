import type { ILikesService } from "@chirp/proto";
import { validateSessionToken } from "../../middleware/auth";
import {
	getCommentLikeStatus,
	getPostLikeStatus,
	toggleCommentLike,
	togglePostLike,
} from "../../services/likes.service";

export const likesHandler: ILikesService = {
	async togglePostLike(request) {
		try {
			const auth = validateSessionToken(request.sessionToken);
			const result = await togglePostLike(request.postId, auth.userId);

			return {
				success: true,
				liked: result.liked,
			};
		} catch (error) {
			return {
				success: false,
				liked: false,
				error: error instanceof Error ? error.message : "Failed to toggle like",
			};
		}
	},

	async toggleCommentLike(request) {
		try {
			const auth = validateSessionToken(request.sessionToken);
			const result = await toggleCommentLike(request.commentId, auth.userId);

			return {
				success: true,
				liked: result.liked,
			};
		} catch (error) {
			return {
				success: false,
				liked: false,
				error: error instanceof Error ? error.message : "Failed to toggle like",
			};
		}
	},

	async getPostLikeStatus(request) {
		try {
			const auth = validateSessionToken(request.sessionToken);
			const result = await getPostLikeStatus(request.postId, auth.userId);

			return { liked: result.liked };
		} catch {
			return { liked: false };
		}
	},

	async getCommentLikeStatus(request) {
		try {
			const auth = validateSessionToken(request.sessionToken);
			const result = await getCommentLikeStatus(request.commentId, auth.userId);

			return { liked: result.liked };
		} catch {
			return { liked: false };
		}
	},
};
