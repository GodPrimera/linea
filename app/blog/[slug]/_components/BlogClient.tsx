"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import type { PostCard } from "@/lib/queries/posts";

const POSTS_PER_PAGE = 6;

interface BlogClientProps {
  posts: PostCard[];
  categories: { name: string; slug: string }[];
  tags: { name: string; slug: string }[];
}

function PostCardItem({ post }: { post: PostCard }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group block break-inside-avoid mb-6">
      <div className="border border-zinc-100 dark:border-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors duration-200 overflow-hidden">
        {post.coverImageUrl && (
          <div className="overflow-hidden bg-zinc-100 dark:bg-zinc-900">
            <Image
              src={post.coverImageUrl}
              alt={post.title}
              width={600}
              height={400}
              className="w-full object-cover group-hover:scale-[1.02] transition-transform duration-500 ease-out"
            />
          </div>
        )}
        <div className="p-5 space-y-3">
          <div className="flex items-center gap-2">
            {post.categoryName && (
              <span className="text-xs tracking-widest uppercase text-zinc-400 dark:text-zinc-600">
                {post.categoryName}
              </span>
            )}
            {post.categoryName && post.readingTime && <span className="text-zinc-200 dark:text-zinc-800">·</span>}
            {post.readingTime && (
              <span className="text-xs text-zinc-400 dark:text-zinc-600">{post.readingTime} min</span>
            )}
          </div>

          <h2 className="font-display text-2xl font-light text-zinc-900 dark:text-zinc-50 leading-snug group-hover:opacity-60 transition-opacity duration-200">
            {post.title}
          </h2>

          <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed line-clamp-3">
            {post.excerpt}
          </p>

          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {post.tags.map((tag) => (
                <span key={tag.slug} className="text-xs px-2 py-0.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400">
                  {tag.name}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-zinc-50 dark:border-zinc-900">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                {post.authorAvatarUrl && (
                  <Image src={post.authorAvatarUrl} alt={post.authorName} width={20} height={20} className="w-full h-full object-cover" />
                )}
              </div>
              <span className="text-xs text-zinc-400 dark:text-zinc-600">{post.authorName}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-zinc-400 dark:text-zinc-600">
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                <path d="M8 13.5C8 13.5 1.5 9.5 1.5 5.5C1.5 3.57 3.07 2 5 2C6.19 2 7.25 2.61 8 3.5C8.75 2.61 9.81 2 11 2C12.93 2 14.5 3.57 14.5 5.5C14.5 9.5 8 13.5 8 13.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {post.likeCount}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function BlogClient({ posts, categories, tags }: BlogClientProps) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [sort, setSort] = useState<"latest" | "popular" | "oldest">("latest");
  const [page, setPage] = useState(1);
  const [showTagFilter, setShowTagFilter] = useState(false);

  const filtered = useMemo(() => {
    let result = [...posts];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.excerpt.toLowerCase().includes(q) ||
          (p.categoryName ?? "").toLowerCase().includes(q)
      );
    }
    if (activeCategory) result = result.filter((p) => p.categorySlug === activeCategory);
    if (activeTag) result = result.filter((p) => p.tags.some((t) => t.slug === activeTag));
    if (sort === "latest") result.sort((a, b) => (b.publishedAt?.getTime() ?? 0) - (a.publishedAt?.getTime() ?? 0));
    else if (sort === "oldest") result.sort((a, b) => (a.publishedAt?.getTime() ?? 0) - (b.publishedAt?.getTime() ?? 0));
    else if (sort === "popular") result.sort((a, b) => b.likeCount - a.likeCount);
    return result;
  }, [posts, search, activeCategory, activeTag, sort]);

  const totalPages = Math.ceil(filtered.length / POSTS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE);
  const hasActiveFilters = !!activeCategory || !!activeTag || search.trim() !== "";
  const resetPage = () => setPage(1);

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">

      <div className="space-y-4 mb-10">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="relative w-full sm:w-72">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" width="14" height="14" viewBox="0 0 16 16" fill="none">
              <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); resetPage(); }}
              placeholder="Search posts..."
              className="w-full pl-9 pr-4 py-2 border border-zinc-200 dark:border-zinc-800 bg-transparent text-sm text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-50 transition-colors"
            />
            {search && (
              <button onClick={() => { setSearch(""); resetPage(); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            )}
          </div>

          <div className="flex items-center gap-1 text-sm">
            <span className="text-xs text-zinc-400 dark:text-zinc-600 mr-2 tracking-wide">Sort:</span>
            {(["latest", "popular", "oldest"] as const).map((s) => (
              <button key={s} onClick={() => { setSort(s); resetPage(); }}
                className={`px-3 py-1.5 text-xs capitalize transition-colors duration-200 ${sort === s ? "bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900" : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 border border-zinc-200 dark:border-zinc-800"}`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => { setActiveCategory(null); resetPage(); }}
            className={`px-3 py-1.5 text-xs tracking-wide transition-colors duration-200 ${!activeCategory ? "bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900" : "border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:border-zinc-400"}`}>
            All
          </button>
          {categories.map((cat) => (
            <button key={cat.slug} onClick={() => { setActiveCategory(activeCategory === cat.slug ? null : cat.slug); resetPage(); }}
              className={`px-3 py-1.5 text-xs tracking-wide transition-colors duration-200 ${activeCategory === cat.slug ? "bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900" : "border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:border-zinc-400"}`}>
              {cat.name}
            </button>
          ))}
          <button onClick={() => setShowTagFilter(!showTagFilter)}
            className={`px-3 py-1.5 text-xs tracking-wide transition-colors duration-200 flex items-center gap-1.5 ${activeTag ? "bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900" : "border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:border-zinc-400"}`}>
            Tags
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className={`transition-transform duration-200 ${showTagFilter ? "rotate-180" : ""}`}>
              <path d="M1 3l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {showTagFilter && (
          <div className="flex flex-wrap gap-2 pt-1 animate-in fade-in slide-in-from-top-1 duration-200">
            {tags.map((tag) => (
              <button key={tag.slug} onClick={() => { setActiveTag(activeTag === tag.slug ? null : tag.slug); resetPage(); }}
                className={`px-3 py-1 text-xs transition-colors duration-200 ${activeTag === tag.slug ? "bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900" : "border border-zinc-100 dark:border-zinc-900 text-zinc-400 dark:text-zinc-600 hover:border-zinc-300 hover:text-zinc-700 dark:hover:border-zinc-700 dark:hover:text-zinc-300"}`}>
                {tag.name}
              </button>
            ))}
          </div>
        )}

        {hasActiveFilters && (
          <div className="flex items-center gap-3 text-xs text-zinc-400 dark:text-zinc-600">
            <span>{filtered.length} {filtered.length === 1 ? "post" : "posts"} found</span>
            <button onClick={() => { setSearch(""); setActiveCategory(null); setActiveTag(null); setPage(1); }}
              className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors underline underline-offset-2">
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {paginated.length > 0 ? (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6">
          {paginated.map((post) => <PostCardItem key={post.id} post={post} />)}
        </div>
      ) : (
        <div className="py-24 text-center">
          <p className="font-display text-3xl font-light text-zinc-300 dark:text-zinc-700 mb-3">No posts found</p>
          <p className="text-sm text-zinc-400 dark:text-zinc-600">Try adjusting your search or filters</p>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-16">
          <button onClick={() => setPage(page - 1)} disabled={page === 1}
            className="p-2 border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:border-zinc-900 dark:hover:border-zinc-50 hover:text-zinc-900 dark:hover:text-zinc-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-200"
            aria-label="Previous page">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
            const isActive = p === page;
            const isNear = Math.abs(p - page) <= 1;
            const isEdge = p === 1 || p === totalPages;
            if (!isNear && !isEdge) {
              if (p === 2 || p === totalPages - 1) return <span key={p} className="text-zinc-300 dark:text-zinc-700 text-sm">···</span>;
              return null;
            }
            return (
              <button key={p} onClick={() => setPage(p)}
                className={`w-9 h-9 text-sm transition-colors duration-200 ${isActive ? "bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900" : "border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:border-zinc-900 dark:hover:border-zinc-50 hover:text-zinc-900 dark:hover:text-zinc-50"}`}>
                {p}
              </button>
            );
          })}

          <button onClick={() => setPage(page + 1)} disabled={page === totalPages}
            className="p-2 border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:border-zinc-900 dark:hover:border-zinc-50 hover:text-zinc-900 dark:hover:text-zinc-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-200"
            aria-label="Next page">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M5 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
