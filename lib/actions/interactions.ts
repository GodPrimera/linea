"use server";

import { db } from "@/lib/db";
import { likes, bookmarks, follows, comments, commentLikes, notifications, posts, users, userSettings } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { getCurrentUser } from "@/lib/queries/users";
import { revalidatePath } from "next/cache";
import { sendEmail } from "@/lib/email/send";
import {
  newCommentEmail,
  newReplyEmail,
  newFollowerEmail,
  postLikedEmail,
} from "@/lib/email/templates";

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

async function getPostWithAuthor(postId: string) {
  const rows = await db
    .select({
      id: posts.id,
      title: posts.title,
      slug: posts.slug,
      authorId: posts.authorId,
      authorName: users.name,
      authorEmail: users.email,
      emailOnLike: userSettings.emailOnLike,
      emailOnComment: userSettings.emailOnComment,
    })
    .from(posts)
    .innerJoin(users, eq(users.id, posts.authorId))
    .leftJoin(userSettings, eq(userSettings.userId, posts.authorId))
    .where(eq(posts.id, postId))
    .limit(1);
  return rows[0] ?? null;
}

async function getUserWithPrefs(userId: string) {
  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      username: users.username,
      emailOnFollow: userSettings.emailOnFollow,
      emailOnReply: userSettings.emailOnReply,
    })
    .from(users)
    .leftJoin(userSettings, eq(userSettings.userId, users.id))
    .where(eq(users.id, userId))
    .limit(1);
  return rows[0] ?? null;
}

// ─────────────────────────────────────────────────────────────────────────────
// LIKES
// ─────────────────────────────────────────────────────────────────────────────

export async function toggleLike(postId: string): Promise<{ liked: boolean }> {
  const { userId: clerkId } = await auth();
  if (!clerkId) throw new Error("Not authenticated");

  const user = await getCurrentUser();
  if (!user) throw new Error("User not found");

  const existing = await db
    .select()
    .from(likes)
    .where(and(eq(likes.postId, postId), eq(likes.userId, user.id)))
    .limit(1);

  if (existing.length > 0) {
    await db.delete(likes).where(and(eq(likes.postId, postId), eq(likes.userId, user.id)));
    return { liked: false };
  }

  await db.insert(likes).values({ postId, userId: user.id });
  notifyLike(postId, user).catch(console.error);
  return { liked: true };
}

async function notifyLike(postId: string, liker: { id: string; name: string }) {
  const post = await getPostWithAuthor(postId);
  if (!post || post.authorId === liker.id) return;

  await db.insert(notifications).values({
    userId: post.authorId,
    type: "like",
    title: `${liker.name} liked your post`,
    body: `"${post.title}"`,
    postId,
    triggeredBy: liker.id,
  });

  if (post.emailOnLike && post.authorEmail) {
    const { subject, html } = postLikedEmail({
      recipientName: post.authorName,
      likerName: liker.name,
      postTitle: post.title,
      postSlug: post.slug,
    });
    await sendEmail({ to: post.authorEmail, subject, html });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// BOOKMARKS
// ─────────────────────────────────────────────────────────────────────────────

export async function toggleBookmark(postId: string): Promise<{ bookmarked: boolean }> {
  const { userId: clerkId } = await auth();
  if (!clerkId) throw new Error("Not authenticated");

  const user = await getCurrentUser();
  if (!user) throw new Error("User not found");

  const existing = await db
    .select()
    .from(bookmarks)
    .where(and(eq(bookmarks.postId, postId), eq(bookmarks.userId, user.id)))
    .limit(1);

  if (existing.length > 0) {
    await db.delete(bookmarks).where(and(eq(bookmarks.postId, postId), eq(bookmarks.userId, user.id)));
    return { bookmarked: false };
  }

  await db.insert(bookmarks).values({ postId, userId: user.id });
  return { bookmarked: true };
}

export async function removeBookmark(postId: string): Promise<void> {
  const { userId: clerkId } = await auth();
  if (!clerkId) throw new Error("Not authenticated");

  const user = await getCurrentUser();
  if (!user) throw new Error("User not found");

  await db.delete(bookmarks).where(and(eq(bookmarks.postId, postId), eq(bookmarks.userId, user.id)));
  revalidatePath("/bookmarks");
}

// ─────────────────────────────────────────────────────────────────────────────
// FOLLOWS
// ─────────────────────────────────────────────────────────────────────────────

export async function toggleFollow(followingId: string): Promise<{ following: boolean }> {
  const { userId: clerkId } = await auth();
  if (!clerkId) throw new Error("Not authenticated");

  const user = await getCurrentUser();
  if (!user) throw new Error("User not found");

  if (user.id === followingId) throw new Error("Cannot follow yourself");

  const existing = await db
    .select()
    .from(follows)
    .where(and(eq(follows.followerId, user.id), eq(follows.followingId, followingId)))
    .limit(1);

  if (existing.length > 0) {
    await db.delete(follows).where(and(eq(follows.followerId, user.id), eq(follows.followingId, followingId)));
    return { following: false };
  }

  await db.insert(follows).values({ followerId: user.id, followingId });
  notifyFollow(followingId, user).catch(console.error);
  return { following: true };
}

async function notifyFollow(
  followingId: string,
  follower: { id: string; name: string; username: string }
) {
  const target = await getUserWithPrefs(followingId);
  if (!target) return;

  await db.insert(notifications).values({
    userId: followingId,
    type: "follow",
    title: `${follower.name} started following you`,
    body: `@${follower.username}`,
    triggeredBy: follower.id,
  });

  if (target.emailOnFollow && target.email) {
    const { subject, html } = newFollowerEmail({
      recipientName: target.name,
      followerName: follower.name,
      followerUsername: follower.username,
    });
    await sendEmail({ to: target.email, subject, html });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// COMMENTS
// ─────────────────────────────────────────────────────────────────────────────

export async function createComment(
  postId: string,
  content: string,
  parentId?: string
): Promise<void> {
  const { userId: clerkId } = await auth();
  if (!clerkId) throw new Error("Not authenticated");

  const user = await getCurrentUser();
  if (!user) throw new Error("User not found");

  if (!content.trim()) throw new Error("Comment cannot be empty");

  await db.insert(comments).values({
    postId,
    userId: user.id,
    content: content.trim(),
    parentId: parentId ?? null,
    depth: parentId ? 1 : 0,
    displayName: user.name,
    approved: true,
    approvedAt: new Date(),
  });

  notifyComment(postId, content.trim(), user, parentId).catch(console.error);
  revalidatePath(`/blog`);
}

async function notifyComment(
  postId: string,
  content: string,
  commenter: { id: string; name: string },
  parentId?: string
) {
  const post = await getPostWithAuthor(postId);
  if (!post) return;

  // Notify parent comment author if this is a reply
  if (parentId) {
    const parentRows = await db
      .select({ userId: comments.userId })
      .from(comments)
      .where(eq(comments.id, parentId))
      .limit(1);

    const parent = parentRows[0];
    if (parent && parent.userId !== commenter.id) {
      const parentAuthor = await getUserWithPrefs(parent.userId);
      if (parentAuthor) {
        await db.insert(notifications).values({
          userId: parent.userId,
          type: "reply",
          title: `${commenter.name} replied to your comment`,
          body: content.slice(0, 100),
          postId,
          triggeredBy: commenter.id,
        });

        if (parentAuthor.emailOnReply && parentAuthor.email) {
          const { subject, html } = newReplyEmail({
            recipientName: parentAuthor.name,
            replierName: commenter.name,
            postTitle: post.title,
            postSlug: post.slug,
            replyContent: content.slice(0, 300),
          });
          await sendEmail({ to: parentAuthor.email, subject, html });
        }
      }
    }
  }

  // Notify post author
  if (post.authorId !== commenter.id) {
    await db.insert(notifications).values({
      userId: post.authorId,
      type: "comment",
      title: `${commenter.name} commented on your post`,
      body: content.slice(0, 100),
      postId,
      triggeredBy: commenter.id,
    });

    if (post.emailOnComment && post.authorEmail) {
      const { subject, html } = newCommentEmail({
        recipientName: post.authorName,
        commenterName: commenter.name,
        postTitle: post.title,
        postSlug: post.slug,
        commentContent: content.slice(0, 300),
      });
      await sendEmail({ to: post.authorEmail, subject, html });
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// COMMENT LIKES
// ─────────────────────────────────────────────────────────────────────────────

export async function toggleCommentLike(commentId: string): Promise<{ liked: boolean }> {
  const { userId: clerkId } = await auth();
  if (!clerkId) throw new Error("Not authenticated");

  const user = await getCurrentUser();
  if (!user) throw new Error("User not found");

  const existing = await db
    .select()
    .from(commentLikes)
    .where(and(eq(commentLikes.commentId, commentId), eq(commentLikes.userId, user.id)))
    .limit(1);

  if (existing.length > 0) {
    await db.delete(commentLikes).where(and(eq(commentLikes.commentId, commentId), eq(commentLikes.userId, user.id)));
    return { liked: false };
  }

  await db.insert(commentLikes).values({ commentId, userId: user.id });
  return { liked: true };
}
