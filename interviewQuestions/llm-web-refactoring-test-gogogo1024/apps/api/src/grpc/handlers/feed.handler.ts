import type { IFeedService, PostResponse } from "@chirp/proto";
import { validateSessionToken } from "../../middleware/auth";
import { getExploreFeed, getHomeFeed } from "../../services/feed.service";
import { toProtoTimestamp } from "../../services/utils";

function toPostResponse(post: unknown): PostResponse {
	const p = post as {
		id: string;
		authorId?: string;
		authorUsername?: string | null;
		authorDisplayName?: string | null;
		authorAvatarUrl?: string | null;
		content: string;
		createdAt: string | number | Date;
		updatedAt?: string | number | Date;
		likeCount?: number;
		commentCount?: number;
		isLiked?: boolean;
		author?: {
			id?: string;
			username?: string;
			displayName?: string;
			avatarUrl?: string | null;
		} | null;
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

export const feedHandler: IFeedService = {
	async getHomeFeed(request) {
		const auth = validateSessionToken(request.sessionToken);
		const posts = await getHomeFeed(auth.userId, {
			limit: request.pagination?.limit || 20,
		});

		return {
			posts: posts.map(toPostResponse),
		};
	},

	async getExploreFeed(request) {
		let userId: string | undefined;
		if (request.sessionToken) {
			try {
				const auth = validateSessionToken(request.sessionToken);
				userId = auth.userId;
			} catch {
				// Ignore invalid token for public access
			}
		}

		const posts = await getExploreFeed({
			limit: request.pagination?.limit || 20,
			offset: request.pagination?.offset || 0,
			userId,
		});

		return {
			posts: posts.map(toPostResponse),
		};
	},
};
