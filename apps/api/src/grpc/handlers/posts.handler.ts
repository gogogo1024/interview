import type { IPostsService, PostResponse } from "@chirp/proto";
import { validateSessionToken } from "../../middleware/auth";
import {
	createPost,
	deletePost,
	getPost,
	getPosts,
	getUserPosts,
	updatePost,
} from "../../services/posts.service";
import { toProtoTimestamp } from "../../services/utils";

function toPostResponse(post: any): PostResponse {
	return {
		id: post.id,
		content: post.content,
		createdAt: toProtoTimestamp(post.createdAt),
		updatedAt: toProtoTimestamp(post.updatedAt),
		author: post.author
			? {
					id: post.author.id || "",
					username: post.author.username || "",
					displayName: post.author.displayName || "",
					avatarUrl: post.author.avatarUrl || undefined,
				}
			: { id: "", username: "", displayName: "" },
		likeCount: post.likeCount || 0,
		commentCount: post.commentCount || 0,
		isLiked: post.isLiked || false,
	};
}

export const postsHandler: IPostsService = {
	async createPost(request) {
		try {
			const auth = validateSessionToken(request.sessionToken);
			const result = await createPost({
				content: request.content,
				authorId: auth.userId,
			});

			return {
				success: true,
				postId: result.postId,
			};
		} catch (error) {
			return {
				success: false,
				postId: "",
				error: error instanceof Error ? error.message : "Failed to create post",
			};
		}
	},

	async getPost(request) {
		let userId: string | undefined;
		if (request.sessionToken) {
			try {
				const auth = validateSessionToken(request.sessionToken);
				userId = auth.userId;
			} catch {
				// Ignore invalid token for public access
			}
		}

		const post = await getPost(request.postId, userId);
		return toPostResponse(post);
	},

	async updatePost(request) {
		try {
			const auth = validateSessionToken(request.sessionToken);
			await updatePost({
				postId: request.postId,
				content: request.content,
				userId: auth.userId,
			});

			return { success: true };
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : "Failed to update post",
			};
		}
	},

	async deletePost(request) {
		try {
			const auth = validateSessionToken(request.sessionToken);
			await deletePost(request.postId, auth.userId);

			return { success: true };
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : "Failed to delete post",
			};
		}
	},

	async getPosts(request) {
		let userId: string | undefined;
		if (request.sessionToken) {
			try {
				const auth = validateSessionToken(request.sessionToken);
				userId = auth.userId;
			} catch {
				// Ignore invalid token for public access
			}
		}

		const posts = await getPosts({
			limit: request.pagination?.limit || 20,
			offset: request.pagination?.offset || 0,
			userId,
		});

		return {
			posts: posts.map(toPostResponse),
		};
	},

	async getUserPosts(request) {
		let userId: string | undefined;
		if (request.sessionToken) {
			try {
				const auth = validateSessionToken(request.sessionToken);
				userId = auth.userId;
			} catch {
				// Ignore invalid token for public access
			}
		}

		const posts = await getUserPosts(request.username, userId);

		return {
			posts: posts.map(toPostResponse),
		};
	},
};
