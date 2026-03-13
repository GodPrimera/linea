"use server";

import { db } from "@/lib/db";
import { authorApplications, users } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getCurrentUser } from "@/lib/queries/users";
import { revalidatePath } from "next/cache";

// ── Submit application (reader only) ─────────────────────────────────────────

export async function submitApplicationAction(data: {
  reason: string;
  writingSamples?: string;
}) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  if (user.role !== "reader") throw new Error("Only readers can apply to become authors");

  if (!data.reason.trim() || data.reason.trim().length < 50) {
    throw new Error("Please write at least 50 characters explaining why you want to be an author");
  }

  // Check if they already have a pending application
  const existing = await db
    .select({ id: authorApplications.id, status: authorApplications.status })
    .from(authorApplications)
    .where(
      and(
        eq(authorApplications.userId, user.id),
        eq(authorApplications.status, "pending")
      )
    )
    .limit(1);

  if (existing.length > 0) {
    throw new Error("You already have a pending application. Please wait for it to be reviewed.");
  }

  await db.insert(authorApplications).values({
    userId: user.id,
    reason: data.reason.trim(),
    writingSamples: data.writingSamples?.trim() || null,
    status: "pending",
  });

  revalidatePath("/apply");
}

// ── Approve application (admin only) ─────────────────────────────────────────

export async function approveApplicationAction(applicationId: string) {
  const admin = await getCurrentUser();
  if (!admin || admin.role !== "admin") throw new Error("Not authorized");

  const rows = await db
    .select()
    .from(authorApplications)
    .where(eq(authorApplications.id, applicationId))
    .limit(1);

  const application = rows[0];
  if (!application) throw new Error("Application not found");

  // Promote user to author
  await db
    .update(users)
    .set({ role: "author", updatedAt: new Date() })
    .where(eq(users.id, application.userId));

  // Mark application as approved
  await db
    .update(authorApplications)
    .set({
      status: "approved",
      reviewedBy: admin.id,
      reviewedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(authorApplications.id, applicationId));

  revalidatePath("/admin/applications");
}

// ── Reject application (admin only) ──────────────────────────────────────────

export async function rejectApplicationAction(applicationId: string, reviewNote?: string) {
  const admin = await getCurrentUser();
  if (!admin || admin.role !== "admin") throw new Error("Not authorized");

  await db
    .update(authorApplications)
    .set({
      status: "rejected",
      reviewedBy: admin.id,
      reviewedAt: new Date(),
      reviewNote: reviewNote?.trim() || null,
      updatedAt: new Date(),
    })
    .where(eq(authorApplications.id, applicationId));

  revalidatePath("/admin/applications");
}

// ── Change user role (admin only) ─────────────────────────────────────────────

export async function changeUserRoleAction(
  userId: string,
  role: "reader" | "author" | "admin"
) {
  const admin = await getCurrentUser();
  if (!admin || admin.role !== "admin") throw new Error("Not authorized");
  if (admin.id === userId) throw new Error("You cannot change your own role");

  await db
    .update(users)
    .set({ role, updatedAt: new Date() })
    .where(eq(users.id, userId));

  revalidatePath("/admin/users");
}

// ── Delete any post (admin only) ──────────────────────────────────────────────

export async function adminDeletePostAction(postId: string) {
  const admin = await getCurrentUser();
  if (!admin || admin.role !== "admin") throw new Error("Not authorized");

  const { posts } = await import("@/lib/db/schema");
  await db.delete(posts).where(eq(posts.id, postId));

  revalidatePath("/admin/posts");
}

// ── Delete any comment (admin only) ───────────────────────────────────────────

export async function adminDeleteCommentAction(commentId: string) {
  const admin = await getCurrentUser();
  if (!admin || admin.role !== "admin") throw new Error("Not authorized");

  const { comments } = await import("@/lib/db/schema");
  await db
    .update(comments)
    .set({ deletedAt: new Date() })
    .where(eq(comments.id, commentId));

  revalidatePath("/admin/comments");
}