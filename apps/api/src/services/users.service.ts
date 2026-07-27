import { and, eq, sql } from "drizzle-orm";
import { db, schema } from "../db";

const { users, follows, posts } = schema;

export interface UpdateProfileInput {
	userId: string;
	displayName?: string;
	bio?: string;
	avatarUrl?: string;
}

export async function getUser(username: string, requesterId?: string) {
	const user = await db
		.select({
			id: users.id,
			email: users.email,
			username: users.username,
			displayName: users.displayName,
			avatarUrl: users.avatarUrl,
			bio: users.bio,
			role: users.role,
			createdAt: users.createdAt,
		})
		.from(users)
		.where(eq(users.username, username))
		.get();

	if (!user) {
		throw new Error("User not found");
	}

	// Get follower count
	const followerResult = await db
		.select({ count: sql<number>`count(*)` })
		.from(follows)
		.where(eq(follows.followingId, user.id))
		.get();

	// Get following count
	const followingResult = await db
		.select({ count: sql<number>`count(*)` })
		.from(follows)
		.where(eq(follows.followerId, user.id))
		.get();

	// Get post count
	const postResult = await db
		.select({ count: sql<number>`count(*)` })
		.from(posts)
		.where(eq(posts.authorId, user.id))
		.get();

	// Check if requester is following this user
	let isFollowing = false;
	if (requesterId && requesterId !== user.id) {
		const follow = await db
			.select()
			.from(follows)
			.where(and(eq(follows.followerId, requesterId), eq(follows.followingId, user.id)))
			.get();
		isFollowing = !!follow;
	}

	return {
		...user,
		followerCount: followerResult?.count || 0,
		followingCount: followingResult?.count || 0,
		postCount: postResult?.count || 0,
		isFollowing,
	};
}

export async function updateProfile(input: UpdateProfileInput) {
	const updateData: Record<string, string> = {};

	if (input.displayName !== undefined) {
		updateData.displayName = input.displayName;
	}

	if (input.bio !== undefined) {
		updateData.bio = input.bio;
	}

	if (input.avatarUrl !== undefined) {
		updateData.avatarUrl = input.avatarUrl;
	}

	if (Object.keys(updateData).length === 0) {
		return { success: true };
	}

	await db
		.update(users)
		.set({
			...updateData,
			updatedAt: new Date(),
		})
		.where(eq(users.id, input.userId));

	return { success: true };
}
