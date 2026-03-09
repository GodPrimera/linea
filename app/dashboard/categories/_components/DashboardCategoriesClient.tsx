"use client";

import { useState, useTransition } from "react";
import {
  createCategoryAction,
  deleteCategoryAction,
  createTagAction,
  deleteTagAction,
} from "@/lib/actions/taxonomy";

type Category = { id: string; name: string; slug: string; description: string | null; postCount: number };
type Tag = { id: string; name: string; slug: string };

export default function DashboardCategoriesClient({
  initialCategories,
  initialTags,
}: {
  initialCategories: Category[];
  initialTags: Tag[];
}) {
  const [isPending, startTransition] = useTransition();
  const [categories, setCategories] = useState(initialCategories);
  const [tags, setTags] = useState(initialTags);
  const [newCatName, setNewCatName] = useState("");
  const [newCatDesc, setNewCatDesc] = useState("");
  const [newTagName, setNewTagName] = useState("");
  const [catError, setCatError] = useState<string | null>(null);
  const [tagError, setTagError] = useState<string | null>(null);

  function toSlug(name: string) {
    return name.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  }

  function handleAddCategory() {
    if (!newCatName.trim()) return;
    const optimistic: Category = {
      id: `temp-${Date.now()}`,
      name: newCatName.trim(),
      slug: toSlug(newCatName),
      description: newCatDesc.trim() || null,
      postCount: 0,
    };
    setCategories((prev) => [...prev, optimistic]);
    setNewCatName("");
    setNewCatDesc("");
    setCatError(null);
    startTransition(async () => {
      try {
        await createCategoryAction(optimistic.name, optimistic.description ?? "");
      } catch (e) {
        setCategories((prev) => prev.filter((c) => c.id !== optimistic.id));
        setCatError(e instanceof Error ? e.message : "Failed to create category");
      }
    });
  }

  function handleDeleteCategory(id: string) {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    startTransition(async () => {
      try {
        await deleteCategoryAction(id);
      } catch {
        setCategories(initialCategories);
      }
    });
  }

  function handleAddTag() {
    if (!newTagName.trim()) return;
    const optimistic: Tag = {
      id: `temp-${Date.now()}`,
      name: newTagName.trim(),
      slug: toSlug(newTagName),
    };
    setTags((prev) => [...prev, optimistic]);
    setNewTagName("");
    setTagError(null);
    startTransition(async () => {
      try {
        await createTagAction(optimistic.name);
      } catch (e) {
        setTags((prev) => prev.filter((t) => t.id !== optimistic.id));
        setTagError(e instanceof Error ? e.message : "Failed to create tag");
      }
    });
  }

  function handleDeleteTag(id: string) {
    setTags((prev) => prev.filter((t) => t.id !== id));
    startTransition(async () => {
      try {
        await deleteTagAction(id);
      } catch {
        setTags(initialTags);
      }
    });
  }

  return (
    <div className="space-y-10">

      <div>
        <h1 className="font-display text-3xl font-light text-zinc-900 dark:text-zinc-50">
          Categories & Tags
        </h1>
        <p className="text-sm text-zinc-400 dark:text-zinc-600 mt-1">
          Organise your posts with categories and tags.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

        {/* Categories */}
        <div className="space-y-5">
          <p className="text-xs tracking-[0.2em] uppercase text-zinc-400 dark:text-zinc-500">
            Categories
          </p>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-5 space-y-3">
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">Add category</p>
            <input
              type="text"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="Category name"
              className="w-full border border-zinc-200 dark:border-zinc-800 bg-transparent px-3 py-2 text-sm text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-50 transition-colors"
            />
            <input
              type="text"
              value={newCatDesc}
              onChange={(e) => setNewCatDesc(e.target.value)}
              placeholder="Description (optional)"
              className="w-full border border-zinc-200 dark:border-zinc-800 bg-transparent px-3 py-2 text-sm text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-50 transition-colors"
            />
            {catError && <p className="text-xs text-red-500">{catError}</p>}
            <button
              onClick={handleAddCategory}
              disabled={!newCatName.trim() || isPending}
              className="px-4 py-2 text-sm bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-200 disabled:opacity-40 transition-colors"
            >
              Add category
            </button>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 divide-y divide-zinc-50 dark:divide-zinc-800">
            {categories.length === 0 && (
              <p className="px-5 py-4 text-sm text-zinc-400 dark:text-zinc-600">No categories yet</p>
            )}
            {categories.map((cat) => (
              <div key={cat.id} className="flex items-start justify-between gap-4 px-5 py-4 group">
                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{cat.name}</p>
                    <span className="text-xs text-zinc-400 dark:text-zinc-600 font-mono">{cat.postCount} posts</span>
                  </div>
                  {cat.description && (
                    <p className="text-xs text-zinc-400 dark:text-zinc-600 leading-relaxed">{cat.description}</p>
                  )}
                  <p className="text-xs text-zinc-300 dark:text-zinc-700">/categories/{cat.slug}</p>
                </div>
                <button
                  onClick={() => handleDeleteCategory(cat.id)}
                  disabled={isPending}
                  className="text-xs px-2.5 py-1 border border-red-200 dark:border-red-900 text-red-400 hover:bg-red-50 dark:hover:bg-red-950 transition-colors opacity-0 group-hover:opacity-100 shrink-0 disabled:opacity-30"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-5">
          <p className="text-xs tracking-[0.2em] uppercase text-zinc-400 dark:text-zinc-500">
            Tags
          </p>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-5 space-y-3">
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">Add tag</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
                placeholder="Tag name"
                className="flex-1 border border-zinc-200 dark:border-zinc-800 bg-transparent px-3 py-2 text-sm text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-50 transition-colors"
              />
              <button
                onClick={handleAddTag}
                disabled={!newTagName.trim() || isPending}
                className="px-4 py-2 text-sm bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-200 disabled:opacity-40 transition-colors"
              >
                Add
              </button>
            </div>
            {tagError && <p className="text-xs text-red-500">{tagError}</p>}
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-5">
            {tags.length === 0 ? (
              <p className="text-sm text-zinc-400 dark:text-zinc-600">No tags yet</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <div
                    key={tag.id}
                    className="group flex items-center gap-1.5 px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 transition-colors"
                  >
                    <span className="text-sm text-zinc-700 dark:text-zinc-300">{tag.name}</span>
                    <button
                      onClick={() => handleDeleteTag(tag.id)}
                      disabled={isPending}
                      className="ml-1 text-zinc-300 dark:text-zinc-700 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-30"
                      aria-label={`Delete ${tag.name}`}
                    >
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
