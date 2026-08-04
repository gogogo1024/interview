import type { PostResponse } from "@chirp/proto";
import { createServerFn } from "@tanstack/react-start";
import {
	fromProtoTimestamp,
	getGrpcClient,
	getGrpcSessionToken,
	requireGrpcSessionToken,
} from "../../lib/grpc.server";

function mapPostResponse(post: PostResponse) {
	return {
		id: post.id,
		content: post.content,
		createdAt: fromProtoTimestamp(post.createdAt),
		updatedAt: fromProtoTimestamp(post.updatedAt),
		author: post.author
			? {
					id: post.author.id,
					username: post.author.username,
					displayName: post.author.displayName,
					avatarUrl: post.author.avatarUrl,
				}
			: null,
		likeCount: post.likeCount,
		commentCount: post.commentCount,
		isLiked: post.isLiked,
	};
}

export const getHomeFeed = createServerFn()
	.inputValidator((d?: { limit?: number; offset?: number }) => d)
	.handler(async ({ data: options }) => {
		const sessionToken = await requireGrpcSessionToken();
		const client = getGrpcClient();

		const { response } = await client.feed.getHomeFeed({
			sessionToken,
			pagination: {
				limit: options?.limit || 20,
				offset: options?.offset || 0,
			},
		});

		return response.posts.map(mapPostResponse);
	});

export const getExploreFeed = createServerFn()
	.inputValidator((d?: { limit?: number; offset?: number }) => d)
	.handler(async ({ data: options }) => {
		const sessionToken = await getGrpcSessionToken();
		const client = getGrpcClient();

		const { response } = await client.feed.getExploreFeed({
			sessionToken: sessionToken || "",
			pagination: {
				limit: options?.limit || 20,
				offset: options?.offset || 0,
			},
		});

		return response.posts.map(mapPostResponse);
	});
