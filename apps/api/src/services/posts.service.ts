import { desc, eq } from "drizzle-orm";
import { db, schema } from "../db";
import { badRequest, notFound, forbidden } from "../observability/errors";
import { processMentions } from "./mentions.service";
import { generateId } from "./utils";
import { getCountsForPostIds } from "./postMetrics.service";

const { posts, users } = schema;

export interface CreatePostInput {
	content: string;
	authorId: string;
}

export interface UpdatePostInput {
	postId: string;
	content: string;
	userId: string;
}

export interface GetPostsOptions {
	limit?: number;
	offset?: number;
	userId?: string; // For checking if liked
}

export async function createPost(input: CreatePostInput) {
	if (!input.content || input.content.length === 0) {
		throw badRequest("Post content is required");
	}

	if (input.content.length > 280) {
		throw badRequest("Post content must be 280 characters or less");
	}

	const postId = generateId();
	await db.insert(posts).values({
		id: postId,
		content: input.content,
		authorId: input.authorId,
	});

	// Process mentions and create notifications
	await processMentions(input.content, input.authorId, postId);

	return { postId };
}

export async function getPost(postId: string, userId?: string) {
	const post = await db
		.select({
			id: posts.id,
			content: posts.content,
			createdAt: posts.createdAt,
			updatedAt: posts.updatedAt,
			author: {
				id: users.id,
				username: users.username,
				displayName: users.displayName,
				avatarUrl: users.avatarUrl,
			},
		})
		.from(posts)
		.leftJoin(users, eq(posts.authorId, users.id))
		.where(eq(posts.id, postId))
		.get();

	if (!post) {
		throw notFound("Post not found");
	}

	const countsMap = await getCountsForPostIds([postId], userId as string | undefined);

	return {
		...post,
		...countsMap[postId],
	};
}

export async function updatePost(input: UpdatePostInput) {
	if (!input.content || input.content.length === 0) {
		throw badRequest("Post content is required");
	}

	if (input.content.length > 280) {
		throw badRequest("Post content must be 280 characters or less");
	}

	const post = await db.select().from(posts).where(eq(posts.id, input.postId)).get();

	if (!post) {
		throw notFound("Post not found");
	}

	if (post.authorId !== input.userId) {
		throw forbidden("You can only edit your own posts");
	}

	// Check edit window (5 minutes)
	const now = Date.now();
	const postTime = post.createdAt.getTime();
	if (now - postTime > 300000) {
		throw badRequest("Edit window has expired (5 minutes)");
	}

	await db
		.update(posts)
		.set({
			content: input.content,
			updatedAt: new Date(),
		})
		.where(eq(posts.id, input.postId));

	return { success: true };
}

export async function deletePost(postId: string, userId: string) {
	const post = await db.select().from(posts).where(eq(posts.id, postId)).get();

	if (!post) {
		throw notFound("Post not found");
	}

	if (post.authorId !== userId) {
		throw forbidden("You can only delete your own posts");
	}

	await db.delete(posts).where(eq(posts.id, postId));

	return { success: true };
}

export async function getPosts(options: GetPostsOptions = {}) {
	const limit = options.limit || 20;
	const offset = options.offset || 0;

	const result = await db
		.select({
			id: posts.id,
			content: posts.content,
			createdAt: posts.createdAt,
			updatedAt: posts.updatedAt,
			author: {
				id: users.id,
				username: users.username,
				displayName: users.displayName,
				avatarUrl: users.avatarUrl,
			},
		})
		.from(posts)
		.leftJoin(users, eq(posts.authorId, users.id))
		.orderBy(desc(posts.createdAt))
		.limit(limit)
		.offset(offset);

	const postIds = result.map((p) => p.id);
	const countsMap = await getCountsForPostIds(postIds, options.userId);

	return result.map((post) => ({
		...post,
		...countsMap[post.id],
	}));
}

export async function getUserPosts(username: string, userId?: string) {
	const user = await db.select().from(users).where(eq(users.username, username)).get();

	if (!user) {
		throw notFound("User not found");
	}

	const result = await db
		.select({
			id: posts.id,
			content: posts.content,
			createdAt: posts.createdAt,
			updatedAt: posts.updatedAt,
			author: {
				id: users.id,
				username: users.username,
				displayName: users.displayName,
				avatarUrl: users.avatarUrl,
			},
		})
		.from(posts)
		.leftJoin(users, eq(posts.authorId, users.id))
		.where(eq(posts.authorId, user.id))
		.orderBy(desc(posts.createdAt));

	const postIds = result.map((p) => p.id);
	const countsMap = await getCountsForPostIds(postIds, userId);

	return result.map((post) => ({
		...post,
		...countsMap[post.id],
	}));
}
