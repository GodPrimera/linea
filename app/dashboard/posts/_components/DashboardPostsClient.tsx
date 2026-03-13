"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import EmptyState from "@/components/EmptyState";
import { deletePostAction } from "@/lib/actions/posts";
import type { getAuthorPosts } from "@/lib/queries/dashboard";

type Post = Awaited<ReturnType<typeof getAuthorPosts>>[number];

type Status = "all" | "published" | "draft";

const statusColors: Record<string, string> = {
  published: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950",
  draft: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950",
  scheduled: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950",
  archived: "text-zinc-400 bg-zinc-100 dark:bg-zinc-800",
};

export default function DashboardPostsClient({ posts: initialPosts }: { posts: Post[] }) {
  const [isPending, startTransition] = useTransition();
  const [posts, setPosts] = useState(initialPosts);
  const [filter, setFilter] = useState<Status>("all");
  const [search, setSearch] = useState("");

  function handleDelete(id: string) {
    setPosts((prev) => prev.filter((p) => p.id !== id));
    startTransition(async () => {
      try {
        await deletePostAction(id);
      } catch {
        setPosts(initialPosts);
      }
    });
  }

  const filtered = posts.filter((p) => {
    const matchesStatus = filter === "all" || p.status === filter;
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const counts = {
    all: posts.length,
    published: posts.filter((p) => p.status === "published").length,
    draft: posts.filter((p) => p.status === "draft").length,
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-light text-zinc-900 dark:text-zinc-50">Posts</h1>
          <p className="text-sm text-zinc-400 dark:text-zinc-600 mt-1">
            {counts.published} published · {counts.draft} drafts
          </p>
        </div>
        <Link
          href="/dashboard/posts/new"
          className="flex items-center gap-2 px-4 py-2 text-sm bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          New post
        </Link>
      </div>

      {/* Filters + search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          {(["all", "published", "draft"] as Status[]).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 text-xs capitalize transition-colors duration-150 ${
                filter === s
                  ? "bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900"
                  : "border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:border-zinc-400"
              }`}
            >
              {s} ({counts[s as keyof typeof counts] ?? posts.length})
            </button>
          ))}
        </div>

        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" width="13" height="13" viewBox="0 0 16 16" fill="none">
            <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search posts..."
            className="pl-8 pr-4 py-1.5 border border-zinc-200 dark:border-zinc-800 bg-transparent text-sm text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-50 transition-colors w-52"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-800">
                <th className="text-left px-6 py-3 text-xs tracking-widest uppercase text-zinc-400 dark:text-zinc-600 font-normal">Title</th>
                <th className="text-left px-4 py-3 text-xs tracking-widest uppercase text-zinc-400 dark:text-zinc-600 font-normal hidden sm:table-cell">Status</th>
                <th className="text-left px-4 py-3 text-xs tracking-widest uppercase text-zinc-400 dark:text-zinc-600 font-normal hidden md:table-cell">Category</th>
                <th className="text-right px-4 py-3 text-xs tracking-widest uppercase text-zinc-400 dark:text-zinc-600 font-normal hidden lg:table-cell">Views</th>
                <th className="text-right px-4 py-3 text-xs tracking-widest uppercase text-zinc-400 dark:text-zinc-600 font-normal hidden lg:table-cell">Likes</th>
                <th className="text-right px-6 py-3 text-xs tracking-widest uppercase text-zinc-400 dark:text-zinc-600 font-normal">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800">
              {filtered.map((post) => (
                <tr key={post.id} className="group hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50 line-clamp-1">{post.title}</p>
                    {post.publishedAt && (
                      <p className="text-xs text-zinc-400 dark:text-zinc-600 mt-0.5">
                        {new Date(post.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-4 hidden sm:table-cell">
                    <span className={`text-xs px-2 py-0.5 capitalize ${statusColors[post.status ?? "draft"]}`}>
                      {post.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 hidden md:table-cell">
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">{post.categoryName ?? "—"}</span>
                  </td>
                  <td className="px-4 py-4 text-right hidden lg:table-cell">
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">{post.views.toLocaleString()}</span>
                  </td>
                  <td className="px-4 py-4 text-right hidden lg:table-cell">
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">{post.likes}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link
                        href={`/dashboard/posts/${post.id}/edit`}
                        className="text-xs px-3 py-1 border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:border-zinc-900 dark:hover:border-zinc-50 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
                      >
                        Edit
                      </Link>
                      {post.status === "published" && (
                        // ✓ Fixed: use post.slug not post.id
                        <Link
                          href={`/blog/${post.slug}`}
                          className="text-xs px-3 py-1 border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:border-zinc-900 dark:hover:border-zinc-50 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
                        >
                          View
                        </Link>
                      )}
                      <button
                        onClick={() => handleDelete(post.id)}
                        disabled={isPending}
                        className="text-xs px-3 py-1 border border-red-200 dark:border-red-900 text-red-400 hover:border-red-500 hover:text-red-600 transition-colors disabled:opacity-40"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-sm text-zinc-400 dark:text-zinc-600">
              {search ? "No posts match your search." : "No posts yet."}
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
