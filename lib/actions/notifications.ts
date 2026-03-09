"use server";

import { db } from "@/lib/db";
import { notifications } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/queries/users";
import { revalidatePath } from "next/cache";

export async function markNotificationReadAction(notificationId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");

  await db
    .update(notifications)
    .set({ isRead: true, readAt: new Date() })
    .where(and(eq(notifications.id, notificationId), eq(notifications.userId, user.id)));

  revalidatePath("/notifications");
}

export async function markAllNotificationsReadAction() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");

  await db
    .update(notifications)
    .set({ isRead: true, readAt: new Date() })
    .where(eq(notifications.userId, user.id));

  revalidatePath("/notifications");
}

export async function deleteNotificationAction(notificationId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");

  await db
    .delete(notifications)
    .where(and(eq(notifications.id, notificationId), eq(notifications.userId, user.id)));

  revalidatePath("/notifications");
}
