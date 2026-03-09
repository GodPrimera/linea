import Link from "next/link";
import NewsletterForm from "../NewsletterForm";

const navigation = {
  explore: [
    { label: "Home", href: "/" },
    { label: "Blog", href: "/blog" },
    { label: "Categories", href: "/categories" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Use", href: "/terms" },
  ],
};

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-zinc-100 dark:border-zinc-900 bg-white dark:bg-zinc-950 mt-24">
      <div className="mx-auto max-w-6xl px-6 py-16">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">

          {/* Brand */}
          <div className="space-y-4">
            <Link
              href="/"
              className="font-display text-xl font-light tracking-[0.15em] text-zinc-900 dark:text-zinc-50 hover:opacity-70 transition-opacity duration-200"
            >
              LINEA
            </Link>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-xs">
              A space for thoughtful writing. Ideas, perspectives, and stories — written with intention.
            </p>
            {/* Newsletter */}
            <div className="pt-2">
              <p className="text-xs tracking-widest uppercase text-zinc-400 dark:text-zinc-500 mb-3">
                Stay updated
              </p>
              <div className="flex gap-0">
                <NewsletterForm />
              </div>
            </div>
          </div>

          {/* Explore */}
          <div className="space-y-4">
            <p className="text-xs tracking-widest uppercase text-zinc-400 dark:text-zinc-500">
              Explore
            </p>
            <ul className="space-y-2.5">
              {navigation.explore.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal + Social */}
          <div className="space-y-4">
            <p className="text-xs tracking-widest uppercase text-zinc-400 dark:text-zinc-500">
              Legal
            </p>
            <ul className="space-y-2.5">
              {navigation.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Social links */}
            <div className="pt-4 space-y-2">
              <p className="text-xs tracking-widest uppercase text-zinc-400 dark:text-zinc-500">
                Follow
              </p>
              <div className="flex gap-4">
                {[
                  {
                    label: "Twitter",
                    href: "https://twitter.com",
                    icon: (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M12.6 0h2.454l-5.36 6.778L16 16h-4.937l-3.867-5.594L2.771 16H.316l5.733-7.25L0 0h5.063l3.495 5.114zm-.86 14.376h1.36L4.323 1.539H2.865z"/>
                      </svg>
                    ),
                  },
                  {
                    label: "GitHub",
                    href: "https://github.com",
                    icon: (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
                      </svg>
                    ),
                  },
                ].map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors duration-200"
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-6 border-t border-zinc-100 dark:border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-zinc-400 dark:text-zinc-600 tracking-wide">
            © {year} Linea. All rights reserved.
          </p>
          <p className="text-xs text-zinc-300 dark:text-zinc-700 tracking-wide">
            Built with Next.js
          </p>
        </div>

      </div>
    </footer>
  );
}
