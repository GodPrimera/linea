import { PostCardSkeleton } from "@/components/Skeleton";
import { Skeleton } from "@/components/Skeleton";

export default function SearchLoading() {
  return (
    <div className="bg-white dark:bg-zinc-950 min-h-screen">
      <div className="mx-auto max-w-6xl px-6 pt-16 pb-12 border-b border-zinc-100 dark:border-zinc-900">
        <Skeleton className="h-3 w-16 mb-4" />
        <Skeleton className="h-14 w-48" />
      </div>
      <div className="mx-auto max-w-6xl px-6 py-10 space-y-8">
        <Skeleton className="h-12 w-full max-w-xl" />
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-20" />
          ))}
        </div>
        <div>
          {Array.from({ length: 4 }).map((_, i) => (
            <PostCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
