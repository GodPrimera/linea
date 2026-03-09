"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  createPostAction,
  updatePostAction,
  type PostFormData,
} from "@/lib/actions/posts";
import ImageUpload from "@/components/ImageUpload";

type Category = { id: string; name: string };
type Tag = { id: string; name: string };

type PostEditorProps = {
  // undefined = new post mode; string = edit mode
  postId?: string;
  initialData?: {
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    categoryName: string;
    tagsCsv: string;
    status: "draft" | "published" | "scheduled";
    isFeatured: boolean;
    coverImageId?: string | null;
    coverImageUrl?: string | null;
  };
  categories: Category[];
  allTags: Tag[];
};

type PostStatus = "draft" | "published";

function calcReadingTime(content: string) {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

function renderPreview(md: string) {
  return md
    .split("\n")
    .map((line) => {
      if (line.startsWith("## "))
        return `<h2 class="font-display text-3xl font-light text-zinc-900 dark:text-zinc-50 mt-10 mb-4">${line.slice(3)}</h2>`;
      if (line.startsWith("### "))
        return `<h3 class="font-display text-2xl font-light text-zinc-900 dark:text-zinc-50 mt-8 mb-3">${line.slice(4)}</h3>`;
      if (line.trim() === "") return "<br/>";
      return `<p class="text-zinc-600 dark:text-zinc-400 leading-[1.85] text-lg mb-5">${line
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.+?)\*/g, "<em>$1</em>")}</p>`;
    })
    .join("");
}

export default function PostEditor({
  postId,
  initialData,
  categories,
}: PostEditorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [slugManual, setSlugManual] = useState(!!initialData?.slug);
  const [excerpt, setExcerpt] = useState(initialData?.excerpt ?? "");
  const [content, setContent] = useState(initialData?.content ?? "");
  const [categoryName, setCategoryName] = useState(initialData?.categoryName ?? "");
  const [tagsCsv, setTagsCsv] = useState(initialData?.tagsCsv ?? "");
  const [status, setStatus] = useState<PostStatus>(
    (initialData?.status as PostStatus) ?? "draft"
  );
  const [featured, setFeatured] = useState(initialData?.isFeatured ?? false);
  const [coverImageId, setCoverImageId] = useState<string | null>(initialData?.coverImageId ?? null);
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(initialData?.coverImageUrl ?? null);
  const [preview, setPreview] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = !!postId;

  function handleTitleChange(val: string) {
    setTitle(val);
    if (!slugManual) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-")
          .replace(/^-|-$/g, "")
      );
    }
  }

  function handleSlugChange(val: string) {
    setSlugManual(true);
    setSlug(val);
  }

  function buildFormData(publishStatus: PostStatus): PostFormData {
    return {
      title: title.trim(),
      slug: slug.trim(),
      excerpt: excerpt.trim(),
      content,
      categoryName,
      tagNames: tagsCsv
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      status: publishStatus,
      isFeatured: featured,
      coverImageId,
    };
  }

  function handleSave(publishStatus: PostStatus) {
    if (!title.trim()) return;
    setError(null);

    startTransition(async () => {
      try {
        const data = buildFormData(publishStatus);
        const result = isEdit
          ? await updatePostAction(postId!, data)
          : await createPostAction(data);

        setSaved(true);
        setTimeout(() => setSaved(false), 3000);

        if (!isEdit) {
          router.push(`/dashboard/posts`);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong");
      }
    });
  }

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/posts"
            className="text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 2L4 8l6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
          <h1 className="font-display text-2xl font-light text-zinc-900 dark:text-zinc-50">
            {isEdit ? "Edit post" : "New post"}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {error && (
            <span className="text-xs text-red-500 max-w-48 truncate">{error}</span>
          )}
          {saved && (
            <span className="text-xs text-emerald-500 animate-in fade-in duration-200">
              {isEdit ? "Saved ✓" : "Created ✓"}
            </span>
          )}
          <button
            onClick={() => setPreview(!preview)}
            className={`px-4 py-2 text-sm border transition-colors ${
              preview
                ? "border-zinc-900 dark:border-zinc-50 text-zinc-900 dark:text-zinc-50"
                : "border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:border-zinc-400"
            }`}
          >
            {preview ? "Edit" : "Preview"}
          </button>
          <button
            onClick={() => handleSave("draft")}
            disabled={isPending || !title.trim()}
            className="px-4 py-2 text-sm border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400 disabled:opacity-40 transition-colors"
          >
            Save draft
          </button>
          <button
            onClick={() => handleSave("published")}
            disabled={isPending || !title.trim() || !content.trim()}
            className="px-4 py-2 text-sm bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-200 disabled:opacity-40 transition-colors"
          >
            {isPending ? "Saving..." : isEdit ? "Update" : "Publish"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

        {/* Editor */}
        <div className="lg:col-span-2 space-y-4">

          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Post title..."
            className="w-full font-display text-3xl font-light bg-transparent text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-300 dark:placeholder:text-zinc-700 border-none focus:outline-none"
          />

          <div className="flex items-center gap-2 text-xs text-zinc-400 dark:text-zinc-600 pb-2 border-b border-zinc-100 dark:border-zinc-900">
            <span>/blog/</span>
            <input
              type="text"
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              className="flex-1 bg-transparent text-zinc-600 dark:text-zinc-400 focus:outline-none focus:text-zinc-900 dark:focus:text-zinc-50 transition-colors"
              placeholder="post-slug"
            />
          </div>

          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Write a short excerpt (shown in listings and SEO)..."
            rows={2}
            className="w-full bg-transparent text-sm text-zinc-500 dark:text-zinc-400 placeholder:text-zinc-300 dark:placeholder:text-zinc-700 border-none focus:outline-none resize-none leading-relaxed"
          />

          {!preview && (
            <div className="flex items-center gap-1 py-2 border-y border-zinc-100 dark:border-zinc-900">
              {[
                { label: "B", insert: "**bold**" },
                { label: "I", insert: "*italic*" },
                { label: "H2", insert: "\n## Heading\n" },
                { label: "H3", insert: "\n### Heading\n" },
                { label: "—", insert: "\n---\n" },
              ].map((btn) => (
                <button
                  key={btn.label}
                  onClick={() => setContent((c) => c + btn.insert)}
                  className="px-2.5 py-1 text-xs font-medium text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  {btn.label}
                </button>
              ))}
              <span className="ml-auto text-xs text-zinc-300 dark:text-zinc-700">
                Markdown supported
              </span>
            </div>
          )}

          {preview ? (
            <div
              className="min-h-96 py-4"
              dangerouslySetInnerHTML={{ __html: renderPreview(content) }}
            />
          ) : (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`Start writing...\n\n## Heading\n**bold** *italic*`}
              className="w-full min-h-96 bg-transparent text-base text-zinc-700 dark:text-zinc-300 placeholder:text-zinc-300 dark:placeholder:text-zinc-700 border-none focus:outline-none resize-none leading-[1.85] font-mono text-sm"
            />
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">

          {/* Status */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-5 space-y-4">
            <p className="text-xs tracking-widest uppercase text-zinc-400 dark:text-zinc-600">
              Status
            </p>
            <div className="space-y-2">
              {(["draft", "published"] as PostStatus[]).map((s) => (
                <label key={s} className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value={s}
                    checked={status === s}
                    onChange={() => setStatus(s)}
                    className="accent-zinc-900 dark:accent-zinc-50"
                  />
                  <span className="text-sm text-zinc-600 dark:text-zinc-400 capitalize">{s}</span>
                </label>
              ))}
            </div>
            <label className="flex items-center gap-2.5 cursor-pointer pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="accent-zinc-900 dark:accent-zinc-50"
              />
              <span className="text-sm text-zinc-600 dark:text-zinc-400">Featured post</span>
            </label>
          </div>

          {/* Category */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-5 space-y-3">
            <p className="text-xs tracking-widests uppercase text-zinc-400 dark:text-zinc-600">
              Category
            </p>
            {categories.length === 0 ? (
              <p className="text-xs text-zinc-400 dark:text-zinc-600">
                No categories yet.{" "}
                <a href="/dashboard/categories" className="underline">Create one</a>
              </p>
            ) : (
              <div className="space-y-2">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="radio"
                    name="category"
                    value=""
                    checked={categoryName === ""}
                    onChange={() => setCategoryName("")}
                    className="accent-zinc-900 dark:accent-zinc-50"
                  />
                  <span className="text-sm text-zinc-400 dark:text-zinc-600 italic">None</span>
                </label>
                {categories.map((cat) => (
                  <label key={cat.id} className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="radio"
                      name="category"
                      value={cat.name}
                      checked={categoryName === cat.name}
                      onChange={() => setCategoryName(cat.name)}
                      className="accent-zinc-900 dark:accent-zinc-50"
                    />
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">{cat.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-5 space-y-3">
            <p className="text-xs tracking-widest uppercase text-zinc-400 dark:text-zinc-600">
              Tags
            </p>
            <input
              type="text"
              value={tagsCsv}
              onChange={(e) => setTagsCsv(e.target.value)}
              placeholder="writing, craft, process"
              className="w-full bg-transparent text-sm text-zinc-600 dark:text-zinc-400 placeholder:text-zinc-300 dark:placeholder:text-zinc-700 focus:outline-none border-b border-zinc-100 dark:border-zinc-800 pb-1 focus:border-zinc-400 transition-colors"
            />
            <p className="text-xs text-zinc-400 dark:text-zinc-600">Comma separated</p>
          </div>

          {/* Cover image */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-5">
            <ImageUpload
              currentUrl={coverImageUrl}
              folder="posts"
              variant="wide"
              label="Cover image"
              onUpload={({ id, url }) => {
                setCoverImageId(id);
                setCoverImageUrl(url);
              }}
              onRemove={() => {
                setCoverImageId(null);
                setCoverImageUrl(null);
              }}
            />
          </div>

          {/* Word count */}
          <div className="text-xs text-zinc-400 dark:text-zinc-600 flex items-center justify-between px-1">
            <span>{wordCount} words</span>
            <span>~{calcReadingTime(content)} min read</span>
          </div>

        </div>
      </div>
    </div>
  );
}
