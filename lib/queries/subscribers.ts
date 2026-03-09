import { db } from "@/lib/db";
import { newsletterSubscribers, media } from "@/lib/db/schema";
import { eq, desc, isNull, isNotNull } from "drizzle-orm";

// ─── Subscribers ──────────────────────────────────────────────────────────────

export type Subscriber = {
  id: string;
  email: string;
  name: string | null;
  subscribedAt: Date;
  confirmed: boolean;
  active: boolean; // unsubscribedAt IS NULL
};

export async function getSubscribers(): Promise<Subscriber[]> {
  const rows = await db
    .select({
      id: newsletterSubscribers.id,
      email: newsletterSubscribers.email,
      name: newsletterSubscribers.name,
      subscribedAt: newsletterSubscribers.subscribedAt,
      confirmed: newsletterSubscribers.confirmed,
      unsubscribedAt: newsletterSubscribers.unsubscribedAt,
    })
    .from(newsletterSubscribers)
    .orderBy(desc(newsletterSubscribers.subscribedAt));

  return rows.map((r) => ({
    id: r.id,
    email: r.email,
    name: r.name,
    subscribedAt: r.subscribedAt,
    confirmed: r.confirmed,
    active: r.unsubscribedAt === null,
  }));
}

// ─── Media ────────────────────────────────────────────────────────────────────

export type MediaFile = {
  id: string;
  url: string;
  filename: string;
  mimeType: string;
  sizeBytes: number | null;
  width: number | null;
  height: number | null;
  altText: string | null;
  createdAt: Date;
};

export async function getMediaByUser(userId: string): Promise<MediaFile[]> {
  const rows = await db
    .select({
      id: media.id,
      url: media.url,
      filename: media.filename,
      mimeType: media.mimeType,
      sizeBytes: media.sizeBytes,
      width: media.width,
      height: media.height,
      altText: media.altText,
      createdAt: media.createdAt,
    })
    .from(media)
    .where(eq(media.uploadedBy, userId))
    .orderBy(desc(media.createdAt));

  return rows;
}
