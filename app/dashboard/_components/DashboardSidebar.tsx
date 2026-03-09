"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { UserButton } from "@clerk/nextjs";

const navItems = [
  {
    label: "Overview",
    href: "/dashboard",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="1" width="6" height="6" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        <rect x="9" y="1" width="6" height="6" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        <rect x="1" y="9" width="6" height="6" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        <rect x="9" y="9" width="6" height="6" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    label: "Posts",
    href: "/dashboard/posts",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M3 4h10M3 8h10M3 12h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    label: "Comments",
    href: "/dashboard/comments",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M2 2h12v9H9l-3 3v-3H2V2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    label: "Categories",
    href: "/dashboard/categories",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M1 4l2-2h4l2 2M1 4h14v10H1V4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    label: "Media",
    href: "/dashboard/media",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="3" width="14" height="10" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        <circle cx="5.5" cy="7" r="1.5" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M1 11l4-3 3 2 3-3 4 3" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    label: "Subscribers",
    href: "/dashboard/subscribers",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M1 12s1-3 7-3 7 3 7 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    ),
  },
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname.startsWith(href);

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="md:hidden fixed top-20 left-4 z-40 p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle sidebar"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-30 bg-black/20"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-40 w-60 bg-white dark:bg-zinc-900 border-r border-zinc-100 dark:border-zinc-800 flex flex-col transition-transform duration-200 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-zinc-100 dark:border-zinc-800">
          <Link
            href="/"
            className="font-display text-xl font-light tracking-[0.15em] text-zinc-900 dark:text-zinc-50 hover:opacity-70 transition-opacity"
          >
            LINEA
          </Link>
          <span className="ml-2 text-xs text-zinc-400 dark:text-zinc-600 tracking-wide">
            admin
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 text-sm transition-colors duration-150 ${
                isActive(item.href)
                  ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
              }`}
            >
              <span className={isActive(item.href) ? "text-zinc-900 dark:text-zinc-50" : "text-zinc-400 dark:text-zinc-600"}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          ))}

          {/* Divider */}
          <div className="pt-4 mt-4 border-t border-zinc-100 dark:border-zinc-800">
            <Link
              href="/dashboard/posts/new"
              className="flex items-center gap-3 px-3 py-2.5 text-sm bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors duration-150"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              New post
            </Link>
          </div>
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-3">
          <UserButton appearance={{ elements: { avatarBox: "w-8 h-8" } }} />
          <div className="min-w-0">
            <p className="text-xs font-medium text-zinc-900 dark:text-zinc-50 truncate">
              My Account
            </p>
            <Link
              href="/"
              className="text-xs text-zinc-400 dark:text-zinc-600 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
            >
              View site →
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
