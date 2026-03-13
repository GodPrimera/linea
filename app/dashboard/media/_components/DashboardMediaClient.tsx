"use client";
import EmptyState from "@/components/EmptyState";

import { useState, useTransition } from "react";
import Image from "next/image";
import { deleteMediaBulkAction } from "@/lib/actions/media";
import type { MediaFile } from "@/lib/queries/subscribers";

function formatBytes(bytes: number | null): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

function totalSize(media: MediaFile[]): string {
  const total = media.reduce((sum, m) => sum + (m.sizeBytes ?? 0), 0);
  return formatBytes(total);
}

export default function DashboardMediaClient({
  initialMedia,
}: {
  initialMedia: MediaFile[];
}) {
  const [isPending, startTransition] = useTransition();
  const [media, setMedia] = useState(initialMedia);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [view, setView] = useState<"grid" | "list">("grid");

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleDeleteSelected() {
    const ids = [...selected];
    setMedia((prev) => prev.filter((m) => !ids.includes(m.id)));
    setSelected(new Set());
    startTransition(async () => {
      try {
        await deleteMediaBulkAction(ids);
      } catch {
        setMedia(initialMedia);
      }
    });
  }

  const isImage = (m: MediaFile) => m.mimeType.startsWith("image/");

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl font-light text-zinc-900 dark:text-zinc-50">Media</h1>
          <p className="text-sm text-zinc-400 dark:text-zinc-600 mt-1">
            {media.length} {media.length === 1 ? "file" : "files"} · {totalSize(media)} used
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selected.size > 0 && (
            <button
              onClick={handleDeleteSelected}
              disabled={isPending}
              className="text-xs px-3 py-2 border border-red-200 dark:border-red-900 text-red-400 hover:bg-red-50 dark:hover:bg-red-950 transition-colors disabled:opacity-40"
            >
              Delete {selected.size} selected
            </button>
          )}
          <div className="flex border border-zinc-200 dark:border-zinc-800">
            <button
              onClick={() => setView("grid")}
              className={`p-2 transition-colors ${view === "grid" ? "bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900" : "text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50"}`}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect x="1" y="1" width="5" height="5" stroke="currentColor" strokeWidth="1.3"/>
                <rect x="8" y="1" width="5" height="5" stroke="currentColor" strokeWidth="1.3"/>
                <rect x="1" y="8" width="5" height="5" stroke="currentColor" strokeWidth="1.3"/>
                <rect x="8" y="8" width="5" height="5" stroke="currentColor" strokeWidth="1.3"/>
              </svg>
            </button>
            <button
              onClick={() => setView("list")}
              className={`p-2 transition-colors ${view === "list" ? "bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900" : "text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50"}`}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 2h12M1 7h12M1 12h12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {media.length === 0 ? (
        <div className="py-24 text-center border border-dashed border-zinc-200 dark:border-zinc-800">
          <p className="text-sm text-zinc-400 dark:text-zinc-600">No media uploaded yet</p>
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {media.map((item) => (
            <div
              key={item.id}
              className={`relative group aspect-square bg-zinc-100 dark:bg-zinc-900 overflow-hidden cursor-pointer ${
                selected.has(item.id) ? "ring-2 ring-zinc-900 dark:ring-zinc-50" : ""
              }`}
              onClick={() => toggleSelect(item.id)}
            >
              {isImage(item) ? (
                <Image
                  src={item.url}
                  alt={item.altText ?? item.filename}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M4 4h10l6 6v10H4V4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                    <path d="M14 4v6h6" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
              {selected.has(item.id) && (
                <div className="absolute inset-0 bg-zinc-900/20 flex items-center justify-center">
                  <div className="w-6 h-6 bg-zinc-900 dark:bg-zinc-50 flex items-center justify-center">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 p-1.5 bg-gradient-to-t from-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-xs text-white truncate">{item.filename}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 divide-y divide-zinc-50 dark:divide-zinc-800">
          {media.map((item) => (
            <div
              key={item.id}
              onClick={() => toggleSelect(item.id)}
              className={`flex items-center gap-4 px-5 py-3 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors ${
                selected.has(item.id) ? "bg-zinc-50 dark:bg-zinc-800/50" : ""
              }`}
            >
              <div className="w-10 h-10 shrink-0 bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                {isImage(item) ? (
                  <Image
                    src={item.url}
                    alt={item.altText ?? item.filename}
                    width={40} height={40}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-400">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M4 4h10l6 6v10H4V4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-zinc-900 dark:text-zinc-50 truncate">{item.filename}</p>
                <p className="text-xs text-zinc-400 dark:text-zinc-600">{item.mimeType}</p>
              </div>
              <div className="text-xs text-zinc-400 dark:text-zinc-600 hidden sm:block">
                {formatBytes(item.sizeBytes)}
              </div>
              <div className="text-xs text-zinc-400 dark:text-zinc-600 hidden md:block">
                {formatDate(item.createdAt)}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
