import { db } from "@/lib/db";
import { users, posts, comments, authorApplications } from "@/lib/db/schema";
import { eq, isNull, sql } from "drizzle-orm";
import Link from "next/link";

async function getStats() {
  const [
    [totalUsers],
    [totalPosts],
    [totalComments],
    [pendingApps],
  ] = await Promise.all([
    db.select({ count: sql<number>`cast(count(*) as int)` }).from(users).where(isNull(users.deletedAt)),
    db.select({ count: sql<number>`cast(count(*) as int)` }).from(posts).where(eq(posts.status, "published")),
    db.select({ count: sql<number>`cast(count(*) as int)` }).from(comments).where(isNull(comments.deletedAt)),
    db.select({ count: sql<number>`cast(count(*) as int)` }).from(authorApplications).where(eq(authorApplications.status, "pending")),
  ]);

  return {
    totalUsers: totalUsers.count,
    totalPosts: totalPosts.count,
    totalComments: totalComments.count,
    pendingApps: pendingApps.count,
  };
}

export default async function AdminPage() {
  const stats = await getStats();

  const statCards = [
    { label: "Total users", value: stats.totalUsers, href: "/admin/users" },
    { label: "Published posts", value: stats.totalPosts, href: "/admin/posts" },
    { label: "Total comments", value: stats.totalComments, href: "/admin/comments" },
    { label: "Pending applications", value: stats.pendingApps, href: "/admin/applications", highlight: stats.pendingApps > 0 },
  ];

  return (
    <div className="space-y-10">
      <div>
        <p className="text-xs tracking-widest uppercase text-zinc-400 dark:text-zinc-600 mb-2">Admin</p>
        <h1 className="font-display text-4xl font-light text-zinc-900 dark:text-zinc-50">Overview</h1>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className={`p-6 border transition-colors hover:border-zinc-400 dark:hover:border-zinc-600 ${
              card.highlight
                ? "border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30"
                : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
            }`}
          >
            <p className="text-3xl font-light text-zinc-900 dark:text-zinc-50 mb-1">{card.value}</p>
            <p className="text-xs tracking-wide text-zinc-400 dark:text-zinc-600">{card.label}</p>
          </Link>
        ))}
      </div>

      {stats.pendingApps > 0 && (
        <div className="border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/20 px-5 py-4 flex items-center justify-between">
          <p className="text-sm text-amber-700 dark:text-amber-400">
            {stats.pendingApps} author application{stats.pendingApps > 1 ? "s" : ""} waiting for review
          </p>
          <Link
            href="/admin/applications"
            className="text-sm text-amber-700 dark:text-amber-400 underline underline-offset-2"
          >
            Review now →
          </Link>
        </div>
      )}
    </div>
  );
}
