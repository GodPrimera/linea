import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/queries/users";
import { getAllCategories, getAllTags } from "@/lib/queries/categories";
import DashboardCategoriesClient from "./_components/DashboardCategoriesClient";

export default async function DashboardCategoriesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const [categories, tags] = await Promise.all([
    getAllCategories(),
    getAllTags(),
  ]);

  return <DashboardCategoriesClient initialCategories={categories} initialTags={tags} />;
}
