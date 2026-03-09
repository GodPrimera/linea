import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface ClerkEmailAddress {
  id: string;
  email_address: string;
}

interface ClerkUserData {
  id: string;
  first_name: string | null;
  last_name: string | null;
  username: string | null;
  image_url: string | null;
  email_addresses: ClerkEmailAddress[];
  primary_email_address_id: string | null;
  public_metadata: Record<string, unknown>;
  created_at: number;
  updated_at: number;
}

interface ClerkEvent {
  type: string;
  data: ClerkUserData | { id: string };
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function getPrimaryEmail(data: ClerkUserData): string | null {
  if (!data.primary_email_address_id) return null;
  const found = data.email_addresses.find(
    (e) => e.id === data.primary_email_address_id
  );
  return found?.email_address ?? null;
}

function buildDisplayName(data: ClerkUserData): string {
  const parts = [data.first_name, data.last_name].filter(Boolean);
  if (parts.length > 0) return parts.join(" ");
  if (data.username) return data.username;
  return "Linea User";
}

// ─────────────────────────────────────────────────────────────────────────────
// POST handler
// ─────────────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;

  if (!secret) {
    console.error("[clerk-webhook] CLERK_WEBHOOK_SECRET is not set");
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  // Verify signature
  const headerPayload = await headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "Missing svix headers" }, { status: 400 });
  }

  const payload = await req.text();

  let event: ClerkEvent;
  try {
    const wh = new Webhook(secret);
    event = wh.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ClerkEvent;
  } catch (err) {
    console.error("[clerk-webhook] Invalid signature:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // ── Handle events ───────────────────────────────────────────────────────────
  try {
    switch (event.type) {

      // ── user.created ────────────────────────────────────────────────────────
      case "user.created": {
        const data = event.data as ClerkUserData;
        const email = getPrimaryEmail(data);
        const name = buildDisplayName(data);

        // Generate a unique username if Clerk doesn't have one
        const baseUsername = data.username ?? email?.split("@")[0] ?? `user_${data.id.slice(-6)}`;

        // Ensure uniqueness
        let username = baseUsername;
        let suffix = 1;
        while (true) {
          const existing = await db.query.users.findFirst({
            where: (u, { eq }) => eq(u.username, username),
          });
          if (!existing) break;
          username = `${baseUsername}${suffix}`;
          suffix++;
        }

        await db.insert(users).values({
          clerkId: data.id,
          email: email ?? "",
          name,
          username,
          avatarUrl: data.image_url,
          role: "reader",
          onboardingComplete: false,
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at),
        });

        console.log(`[clerk-webhook] Created user: ${username} (${data.id})`);
        break;
      }

      // ── user.updated ────────────────────────────────────────────────────────
      case "user.updated": {
        const data = event.data as ClerkUserData;
        const email = getPrimaryEmail(data);
        const name = buildDisplayName(data);

        const existing = await db.query.users.findFirst({
          where: (u, { eq }) => eq(u.clerkId, data.id),
        });

        if (!existing) {
          console.warn(`[clerk-webhook] user.updated — user not found: ${data.id}`);
          break;
        }

        await db
          .update(users)
          .set({
            email: email ?? existing.email,
            name,
            avatarUrl: data.image_url ?? existing.avatarUrl,
            updatedAt: new Date(data.updated_at),
          })
          .where(eq(users.clerkId, data.id));

        console.log(`[clerk-webhook] Updated user: ${data.id}`);
        break;
      }

      // ── user.deleted ────────────────────────────────────────────────────────
      case "user.deleted": {
        const data = event.data as { id: string };

        // Option A — soft delete (requires a deletedAt timestamp column in your users table)
        // await db.update(users).set({ deletedAt: new Date(), updatedAt: new Date() }).where(eq(users.clerkId, data.id));

        // Option B — hard delete (uncomment if you prefer to remove the row entirely)
        await db.delete(users).where(eq(users.clerkId, data.id));

        console.log(`[clerk-webhook] Deleted user: ${data.id}`);
        break;
      }

      default:
        console.log(`[clerk-webhook] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error(`[clerk-webhook] Error handling ${event.type}:`, error);
    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 500 }
    );
  }
}