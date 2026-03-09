"use server";

import { auth, currentUser, clerkClient } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users, userSettings, userSocialLinks } from "@/lib/db/schema";

export async function completeOnboarding(username: string) {
  console.log("1. Action started with username:", username);

  const { userId: clerkId } = await auth();
  console.log("2. ClerkId:", clerkId);
  if (!clerkId) return { error: "Not authenticated." };

  const clerkUser = await currentUser();
  console.log("3. ClerkUser found:", !!clerkUser);
  if (!clerkUser) return { error: "Could not load user." };

  const existing = await db.query.users.findFirst({
    where: (u, { eq }) => eq(u.username, username),
  });
  console.log("4. Username already taken:", !!existing);

  if (existing) {
    return { error: "Username is already taken." };
  }

  try {
    const [newUser] = await db
      .insert(users)
      .values({
        clerkId,
        name: `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim(),
        username,
        email: clerkUser.emailAddresses[0].emailAddress,
        avatarUrl: clerkUser.imageUrl,
        emailVerified:
          clerkUser.emailAddresses[0].verification?.status === "verified",
        role: "reader",
      })
      .returning();
    console.log("5. DB user created:", newUser.id);

    await Promise.all([
      db.insert(userSettings).values({ userId: newUser.id }),
      db.insert(userSocialLinks).values({ userId: newUser.id }),
    ]);
    console.log("6. Settings and social links created");

    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Clerk timeout")), 5000)
      );
      const client = await clerkClient();
      await Promise.race([
        client.users.updateUser(clerkId, {
          publicMetadata: { onboardingComplete: true },
        }),
        timeoutPromise,
      ]);
      console.log("7. Clerk metadata updated");
    } catch (error) {
      console.error("7. Clerk metadata failed:", error);
    }

    return { success: true };

  } catch (error) {
    console.error("DB insert failed:", error);
    return { error: "Failed to create account. Please try again." };
  }
}