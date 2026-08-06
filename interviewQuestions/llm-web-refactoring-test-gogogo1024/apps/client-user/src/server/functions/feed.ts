import { createServerFn } from "@tanstack/react-start";
import { getGrpcClient, getGrpcSessionToken, requireGrpcSessionToken } from "../../lib/grpc.server";
import { mapPostResponse } from "./posts";

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
