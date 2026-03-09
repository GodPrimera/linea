import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/queries/users";
import { getAllCategories, getAllTags } from "@/lib/queries/categories";
import PostEditor from "../_components/PostEditor";

export default async function NewPostPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const [categories, allTags] = await Promise.all([
    getAllCategories(),
    getAllTags(),
  ]);

  return (
    <PostEditor
      categories={categories}
      allTags={allTags}
    />
  );
}
