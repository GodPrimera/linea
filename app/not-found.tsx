import Link from "next/link";

export default function NotFound() {
  return (
    <div className="bg-white dark:bg-zinc-950 min-h-screen flex items-center justify-center px-6">
      <div className="text-center space-y-8 max-w-md">

        {/* Big 404 */}
        <p className="font-display text-[10rem] leading-none font-light text-zinc-100 dark:text-zinc-900 select-none">
          404
        </p>

        <div className="space-y-3 -mt-4">
          <h1 className="font-display text-3xl font-light text-zinc-900 dark:text-zinc-50">
            Page not found
          </h1>
          <p className="text-sm text-zinc-400 dark:text-zinc-600 leading-relaxed">
            The page you&apos;re looking for doesn&apos;t exist or may have been moved.
            If you followed a link, it might be outdated.
          </p>
        </div>

        {/* Links */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="px-6 py-2.5 text-sm bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors w-full sm:w-auto"
          >
            Go home
          </Link>
          <Link
            href="/blog"
            className="px-6 py-2.5 text-sm border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-900 dark:hover:border-zinc-50 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors w-full sm:w-auto"
          >
            Browse posts
          </Link>
        </div>

        {/* Subtle divider */}
        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-900">
          <p className="text-xs text-zinc-300 dark:text-zinc-700">
            LINEA · A space to think slowly
          </p>
        </div>

      </div>
    </div>
  );
}
