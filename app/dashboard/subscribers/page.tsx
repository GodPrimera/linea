import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/queries/users";
import { getSubscribers } from "@/lib/queries/subscribers";
import DashboardSubscribersClient from "./_components/DashboardSubscribersClient";

export default async function DashboardSubscribersPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const subscribers = await getSubscribers();

  return <DashboardSubscribersClient initialSubscribers={subscribers} />;
}
