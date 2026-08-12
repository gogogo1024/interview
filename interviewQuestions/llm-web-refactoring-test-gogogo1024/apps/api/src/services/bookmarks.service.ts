import { and, desc, eq, inArray } from "drizzle-orm";
import { db, schema } from "../db";
import { notFound } from "../observability/errors";
import { getCountsForPostIds, type PostCounts } from "./postMetrics.service";
import { generateId } from "./utils";

const { bookmarks, posts, users } = schema;

type NullableString = string | null;

type AuthorRow = {
	id: NullableString;
	username: NullableString;
	displayName?: NullableString;
	avatarUrl?: NullableString;
} | null;

type PostRow = {
	id: string;
	content: string;
	createdAt: Date | string;
	updatedAt: Date | string | null;
	author?: AuthorRow;
};

export type PostWithCounts = {
	id: string;
	content: string;
	createdAt: Date | string;
	updatedAt: Date | string | null;
	author?: {
		id: string;
		username: string;
		displayName?: string | null;
		avatarUrl?: string | null;
	};
	likeCount: number;
	commentCount: number;
	isLiked: boolean;
};

/**
 * Toggle bookmark for a post (create if not exists, delete if exists)
 */
export async function toggleBookmark(postId: string, userId: string) {
	// Verify post exists
	const post = await db.select().from(posts).where(eq(posts.id, postId)).get();

	if (!post) {
		throw notFound("Post not found");
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
): Promise<PostWithCounts[]> {
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

	const bookmarkedIds = bookmarkedPosts.map((b) => b.postId);

	// Fetch all posts in one query
	const postsRows = await db
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
		.where(inArray(posts.id, bookmarkedIds));

	const postsMap: Record<string, PostRow> = {};
	(postsRows as PostRow[]).forEach((p) => {
		if (p?.id) postsMap[p.id] = p;
	});

	const countsMap: Record<string, PostCounts> = await getCountsForPostIds(
		bookmarkedIds,
		requesterId,
	);

	const result = bookmarkedPosts
		.map((bookmark) => {
			const post = postsMap[bookmark.postId];
			if (!post) return null;

			const counts = countsMap[post.id] || { likeCount: 0, commentCount: 0, isLiked: false };

			return {
				id: post.id,
				content: post.content,
				createdAt: post.createdAt,
				updatedAt: post.updatedAt,
				author: post.author?.id
					? {
							id: post.author.id,
							username: post.author.username ?? "",
							displayName: post.author.displayName ?? null,
							avatarUrl: post.author.avatarUrl ?? null,
						}
					: undefined,
				likeCount: counts.likeCount,
				commentCount: counts.commentCount,
				isLiked: counts.isLiked,
			} as PostWithCounts;
		})
		.filter((p): p is PostWithCounts => p !== null);

	return result;
}
