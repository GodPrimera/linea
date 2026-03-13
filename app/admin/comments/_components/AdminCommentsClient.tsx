"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { adminDeleteCommentAction } from "@/lib/actions/admin";

type Comment = {
  id: string;
  content: string;
  approved: boolean;
  createdAt: Date;
  authorName: string | null;
  authorUsername: string | null;
  postTitle: string | null;
  postSlug: string | null;
};

export default function AdminCommentsClient({ initialComments }: { initialComments: Comment[] }) {
  const [commentList, setCommentList] = useState(initialComments);
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();

  const filtered = commentList.filter(
    (c) =>
      c.content.toLowerCase().includes(search.toLowerCase()) ||
      (c.authorName ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (c.postTitle ?? "").toLowerCase().includes(search.toLowerCase())
  );

  function handleDelete(id: string) {
    if (!confirm("Delete this comment? This cannot be undone.")) return;
    setCommentList((prev) => prev.filter((c) => c.id !== id));
    startTransition(async () => {
      await adminDeleteCommentAction(id);
    });
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs tracking-widests uppercase text-zinc-400 dark:text-zinc-600 mb-2">Admin</p>
          <h1 className="font-display text-4xl font-light text-zinc-900 dark:text-zinc-50">All Comments</h1>
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
            placeholder="Search comments..."
            className="pl-9 pr-4 py-2 border border-zinc-200 dark:border-zinc-800 bg-transparent text-sm text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-50 transition-colors w-56"
          />
        </div>
      </div>

      <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 divide-y divide-zinc-100 dark:divide-zinc-800">
        {filtered.length === 0 && (
          <p className="text-sm text-zinc-400 dark:text-zinc-600 text-center py-10">No comments found</p>
        )}
        {filtered.map((comment) => (
          <div key={comment.id} className="px-5 py-4 space-y-1.5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">{comment.authorName ?? "Anonymous"}</p>
                  <span className="text-xs text-zinc-300 dark:text-zinc-700">·</span>
                  {comment.postSlug ? (
                    <Link
                      href={`/blog/${comment.postSlug}`}
                      className="text-xs text-zinc-400 dark:text-zinc-600 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors truncate max-w-[200px]"
                      target="_blank"
                    >
                      {comment.postTitle}
                    </Link>
                  ) : (
                    <span className="text-xs text-zinc-400 dark:text-zinc-600">{comment.postTitle}</span>
                  )}
                  <span className="text-xs text-zinc-300 dark:text-zinc-700">·</span>
                  <span className="text-xs text-zinc-400 dark:text-zinc-600">
                    {new Date(comment.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">{comment.content}</p>
              </div>
              <button
                onClick={() => handleDelete(comment.id)}
                disabled={isPending}
                className="text-xs text-red-400 hover:text-red-600 transition-colors disabled:opacity-40 shrink-0 mt-0.5"
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
