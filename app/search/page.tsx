import { Suspense } from "react";
import SearchClient from "./_components/SearchClient";

export default function SearchPage() {
  return (
    <div className="bg-white dark:bg-zinc-950 min-h-screen">
      <div className="mx-auto max-w-4xl px-6 pt-16 pb-12">
        <Suspense>
          <SearchClient />
        </Suspense>
      </div>
    </div>
  );
}
