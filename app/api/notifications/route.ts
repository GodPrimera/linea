import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { notifications } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { getCurrentUser } from "@/lib/queries/users";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ count: 0 });

  const rows = await db
    .select({ count: sql<number>`cast(count(*) as int)` })
    .from(notifications)
    .where(and(eq(notifications.userId, user.id), eq(notifications.isRead, false)));

  return NextResponse.json({ count: rows[0]?.count ?? 0 });
}
