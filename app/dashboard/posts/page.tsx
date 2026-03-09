import { getCurrentUser } from "@/lib/queries/users";
import { getAuthorPosts } from "@/lib/queries/dashboard";
import { redirect } from "next/navigation";
import DashboardPostsClient from "./_components/DashboardPostsClient";

export default async function PostsPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/sign-in");

  const posts = await getAuthorPosts(currentUser.id);

  return <DashboardPostsClient posts={posts} />;
}
