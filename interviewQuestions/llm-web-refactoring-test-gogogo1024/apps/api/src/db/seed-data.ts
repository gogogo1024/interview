import * as schema from "@chirp/db-schema";
import { inArray } from "drizzle-orm";
import { hashPassword } from "../services/utils";

const { users, posts, comments, likes, follows } = schema;

const seedUsers = [
	{
		id: "seed-user-alice",
		email: "alice@test.com",
		username: "alice",
		displayName: "Alice Johnson",
		password: "password123",
		role: "user" as const,
		bio: "Coffee enthusiast ☕ | Developer | Love to share thoughts",
	},
	{
		id: "seed-user-bob",
		email: "bob@test.com",
		username: "bob",
		displayName: "Bob Smith",
		password: "password123",
		role: "user" as const,
		bio: "Just a guy who loves coding",
	},
	{
		id: "seed-user-charlie",
		email: "charlie@test.com",
		username: "charlie",
		displayName: "Charlie Brown",
		password: "password123",
		role: "user" as const,
		bio: "Living life one day at a time",
	},
	{
		id: "seed-user-diana",
		email: "diana@test.com",
		username: "diana",
		displayName: "Diana Ross",
		password: "password123",
		role: "user" as const,
		bio: "Music is my soul",
	},
	{
		id: "seed-user-admin-old",
		email: "admin@test.com",
		username: "admin_old",
		displayName: "Admin User Old",
		password: "admin123",
		role: "admin" as const,
		bio: "System administrator",
	},
	{
		id: "seed-user-admin",
		email: "admin@chirp.test",
		username: "admin",
		displayName: "Admin User",
		password: "admin123",
		role: "admin" as const,
		bio: "Platform administrator",
	},
	{
		id: "seed-user-moderator",
		email: "moderator@chirp.test",
		username: "moderator",
		displayName: "Moderator User",
		password: "mod123",
		role: "moderator" as const,
		bio: "Content moderator",
	},
];

const seedPosts = [
	{
		id: "seed-post-1",
		authorEmail: "alice@test.com",
		content:
			"Just deployed my first full-stack app with gRPC and TypeScript. The type safety across the entire stack is incredible!",
	},
	{
		id: "seed-post-2",
		authorEmail: "bob@test.com",
		content:
			"Morning coffee and code reviews. There is something peaceful about reading clean, well-structured code early in the day.",
	},
	{
		id: "seed-post-3",
		authorEmail: "alice@test.com",
		content:
			"Hot take: monorepos are the way to go for any team project. Shared packages, consistent tooling, and atomic changes across services.",
	},
	{
		id: "seed-post-4",
		authorEmail: "charlie@test.com",
		content:
			"Finally wrapped my head around Protocol Buffers. The schema-first approach to API design changes everything.",
	},
	{
		id: "seed-post-5",
		authorEmail: "diana@test.com",
		content: "Spent the weekend learning StyleX. CSS-in-JS with zero runtime cost? Sign me up.",
	},
	{
		id: "seed-post-6",
		authorEmail: "bob@test.com",
		content:
			"Pair programming tip: the navigator should think about the big picture while the driver focuses on implementation details. Works every time.",
	},
	{
		id: "seed-post-7",
		authorEmail: "charlie@test.com",
		content:
			"TIL that TanStack Router has file-based routing with full type safety. No more guessing route params!",
	},
	{
		id: "seed-post-8",
		authorEmail: "diana@test.com",
		content:
			"Music recommendation for coding: lo-fi beats are great, but have you tried ambient soundscapes? Total game changer for deep focus.",
	},
];

const seedComments = [
	{
		id: "seed-comment-1",
		postId: "seed-post-1",
		authorEmail: "bob@test.com",
		content: "Congrats on the deployment! What was the trickiest part of the gRPC setup?",
	},
	{
		id: "seed-comment-2",
		postId: "seed-post-1",
		authorEmail: "charlie@test.com",
		content: "The type safety with Protobuf + TypeScript is next level. Welcome to the club!",
	},
	{
		id: "seed-comment-3",
		postId: "seed-post-2",
		authorEmail: "alice@test.com",
		content: "Could not agree more. A good codebase is a joy to read.",
	},
	{
		id: "seed-comment-4",
		postId: "seed-post-3",
		authorEmail: "diana@test.com",
		content: "Totally agree! We switched to a monorepo last year and never looked back.",
	},
	{
		id: "seed-comment-5",
		postId: "seed-post-4",
		authorEmail: "alice@test.com",
		content: "Check out Buf for linting and managing your proto files. It is a huge time saver.",
	},
	{
		id: "seed-comment-6",
		postId: "seed-post-5",
		authorEmail: "bob@test.com",
		content:
			"StyleX is amazing! The compile-time optimization makes such a difference in bundle size.",
	},
	{
		id: "seed-comment-7",
		postId: "seed-post-6",
		authorEmail: "charlie@test.com",
		content: "Great tip! I always struggle with knowing when to step back as the driver.",
	},
	{
		id: "seed-comment-8",
		postId: "seed-post-8",
		authorEmail: "alice@test.com",
		content: 'I love ambient soundscapes for coding! Check out the "A Soft Murmur" website.',
	},
];

const seedLikes = [
	{ id: "seed-like-1", userEmail: "bob@test.com", postId: "seed-post-1" },
	{ id: "seed-like-2", userEmail: "charlie@test.com", postId: "seed-post-1" },
	{ id: "seed-like-3", userEmail: "diana@test.com", postId: "seed-post-1" },
	{ id: "seed-like-4", userEmail: "alice@test.com", postId: "seed-post-2" },
	{ id: "seed-like-5", userEmail: "charlie@test.com", postId: "seed-post-2" },
	{ id: "seed-like-6", userEmail: "bob@test.com", postId: "seed-post-3" },
	{ id: "seed-like-7", userEmail: "diana@test.com", postId: "seed-post-3" },
	{ id: "seed-like-8", userEmail: "alice@test.com", postId: "seed-post-4" },
	{ id: "seed-like-9", userEmail: "bob@test.com", postId: "seed-post-4" },
	{ id: "seed-like-10", userEmail: "alice@test.com", postId: "seed-post-5" },
	{ id: "seed-like-11", userEmail: "charlie@test.com", postId: "seed-post-5" },
	{ id: "seed-like-12", userEmail: "alice@test.com", postId: "seed-post-6" },
	{ id: "seed-like-13", userEmail: "diana@test.com", postId: "seed-post-6" },
	{ id: "seed-like-14", userEmail: "bob@test.com", postId: "seed-post-7" },
	{ id: "seed-like-15", userEmail: "diana@test.com", postId: "seed-post-7" },
	{ id: "seed-like-16", userEmail: "bob@test.com", postId: "seed-post-8" },
	{ id: "seed-like-17", userEmail: "charlie@test.com", postId: "seed-post-8" },
];

const seedFollows = [
	{ id: "seed-follow-1", followerEmail: "bob@test.com", followingEmail: "alice@test.com" },
	{ id: "seed-follow-2", followerEmail: "charlie@test.com", followingEmail: "alice@test.com" },
	{ id: "seed-follow-3", followerEmail: "diana@test.com", followingEmail: "alice@test.com" },
	{ id: "seed-follow-4", followerEmail: "alice@test.com", followingEmail: "bob@test.com" },
	{ id: "seed-follow-5", followerEmail: "charlie@test.com", followingEmail: "bob@test.com" },
	{ id: "seed-follow-6", followerEmail: "alice@test.com", followingEmail: "charlie@test.com" },
	{ id: "seed-follow-7", followerEmail: "bob@test.com", followingEmail: "charlie@test.com" },
	{ id: "seed-follow-8", followerEmail: "alice@test.com", followingEmail: "diana@test.com" },
	{ id: "seed-follow-9", followerEmail: "bob@test.com", followingEmail: "diana@test.com" },
];

type SeedDb = {
	insert: ReturnType<typeof import("drizzle-orm/libsql").drizzle>["insert"];
	select: ReturnType<typeof import("drizzle-orm/libsql").drizzle>["select"];
};

export async function seedDatabase(db: SeedDb) {
	for (const user of seedUsers) {
		const passwordHash = await hashPassword(user.password);
		await db
			.insert(users)
			.values({
				id: user.id,
				email: user.email,
				username: user.username,
				displayName: user.displayName,
				passwordHash,
				role: user.role,
				bio: user.bio,
			})
			.onConflictDoNothing();
	}

	const seededUsers = await db
		.select({ id: users.id, email: users.email })
		.from(users)
		.where(
			inArray(
				users.email,
				seedUsers.map((user) => user.email),
			),
		);

	const userIds = new Map(seededUsers.map((user) => [user.email, user.id]));

	for (const post of seedPosts) {
		const authorId = requireUserId(userIds, post.authorEmail);
		await db
			.insert(posts)
			.values({
				id: post.id,
				content: post.content,
				authorId,
			})
			.onConflictDoNothing();
	}

	for (const comment of seedComments) {
		const authorId = requireUserId(userIds, comment.authorEmail);
		await db
			.insert(comments)
			.values({
				id: comment.id,
				content: comment.content,
				postId: comment.postId,
				authorId,
			})
			.onConflictDoNothing();
	}

	for (const like of seedLikes) {
		const userId = requireUserId(userIds, like.userEmail);
		await db
			.insert(likes)
			.values({
				id: like.id,
				userId,
				postId: like.postId,
			})
			.onConflictDoNothing();
	}

	for (const follow of seedFollows) {
		const followerId = requireUserId(userIds, follow.followerEmail);
		const followingId = requireUserId(userIds, follow.followingEmail);
		await db
			.insert(follows)
			.values({
				id: follow.id,
				followerId,
				followingId,
			})
			.onConflictDoNothing();
	}
}

function requireUserId(userIds: Map<string, string>, email: string) {
	const userId = userIds.get(email);
	if (!userId) {
		throw new Error(`Missing seeded user for ${email}`);
	}
	return userId;
}
