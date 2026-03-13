import { Skeleton } from "@/components/Skeleton";

export default function AdminCommentsLoading() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-10 w-40" />
        </div>
        <Skeleton className="h-9 w-48" />
      </div>
      <div className="border border-zinc-200 dark:border-zinc-800 divide-y divide-zinc-100 dark:divide-zinc-800">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="px-5 py-4 space-y-2">
            <div className="flex justify-between gap-4">
              <Skeleton className="h-3 w-48" />
              <Skeleton className="h-3 w-10 shrink-0" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ))}
      </div>
    </div>
  );
}
