import { db } from "@/lib/db";
import { users, userSocialLinks } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import ContactClient from "./_components/ContactClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact — Linea",
  description: "Get in touch with the Linea team.",
};

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

const socialBaseUrls: Record<string, string> = {
  twitter: "https://twitter.com/",
  github: "https://github.com/",
  linkedin: "https://linkedin.com/in/",
  instagram: "https://instagram.com/",
  youtube: "https://youtube.com/@",
};

const socialLabels: Record<string, string> = {
  twitter: "Twitter / X",
  github: "GitHub",
  linkedin: "LinkedIn",
  instagram: "Instagram",
  youtube: "YouTube",
};

async function getFounderContact() {
  const rows = await db
    .select({
      email: users.email,
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

export default async function ContactPage() {
  const founder = await getFounderContact();

  const socials = founder
    ? Object.entries({
        twitter: founder.twitter,
        github: founder.github,
        linkedin: founder.linkedin,
        instagram: founder.instagram,
        youtube: founder.youtube,
      })
        .filter(([, val]) => Boolean(val))
        .map(([platform, handle]) => ({
          platform: socialLabels[platform],
          handle: handle as string,
          href: `${socialBaseUrls[platform]}${handle}`,
          icon: socialIcons[platform],
        }))
    : [];

  return (
    <ContactClient
      founderEmail={founder?.email ?? null}
      socials={socials}
    />
  );
}
