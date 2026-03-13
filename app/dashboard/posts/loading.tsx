import { Skeleton } from "@/components/Skeleton";

export default function DashboardPostsLoading() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-9 w-28" />
      </div>
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-24" />
        ))}
      </div>
      <div className="border border-zinc-200 dark:border-zinc-800">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-4 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
            <Skeleton className="h-4 w-16 shrink-0" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-20 shrink-0" />
            <Skeleton className="h-4 w-16 shrink-0" />
            <Skeleton className="h-4 w-10 shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
