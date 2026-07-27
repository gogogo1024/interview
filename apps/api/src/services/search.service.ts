import { and, desc, eq, like, or, sql } from "drizzle-orm";
import { db, schema } from "../db";

const { posts, users, likes, comments } = schema;

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

export async function searchPosts(query: string, userId?: string) {
	if (!query || query.trim().length === 0) {
		return [];
	}

	const searchPattern = `%${query}%`;

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
		.where(like(posts.content, searchPattern))
		.orderBy(desc(posts.createdAt))
		.limit(50);

	const postsWithCounts = await Promise.all(
		result.map(async (post) => {
			const counts = await getPostCounts(post.id, userId);
			return { ...post, ...counts };
		}),
	);

	return postsWithCounts;
}

export async function searchUsers(query: string) {
	if (!query || query.trim().length === 0) {
		return [];
	}

	const searchPattern = `%${query}%`;

	const result = await db
		.select({
			id: users.id,
			username: users.username,
			displayName: users.displayName,
			avatarUrl: users.avatarUrl,
			bio: users.bio,
		})
		.from(users)
		.where(or(like(users.username, searchPattern), like(users.displayName, searchPattern)))
		.limit(20);

	return result;
}
