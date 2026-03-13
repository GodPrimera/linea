import { db } from "@/lib/db";
import { posts, users, categories } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import AdminPostsClient from "./_components/AdminPostsClient";

async function getAllPosts() {
  return db
    .select({
      id: posts.id,
      title: posts.title,
      slug: posts.slug,
      status: posts.status,
      publishedAt: posts.publishedAt,
      createdAt: posts.createdAt,
      authorName: users.name,
      authorUsername: users.username,
      categoryName: categories.name,
    })
    .from(posts)
    .leftJoin(users, eq(users.id, posts.authorId))
    .leftJoin(categories, eq(categories.id, posts.categoryId))
    .orderBy(posts.createdAt);
}

export default async function AdminPostsPage() {
  const allPosts = await getAllPosts();
  return <AdminPostsClient initialPosts={allPosts} />;
}
