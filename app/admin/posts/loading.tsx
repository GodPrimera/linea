import { Skeleton } from "@/components/Skeleton";

export default function AdminPostsLoading() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-9 w-48" />
      </div>
      <div className="border border-zinc-200 dark:border-zinc-800 divide-y divide-zinc-100 dark:divide-zinc-800">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4">
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-40" />
            </div>
            <Skeleton className="h-4 w-12 shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
