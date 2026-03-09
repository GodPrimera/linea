"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";

type UploadResult = { id: string; url: string };

type ImageUploadProps = {
  // Current image URL to show as preview (from DB)
  currentUrl?: string | null;
  // Called when upload succeeds
  onUpload: (result: UploadResult) => void;
  // Called when user removes the image
  onRemove?: () => void;
  // Cloudinary folder: "avatars" | "covers" | "posts"
  folder?: string;
  // UI variant
  variant?: "square" | "wide" | "avatar";
  label?: string;
  hint?: string;
};

export default function ImageUpload({
  currentUrl,
  onUpload,
  onRemove,
  folder = "general",
  variant = "wide",
  label,
  hint,
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = useCallback(
    async (file: File) => {
      setError(null);
      setUploading(true);

      // Show local preview immediately
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      try {
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Upload failed");
        onUpload(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Upload failed");
        setPreview(currentUrl ?? null);
      } finally {
        setUploading(false);
      }
    },
    [folder, onUpload, currentUrl]
  );

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    upload(files[0]);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  }

  function handleRemove() {
    setPreview(null);
    onRemove?.();
    if (inputRef.current) inputRef.current.value = "";
  }

  // ── Avatar variant ─────────────────────────────────────────────────────────
  if (variant === "avatar") {
    return (
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full overflow-hidden bg-zinc-200 dark:bg-zinc-800 shrink-0 relative">
          {preview ? (
            <Image src={preview} alt="Avatar" fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-400">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
          )}
          {uploading && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
        <div className="space-y-1">
          <label className="cursor-pointer px-4 py-2 text-sm border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400 transition-colors block w-fit">
            {uploading ? "Uploading..." : "Change avatar"}
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
              disabled={uploading}
            />
          </label>
          {error && <p className="text-xs text-red-500">{error}</p>}
          {!error && <p className="text-xs text-zinc-400 dark:text-zinc-600">{hint ?? "JPG, PNG or WebP up to 5MB"}</p>}
        </div>
      </div>
    );
  }

  // ── Wide / square variant ──────────────────────────────────────────────────
  const aspectClass = variant === "square" ? "aspect-square" : "aspect-[16/6]";

  return (
    <div className="space-y-2">
      {label && (
        <p className="text-xs tracking-widest uppercase text-zinc-400 dark:text-zinc-600">{label}</p>
      )}

      {preview ? (
        <div className="relative group">
          <div className={`${aspectClass} overflow-hidden bg-zinc-100 dark:bg-zinc-900 relative`}>
            <Image src={preview} alt="Cover" fill className="object-cover" />
            {uploading && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
          {!uploading && (
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <label className="cursor-pointer px-2.5 py-1 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 transition-colors">
                Change
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => handleFiles(e.target.files)}
                />
              </label>
              <button
                type="button"
                onClick={handleRemove}
                className="px-2.5 py-1 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-red-500 hover:border-red-400 transition-colors"
              >
                Remove
              </button>
            </div>
          )}
        </div>
      ) : (
        <div
          onClick={() => !uploading && inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`${aspectClass} border-2 border-dashed transition-colors cursor-pointer flex flex-col items-center justify-center gap-2 ${
            dragging
              ? "border-zinc-600 dark:border-zinc-400 bg-zinc-50 dark:bg-zinc-900"
              : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600"
          }`}
        >
          {uploading ? (
            <div className="w-8 h-8 border-2 border-zinc-300 dark:border-zinc-700 border-t-zinc-600 dark:border-t-zinc-300 rounded-full animate-spin" />
          ) : (
            <>
              <svg className="text-zinc-300 dark:text-zinc-700" width="28" height="28" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="18" height="18" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                <circle cx="8.5" cy="8.5" r="2" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M3 16l5-4 4 3 3-4 6 5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
              </svg>
              <p className="text-sm text-zinc-400 dark:text-zinc-600">
                Click to upload or drag & drop
              </p>
              <p className="text-xs text-zinc-300 dark:text-zinc-700">
                {hint ?? "JPG, PNG or WebP up to 5MB"}
              </p>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
            disabled={uploading}
          />
        </div>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
