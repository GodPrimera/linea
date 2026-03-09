import Image from "next/image";
import Link from "next/link";
import { getFeaturedPost, getRecentPosts, getPopularPosts } from "@/lib/queries/posts";
import { getAllCategories } from "@/lib/queries/categories";
import NewsletterForm from "@/components/NewsletterForm";
import type { PostCard } from "@/lib/queries/posts";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Linea — Thoughtful Writing",
  description: "A space for thoughtful writing. Ideas, perspectives, and stories — written with intention.",
  openGraph: {
    title: "Linea — Thoughtful Writing",
    description: "A space for thoughtful writing. Ideas, perspectives, and stories — written with intention.",
    type: "website",
  },
  twitter: { card: "summary_large_image", title: "Linea — Thoughtful Writing" },
};

function formatDate(date: Date | null) {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });
}

function PostCard({ post }: { post: PostCard }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group block space-y-3">
      <div className="aspect-[16/9] overflow-hidden bg-zinc-100 dark:bg-zinc-900">
        {post.coverImageUrl ? (
          <Image
            src={post.coverImageUrl}
            alt={post.title}
            width={600}
            height={338}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-zinc-100 dark:bg-zinc-900" />
        )}
      </div>
      <div className="space-y-1.5">
        {post.categoryName && (
          <p className="text-xs tracking-widest uppercase text-zinc-400 dark:text-zinc-600">
            {post.categoryName}
          </p>
        )}
        <h3 className="font-display text-xl font-light text-zinc-900 dark:text-zinc-50 leading-snug group-hover:opacity-60 transition-opacity">
          {post.title}
        </h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed line-clamp-2">
          {post.excerpt}
        </p>
        <div className="flex items-center gap-2 text-xs text-zinc-400 dark:text-zinc-600 pt-1">
          <span>{formatDate(post.publishedAt)}</span>
          {post.readingTime && <><span>·</span><span>{post.readingTime} min read</span></>}
        </div>
      </div>
    </Link>
  );
}

export default async function HomePage() {
  const [featured, recent, popular, categories] = await Promise.all([
    getFeaturedPost(),
    getRecentPosts(6),
    getPopularPosts(4),
    getAllCategories(),
  ]);

  const recentExcludingFeatured = featured
    ? recent.filter((p) => p.id !== featured.id).slice(0, 3)
    : recent.slice(0, 3);

  return (
    <div className="bg-white dark:bg-zinc-950">

      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-6xl px-6 py-20 border-b border-zinc-100 dark:border-zinc-900">
        <div className="max-w-2xl space-y-4">
          <p className="text-xs tracking-[0.25em] uppercase text-zinc-400 dark:text-zinc-500">
            A space to think slowly
          </p>
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-light text-zinc-900 dark:text-zinc-50 leading-[1.05]">
            Writing worth<br />
            <span className="italic">reading twice.</span>
          </h1>
          <p className="text-base text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-lg">
            Essays on craft, process, and the art of building things slowly.
            Published when ready — not on a schedule.
          </p>
        </div>
      </div>

      {/* ── FEATURED POST ───────────────────────────────────────────────── */}
      {featured && (
        <div className="mx-auto max-w-6xl px-6 py-16 border-b border-zinc-100 dark:border-zinc-900">
          <p className="text-xs tracking-[0.2em] uppercase text-zinc-400 dark:text-zinc-500 mb-8">
            Featured
          </p>
          <Link href={`/blog/${featured.slug}`} className="group grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="aspect-[4/3] overflow-hidden bg-zinc-100 dark:bg-zinc-900">
              {featured.coverImageUrl ? (
                <Image
                  src={featured.coverImageUrl}
                  alt={featured.title}
                  width={800}
                  height={600}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  priority
                />
              ) : (
                <div className="w-full h-full bg-zinc-100 dark:bg-zinc-900" />
              )}
            </div>
            <div className="space-y-4">
              {featured.categoryName && (
                <p className="text-xs tracking-widest uppercase text-zinc-400 dark:text-zinc-600">
                  {featured.categoryName}
                </p>
              )}
              <h2 className="font-display text-3xl md:text-4xl font-light text-zinc-900 dark:text-zinc-50 leading-snug group-hover:opacity-60 transition-opacity">
                {featured.title}
              </h2>
              <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed">
                {featured.excerpt}
              </p>
              <div className="flex items-center gap-3 pt-2">
                {featured.authorAvatarUrl && (
                  <Image src={featured.authorAvatarUrl} alt={featured.authorName} width={28} height={28} className="rounded-full" />
                )}
                <span className="text-sm text-zinc-500 dark:text-zinc-400">{featured.authorName}</span>
                <span className="text-zinc-200 dark:text-zinc-800">·</span>
                <span className="text-sm text-zinc-400 dark:text-zinc-600">{formatDate(featured.publishedAt)}</span>
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* ── RECENT POSTS ────────────────────────────────────────────────── */}
      {recentExcludingFeatured.length > 0 && (
        <div className="mx-auto max-w-6xl px-6 py-16 border-b border-zinc-100 dark:border-zinc-900">
          <div className="flex items-center justify-between mb-8">
            <p className="text-xs tracking-[0.2em] uppercase text-zinc-400 dark:text-zinc-500">Recent</p>
            <Link href="/blog" className="text-xs text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors">
              All posts →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {recentExcludingFeatured.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      )}

      {/* ── POPULAR + CATEGORIES ────────────────────────────────────────── */}
      <div className="mx-auto max-w-6xl px-6 py-16 border-b border-zinc-100 dark:border-zinc-900">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {popular.length > 0 && (
            <div className="lg:col-span-2 space-y-6">
              <p className="text-xs tracking-[0.2em] uppercase text-zinc-400 dark:text-zinc-500">Popular</p>
              <div className="space-y-6 divide-y divide-zinc-50 dark:divide-zinc-900">
                {popular.map((post, i) => (
                  <Link key={post.id} href={`/blog/${post.slug}`} className="group flex items-start gap-5 pt-6 first:pt-0">
                    <span className="font-display text-4xl font-light text-zinc-100 dark:text-zinc-900 shrink-0 leading-none">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="space-y-1">
                      <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-50 leading-snug group-hover:opacity-60 transition-opacity">
                        {post.title}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-zinc-400 dark:text-zinc-600">
                        {post.categoryName && <span>{post.categoryName}</span>}
                        {post.readingTime && <><span>·</span><span>{post.readingTime} min</span></>}
                        <span>·</span>
                        <span>{post.likeCount} likes</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
          {categories.length > 0 && (
            <div className="space-y-6">
              <p className="text-xs tracking-[0.2em] uppercase text-zinc-400 dark:text-zinc-500">Categories</p>
              <div className="space-y-2">
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/categories/${cat.slug}`}
                    className="group flex items-center justify-between py-3 border-b border-zinc-50 dark:border-zinc-900 last:border-0"
                  >
                    <span className="text-sm text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-zinc-50 transition-colors">
                      {cat.name}
                    </span>
                    <span className="text-xs text-zinc-400 dark:text-zinc-600">{cat.postCount}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      

      {/* ── NEWSLETTER ──────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="max-w-lg space-y-5">
          <p className="text-xs tracking-[0.2em] uppercase text-zinc-400 dark:text-zinc-500">Newsletter</p>
          <h2 className="font-display text-3xl font-light text-zinc-900 dark:text-zinc-50">
            Get new essays in your inbox.
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
            No noise, no schedule. Just new writing when it's ready.
          </p>
          <NewsletterForm />
        </div>
      </div>

    </div>
  );
}
