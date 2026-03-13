import { Skeleton } from "@/components/Skeleton";
import { PostCardSkeleton } from "@/components/Skeleton";

export default function AuthorLoading() {
  return (
    <div className="bg-white dark:bg-zinc-950 min-h-screen">
      {/* Cover */}
      <Skeleton className="h-48 w-full" />
      {/* Profile header */}
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex items-end gap-6 -mt-10 mb-8">
          <Skeleton className="w-20 h-20 rounded-full shrink-0" />
          <div className="space-y-2 pb-2 flex-1">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-9 w-24 shrink-0 hidden sm:block" />
        </div>
        <div className="flex gap-10 pb-10 border-b border-zinc-100 dark:border-zinc-900">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-full max-w-sm" />
            <Skeleton className="h-4 w-3/4 max-w-xs" />
          </div>
        </div>
        <div className="py-10">
          {Array.from({ length: 4 }).map((_, i) => (
            <PostCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
