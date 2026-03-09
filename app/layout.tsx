import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import ConditionalLayout from "@/components/layout/ConditionalLayout";
import "./globals.css";

// Display font — used for the logo and headings
const cormorant = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap",
});

// Body font — used for all UI text
const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://linea.blog";
const siteDescription = "A space for thoughtful writing. Ideas, perspectives, and stories — written with intention.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Linea",
    template: "%s — Linea",
  },
  description: siteDescription,
  openGraph: {
    title: "Linea",
    description: siteDescription,
    siteName: "Linea",
    type: "website",
    url: siteUrl,
    images: [{ url: "/og-default.png", width: 1200, height: 630, alt: "Linea" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Linea",
    description: siteDescription,
    images: ["/og-default.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  alternates: { canonical: siteUrl },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${cormorant.variable} ${dmSans.variable} font-sans bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 antialiased`}
        >
          {/* Dark mode script — runs before render to prevent flash */}
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function() {
                  try {
                    var stored = localStorage.getItem('linea-theme');
                    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    if (stored === 'dark' || (!stored && prefersDark)) {
                      document.documentElement.classList.add('dark');
                    }
                  } catch(e) {}
                })();
              `,
            }}
          />
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
        </body>
      </html>
    </ClerkProvider>
  );
}
