import { db } from "@/lib/db";
import { notifications, users } from "@/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";

export async function getUserNotifications(userId: string) {
  return db
    .select({
      id: notifications.id,
      type: notifications.type,
      title: notifications.title,
      body: notifications.body,
      isRead: notifications.isRead,
      createdAt: notifications.createdAt,
      postId: notifications.postId,
      commentId: notifications.commentId,
      actorId: users.id,
      actorName: users.name,
      actorUsername: users.username,
      actorAvatarUrl: users.avatarUrl,
    })
    .from(notifications)
    .leftJoin(users, eq(users.id, notifications.triggeredBy))
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt));
}

export async function markNotificationRead(notificationId: string, userId: string) {
  return db
    .update(notifications)
    .set({ isRead: true, readAt: new Date() })
    .where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)));
}

export async function markAllNotificationsRead(userId: string) {
  return db
    .update(notifications)
    .set({ isRead: true, readAt: new Date() })
    .where(eq(notifications.userId, userId));
}

export async function deleteNotification(notificationId: string, userId: string) {
  return db
    .delete(notifications)
    .where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)));
}