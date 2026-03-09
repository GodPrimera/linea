"use server";

import { db } from "@/lib/db";
import { users, userSocialLinks, userSettings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/queries/users";
import { revalidatePath } from "next/cache";

// ─── Profile ──────────────────────────────────────────────────────────────────

export type ProfileFormData = {
  name: string;
  username: string;
  bio: string;
  website: string;
  location: string;
  twitter: string;
  github: string;
  linkedin: string;
  instagram: string;
  youtube: string;
  avatarUrl?: string | null;
  coverImageId?: string | null;
};

export async function updateProfileAction(data: ProfileFormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");

  // Update core user fields
  await db
    .update(users)
    .set({
      name: data.name.trim(),
      username: data.username.trim().toLowerCase(),
      bio: data.bio.trim() || null,
      website: data.website.trim() || null,
      location: data.location.trim() || null,
      ...(data.avatarUrl !== undefined && { avatarUrl: data.avatarUrl }),
      ...(data.coverImageId !== undefined && { coverImageId: data.coverImageId }),
      updatedAt: new Date(),
    })
    .where(eq(users.id, user.id));

  // Upsert social links
  const existing = await db
    .select({ userId: userSocialLinks.userId })
    .from(userSocialLinks)
    .where(eq(userSocialLinks.userId, user.id))
    .limit(1);

  const socialData = {
    twitter: data.twitter.trim() || null,
    github: data.github.trim() || null,
    linkedin: data.linkedin.trim() || null,
    instagram: data.instagram.trim() || null,
    youtube: data.youtube.trim() || null,
  };

  if (existing.length > 0) {
    await db
      .update(userSocialLinks)
      .set(socialData)
      .where(eq(userSocialLinks.userId, user.id));
  } else {
    await db.insert(userSocialLinks).values({ userId: user.id, ...socialData });
  }

  revalidatePath(`/author/${data.username.trim().toLowerCase()}`);
  revalidatePath("/settings");
}

// ─── Notification Preferences ─────────────────────────────────────────────────

export type NotificationPrefs = {
  emailOnComment: boolean;
  emailOnLike: boolean;
  emailOnFollow: boolean;
  emailOnReply: boolean;
  emailOnNewsletter: boolean;
};

export async function updateNotificationPrefsAction(prefs: NotificationPrefs) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");

  const existing = await db
    .select({ userId: userSettings.userId })
    .from(userSettings)
    .where(eq(userSettings.userId, user.id))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(userSettings)
      .set(prefs)
      .where(eq(userSettings.userId, user.id));
  } else {
    await db.insert(userSettings).values({ userId: user.id, ...prefs });
  }

  revalidatePath("/settings");
}

// ─── Get user settings ────────────────────────────────────────────────────────

export async function getUserSettings(userId: string) {
  const rows = await db
    .select()
    .from(userSettings)
    .where(eq(userSettings.userId, userId))
    .limit(1);
  return rows[0] ?? null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Theme
// ─────────────────────────────────────────────────────────────────────────────

export async function updateThemeAction(theme: "light" | "dark" | "system") {
  const user = await getCurrentUser();
  if (!user) return;

  const existing = await db
    .select({ userId: userSettings.userId })
    .from(userSettings)
    .where(eq(userSettings.userId, user.id))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(userSettings)
      .set({ theme })
      .where(eq(userSettings.userId, user.id));
  } else {
    await db.insert(userSettings).values({ userId: user.id, theme });
  }
}
