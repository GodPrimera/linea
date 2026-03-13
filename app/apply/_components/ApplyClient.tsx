"use client";

import { useState, useTransition } from "react";
import { submitApplicationAction } from "@/lib/actions/admin";

export default function ApplyClient() {
  const [reason, setReason] = useState("");
  const [writingSamples, setWritingSamples] = useState("");
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        await submitApplicationAction({ reason, writingSamples });
        setSuccess(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

  if (success) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center mx-auto">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M4 10l4 4 8-8" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 className="font-display text-2xl font-light text-zinc-900 dark:text-zinc-50">
            Application submitted
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Thank you for applying. The admin will review your application and you'll be notified once a decision is made.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <div className="mx-auto max-w-2xl px-6 pt-20 pb-16">

        {/* Header */}
        <div className="mb-12">
          <p className="text-xs tracking-[0.2em] uppercase text-zinc-400 dark:text-zinc-500 mb-4">
            Linea Platform
          </p>
          <h1 className="font-display text-4xl font-light text-zinc-900 dark:text-zinc-50 mb-4">
            Become an author
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Linea is a platform for thoughtful, intentional writing. Tell us about yourself and why you'd like to publish here.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* Why do you want to write */}
          <div className="space-y-2">
            <label className="text-xs tracking-widest uppercase text-zinc-400 dark:text-zinc-600">
              Why do you want to write on Linea? <span className="text-red-400">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={6}
              required
              minLength={50}
              placeholder="Tell us about your writing background, what topics you'd cover, and why Linea is the right platform for you..."
              className="w-full border border-zinc-200 dark:border-zinc-800 bg-transparent px-4 py-3 text-sm text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-300 dark:placeholder:text-zinc-700 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-50 transition-colors resize-none"
            />
            <p className="text-xs text-zinc-400 dark:text-zinc-600 text-right">
              {reason.length} characters {reason.length < 50 && `(minimum 50)`}
            </p>
          </div>

          {/* Writing samples */}
          <div className="space-y-2">
            <label className="text-xs tracking-widest uppercase text-zinc-400 dark:text-zinc-600">
              Writing samples or links
              <span className="ml-2 text-zinc-300 dark:text-zinc-700 normal-case tracking-normal">(optional)</span>
            </label>
            <textarea
              value={writingSamples}
              onChange={(e) => setWritingSamples(e.target.value)}
              rows={3}
              placeholder="Links to previous writing, personal blog, Medium profile, etc."
              className="w-full border border-zinc-200 dark:border-zinc-800 bg-transparent px-4 py-3 text-sm text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-300 dark:placeholder:text-zinc-700 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-50 transition-colors resize-none"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 border border-red-200 dark:border-red-900 px-4 py-3">
              {error}
            </p>
          )}

          <div className="flex items-center gap-4 pt-2 border-t border-zinc-100 dark:border-zinc-900">
            <button
              type="submit"
              disabled={isPending || reason.trim().length < 50}
              className="px-8 py-3 text-sm bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {isPending ? "Submitting..." : "Submit application"}
            </button>
            <p className="text-xs text-zinc-400 dark:text-zinc-600">
              You'll be notified once reviewed
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
