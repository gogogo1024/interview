import { createServerFn } from "@tanstack/react-start";
import { getGrpcClient, requireGrpcSessionToken } from "../../lib/grpc.server";
import { mapPostResponse } from "./posts";

export const toggleBookmark = createServerFn({ method: "POST" })
	.inputValidator((d: string) => d)
	.handler(async ({ data: postId }) => {
		const sessionToken = await requireGrpcSessionToken();
		const client = getGrpcClient();

		const { response } = await client.bookmarks.toggleBookmark({
			sessionToken,
			postId,
		});

		if (!response.success) {
			throw new Error(response.error || "Failed to toggle bookmark");
		}

		return { success: true, bookmarked: response.bookmarked };
	});

export const getBookmarkStatus = createServerFn()
	.inputValidator((d: string) => d)
	.handler(async ({ data: postId }) => {
		const sessionToken = await requireGrpcSessionToken();
		const client = getGrpcClient();

		const { response } = await client.bookmarks.getBookmarkStatus({
			sessionToken,
			postId,
		});

		return { bookmarked: response.bookmarked };
	});

export const getBookmarkedPosts = createServerFn()
	.inputValidator((d: { limit?: number; offset?: number }) => d)
	.handler(async ({ data }) => {
		const sessionToken = await requireGrpcSessionToken();
		const client = getGrpcClient();

		const { response } = await client.bookmarks.getBookmarkedPosts({
			sessionToken,
			limit: data.limit || 20,
			offset: data.offset || 0,
		});

		return response.posts.map(mapPostResponse);
	});
