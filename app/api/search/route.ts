import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { posts, users, tags, categories, media, follows } from "@/lib/db/schema";
import { ilike, eq, or, and, sql, isNull } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";

  if (!q || q.length < 2) {
    return NextResponse.json({ posts: [], authors: [], tags: [], categories: [] });
  }

  const pattern = `%${q}%`;

  const [matchedPosts, matchedUsers, matchedTags, matchedCategories] = await Promise.all([
    // Posts
    db
      .select({
        id: posts.id,
        slug: posts.slug,
        title: posts.title,
        excerpt: posts.excerpt,
        coverImageUrl: media.url,
        readingTime: posts.readingTime,
        categoryName: categories.name,
        categorySlug: categories.slug,
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
          or(
            ilike(posts.title, pattern),
            ilike(posts.excerpt, pattern),
            ilike(users.name, pattern),
            ilike(categories.name, pattern)
          )
        )
      )
      .limit(10),

    // Authors
    db
      .select({
        id: users.id,
        username: users.username,
        name: users.name,
        bio: users.bio,
        avatarUrl: users.avatarUrl,
        postCount: sql<number>`cast(count(distinct ${posts.id}) as int)`,
      })
      .from(users)
      .leftJoin(posts, and(eq(posts.authorId, users.id), eq(posts.status, "published")))
      .where(
        and(
          isNull(users.deletedAt),
          or(
            ilike(users.name, pattern),
            ilike(users.username, pattern),
            ilike(users.bio, pattern)
          )
        )
      )
      .groupBy(users.id)
      .limit(5),

    // Tags
    db
      .select({ id: tags.id, name: tags.name, slug: tags.slug })
      .from(tags)
      .where(ilike(tags.name, pattern))
      .limit(8),

    // Categories
    db
      .select({ id: categories.id, name: categories.name, slug: categories.slug })
      .from(categories)
      .where(ilike(categories.name, pattern))
      .limit(5),
  ]);

  return NextResponse.json({
    posts: matchedPosts,
    authors: matchedUsers,
    tags: matchedTags,
    categories: matchedCategories,
  });
}