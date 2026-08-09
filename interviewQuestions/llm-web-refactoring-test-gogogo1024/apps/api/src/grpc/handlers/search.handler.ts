import type { ISearchService, PostResponse } from "@chirp/proto";
import { validateSessionToken } from "../../middleware/auth";
import { searchPosts, searchUsers } from "../../services/search.service";
import { toProtoTimestamp } from "../../services/utils";

function toPostResponse(post: unknown): PostResponse {
	const p = post as {
		id: string;
		content: string;
		createdAt: string | number | Date;
		updatedAt?: string | number | Date;
		author?: {
			id?: string;
			username?: string;
			displayName?: string;
			avatarUrl?: string | null;
		} | null;
		likeCount?: number;
		commentCount?: number;
		isLiked?: boolean;
	};

	return {
		id: p.id,
		content: p.content,
		createdAt: toProtoTimestamp(new Date(p.createdAt)),
		updatedAt: p.updatedAt ? toProtoTimestamp(new Date(p.updatedAt)) : undefined,
		author: p.author
			? {
					id: p.author.id || "",
					username: p.author.username || "",
					displayName: p.author.displayName || "",
					avatarUrl: p.author.avatarUrl || undefined,
				}
			: { id: "", username: "", displayName: "" },
		likeCount: p.likeCount || 0,
		commentCount: p.commentCount || 0,
		isLiked: p.isLiked || false,
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
