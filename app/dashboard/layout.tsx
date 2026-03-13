import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/queries/users";
import DashboardSidebar from "./_components/DashboardSidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) redirect("/sign-in");

  // Only authors and admins can access the dashboard
  if (user.role !== "author" && user.role !== "admin") {
    redirect("/apply");
  }

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <DashboardSidebar />
      <main className="flex-1 min-w-0 ml-0 md:ml-60">
        <div className="max-w-6xl mx-auto px-6 py-10">
          {children}
        </div>
      </main>
    </div>
  );
}
