import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/queries/users";
import { getAllCategories, getAllTags } from "@/lib/queries/categories";
import { db } from "@/lib/db";
import { posts, categories, postTags, tags } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import PostEditor from "../../_components/PostEditor";

async function getPostForEdit(postId: string, authorId: string) {
  const rows = await db
    .select({
      id: posts.id,
      title: posts.title,
      slug: posts.slug,
      excerpt: posts.excerpt,
      content: posts.content,
      status: posts.status,
      isFeatured: posts.isFeatured,
      categoryName: categories.name,
    })
    .from(posts)
    .leftJoin(categories, eq(categories.id, posts.categoryId))
    .where(and(eq(posts.id, postId), eq(posts.authorId, authorId)))
    .limit(1);

  if (rows.length === 0) return null;
  const post = rows[0];

  // Fetch associated tags
  const tagRows = await db
    .select({ name: tags.name })
    .from(postTags)
    .innerJoin(tags, eq(tags.id, postTags.tagId))
    .where(eq(postTags.postId, postId));

  return {
    ...post,
    tagsCsv: tagRows.map((t) => t.name).join(", "),
  };
}

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const [post, categories, allTags] = await Promise.all([
    getPostForEdit(id, user.id),
    getAllCategories(),
    getAllTags(),
  ]);

  if (!post) notFound();

  return (
    <PostEditor
      postId={post.id}
      initialData={{
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        categoryName: post.categoryName ?? "",
        tagsCsv: post.tagsCsv,
        status: post.status as "draft" | "published" | "scheduled",
        isFeatured: post.isFeatured,
      }}
      categories={categories}
      allTags={allTags}
    />
  );
}
