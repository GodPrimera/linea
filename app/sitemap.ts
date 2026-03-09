import type { MetadataRoute } from "next";
import { getAllPublishedPosts } from "@/lib/queries/posts";
import { getAllCategories } from "@/lib/queries/categories";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { isNotNull, isNull } from "drizzle-orm";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://linea.blog";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, categories, authors] = await Promise.all([
    getAllPublishedPosts(),
    getAllCategories(),
    db
      .select({ username: users.username, updatedAt: users.updatedAt })
      .from(users)
      .where(isNull(users.deletedAt)),
  ]);

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${siteUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/categories`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${siteUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${siteUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ];

  // Posts
  const postPages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${siteUrl}/blog/${post.slug}`,
    lastModified: post.publishedAt ?? new Date(),
    changeFrequency: "weekly",
    priority: post.isFeatured ? 0.9 : 0.8,
  }));

  // Categories
  const categoryPages: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${siteUrl}/categories/${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  // Author pages
  const authorPages: MetadataRoute.Sitemap = authors.map((author) => ({
    url: `${siteUrl}/author/${author.username}`,
    lastModified: author.updatedAt ?? new Date(),
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticPages, ...postPages, ...categoryPages, ...authorPages];
}