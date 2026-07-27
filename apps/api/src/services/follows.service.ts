import { and, eq, sql } from "drizzle-orm";
import { db, schema } from "../db";
import { createNotification } from "./notifications.service";
import { generateId } from "./utils";

const { follows, users } = schema;

export async function toggleFollow(username: string, followerId: string) {
	// Find user to follow
	const userToFollow = await db.select().from(users).where(eq(users.username, username)).get();

	if (!userToFollow) {
		throw new Error("User not found");
	}

	// Cannot follow yourself
	if (userToFollow.id === followerId) {
		throw new Error("You cannot follow yourself");
	}

	// Check if already following
	const existingFollow = await db
		.select()
		.from(follows)
		.where(and(eq(follows.followerId, followerId), eq(follows.followingId, userToFollow.id)))
		.get();

	if (existingFollow) {
		// Unfollow
		await db.delete(follows).where(eq(follows.id, existingFollow.id));
		return { following: false };
	} else {
		// Follow
		await db.insert(follows).values({
			id: generateId(),
			followerId,
			followingId: userToFollow.id,
		});

		// Create notification for followed user
		await createNotification({
			userId: userToFollow.id,
			type: "follow",
			actorId: followerId,
		});

		return { following: true };
	}
}

export async function getFollowStatus(username: string, followerId: string) {
	const userToCheck = await db.select().from(users).where(eq(users.username, username)).get();

	if (!userToCheck) {
		throw new Error("User not found");
	}

	const follow = await db
		.select()
		.from(follows)
		.where(and(eq(follows.followerId, followerId), eq(follows.followingId, userToCheck.id)))
		.get();

	return { following: !!follow };
}

export async function getFollowerCount(username: string) {
	const user = await db.select().from(users).where(eq(users.username, username)).get();

	if (!user) {
		throw new Error("User not found");
	}

	const result = await db
		.select({ count: sql<number>`count(*)` })
		.from(follows)
		.where(eq(follows.followingId, user.id))
		.get();

	return { count: result?.count || 0 };
}

export async function getFollowingCount(username: string) {
	const user = await db.select().from(users).where(eq(users.username, username)).get();

	if (!user) {
		throw new Error("User not found");
	}

	const result = await db
		.select({ count: sql<number>`count(*)` })
		.from(follows)
		.where(eq(follows.followerId, user.id))
		.get();

	return { count: result?.count || 0 };
}
