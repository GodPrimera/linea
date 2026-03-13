import Link from "next/link";
import { db } from "@/lib/db";
import { users, userSocialLinks, posts } from "@/lib/db/schema";
import { eq, isNull, sql } from "drizzle-orm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — Linea",
  description: "Linea is a platform for writing that matters. Thoughtful essays, deep ideas, and deliberate publishing.",
};

async function getFounder() {
  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      username: users.username,
      bio: users.bio,
      avatarUrl: users.avatarUrl,
      twitter: userSocialLinks.twitter,
      github: userSocialLinks.github,
      linkedin: userSocialLinks.linkedin,
      instagram: userSocialLinks.instagram,
      youtube: userSocialLinks.youtube,
    })
    .from(users)
    .leftJoin(userSocialLinks, eq(userSocialLinks.userId, users.id))
    .where(eq(users.role, "admin"))
    .limit(1);

  return rows[0] ?? null;
}

async function getPlatformStats() {
  const [[authorCount], [postCount]] = await Promise.all([
    db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(users)
      .where(eq(users.role, "author")),
    db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(posts)
      .where(eq(posts.status, "published")),
  ]);
  return { authors: authorCount.count, posts: postCount.count };
}

const socialIcons: Record<string, React.ReactNode> = {
  twitter: (
    <svg width="16" height="16" viewBox="0 0 15 15" fill="currentColor">
      <path d="M11.56 0h2.3L9.01 6.35 14.73 14H9.72L5.82 9.1 1.37 14H-.93l5.2-6.77L-1.03 0h5.12l3.54 5.47L11.56 0zm-.8 12.58h1.27L4.1 1.3H2.74l7.02 11.28z" />
    </svg>
  ),
  github: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  ),
  linkedin: (
    <svg width="16" height="16" viewBox="0 0 15 15" fill="currentColor">
      <path d="M1.5 0C.67 0 0 .67 0 1.5v12C0 14.33.67 15 1.5 15h12c.83 0 1.5-.67 1.5-1.5v-12C15 .67 14.33 0 13.5 0h-12zm1.25 5h2V13h-2V5zm1-3.25a1.25 1.25 0 110 2.5 1.25 1.25 0 010-2.5zM6.5 5h1.9v1.1C8.8 5.4 9.7 5 10.75 5 12.6 5 13.5 6 13.5 8.2V13h-2V8.5c0-1.1-.4-1.75-1.3-1.75-.9 0-1.45.65-1.45 1.75V13H6.5V5z" />
    </svg>
  ),
  instagram: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
    </svg>
  ),
  youtube: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M23 7s-.3-2-1.2-2.8c-1.1-1.2-2.4-1.2-3-1.3C16.5 2.8 12 2.8 12 2.8s-4.5 0-6.8.2c-.6.1-1.9.1-3 1.3C1.3 5 1 7 1 7S.8 9.3.8 11.5v2.1C.8 15.8 1 18 1 18s.3 2 1.2 2.8c1.1 1.2 2.6 1.1 3.3 1.2C7.6 22.2 12 22.2 12 22.2s4.5 0 6.8-.3c.6-.1 1.9-.1 3-1.3.9-.8 1.2-2.8 1.2-2.8s.2-2.3.2-4.6v-2.1C23.2 9.3 23 7 23 7zM9.7 15.5V8.4l8.1 3.6-8.1 3.5z" />
    </svg>
  ),
};

const socialLabels: Record<string, string> = {
  twitter: "Twitter / X",
  github: "GitHub",
  linkedin: "LinkedIn",
  instagram: "Instagram",
  youtube: "YouTube",
};

const socialBaseUrls: Record<string, string> = {
  twitter: "https://twitter.com/",
  github: "https://github.com/",
  linkedin: "https://linkedin.com/in/",
  instagram: "https://instagram.com/",
  youtube: "https://youtube.com/@",
};

const values = [
  {
    label: "Depth over volume",
    description:
      "We believe one essay written with care is worth more than a hundred written in haste. Linea is not built for content — it is built for thought.",
  },
  {
    label: "Writing as thinking",
    description:
      "The act of writing is not the recording of ideas already formed. It is the process through which ideas become clear. We build for that process.",
  },
  {
    label: "A home for ideas",
    description:
      "Every piece published on Linea is a permanent artifact. We do not chase trends or optimise for engagement. We build a library, not a feed.",
  },
  {
    label: "The writer first",
    description:
      "Every decision we make — in design, in features, in policy — is filtered through one question: does this serve the writer? If it doesn't, we don't build it.",
  },
];

export default async function AboutPage() {
  const [founder, stats] = await Promise.all([getFounder(), getPlatformStats()]);

  const founderSocials = founder
    ? Object.entries({
        twitter: founder.twitter,
        github: founder.github,
        linkedin: founder.linkedin,
        instagram: founder.instagram,
        youtube: founder.youtube,
      }).filter(([, val]) => Boolean(val))
    : [];

  return (
    <div className="bg-white dark:bg-zinc-950 min-h-screen">

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-6xl px-6 pt-16 pb-16 border-b border-zinc-100 dark:border-zinc-900">
        <p className="text-xs tracking-[0.2em] uppercase text-zinc-400 dark:text-zinc-500 mb-6">
          About Linea
        </p>
        <h1 className="font-display text-5xl md:text-6xl font-light text-zinc-900 dark:text-zinc-50 leading-[1.1] max-w-3xl">
          A platform built for
          <br />
          <span className="italic">writing that endures.</span>
        </h1>
        <p className="mt-8 text-lg text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-2xl">
          Linea is a home for writers who believe that the best ideas deserve more than a passing scroll.
          We exist to slow the internet down — one carefully written essay at a time.
        </p>
      </div>

      {/* ── STATS ────────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-6xl px-6 py-12 border-b border-zinc-100 dark:border-zinc-900">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: stats.authors, label: "Authors" },
            { value: stats.posts, label: "Essays published" },
            { value: "∞", label: "Ideas worth exploring" },
            { value: "1", label: "Standard: excellence" },
          ].map((stat) => (
            <div key={stat.label} className="space-y-1">
              <p className="font-display text-4xl font-light text-zinc-900 dark:text-zinc-50">
                {stat.value}
              </p>
              <p className="text-xs tracking-wide text-zinc-400 dark:text-zinc-600 uppercase">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── MISSION ──────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-6xl px-6 py-16 border-b border-zinc-100 dark:border-zinc-900">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div>
            <p className="text-xs tracking-[0.2em] uppercase text-zinc-400 dark:text-zinc-500 mb-6">
              Our mission
            </p>
            <div className="space-y-5 text-zinc-600 dark:text-zinc-400 leading-[1.9] text-base">
              <p>
                The internet has never made it easier to publish. It has also never made it harder to be heard. In a world where everything is content and attention is currency, Linea takes a different position entirely.
              </p>
              <p>
                We are not a social network. We are not a content farm. We are not optimised for virality, for daily publishing schedules, or for algorithmic approval. Linea is a platform for writers who have something to say and the patience to say it well.
              </p>
              <p>
                The name means <em>line</em> — the most fundamental unit of writing. A single line, if it carries enough weight, can change how a person sees the world. That is what we are building toward.
              </p>
            </div>
          </div>
          <div className="space-y-px">
            {values.map((v) => (
              <div
                key={v.label}
                className="p-6 border border-zinc-100 dark:border-zinc-900 hover:border-zinc-200 dark:hover:border-zinc-800 transition-colors space-y-2"
              >
                <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  {v.label}
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  {v.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── PHILOSOPHY QUOTE ─────────────────────────────────────────────── */}
      <div className="mx-auto max-w-6xl px-6 py-20 border-b border-zinc-100 dark:border-zinc-900">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <blockquote className="font-display text-3xl md:text-4xl font-light text-zinc-900 dark:text-zinc-50 leading-snug">
            "The page is not a stage. It is a place where thought becomes permanent."
          </blockquote>
          <p className="text-sm text-zinc-400 dark:text-zinc-600 tracking-widest uppercase">
            The Linea Manifesto
          </p>
        </div>
      </div>

      {/* ── FOUNDER ──────────────────────────────────────────────────────── */}
      {founder && (
        <div className="mx-auto max-w-6xl px-6 py-16 border-b border-zinc-100 dark:border-zinc-900">
          <p className="text-xs tracking-[0.2em] uppercase text-zinc-400 dark:text-zinc-500 mb-10">
            Founded by
          </p>
          <div className="flex items-start gap-8 max-w-2xl">
            {/* Avatar */}
            {founder.avatarUrl ? (
              <img
                src={founder.avatarUrl}
                alt={founder.name}
                className="w-16 h-16 rounded-full object-cover shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center shrink-0 text-xl font-light text-zinc-400">
                {founder.name[0]}
              </div>
            )}
            <div className="space-y-3">
              <div>
                <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
                  {founder.name}
                </h3>
                <p className="text-sm text-zinc-400 dark:text-zinc-600">@{founder.username}</p>
              </div>
              {founder.bio && (
                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  {founder.bio}
                </p>
              )}
              {founderSocials.length > 0 && (
                <div className="flex items-center gap-4 pt-1">
                  {founderSocials.map(([platform, handle]) => (
                    <a
                      key={platform}
                      href={`${socialBaseUrls[platform]}${handle}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={`${socialLabels[platform]}: ${handle}`}
                      className="text-zinc-400 dark:text-zinc-600 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
                    >
                      {socialIcons[platform]}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── WRITE FOR US ─────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-6xl px-6 py-16 border-b border-zinc-100 dark:border-zinc-900">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-4">
            <p className="text-xs tracking-[0.2em] uppercase text-zinc-400 dark:text-zinc-500">
              Write for Linea
            </p>
            <h2 className="font-display text-3xl font-light text-zinc-900 dark:text-zinc-50 leading-snug">
              Have something worth saying?
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed text-sm">
              We accept applications from writers who are serious about their craft. We don't care about your follower count. We care about whether your ideas have weight.
            </p>
            <Link
              href="/apply"
              className="inline-block mt-2 px-6 py-3 text-sm bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors"
            >
              Apply to become an author
            </Link>
          </div>
          <div className="space-y-4 text-sm text-zinc-500 dark:text-zinc-400">
            {[
              "Your own author profile and archive",
              "Full control over your publishing schedule",
              "A reader base that actually reads",
              "No algorithm, no pressure, no noise",
            ].map((item) => (
              <div key={item} className="flex items-start gap-3">
                <span className="text-zinc-300 dark:text-zinc-700 mt-0.5">—</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <p className="text-base font-medium text-zinc-900 dark:text-zinc-50">
              Want to get in touch?
            </p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              We read every message, even if replies take a while.
            </p>
          </div>
          <Link
            href="/contact"
            className="px-6 py-2.5 text-sm bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors whitespace-nowrap"
          >
            Contact us
          </Link>
        </div>
      </div>

    </div>
  );
}
