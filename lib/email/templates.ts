const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://linea.blog";
const siteName = "Linea";

function base(content: string, previewText: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${previewText}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #fafafa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #18181b; }
    .wrapper { max-width: 560px; margin: 48px auto; padding: 0 16px 64px; }
    .card { background: #fff; border: 1px solid #e4e4e7; padding: 40px; }
    .logo { font-size: 20px; letter-spacing: 0.15em; font-weight: 300; color: #18181b; text-decoration: none; display: block; margin-bottom: 32px; }
    .divider { height: 1px; background: #f4f4f5; margin: 28px 0; }
    .label { font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; color: #a1a1aa; margin-bottom: 12px; }
    .title { font-size: 22px; font-weight: 300; color: #18181b; line-height: 1.4; margin-bottom: 12px; }
    .body { font-size: 15px; color: #52525b; line-height: 1.7; margin-bottom: 24px; }
    .quote { border-left: 2px solid #e4e4e7; padding: 12px 16px; margin: 16px 0 24px; font-size: 15px; color: #71717a; line-height: 1.6; font-style: italic; }
    .btn { display: inline-block; background: #18181b; color: #fff !important; text-decoration: none; padding: 12px 24px; font-size: 13px; letter-spacing: 0.05em; }
    .footer { margin-top: 32px; font-size: 12px; color: #a1a1aa; line-height: 1.6; }
    .footer a { color: #71717a; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <a href="${siteUrl}" class="logo">${siteName.toUpperCase()}</a>
      ${content}
    </div>
    <div class="footer">
      You're receiving this because you have notifications enabled on ${siteName}.<br/>
      <a href="${siteUrl}/settings">Manage notification preferences</a>
    </div>
  </div>
</body>
</html>`;
}

// ── New comment on your post ───────────────────────────────────────────────────
export function newCommentEmail({
  recipientName,
  commenterName,
  postTitle,
  postSlug,
  commentContent,
}: {
  recipientName: string;
  commenterName: string;
  postTitle: string;
  postSlug: string;
  commentContent: string;
}) {
  const postUrl = `${siteUrl}/blog/${postSlug}`;
  return {
    subject: `${commenterName} commented on "${postTitle}"`,
    html: base(
      `
      <p class="label">New Comment</p>
      <p class="title">${commenterName} left a comment on your post</p>
      <p class="body">Hi ${recipientName}, someone commented on <strong>${postTitle}</strong>.</p>
      <div class="quote">${commentContent}</div>
      <a href="${postUrl}#comments" class="btn">View comment</a>
      `,
      `${commenterName} commented on "${postTitle}"`
    ),
  };
}

// ── Reply to your comment ──────────────────────────────────────────────────────
export function newReplyEmail({
  recipientName,
  replierName,
  postTitle,
  postSlug,
  replyContent,
}: {
  recipientName: string;
  replierName: string;
  postTitle: string;
  postSlug: string;
  replyContent: string;
}) {
  const postUrl = `${siteUrl}/blog/${postSlug}`;
  return {
    subject: `${replierName} replied to your comment`,
    html: base(
      `
      <p class="label">New Reply</p>
      <p class="title">${replierName} replied to your comment</p>
      <p class="body">Hi ${recipientName}, you have a new reply on <strong>${postTitle}</strong>.</p>
      <div class="quote">${replyContent}</div>
      <a href="${postUrl}#comments" class="btn">View reply</a>
      `,
      `${replierName} replied to your comment`
    ),
  };
}

// ── New follower ───────────────────────────────────────────────────────────────
export function newFollowerEmail({
  recipientName,
  followerName,
  followerUsername,
}: {
  recipientName: string;
  followerName: string;
  followerUsername: string;
}) {
  const profileUrl = `${siteUrl}/author/${followerUsername}`;
  return {
    subject: `${followerName} is now following you`,
    html: base(
      `
      <p class="label">New Follower</p>
      <p class="title">${followerName} started following you</p>
      <p class="body">Hi ${recipientName}, you have a new follower on ${siteName}.</p>
      <div class="divider"></div>
      <a href="${profileUrl}" class="btn">View their profile</a>
      `,
      `${followerName} is now following you`
    ),
  };
}

// ── Post liked ─────────────────────────────────────────────────────────────────
export function postLikedEmail({
  recipientName,
  likerName,
  postTitle,
  postSlug,
}: {
  recipientName: string;
  likerName: string;
  postTitle: string;
  postSlug: string;
}) {
  const postUrl = `${siteUrl}/blog/${postSlug}`;
  return {
    subject: `${likerName} liked "${postTitle}"`,
    html: base(
      `
      <p class="label">New Like</p>
      <p class="title">${likerName} liked your post</p>
      <p class="body">Hi ${recipientName}, <strong>${likerName}</strong> liked your post <strong>${postTitle}</strong>.</p>
      <div class="divider"></div>
      <a href="${postUrl}" class="btn">View post</a>
      `,
      `${likerName} liked "${postTitle}"`
    ),
  };
}
