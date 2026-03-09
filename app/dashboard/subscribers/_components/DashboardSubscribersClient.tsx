"use client";

import { useState, useMemo } from "react";
import type { Subscriber } from "@/lib/queries/subscribers";

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

function exportCsv(subscribers: Subscriber[]) {
  const header = "Email,Name,Subscribed,Status,Confirmed";
  const rows = subscribers.map((s) =>
    [
      s.email,
      s.name ?? "",
      formatDate(s.subscribedAt),
      s.active ? "Active" : "Inactive",
      s.confirmed ? "Yes" : "No",
    ].join(",")
  );
  const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "subscribers.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export default function DashboardSubscribersClient({
  initialSubscribers,
}: {
  initialSubscribers: Subscriber[];
}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");

  const filtered = useMemo(() => {
    return initialSubscribers.filter((s) => {
      const matchesFilter =
        filter === "all" ||
        (filter === "active" && s.active) ||
        (filter === "inactive" && !s.active);
      const matchesSearch =
        s.email.toLowerCase().includes(search.toLowerCase()) ||
        (s.name ?? "").toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [initialSubscribers, search, filter]);

  const activeCount = initialSubscribers.filter((s) => s.active).length;

  const thisMonthCount = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return initialSubscribers.filter((s) => new Date(s.subscribedAt) >= startOfMonth).length;
  }, [initialSubscribers]);

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl font-light text-zinc-900 dark:text-zinc-50">
            Subscribers
          </h1>
          <p className="text-sm text-zinc-400 dark:text-zinc-600 mt-1">
            {activeCount} active subscribers
          </p>
        </div>
        <button
          onClick={() => exportCsv(filtered)}
          className="flex items-center gap-2 px-4 py-2 text-sm border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-900 dark:hover:border-zinc-50 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M6.5 1v7M3.5 5l3 3 3-3M1 10v2h11v-2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total", value: initialSubscribers.length },
          { label: "Active", value: activeCount },
          { label: "This month", value: thisMonthCount },
        ].map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 px-5 py-4">
            <p className="font-display text-3xl font-light text-zinc-900 dark:text-zinc-50">{stat.value}</p>
            <p className="text-xs tracking-widest uppercase text-zinc-400 dark:text-zinc-600 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filters + search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          {(["all", "active", "inactive"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs capitalize transition-colors ${
                filter === f
                  ? "bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900"
                  : "border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:border-zinc-400"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" width="13" height="13" viewBox="0 0 16 16" fill="none">
            <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search subscribers..."
            className="pl-8 pr-4 py-1.5 border border-zinc-200 dark:border-zinc-800 bg-transparent text-sm text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-50 transition-colors w-52"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-100 dark:border-zinc-800">
              <th className="text-left px-6 py-3 text-xs tracking-widest uppercase text-zinc-400 dark:text-zinc-600 font-normal">Email</th>
              <th className="text-left px-4 py-3 text-xs tracking-widest uppercase text-zinc-400 dark:text-zinc-600 font-normal hidden sm:table-cell">Name</th>
              <th className="text-left px-4 py-3 text-xs tracking-widest uppercase text-zinc-400 dark:text-zinc-600 font-normal hidden md:table-cell">Subscribed</th>
              <th className="text-left px-4 py-3 text-xs tracking-widest uppercase text-zinc-400 dark:text-zinc-600 font-normal">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800">
            {filtered.map((sub) => (
              <tr key={sub.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                <td className="px-6 py-3">
                  <p className="text-sm text-zinc-900 dark:text-zinc-50">{sub.email}</p>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {sub.name ?? <span className="text-zinc-300 dark:text-zinc-700">—</span>}
                  </p>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <p className="text-sm text-zinc-400 dark:text-zinc-600">{formatDate(sub.subscribedAt)}</p>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 ${
                      sub.active
                        ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"
                    }`}>
                      {sub.active ? "Active" : "Inactive"}
                    </span>
                    {!sub.confirmed && sub.active && (
                      <span className="text-xs px-2 py-0.5 bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
                        Unconfirmed
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-sm text-zinc-400 dark:text-zinc-600">No subscribers found</p>
          </div>
        )}
      </div>

    </div>
  );
}
