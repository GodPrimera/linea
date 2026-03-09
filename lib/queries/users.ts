import { db } from "@/lib/db";
import { users, userSocialLinks, follows } from "@/lib/db/schema";
import { eq, sql, and, isNull } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export async function getCurrentUser() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return null;

  const rows = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, clerkId))
    .limit(1);

  return rows[0] ?? null;
}

export async function getUserByUsername(username: string) {
  const rows = await db
    .select()
    .from(users)
    .where(and(eq(users.username, username), isNull(users.deletedAt)))
    .limit(1);

  const user = rows[0];
  if (!user) return null;

  const socialRows = await db
    .select()
    .from(userSocialLinks)
    .where(eq(userSocialLinks.userId, user.id))
    .limit(1);

  const [followerCountRow] = await db
    .select({ count: sql<number>`cast(count(*) as int)` })
    .from(follows)
    .where(eq(follows.followingId, user.id));

  const [followingCountRow] = await db
    .select({ count: sql<number>`cast(count(*) as int)` })
    .from(follows)
    .where(eq(follows.followerId, user.id));

  return {
    ...user,
    socialLinks: socialRows[0] ?? null,
    followerCount: followerCountRow?.count ?? 0,
    followingCount: followingCountRow?.count ?? 0,
  };
}

export async function isFollowing(
  followerId: string,
  followingId: string
): Promise<boolean> {
  const rows = await db
    .select({ followerId: follows.followerId })
    .from(follows)
    .where(and(eq(follows.followerId, followerId), eq(follows.followingId, followingId)))
    .limit(1);

  return rows.length > 0;
}
