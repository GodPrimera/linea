"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

function UnsubscribeForm() {
  const searchParams = useSearchParams();
  const emailFromParam = searchParams.get("email") ?? "";
  const [email, setEmail] = useState(emailFromParam);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleUnsubscribe(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");

    const res = await fetch("/api/newsletter/unsubscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();

    if (!res.ok) {
      setStatus("error");
      setMessage(data.error ?? "Something went wrong.");
    } else {
      setStatus("success");
    }
  }

  if (status === "success") {
    return (
      <div className="text-center space-y-4">
        <p className="font-display text-2xl font-light text-zinc-900 dark:text-zinc-50">
          Unsubscribed
        </p>
        <p className="text-sm text-zinc-400 dark:text-zinc-600 leading-relaxed">
          You've been removed from the newsletter. Sorry to see you go.
        </p>
        <Link
          href="/"
          className="inline-block text-sm text-zinc-500 underline underline-offset-2 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
        >
          Return to Linea
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleUnsubscribe} className="space-y-5">
      <div className="space-y-1.5">
        <label htmlFor="email" className="text-xs tracking-widest uppercase text-zinc-400 dark:text-zinc-600">
          Email address
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="w-full border border-zinc-200 dark:border-zinc-800 bg-transparent px-3 py-2.5 text-sm text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-50 transition-colors"
        />
      </div>

      {status === "error" && (
        <p className="text-xs text-red-500">{message}</p>
      )}

      <button
        type="submit"
        disabled={status === "loading" || !email.trim()}
        className="w-full py-2.5 text-sm border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-900 dark:hover:border-zinc-50 hover:text-zinc-900 dark:hover:text-zinc-50 disabled:opacity-40 transition-colors"
      >
        {status === "loading" ? "Unsubscribing..." : "Unsubscribe"}
      </button>

      <p className="text-center">
        <Link
          href="/"
          className="text-xs text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
        >
          Changed your mind? Go back →
        </Link>
      </p>
    </form>
  );
}

export default function UnsubscribePage() {
  return (
    <div className="bg-white dark:bg-zinc-950 min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <Link
            href="/"
            className="font-display text-2xl font-light tracking-[0.2em] text-zinc-900 dark:text-zinc-50 hover:opacity-70 transition-opacity"
          >
            LINEA
          </Link>
          <h1 className="font-display text-2xl font-light text-zinc-900 dark:text-zinc-50">
            Unsubscribe
          </h1>
          <p className="text-sm text-zinc-400 dark:text-zinc-600">
            Enter your email to stop receiving the newsletter.
          </p>
        </div>
        <Suspense>
          <UnsubscribeForm />
        </Suspense>
      </div>
    </div>
  );
}
