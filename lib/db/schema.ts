/**
 * Linea Blog — Database Schema
 * ORM: Drizzle ORM
 * Database: Neon (Serverless Postgres)
 *
 * Normalization notes:
 * - All tables satisfy 1NF, 2NF, 3NF, and BCNF.
 * - Three intentional denormalizations exist and are documented inline:
 *   1. posts.reading_time  — derived from content, stored for performance
 *   2. comments.display_name — snapshot of user name, preserved after deletion
 *   3. notifications.title/body — snapshot text, preserved after row deletion
 *
 * Table declaration order is intentional.
 * `media` is declared before `users` to resolve the circular reference
 * between media.uploaded_by (→ users) and users.cover_image_id (→ media).
 * The forward reference on media.uploaded_by uses the (): any => workaround
 * which is the official Drizzle pattern for self/circular references.
 */

import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// ─────────────────────────────────────────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────────────────────────────────────────

export const userRoleEnum = pgEnum("user_role", [
  "reader",  // can read, comment, like, bookmark, follow
  "author",  // can write and publish posts
  "admin",   // full platform management rights
]);

export const postStatusEnum = pgEnum("post_status", [
  "draft",      // only visible to the author
  "scheduled",  // will go live at scheduled_at
  "published",  // live and publicly visible
  "archived",   // hidden from public, kept for records
]);

export const contentFormatEnum = pgEnum("content_format", [
  "markdown",  // raw markdown string
  "html",      // sanitised HTML string
  "richtext",  // JSON from TipTap / ProseMirror
]);

export const notificationTypeEnum = pgEnum("notification_type", [
  "like",          // someone liked your post
  "comment",       // someone commented on your post
  "reply",         // someone replied to your comment
  "follow",        // someone followed you
  "comment_like",  // someone liked your comment
]);

export const reportReasonEnum = pgEnum("report_reason", [
  "spam",
  "offensive",
  "misinformation",
  "other",
]);

export const emailDigestEnum = pgEnum("email_digest_frequency", [
  "never",
  "daily",
  "weekly",
]);

export const redirectTypeEnum = pgEnum("redirect_type", [
  "permanent",  // 301 — Google transfers SEO value
  "temporary",  // 302 — Google keeps old URL indexed
]);

// ─────────────────────────────────────────────────────────────────────────────
// MEDIA
// Declared first to break the circular reference with users.
// users.cover_image_id → media.id
// media.uploaded_by   → users.id (forward reference via (): any =>)
// ─────────────────────────────────────────────────────────────────────────────

export const media = pgTable("media", {
  id: uuid("id").primaryKey().defaultRandom(),

  // Forward reference — users is declared after this table.
  uploadedBy: uuid("uploaded_by").references((): any => users.id, {
    onDelete: "set null",
  }),

  url: text("url").notNull(),

  // Internal storage path (S3 key, R2 key, etc.).
  // Storing this separately means a CDN/domain change only
  // requires a config update, not a database migration.
  storageKey: text("storage_key").notNull(),

  filename: text("filename").notNull(),
  altText: text("alt_text"),

  // Short perceptual hash used to render a blurred placeholder
  // while the real image loads. Generated at upload time.
  blurhash: text("blurhash"),

  mimeType: text("mime_type").notNull(),
  sizeBytes: integer("size_bytes"),
  width: integer("width"),
  height: integer("height"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─────────────────────────────────────────────────────────────────────────────
// USERS
// One table for all account holders — readers, authors, and admins.
// Soft-deleted via deleted_at (null = active account).
// Banned users retain their rows; content is preserved but access is blocked.
// ─────────────────────────────────────────────────────────────────────────────

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    // Provided by Clerk on sign-up. Used to link sessions to DB rows.
    clerkId: text("clerk_id").notNull().unique(),

    role: userRoleEnum("role").default("reader").notNull(),
    name: text("name").notNull(),

    // URL-safe unique handle. Used in profile URLs: /author/azem
    username: text("username").notNull().unique(),

    email: text("email").notNull().unique(),

    // Clerk manages the avatar; this mirrors the Clerk avatar URL.
    avatarUrl: text("avatar_url"),

    // Profile banner image — separate from avatar.
    coverImageId: uuid("cover_image_id").references(() => media.id, {
      onDelete: "set null",
    }),

    bio: text("bio"),
    website: text("website"),
    location: text("location"),

    // Mirrors Clerk verification status. Unverified users cannot
    // comment, like, or interact until confirmed.
    emailVerified: boolean("email_verified").default(false).notNull(),

    // Banned users cannot log in or interact.
    // Separate from soft-delete: a banned user's content stays visible.
    isBanned: boolean("is_banned").default(false).notNull(),
    bannedAt: timestamp("banned_at"),
    banReason: text("ban_reason"),

    // Updated on every authenticated request. Used for
    // "active X hours ago" display and dormant account cleanup.
    lastSeenAt: timestamp("last_seen_at"),

    // Null = active. Set when a user deletes their own account.
    deletedAt: timestamp("deleted_at"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    clerkIdIdx: index("users_clerk_id_idx").on(table.clerkId),
    usernameIdx: index("users_username_idx").on(table.username),
  })
);

// ─────────────────────────────────────────────────────────────────────────────
// USER SOCIAL LINKS
// One row per user, one column per platform.
// Fixed set of known platforms — adding a new one requires a migration,
// which is intentional (prevents arbitrary untrusted URLs).
// ─────────────────────────────────────────────────────────────────────────────

export const userSocialLinks = pgTable("user_social_links", {
  // 1:1 with users. user_id is both the PK and the FK.
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),

  twitter: text("twitter"),
  github: text("github"),
  linkedin: text("linkedin"),
  instagram: text("instagram"),
  youtube: text("youtube"),
});

// ─────────────────────────────────────────────────────────────────────────────
// USER SETTINGS
// 1:1 with users. Created automatically when a user account is created.
// All fields have safe defaults so no user action is required.
// ─────────────────────────────────────────────────────────────────────────────

export const userSettings = pgTable("user_settings", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),

  // Appearance
  theme: text("theme").default("system").notNull(), // "light" | "dark" | "system"
  language: text("language").default("en").notNull(),

  // Privacy
  profileIsPublic: boolean("profile_is_public").default(true).notNull(),
  showLikedPosts: boolean("show_liked_posts").default(true).notNull(),
  showBookmarks: boolean("show_bookmarks").default(false).notNull(),

  // Email notifications — individual toggles
  emailOnComment: boolean("email_on_comment").default(true).notNull(),
  emailOnLike: boolean("email_on_like").default(true).notNull(),
  emailOnFollow: boolean("email_on_follow").default(true).notNull(),
  emailOnReply: boolean("email_on_reply").default(true).notNull(),
  emailOnNewsletter: boolean("email_on_newsletter").default(true).notNull(),

  // How often to receive a digest email summary
  emailDigest: emailDigestEnum("email_digest").default("weekly").notNull(),
});

// ─────────────────────────────────────────────────────────────────────────────
// NEWSLETTER SUBSCRIBERS
// Separate from users — a visitor can subscribe without creating an account.
// user_id links to an account if one exists.
// ─────────────────────────────────────────────────────────────────────────────

export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  id: uuid("id").primaryKey().defaultRandom(),

  // Optional link to a user account.
  userId: uuid("user_id").references(() => users.id, {
    onDelete: "set null",
  }),

  name: text("name"),
  email: text("email").notNull().unique(),

  // Unique secret used in the unsubscribe URL so no login is required.
  // Must be generated with crypto.randomUUID() or equivalent at insert time.
  token: text("token").notNull().unique(),

  // Where the subscription came from (e.g. "homepage", "post_footer", "popup").
  // Critical for understanding which CTAs convert.
  source: text("source"),

  confirmed: boolean("confirmed").default(false).notNull(),
  confirmedAt: timestamp("confirmed_at"),

  // Retained on unsubscribe for GDPR audit trail.
  // The row is never deleted; unsubscribed_at being non-null means inactive.
  unsubscribedAt: timestamp("unsubscribed_at"),

  // Set if the subscriber comes back after unsubscribing.
  resubscribedAt: timestamp("resubscribed_at"),

  // Hashed before storage for privacy compliance.
  ipAddress: text("ip_address"),

  subscribedAt: timestamp("subscribed_at").defaultNow().notNull(),
});

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORIES
// Hierarchical via parent_id self-reference (e.g. Tech → Web → Next.js).
// A post belongs to exactly one category (or none).
// ─────────────────────────────────────────────────────────────────────────────

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),

  // Null = top-level category. Set = subcategory.
  parentId: uuid("parent_id").references((): any => categories.id, {
    onDelete: "set null",
  }),

  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  coverImage: text("cover_image"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─────────────────────────────────────────────────────────────────────────────
// TAGS
// Flat labels. Many tags can apply to one post (via post_tags junction).
// ─────────────────────────────────────────────────────────────────────────────

export const tags = pgTable("tags", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─────────────────────────────────────────────────────────────────────────────
// SERIES
// Groups multiple posts into an ordered series (e.g. "Building Linea: Part 1-5").
// posts.series_id and posts.series_order connect posts to a series.
// ─────────────────────────────────────────────────────────────────────────────

export const series = pgTable("series", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),

  coverImageId: uuid("cover_image_id").references(() => media.id, {
    onDelete: "set null",
  }),

  authorId: uuid("author_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─────────────────────────────────────────────────────────────────────────────
// POSTS
//
// Intentional denormalizations (documented for 3NF compliance):
//   - reading_time: derived from content length. Stored to avoid
//     recalculating on every page load. Must be updated by application
//     logic whenever content is saved.
// ─────────────────────────────────────────────────────────────────────────────

export const posts = pgTable(
  "posts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),

    // URL-safe identifier. e.g. "building-linea-part-1"
    slug: text("slug").notNull().unique(),

    // Short preview shown on post cards and in search results.
    excerpt: text("excerpt").notNull(),

    content: text("content").notNull(),

    // Determines how content is rendered on the frontend.
    contentFormat: contentFormatEnum("content_format")
      .default("markdown")
      .notNull(),

    // References media table so image metadata is always available.
    coverImageId: uuid("cover_image_id").references(() => media.id, {
      onDelete: "set null",
    }),

    // Social sharing preview image (ideal size: 1200×630px).
    // Often different from the cover image shown on the post page.
    ogImageId: uuid("og_image_id").references(() => media.id, {
      onDelete: "set null",
    }),

    status: postStatusEnum("status").default("draft").notNull(),
    isFeatured: boolean("is_featured").default(false).notNull(),
    allowComments: boolean("allow_comments").default(true).notNull(),
    allowLikes: boolean("allow_likes").default(true).notNull(),

    // INTENTIONAL DENORMALIZATION: derived from content word count.
    // Stored for performance. Application must recalculate on every save.
    readingTime: integer("reading_time"),

    // If this post is a cross-post, canonical_url tells Google
    // which site has the original. Prevents duplicate content penalties.
    canonicalUrl: text("canonical_url"),

    language: text("language").default("en").notNull(),

    // Series membership
    seriesId: uuid("series_id").references(() => series.id, {
      onDelete: "set null",
    }),
    // Position within the series. Null if not part of a series.
    seriesOrder: integer("series_order"),

    authorId: uuid("author_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),

    categoryId: uuid("category_id").references(() => categories.id, {
      onDelete: "set null",
    }),

    // SEO overrides. If null, title and excerpt are used as fallbacks.
    metaTitle: text("meta_title"),
    metaDescription: text("meta_description"),

    // scheduled_at: the future datetime to auto-publish.
    // A cron job checks this and flips status to "published".
    scheduledAt: timestamp("scheduled_at"),

    // Set to NOW() when status changes to "published".
    publishedAt: timestamp("published_at"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    slugIdx: index("posts_slug_idx").on(table.slug),
    statusIdx: index("posts_status_idx").on(table.status),
    authorIdx: index("posts_author_id_idx").on(table.authorId),
    publishedIdx: index("posts_published_at_idx").on(table.publishedAt),
    featuredIdx: index("posts_is_featured_idx").on(table.isFeatured),
  })
);

// ─────────────────────────────────────────────────────────────────────────────
// POST AUTHORS (co-authors junction)
// The primary author is stored on posts.author_id.
// Additional co-authors are stored here.
// A co-author appearing in both tables is prevented by application logic.
// ─────────────────────────────────────────────────────────────────────────────

export const postAuthors = pgTable(
  "post_authors",
  {
    postId: uuid("post_id")
      .references(() => posts.id, { onDelete: "cascade" })
      .notNull(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.postId, table.userId] }),
  })
);

// ─────────────────────────────────────────────────────────────────────────────
// POST REVISIONS
// Every save of a post creates a new revision row.
// revision_number is sequential per post and set by application logic.
// Enables full rollback history in the admin dashboard.
// ─────────────────────────────────────────────────────────────────────────────

export const postRevisions = pgTable("post_revisions", {
  id: uuid("id").primaryKey().defaultRandom(),

  postId: uuid("post_id")
    .references(() => posts.id, { onDelete: "cascade" })
    .notNull(),

  // Sequential per post (1, 2, 3…). Set by application at save time.
  revisionNumber: integer("revision_number").notNull(),

  // Full snapshot of the post at this point in time.
  title: text("title").notNull(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),

  savedBy: uuid("saved_by").references(() => users.id, {
    onDelete: "set null",
  }),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─────────────────────────────────────────────────────────────────────────────
// POST TAGS (junction — posts ↔ tags, many-to-many)
// created_at enables "trending tags this week" queries.
// ─────────────────────────────────────────────────────────────────────────────

export const postTags = pgTable(
  "post_tags",
  {
    postId: uuid("post_id")
      .references(() => posts.id, { onDelete: "cascade" })
      .notNull(),
    tagId: uuid("tag_id")
      .references(() => tags.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.postId, table.tagId] }),
  })
);

// ─────────────────────────────────────────────────────────────────────────────
// POST VIEWS
// Each row = one view event. Deduplication is enforced by application logic:
//   - Logged-in users: skip insert if a row exists for (post_id, user_id)
//     within the last 24 hours.
//   - Anonymous users: skip insert if a row exists for (post_id, ip_address)
//     within the last 24 hours.
// ip_address must be hashed before storage (privacy compliance).
// referrer enables "traffic source" analytics.
// user_agent enables bot filtering and device breakdowns.
// ─────────────────────────────────────────────────────────────────────────────

export const postViews = pgTable(
  "post_views",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    postId: uuid("post_id")
      .references(() => posts.id, { onDelete: "cascade" })
      .notNull(),

    // Null for anonymous visitors.
    userId: uuid("user_id").references(() => users.id, {
      onDelete: "set null",
    }),

    // Hashed (SHA-256) before insert. Never store raw IPs.
    ipAddress: text("ip_address"),

    // Where the reader came from. e.g. "https://twitter.com"
    referrer: text("referrer"),

    // Raw user-agent string for bot detection and device analytics.
    userAgent: text("user_agent"),

    viewedAt: timestamp("viewed_at").defaultNow().notNull(),
  },
  (table) => ({
    postIdIdx: index("post_views_post_id_idx").on(table.postId),
    userIdIdx: index("post_views_user_id_idx").on(table.userId),
    viewedAtIdx: index("post_views_viewed_at_idx").on(table.viewedAt),
  })
);

// ─────────────────────────────────────────────────────────────────────────────
// SEO REDIRECTS
// Maps old slugs to new ones when a post is renamed.
// Prevents Google 404s and preserves link equity.
// redirect_type: "permanent" (301) for final renames, "temporary" (302) for
// short-term redirects where the original URL will come back.
// ─────────────────────────────────────────────────────────────────────────────

export const seoRedirects = pgTable("seo_redirects", {
  id: uuid("id").primaryKey().defaultRandom(),
  fromSlug: text("from_slug").notNull().unique(),
  toSlug: text("to_slug").notNull(),
  redirectType: redirectTypeEnum("redirect_type")
    .default("permanent")
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─────────────────────────────────────────────────────────────────────────────
// LIKES (junction — posts ↔ users, many-to-many)
// created_at enables "most liked this week" vs "most liked all time" queries.
// ─────────────────────────────────────────────────────────────────────────────

export const likes = pgTable(
  "likes",
  {
    postId: uuid("post_id")
      .references(() => posts.id, { onDelete: "cascade" })
      .notNull(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.postId, table.userId] }),
  })
);

// ─────────────────────────────────────────────────────────────────────────────
// BOOKMARKS (junction — posts ↔ users, many-to-many)
// collection_name enables folder-style organisation ("Read Later", "Research").
// note allows users to annotate why they saved the post.
// ─────────────────────────────────────────────────────────────────────────────

export const bookmarks = pgTable(
  "bookmarks",
  {
    postId: uuid("post_id")
      .references(() => posts.id, { onDelete: "cascade" })
      .notNull(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    collectionName: text("collection_name"),
    note: text("note"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.postId, table.userId] }),
  })
);

// ─────────────────────────────────────────────────────────────────────────────
// FOLLOWS (junction — users ↔ users, many-to-many)
// A user follows an author to get notified of new posts.
// notify_on_new_post is per-relationship so users can follow quietly.
// CHECK constraint prevents self-follows at the database level.
// ─────────────────────────────────────────────────────────────────────────────

export const follows = pgTable(
  "follows",
  {
    followerId: uuid("follower_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    followingId: uuid("following_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    notifyOnNewPost: boolean("notify_on_new_post").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.followerId, table.followingId] }),
    noSelfFollow: check(
      "follows_no_self_follow",
      sql`${table.followerId} != ${table.followingId}`
    ),
  })
);

// ─────────────────────────────────────────────────────────────────────────────
// USER BLOCKS (junction — users ↔ users, many-to-many)
// A blocked user cannot comment on the blocker's posts,
// like their content, or appear in their notifications.
// CHECK constraint prevents self-blocks at the database level.
// ─────────────────────────────────────────────────────────────────────────────

export const userBlocks = pgTable(
  "user_blocks",
  {
    blockerId: uuid("blocker_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    blockedId: uuid("blocked_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.blockerId, table.blockedId] }),
    noSelfBlock: check(
      "user_blocks_no_self_block",
      sql`${table.blockerId} != ${table.blockedId}`
    ),
  })
);

// ─────────────────────────────────────────────────────────────────────────────
// COMMENTS
//
// Threading: parent_id self-references enable nested replies.
// depth is stored (not computed) to cheaply enforce a max nesting level
// in application logic without traversing the tree on every insert.
//
// Soft delete: deleted_at is set instead of removing the row.
// This preserves reply threads — a deleted parent shows as "[deleted]"
// but its children remain. display_name is checked at render time:
// if deleted_at is set, show "Deleted User" regardless of display_name.
//
// Intentional denormalization:
//   - display_name: snapshot of users.name at comment time.
//     If the user is later deleted (userId → null), the name
//     is still available for audit purposes before deleted_at is set.
//     At render time: if deleted_at is set → show "Deleted User".
//                     if userId is null  → show display_name.
//                     if userId exists   → show users.name (live).
// ─────────────────────────────────────────────────────────────────────────────

export const comments = pgTable(
  "comments",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    postId: uuid("post_id")
      .references(() => posts.id, { onDelete: "cascade" })
      .notNull(),

    // set null on user delete so the comment row and its replies survive.
    userId: uuid("user_id").references(() => users.id, {
      onDelete: "set null",
    }),

    // Self-reference for threaded replies. Null = top-level comment.
    parentId: uuid("parent_id").references((): any => comments.id, {
      onDelete: "cascade",
    }),

    // 0 = top-level, 1 = first reply, 2 = reply to reply, etc.
    // Application must set this on insert: parent.depth + 1.
    // Application should reject inserts where depth > MAX_DEPTH (e.g. 3).
    depth: integer("depth").default(0).notNull(),

    // INTENTIONAL DENORMALIZATION: snapshot of users.name at comment time.
    // See rendering logic above.
    displayName: text("display_name").notNull(),

    content: text("content").notNull(),

    // Set to true by application when content is updated.
    isEdited: boolean("is_edited").default(false).notNull(),

    // Set to NOW() when content is updated (not when approval changes).
    editedAt: timestamp("edited_at"),

    // Pinned comments appear at the top of the thread.
    isPinned: boolean("is_pinned").default(false).notNull(),

    // Soft delete. Null = not deleted. Non-null = deleted.
    deletedAt: timestamp("deleted_at"),

    // Moderation
    approved: boolean("approved").default(false).notNull(),
    approvedBy: uuid("approved_by").references(() => users.id, {
      onDelete: "set null",
    }),
    approvedAt: timestamp("approved_at"),
    rejectionReason: text("rejection_reason"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    postIdIdx: index("comments_post_id_idx").on(table.postId),
    parentIdIdx: index("comments_parent_id_idx").on(table.parentId),
    depthCheck: check(
      "comments_depth_non_negative",
      sql`${table.depth} >= 0`
    ),
  })
);

// ─────────────────────────────────────────────────────────────────────────────
// COMMENT LIKES (junction — comments ↔ users, many-to-many)
// ─────────────────────────────────────────────────────────────────────────────

export const commentLikes = pgTable(
  "comment_likes",
  {
    commentId: uuid("comment_id")
      .references(() => comments.id, { onDelete: "cascade" })
      .notNull(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.commentId, table.userId] }),
  })
);

// ─────────────────────────────────────────────────────────────────────────────
// COMMENT REPORTS
// Users flag comments for moderator review.
// unique_comment_report prevents the same user flooding the report queue.
// resolved_by and resolved_at create a full moderation audit trail.
// ─────────────────────────────────────────────────────────────────────────────

export const commentReports = pgTable(
  "comment_reports",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    commentId: uuid("comment_id")
      .references(() => comments.id, { onDelete: "cascade" })
      .notNull(),

    reportedBy: uuid("reported_by")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),

    reason: reportReasonEnum("reason").notNull(),

    resolved: boolean("resolved").default(false).notNull(),

    resolvedBy: uuid("resolved_by").references(() => users.id, {
      onDelete: "set null",
    }),
    resolvedAt: timestamp("resolved_at"),

    // What action was taken: "removed", "warned", "no_action", etc.
    resolutionNote: text("resolution_note"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    // One report per user per comment.
    uniqueReport: uniqueIndex("unique_comment_report_per_user").on(
      table.commentId,
      table.reportedBy
    ),
  })
);

// ─────────────────────────────────────────────────────────────────────────────
// NOTIFICATIONS
//
// Intentional denormalization:
//   - title and body are pre-built text snapshots stored at creation time.
//     Example: title = "Azem liked your post"
//              body  = "Building Linea: Part 1"
//     This means notifications render correctly even if the triggering post,
//     comment, or user is later deleted. Never compute these at render time.
// ─────────────────────────────────────────────────────────────────────────────

export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    // The user who receives this notification.
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),

    type: notificationTypeEnum("type").notNull(),

    // INTENTIONAL DENORMALIZATION: pre-built display text.
    title: text("title").notNull(),
    body: text("body").notNull(),

    isRead: boolean("is_read").default(false).notNull(),

    // Timestamp of when the user read it. Enables "seen X hours ago".
    readAt: timestamp("read_at"),

    // Whether the user actually clicked through to the content.
    clicked: boolean("clicked").default(false).notNull(),

    // Optional references. set null so the notification survives deletion.
    postId: uuid("post_id").references(() => posts.id, {
      onDelete: "set null",
    }),
    commentId: uuid("comment_id").references(() => comments.id, {
      onDelete: "set null",
    }),

    // The user who triggered the notification (liker, commenter, follower).
    triggeredBy: uuid("triggered_by").references(() => users.id, {
      onDelete: "set null",
    }),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("notifications_user_id_idx").on(table.userId),
    isReadIdx: index("notifications_is_read_idx").on(table.isRead),
  })
);

// ─────────────────────────────────────────────────────────────────────────────
// CONTACT MESSAGES
// Submissions from the contact form.
// replied_at and replied_by track the full support workflow lifecycle.
// ─────────────────────────────────────────────────────────────────────────────

export const contactMessages = pgTable("contact_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),

  // Hashed before storage.
  ipAddress: text("ip_address"),

  isRead: boolean("is_read").default(false).notNull(),

  repliedAt: timestamp("replied_at"),
  repliedBy: uuid("replied_by").references(() => users.id, {
    onDelete: "set null",
  }),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─────────────────────────────────────────────────────────────────────────────
// SEARCH QUERIES
// Logs every search performed on the blog.
// results_count = 0 means the query returned nothing — a direct signal
// of a content gap that should be filled with a new post.
// ─────────────────────────────────────────────────────────────────────────────

export const searchQueries = pgTable("search_queries", {
  id: uuid("id").primaryKey().defaultRandom(),

  // Null for anonymous visitors.
  userId: uuid("user_id").references(() => users.id, {
    onDelete: "set null",
  }),

  query: text("query").notNull(),

  // Stored at query time. Null if not tracked.
  resultsCount: integer("results_count"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─────────────────────────────────────────────────────────────────────────────
// AUDIT LOGS
// Immutable record of every significant admin or system action.
// Rows are never updated or deleted.
// metadata is jsonb so it is queryable (e.g. find all posts where
// old_status was "published"). ip_address enables forensic investigation.
// ─────────────────────────────────────────────────────────────────────────────

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),

  // Null if the acting user was deleted.
  userId: uuid("user_id").references(() => users.id, {
    onDelete: "set null",
  }),

  // Human-readable action name. e.g. "post.published", "user.banned"
  action: text("action").notNull(),

  // The type of entity affected. e.g. "post", "user", "comment"
  entityType: text("entity_type").notNull(),

  // The ID of the affected row.
  entityId: uuid("entity_id"),

  // Structured before/after state. e.g. { old: "draft", new: "published" }
  metadata: jsonb("metadata"),

  // Hashed before storage.
  ipAddress: text("ip_address"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});