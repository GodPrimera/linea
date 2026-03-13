"use client";

import { useState, useTransition } from "react";
import { approveApplicationAction, rejectApplicationAction } from "@/lib/actions/admin";

type Application = {
  id: string;
  reason: string;
  writingSamples: string | null;
  status: string;
  createdAt: Date;
  userName: string;
  userEmail: string;
  userUsername: string;
};

export default function ApplicationsClient({
  initialApplications,
}: {
  initialApplications: Application[];
}) {
  const [applications, setApplications] = useState(initialApplications);
  const [isPending, startTransition] = useTransition();
  const [rejectNote, setRejectNote] = useState<Record<string, string>>({});
  const [expanded, setExpanded] = useState<string | null>(null);

  function approve(id: string) {
    startTransition(async () => {
      await approveApplicationAction(id);
      setApplications((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: "approved" } : a))
      );
    });
  }

  function reject(id: string) {
    startTransition(async () => {
      await rejectApplicationAction(id, rejectNote[id]);
      setApplications((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: "rejected" } : a))
      );
    });
  }

  const pending = applications.filter((a) => a.status === "pending");
  const reviewed = applications.filter((a) => a.status !== "pending");

  return (
    <div className="space-y-10">
      <div>
        <p className="text-xs tracking-widest uppercase text-zinc-400 dark:text-zinc-600 mb-2">Admin</p>
        <h1 className="font-display text-4xl font-light text-zinc-900 dark:text-zinc-50">
          Author Applications
        </h1>
      </div>

      {/* Pending */}
      <div className="space-y-4">
        <p className="text-xs tracking-widests uppercase text-zinc-400 dark:text-zinc-600">
          Pending ({pending.length})
        </p>
        {pending.length === 0 && (
          <p className="text-sm text-zinc-400 dark:text-zinc-600 py-8 text-center border border-dashed border-zinc-200 dark:border-zinc-800">
            No pending applications
          </p>
        )}
        {pending.map((app) => (
          <div key={app.id} className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <div
              className="flex items-start justify-between gap-4 p-5 cursor-pointer"
              onClick={() => setExpanded(expanded === app.id ? null : app.id)}
            >
              <div>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{app.userName}</p>
                <p className="text-xs text-zinc-400 dark:text-zinc-600">@{app.userUsername} · {app.userEmail}</p>
                <p className="text-xs text-zinc-400 dark:text-zinc-600 mt-0.5">
                  Applied {new Date(app.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </p>
              </div>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className={`shrink-0 mt-1 transition-transform ${expanded === app.id ? "rotate-180" : ""}`}>
                <path d="M2 5l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>

            {expanded === app.id && (
              <div className="px-5 pb-5 space-y-4 border-t border-zinc-100 dark:border-zinc-800 pt-4">
                <div>
                  <p className="text-xs tracking-widests uppercase text-zinc-400 dark:text-zinc-600 mb-2">Their reason</p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-wrap">{app.reason}</p>
                </div>
                {app.writingSamples && (
                  <div>
                    <p className="text-xs tracking-widests uppercase text-zinc-400 dark:text-zinc-600 mb-2">Writing samples</p>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap">{app.writingSamples}</p>
                  </div>
                )}
                <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <textarea
                    value={rejectNote[app.id] ?? ""}
                    onChange={(e) => setRejectNote((prev) => ({ ...prev, [app.id]: e.target.value }))}
                    placeholder="Rejection note (optional — shown to applicant)"
                    rows={2}
                    className="w-full border border-zinc-200 dark:border-zinc-800 bg-transparent px-3 py-2 text-sm text-zinc-600 dark:text-zinc-400 placeholder:text-zinc-300 dark:placeholder:text-zinc-700 focus:outline-none focus:border-zinc-400 transition-colors resize-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => approve(app.id)}
                      disabled={isPending}
                      className="px-5 py-2 text-sm bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-40 transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => reject(app.id)}
                      disabled={isPending}
                      className="px-5 py-2 text-sm border border-red-300 dark:border-red-800 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 disabled:opacity-40 transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Reviewed */}
      {reviewed.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs tracking-widests uppercase text-zinc-400 dark:text-zinc-600">
            Previously reviewed ({reviewed.length})
          </p>
          {reviewed.map((app) => (
            <div key={app.id} className="flex items-center justify-between gap-4 p-4 border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <div>
                <p className="text-sm text-zinc-700 dark:text-zinc-300">{app.userName}</p>
                <p className="text-xs text-zinc-400 dark:text-zinc-600">@{app.userUsername}</p>
              </div>
              <span className={`text-xs px-2 py-0.5 ${
                app.status === "approved"
                  ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400"
                  : "bg-red-50 dark:bg-red-950 text-red-500 dark:text-red-400"
              }`}>
                {app.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
