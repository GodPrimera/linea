"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { adminDeletePostAction } from "@/lib/actions/admin";

type Post = {
  id: string;
  title: string;
  slug: string;
  status: string;
  publishedAt: Date | null;
  createdAt: Date;
  authorName: string | null;
  authorUsername: string | null;
  categoryName: string | null;
};

const STATUS_COLORS: Record<string, string> = {
  published: "text-emerald-600 dark:text-emerald-400",
  draft: "text-zinc-400 dark:text-zinc-600",
  scheduled: "text-blue-500 dark:text-blue-400",
  archived: "text-zinc-300 dark:text-zinc-700",
};

export default function AdminPostsClient({ initialPosts }: { initialPosts: Post[] }) {
  const [postList, setPostList] = useState(initialPosts);
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();

  const filtered = postList.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      (p.authorName ?? "").toLowerCase().includes(search.toLowerCase())
  );

  function handleDelete(id: string) {
    if (!confirm("Delete this post? This cannot be undone.")) return;
    setPostList((prev) => prev.filter((p) => p.id !== id));
    startTransition(async () => {
      await adminDeletePostAction(id);
    });
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs tracking-widests uppercase text-zinc-400 dark:text-zinc-600 mb-2">Admin</p>
          <h1 className="font-display text-4xl font-light text-zinc-900 dark:text-zinc-50">All Posts</h1>
        </div>
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" width="14" height="14" viewBox="0 0 16 16" fill="none">
            <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search posts..."
            className="pl-9 pr-4 py-2 border border-zinc-200 dark:border-zinc-800 bg-transparent text-sm text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-50 transition-colors w-56"
          />
        </div>
      </div>

      <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 divide-y divide-zinc-100 dark:divide-zinc-800">
        {filtered.length === 0 && (
          <p className="text-sm text-zinc-400 dark:text-zinc-600 text-center py-10">No posts found</p>
        )}
        {filtered.map((post) => (
          <div key={post.id} className="flex items-center gap-4 px-5 py-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className={`text-xs ${STATUS_COLORS[post.status] ?? ""}`}>{post.status}</span>
                {post.categoryName && (
                  <span className="text-xs text-zinc-300 dark:text-zinc-700">· {post.categoryName}</span>
                )}
              </div>
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50 truncate">{post.title}</p>
              <p className="text-xs text-zinc-400 dark:text-zinc-600">
                by {post.authorName ?? "Unknown"} · {new Date(post.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {post.status === "published" && (
                <Link
                  href={`/blog/${post.slug}`}
                  target="_blank"
                  className="text-xs text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
                >
                  View
                </Link>
              )}
              <button
                onClick={() => handleDelete(post.id)}
                disabled={isPending}
                className="text-xs text-red-400 hover:text-red-600 transition-colors disabled:opacity-40"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
