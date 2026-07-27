import { and, desc, eq, sql } from "drizzle-orm";
import { db, schema } from "../db";
import { processMentions } from "./mentions.service";
import { generateId } from "./utils";

const { posts, users, likes, comments } = schema;

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

async function getPostCounts(postId: string, userId?: string) {
	const likesResult = await db
		.select({ count: sql<number>`count(*)` })
		.from(likes)
		.where(eq(likes.postId, postId))
		.get();

	const commentsResult = await db
		.select({ count: sql<number>`count(*)` })
		.from(comments)
		.where(eq(comments.postId, postId))
		.get();

	let isLiked = false;
	if (userId) {
		const likeStatus = await db
			.select()
			.from(likes)
			.where(and(eq(likes.postId, postId), eq(likes.userId, userId)))
			.get();
		isLiked = !!likeStatus;
	}

	return {
		likeCount: likesResult?.count || 0,
		commentCount: commentsResult?.count || 0,
		isLiked,
	};
}

export async function createPost(input: CreatePostInput) {
	if (!input.content || input.content.length === 0) {
		throw new Error("Post content is required");
	}

	if (input.content.length > 280) {
		throw new Error("Post content must be 280 characters or less");
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
		throw new Error("Post not found");
	}

	const counts = await getPostCounts(postId, userId);

	return {
		...post,
		...counts,
	};
}

export async function updatePost(input: UpdatePostInput) {
	if (!input.content || input.content.length === 0) {
		throw new Error("Post content is required");
	}

	if (input.content.length > 280) {
		throw new Error("Post content must be 280 characters or less");
	}

	const post = await db.select().from(posts).where(eq(posts.id, input.postId)).get();

	if (!post) {
		throw new Error("Post not found");
	}

	if (post.authorId !== input.userId) {
		throw new Error("You can only edit your own posts");
	}

	// Check edit window (5 minutes)
	const now = Date.now();
	const postTime = post.createdAt.getTime();
	if (now - postTime > 300000) {
		throw new Error("Edit window has expired (5 minutes)");
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
		throw new Error("Post not found");
	}

	if (post.authorId !== userId) {
		throw new Error("You can only delete your own posts");
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

	const postsWithCounts = await Promise.all(
		result.map(async (post) => {
			const counts = await getPostCounts(post.id, options.userId);
			return { ...post, ...counts };
		}),
	);

	return postsWithCounts;
}

export async function getUserPosts(username: string, userId?: string) {
	const user = await db.select().from(users).where(eq(users.username, username)).get();

	if (!user) {
		throw new Error("User not found");
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

	const postsWithCounts = await Promise.all(
		result.map(async (post) => {
			const counts = await getPostCounts(post.id, userId);
			return { ...post, ...counts };
		}),
	);

	return postsWithCounts;
}
