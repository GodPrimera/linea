import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCategoryBySlug, getAllCategories } from "@/lib/queries/categories";
import { getAllPublishedPosts } from "@/lib/queries/posts";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return {};
  return {
    title: category.name,
    description: category.description ?? `Browse all posts in ${category.name} on Linea.`,
    openGraph: {
      title: `${category.name} — Linea`,
      description: category.description ?? `Browse all posts in ${category.name}.`,
      type: "website",
    },
  };
}

export async function generateStaticParams() {
  const categories = await getAllCategories();
  return categories.map((c) => ({ slug: c.slug }));
}
import type { PostCard } from "@/lib/queries/posts";

function formatDate(date: Date | null) {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });
}

export async function generateStaticParams() {
  const categories = await getAllCategories();
  return categories.map((c) => ({ slug: c.slug }));
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [category, allPosts] = await Promise.all([
    getCategoryBySlug(slug),
    getAllPublishedPosts(),
  ]);

  if (!category) notFound();

  const posts = allPosts.filter((p) => p.categorySlug === slug);

  return (
    <div className="bg-white dark:bg-zinc-950 min-h-screen">

      {/* Hero */}
      <div className="relative w-full h-64 md:h-80 bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
        {category.coverImage ? (
          <Image
            src={category.coverImage}
            alt={category.name}
            fill priority
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-zinc-200 to-zinc-100 dark:from-zinc-800 dark:to-zinc-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 mx-auto max-w-6xl px-6 pb-10">
          <p className="text-xs tracking-[0.2em] uppercase text-white/60 mb-3">Category</p>
          <h1 className="font-display text-4xl md:text-5xl font-light text-white leading-tight">
            {category.name}
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6">

        {/* Description + count */}
        <div className="py-10 border-b border-zinc-100 dark:border-zinc-900 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          {category.description && (
            <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-xl">
              {category.description}
            </p>
          )}
          <p className="text-sm text-zinc-400 dark:text-zinc-600 shrink-0">
            {posts.length} {posts.length === 1 ? "post" : "posts"}
          </p>
        </div>

        {/* Posts grid */}
        {posts.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-sm text-zinc-400 dark:text-zinc-600">
              No posts in this category yet.
            </p>
            <Link href="/blog" className="mt-4 inline-block text-sm text-zinc-900 dark:text-zinc-50 underline underline-offset-2 hover:opacity-60 transition-opacity">
              Browse all posts
            </Link>
          </div>
        ) : (
          <div className="py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {posts.map((post: PostCard) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="group block space-y-4">

                <div className="overflow-hidden aspect-[3/2] bg-zinc-100 dark:bg-zinc-900">
                  {post.coverImageUrl && (
                    <Image
                      src={post.coverImageUrl}
                      alt={post.title}
                      width={600} height={400}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
                    />
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {post.readingTime && (
                    <span className="text-xs text-zinc-400 dark:text-zinc-600">
                      {post.readingTime} min read
                    </span>
                  )}
                  {post.tags.length > 0 && (
                    <>
                      <span className="text-zinc-200 dark:text-zinc-800">·</span>
                      {post.tags.slice(0, 2).map((tag) => (
                        <span key={tag.slug} className="text-xs text-zinc-400 dark:text-zinc-600">
                          {tag.name}
                        </span>
                      ))}
                    </>
                  )}
                </div>

                <h2 className="font-display text-2xl font-light text-zinc-900 dark:text-zinc-50 leading-snug group-hover:opacity-60 transition-opacity duration-200">
                  {post.title}
                </h2>

                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed line-clamp-2">
                  {post.excerpt}
                </p>

                <div className="flex items-center justify-between pt-1 border-t border-zinc-50 dark:border-zinc-900">
                  <div className="flex items-center gap-2">
                    {post.authorAvatarUrl && (
                      <div className="w-5 h-5 rounded-full overflow-hidden bg-zinc-200 dark:bg-zinc-800">
                        <Image
                          src={post.authorAvatarUrl}
                          alt={post.authorName}
                          width={20} height={20}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <span className="text-xs text-zinc-400 dark:text-zinc-600">
                      {post.authorName}
                    </span>
                  </div>
                  <span className="text-xs text-zinc-400 dark:text-zinc-600">
                    {formatDate(post.publishedAt)}
                  </span>
                </div>

              </Link>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
