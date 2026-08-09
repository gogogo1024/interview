import { and, eq, inArray, isNull } from "drizzle-orm";
import { db, schema } from "../db";
import { badRequest, forbidden, notFound } from "../observability/errors";
import { getCommentLikesForIds } from "./commentMetrics.service";
import { processMentions } from "./mentions.service";
import { createNotification } from "./notifications.service";
import { generateId } from "./utils";

const { comments, users, posts } = schema;

export interface CreateCommentInput {
	postId: string;
	content: string;
	authorId: string;
	parentId?: string;
}

export interface CommentAuthor {
	id: string;
	username: string;
	displayName: string;
	avatarUrl?: string | null;
}

export interface CommentWithMeta {
	id: string;
	content: string;
	createdAt: Date;
	parentId?: string | null;
	author?: CommentAuthor | null;
	likeCount: number;
	isLiked: boolean;
	replies: CommentWithMeta[];
}

// Comment like info is provided by commentMetrics service (batch)

export async function createComment(input: CreateCommentInput) {
	if (!input.content || input.content.length === 0) {
		throw badRequest("Comment content is required");
	}

	// Verify post exists
	const post = await db.select().from(posts).where(eq(posts.id, input.postId)).get();

	if (!post) {
		throw notFound("Post not found");
	}

	// If parentId provided, verify parent comment exists
	if (input.parentId) {
		const parentComment = await db
			.select()
			.from(comments)
			.where(eq(comments.id, input.parentId))
			.get();

		if (!parentComment) {
			throw notFound("Parent comment not found");
		}

		// Only allow one level of nesting
		if (parentComment.parentId) {
			throw badRequest("Cannot reply to a reply");
		}
	}

	const commentId = generateId();
	await db.insert(comments).values({
		id: commentId,
		content: input.content,
		postId: input.postId,
		authorId: input.authorId,
		parentId: input.parentId || null,
	});

	// Create notification for post author
	await createNotification({
		userId: post.authorId,
		type: "comment",
		actorId: input.authorId,
		postId: input.postId,
		commentId,
	});

	// Process mentions and create notifications
	await processMentions(input.content, input.authorId, input.postId, commentId);

	return { commentId };
}

export async function getPostComments(postId: string, userId?: string): Promise<CommentWithMeta[]> {
	// Get top-level comments
	const topLevelComments = await db
		.select({
			id: comments.id,
			content: comments.content,
			createdAt: comments.createdAt,
			parentId: comments.parentId,
			author: {
				id: users.id,
				username: users.username,
				displayName: users.displayName,
				avatarUrl: users.avatarUrl,
			},
		})
		.from(comments)
		.leftJoin(users, eq(comments.authorId, users.id))
		.where(and(eq(comments.postId, postId), isNull(comments.parentId)));

	// Collect all comment IDs (top-level + replies) to batch fetch like info
	const topLevelIds = topLevelComments.map((c) => c.id);

	// Fetch replies for all top-level comments in one query
	const replies = await db
		.select({
			id: comments.id,
			content: comments.content,
			createdAt: comments.createdAt,
			parentId: comments.parentId,
			author: {
				id: users.id,
				username: users.username,
				displayName: users.displayName,
				avatarUrl: users.avatarUrl,
			},
		})
		.from(comments)
		.leftJoin(users, eq(comments.authorId, users.id))
		.where(inArray(comments.parentId, topLevelIds));

	const allIds = [...topLevelIds, ...replies.map((r) => r.id)];
	const likeInfoMap = await getCommentLikesForIds(allIds, userId);

	const repliesByParent: Record<string, CommentWithMeta[]> = {};
	replies.forEach((r) => {
		if (!r.parentId) return;
		const parentReplies = (repliesByParent[r.parentId] as CommentWithMeta[]) || [];
		parentReplies.push({
			id: r.id,
			content: r.content,
			createdAt: r.createdAt,
			parentId: r.parentId,
			author: r.author || null,
			...(likeInfoMap[r.id] as { likeCount: number; isLiked: boolean }),
			replies: [],
		});
		repliesByParent[r.parentId] = parentReplies;
	});

	return topLevelComments.map((comment) => ({
		id: comment.id,
		content: comment.content,
		createdAt: comment.createdAt,
		parentId: comment.parentId,
		author: comment.author || null,
		...(likeInfoMap[comment.id] as { likeCount: number; isLiked: boolean }),
		replies: repliesByParent[comment.id] || [],
	}));
}

export async function deleteComment(commentId: string, userId: string) {
	const comment = await db.select().from(comments).where(eq(comments.id, commentId)).get();

	if (!comment) {
		throw notFound("Comment not found");
	}

	if (comment.authorId !== userId) {
		throw forbidden("You can only delete your own comments");
	}

	await db.delete(comments).where(eq(comments.id, commentId));

	return { success: true };
}
