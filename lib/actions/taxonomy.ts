"use server";

import { db } from "@/lib/db";
import { categories, tags } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/queries/users";
import { revalidatePath } from "next/cache";

function toSlug(name: string) {
  return name.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

async function assertAdmin() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "admin" && user.role !== "author"))
    throw new Error("Not authorised");
  return user;
}

// ─── Categories ──────────────────────────────────────────────────────────────

export async function createCategoryAction(name: string, description: string) {
  await assertAdmin();
  if (!name.trim()) throw new Error("Name required");

  const slug = toSlug(name);

  await db.insert(categories).values({
    name: name.trim(),
    slug,
    description: description.trim() || null,
  });

  revalidatePath("/dashboard/categories");
  revalidatePath("/categories");
}

export async function deleteCategoryAction(id: string) {
  await assertAdmin();

  await db.delete(categories).where(eq(categories.id, id));

  revalidatePath("/dashboard/categories");
  revalidatePath("/categories");
}

export async function updateCategoryAction(
  id: string,
  name: string,
  description: string
) {
  await assertAdmin();
  if (!name.trim()) throw new Error("Name required");

  await db
    .update(categories)
    .set({
      name: name.trim(),
      slug: toSlug(name),
      description: description.trim() || null,
      updatedAt: new Date(),
    })
    .where(eq(categories.id, id));

  revalidatePath("/dashboard/categories");
  revalidatePath("/categories");
}

// ─── Tags ─────────────────────────────────────────────────────────────────────

export async function createTagAction(name: string) {
  await assertAdmin();
  if (!name.trim()) throw new Error("Name required");

  const slug = toSlug(name);

  await db.insert(tags).values({ name: name.trim(), slug });

  revalidatePath("/dashboard/categories");
}

export async function deleteTagAction(id: string) {
  await assertAdmin();

  await db.delete(tags).where(eq(tags.id, id));

  revalidatePath("/dashboard/categories");
}
