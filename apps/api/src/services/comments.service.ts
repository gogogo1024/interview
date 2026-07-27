import { and, eq, isNull, sql } from "drizzle-orm";
import { db, schema } from "../db";
import { processMentions } from "./mentions.service";
import { createNotification } from "./notifications.service";
import { generateId } from "./utils";

const { comments, users, likes, posts } = schema;

export interface CreateCommentInput {
	postId: string;
	content: string;
	authorId: string;
	parentId?: string;
}

async function getCommentLikeInfo(commentId: string, userId?: string) {
	const likesResult = await db
		.select({ count: sql<number>`count(*)` })
		.from(likes)
		.where(eq(likes.commentId, commentId))
		.get();

	let isLiked = false;
	if (userId) {
		const likeStatus = await db
			.select()
			.from(likes)
			.where(and(eq(likes.commentId, commentId), eq(likes.userId, userId)))
			.get();
		isLiked = !!likeStatus;
	}

	return {
		likeCount: likesResult?.count || 0,
		isLiked,
	};
}

export async function createComment(input: CreateCommentInput) {
	if (!input.content || input.content.length === 0) {
		throw new Error("Comment content is required");
	}

	// Verify post exists
	const post = await db.select().from(posts).where(eq(posts.id, input.postId)).get();

	if (!post) {
		throw new Error("Post not found");
	}

	// If parentId provided, verify parent comment exists
	if (input.parentId) {
		const parentComment = await db
			.select()
			.from(comments)
			.where(eq(comments.id, input.parentId))
			.get();

		if (!parentComment) {
			throw new Error("Parent comment not found");
		}

		// Only allow one level of nesting
		if (parentComment.parentId) {
			throw new Error("Cannot reply to a reply");
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

export async function getPostComments(postId: string, userId?: string) {
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

	// Get all comments with their replies
	const commentsWithReplies = await Promise.all(
		topLevelComments.map(async (comment) => {
			const likeInfo = await getCommentLikeInfo(comment.id, userId);

			// Get replies
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
				.where(eq(comments.parentId, comment.id));

			const repliesWithLikes = await Promise.all(
				replies.map(async (reply) => {
					const replyLikeInfo = await getCommentLikeInfo(reply.id, userId);
					return { ...reply, ...replyLikeInfo, replies: [] };
				}),
			);

			return {
				...comment,
				...likeInfo,
				replies: repliesWithLikes,
			};
		}),
	);

	return commentsWithReplies;
}

export async function deleteComment(commentId: string, userId: string) {
	const comment = await db.select().from(comments).where(eq(comments.id, commentId)).get();

	if (!comment) {
		throw new Error("Comment not found");
	}

	if (comment.authorId !== userId) {
		throw new Error("You can only delete your own comments");
	}

	await db.delete(comments).where(eq(comments.id, commentId));

	return { success: true };
}
