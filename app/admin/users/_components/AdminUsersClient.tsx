"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { changeUserRoleAction } from "@/lib/actions/admin";

type User = {
  id: string;
  name: string;
  email: string;
  username: string;
  role: string;
  avatarUrl: string | null;
  createdAt: Date;
};

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400",
  author: "bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400",
  reader: "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400",
};

export default function AdminUsersClient({ initialUsers }: { initialUsers: User[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();
  const [changingId, setChangingId] = useState<string | null>(null);

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase())
  );

  function handleRoleChange(userId: string, newRole: "reader" | "author" | "admin") {
    setChangingId(userId);
    startTransition(async () => {
      try {
        await changeUserRoleAction(userId, newRole);
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
      } catch (e) {
        console.error(e);
      } finally {
        setChangingId(null);
      }
    });
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs tracking-widests uppercase text-zinc-400 dark:text-zinc-600 mb-2">Admin</p>
          <h1 className="font-display text-4xl font-light text-zinc-900 dark:text-zinc-50">Users</h1>
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
            placeholder="Search users..."
            className="pl-9 pr-4 py-2 border border-zinc-200 dark:border-zinc-800 bg-transparent text-sm text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-50 transition-colors w-56"
          />
        </div>
      </div>

      <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 divide-y divide-zinc-100 dark:divide-zinc-800">
        {filtered.length === 0 && (
          <p className="text-sm text-zinc-400 dark:text-zinc-600 text-center py-10">No users found</p>
        )}
        {filtered.map((user) => (
          <div key={user.id} className="flex items-center gap-4 px-5 py-4">
            {/* Avatar */}
            <div className="w-8 h-8 rounded-full overflow-hidden bg-zinc-200 dark:bg-zinc-800 shrink-0">
              {user.avatarUrl ? (
                <Image src={user.avatarUrl} alt={user.name} width={32} height={32} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-zinc-500">
                  {user.name[0]}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50 truncate">{user.name}</p>
              <p className="text-xs text-zinc-400 dark:text-zinc-600 truncate">@{user.username} · {user.email}</p>
            </div>

            {/* Role badge */}
            <span className={`text-xs px-2 py-0.5 shrink-0 ${ROLE_COLORS[user.role] ?? ""}`}>
              {user.role}
            </span>

            {/* Role change */}
            <select
              value={user.role}
              disabled={isPending && changingId === user.id}
              onChange={(e) => handleRoleChange(user.id, e.target.value as "reader" | "author" | "admin")}
              className="text-xs border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-600 dark:text-zinc-400 px-2 py-1 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-50 transition-colors"
            >
              <option value="reader">reader</option>
              <option value="author">author</option>
              <option value="admin">admin</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}
