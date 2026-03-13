import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { isNull } from "drizzle-orm";
import AdminUsersClient from "./_components/AdminUsersClient";

async function getAllUsers() {
  return db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      username: users.username,
      role: users.role,
      avatarUrl: users.avatarUrl,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(isNull(users.deletedAt))
    .orderBy(users.createdAt);
}

export default async function AdminUsersPage() {
  const allUsers = await getAllUsers();
  return <AdminUsersClient initialUsers={allUsers} />;
}
