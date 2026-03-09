import Image from "next/image";
import Link from "next/link";
import { getAllCategories } from "@/lib/queries/categories";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Categories",
  description: "Browse all topics and categories on Linea.",
  openGraph: { title: "Categories — Linea", type: "website" },
};

export default async function CategoriesPage() {
  const categories = await getAllCategories();

  return (
    <div className="bg-white dark:bg-zinc-950 min-h-screen">

      {/* Header */}
      <div className="mx-auto max-w-6xl px-6 pt-16 pb-12 border-b border-zinc-100 dark:border-zinc-900">
        <p className="text-xs tracking-[0.2em] uppercase text-zinc-400 dark:text-zinc-500 mb-4">
          Browse by topic
        </p>
        <h1 className="font-display text-5xl md:text-6xl font-light text-zinc-900 dark:text-zinc-50 leading-[1.1]">
          Categories
        </h1>
      </div>

      {/* Category cards */}
      <div className="mx-auto max-w-6xl px-6 py-16">
        {categories.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-sm text-zinc-400 dark:text-zinc-600">No categories yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {categories.map((cat, i) => (
              <Link
                key={cat.slug}
                href={`/categories/${cat.slug}`}
                className="group relative overflow-hidden block"
              >
                {/* Cover image */}
                <div className={`relative overflow-hidden bg-zinc-100 dark:bg-zinc-900 ${i === 0 ? "h-72" : "h-56"}`}>
                  {cat.coverImage ? (
                    <Image
                      src={cat.coverImage}
                      alt={cat.name}
                      fill
                      className="object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-zinc-200 to-zinc-100 dark:from-zinc-800 dark:to-zinc-900" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                  {/* Text overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="flex items-end justify-between gap-4">
                      <div>
                        <h2 className="font-display text-2xl md:text-3xl font-light text-white leading-snug mb-1">
                          {cat.name}
                        </h2>
                        {cat.description && (
                          <p className="text-sm text-white/70 leading-relaxed line-clamp-2 max-w-sm">
                            {cat.description}
                          </p>
                        )}
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="font-display text-3xl font-light text-white">
                          {cat.postCount}
                        </p>
                        <p className="text-xs tracking-widest uppercase text-white/60 mt-0.5">
                          {cat.postCount === 1 ? "post" : "posts"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
