"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createComment, toggleCommentLike } from "@/lib/actions/interactions";
import type { Comment } from "@/lib/queries/comments";

interface CurrentUser {
  id: string;
  name: string;
  avatarUrl: string | null;
}

interface CommentsSectionProps {
  postId: string;
  initialComments: Comment[];
  currentUser: CurrentUser | null;
}

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function CommentItem({
  comment,
  postId,
  currentUser,
  depth = 0,
}: {
  comment: Comment;
  postId: string;
  currentUser: CurrentUser | null;
  depth?: number;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(comment.likeCount);
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replyError, setReplyError] = useState("");

  function handleLike() {
    if (!currentUser) { router.push("/sign-in"); return; }
    setLiked((prev) => !prev);
    setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
    startTransition(async () => {
      try {
        await toggleCommentLike(comment.id);
      } catch {
        setLiked((prev) => !prev);
        setLikeCount((prev) => (liked ? prev + 1 : prev - 1));
      }
    });
  }

  async function handleReplySubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!replyText.trim() || !currentUser) return;
    setReplyError("");
    startTransition(async () => {
      try {
        await createComment(postId, replyText.trim(), comment.id);
        setReplyText("");
        setShowReply(false);
        router.refresh();
      } catch {
        setReplyError("Failed to post reply. Please try again.");
      }
    });
  }

  return (
    <div className={depth > 0 ? "ml-10 mt-4" : ""}>
      <div className="flex gap-3">
        <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden shrink-0 mt-0.5">
          {comment.author?.avatarUrl ? (
            <Image
              src={comment.author.avatarUrl}
              alt={comment.author.name}
              width={32}
              height={32}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs text-zinc-500">
              {comment.author?.name?.[0] ?? "?"}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 mb-1.5">
            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
              {comment.author?.name ?? "Anonymous"}
            </span>
            <span className="text-xs text-zinc-400 dark:text-zinc-600">
              {timeAgo(comment.createdAt)}
            </span>
          </div>

          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            {comment.content}
          </p>

          <div className="flex items-center gap-4 mt-2">
            <button
              onClick={handleLike}
              disabled={isPending}
              className={`flex items-center gap-1 text-xs transition-colors ${
                liked
                  ? "text-red-500"
                  : "text-zinc-400 dark:text-zinc-600 hover:text-zinc-700 dark:hover:text-zinc-400"
              }`}
            >
              <svg width="12" height="12" viewBox="0 0 16 16" fill={liked ? "currentColor" : "none"}>
                <path d="M8 13.5C8 13.5 1.5 9.5 1.5 5.5C1.5 3.57 3.07 2 5 2C6.19 2 7.25 2.61 8 3.5C8.75 2.61 9.81 2 11 2C12.93 2 14.5 3.57 14.5 5.5C14.5 9.5 8 13.5 8 13.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {likeCount}
            </button>

            {depth < 2 && (
              <button
                onClick={() => setShowReply(!showReply)}
                className="text-xs text-zinc-400 dark:text-zinc-600 hover:text-zinc-700 dark:hover:text-zinc-400 transition-colors"
              >
                Reply
              </button>
            )}
          </div>

          {showReply && (
            <form onSubmit={handleReplySubmit} className="mt-3 flex gap-2">
              {!currentUser ? (
                <p className="text-xs text-zinc-400">
                  <a href="/sign-in" className="underline underline-offset-2">Sign in</a> to reply
                </p>
              ) : (
                <>
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write a reply..."
                    className="flex-1 border-b border-zinc-200 dark:border-zinc-800 bg-transparent pb-1 text-sm text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-50 transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={!replyText.trim() || isPending}
                    className="text-xs px-3 py-1 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 hover:opacity-80 disabled:opacity-40 transition-opacity"
                  >
                    Reply
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowReply(false); setReplyText(""); }}
                    className="text-xs text-zinc-400 hover:text-zinc-600 transition-colors"
                  >
                    Cancel
                  </button>
                </>
              )}
            </form>
          )}
          {replyError && (
            <p className="text-xs text-red-500 mt-1">{replyError}</p>
          )}
        </div>
      </div>

      {comment.replies.map((reply) => (
        <CommentItem
          key={reply.id}
          comment={reply}
          postId={postId}
          currentUser={currentUser}
          depth={depth + 1}
        />
      ))}
    </div>
  );
}

export default function CommentsSection({
  postId,
  initialComments,
  currentUser,
}: CommentsSectionProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [commentText, setCommentText] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!commentText.trim() || !currentUser) return;
    setError("");
    startTransition(async () => {
      try {
        await createComment(postId, commentText.trim());
        setCommentText("");
        router.refresh();
      } catch {
        setError("Failed to post comment. Please try again.");
      }
    });
  }

  const totalCount = initialComments.reduce(
    (acc, c) => acc + 1 + c.replies.length,
    0
  );

  return (
    <div className="space-y-10">

      <div className="flex items-center justify-between">
        <p className="text-xs tracking-[0.2em] uppercase text-zinc-400 dark:text-zinc-500">
          Comments
        </p>
        <span className="text-sm text-zinc-400 dark:text-zinc-600">
          {totalCount} {totalCount === 1 ? "comment" : "comments"}
        </span>
      </div>

      {/* Comment form */}
      {currentUser ? (
        <form onSubmit={handleSubmit} className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden shrink-0 mt-1">
            {currentUser.avatarUrl && (
              <Image
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                width={32}
                height={32}
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <div className="flex-1 space-y-3">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Share your thoughts..."
              rows={3}
              className="w-full border-b border-zinc-200 dark:border-zinc-800 bg-transparent pt-1 pb-2 text-sm text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-50 transition-colors resize-none"
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!commentText.trim() || isPending}
                className="px-4 py-1.5 text-sm bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 hover:opacity-80 disabled:opacity-40 transition-opacity"
              >
                {isPending ? "Posting..." : "Post comment"}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="py-6 text-center border border-zinc-100 dark:border-zinc-900">
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-3">
            Sign in to join the conversation
          </p>
          <a
            href="/sign-in"
            className="text-sm px-4 py-2 border border-zinc-900 dark:border-zinc-50 text-zinc-900 dark:text-zinc-50 hover:bg-zinc-900 hover:text-white dark:hover:bg-zinc-50 dark:hover:text-zinc-900 transition-all duration-200"
          >
            Sign in
          </a>
        </div>
      )}

      {/* Comments list */}
      {initialComments.length > 0 ? (
        <div className="space-y-8 divide-y divide-zinc-100 dark:divide-zinc-900">
          {initialComments.map((c) => (
            <div key={c.id} className="pt-8 first:pt-0">
              <CommentItem comment={c} postId={postId} currentUser={currentUser} />
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-zinc-400 dark:text-zinc-600 py-6 text-center">
          No comments yet. Be the first to share your thoughts.
        </p>
      )}

    </div>
  );
}
