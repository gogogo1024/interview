import { and, eq, inArray, sql } from "drizzle-orm";
import { db, schema } from "../db";

const { likes, comments } = schema;

export interface PostCounts {
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
}

type IdRow = { postId: string | null };
type CountRow = IdRow & { count: number };

function hasStringId<T extends IdRow>(row: T): row is T & { postId: string } {
  return row.postId !== null && row.postId !== undefined;
}

/**
 * Fetch like/comment counts and like-status for a batch of post IDs in O(1) queries.
 */
export async function getCountsForPostIds(postIds: string[], userId?: string) {
  if (!postIds || postIds.length === 0) return {} as Record<string, PostCounts>;

  // like counts per post
  const likeCounts = await db
    .select({ postId: likes.postId, count: sql<number>`count(*)` })
    .from(likes)
    .where(inArray(likes.postId, postIds))
    .groupBy(likes.postId);

  // comment counts per post
  const commentCounts = await db
    .select({ postId: comments.postId, count: sql<number>`count(*)` })
    .from(comments)
    .where(inArray(comments.postId, postIds))
    .groupBy(comments.postId);

  // liked-by-requester map
  let likedByRequester: Array<IdRow> = [];
  if (userId) {
    likedByRequester = await db
      .select({ postId: likes.postId })
      .from(likes)
      .where(and(inArray(likes.postId, postIds), eq(likes.userId, userId)));
  }

  const likeCountMap: Record<string, number> = {};
  for (const row of likeCounts as CountRow[]) {
    if (!hasStringId(row)) continue;
    likeCountMap[row.postId] = row.count || 0;
  }

  const commentCountMap: Record<string, number> = {};
  for (const row of commentCounts as CountRow[]) {
    if (!hasStringId(row)) continue;
    commentCountMap[row.postId] = row.count || 0;
  }

  const likedSet = new Set(likedByRequester.filter(hasStringId).map((r) => r.postId));

  const result: Record<string, PostCounts> = {};
  for (const id of postIds) {
    result[id] = {
      likeCount: likeCountMap[id] || 0,
      commentCount: commentCountMap[id] || 0,
      isLiked: likedSet.has(id),
    };
  }

  return result;
}
