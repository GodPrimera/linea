"use client";

import { useState } from "react";
import { updateNotificationPrefsAction, type NotificationPrefs } from "@/lib/actions/profile";

const notificationGroups = [
  {
    group: "Activity",
    items: [
      { key: "emailOnComment" as const, label: "New comments", description: "When someone comments on your posts" },
      { key: "emailOnReply" as const, label: "Comment replies", description: "When someone replies to your comment" },
      { key: "emailOnLike" as const, label: "Likes", description: "When someone likes your post" },
      { key: "emailOnFollow" as const, label: "New followers", description: "When someone follows you" },
    ],
  },
  {
    group: "Email",
    items: [
      { key: "emailOnNewsletter" as const, label: "Newsletter digest", description: "Receive your newsletter as a subscriber" },
    ],
  },
];

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (val: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className={`relative w-10 h-5 transition-colors duration-200 shrink-0 ${
        enabled ? "bg-zinc-900 dark:bg-zinc-50" : "bg-zinc-200 dark:bg-zinc-700"
      }`}
      role="switch"
      aria-checked={enabled}
    >
      <span
        className={`absolute top-0.5 w-4 h-4 bg-white dark:bg-zinc-900 transition-transform duration-200 ${
          enabled ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

export default function NotificationSettings({
  initialPrefs,
}: {
  initialPrefs: NotificationPrefs;
}) {
  const [prefs, setPrefs] = useState<NotificationPrefs>(initialPrefs);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggle(key: keyof NotificationPrefs) {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      await updateNotificationPrefsAction(prefs);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-base font-medium text-zinc-900 dark:text-zinc-50 mb-1">
          Notifications
        </h2>
        <p className="text-sm text-zinc-400 dark:text-zinc-600">
          Choose what you want to be notified about via email.
        </p>
      </div>

      {notificationGroups.map((group) => (
        <div key={group.group} className="space-y-4 pb-8 border-b border-zinc-100 dark:border-zinc-900 last:border-0 last:pb-0">
          <p className="text-xs tracking-widest uppercase text-zinc-400 dark:text-zinc-600">
            {group.group}
          </p>
          <div className="space-y-4">
            {group.items.map((item) => (
              <div key={item.key} className="flex items-start justify-between gap-6">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                    {item.label}
                  </p>
                  <p className="text-xs text-zinc-400 dark:text-zinc-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>
                <Toggle enabled={prefs[item.key]} onChange={() => toggle(item.key)} />
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="flex items-center gap-4 pt-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 text-sm bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-200 disabled:opacity-50 transition-colors"
        >
          {saving ? "Saving..." : "Save preferences"}
        </button>
        {saved && (
          <span className="text-sm text-emerald-500 animate-in fade-in duration-200">
            Saved ✓
          </span>
        )}
        {error && <span className="text-sm text-red-500">{error}</span>}
      </div>
    </div>
  );
}
