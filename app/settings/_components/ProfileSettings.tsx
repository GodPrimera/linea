"use client";

import { useState, useTransition } from "react";
import { updateProfileAction, type ProfileFormData } from "@/lib/actions/profile";
import ImageUpload from "@/components/ImageUpload";

type ProfileInitial = ProfileFormData & {
  avatarUrl: string | null;
  coverImageUrl?: string | null;
  coverImageId?: string | null;
};

export default function ProfileSettings({ initialData }: { initialData: ProfileInitial }) {
  const [form, setForm] = useState<ProfileFormData>({
    name: initialData.name,
    username: initialData.username,
    bio: initialData.bio,
    website: initialData.website,
    location: initialData.location,
    twitter: initialData.twitter,
    github: initialData.github,
    linkedin: initialData.linkedin,
    instagram: initialData.instagram,
    youtube: initialData.youtube,
    avatarUrl: initialData.avatarUrl,
    coverImageId: initialData.coverImageId ?? null,
  });
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Separate state to track cover image URL for the preview
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(
    initialData.coverImageUrl ?? null
  );

  function set(key: keyof ProfileFormData, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        await updateProfileAction(form);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

  return (
    <form onSubmit={handleSave} className="space-y-8">
      <div>
        <h2 className="text-base font-medium text-zinc-900 dark:text-zinc-50 mb-1">Profile</h2>
        <p className="text-sm text-zinc-400 dark:text-zinc-600">
          This information will appear on your public author page.
        </p>
      </div>

      {/* Avatar */}
      <div className="space-y-3">
        <label className="text-xs tracking-widest uppercase text-zinc-400 dark:text-zinc-600">
          Avatar
        </label>
        <ImageUpload
          currentUrl={form.avatarUrl ?? null}
          folder="avatars"
          variant="avatar"
          hint="JPG, PNG or WebP up to 5MB"
          onUpload={({ url }) => {
            setForm((prev) => ({ ...prev, avatarUrl: url }));
          }}
          onRemove={() => {
            setForm((prev) => ({ ...prev, avatarUrl: null }));
          }}
        />
      </div>

      {/* Cover image */}
      <div className="space-y-3">
        <ImageUpload
          currentUrl={coverImageUrl}
          folder="covers"
          variant="wide"
          label="Cover image"
          hint="Shown at the top of your author profile page"
          onUpload={({ id, url }) => {
            setCoverImageUrl(url);
            setForm((prev) => ({ ...prev, coverImageId: id }));
          }}
          onRemove={() => {
            setCoverImageUrl(null);
            setForm((prev) => ({ ...prev, coverImageId: null }));
          }}
        />
      </div>

      {/* Basic info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {[
          { key: "name" as const, label: "Full name", placeholder: "Your name" },
          { key: "username" as const, label: "Username", placeholder: "yourname", prefix: "@" },
          { key: "website" as const, label: "Website", placeholder: "https://yoursite.com" },
          { key: "location" as const, label: "Location", placeholder: "City, Country" },
        ].map(({ key, label, placeholder, prefix }) => (
          <div key={key} className="space-y-1.5">
            <label className="text-xs tracking-widest uppercase text-zinc-400 dark:text-zinc-600">
              {label}
            </label>
            <div className="relative">
              {prefix && (
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">
                  {prefix}
                </span>
              )}
              <input
                type="text"
                value={form[key] as string}
                onChange={(e) => set(key, e.target.value)}
                placeholder={placeholder}
                className={`w-full border border-zinc-200 dark:border-zinc-800 bg-transparent py-2.5 text-sm text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-50 transition-colors ${prefix ? "pl-7 pr-3" : "px-3"}`}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Bio */}
      <div className="space-y-1.5">
        <label className="text-xs tracking-widest uppercase text-zinc-400 dark:text-zinc-600">Bio</label>
        <textarea
          value={form.bio as string}
          onChange={(e) => set("bio", e.target.value)}
          rows={3}
          maxLength={200}
          placeholder="A short bio about yourself..."
          className="w-full border border-zinc-200 dark:border-zinc-800 bg-transparent px-3 py-2.5 text-sm text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-50 transition-colors resize-none"
        />
        <p className="text-xs text-zinc-400 dark:text-zinc-600 text-right">
          {(form.bio as string).length}/200
        </p>
      </div>

      {/* Social links */}
      <div className="space-y-3">
        <label className="text-xs tracking-widest uppercase text-zinc-400 dark:text-zinc-600">
          Social links
        </label>
        <div className="space-y-3">
          {(["twitter", "github", "linkedin", "instagram", "youtube"] as const).map((key) => (
            <div key={key} className="flex items-center gap-3">
              <span className="text-xs text-zinc-400 dark:text-zinc-600 w-16 shrink-0 capitalize">
                {key}
              </span>
              <input
                type="url"
                value={form[key] as string}
                onChange={(e) => set(key, e.target.value)}
                placeholder={`https://${key}.com/username`}
                className="flex-1 border-b border-zinc-200 dark:border-zinc-800 bg-transparent pb-1.5 text-sm text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-300 dark:placeholder:text-zinc-700 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-50 transition-colors"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Save */}
      <div className="flex items-center gap-4 pt-2 border-t border-zinc-100 dark:border-zinc-900">
        <button
          type="submit"
          disabled={isPending}
          className="px-6 py-2.5 text-sm bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-200 disabled:opacity-50 transition-colors"
        >
          {isPending ? "Saving..." : "Save changes"}
        </button>
        {saved && (
          <span className="text-sm text-emerald-500 animate-in fade-in duration-200">
            Changes saved ✓
          </span>
        )}
        {error && <span className="text-sm text-red-500">{error}</span>}
      </div>
    </form>
  );
}
