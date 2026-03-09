import { db } from "@/lib/db";
import { comments, users, commentLikes, posts } from "@/lib/db/schema";
import { eq, and, sql, inArray, isNull, desc } from "drizzle-orm";

export type Comment = {
  id: string;
  content: string;
  createdAt: Date;
  parentId: string | null;
  isApproved: boolean;
  likeCount: number;
  author: {
    id: string;
    name: string;
    username: string;
    avatarUrl: string | null;
  } | null;
  replies: Comment[];
};

export type DashboardComment = {
  id: string;
  content: string;
  displayName: string;
  approved: boolean;
  createdAt: Date;
  postId: string;
  postTitle: string;
  postSlug: string;
  authorId: string | null;
  authorEmail: string | null;
};

export async function getCommentsByPost(postId: string): Promise<Comment[]> {
  const rows = await db
    .select({
      id: comments.id,
      content: comments.content,
      createdAt: comments.createdAt,
      parentId: comments.parentId,
      isApproved: comments.approved,
      authorId: users.id,
      authorName: users.name,
      authorUsername: users.username,
      authorAvatarUrl: users.avatarUrl,
    })
    .from(comments)
    .leftJoin(users, eq(users.id, comments.userId))
    .where(and(eq(comments.postId, postId), eq(comments.approved, true), isNull(comments.deletedAt)));

  if (rows.length === 0) return [];

  const commentIds = rows.map((r) => r.id);

  const likeCounts = await db
    .select({
      commentId: commentLikes.commentId,
      count: sql<number>`cast(count(*) as int)`,
    })
    .from(commentLikes)
    .where(inArray(commentLikes.commentId, commentIds))
    .groupBy(commentLikes.commentId);

  const likesByComment: Record<string, number> = {};
  for (const row of likeCounts) {
    likesByComment[row.commentId] = row.count;
  }

  const commentMap: Record<string, Comment> = {};
  const roots: Comment[] = [];

  for (const row of rows) {
    commentMap[row.id] = {
      id: row.id,
      content: row.content,
      createdAt: row.createdAt,
      parentId: row.parentId,
      isApproved: row.isApproved,
      likeCount: likesByComment[row.id] ?? 0,
      author: row.authorId
        ? {
            id: row.authorId,
            name: row.authorName!,
            username: row.authorUsername!,
            avatarUrl: row.authorAvatarUrl ?? null,
          }
        : null,
      replies: [],
    };
  }

  for (const comment of Object.values(commentMap)) {
    if (comment.parentId && commentMap[comment.parentId]) {
      commentMap[comment.parentId].replies.push(comment);
    } else if (!comment.parentId) {
      roots.push(comment);
    }
  }

  return roots.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

// All comments on posts authored by a given user — for dashboard moderation
export async function getCommentsByAuthor(authorId: string): Promise<DashboardComment[]> {
  const rows = await db
    .select({
      id: comments.id,
      content: comments.content,
      displayName: comments.displayName,
      approved: comments.approved,
      createdAt: comments.createdAt,
      postId: posts.id,
      postTitle: posts.title,
      postSlug: posts.slug,
      authorId: users.id,
      authorEmail: users.email,
    })
    .from(comments)
    .innerJoin(posts, eq(posts.id, comments.postId))
    .leftJoin(users, eq(users.id, comments.userId))
    .where(and(eq(posts.authorId, authorId), isNull(comments.deletedAt)))
    .orderBy(desc(comments.createdAt));

  return rows;
}