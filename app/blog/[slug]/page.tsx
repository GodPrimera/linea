import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getPostBySlug, getRelatedPosts } from "@/lib/queries/posts";
import { getCommentsByPost } from "@/lib/queries/comments";
import { getCurrentUser } from "@/lib/queries/users";
import { db } from "@/lib/db";
import { likes, bookmarks, postViews } from "@/lib/db/schema";
import { and, eq, sql } from "drizzle-orm";
import Image from "next/image";
import Link from "next/link";
import PostActions from "./_components/PostActions";
import TableOfContents from "./_components/TableOfContents";
import CommentsSection from "./_components/CommentsSection";
import MarkdownRenderer from "@/components/MarkdownRenderer";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};

  const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://linea.blog";
  const title = post.metaTitle ?? post.title;
  const description = post.metaDescription ?? post.excerpt;
  const url = `${siteUrl}/blog/${post.slug}`;
  const images = post.coverImageUrl
    ? [{ url: post.coverImageUrl, width: 1200, height: 630, alt: title }]
    : [{ url: "/og-default.png", width: 1200, height: 630, alt: title }];

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      type: "article",
      url,
      images,
      publishedTime: post.publishedAt?.toISOString(),
      authors: [`${siteUrl}/author/${post.authorUsername}`],
      section: post.categoryName ?? undefined,
      tags: post.tags.map((t) => t.name),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: images.map((i) => i.url),
    },
  };
}

// postViews stores one row per visit — no viewCount column
async function recordView(postId: string) {
  await db.insert(postViews).values({ postId, viewedAt: new Date() });
}



export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug);
  if (!post) notFound();

  const { userId: clerkId } = await auth();
  const currentUser = clerkId ? await getCurrentUser() : null;

  // Fire-and-forget view record
  recordView(post.id).catch(console.error);

  const [likeCount, commentRows, relatedPosts, isLiked, isBookmarked] = await Promise.all([
    db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(likes)
      .where(eq(likes.postId, post.id))
      .then((r) => r[0]?.count ?? 0),

    getCommentsByPost(post.id),

    getRelatedPosts(post.id, post.categoryId ?? null),

    currentUser
      ? db
          .select()
          .from(likes)
          .where(and(eq(likes.postId, post.id), eq(likes.userId, currentUser.id)))
          .limit(1)
          .then((r) => r.length > 0)
      : Promise.resolve(false),

    currentUser
      ? db
          .select()
          .from(bookmarks)
          .where(and(eq(bookmarks.postId, post.id), eq(bookmarks.userId, currentUser.id)))
          .limit(1)
          .then((r) => r.length > 0)
      : Promise.resolve(false),
  ]);

  const headings = post.content
    ? post.content
        .split("\n")
        .filter((l) => l.startsWith("## ") || l.startsWith("### "))
        .map((l) => {
          const level = l.startsWith("### ") ? 3 : 2;
          const text = l.replace(/^#{2,3} /, "");
          const id = text.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
          return { level, text, id };
        })
    : [];

  const publishedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("en-US", {
        month: "long", day: "numeric", year: "numeric",
      })
    : "";

  return (
    <article className="bg-white dark:bg-zinc-950">

      {/* Cover image */}
      {post.coverImageUrl && (
        <div className="w-full h-[50vh] md:h-[60vh] relative bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
          <Image
            src={post.coverImageUrl}
            alt={post.title}
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        </div>
      )}

      {/* Post header */}
      <div className="mx-auto max-w-2xl px-6 pt-14 pb-8">

        {/* Category + tags */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          {post.categoryName && post.categorySlug && (
            <Link
              href={`/categories/${post.categorySlug}`}
              className="text-xs tracking-widest uppercase text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
            >
              {post.categoryName}
            </Link>
          )}
          {post.tags.map((tag) => (
            <span
              key={tag.slug}
              className="text-xs px-2.5 py-1 border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400"
            >
              {tag.name}
            </span>
          ))}
        </div>

        <h1 className="font-display text-4xl md:text-5xl font-light text-zinc-900 dark:text-zinc-50 leading-[1.1] tracking-tight mb-6">
          {post.title}
        </h1>

        <p className="text-xl text-zinc-500 dark:text-zinc-400 leading-relaxed mb-8 font-light">
          {post.excerpt}
        </p>

        {/* Author + meta */}
        <div className="flex items-center justify-between py-6 border-t border-b border-zinc-100 dark:border-zinc-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden shrink-0">
              {post.authorAvatarUrl && (
                <Image
                  src={post.authorAvatarUrl}
                  alt={post.authorName}
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div>
              <Link
                href={`/author/${post.authorUsername}`}
                className="text-sm font-medium text-zinc-900 dark:text-zinc-50 hover:opacity-60 transition-opacity"
              >
                {post.authorName}
              </Link>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-zinc-400 dark:text-zinc-600">{publishedDate}</span>
                {post.readingTime && (
                  <>
                    <span className="text-zinc-300 dark:text-zinc-700">·</span>
                    <span className="text-xs text-zinc-400 dark:text-zinc-600">{post.readingTime} min read</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <PostActions
            postId={post.id}
            postSlug={post.slug}
            postTitle={post.title}
            initialLikeCount={likeCount}
            initialIsLiked={isLiked}
            initialIsBookmarked={isBookmarked}
            currentUserId={currentUser?.id ?? null}
          />
        </div>
      </div>

      {/* Content + ToC */}
      <div className="mx-auto max-w-6xl px-6 pb-16">
        <div className="flex gap-16 justify-center">
          <div className="w-full max-w-2xl min-w-0">
            {post.content && <MarkdownRenderer content={post.content} />}
          </div>

          {headings.length > 0 && (
            <aside className="hidden xl:block w-56 shrink-0">
              <div className="sticky top-24">
                <TableOfContents headings={headings} />
              </div>
            </aside>
          )}
        </div>
      </div>

      {/* Author bio */}
      {post.authorBio && (
        <div className="mx-auto max-w-2xl px-6 py-12 border-t border-zinc-100 dark:border-zinc-900">
          <div className="flex gap-5 items-start">
            <div className="w-14 h-14 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden shrink-0">
              {post.authorAvatarUrl && (
                <Image
                  src={post.authorAvatarUrl}
                  alt={post.authorName}
                  width={56}
                  height={56}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="space-y-1.5">
              <p className="text-xs tracking-widest uppercase text-zinc-400 dark:text-zinc-500">Written by</p>
              <Link
                href={`/author/${post.authorUsername}`}
                className="text-base font-medium text-zinc-900 dark:text-zinc-50 hover:opacity-60 transition-opacity block"
              >
                {post.authorName}
              </Link>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{post.authorBio}</p>
            </div>
          </div>
        </div>
      )}

      {/* Related posts */}
      {relatedPosts.length > 0 && (
        <div className="mx-auto max-w-6xl px-6 py-16 border-t border-zinc-100 dark:border-zinc-900">
          <p className="text-xs tracking-[0.2em] uppercase text-zinc-400 dark:text-zinc-500 mb-10">
            Related posts
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {relatedPosts.map((related) => (
              <Link key={related.slug} href={`/blog/${related.slug}`} className="group block space-y-3">
                <div className="overflow-hidden aspect-[3/2] bg-zinc-100 dark:bg-zinc-900">
                  {related.coverImageUrl && (
                    <Image
                      src={related.coverImageUrl}
                      alt={related.title}
                      width={600}
                      height={400}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                    />
                  )}
                </div>
                {related.categoryName && (
                  <span className="text-xs tracking-widest uppercase text-zinc-400 dark:text-zinc-600">
                    {related.categoryName}
                  </span>
                )}
                <h3 className="font-display text-xl font-light text-zinc-900 dark:text-zinc-50 leading-snug group-hover:opacity-60 transition-opacity">
                  {related.title}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Comments */}
      {post.allowComments && (
        <div className="mx-auto max-w-2xl px-6 py-16 border-t border-zinc-100 dark:border-zinc-900">
          <CommentsSection
            postId={post.id}
            initialComments={commentRows}
            currentUser={
              currentUser
                ? { id: currentUser.id, name: currentUser.name, avatarUrl: currentUser.avatarUrl ?? null }
                : null
            }
          />
        </div>
      )}

    </article>
  );
}
