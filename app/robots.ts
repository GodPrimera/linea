import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://linea.blog";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard/",
          "/settings/",
          "/bookmarks/",
          "/notifications/",
          "/api/",
          "/sign-in/",
          "/sign-up/",
          "/onboarding/",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
