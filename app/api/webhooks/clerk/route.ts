import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

interface ClerkEmailAddress {
  email_address: string;
  id: string;
}

interface ClerkUserPayload {
  id: string;
  email_addresses: ClerkEmailAddress[];
  primary_email_address_id: string;
  first_name: string | null;
  last_name: string | null;
  username: string | null;
  image_url: string | null;
  public_metadata: Record<string, unknown>;
  created_at: number;
  updated_at: number;
}

interface ClerkEvent {
  type: string;
  data: ClerkUserPayload;
}

function getPrimaryEmail(payload: ClerkUserPayload): string | null {
  const primary = payload.email_addresses.find(
    (e) => e.id === payload.primary_email_address_id
  );
  return primary?.email_address ?? payload.email_addresses[0]?.email_address ?? null;
}

function getFullName(payload: ClerkUserPayload): string {
  const parts = [payload.first_name, payload.last_name].filter(Boolean);
  return parts.join(" ") || "Unnamed";
}

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("[clerk-webhook] CLERK_WEBHOOK_SECRET is not set.");
    return NextResponse.json({ error: "Webhook secret not configured." }, { status: 500 });
  }

  const headerPayload = await headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "Missing svix headers." }, { status: 400 });
  }

  const body = await req.text();

  let event: ClerkEvent;
  try {
    const wh = new Webhook(webhookSecret);
    event = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ClerkEvent;
  } catch (err) {
    console.error("[clerk-webhook] Signature verification failed:", err);
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 });
  }

  const { type, data } = event;
  console.log(`[clerk-webhook] Received event: ${type} for user ${data.id}`);

  try {
    switch (type) {

      case "user.created": {
        const email = getPrimaryEmail(data);
        const name = getFullName(data);
        const username = data.username ?? data.id;
        const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();
        const isAdmin = adminEmail && email?.toLowerCase() === adminEmail;

        const existing = await db.query.users.findFirst({
          where: (u, { eq }) => eq(u.clerkId, data.id),
        });

        if (existing) {
          console.log(`[clerk-webhook] user.created — user ${data.id} already exists, skipping.`);
          break;
        }

        await db.insert(users).values({
          clerkId: data.id,
          email: email ?? "",
          name,
          username,
          avatarUrl: data.image_url,
          role: isAdmin ? "admin" : "reader",
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at),
        });

        console.log(`[clerk-webhook] user.created — inserted user ${data.id} (${email}) role=${isAdmin ? "admin" : "reader"}`);
        break;
      }

      case "user.updated": {
        const email = getPrimaryEmail(data);
        const name = getFullName(data);

        const existing = await db.query.users.findFirst({
          where: (u, { eq }) => eq(u.clerkId, data.id),
        });

        if (!existing) {
          await db.insert(users).values({
            clerkId: data.id,
            email: email ?? "",
            name,
            username: data.username ?? data.id,
            avatarUrl: data.image_url,
            role: "reader",
            createdAt: new Date(data.created_at),
            updatedAt: new Date(data.updated_at),
          });
          console.log(`[clerk-webhook] user.updated — user ${data.id} not found, created instead.`);
          break;
        }

        await db
          .update(users)
          .set({
            email: email ?? existing.email,
            name,
            ...(data.username ? { username: data.username } : {}),
            avatarUrl: data.image_url,
            updatedAt: new Date(data.updated_at),
          })
          .where(eq(users.clerkId, data.id));

        console.log(`[clerk-webhook] user.updated — updated user ${data.id}`);
        break;
      }

      case "user.deleted": {
        if (!data.id) break;

        await db
          .update(users)
          .set({
            deletedAt: new Date(),
            email: `deleted_${data.id}@linea.blog`,
            updatedAt: new Date(),
          })
          .where(eq(users.clerkId, data.id));

        console.log(`[clerk-webhook] user.deleted — soft-deleted user ${data.id}`);
        break;
      }

      default:
        console.log(`[clerk-webhook] Unhandled event type: ${type}`);
    }
  } catch (err) {
    console.error(`[clerk-webhook] Error handling ${type}:`, err);
    return NextResponse.json({ error: "Internal error processing webhook." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
