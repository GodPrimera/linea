import { db } from "@/lib/db";
import { comments, users, posts } from "@/lib/db/schema";
import { eq, isNull } from "drizzle-orm";
import AdminCommentsClient from "./_components/AdminCommentsClient";

async function getAllComments() {
  return db
    .select({
      id: comments.id,
      content: comments.content,
      approved: comments.approved,
      createdAt: comments.createdAt,
      authorName: users.name,
      authorUsername: users.username,
      postTitle: posts.title,
      postSlug: posts.slug,
    })
    .from(comments)
    .leftJoin(users, eq(users.id, comments.userId))
    .leftJoin(posts, eq(posts.id, comments.postId))
    .where(isNull(comments.deletedAt))
    .orderBy(comments.createdAt);
}

export default async function AdminCommentsPage() {
  const allComments = await getAllComments();
  return <AdminCommentsClient initialComments={allComments} />;
}
