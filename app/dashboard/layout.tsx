import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import DashboardSidebar from "./_components/DashboardSidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  // Replace with real role check:
  // const user = await db.query.users.findFirst({
  //   where: (u, { eq }) => eq(u.clerkId, userId),
  // });
  // if (user?.role !== "author" && user?.role !== "admin") redirect("/");

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
