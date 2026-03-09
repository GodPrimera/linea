"use client";

import { useState, useMemo, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  markNotificationReadAction,
  markAllNotificationsReadAction,
  deleteNotificationAction,
} from "@/lib/actions/notifications";
import type { getUserNotifications } from "@/lib/queries/notifications";

type Notification = Awaited<ReturnType<typeof getUserNotifications>>[number];
type NotifType = "comment" | "reply" | "like" | "follow" | "mention" | "system" | "comment_like";
type FilterType = "all" | "unread" | NotifType;

const typeIcons: Record<string, React.ReactNode> = {
  comment: (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path d="M2 2h12v9H9l-3 3v-3H2V2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  ),
  reply: (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path d="M2 2h12v9H9l-3 3v-3H2V2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M5 7h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  like: (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path d="M8 13.5C8 13.5 1.5 9.5 1.5 5.5C1.5 3.57 3.07 2 5 2C6.19 2 7.25 2.61 8 3.5C8.75 2.61 9.81 2 11 2C12.93 2 14.5 3.57 14.5 5.5C14.5 9.5 8 13.5 8 13.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  comment_like: (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path d="M8 13.5C8 13.5 1.5 9.5 1.5 5.5C1.5 3.57 3.07 2 5 2C6.19 2 7.25 2.61 8 3.5C8.75 2.61 9.81 2 11 2C12.93 2 14.5 3.57 14.5 5.5C14.5 9.5 8 13.5 8 13.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  follow: (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path d="M1 12s1-3 6-3 6 3 6 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="7" cy="5" r="3" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M13 7v4M11 9h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  system: (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M8 5v4M8 11v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
};

const typeColors: Record<string, string> = {
  comment: "text-blue-500 bg-blue-50 dark:bg-blue-950",
  reply: "text-purple-500 bg-purple-50 dark:bg-purple-950",
  like: "text-red-500 bg-red-50 dark:bg-red-950",
  comment_like: "text-red-500 bg-red-50 dark:bg-red-950",
  follow: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950",
  system: "text-zinc-500 bg-zinc-100 dark:bg-zinc-800",
};

function timeAgo(date: Date) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getGroupLabel(date: Date) {
  const diffDays = Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return "This week";
  return "Earlier";
}

export default function NotificationsClient({
  initialNotifications,
}: {
  initialNotifications: Notification[];
}) {
  const [isPending, startTransition] = useTransition();
  const [notifications, setNotifications] = useState(initialNotifications);
  const [filter, setFilter] = useState<FilterType>("all");

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const filtered = useMemo(() => {
    if (filter === "unread") return notifications.filter((n) => !n.isRead);
    if (filter === "all") return notifications;
    return notifications.filter((n) => n.type === filter);
  }, [notifications, filter]);

  const grouped = useMemo(() => {
    const groups: Record<string, Notification[]> = {};
    filtered.forEach((n) => {
      const label = getGroupLabel(n.createdAt);
      if (!groups[label]) groups[label] = [];
      groups[label].push(n);
    });
    return groups;
  }, [filtered]);

  const groupOrder = ["Today", "Yesterday", "This week", "Earlier"];

  function handleMarkRead(id: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    startTransition(async () => {
      await markNotificationReadAction(id);
    });
  }

  function handleMarkAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    startTransition(async () => {
      await markAllNotificationsReadAction();
    });
  }

  function handleDismiss(id: string) {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    startTransition(async () => {
      await deleteNotificationAction(id);
    });
  }

  if (notifications.length === 0) {
    return (
      <div className="py-24 text-center space-y-3">
        <p className="font-display text-3xl font-light text-zinc-300 dark:text-zinc-700">
          All caught up
        </p>
        <p className="text-sm text-zinc-400 dark:text-zinc-600">
          No notifications yet. When someone comments, likes, or follows you, it will show up here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Controls */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-1 flex-wrap">
          {([
            { id: "all", label: "All" },
            { id: "unread", label: `Unread${unreadCount > 0 ? ` (${unreadCount})` : ""}` },
            { id: "comment", label: "Comments" },
            { id: "like", label: "Likes" },
            { id: "follow", label: "Follows" },
          ] as { id: FilterType; label: string }[]).map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-3 py-1.5 text-xs transition-colors ${
                filter === f.id
                  ? "bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900"
                  : "border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:border-zinc-400"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            disabled={isPending}
            className="text-xs text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors whitespace-nowrap disabled:opacity-40"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Grouped notifications */}
      {filtered.length > 0 ? (
        <div className="space-y-8">
          {groupOrder.map((label) => {
            const items = grouped[label];
            if (!items?.length) return null;
            return (
              <div key={label} className="space-y-1">
                <p className="text-xs tracking-[0.15em] uppercase text-zinc-400 dark:text-zinc-600 mb-3">
                  {label}
                </p>
                <div className="divide-y divide-zinc-50 dark:divide-zinc-900">
                  {items.map((n) => (
                    <div
                      key={n.id}
                      className={`group flex items-start gap-4 py-4 cursor-pointer transition-colors ${
                        !n.isRead ? "bg-zinc-50/50 dark:bg-zinc-900/30 -mx-4 px-4" : ""
                      }`}
                      onClick={() => !n.isRead && handleMarkRead(n.id)}
                    >
                      {/* Unread dot */}
                      <div className="pt-1.5 w-2 shrink-0">
                        {!n.isRead && (
                          <div className="w-1.5 h-1.5 rounded-full bg-zinc-900 dark:bg-zinc-50" />
                        )}
                      </div>

                      {/* Type icon */}
                      <div className={`w-8 h-8 flex items-center justify-center rounded-full shrink-0 ${typeColors[n.type ?? "system"] ?? typeColors.system}`}>
                        {typeIcons[n.type ?? "system"] ?? typeIcons.system}
                      </div>

                      {/* Actor avatar */}
                      {n.actorUsername && (
                        <Link href={`/author/${n.actorUsername}`} className="shrink-0 mt-0.5" onClick={(e) => e.stopPropagation()}>
                          <div className="w-8 h-8 rounded-full overflow-hidden bg-zinc-200 dark:bg-zinc-800">
                            {n.actorAvatarUrl ? (
                              <Image
                                src={n.actorAvatarUrl}
                                alt={n.actorName ?? ""}
                                width={32} height={32}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xs text-zinc-500">
                                {n.actorName?.[0] ?? "?"}
                              </div>
                            )}
                          </div>
                        </Link>
                      )}

                      {/* Content */}
                      <div className="flex-1 min-w-0 space-y-1">
                        {n.title && (
                          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50 leading-snug">
                            {n.title}
                          </p>
                        )}
                        {n.body && (
                          <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-snug">
                            {n.body}
                          </p>
                        )}
                        <p className="text-xs text-zinc-400 dark:text-zinc-600">
                          {timeAgo(n.createdAt)}
                        </p>
                      </div>

                      {/* Dismiss */}
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDismiss(n.id); }}
                        disabled={isPending}
                        className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-zinc-300 dark:text-zinc-700 hover:text-zinc-600 dark:hover:text-zinc-400 pt-1 disabled:opacity-20"
                        aria-label="Dismiss"
                      >
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-16 text-center">
          <p className="text-sm text-zinc-400 dark:text-zinc-600">
            No {filter === "all" ? "" : filter} notifications
          </p>
          {filter !== "all" && (
            <button
              onClick={() => setFilter("all")}
              className="mt-3 text-sm text-zinc-500 underline underline-offset-2 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
            >
              View all
            </button>
          )}
        </div>
      )}

    </div>
  );
}
