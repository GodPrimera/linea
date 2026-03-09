import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/queries/users";
import { getCommentsByAuthor } from "@/lib/queries/comments";
import DashboardCommentsClient from "./_components/DashboardCommentsClient";

export default async function DashboardCommentsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const comments = await getCommentsByAuthor(user.id);

  return <DashboardCommentsClient initialComments={comments} />;
}
