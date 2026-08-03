import { createServerFn } from "@tanstack/react-start";
import { getGrpcClient, requireGrpcSessionToken } from "../../lib/grpc.server";

export const toggleFollow = createServerFn({ method: "POST" })
	.inputValidator((d: string) => d)
	.handler(async ({ data: username }) => {
		const sessionToken = await requireGrpcSessionToken();
		const client = getGrpcClient();

		const { response } = await client.follows.toggleFollow({
			sessionToken,
			username,
		});

		if (!response.success) {
			throw new Error(response.error || "Failed to toggle follow");
		}

		return { success: true, following: response.following };
	});

export const getFollowStatus = createServerFn()
	.inputValidator((d: string) => d)
	.handler(async ({ data: username }) => {
		const sessionToken = await requireGrpcSessionToken();
		const client = getGrpcClient();

		const { response } = await client.follows.getFollowStatus({
			sessionToken,
			username,
		});

		return { following: response.following };
	});

export const getFollowerCount = createServerFn()
	.inputValidator((d: string) => d)
	.handler(async ({ data: username }) => {
		const client = getGrpcClient();

		const { response } = await client.follows.getFollowerCount({
			username,
		});

		return response.count;
	});

export const getFollowingCount = createServerFn()
	.inputValidator((d: string) => d)
	.handler(async ({ data: username }) => {
		const client = getGrpcClient();

		const { response } = await client.follows.getFollowingCount({
			username,
		});

		return response.count;
	});
