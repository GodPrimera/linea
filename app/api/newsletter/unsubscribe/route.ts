import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { newsletterSubscribers } from "@/lib/db/schema";
import { eq, or } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const { email, token } = await req.json();

    // Accept either email or token (token used for one-click unsubscribe links)
    if (!email && !token) {
      return NextResponse.json({ error: "Email or token is required." }, { status: 400 });
    }

    const rows = await db
      .select()
      .from(newsletterSubscribers)
      .where(
        email
          ? eq(newsletterSubscribers.email, email.trim().toLowerCase())
          : eq(newsletterSubscribers.token, token)
      )
      .limit(1);

    const existing = rows[0];

    // Not found or already unsubscribed (unsubscribedAt is non-null)
    if (!existing || existing.unsubscribedAt) {
      return NextResponse.json(
        { error: "This email is not subscribed." },
        { status: 404 }
      );
    }

    await db
      .update(newsletterSubscribers)
      .set({ unsubscribedAt: new Date() })
      .where(eq(newsletterSubscribers.id, existing.id));

    return NextResponse.json({
      success: true,
      message: "You've been unsubscribed.",
    });
  } catch (error) {
    console.error("[newsletter/unsubscribe] error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
