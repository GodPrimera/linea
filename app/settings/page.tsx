import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/queries/users";
import { getUserSettings } from "@/lib/actions/profile";
import { db } from "@/lib/db";
import { userSocialLinks, media } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import SettingsClient from "./_components/SettingsClient";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const [settings, socialRows, coverRows] = await Promise.all([
    getUserSettings(user.id),
    db.select().from(userSocialLinks).where(eq(userSocialLinks.userId, user.id)).limit(1),
    user.coverImageId
      ? db.select({ url: media.url }).from(media).where(eq(media.id, user.coverImageId)).limit(1)
      : Promise.resolve([]),
  ]);

  const socialLinks = socialRows[0] ?? null;
  const coverImageUrl = coverRows[0]?.url ?? null;

  return (
    <div className="bg-white dark:bg-zinc-950 min-h-screen">
      <div className="mx-auto max-w-4xl px-6 pt-16 pb-10 border-b border-zinc-100 dark:border-zinc-900">
        <p className="text-xs tracking-[0.2em] uppercase text-zinc-400 dark:text-zinc-500 mb-4">
          Account
        </p>
        <h1 className="font-display text-4xl font-light text-zinc-900 dark:text-zinc-50">
          Settings
        </h1>
      </div>

      <SettingsClient
        initialProfile={{
          name: user.name,
          username: user.username,
          bio: user.bio ?? "",
          website: user.website ?? "",
          location: user.location ?? "",
          avatarUrl: user.avatarUrl ?? null,
          coverImageId: user.coverImageId ?? null,
          coverImageUrl,
          twitter: socialLinks?.twitter ?? "",
          github: socialLinks?.github ?? "",
          linkedin: socialLinks?.linkedin ?? "",
          instagram: socialLinks?.instagram ?? "",
          youtube: socialLinks?.youtube ?? "",
        }}
        initialNotifPrefs={{
          emailOnComment: settings?.emailOnComment ?? true,
          emailOnLike: settings?.emailOnLike ?? true,
          emailOnFollow: settings?.emailOnFollow ?? true,
          emailOnReply: settings?.emailOnReply ?? true,
          emailOnNewsletter: settings?.emailOnNewsletter ?? true,
        }}
        initialTheme={(settings?.theme as "light" | "dark" | "system") ?? "system"}
      />
    </div>
  );
}

