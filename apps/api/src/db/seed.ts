import { generateId, hashPassword } from "../services/utils";
import { db, schema } from "./index";

const { users, posts, comments, likes, follows } = schema;

async function seed() {
	console.log("Seeding database...");

	// Create test users
	const testUsers = [
		{
			id: generateId(),
			email: "alice@test.com",
			username: "alice",
			displayName: "Alice Johnson",
			password: "password123",
			role: "user" as const,
			bio: "Coffee enthusiast ☕ | Developer | Love to share thoughts",
		},
		{
			id: generateId(),
			email: "bob@test.com",
			username: "bob",
			displayName: "Bob Smith",
			password: "password123",
			role: "user" as const,
			bio: "Just a guy who loves coding",
		},
		{
			id: generateId(),
			email: "charlie@test.com",
			username: "charlie",
			displayName: "Charlie Brown",
			password: "password123",
			role: "user" as const,
			bio: "Living life one day at a time",
		},
		{
			id: generateId(),
			email: "diana@test.com",
			username: "diana",
			displayName: "Diana Ross",
			password: "password123",
			role: "user" as const,
			bio: "Music is my soul",
		},
		{
			id: generateId(),
			email: "admin@test.com",
			username: "admin_old",
			displayName: "Admin User Old",
			password: "admin123",
			role: "admin" as const,
			bio: "System administrator",
		},
		// Admin users for client-admin tests
		{
			id: generateId(),
			email: "admin@chirp.test",
			username: "admin",
			displayName: "Admin User",
			password: "admin123",
			role: "admin" as const,
			bio: "Platform administrator",
		},
		{
			id: generateId(),
			email: "moderator@chirp.test",
			username: "moderator",
			displayName: "Moderator User",
			password: "mod123",
			role: "moderator" as const,
			bio: "Content moderator",
		},
	];

	// Insert users
	for (const user of testUsers) {
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
		console.log(`Created user: ${user.username}`);
	}

	// Create posts with realistic content
	const alice = testUsers[0];
	const bob = testUsers[1];
	const charlie = testUsers[2];
	const diana = testUsers[3];

	const post1Id = generateId();
	const post2Id = generateId();
	const post3Id = generateId();
	const post4Id = generateId();
	const post5Id = generateId();
	const post6Id = generateId();
	const post7Id = generateId();
	const post8Id = generateId();

	await db
		.insert(posts)
		.values([
			{
				id: post1Id,
				content:
					"Just deployed my first full-stack app with gRPC and TypeScript. The type safety across the entire stack is incredible!",
				authorId: alice.id,
			},
			{
				id: post2Id,
				content:
					"Morning coffee and code reviews. There is something peaceful about reading clean, well-structured code early in the day.",
				authorId: bob.id,
			},
			{
				id: post3Id,
				content:
					"Hot take: monorepos are the way to go for any team project. Shared packages, consistent tooling, and atomic changes across services.",
				authorId: alice.id,
			},
			{
				id: post4Id,
				content:
					"Finally wrapped my head around Protocol Buffers. The schema-first approach to API design changes everything.",
				authorId: charlie.id,
			},
			{
				id: post5Id,
				content: "Spent the weekend learning StyleX. CSS-in-JS with zero runtime cost? Sign me up.",
				authorId: diana.id,
			},
			{
				id: post6Id,
				content:
					"Pair programming tip: the navigator should think about the big picture while the driver focuses on implementation details. Works every time.",
				authorId: bob.id,
			},
			{
				id: post7Id,
				content:
					"TIL that TanStack Router has file-based routing with full type safety. No more guessing route params!",
				authorId: charlie.id,
			},
			{
				id: post8Id,
				content:
					"Music recommendation for coding: lo-fi beats are great, but have you tried ambient soundscapes? Total game changer for deep focus.",
				authorId: diana.id,
			},
		])
		.onConflictDoNothing();
	console.log("Created sample posts");

	// Create comments
	await db
		.insert(comments)
		.values([
			{
				id: generateId(),
				content: "Congrats on the deployment! What was the trickiest part of the gRPC setup?",
				postId: post1Id,
				authorId: bob.id,
			},
			{
				id: generateId(),
				content: "The type safety with Protobuf + TypeScript is next level. Welcome to the club!",
				postId: post1Id,
				authorId: charlie.id,
			},
			{
				id: generateId(),
				content: "Could not agree more. A good codebase is a joy to read.",
				postId: post2Id,
				authorId: alice.id,
			},
			{
				id: generateId(),
				content: "Totally agree! We switched to a monorepo last year and never looked back.",
				postId: post3Id,
				authorId: diana.id,
			},
			{
				id: generateId(),
				content:
					"Check out Buf for linting and managing your proto files. It is a huge time saver.",
				postId: post4Id,
				authorId: alice.id,
			},
			{
				id: generateId(),
				content:
					"StyleX is amazing! The compile-time optimization makes such a difference in bundle size.",
				postId: post5Id,
				authorId: bob.id,
			},
			{
				id: generateId(),
				content: "Great tip! I always struggle with knowing when to step back as the driver.",
				postId: post6Id,
				authorId: charlie.id,
			},
			{
				id: generateId(),
				content: 'I love ambient soundscapes for coding! Check out the "A Soft Murmur" website.',
				postId: post8Id,
				authorId: alice.id,
			},
		])
		.onConflictDoNothing();
	console.log("Created sample comments");

	// Create likes across various posts
	await db
		.insert(likes)
		.values([
			{ id: generateId(), userId: bob.id, postId: post1Id },
			{ id: generateId(), userId: charlie.id, postId: post1Id },
			{ id: generateId(), userId: diana.id, postId: post1Id },
			{ id: generateId(), userId: alice.id, postId: post2Id },
			{ id: generateId(), userId: charlie.id, postId: post2Id },
			{ id: generateId(), userId: bob.id, postId: post3Id },
			{ id: generateId(), userId: diana.id, postId: post3Id },
			{ id: generateId(), userId: alice.id, postId: post4Id },
			{ id: generateId(), userId: bob.id, postId: post4Id },
			{ id: generateId(), userId: alice.id, postId: post5Id },
			{ id: generateId(), userId: charlie.id, postId: post5Id },
			{ id: generateId(), userId: alice.id, postId: post6Id },
			{ id: generateId(), userId: diana.id, postId: post6Id },
			{ id: generateId(), userId: bob.id, postId: post7Id },
			{ id: generateId(), userId: diana.id, postId: post7Id },
			{ id: generateId(), userId: bob.id, postId: post8Id },
			{ id: generateId(), userId: charlie.id, postId: post8Id },
		])
		.onConflictDoNothing();
	console.log("Created sample likes");

	// Create follow relationships
	await db
		.insert(follows)
		.values([
			{ id: generateId(), followerId: bob.id, followingId: alice.id },
			{ id: generateId(), followerId: charlie.id, followingId: alice.id },
			{ id: generateId(), followerId: diana.id, followingId: alice.id },
			{ id: generateId(), followerId: alice.id, followingId: bob.id },
			{ id: generateId(), followerId: charlie.id, followingId: bob.id },
			{ id: generateId(), followerId: alice.id, followingId: charlie.id },
			{ id: generateId(), followerId: bob.id, followingId: charlie.id },
			{ id: generateId(), followerId: alice.id, followingId: diana.id },
			{ id: generateId(), followerId: bob.id, followingId: diana.id },
		])
		.onConflictDoNothing();
	console.log("Created sample follows");

	console.log("Database seeded successfully!");
}

seed().catch(console.error);
