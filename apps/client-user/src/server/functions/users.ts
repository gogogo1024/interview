import { createServerFn } from "@tanstack/react-start";
import {
	fromProtoTimestamp,
	getGrpcClient,
	getGrpcSessionToken,
	requireGrpcSessionToken,
} from "../../lib/grpc.server";

export const getUser = createServerFn()
	.inputValidator((d: string) => d)
	.handler(async ({ data: username }) => {
		const sessionToken = await getGrpcSessionToken();
		const client = getGrpcClient();

		const { response } = await client.users.getUser({
			sessionToken: sessionToken || "",
			username,
		});

		return {
			id: response.id,
			email: response.email,
			username: response.username,
			displayName: response.displayName,
			avatarUrl: response.avatarUrl,
			bio: response.bio,
			role: response.role,
			createdAt: fromProtoTimestamp(response.createdAt),
			followerCount: response.followerCount,
			followingCount: response.followingCount,
			postCount: response.postCount,
			isFollowing: response.isFollowing,
		};
	});

export const updateProfile = createServerFn({ method: "POST" })
	.inputValidator((d: { displayName?: string; bio?: string; avatarUrl?: string }) => d)
	.handler(async ({ data }) => {
		const sessionToken = await requireGrpcSessionToken();
		const client = getGrpcClient();

		const { response } = await client.users.updateProfile({
			sessionToken,
			displayName: data.displayName,
			bio: data.bio,
			avatarUrl: data.avatarUrl,
		});

		if (!response.success) {
			throw new Error(response.error || "Failed to update profile");
		}

		return { success: true };
	});
