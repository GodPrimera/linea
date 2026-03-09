import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/queries/users";
import { getUserNotifications } from "@/lib/queries/notifications";
import NotificationsClient from "./_components/NotificationsClient";

export default async function NotificationsPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/sign-in");

  const notifications = await getUserNotifications(currentUser.id);

  return (
    <div className="bg-white dark:bg-zinc-950 min-h-screen">
      <div className="mx-auto max-w-3xl px-6 pt-16 pb-12">
        <div className="border-b border-zinc-100 dark:border-zinc-900 pb-10 mb-10">
          <p className="text-xs tracking-[0.2em] uppercase text-zinc-400 dark:text-zinc-500 mb-4">
            Activity
          </p>
          <h1 className="font-display text-5xl font-light text-zinc-900 dark:text-zinc-50 leading-[1.1]">
            Notifications
          </h1>
        </div>
        <NotificationsClient initialNotifications={notifications} />
      </div>
    </div>
  );
}
