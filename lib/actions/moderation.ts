"use server";

import { db } from "@/lib/db";
import { comments, posts } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/queries/users";
import { revalidatePath } from "next/cache";

// Verify the comment belongs to a post authored by the current user
async function assertCommentOwnership(commentId: string, currentUserId: string) {
  const rows = await db
    .select({ id: comments.id })
    .from(comments)
    .innerJoin(posts, eq(posts.id, comments.postId))
    .where(and(eq(comments.id, commentId), eq(posts.authorId, currentUserId)))
    .limit(1);

  if (rows.length === 0) throw new Error("Not authorised");
}

export async function approveCommentAction(commentId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  await assertCommentOwnership(commentId, user.id);

  await db
    .update(comments)
    .set({ approved: true, approvedBy: user.id, approvedAt: new Date() })
    .where(eq(comments.id, commentId));

  revalidatePath("/dashboard/comments");
}

export async function rejectCommentAction(commentId: string, reason?: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  await assertCommentOwnership(commentId, user.id);

  await db
    .update(comments)
    .set({
      approved: false,
      rejectionReason: reason ?? null,
    })
    .where(eq(comments.id, commentId));

  revalidatePath("/dashboard/comments");
}

export async function deleteCommentAction(commentId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  await assertCommentOwnership(commentId, user.id);

  await db
    .update(comments)
    .set({ deletedAt: new Date() })
    .where(eq(comments.id, commentId));

  revalidatePath("/dashboard/comments");
}
