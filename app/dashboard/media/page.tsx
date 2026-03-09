import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/queries/users";
import { getMediaByUser } from "@/lib/queries/subscribers";
import DashboardMediaClient from "./_components/DashboardMediaClient";

export default async function DashboardMediaPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const media = await getMediaByUser(user.id);

  return <DashboardMediaClient initialMedia={media} />;
}
