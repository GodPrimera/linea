import { getAllPublishedPosts } from "@/lib/queries/posts";
import { getAllCategories, getAllTags } from "@/lib/queries/categories";
import BlogClient from "./[slug]/_components/BlogClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  description: "All posts — ideas, perspectives, and stories written with intention.",
  openGraph: {
    title: "Blog — Linea",
    description: "All posts — ideas, perspectives, and stories written with intention.",
    type: "website",
  },
  twitter: { card: "summary_large_image", title: "Blog — Linea" },
};

export default async function BlogPage() {
  const [posts, categories, tags] = await Promise.all([
    getAllPublishedPosts(),
    getAllCategories(),
    getAllTags(),
  ]);

  return (
    <div className="bg-white dark:bg-zinc-950 min-h-screen">
      <div className="mx-auto max-w-6xl px-6 pt-16 pb-12 border-b border-zinc-100 dark:border-zinc-900">
        <p className="text-xs tracking-[0.2em] uppercase text-zinc-400 dark:text-zinc-500 mb-4">
          All writing
        </p>
        <h1 className="font-display text-5xl md:text-6xl font-light text-zinc-900 dark:text-zinc-50 leading-[1.1]">
          The blog.
        </h1>
      </div>
      <BlogClient
        posts={posts}
        categories={categories.map((c) => ({ id: c.id, name: c.name, slug: c.slug }))}
        tags={tags.map((t) => ({ id: t.id, name: t.name, slug: t.slug }))}
      />
    </div>
  );
}
