"use client";

import { useState, useMemo, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { removeBookmark } from "@/lib/actions/interactions";
import type { PostCard } from "@/lib/queries/posts";

type Bookmark = PostCard & { bookmarkedAt: Date };

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

export default function BookmarksClient({
  initialBookmarks,
}: {
  initialBookmarks: Bookmark[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [bookmarks, setBookmarks] = useState(initialBookmarks);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");
  const [removingId, setRemovingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let result = [...bookmarks];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.excerpt.toLowerCase().includes(q) ||
          (b.categoryName ?? "").toLowerCase().includes(q) ||
          b.authorName.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      const diff = new Date(b.bookmarkedAt).getTime() - new Date(a.bookmarkedAt).getTime();
      return sort === "newest" ? diff : -diff;
    });

    return result;
  }, [bookmarks, search, sort]);

  function handleRemove(postId: string) {
    // Optimistic remove
    setRemovingId(postId);
    setBookmarks((prev) => prev.filter((b) => b.id !== postId));
    startTransition(async () => {
      try {
        await removeBookmark(postId);
        router.refresh();
      } catch {
        // Rollback if action fails
        setBookmarks(initialBookmarks);
      } finally {
        setRemovingId(null);
      }
    });
  }

  if (bookmarks.length === 0) {
    return (
      <div className="py-24 text-center space-y-4">
        <p className="font-display text-3xl font-light text-zinc-300 dark:text-zinc-700">
          No bookmarks yet
        </p>
        <p className="text-sm text-zinc-400 dark:text-zinc-600">
          Save posts to read later by clicking the bookmark icon on any post.
        </p>
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-zinc-900 dark:text-zinc-50 hover:opacity-60 transition-opacity pt-2"
        >
          Browse posts
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M1 6h10M6.5 1.5L11 6l-4.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <p className="text-sm text-zinc-400 dark:text-zinc-600">
          {bookmarks.length} saved {bookmarks.length === 1 ? "post" : "posts"}
        </p>
        <div className="flex items-center gap-3">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" width="13" height="13" viewBox="0 0 16 16" fill="none">
              <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter bookmarks..."
              className="pl-8 pr-4 py-1.5 border border-zinc-200 dark:border-zinc-800 bg-transparent text-sm text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-50 transition-colors w-44"
            />
          </div>
          <div className="flex items-center gap-1">
            {(["newest", "oldest"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSort(s)}
                className={`px-3 py-1.5 text-xs capitalize transition-colors ${
                  sort === s
                    ? "bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900"
                    : "border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:border-zinc-400"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bookmarks list */}
      {filtered.length > 0 ? (
        <div className="divide-y divide-zinc-50 dark:divide-zinc-900">
          {filtered.map((bookmark) => (
            <div key={bookmark.id} className="group flex gap-5 py-6 items-start">

              {/* Thumbnail */}
              <Link href={`/blog/${bookmark.slug}`} className="shrink-0 w-28 h-20 overflow-hidden bg-zinc-100 dark:bg-zinc-900 block">
                {bookmark.coverImageUrl && (
                  <Image
                    src={bookmark.coverImageUrl}
                    alt={bookmark.title}
                    width={112} height={80}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                )}
              </Link>

              {/* Content */}
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-center gap-2">
                  {bookmark.categorySlug && bookmark.categoryName && (
                    <Link
                      href={`/categories/${bookmark.categorySlug}`}
                      className="text-xs tracking-widest uppercase text-zinc-400 dark:text-zinc-600 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
                    >
                      {bookmark.categoryName}
                    </Link>
                  )}
                  {bookmark.readingTime && (
                    <>
                      <span className="text-zinc-200 dark:text-zinc-800">·</span>
                      <span className="text-xs text-zinc-400 dark:text-zinc-600">
                        {bookmark.readingTime} min read
                      </span>
                    </>
                  )}
                </div>

                <Link href={`/blog/${bookmark.slug}`}>
                  <h2 className="text-base font-medium text-zinc-900 dark:text-zinc-50 leading-snug hover:opacity-60 transition-opacity">
                    {bookmark.title}
                  </h2>
                </Link>

                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed line-clamp-2">
                  {bookmark.excerpt}
                </p>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full overflow-hidden bg-zinc-200 dark:bg-zinc-800">
                      {bookmark.authorAvatarUrl && (
                        <Image
                          src={bookmark.authorAvatarUrl}
                          alt={bookmark.authorName}
                          width={16} height={16}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <span className="text-xs text-zinc-400 dark:text-zinc-600">
                      {bookmark.authorName}
                    </span>
                    <span className="text-zinc-200 dark:text-zinc-800">·</span>
                    <span className="text-xs text-zinc-400 dark:text-zinc-600">
                      Saved {formatDate(bookmark.bookmarkedAt)}
                    </span>
                  </div>

                  <button
                    onClick={() => handleRemove(bookmark.id)}
                    disabled={isPending && removingId === bookmark.id}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-300 dark:text-zinc-700 hover:text-red-400 disabled:opacity-30"
                    aria-label="Remove bookmark"
                  >
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                      <path d="M3 2h10v13l-5-3-5 3V2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M6 7h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center">
          <p className="text-sm text-zinc-400 dark:text-zinc-600">
            No bookmarks match your search
          </p>
          <button
            onClick={() => setSearch("")}
            className="mt-3 text-sm text-zinc-500 underline underline-offset-2 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
          >
            Clear filter
          </button>
        </div>
      )}

    </div>
  );
}
