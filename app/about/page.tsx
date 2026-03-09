import Image from "next/image";
import Link from "next/link";

const timeline = [
  {
    year: "2024",
    title: "Started Linea",
    description: "After years of writing in private notebooks, I decided to publish deliberately — one essay at a time.",
  },
  {
    year: "2023",
    title: "Left corporate work",
    description: "Stepped away from a full-time role to focus on building and writing. The scariest and best decision I've made.",
  },
  {
    year: "2021",
    title: "First public writing",
    description: "Published a short thread about craft that reached more people than I expected. That response changed something.",
  },
  {
    year: "2018",
    title: "Started writing seriously",
    description: "Kept a daily writing habit for the first time. Most of it was terrible. Some of it was the seed of something real.",
  },
];

const pressFeatures = [
  { name: "Hacker News", description: "Front page — 'The Quiet Power of Deliberate Writing'", href: "#" },
  { name: "Sidebar.io", description: "Featured in weekly design & dev digest", href: "#" },
  { name: "Dense Discovery", description: "Recommended in Issue #201", href: "#" },
];

const socialLinks = [
  {
    name: "Twitter",
    handle: "@azem",
    href: "https://twitter.com/azem",
    icon: (
      <svg width="18" height="18" viewBox="0 0 15 15" fill="currentColor">
        <path d="M11.56 0h2.3L9.01 6.35 14.73 14H9.72L5.82 9.1 1.37 14H-.93l5.2-6.77L-1.03 0h5.12l3.54 5.47L11.56 0zm-.8 12.58h1.27L4.1 1.3H2.74l7.02 11.28z"/>
      </svg>
    ),
  },
  {
    name: "GitHub",
    handle: "azem",
    href: "https://github.com/azem",
    icon: (
      <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
      </svg>
    ),
  },
  {
    name: "LinkedIn",
    handle: "Azem Dalipi",
    href: "https://linkedin.com/in/azem",
    icon: (
      <svg width="18" height="18" viewBox="0 0 15 15" fill="currentColor">
        <path d="M1.5 0C.67 0 0 .67 0 1.5v12C0 14.33.67 15 1.5 15h12c.83 0 1.5-.67 1.5-1.5v-12C15 .67 14.33 0 13.5 0h-12zm1.25 5h2V13h-2V5zm1-3.25a1.25 1.25 0 110 2.5 1.25 1.25 0 010-2.5zM6.5 5h1.9v1.1C8.8 5.4 9.7 5 10.75 5 12.6 5 13.5 6 13.5 8.2V13h-2V8.5c0-1.1-.4-1.75-1.3-1.75-.9 0-1.45.65-1.45 1.75V13H6.5V5z"/>
      </svg>
    ),
  },
];

export default function AboutPage() {
  return (
    <div className="bg-white dark:bg-zinc-950 min-h-screen">

      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-6xl px-6 pt-16 pb-12 border-b border-zinc-100 dark:border-zinc-900">
        <p className="text-xs tracking-[0.2em] uppercase text-zinc-400 dark:text-zinc-500 mb-4">
          About
        </p>
        <h1 className="font-display text-5xl md:text-6xl font-light text-zinc-900 dark:text-zinc-50 leading-[1.1]">
          The person
          <br />
          <span className="italic">behind the words.</span>
        </h1>
      </div>

      {/* ── INTRO + PHOTO ────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-6xl px-6 py-16 border-b border-zinc-100 dark:border-zinc-900">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">

          {/* Photo */}
          <div className="relative aspect-[4/5] overflow-hidden bg-zinc-100 dark:bg-zinc-900">
            <Image
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80"
              alt="Azem Dalipi"
              fill
              className="object-cover"
            />
          </div>

          {/* Intro */}
          <div className="space-y-6 lg:pt-4">
            <p className="text-xs tracking-[0.2em] uppercase text-zinc-400 dark:text-zinc-500">
              Hello, I'm Azem
            </p>
            <div className="space-y-5 text-zinc-600 dark:text-zinc-400 leading-[1.85] text-lg">
              <p>
                I'm a writer and builder based in Bamenda, Cameroon. I started Linea because I wanted a place to think out loud — slowly, carefully, without the pressure of an algorithmic feed demanding constant output.
              </p>
              <p>
                My background is in software and design, but writing has always been where I do my clearest thinking. This blog is the intersection of those two worlds: the craft of expression and the craft of building things that work.
              </p>
              <p>
                I write about writing, process, minimalism, and the web. I publish infrequently and intentionally. If something is here, it's because I believed it was worth the space.
              </p>
            </div>

            {/* Social links */}
            <div className="pt-4 space-y-3">
              {socialLinks.map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors duration-200 group"
                >
                  <span className="text-zinc-300 dark:text-zinc-700 group-hover:text-zinc-900 dark:group-hover:text-zinc-50 transition-colors">
                    {s.icon}
                  </span>
                  <span className="text-sm">{s.name}</span>
                  <span className="text-xs text-zinc-400 dark:text-zinc-600">{s.handle}</span>
                </a>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* ── PHILOSOPHY ───────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-6xl px-6 py-16 border-b border-zinc-100 dark:border-zinc-900">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <p className="text-xs tracking-[0.2em] uppercase text-zinc-400 dark:text-zinc-500">
            Philosophy
          </p>
          <blockquote className="font-display text-3xl md:text-4xl font-light text-zinc-900 dark:text-zinc-50 leading-snug">
            "Write slowly. Publish when it's ready. Let the work speak for itself."
          </blockquote>
          <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed text-base">
            Linea exists as a counterpoint to the velocity of the internet. Every piece here has been written, rewritten, and sat with before it was published. I'd rather publish ten essays worth reading than a hundred that aren't.
          </p>
        </div>
      </div>

      {/* ── TIMELINE ─────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-6xl px-6 py-16 border-b border-zinc-100 dark:border-zinc-900">
        <p className="text-xs tracking-[0.2em] uppercase text-zinc-400 dark:text-zinc-500 mb-12">
          Timeline
        </p>
        <div className="max-w-2xl space-y-0 divide-y divide-zinc-100 dark:divide-zinc-900">
          {timeline.map((item) => (
            <div key={item.year} className="grid grid-cols-[80px_1fr] gap-8 py-8">
              <p className="font-display text-2xl font-light text-zinc-300 dark:text-zinc-700 pt-0.5">
                {item.year}
              </p>
              <div className="space-y-1.5">
                <h3 className="text-base font-medium text-zinc-900 dark:text-zinc-50">
                  {item.title}
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── PRESS ────────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-6xl px-6 py-16 border-b border-zinc-100 dark:border-zinc-900">
        <p className="text-xs tracking-[0.2em] uppercase text-zinc-400 dark:text-zinc-500 mb-10">
          Featured in
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {pressFeatures.map((item) => (
            <a
              key={item.name}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group block p-6 border border-zinc-100 dark:border-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors duration-200 space-y-2"
            >
              <h3 className="text-base font-medium text-zinc-900 dark:text-zinc-50 group-hover:opacity-60 transition-opacity duration-200">
                {item.name}
              </h3>
              <p className="text-sm text-zinc-400 dark:text-zinc-600 leading-relaxed">
                {item.description}
              </p>
              <div className="flex items-center gap-1.5 text-xs text-zinc-400 dark:text-zinc-600 group-hover:text-zinc-900 dark:group-hover:text-zinc-50 transition-colors pt-1">
                View
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M1 9L9 1M9 1H3M9 1v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </a>
          ))}
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
              I read every message, even if replies take a while.
            </p>
          </div>
          <Link
            href="/contact"
            className="px-6 py-2.5 text-sm bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors duration-200 whitespace-nowrap"
          >
            Contact me
          </Link>
        </div>
      </div>

    </div>
  );
}
