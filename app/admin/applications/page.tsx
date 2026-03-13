import { db } from "@/lib/db";
import { authorApplications, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import ApplicationsClient from "./_components/ApplicationsClient";

async function getApplications() {
  const rows = await db
    .select({
      id: authorApplications.id,
      reason: authorApplications.reason,
      writingSamples: authorApplications.writingSamples,
      status: authorApplications.status,
      createdAt: authorApplications.createdAt,
      reviewNote: authorApplications.reviewNote,
      userName: users.name,
      userEmail: users.email,
      userUsername: users.username,
    })
    .from(authorApplications)
    .innerJoin(users, eq(users.id, authorApplications.userId))
    .orderBy(authorApplications.createdAt);

  return rows;
}

export default async function AdminApplicationsPage() {
  const applications = await getApplications();
  return <ApplicationsClient initialApplications={applications} />;
}
