"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to error reporting service: Sentry.captureException(error)
    console.error(error);
  }, [error]);

  return (
    <div className="bg-white dark:bg-zinc-950 min-h-screen flex items-center justify-center px-6">
      <div className="text-center space-y-8 max-w-md">

        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-300 dark:text-zinc-700">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <circle cx="14" cy="14" r="12" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M14 8v7M14 18v1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="font-display text-3xl font-light text-zinc-900 dark:text-zinc-50">
            Something went wrong
          </h1>
          <p className="text-sm text-zinc-400 dark:text-zinc-600 leading-relaxed">
            An unexpected error occurred. This has been logged and we'll look into it.
          </p>
          {error.digest && (
            <p className="text-xs text-zinc-300 dark:text-zinc-700 font-mono">
              Error ID: {error.digest}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={reset}
            className="px-6 py-2.5 text-sm bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors w-full sm:w-auto"
          >
            Try again
          </button>
          <Link
            href="/"
            className="px-6 py-2.5 text-sm border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-900 dark:hover:border-zinc-50 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors w-full sm:w-auto"
          >
            Go home
          </Link>
        </div>

        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-900">
          <p className="text-xs text-zinc-300 dark:text-zinc-700">
            LINEA · A space to think slowly
          </p>
        </div>

      </div>
    </div>
  );
}
