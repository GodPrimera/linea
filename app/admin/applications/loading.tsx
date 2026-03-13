import { Skeleton } from "@/components/Skeleton";

export default function AdminApplicationsLoading() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-10 w-52" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-3 w-24" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="border border-zinc-200 dark:border-zinc-800 p-5 flex justify-between items-start">
            <div className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-4 w-4" />
          </div>
        ))}
      </div>
    </div>
  );
}
