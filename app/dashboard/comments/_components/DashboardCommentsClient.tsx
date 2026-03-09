"use client";

import { useState, useMemo, useTransition } from "react";
import Link from "next/link";
import {
  approveCommentAction,
  rejectCommentAction,
  deleteCommentAction,
} from "@/lib/actions/moderation";
import type { DashboardComment } from "@/lib/queries/comments";

type Filter = "all" | "pending" | "approved" | "flagged";

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

export default function DashboardCommentsClient({
  initialComments,
}: {
  initialComments: DashboardComment[];
}) {
  const [comments, setComments] = useState(initialComments);
  const [filter, setFilter] = useState<Filter>("all");
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    return comments.filter((c) => {
      if (filter === "pending") return !c.approved;
      if (filter === "approved") return c.approved;
      return true;
    });
  }, [comments, filter]);

  const counts = {
    all: comments.length,
    pending: comments.filter((c) => !c.approved).length,
    approved: comments.filter((c) => c.approved).length,
    flagged: 0,
  };

  function handleApprove(id: string) {
    setComments((prev) =>
      prev.map((c) => (c.id === id ? { ...c, approved: true } : c))
    );
    startTransition(async () => {
      await approveCommentAction(id);
    });
  }

  function handleReject(id: string) {
    setComments((prev) =>
      prev.map((c) => (c.id === id ? { ...c, approved: false } : c))
    );
    startTransition(async () => {
      await rejectCommentAction(id);
    });
  }

  function handleDelete(id: string) {
    setComments((prev) => prev.filter((c) => c.id !== id));
    startTransition(async () => {
      await deleteCommentAction(id);
    });
  }

  return (
    <div className="space-y-6">

      <div>
        <h1 className="font-display text-3xl font-light text-zinc-900 dark:text-zinc-50">
          Comments
        </h1>
        <p className="text-sm text-zinc-400 dark:text-zinc-600 mt-1">
          {counts.pending} pending · {comments.length} total
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-1">
        {(["all", "pending", "approved"] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-xs capitalize transition-colors ${
              filter === f
                ? "bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900"
                : "border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:border-zinc-400"
            }`}
          >
            {f} ({counts[f]})
          </button>
        ))}
      </div>

      {/* Comments list */}
      <div className="space-y-3">
        {filtered.map((comment) => (
          <div
            key={comment.id}
            className={`bg-white dark:bg-zinc-900 border p-5 space-y-3 ${
              comment.approved
                ? "border-zinc-100 dark:border-zinc-800"
                : "border-amber-200 dark:border-amber-900"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                    {comment.displayName}
                  </span>
                  {comment.authorEmail && (
                    <span className="text-xs text-zinc-400 dark:text-zinc-600">
                      {comment.authorEmail}
                    </span>
                  )}
                  {comment.approved ? (
                    <span className="text-xs px-1.5 py-0.5 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                      Approved
                    </span>
                  ) : (
                    <span className="text-xs px-1.5 py-0.5 bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
                      Pending
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-400 dark:text-zinc-600">
                  On:{" "}
                  <Link
                    href={`/blog/${comment.postSlug}`}
                    className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
                  >
                    {comment.postTitle}
                  </Link>{" "}
                  · {formatDate(comment.createdAt)}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {!comment.approved && (
                  <button
                    onClick={() => handleApprove(comment.id)}
                    disabled={isPending}
                    className="text-xs px-3 py-1 border border-emerald-200 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950 transition-colors disabled:opacity-40"
                  >
                    Approve
                  </button>
                )}
                {comment.approved && (
                  <button
                    onClick={() => handleReject(comment.id)}
                    disabled={isPending}
                    className="text-xs px-3 py-1 border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:border-amber-300 hover:text-amber-500 transition-colors disabled:opacity-40"
                  >
                    Unapprove
                  </button>
                )}
                <button
                  onClick={() => handleDelete(comment.id)}
                  disabled={isPending}
                  className="text-xs px-3 py-1 border border-red-200 dark:border-red-900 text-red-400 hover:bg-red-50 dark:hover:bg-red-950 transition-colors disabled:opacity-40"
                >
                  Delete
                </button>
              </div>
            </div>

            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {comment.content}
            </p>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="py-16 text-center border border-zinc-100 dark:border-zinc-900">
            <p className="text-sm text-zinc-400 dark:text-zinc-600">No comments found</p>
          </div>
        )}
      </div>

    </div>
  );
}
