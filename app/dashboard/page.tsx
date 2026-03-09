import Link from "next/link";
import { getCurrentUser } from "@/lib/queries/users";
import { getDashboardStats, getTopPostsForDashboard, getRecentActivityForDashboard } from "@/lib/queries/dashboard";
import { redirect } from "next/navigation";

const activityIcon: Record<string, React.ReactNode> = {
  comment: (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
      <path d="M2 2h12v9H9l-3 3v-3H2V2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  ),
  reply: (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
      <path d="M2 2h12v9H9l-3 3v-3H2V2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  ),
  like: (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
      <path d="M8 13.5C8 13.5 1.5 9.5 1.5 5.5C1.5 3.57 3.07 2 5 2C6.19 2 7.25 2.61 8 3.5C8.75 2.61 9.81 2 11 2C12.93 2 14.5 3.57 14.5 5.5C14.5 9.5 8 13.5 8 13.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  follow: (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
      <path d="M1 12s1-3 7-3 7 3 7 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  ),
  comment_like: (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
      <path d="M8 13.5C8 13.5 1.5 9.5 1.5 5.5C1.5 3.57 3.07 2 5 2C6.19 2 7.25 2.61 8 3.5C8.75 2.61 9.81 2 11 2C12.93 2 14.5 3.57 14.5 5.5C14.5 9.5 8 13.5 8 13.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
};

function timeAgo(date: Date) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default async function DashboardPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/sign-in");

  const [stats, topPosts, activity] = await Promise.all([
    getDashboardStats(currentUser.id),
    getTopPostsForDashboard(currentUser.id, 5),
    getRecentActivityForDashboard(currentUser.id, 8),
  ]);

  const statCards = [
    { label: "Total views", value: stats.totalViews.toLocaleString() },
    { label: "Published posts", value: stats.publishedPosts.toString() },
    { label: "Total likes", value: stats.totalLikes.toLocaleString() },
    { label: "Followers", value: stats.followers.toLocaleString() },
  ];

  return (
    <div className="space-y-10">

      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-light text-zinc-900 dark:text-zinc-50">
          Overview
        </h1>
        <p className="text-sm text-zinc-400 dark:text-zinc-600 mt-1">
          Welcome back, {currentUser.name.split(" ")[0]}. Here's what's happening on Linea.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-5 space-y-2">
            <p className="text-xs tracking-widest uppercase text-zinc-400 dark:text-zinc-600">{stat.label}</p>
            <p className="font-display text-3xl font-light text-zinc-900 dark:text-zinc-50">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Top posts */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
            <p className="text-xs tracking-[0.15em] uppercase text-zinc-400 dark:text-zinc-600">Top posts</p>
            <Link href="/dashboard/posts" className="text-xs text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors">
              View all →
            </Link>
          </div>
          {topPosts.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-sm text-zinc-400 dark:text-zinc-600">No published posts yet.</p>
              <Link href="/dashboard/posts/new" className="mt-3 inline-block text-sm text-zinc-900 dark:text-zinc-50 underline underline-offset-2">
                Write your first post
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-zinc-50 dark:divide-zinc-800">
              {topPosts.map((post, i) => (
                <div key={post.id} className="flex items-center gap-4 px-6 py-4">
                  <span className="font-display text-2xl font-light text-zinc-200 dark:text-zinc-800 w-7 shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="text-sm font-medium text-zinc-900 dark:text-zinc-50 hover:opacity-60 transition-opacity line-clamp-1"
                    >
                      {post.title}
                    </Link>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-zinc-400 dark:text-zinc-600 shrink-0">
                    <span className="flex items-center gap-1">
                      <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
                        <path d="M1 8s3-6 7-6 7 6 7 6-3 6-7 6-7-6-7-6z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                        <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.5"/>
                      </svg>
                      {post.views.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
                        <path d="M8 13.5C8 13.5 1.5 9.5 1.5 5.5C1.5 3.57 3.07 2 5 2C6.19 2 7.25 2.61 8 3.5C8.75 2.61 9.81 2 11 2C12.93 2 14.5 3.57 14.5 5.5C14.5 9.5 8 13.5 8 13.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {post.likes}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
                        <path d="M2 2h12v9H9l-3 3v-3H2V2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                      </svg>
                      {post.comments}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent activity */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
          <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
            <p className="text-xs tracking-[0.15em] uppercase text-zinc-400 dark:text-zinc-600">Recent activity</p>
          </div>
          {activity.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-sm text-zinc-400 dark:text-zinc-600">No activity yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-50 dark:divide-zinc-800">
              {activity.map((item) => (
                <div key={item.id} className="flex items-start gap-3 px-6 py-4">
                  <span className="mt-0.5 text-zinc-400 dark:text-zinc-600 shrink-0">
                    {activityIcon[item.type] ?? activityIcon.comment}
                  </span>
                  <div className="space-y-0.5">
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-snug">{item.body}</p>
                    <p className="text-xs text-zinc-400 dark:text-zinc-600">{timeAgo(item.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "New post", href: "/dashboard/posts/new", icon: "✦" },
          { label: "Manage posts", href: "/dashboard/posts", icon: "≡" },
          { label: "View comments", href: "/dashboard/comments", icon: "◻" },
          { label: "Subscribers", href: "/dashboard/subscribers", icon: "◎" },
        ].map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="flex items-center gap-3 px-4 py-3 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-900 dark:hover:border-zinc-50 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors duration-200"
          >
            <span className="text-base">{action.icon}</span>
            <span className="text-sm">{action.label}</span>
          </Link>
        ))}
      </div>

    </div>
  );
}
