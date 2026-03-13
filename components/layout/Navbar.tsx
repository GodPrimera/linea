"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignInButton, SignUpButton, useUser, useClerk } from "@clerk/nextjs";
import Image from "next/image";
import ThemeToggle from "@/components/layout/ThemeToggle";

const links = [
  { label: "Home", href: "/" },
  { label: "Blog", href: "/blog" },
  { label: "Categories", href: "/categories" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch unread notification count whenever route changes or user signs in
  useEffect(() => {
    if (!isSignedIn) { setUnreadCount(0); setUserRole(null); return; }
    fetch("/api/notifications/unread-count")
      .then((r) => r.json())
      .then((d) => setUnreadCount(d.count ?? 0))
      .catch(() => {});
    fetch("/api/me/role")
      .then((r) => r.json())
      .then((d) => setUserRole(d.role ?? null))
      .catch(() => {});
  }, [isSignedIn, pathname]);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  // Close menus on route change
  useEffect(() => {
    setMobileOpen(false);
    setMenuOpen(false);
  }, [pathname]);

  // Close user menu on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md shadow-[0_1px_0_0_rgba(0,0,0,0.06)] dark:shadow-[0_1px_0_0_rgba(255,255,255,0.06)]"
            : "bg-white dark:bg-zinc-950"
        }`}
      >
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex h-16 items-center justify-between gap-8">

            {/* Logo */}
            <Link
              href="/"
              className="shrink-0 font-display text-2xl font-light tracking-[0.15em] text-zinc-900 dark:text-zinc-50 hover:opacity-70 transition-opacity duration-200"
            >
              LINEA
            </Link>

            {/* Nav links — desktop */}
            <nav className="hidden md:flex items-center gap-1">
              {links.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative px-3 py-1.5 text-sm tracking-wide transition-colors duration-200 ${
                      isActive
                        ? "text-zinc-900 dark:text-zinc-50"
                        : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50"
                    }`}
                  >
                    {link.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-3 right-3 h-px bg-zinc-900 dark:bg-zinc-50" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-3">

              {/* Search */}
              <div className="relative flex items-center">
                {searchOpen ? (
                  <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2 duration-200">
                    <input
                      ref={searchRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search posts..."
                      className="w-48 border-b border-zinc-300 dark:border-zinc-700 bg-transparent pb-1 text-sm text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-50 transition-colors"
                      onKeyDown={(e) => {
                        if (e.key === "Escape") {
                          setSearchOpen(false);
                          setSearchQuery("");
                        }
                        if (e.key === "Enter" && searchQuery.trim()) {
                          window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
                        }
                      }}
                    />
                    <button
                      onClick={() => {
                        setSearchOpen(false);
                        setSearchQuery("");
                      }}
                      className="text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
                      aria-label="Close search"
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setSearchOpen(true)}
                    className="p-1.5 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors duration-200"
                    aria-label="Open search"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </button>
                )}
              </div>

              {/* Dark mode toggle */}
              <ThemeToggle />

              {/* Auth */}
              {isSignedIn ? (
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-transparent hover:ring-zinc-300 dark:hover:ring-zinc-700 transition-all duration-200"
                    aria-label="User menu"
                  >
                    {user?.imageUrl ? (
                      <Image
                        src={user.imageUrl}
                        alt={user.fullName ?? "Avatar"}
                        width={32}
                        height={32}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-xs font-medium text-zinc-600 dark:text-zinc-400">
                        {user?.firstName?.[0] ?? "?"}
                      </div>
                    )}
                  </button>

                  {menuOpen && (
                    <div className="absolute right-0 top-10 w-52 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-lg shadow-black/5 animate-in fade-in slide-in-from-top-1 duration-150 z-50">
                      {/* User info */}
                      <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50 truncate">
                          {user?.fullName ?? user?.username ?? "My Account"}
                        </p>
                        <p className="text-xs text-zinc-400 dark:text-zinc-600 truncate">
                          {user?.primaryEmailAddress?.emailAddress}
                        </p>
                      </div>

                      {/* Nav links */}
                      <div className="py-1">
                        {[
                          ...(userRole === "admin" ? [{ href: "/admin", label: "Admin panel", icon: (
                            <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M8 1l2 4h4l-3 3 1 4-4-2-4 2 1-4-3-3h4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>
                          )}] : []),
                          { href: "/dashboard", label: "Dashboard", icon: (
                            <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="6" height="6" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><rect x="9" y="1" width="6" height="6" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><rect x="1" y="9" width="6" height="6" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><rect x="9" y="9" width="6" height="6" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>
                          )},
                          ...(userRole === "reader" ? [{ href: "/apply", label: "Become an author", icon: (
                            <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M2 12L6 8l3 3 5-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          )}] : []),
                          { href: "/notifications", label: "Notifications", icon: (
                            <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M8 1a5 5 0 00-5 5v3l-1.5 2H14.5L13 9V6a5 5 0 00-5-5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="M6.5 13a1.5 1.5 0 003 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                          ), badge: unreadCount },
                          { href: "/bookmarks", label: "Bookmarks", icon: (
                            <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M3 2h10v13l-5-3-5 3V2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          )},
                          { href: "/settings", label: "Settings", icon: (
                            <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.5"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                          )},
                        ].map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                          >
                            <span className="text-zinc-400 dark:text-zinc-600">{item.icon}</span>
                            <span className="flex-1">{item.label}</span>
                            {"badge" in item && item.badge > 0 && (
                              <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-medium flex items-center justify-center">
                                {item.badge > 99 ? "99+" : item.badge}
                              </span>
                            )}
                          </Link>
                        ))}
                      </div>

                      {/* Sign out */}
                      <div className="py-1 border-t border-zinc-100 dark:border-zinc-800">
                        <button
                          onClick={() => signOut({ redirectUrl: "/" })}
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-zinc-500 dark:text-zinc-400 hover:text-red-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                        >
                          <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                            <path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3M10 11l3-3-3-3M13 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-2">
                  <SignInButton mode="modal">
                    <button className="px-4 py-1.5 text-sm tracking-wide text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors duration-200">
                      Sign in
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className="px-4 py-1.5 text-sm tracking-wide border border-zinc-900 dark:border-zinc-50 text-zinc-900 dark:text-zinc-50 hover:bg-zinc-900 hover:text-white dark:hover:bg-zinc-50 dark:hover:text-zinc-900 transition-all duration-200">
                      Get started
                    </button>
                  </SignUpButton>
                </div>
              )}

              {/* Mobile menu toggle */}
              <button
                className="md:hidden p-1.5 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle menu"
              >
                {mobileOpen ? (
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M1 1l16 16M17 1L1 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M2 4h14M2 9h14M2 14h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                )}
              </button>

            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-zinc-100 dark:border-zinc-900 bg-white dark:bg-zinc-950 animate-in slide-in-from-top-2 duration-200">
            <nav className="mx-auto max-w-6xl px-6 py-4 flex flex-col gap-1">
              {links.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`py-2.5 text-sm tracking-wide border-b border-zinc-50 dark:border-zinc-900 transition-colors duration-200 ${
                      isActive
                        ? "text-zinc-900 dark:text-zinc-50"
                        : "text-zinc-500 dark:text-zinc-400"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
              {isSignedIn ? (
                <div className="flex flex-col gap-1 pt-2 border-t border-zinc-100 dark:border-zinc-900">
                  {[
                    { href: "/dashboard", label: "Dashboard" },
                    { href: "/notifications", label: "Notifications", badge: unreadCount },
                    { href: "/bookmarks", label: "Bookmarks" },
                    { href: "/settings", label: "Settings" },
                  ].map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="py-2.5 text-sm text-zinc-500 dark:text-zinc-400 border-b border-zinc-50 dark:border-zinc-900 flex items-center justify-between"
                    >
                      {item.label}
                      {"badge" in item && item.badge > 0 && (
                        <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-medium flex items-center justify-center">
                          {item.badge > 99 ? "99+" : item.badge}
                        </span>
                      )}
                    </Link>
                  ))}
                  <button
                    onClick={() => signOut({ redirectUrl: "/" })}
                    className="py-2.5 text-sm text-left text-red-400 hover:text-red-600 transition-colors"
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <div className="flex gap-3 pt-3">
                  <SignInButton mode="modal">
                    <button className="flex-1 py-2 text-sm border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400">
                      Sign in
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className="flex-1 py-2 text-sm bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900">
                      Get started
                    </button>
                  </SignUpButton>
                </div>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Spacer so content doesn't hide behind fixed navbar */}
      <div className="h-16" />
    </>
  );
}
