import { db } from "@/lib/db";
import { posts, likes, comments, follows, postViews, notifications, categories } from "@/lib/db/schema";
import { eq, desc, sql, and } from "drizzle-orm";

export async function getDashboardStats(authorId: string) {
  // postViews has one row per view — count rows rather than sum a column
  const [viewCount] = await db
    .select({ total: sql<number>`cast(count(*) as int)` })
    .from(postViews)
    .innerJoin(posts, eq(posts.id, postViews.postId))
    .where(eq(posts.authorId, authorId));

  const [likeCount] = await db
    .select({ total: sql<number>`cast(count(*) as int)` })
    .from(likes)
    .innerJoin(posts, eq(posts.id, likes.postId))
    .where(eq(posts.authorId, authorId));

  const [publishedCount] = await db
    .select({ total: sql<number>`cast(count(*) as int)` })
    .from(posts)
    .where(and(eq(posts.authorId, authorId), eq(posts.status, "published")));

  const [draftCount] = await db
    .select({ total: sql<number>`cast(count(*) as int)` })
    .from(posts)
    .where(and(eq(posts.authorId, authorId), eq(posts.status, "draft")));

  const [followerCount] = await db
    .select({ total: sql<number>`cast(count(*) as int)` })
    .from(follows)
    .where(eq(follows.followingId, authorId));

  return {
    totalViews: viewCount?.total ?? 0,
    totalLikes: likeCount?.total ?? 0,
    publishedPosts: publishedCount?.total ?? 0,
    draftPosts: draftCount?.total ?? 0,
    followers: followerCount?.total ?? 0,
  };
}

export async function getTopPostsForDashboard(authorId: string, limit = 5) {
  const likeSub = db
    .select({
      postId: likes.postId,
      count: sql<number>`cast(count(*) as int)`.as("like_count"),
    })
    .from(likes)
    .groupBy(likes.postId)
    .as("like_sub");

  const commentSub = db
    .select({
      postId: comments.postId,
      count: sql<number>`cast(count(*) as int)`.as("comment_count"),
    })
    .from(comments)
    .where(eq(comments.approved, true))
    .groupBy(comments.postId)
    .as("comment_sub");

  // postViews: one row per view, so count rows grouped by postId
  const viewSub = db
    .select({
      postId: postViews.postId,
      total: sql<number>`cast(count(*) as int)`.as("view_total"),
    })
    .from(postViews)
    .groupBy(postViews.postId)
    .as("view_sub");

  return db
    .select({
      id: posts.id,
      slug: posts.slug,
      title: posts.title,
      publishedAt: posts.publishedAt,
      views: sql<number>`coalesce(${viewSub.total}, 0)`,
      likes: sql<number>`coalesce(${likeSub.count}, 0)`,
      comments: sql<number>`coalesce(${commentSub.count}, 0)`,
    })
    .from(posts)
    .leftJoin(likeSub, eq(likeSub.postId, posts.id))
    .leftJoin(commentSub, eq(commentSub.postId, posts.id))
    .leftJoin(viewSub, eq(viewSub.postId, posts.id))
    .where(and(eq(posts.authorId, authorId), eq(posts.status, "published")))
    .orderBy(desc(sql`coalesce(${viewSub.total}, 0)`))
    .limit(limit);
}

export async function getAuthorPosts(authorId: string) {
  const likeSub = db
    .select({
      postId: likes.postId,
      count: sql<number>`cast(count(*) as int)`.as("like_count"),
    })
    .from(likes)
    .groupBy(likes.postId)
    .as("like_sub");

  const viewSub = db
    .select({
      postId: postViews.postId,
      total: sql<number>`cast(count(*) as int)`.as("view_total"),
    })
    .from(postViews)
    .groupBy(postViews.postId)
    .as("view_sub");

  return db
    .select({
      id: posts.id,
      slug: posts.slug,
      title: posts.title,
      status: posts.status,
      publishedAt: posts.publishedAt,
      isFeatured: posts.isFeatured,
      views: sql<number>`coalesce(${viewSub.total}, 0)`,
      likes: sql<number>`coalesce(${likeSub.count}, 0)`,
      categoryId: categories.id,
      categoryName: categories.name,
    })
    .from(posts)
    .leftJoin(categories, eq(categories.id, posts.categoryId))
    .leftJoin(likeSub, eq(likeSub.postId, posts.id))
    .leftJoin(viewSub, eq(viewSub.postId, posts.id))
    .where(eq(posts.authorId, authorId))
    .orderBy(desc(posts.updatedAt));
}

export async function getRecentActivityForDashboard(authorId: string, limit = 8) {
  return db
    .select({
      id: notifications.id,
      type: notifications.type,
      title: notifications.title,
      body: notifications.body,
      isRead: notifications.isRead,
      createdAt: notifications.createdAt,
    })
    .from(notifications)
    .where(eq(notifications.userId, authorId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit);
}
