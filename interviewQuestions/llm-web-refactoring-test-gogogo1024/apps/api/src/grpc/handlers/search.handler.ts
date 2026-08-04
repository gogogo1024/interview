import type { ISearchService, PostResponse } from "@chirp/proto";
import { validateSessionToken } from "../../middleware/auth";
import { searchPosts, searchUsers } from "../../services/search.service";
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

export const searchHandler: ISearchService = {
	async searchPosts(request) {
		let userId: string | undefined;
		if (request.sessionToken) {
			try {
				const auth = validateSessionToken(request.sessionToken);
				userId = auth.userId;
			} catch {
				// Ignore invalid token for public access
			}
		}

		const posts = await searchPosts(request.query, userId);

		return {
			posts: posts.map(toPostResponse),
		};
	},

	async searchUsers(request) {
		const users = await searchUsers(request.query);

		return {
			users: users.map((user) => ({
				id: user.id,
				username: user.username,
				displayName: user.displayName,
				avatarUrl: user.avatarUrl || undefined,
				bio: user.bio || undefined,
			})),
		};
	},
};
