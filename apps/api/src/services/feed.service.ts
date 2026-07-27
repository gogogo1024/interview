import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { db, schema } from "../db";

const { posts, users, likes, comments, follows } = schema;

interface FeedOptions {
	limit?: number;
	offset?: number;
	userId?: string;
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

export async function getHomeFeed(userId: string, options: FeedOptions = {}) {
	const limit = options.limit || 20;
	const offset = options.offset || 0;

	// Get users that the current user follows
	const following = await db
		.select({ followingId: follows.followingId })
		.from(follows)
		.where(eq(follows.followerId, userId));

	const followingIds = following.map((f) => f.followingId);

	// Include the user's own posts as well
	const userIds = [...followingIds, userId];

	if (userIds.length === 0) {
		return [];
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
		.where(inArray(posts.authorId, userIds))
		.orderBy(desc(posts.createdAt))
		.limit(limit)
		.offset(offset);

	const postsWithCounts = await Promise.all(
		result.map(async (post) => {
			const counts = await getPostCounts(post.id, userId);
			return { ...post, ...counts };
		}),
	);

	return postsWithCounts;
}

export async function getExploreFeed(options: FeedOptions = {}) {
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
