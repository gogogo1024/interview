import { and, eq, inArray, sql } from "drizzle-orm";
import { db, schema } from "../db";

const { likes } = schema;

export interface CommentLikeInfo {
  likeCount: number;
  isLiked: boolean;
}

type IdRow = { commentId: string | null };
type CountRow = IdRow & { count: number };

function hasStringId<T extends IdRow>(row: T): row is T & { commentId: string } {
  return row.commentId !== null && row.commentId !== undefined;
}

export async function getCommentLikesForIds(commentIds: string[], userId?: string) {
  if (!commentIds || commentIds.length === 0) return {} as Record<string, CommentLikeInfo>;

  const likeCounts = await db
    .select({ commentId: likes.commentId, count: sql<number>`count(*)` })
    .from(likes)
    .where(inArray(likes.commentId, commentIds))
    .groupBy(likes.commentId);

  let likedByRequester: Array<IdRow> = [];
  if (userId) {
    likedByRequester = await db
      .select({ commentId: likes.commentId })
      .from(likes)
      .where(and(inArray(likes.commentId, commentIds), eq(likes.userId, userId)));
  }

  const likeCountMap: Record<string, number> = {};
  for (const row of likeCounts as CountRow[]) {
    if (!hasStringId(row)) continue;
    likeCountMap[row.commentId] = row.count || 0;
  }

  const likedSet = new Set(likedByRequester.filter(hasStringId).map((r) => r.commentId));

  const result: Record<string, CommentLikeInfo> = {};
  for (const id of commentIds) {
    result[id] = {
      likeCount: likeCountMap[id] || 0,
      isLiked: likedSet.has(id),
    };
  }

  return result;
}
