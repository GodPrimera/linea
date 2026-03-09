import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getUserByUsername, getCurrentUser, isFollowing } from "@/lib/queries/users";
import { getPostsByAuthor } from "@/lib/queries/posts";
import FollowButton from "./_components/FollowButton";
import type { PostCard } from "@/lib/queries/posts";

function formatDate(date: Date | null) {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });
}

const socialIcons: Record<string, React.ReactNode> = {
  twitter: (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="currentColor">
      <path d="M11.56 0h2.3L9.01 6.35 14.73 14H9.72L5.82 9.1 1.37 14H-.93l5.2-6.77L-1.03 0h5.12l3.54 5.47L11.56 0zm-.8 12.58h1.27L4.1 1.3H2.74l7.02 11.28z"/>
    </svg>
  ),
  github: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
    </svg>
  ),
  linkedin: (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="currentColor">
      <path d="M1.5 0C.67 0 0 .67 0 1.5v12C0 14.33.67 15 1.5 15h12c.83 0 1.5-.67 1.5-1.5v-12C15 .67 14.33 0 13.5 0h-12zm1.25 5h2V13h-2V5zm1-3.25a1.25 1.25 0 110 2.5 1.25 1.25 0 010-2.5zM6.5 5h1.9v1.1C8.8 5.4 9.7 5 10.75 5 12.6 5 13.5 6 13.5 8.2V13h-2V8.5c0-1.1-.4-1.75-1.3-1.75-.9 0-1.45.65-1.45 1.75V13H6.5V5z"/>
    </svg>
  ),
  instagram: (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="currentColor">
      <path d="M7.5 0C5.46 0 5.21.01 4.41.05 3.62.08 3.07.22 2.6.41A4.9 4.9 0 00.41 2.6C.22 3.07.08 3.62.05 4.41.01 5.21 0 5.46 0 7.5s.01 2.29.05 3.09c.03.79.17 1.34.36 1.81a4.9 4.9 0 002.19 2.19c.47.19 1.02.33 1.81.36C5.21 14.99 5.46 15 7.5 15s2.29-.01 3.09-.05c.79-.03 1.34-.17 1.81-.36a4.9 4.9 0 002.19-2.19c.19-.47.33-1.02.36-1.81.04-.8.05-1.05.05-3.09s-.01-2.29-.05-3.09c-.03-.79-.17-1.34-.36-1.81A4.9 4.9 0 0012.4.41C11.93.22 11.38.08 10.59.05 9.79.01 9.54 0 7.5 0zm0 1.35c2 0 2.24.01 3.03.04.73.03 1.13.15 1.39.25.35.14.6.3.86.56.26.26.42.51.56.86.1.26.22.66.25 1.39.03.79.04 1.03.04 3.03s-.01 2.24-.04 3.03c-.03.73-.15 1.13-.25 1.39a2.32 2.32 0 01-.56.86 2.32 2.32 0 01-.86.56c-.26.1-.66.22-1.39.25-.79.03-1.03.04-3.03.04s-2.24-.01-3.03-.04c-.73-.03-1.13-.15-1.39-.25a2.32 2.32 0 01-.86-.56 2.32 2.32 0 01-.56-.86c-.1-.26-.22-.66-.25-1.39C1.36 9.74 1.35 9.5 1.35 7.5s.01-2.24.04-3.03c.03-.73.15-1.13.25-1.39.14-.35.3-.6.56-.86.26-.26.51-.42.86-.56.26-.1.66-.22 1.39-.25.79-.03 1.03-.04 3.03-.04zm0 2.3a3.85 3.85 0 100 7.7 3.85 3.85 0 000-7.7zm0 6.35a2.5 2.5 0 110-5 2.5 2.5 0 010 5zm4.9-6.5a.9.9 0 11-1.8 0 .9.9 0 011.8 0z"/>
    </svg>
  ),
  youtube: (
    <svg width="16" height="15" viewBox="0 0 16 15" fill="currentColor">
      <path d="M15.67 4.5s-.16-1.1-.64-1.58c-.61-.64-1.3-.64-1.61-.68C11.11 2.08 8 2.08 8 2.08s-3.11 0-5.42.16c-.31.04-1 .04-1.61.68C.49 3.4.33 4.5.33 4.5S.17 5.78.17 7.07v1.2c0 1.28.16 2.57.16 2.57s.16 1.1.64 1.58c.61.64 1.42.62 1.78.68C3.96 13.27 8 13.27 8 13.27s3.11 0 5.42-.18c.31-.04 1-.04 1.61-.68.48-.48.64-1.58.64-1.58s.16-1.28.16-2.57v-1.2C15.83 5.78 15.67 4.5 15.67 4.5zM6.4 9.63V5.27l4.35 2.19L6.4 9.63z"/>
    </svg>
  ),
};

export default async function AuthorPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  const [author, currentUser] = await Promise.all([
    getUserByUsername(username),
    getCurrentUser(),
  ]);

  if (!author) notFound();

  const authorPosts = await getPostsByAuthor(author.id);

  const following = currentUser
    ? await isFollowing(currentUser.id, author.id)
    : false;

  // Use the first featured post as the pinned post, otherwise the most recent
  const featuredPost = authorPosts.find((p) => p.isFeatured) ?? authorPosts[0] ?? null;
  const remainingPosts = featuredPost
    ? authorPosts.filter((p) => p.id !== featuredPost.id)
    : [];

  const socialLinks = author.socialLinks
    ? Object.entries(author.socialLinks).filter(
        ([key, url]) => key !== "userId" && !!url
      )
    : [];

  return (
    <div className="bg-white dark:bg-zinc-950 min-h-screen">

      {/* Cover banner */}
      <div className="relative w-full h-52 md:h-64 bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
        {author.coverImageId ? (
          <Image
            src={`/api/media/${author.coverImageId}`}
            alt={`${author.name}'s cover`}
            fill priority
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-zinc-200 to-zinc-100 dark:from-zinc-800 dark:to-zinc-900" />
        )}
        <div className="absolute inset-0 bg-black/20" />
      </div>

      <div className="mx-auto max-w-6xl px-6">

        {/* Profile header */}
        <div className="relative flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-8 border-b border-zinc-100 dark:border-zinc-900">
          <div className="flex items-end gap-5 -mt-12 sm:-mt-14">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-white dark:border-zinc-950 overflow-hidden bg-zinc-200 dark:bg-zinc-800 shrink-0">
              {author.avatarUrl ? (
                <Image
                  src={author.avatarUrl}
                  alt={author.name}
                  width={112} height={112}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-display text-3xl text-zinc-400">
                  {author.name[0]}
                </div>
              )}
            </div>
            <div className="pb-1">
              <h1 className="font-display text-3xl md:text-4xl font-light text-zinc-900 dark:text-zinc-50 leading-tight">
                {author.name}
              </h1>
              <p className="text-sm text-zinc-400 dark:text-zinc-600 mt-0.5">
                @{author.username}
              </p>
            </div>
          </div>

          <div className="sm:pb-1">
            <FollowButton
              authorId={author.id}
              authorName={author.name}
              initialIsFollowing={following}
              currentUserId={currentUser?.id ?? null}
            />
          </div>
        </div>

        {/* Bio + stats + social */}
        <div className="py-8 border-b border-zinc-100 dark:border-zinc-900">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            <div className="md:col-span-2 space-y-4">
              {author.bio && (
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-base">
                  {author.bio}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-4">
                {author.location && (
                  <div className="flex items-center gap-1.5 text-sm text-zinc-400 dark:text-zinc-600">
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                      <path d="M6.5 1a4 4 0 014 4c0 3-4 7-4 7S2.5 8 2.5 5a4 4 0 014-4z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="6.5" cy="5" r="1.2" stroke="currentColor" strokeWidth="1.3"/>
                    </svg>
                    {author.location}
                  </div>
                )}
                {author.website && (
                  <a href={author.website} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm text-zinc-400 dark:text-zinc-600 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors">
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                      <circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" strokeWidth="1.3"/>
                      <path d="M1 6.5h11M6.5 1C5 3 4 4.6 4 6.5S5 10 6.5 12M6.5 1C8 3 9 4.6 9 6.5S8 10 6.5 12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                    </svg>
                    {author.website.replace("https://", "")}
                  </a>
                )}
              </div>

              {socialLinks.length > 0 && (
                <div className="flex items-center gap-3 pt-1">
                  {socialLinks.map(([platform, url]) => (
                    <a key={platform} href={url as string} target="_blank" rel="noopener noreferrer"
                      aria-label={platform}
                      className="text-zinc-400 dark:text-zinc-600 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors duration-200">
                      {socialIcons[platform] ?? platform}
                    </a>
                  ))}
                </div>
              )}
            </div>

            <div className="flex sm:flex-col gap-6 sm:gap-4 md:items-end md:text-right">
              {[
                { label: "Posts", value: authorPosts.length },
                { label: "Followers", value: author.followerCount },
                { label: "Following", value: author.followingCount },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="font-display text-3xl font-light text-zinc-900 dark:text-zinc-50">
                    {stat.value}
                  </p>
                  <p className="text-xs tracking-widest uppercase text-zinc-400 dark:text-zinc-600 mt-0.5">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* Featured / pinned post */}
        {featuredPost && (
          <div className="py-12 border-b border-zinc-100 dark:border-zinc-900">
            <p className="text-xs tracking-[0.2em] uppercase text-zinc-400 dark:text-zinc-500 mb-7">
              {featuredPost.isFeatured ? "Featured" : "Latest"}
            </p>
            <Link href={`/blog/${featuredPost.slug}`}
              className="group flex flex-col sm:flex-row gap-6 items-start">
              <div className="w-full sm:w-56 shrink-0 overflow-hidden aspect-[3/2] bg-zinc-100 dark:bg-zinc-900">
                {featuredPost.coverImageUrl && (
                  <Image
                    src={featuredPost.coverImageUrl}
                    alt={featuredPost.title}
                    width={400} height={267}
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                  />
                )}
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  {featuredPost.categoryName && (
                    <span className="text-xs tracking-widest uppercase text-zinc-400 dark:text-zinc-600">
                      {featuredPost.categoryName}
                    </span>
                  )}
                  {featuredPost.readingTime && (
                    <>
                      <span className="text-zinc-200 dark:text-zinc-800">·</span>
                      <span className="text-xs text-zinc-400 dark:text-zinc-600">
                        {featuredPost.readingTime} min read
                      </span>
                    </>
                  )}
                </div>
                <h2 className="font-display text-3xl font-light text-zinc-900 dark:text-zinc-50 leading-snug group-hover:opacity-60 transition-opacity duration-200">
                  {featuredPost.title}
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  {featuredPost.excerpt}
                </p>
                <div className="flex items-center gap-3 pt-1 text-xs text-zinc-400 dark:text-zinc-600">
                  <span>{formatDate(featuredPost.publishedAt)}</span>
                  <span className="text-zinc-200 dark:text-zinc-800">·</span>
                  <span className="flex items-center gap-1">
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                      <path d="M8 13.5C8 13.5 1.5 9.5 1.5 5.5C1.5 3.57 3.07 2 5 2C6.19 2 7.25 2.61 8 3.5C8.75 2.61 9.81 2 11 2C12.93 2 14.5 3.57 14.5 5.5C14.5 9.5 8 13.5 8 13.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {featuredPost.likeCount}
                  </span>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* All posts */}
        {remainingPosts.length > 0 && (
          <div className="py-12">
            <div className="flex items-center justify-between mb-10">
              <p className="text-xs tracking-[0.2em] uppercase text-zinc-400 dark:text-zinc-500">
                All posts
              </p>
              <span className="text-sm text-zinc-400 dark:text-zinc-600">
                {remainingPosts.length} posts
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
              {remainingPosts.map((post) => (
                <Link key={post.slug} href={`/blog/${post.slug}`} className="group block space-y-4">
                  <div className="overflow-hidden aspect-[3/2] bg-zinc-100 dark:bg-zinc-900">
                    {post.coverImageUrl && (
                      <Image
                        src={post.coverImageUrl}
                        alt={post.title}
                        width={600} height={400}
                        className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
                      />
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {post.categoryName && (
                      <span className="text-xs tracking-widest uppercase text-zinc-400 dark:text-zinc-600">
                        {post.categoryName}
                      </span>
                    )}
                    {post.readingTime && (
                      <>
                        <span className="text-zinc-200 dark:text-zinc-800">·</span>
                        <span className="text-xs text-zinc-400 dark:text-zinc-600">{post.readingTime} min</span>
                      </>
                    )}
                  </div>

                  <h3 className="font-display text-2xl font-light text-zinc-900 dark:text-zinc-50 leading-snug group-hover:opacity-60 transition-opacity duration-200">
                    {post.title}
                  </h3>

                  <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed line-clamp-2">
                    {post.excerpt}
                  </p>

                  <div className="flex items-center justify-between pt-1 border-t border-zinc-50 dark:border-zinc-900">
                    <span className="text-xs text-zinc-400 dark:text-zinc-600">
                      {formatDate(post.publishedAt)}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-zinc-400 dark:text-zinc-600">
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                        <path d="M8 13.5C8 13.5 1.5 9.5 1.5 5.5C1.5 3.57 3.07 2 5 2C6.19 2 7.25 2.61 8 3.5C8.75 2.61 9.81 2 11 2C12.93 2 14.5 3.57 14.5 5.5C14.5 9.5 8 13.5 8 13.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {post.likeCount}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {authorPosts.length === 0 && (
          <div className="py-24 text-center">
            <p className="text-sm text-zinc-400 dark:text-zinc-600">No posts published yet.</p>
          </div>
        )}

      </div>
    </div>
  );
}
