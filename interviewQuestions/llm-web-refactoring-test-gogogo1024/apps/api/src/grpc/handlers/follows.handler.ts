import type { IFollowsService } from "@chirp/proto";
import { validateSessionToken } from "../../middleware/auth";
import {
	getFollowerCount,
	getFollowingCount,
	getFollowStatus,
	toggleFollow,
} from "../../services/follows.service";

export const followsHandler: IFollowsService = {
	async toggleFollow(request) {
		try {
			const auth = validateSessionToken(request.sessionToken);
			const result = await toggleFollow(request.username, auth.userId);

			return {
				success: true,
				following: result.following,
			};
		} catch (error) {
			return {
				success: false,
				following: false,
				error: error instanceof Error ? error.message : "Failed to toggle follow",
			};
		}
	},

	async getFollowStatus(request) {
		try {
			const auth = validateSessionToken(request.sessionToken);
			const result = await getFollowStatus(request.username, auth.userId);

			return { following: result.following };
		} catch {
			return { following: false };
		}
	},

	async getFollowerCount(request) {
		try {
			const result = await getFollowerCount(request.username);
			return { count: result.count };
		} catch {
			return { count: 0 };
		}
	},

	async getFollowingCount(request) {
		try {
			const result = await getFollowingCount(request.username);
			return { count: result.count };
		} catch {
			return { count: 0 };
		}
	},
};
