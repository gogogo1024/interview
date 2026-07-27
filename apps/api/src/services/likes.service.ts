import { and, eq } from "drizzle-orm";
import { db, schema } from "../db";
import { createNotification } from "./notifications.service";
import { generateId } from "./utils";

const { likes, posts, comments } = schema;

export async function togglePostLike(postId: string, userId: string) {
	// Verify post exists
	const post = await db.select().from(posts).where(eq(posts.id, postId)).get();

	if (!post) {
		throw new Error("Post not found");
	}

	// Check if already liked
	const existingLike = await db
		.select()
		.from(likes)
		.where(and(eq(likes.postId, postId), eq(likes.userId, userId)))
		.get();

	if (existingLike) {
		// Unlike
		await db.delete(likes).where(eq(likes.id, existingLike.id));
		return { liked: false };
	} else {
		// Like
		await db.insert(likes).values({
			id: generateId(),
			postId,
			userId,
		});

		// Create notification for post author
		await createNotification({
			userId: post.authorId,
			type: "like",
			actorId: userId,
			postId,
		});

		return { liked: true };
	}
}

export async function toggleCommentLike(commentId: string, userId: string) {
	// Verify comment exists
	const comment = await db.select().from(comments).where(eq(comments.id, commentId)).get();

	if (!comment) {
		throw new Error("Comment not found");
	}

	// Check if already liked
	const existingLike = await db
		.select()
		.from(likes)
		.where(and(eq(likes.commentId, commentId), eq(likes.userId, userId)))
		.get();

	if (existingLike) {
		// Unlike
		await db.delete(likes).where(eq(likes.id, existingLike.id));
		return { liked: false };
	} else {
		// Like
		await db.insert(likes).values({
			id: generateId(),
			commentId,
			userId,
		});

		// Create notification for comment author
		await createNotification({
			userId: comment.authorId,
			type: "like",
			actorId: userId,
			commentId,
		});

		return { liked: true };
	}
}

export async function getPostLikeStatus(postId: string, userId: string) {
	const like = await db
		.select()
		.from(likes)
		.where(and(eq(likes.postId, postId), eq(likes.userId, userId)))
		.get();

	return { liked: !!like };
}

export async function getCommentLikeStatus(commentId: string, userId: string) {
	const like = await db
		.select()
		.from(likes)
		.where(and(eq(likes.commentId, commentId), eq(likes.userId, userId)))
		.get();

	return { liked: !!like };
}
