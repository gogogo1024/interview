import type { CommentResponse } from "@chirp/proto";
import { createServerFn } from "@tanstack/react-start";
import {
	fromProtoTimestamp,
	getGrpcClient,
	getGrpcSessionToken,
	requireGrpcSessionToken,
} from "../../lib/grpc.server";

interface MappedComment {
	id: string;
	content: string;
	createdAt: Date;
	parentId: string | null;
	author: {
		id: string;
		username: string;
		displayName: string;
		avatarUrl: string | undefined;
	} | null;
	likeCount: number;
	isLiked: boolean;
	replies: MappedComment[];
}

function mapCommentResponse(comment: CommentResponse): MappedComment {
	return {
		id: comment.id,
		content: comment.content,
		createdAt: fromProtoTimestamp(comment.createdAt),
		parentId: comment.parentId || null,
		author: comment.author
			? {
					id: comment.author.id,
					username: comment.author.username,
					displayName: comment.author.displayName,
					avatarUrl: comment.author.avatarUrl,
				}
			: null,
		likeCount: comment.likeCount,
		isLiked: comment.isLiked,
		replies: comment.replies?.map(mapCommentResponse) || [],
	};
}

export const createComment = createServerFn({ method: "POST" })
	.inputValidator((d: { postId: string; content: string; parentId?: string }) => d)
	.handler(async ({ data }) => {
		const sessionToken = await requireGrpcSessionToken();
		const client = getGrpcClient();

		const { response } = await client.comments.createComment({
			sessionToken,
			postId: data.postId,
			content: data.content,
			parentId: data.parentId,
		});

		if (!response.success) {
			throw new Error(response.error || "Failed to create comment");
		}

		return { success: true, commentId: response.commentId };
	});

export const getPostComments = createServerFn()
	.inputValidator((d: string) => d)
	.handler(async ({ data: postId }) => {
		const sessionToken = await getGrpcSessionToken();
		const client = getGrpcClient();

		const { response } = await client.comments.getPostComments({
			sessionToken: sessionToken || "",
			postId,
		});

		return response.comments.map(mapCommentResponse);
	});

export const deleteComment = createServerFn({ method: "POST" })
	.inputValidator((d: string) => d)
	.handler(async ({ data: commentId }) => {
		const sessionToken = await requireGrpcSessionToken();
		const client = getGrpcClient();

		const { response } = await client.comments.deleteComment({
			sessionToken,
			commentId,
		});

		if (!response.success) {
			throw new Error(response.error || "Failed to delete comment");
		}

		return { success: true };
	});
