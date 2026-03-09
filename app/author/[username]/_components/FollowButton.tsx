"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleFollow } from "@/lib/actions/interactions";

interface FollowButtonProps {
  authorId: string;
  authorName: string;
  initialIsFollowing: boolean;
  currentUserId: string | null;
}

export default function FollowButton({
  authorId,
  authorName,
  initialIsFollowing,
  currentUserId,
}: FollowButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [following, setFollowing] = useState(initialIsFollowing);

  function handleFollow() {
    if (!currentUserId) {
      router.push("/sign-in");
      return;
    }
    setFollowing((prev) => !prev);
    startTransition(async () => {
      try {
        const result = await toggleFollow(authorId);
        setFollowing(result.following);
      } catch {
        setFollowing(initialIsFollowing);
      }
    });
  }

  return (
    <button
      onClick={handleFollow}
      disabled={isPending}
      className={`px-6 py-2 text-sm tracking-wide transition-all duration-200 disabled:opacity-50 ${
        following
          ? "border border-zinc-300 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:border-red-300 hover:text-red-500 dark:hover:border-red-800 dark:hover:text-red-400"
          : "bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-200"
      }`}
    >
      {isPending ? "..." : following ? "Following" : `Follow ${authorName.split(" ")[0]}`}
    </button>
  );
}
