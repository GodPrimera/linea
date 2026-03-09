"use client";

import { useState } from "react";
import ProfileSettings from "./ProfileSettings";
import AccountSettings from "./AccountSettings";
import NotificationSettings from "./NotificationSettings";
import AppearanceSettings from "./AppearanceSettings";
import type { ProfileFormData } from "@/lib/actions/profile";
import type { NotificationPrefs } from "@/lib/actions/profile";

const tabs = [
  { id: "profile", label: "Profile" },
  { id: "account", label: "Account" },
  { id: "notifications", label: "Notifications" },
  { id: "appearance", label: "Appearance" },
];

type ProfileInitial = ProfileFormData & { avatarUrl: string | null };

export default function SettingsClient({
  initialProfile,
  initialNotifPrefs,
}: {
  initialProfile: ProfileInitial;
  initialNotifPrefs: NotificationPrefs;
}) {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="flex flex-col md:flex-row gap-10">

        <nav className="md:w-44 shrink-0">
          <ul className="flex md:flex-col gap-1">
            {tabs.map((tab) => (
              <li key={tab.id}>
                <button
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left px-3 py-2 text-sm transition-colors duration-150 ${
                    activeTab === tab.id
                      ? "text-zinc-900 dark:text-zinc-50 bg-zinc-100 dark:bg-zinc-900"
                      : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50"
                  }`}
                >
                  {tab.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex-1 min-w-0">
          {activeTab === "profile" && <ProfileSettings initialData={initialProfile} />}
          {activeTab === "account" && <AccountSettings />}
          {activeTab === "notifications" && <NotificationSettings initialPrefs={initialNotifPrefs} />}
          {activeTab === "appearance" && <AppearanceSettings />}
        </div>

      </div>
    </div>
  );
}
