import { and, desc, eq, sql } from "drizzle-orm";
import { db, schema } from "../db";
import { generateId } from "./utils";

const { bookmarks, posts, users, likes } = schema;

/**
 * Toggle bookmark for a post (create if not exists, delete if exists)
 */
export async function toggleBookmark(postId: string, userId: string) {
	// Verify post exists
	const post = await db.select().from(posts).where(eq(posts.id, postId)).get();

	if (!post) {
		throw new Error("Post not found");
	}

	// Check if already bookmarked
	const existingBookmark = await db
		.select()
		.from(bookmarks)
		.where(and(eq(bookmarks.postId, postId), eq(bookmarks.userId, userId)))
		.get();

	if (existingBookmark) {
		// Remove bookmark
		await db.delete(bookmarks).where(eq(bookmarks.id, existingBookmark.id));
		return { bookmarked: false };
	} else {
		// Add bookmark
		await db.insert(bookmarks).values({
			id: generateId(),
			postId,
			userId,
		});
		return { bookmarked: true };
	}
}

/**
 * Get bookmark status for a single post
 */
export async function getBookmarkStatus(postId: string, userId: string) {
	const bookmark = await db
		.select()
		.from(bookmarks)
		.where(and(eq(bookmarks.postId, postId), eq(bookmarks.userId, userId)))
		.get();

	return { bookmarked: !!bookmark };
}

/**
 * Get all bookmarked posts for a user with pagination
 */
export async function getBookmarkedPosts(
	userId: string,
	requesterId?: string,
	limit = 20,
	offset = 0,
) {
	// Get bookmarked post IDs
	const bookmarkedPosts = await db
		.select({
			postId: bookmarks.postId,
			bookmarkedAt: bookmarks.createdAt,
		})
		.from(bookmarks)
		.where(eq(bookmarks.userId, userId))
		.orderBy(desc(bookmarks.createdAt))
		.limit(limit)
		.offset(offset);

	if (bookmarkedPosts.length === 0) {
		return [];
	}

	// Get full post details
	const postsWithDetails = await Promise.all(
		bookmarkedPosts.map(async (bookmark) => {
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
				.where(eq(posts.id, bookmark.postId))
				.get();

			if (!post) return null;

			// Get like count
			const likeCountResult = await db
				.select({ count: sql<number>`count(*)` })
				.from(likes)
				.where(eq(likes.postId, post.id))
				.get();

			// Get comment count
			const commentCountResult = await db
				.select({ count: sql<number>`count(*)` })
				.from(schema.comments)
				.where(eq(schema.comments.postId, post.id))
				.get();

			// Check if requester liked this post
			let isLiked = false;
			if (requesterId) {
				const likeStatus = await db
					.select()
					.from(likes)
					.where(and(eq(likes.postId, post.id), eq(likes.userId, requesterId)))
					.get();
				isLiked = !!likeStatus;
			}

			return {
				...post,
				likeCount: likeCountResult?.count || 0,
				commentCount: commentCountResult?.count || 0,
				isLiked,
			};
		}),
	);

	return postsWithDetails.filter((p) => p !== null);
}
