import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/queries/users";
import { db } from "@/lib/db";
import { authorApplications } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import ApplyClient from "./_components/ApplyClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Become an Author",
  description: "Apply to write on Linea.",
};

export default async function ApplyPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  // Authors and admins already have access — send to dashboard
  if (user.role === "author" || user.role === "admin") {
    redirect("/dashboard");
  }

  // Check for existing application
  const existing = await db
    .select()
    .from(authorApplications)
    .where(eq(authorApplications.userId, user.id))
    .orderBy(desc(authorApplications.createdAt))
    .limit(1);

  const latestApplication = existing[0] ?? null;

  // Already has a pending application
  if (latestApplication?.status === "pending") {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center space-y-4">
          <p className="text-xs tracking-widest uppercase text-zinc-400 dark:text-zinc-600">Application status</p>
          <h2 className="font-display text-3xl font-light text-zinc-900 dark:text-zinc-50">
            Under review
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Your application is currently being reviewed. We'll notify you once a decision has been made.
          </p>
        </div>
      </div>
    );
  }

  // Previously rejected — can reapply
  return (
    <div>
      {latestApplication?.status === "rejected" && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-900">
          <div className="mx-auto max-w-2xl px-6 py-4">
            <p className="text-sm text-amber-700 dark:text-amber-400">
              Your previous application was not approved.
              {latestApplication.reviewNote && (
                <span className="block mt-1 text-amber-600 dark:text-amber-500">
                  Admin note: {latestApplication.reviewNote}
                </span>
              )}
              You're welcome to apply again.
            </p>
          </div>
        </div>
      )}
      <ApplyClient />
    </div>
  );
}
