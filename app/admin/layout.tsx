import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/queries/users";
import Link from "next/link";
import { headers } from "next/headers";

const navLinks = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/applications", label: "Applications" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/posts", label: "Posts" },
  { href: "/admin/comments", label: "Comments" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  if (user.role !== "admin") redirect("/");

  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "";

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 h-14 flex items-center px-6 gap-8">
        <span className="font-display text-lg font-light tracking-widest text-zinc-900 dark:text-zinc-50">
          LINEA <span className="text-xs tracking-normal font-sans text-zinc-400">admin</span>
        </span>
        <nav className="flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3 py-1.5 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <Link
            href="/dashboard"
            className="text-xs text-zinc-400 dark:text-zinc-600 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
          >
            ← Author dashboard
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="pt-14">
        <div className="mx-auto max-w-6xl px-6 py-10">
          {children}
        </div>
      </div>
    </div>
  );
}
