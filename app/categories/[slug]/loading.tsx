import { Skeleton } from "@/components/Skeleton";
import { PostCardSkeleton } from "@/components/Skeleton";

export default function CategoryLoading() {
  return (
    <div className="bg-white dark:bg-zinc-950 min-h-screen">
      <div className="mx-auto max-w-6xl px-6 pt-16 pb-12 border-b border-zinc-100 dark:border-zinc-900">
        <Skeleton className="h-3 w-24 mb-4" />
        <Skeleton className="h-12 w-56 mb-3" />
        <Skeleton className="h-4 w-full max-w-md" />
      </div>
      <div className="mx-auto max-w-6xl px-6 py-10">
        {Array.from({ length: 5 }).map((_, i) => (
          <PostCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
