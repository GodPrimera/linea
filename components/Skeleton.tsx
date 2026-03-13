// Thin shimmer skeleton primitive used across all loading states

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-zinc-100 dark:bg-zinc-800 ${className}`}
    />
  );
}

// ── Post card skeleton ────────────────────────────────────────────────────────
export function PostCardSkeleton() {
  return (
    <div className="border-b border-zinc-100 dark:border-zinc-900 py-8">
      <div className="flex items-center gap-2 mb-3">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-24" />
      </div>
      <Skeleton className="h-7 w-3/4 mb-2" />
      <Skeleton className="h-7 w-1/2 mb-4" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-5/6 mb-6" />
      <div className="flex items-center gap-4">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );
}

// ── Post card with cover image skeleton ───────────────────────────────────────
export function PostCardImageSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="aspect-[16/9] w-full" />
      <div className="space-y-2 px-1">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    </div>
  );
}

// ── Full post page skeleton ───────────────────────────────────────────────────
export function PostPageSkeleton() {
  return (
    <div className="mx-auto max-w-6xl px-6 pt-16 pb-24">
      <div className="max-w-2xl mx-auto space-y-6">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-3/4" />
        <div className="flex items-center gap-4 py-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="aspect-[16/9] w-full" />
        <div className="space-y-3 pt-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className={`h-4 ${i % 5 === 4 ? "w-2/3" : "w-full"}`} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Notification skeleton ─────────────────────────────────────────────────────
export function NotificationSkeleton() {
  return (
    <div className="flex items-start gap-4 px-5 py-4 border-b border-zinc-100 dark:border-zinc-900">
      <Skeleton className="h-8 w-8 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-3 w-12 shrink-0" />
    </div>
  );
}

// ── Category card skeleton ────────────────────────────────────────────────────
export function CategoryCardSkeleton() {
  return (
    <div className="p-6 border border-zinc-100 dark:border-zinc-900 space-y-3">
      <Skeleton className="h-5 w-1/2" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-16 mt-2" />
    </div>
  );
}

// ── Dashboard stat card skeleton ──────────────────────────────────────────────
export function StatCardSkeleton() {
  return (
    <div className="p-6 border border-zinc-100 dark:border-zinc-900 space-y-2">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-9 w-16" />
    </div>
  );
}
