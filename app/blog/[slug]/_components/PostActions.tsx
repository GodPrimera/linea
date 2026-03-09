"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleLike, toggleBookmark } from "@/lib/actions/interactions";

interface PostActionsProps {
  postId: string;
  postSlug: string;
  postTitle: string;
  initialLikeCount: number;
  initialIsLiked: boolean;
  initialIsBookmarked: boolean;
  currentUserId: string | null;
}

export default function PostActions({
  postId,
  postSlug,
  postTitle,
  initialLikeCount,
  initialIsLiked,
  initialIsBookmarked,
  currentUserId,
}: PostActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [liked, setLiked] = useState(initialIsLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [bookmarked, setBookmarked] = useState(initialIsBookmarked);
  const [copied, setCopied] = useState(false);

  function requireAuth() {
    router.push("/sign-in");
  }

  function handleLike() {
    if (!currentUserId) { requireAuth(); return; }
    // Optimistic update
    setLiked((prev) => !prev);
    setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
    startTransition(async () => {
      try {
        const result = await toggleLike(postId);
        setLiked(result.liked);
        setLikeCount((prev) => result.liked
          ? prev + (initialIsLiked ? 0 : 1)
          : prev - (initialIsLiked ? 1 : 0)
        );
      } catch {
        // Rollback
        setLiked(initialIsLiked);
        setLikeCount(initialLikeCount);
      }
    });
  }

  function handleBookmark() {
    if (!currentUserId) { requireAuth(); return; }
    setBookmarked((prev) => !prev);
    startTransition(async () => {
      try {
        const result = await toggleBookmark(postId);
        setBookmarked(result.bookmarked);
      } catch {
        setBookmarked(initialIsBookmarked);
      }
    });
  }

  function handleCopyLink() {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleShareTwitter() {
    const text = encodeURIComponent(postTitle);
    const url = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank");
  }

  return (
    <div className="flex items-center gap-1">

      {/* Like */}
      <button
        onClick={handleLike}
        disabled={isPending}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-sm transition-colors duration-200 disabled:opacity-60 ${
          liked
            ? "text-red-500"
            : "text-zinc-400 dark:text-zinc-600 hover:text-zinc-900 dark:hover:text-zinc-50"
        }`}
        aria-label={liked ? "Unlike post" : "Like post"}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill={liked ? "currentColor" : "none"}>
          <path
            d="M8 13.5C8 13.5 1.5 9.5 1.5 5.5C1.5 3.57 3.07 2 5 2C6.19 2 7.25 2.61 8 3.5C8.75 2.61 9.81 2 11 2C12.93 2 14.5 3.57 14.5 5.5C14.5 9.5 8 13.5 8 13.5Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span>{likeCount}</span>
      </button>

      {/* Bookmark */}
      <button
        onClick={handleBookmark}
        disabled={isPending}
        className={`p-1.5 transition-colors duration-200 disabled:opacity-60 ${
          bookmarked
            ? "text-zinc-900 dark:text-zinc-50"
            : "text-zinc-400 dark:text-zinc-600 hover:text-zinc-900 dark:hover:text-zinc-50"
        }`}
        aria-label={bookmarked ? "Remove bookmark" : "Bookmark post"}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill={bookmarked ? "currentColor" : "none"}>
          <path
            d="M3 2h10v13l-5-3-5 3V2z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Share on Twitter */}
      <button
        onClick={handleShareTwitter}
        className="p-1.5 text-zinc-400 dark:text-zinc-600 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors duration-200"
        aria-label="Share on Twitter"
      >
        <svg width="15" height="15" viewBox="0 0 15 15" fill="currentColor">
          <path d="M11.56 0h2.3L9.01 6.35 14.73 14H9.72L5.82 9.1 1.37 14H-.93l5.2-6.77L-1.03 0h5.12l3.54 5.47L11.56 0zm-.8 12.58h1.27L4.1 1.3H2.74l7.02 11.28z" />
        </svg>
      </button>

      {/* Copy link */}
      <button
        onClick={handleCopyLink}
        className="p-1.5 text-zinc-400 dark:text-zinc-600 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors duration-200"
        aria-label="Copy link"
      >
        {copied ? (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 8l4 4 8-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6.5 9.5a3.5 3.5 0 005 0l2-2a3.5 3.5 0 00-5-5l-1 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M9.5 6.5a3.5 3.5 0 00-5 0l-2 2a3.5 3.5 0 005 5l1-1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        )}
      </button>

    </div>
  );
}
