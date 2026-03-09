import { db } from "@/lib/db";
import { posts, users, categories, tags, postTags, likes, bookmarks, media } from "@/lib/db/schema";
import { eq, desc, and, sql, inArray, ne } from "drizzle-orm";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type PostCard = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImageUrl: string | null;
  readingTime: number | null;
  publishedAt: Date | null;
  isFeatured: boolean;
  likeCount: number;
  categoryId: string | null;
  categoryName: string | null;
  categorySlug: string | null;
  authorId: string;
  authorName: string;
  authorUsername: string;
  authorAvatarUrl: string | null;
  authorBio?: string | null;
  tags: { id: string; name: string; slug: string }[];
};

// ─────────────────────────────────────────────────────────────────────────────
// Helper: attach tags + like counts to a list of posts
// ─────────────────────────────────────────────────────────────────────────────

async function withTagsAndLikes(
  rawPosts: Omit<PostCard, "tags" | "likeCount">[]
): Promise<PostCard[]> {
  if (rawPosts.length === 0) return [];
  const ids = rawPosts.map((p) => p.id);

  const tagRows = await db
    .select({
      postId: postTags.postId,
      tagId: tags.id,
      tagName: tags.name,
      tagSlug: tags.slug,
    })
    .from(postTags)
    .innerJoin(tags, eq(tags.id, postTags.tagId))
    .where(inArray(postTags.postId, ids));

  const tagMap: Record<string, { id: string; name: string; slug: string }[]> = {};
  for (const r of tagRows) {
    if (!tagMap[r.postId]) tagMap[r.postId] = [];
    tagMap[r.postId].push({ id: r.tagId, name: r.tagName, slug: r.tagSlug });
  }

  const likeRows = await db
    .select({
      postId: likes.postId,
      count: sql<number>`cast(count(*) as int)`,
    })
    .from(likes)
    .where(inArray(likes.postId, ids))
    .groupBy(likes.postId);

  const likeMap: Record<string, number> = {};
  for (const r of likeRows) {
    if (r.postId) likeMap[r.postId] = r.count;
  }

  return rawPosts.map((p) => ({
    ...p,
    tags: tagMap[p.id] ?? [],
    likeCount: likeMap[p.id] ?? 0,
  }));
}

// ─────────────────────────────────────────────────────────────────────────────
// Queries
// ─────────────────────────────────────────────────────────────────────────────

export async function getFeaturedPost(): Promise<PostCard | null> {
  const rows = await db
    .select({
      id: posts.id,
      slug: posts.slug,
      title: posts.title,
      excerpt: posts.excerpt,
      coverImageUrl: media.url,
      readingTime: posts.readingTime,
      publishedAt: posts.publishedAt,
      isFeatured: posts.isFeatured,
      categoryId: categories.id,
      categoryName: categories.name,
      categorySlug: categories.slug,
      authorId: users.id,
      authorName: users.name,
      authorUsername: users.username,
      authorAvatarUrl: users.avatarUrl,
    })
    .from(posts)
    .leftJoin(users, eq(users.id, posts.authorId))
    .leftJoin(categories, eq(categories.id, posts.categoryId))
    .leftJoin(media, eq(media.id, posts.coverImageId))
    .where(and(eq(posts.status, "published"), eq(posts.isFeatured, true)))
    .orderBy(desc(posts.publishedAt))
    .limit(1);

  if (rows.length === 0) return null;
  const result = await withTagsAndLikes(rows);
  return result[0];
}

export async function getRecentPosts(limit = 6): Promise<PostCard[]> {
  const rows = await db
    .select({
      id: posts.id,
      slug: posts.slug,
      title: posts.title,
      excerpt: posts.excerpt,
      coverImageUrl: media.url,
      readingTime: posts.readingTime,
      publishedAt: posts.publishedAt,
      isFeatured: posts.isFeatured,
      categoryId: categories.id,
      categoryName: categories.name,
      categorySlug: categories.slug,
      authorId: users.id,
      authorName: users.name,
      authorUsername: users.username,
      authorAvatarUrl: users.avatarUrl,
    })
    .from(posts)
    .leftJoin(users, eq(users.id, posts.authorId))
    .leftJoin(categories, eq(categories.id, posts.categoryId))
    .leftJoin(media, eq(media.id, posts.coverImageId))
    .where(eq(posts.status, "published"))
    .orderBy(desc(posts.publishedAt))
    .limit(limit);

  return withTagsAndLikes(rows);
}

export async function getPopularPosts(limit = 4): Promise<PostCard[]> {
  const likeSub = db
    .select({
      postId: likes.postId,
      count: sql<number>`cast(count(*) as int)`.as("like_count"),
    })
    .from(likes)
    .groupBy(likes.postId)
    .as("like_sub");

  const rows = await db
    .select({
      id: posts.id,
      slug: posts.slug,
      title: posts.title,
      excerpt: posts.excerpt,
      coverImageUrl: media.url,
      readingTime: posts.readingTime,
      publishedAt: posts.publishedAt,
      isFeatured: posts.isFeatured,
      categoryId: categories.id,
      categoryName: categories.name,
      categorySlug: categories.slug,
      authorId: users.id,
      authorName: users.name,
      authorUsername: users.username,
      authorAvatarUrl: users.avatarUrl,
    })
    .from(posts)
    .leftJoin(users, eq(users.id, posts.authorId))
    .leftJoin(categories, eq(categories.id, posts.categoryId))
    .leftJoin(media, eq(media.id, posts.coverImageId))
    .leftJoin(likeSub, eq(likeSub.postId, posts.id))
    .where(eq(posts.status, "published"))
    .orderBy(desc(sql`coalesce(${likeSub.count}, 0)`))
    .limit(limit);

  return withTagsAndLikes(rows);
}

export async function getAllPublishedPosts(): Promise<PostCard[]> {
  const rows = await db
    .select({
      id: posts.id,
      slug: posts.slug,
      title: posts.title,
      excerpt: posts.excerpt,
      coverImageUrl: media.url,
      readingTime: posts.readingTime,
      publishedAt: posts.publishedAt,
      isFeatured: posts.isFeatured,
      categoryId: categories.id,
      categoryName: categories.name,
      categorySlug: categories.slug,
      authorId: users.id,
      authorName: users.name,
      authorUsername: users.username,
      authorAvatarUrl: users.avatarUrl,
    })
    .from(posts)
    .leftJoin(users, eq(users.id, posts.authorId))
    .leftJoin(categories, eq(categories.id, posts.categoryId))
    .leftJoin(media, eq(media.id, posts.coverImageId))
    .where(eq(posts.status, "published"))
    .orderBy(desc(posts.publishedAt));

  return withTagsAndLikes(rows);
}

export async function getPostBySlug(slug: string) {
  const rows = await db
    .select({
      id: posts.id,
      slug: posts.slug,
      title: posts.title,
      excerpt: posts.excerpt,
      content: posts.content,
      contentFormat: posts.contentFormat,
      coverImageUrl: media.url,
      readingTime: posts.readingTime,
      publishedAt: posts.publishedAt,
      isFeatured: posts.isFeatured,
      allowComments: posts.allowComments,
      allowLikes: posts.allowLikes,
      metaTitle: posts.metaTitle,
      metaDescription: posts.metaDescription,
      categoryId: categories.id,
      categoryName: categories.name,
      categorySlug: categories.slug,
      authorId: users.id,
      authorName: users.name,
      authorUsername: users.username,
      authorAvatarUrl: users.avatarUrl,
      authorBio: users.bio,
    })
    .from(posts)
    .leftJoin(users, eq(users.id, posts.authorId))
    .leftJoin(categories, eq(categories.id, posts.categoryId))
    .leftJoin(media, eq(media.id, posts.coverImageId))
    .where(and(eq(posts.slug, slug), eq(posts.status, "published")))
    .limit(1);

  if (rows.length === 0) return null;
  const result = await withTagsAndLikes(rows);
  return result[0];
}

export async function getRelatedPosts(
  postId: string,
  categoryId: string | null,
  limit = 3
): Promise<PostCard[]> {
  const rows = await db
    .select({
      id: posts.id,
      slug: posts.slug,
      title: posts.title,
      excerpt: posts.excerpt,
      coverImageUrl: media.url,
      readingTime: posts.readingTime,
      publishedAt: posts.publishedAt,
      isFeatured: posts.isFeatured,
      categoryId: categories.id,
      categoryName: categories.name,
      categorySlug: categories.slug,
      authorId: users.id,
      authorName: users.name,
      authorUsername: users.username,
      authorAvatarUrl: users.avatarUrl,
    })
    .from(posts)
    .leftJoin(users, eq(users.id, posts.authorId))
    .leftJoin(categories, eq(categories.id, posts.categoryId))
    .leftJoin(media, eq(media.id, posts.coverImageId))
    .where(
      and(
        eq(posts.status, "published"),
        ne(posts.id, postId),
        categoryId ? eq(posts.categoryId, categoryId) : undefined
      )
    )
    .orderBy(desc(posts.publishedAt))
    .limit(limit);

  return withTagsAndLikes(rows);
}

export async function getPostsByAuthor(authorId: string): Promise<PostCard[]> {
  const rows = await db
    .select({
      id: posts.id,
      slug: posts.slug,
      title: posts.title,
      excerpt: posts.excerpt,
      coverImageUrl: media.url,
      readingTime: posts.readingTime,
      publishedAt: posts.publishedAt,
      isFeatured: posts.isFeatured,
      categoryId: categories.id,
      categoryName: categories.name,
      categorySlug: categories.slug,
      authorId: users.id,
      authorName: users.name,
      authorUsername: users.username,
      authorAvatarUrl: users.avatarUrl,
    })
    .from(posts)
    .leftJoin(users, eq(users.id, posts.authorId))
    .leftJoin(categories, eq(categories.id, posts.categoryId))
    .leftJoin(media, eq(media.id, posts.coverImageId))
    .where(and(eq(posts.authorId, authorId), eq(posts.status, "published")))
    .orderBy(desc(posts.publishedAt));

  return withTagsAndLikes(rows);
}

export async function getUserBookmarks(
  userId: string
): Promise<(PostCard & { bookmarkedAt: Date })[]> {
  const rows = await db
    .select({
      id: posts.id,
      slug: posts.slug,
      title: posts.title,
      excerpt: posts.excerpt,
      coverImageUrl: media.url,
      readingTime: posts.readingTime,
      publishedAt: posts.publishedAt,
      isFeatured: posts.isFeatured,
      categoryId: categories.id,
      categoryName: categories.name,
      categorySlug: categories.slug,
      authorId: users.id,
      authorName: users.name,
      authorUsername: users.username,
      authorAvatarUrl: users.avatarUrl,
      bookmarkedAt: bookmarks.createdAt,
    })
    .from(bookmarks)
    .innerJoin(posts, eq(posts.id, bookmarks.postId))
    .leftJoin(users, eq(users.id, posts.authorId))
    .leftJoin(categories, eq(categories.id, posts.categoryId))
    .leftJoin(media, eq(media.id, posts.coverImageId))
    .where(and(eq(bookmarks.userId, userId), eq(posts.status, "published")))
    .orderBy(desc(bookmarks.createdAt));

  const withExtras = await withTagsAndLikes(rows);
  return withExtras.map((p, i) => ({ ...p, bookmarkedAt: rows[i].bookmarkedAt! }));
}