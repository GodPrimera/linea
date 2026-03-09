"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

const RECENT_KEY = "linea-recent-searches";

type PostResult = {
  id: string; slug: string; title: string; excerpt: string;
  coverImageUrl: string | null; readingTime: number | null;
  categoryName: string | null; categorySlug: string | null;
  authorName: string; authorUsername: string; authorAvatarUrl: string | null;
};
type AuthorResult = {
  id: string; username: string; name: string;
  bio: string | null; avatarUrl: string | null; postCount: number;
};
type TagResult = { id: string; name: string; slug: string };
type CategoryResult = { id: string; name: string; slug: string };

type SearchResults = {
  posts: PostResult[];
  authors: AuthorResult[];
  tags: TagResult[];
  categories: CategoryResult[];
};

type ResultType = "all" | "posts" | "authors" | "tags";

function highlight(text: string, query: string) {
  if (!query.trim()) return <>{text}</>;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 rounded-sm px-0.5">
            {part}
          </mark>
        ) : part
      )}
    </>
  );
}

export default function SearchClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const initialQ = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(initialQ);
  const [results, setResults] = useState<SearchResults>({ posts: [], authors: [], tags: [], categories: [] });
  const [loading, setLoading] = useState(false);
  const [activeType, setActiveType] = useState<ResultType>("all");

  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]"); }
    catch { return []; }
  });

  useEffect(() => { inputRef.current?.focus(); }, []);

  // Debounced search + URL update
  useEffect(() => {
    const q = query.trim();
    const timeout = setTimeout(async () => {
      if (q.length < 2) {
        setResults({ posts: [], authors: [], tags: [], categories: [] });
        router.replace("/search", { scroll: false });
        return;
      }
      router.replace(`/search?q=${encodeURIComponent(q)}`, { scroll: false });
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        setResults(data);
      } catch {
        setResults({ posts: [], authors: [], tags: [], categories: [] });
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [query]);

  function saveRecentSearch(q: string) {
    if (!q.trim()) return;
    const updated = [q, ...recentSearches.filter((s) => s !== q)].slice(0, 6);
    setRecentSearches(updated);
    try { localStorage.setItem(RECENT_KEY, JSON.stringify(updated)); } catch {}
  }

  function clearRecentSearches() {
    setRecentSearches([]);
    try { localStorage.removeItem(RECENT_KEY); } catch {}
  }

  function handleSearch(q: string) {
    setQuery(q);
    if (q.trim()) saveRecentSearch(q.trim());
  }

  const q = query.trim();
  const totalResults = results.posts.length + results.authors.length + results.tags.length + results.categories.length;
  const hasResults = totalResults > 0;
  const showEmpty = q.length >= 2 && !loading && !hasResults;

  const types: { id: ResultType; label: string; count: number }[] = [
    { id: "all", label: "All", count: totalResults },
    { id: "posts", label: "Posts", count: results.posts.length },
    { id: "authors", label: "Authors", count: results.authors.length },
    { id: "tags", label: "Tags & Categories", count: results.tags.length + results.categories.length },
  ];

  return (
    <div className="space-y-10">

      {/* Search input */}
      <div className="space-y-2">
        <div className="relative flex items-center">
          <svg className="absolute left-4 text-zinc-400 shrink-0" width="18" height="18" viewBox="0 0 16 16" fill="none">
            <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search posts, authors, tags..."
            className="w-full pl-12 pr-12 py-4 border border-zinc-200 dark:border-zinc-800 bg-transparent text-lg text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-300 dark:placeholder:text-zinc-700 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-50 transition-colors"
          />
          {loading && (
            <div className="absolute right-4 w-4 h-4 border-2 border-zinc-300 dark:border-zinc-700 border-t-zinc-600 dark:border-t-zinc-300 rounded-full animate-spin" />
          )}
          {!loading && query && (
            <button onClick={() => { setQuery(""); setResults({ posts: [], authors: [], tags: [], categories: [] }); }}
              className="absolute right-4 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          )}
        </div>
        {q.length >= 2 && !loading && (
          <p className="text-xs text-zinc-400 dark:text-zinc-600 pl-1">
            {hasResults
              ? `${totalResults} result${totalResults !== 1 ? "s" : ""} for "${query}"`
              : `No results for "${query}"`}
          </p>
        )}
      </div>

      {/* No query — recent searches + browse */}
      {!q && (
        <div className="space-y-6">
          {recentSearches.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs tracking-[0.2em] uppercase text-zinc-400 dark:text-zinc-500">Recent searches</p>
                <button onClick={clearRecentSearches} className="text-xs text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors">
                  Clear all
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((s) => (
                  <button key={s} onClick={() => handleSearch(s)}
                    className="flex items-center gap-2 px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-600 dark:text-zinc-400 hover:border-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors">
                    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                      <path d="M1 5.5A4.5 4.5 0 105.5 1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                      <path d="M1 2v3.5h3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-16 text-center space-y-3">
              <p className="font-display text-3xl font-light text-zinc-300 dark:text-zinc-700">Search Linea</p>
              <p className="text-sm text-zinc-400 dark:text-zinc-600">Find posts, authors, categories and tags</p>
            </div>
          )}
        </div>
      )}

      {/* Has query — results */}
      {q.length >= 2 && !loading && hasResults && (
        <div className="space-y-8">

          {/* Type tabs */}
          <div className="flex items-center gap-1 border-b border-zinc-100 dark:border-zinc-900">
            {types.filter((t) => t.count > 0 || t.id === "all").map((t) => (
              <button key={t.id} onClick={() => setActiveType(t.id)}
                className={`px-4 py-2.5 text-sm transition-colors duration-150 border-b-2 -mb-px ${
                  activeType === t.id
                    ? "border-zinc-900 dark:border-zinc-50 text-zinc-900 dark:text-zinc-50"
                    : "border-transparent text-zinc-400 dark:text-zinc-600 hover:text-zinc-700 dark:hover:text-zinc-300"
                }`}>
                {t.label}
                {t.count > 0 && <span className="ml-1.5 text-xs text-zinc-400 dark:text-zinc-600">{t.count}</span>}
              </button>
            ))}
          </div>

          {/* Posts */}
          {(activeType === "all" || activeType === "posts") && results.posts.length > 0 && (
            <div className="space-y-5">
              {activeType === "all" && <p className="text-xs tracking-[0.2em] uppercase text-zinc-400 dark:text-zinc-500">Posts</p>}
              <div className="space-y-4">
                {results.posts.map((post) => (
                  <Link key={post.id} href={`/blog/${post.slug}`}
                    className="group flex gap-4 items-start py-4 border-b border-zinc-50 dark:border-zinc-900 last:border-0">
                    <div className="w-20 h-14 shrink-0 overflow-hidden bg-zinc-100 dark:bg-zinc-900">
                      {post.coverImageUrl && (
                        <Image src={post.coverImageUrl} alt={post.title} width={80} height={56}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        {post.categoryName && (
                          <span className="text-xs text-zinc-400 dark:text-zinc-600 tracking-wide uppercase">{post.categoryName}</span>
                        )}
                        {post.categoryName && post.readingTime && <span className="text-zinc-200 dark:text-zinc-800">·</span>}
                        {post.readingTime && <span className="text-xs text-zinc-400 dark:text-zinc-600">{post.readingTime} min</span>}
                      </div>
                      <h3 className="text-base font-medium text-zinc-900 dark:text-zinc-50 group-hover:opacity-60 transition-opacity leading-snug">
                        {highlight(post.title, query)}
                      </h3>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-1">
                        {highlight(post.excerpt, query)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Authors */}
          {(activeType === "all" || activeType === "authors") && results.authors.length > 0 && (
            <div className="space-y-5">
              {activeType === "all" && <p className="text-xs tracking-[0.2em] uppercase text-zinc-400 dark:text-zinc-500">Authors</p>}
              <div className="space-y-3">
                {results.authors.map((author) => (
                  <Link key={author.id} href={`/author/${author.username}`}
                    className="group flex items-center gap-4 p-4 border border-zinc-100 dark:border-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-zinc-200 dark:bg-zinc-800 shrink-0">
                      {author.avatarUrl && (
                        <Image src={author.avatarUrl} alt={author.name} width={48} height={48} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50 group-hover:opacity-60 transition-opacity">
                        {highlight(author.name, query)}
                      </p>
                      <p className="text-xs text-zinc-400 dark:text-zinc-600">
                        @{author.username} · {author.postCount} posts
                      </p>
                      {author.bio && (
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-1">
                          {highlight(author.bio, query)}
                        </p>
                      )}
                    </div>
                    <svg className="text-zinc-300 dark:text-zinc-700 group-hover:text-zinc-600 transition-colors shrink-0" width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Tags & Categories */}
          {(activeType === "all" || activeType === "tags") && (results.tags.length > 0 || results.categories.length > 0) && (
            <div className="space-y-5">
              {activeType === "all" && <p className="text-xs tracking-[0.2em] uppercase text-zinc-400 dark:text-zinc-500">Tags & Categories</p>}
              <div className="flex flex-wrap gap-2">
                {results.categories.map((cat) => (
                  <Link key={cat.id} href={`/categories/${cat.slug}`}
                    className="flex items-center gap-2 px-4 py-2 border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-700 dark:text-zinc-300 hover:border-zinc-900 dark:hover:border-zinc-50 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M1 3l1-1h3l1 1M1 3h10v7H1V3z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
                    </svg>
                    {highlight(cat.name, query)}
                    <span className="text-xs text-zinc-400 dark:text-zinc-600">category</span>
                  </Link>
                ))}
                {results.tags.map((tag) => (
                  <button key={tag.id} onClick={() => handleSearch(tag.name)}
                    className="flex items-center gap-1.5 px-4 py-2 border border-zinc-100 dark:border-zinc-900 text-sm text-zinc-500 dark:text-zinc-400 hover:border-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors">
                    # {highlight(tag.name, query)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* No results */}
      {showEmpty && (
        <div className="py-16 text-center space-y-4">
          <p className="font-display text-3xl font-light text-zinc-300 dark:text-zinc-700">No results found</p>
          <p className="text-sm text-zinc-400 dark:text-zinc-600">Try a different search term</p>
        </div>
      )}

    </div>
  );
}
