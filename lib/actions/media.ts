"use server";

import { db } from "@/lib/db";
import { media } from "@/lib/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { getCurrentUser } from "@/lib/queries/users";
import { revalidatePath } from "next/cache";

export async function deleteMediaAction(mediaId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");

  await db
    .delete(media)
    .where(and(eq(media.id, mediaId), eq(media.uploadedBy, user.id)));

  revalidatePath("/dashboard/media");
}

export async function deleteMediaBulkAction(mediaIds: string[]) {
  if (mediaIds.length === 0) return;
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");

  await db
    .delete(media)
    .where(
      and(
        inArray(media.id, mediaIds),
        eq(media.uploadedBy, user.id)
      )
    );

  revalidatePath("/dashboard/media");
}