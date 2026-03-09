import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { newsletterSubscribers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { newsletterSubscribers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const normalized = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalized)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    // Check if already subscribed
    const rows = await db
      .select()
      .from(newsletterSubscribers)
      .where(eq(newsletterSubscribers.email, normalized))
      .limit(1);

    const existing = rows[0];

    if (existing) {
      // Active subscriber = unsubscribedAt is null
      if (!existing.unsubscribedAt) {
        return NextResponse.json(
          { error: "This email is already subscribed." },
          { status: 409 }
        );
      }

      // Re-activate: clear unsubscribedAt, set resubscribedAt
      await db
        .update(newsletterSubscribers)
        .set({
          unsubscribedAt: null,
          resubscribedAt: new Date(),
          confirmedAt: new Date(),
          confirmed: true,
        })
        .where(eq(newsletterSubscribers.email, normalized));

      return NextResponse.json({ success: true, message: "Welcome back! You've been resubscribed." });
    }

    // New subscriber
    await db.insert(newsletterSubscribers).values({
      email: normalized,
      token: randomUUID(),
      confirmed: true,
      confirmedAt: new Date(),
      subscribedAt: new Date(),
      source: "website",
    });

    return NextResponse.json({
      success: true,
      message: "You're subscribed. Thanks for joining.",
    });
  } catch (error) {
    console.error("[newsletter/subscribe] error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const normalized = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalized)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    // Check if already subscribed
    const existing = await db.query.newsletterSubscribers.findFirst({
      where: (s, { eq }) => eq(s.email, normalized),
    });

    if (existing) {
      if (existing.isActive) {
        return NextResponse.json(
          { error: "This email is already subscribed." },
          { status: 409 }
        );
      }

      // Re-activate unsubscribed email
      await db
        .update(newsletterSubscribers)
        .set({ isActive: true, subscribedAt: new Date() })
        .where(eq(newsletterSubscribers.email, normalized));

      return NextResponse.json({ success: true, message: "Welcome back! You've been resubscribed." });
    }

    // New subscriber
    await db.insert(newsletterSubscribers).values({
      email: normalized,
      isActive: true,
      subscribedAt: new Date(),
    });

    // Optional: send welcome email via Resend
    // await sendWelcomeEmail(normalized);

    return NextResponse.json({
      success: true,
      message: "You're subscribed. Thanks for joining.",
    });
  } catch (error) {
    console.error("[newsletter/subscribe] error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
