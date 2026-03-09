"use server";

import { db } from "@/lib/db";
import { posts, postTags, tags, categories } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getCurrentUser } from "@/lib/queries/users";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function calcReadingTime(content: string): number {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

function toSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// Resolve tag names → tag IDs, creating missing tags on the fly
async function resolveTagIds(tagNames: string[]): Promise<string[]> {
  if (tagNames.length === 0) return [];

  const ids: string[] = [];
  for (const rawName of tagNames) {
    const name = rawName.trim();
    if (!name) continue;
    const slug = toSlug(name);

    const existing = await db
      .select({ id: tags.id })
      .from(tags)
      .where(eq(tags.slug, slug))
      .limit(1);

    if (existing.length > 0) {
      ids.push(existing[0].id);
    } else {
      const inserted = await db
        .insert(tags)
        .values({ name, slug })
        .returning({ id: tags.id });
      ids.push(inserted[0].id);
    }
  }
  return ids;
}

// Resolve category name → category ID
async function resolveCategoryId(name: string): Promise<string | null> {
  if (!name.trim()) return null;
  const rows = await db
    .select({ id: categories.id })
    .from(categories)
    .where(eq(categories.name, name.trim()))
    .limit(1);
  return rows[0]?.id ?? null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type PostFormData = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  categoryName: string;
  tagNames: string[]; // comma-split already done by caller
  status: "draft" | "published" | "scheduled";
  isFeatured: boolean;
};

// ─────────────────────────────────────────────────────────────────────────────
// Create
// ─────────────────────────────────────────────────────────────────────────────

export async function createPostAction(data: PostFormData): Promise<{ slug: string }> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");

  const slug = data.slug.trim() || toSlug(data.title);
  const categoryId = await resolveCategoryId(data.categoryName);
  const tagIds = await resolveTagIds(data.tagNames);
  const readingTime = calcReadingTime(data.content);

  const [post] = await db
    .insert(posts)
    .values({
      title: data.title.trim(),
      slug,
      excerpt: data.excerpt.trim(),
      content: data.content,
      status: data.status,
      isFeatured: data.isFeatured,
      readingTime,
      categoryId,
      authorId: user.id,
      publishedAt: data.status === "published" ? new Date() : null,
    })
    .returning({ id: posts.id, slug: posts.slug });

  // Insert postTags
  if (tagIds.length > 0) {
    await db.insert(postTags).values(
      tagIds.map((tagId) => ({ postId: post.id, tagId }))
    );
  }

  revalidatePath("/dashboard/posts");
  revalidatePath("/blog");

  return { slug: post.slug };
}

// ─────────────────────────────────────────────────────────────────────────────
// Update
// ─────────────────────────────────────────────────────────────────────────────

export async function updatePostAction(
  postId: string,
  data: PostFormData
): Promise<{ slug: string }> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");

  // Ownership check
  const existing = await db
    .select({ id: posts.id, authorId: posts.authorId, publishedAt: posts.publishedAt, status: posts.status })
    .from(posts)
    .where(and(eq(posts.id, postId), eq(posts.authorId, user.id)))
    .limit(1);

  if (existing.length === 0) throw new Error("Not authorised");
  const prev = existing[0];

  const slug = data.slug.trim() || toSlug(data.title);
  const categoryId = await resolveCategoryId(data.categoryName);
  const tagIds = await resolveTagIds(data.tagNames);
  const readingTime = calcReadingTime(data.content);

  // Determine publishedAt
  const publishedAt =
    data.status === "published" && prev.status !== "published"
      ? new Date()
      : prev.publishedAt;

  await db
    .update(posts)
    .set({
      title: data.title.trim(),
      slug,
      excerpt: data.excerpt.trim(),
      content: data.content,
      status: data.status,
      isFeatured: data.isFeatured,
      readingTime,
      categoryId,
      publishedAt,
      updatedAt: new Date(),
    })
    .where(eq(posts.id, postId));

  // Replace tags: delete old, insert new
  await db.delete(postTags).where(eq(postTags.postId, postId));
  if (tagIds.length > 0) {
    await db.insert(postTags).values(
      tagIds.map((tagId) => ({ postId, tagId }))
    );
  }

  revalidatePath("/dashboard/posts");
  revalidatePath(`/blog/${slug}`);
  revalidatePath("/blog");

  return { slug };
}

// ─────────────────────────────────────────────────────────────────────────────
// Delete
// ─────────────────────────────────────────────────────────────────────────────

export async function deletePostAction(postId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");

  const existing = await db
    .select({ slug: posts.slug })
    .from(posts)
    .where(and(eq(posts.id, postId), eq(posts.authorId, user.id)))
    .limit(1);

  if (existing.length === 0) throw new Error("Not authorised");

  await db.delete(posts).where(eq(posts.id, postId));

  revalidatePath("/dashboard/posts");
  revalidatePath("/blog");
  redirect("/dashboard/posts");
}
