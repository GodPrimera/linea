import { db } from "@/lib/db";
import { categories, tags, posts } from "@/lib/db/schema";
import { eq, sql, desc } from "drizzle-orm";

export async function getAllCategories() {
  return db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
      description: categories.description,
      coverImage: categories.coverImage,
      postCount: sql<number>`cast(count(${posts.id}) as int)`,
    })
    .from(categories)
    .leftJoin(posts, eq(posts.categoryId, categories.id))
    .groupBy(categories.id)
    .orderBy(desc(sql`count(${posts.id})`));
}

export async function getCategoryBySlug(slug: string) {
  const rows = await db
    .select()
    .from(categories)
    .where(eq(categories.slug, slug))
    .limit(1);
  return rows[0] ?? null;
}

export async function getAllTags() {
  return db.select().from(tags).orderBy(tags.name);
}
