"use client";

import { useState } from "react";
import { subscribeToNewsletter } from "@/lib/actions/newsletter";

export default function NewsletterForm({ compact = false }: { compact?: boolean }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus("loading");
    setMessage("");

    const result = await subscribeToNewsletter(email.trim());

    if (result.error) {
      setStatus("error");
      setMessage(result.error);
    } else {
      setStatus("success");
      setMessage(result.message ?? "You're subscribed.");
      setEmail("");
    }
  }

  if (status === "success") {
    return (
      <div className={`space-y-1 ${compact ? "" : "py-2"}`}>
        <p className={`font-medium text-zinc-900 dark:text-zinc-50 ${compact ? "text-sm" : "text-base"}`}>
          ✦ {message}
        </p>
        <p className="text-sm text-zinc-400 dark:text-zinc-600">
          New posts will land in your inbox.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className={`flex gap-0 ${compact ? "" : "max-w-sm"}`}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          className={`flex-1 border border-r-0 border-zinc-200 dark:border-zinc-800 bg-transparent px-3 text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-50 transition-colors ${compact ? "py-2 text-sm" : "py-2.5 text-sm"}`}
        />
        <button
          type="submit"
          disabled={status === "loading" || !email.trim()}
          className={`border border-zinc-900 dark:border-zinc-50 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-200 disabled:opacity-50 transition-colors whitespace-nowrap ${compact ? "px-4 py-2 text-xs" : "px-5 py-2.5 text-sm"}`}
        >
          {status === "loading" ? "..." : "Subscribe"}
        </button>
      </div>

      {status === "error" && (
        <p className="text-xs text-red-500 animate-in fade-in duration-200">
          {message}
        </p>
      )}

      <p className="text-xs text-zinc-400 dark:text-zinc-600">
        No spam. Unsubscribe any time.
      </p>
    </form>
  );
}
