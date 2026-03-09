"use client";

import { useState } from "react";
import Link from "next/link";

const faqs = [
  {
    question: "Can I republish or share your writing?",
    answer: "You're welcome to share links to anything on Linea. For republishing full pieces, please get in touch first — I'm usually open to it with proper attribution.",
  },
  {
    question: "Do you accept guest posts?",
    answer: "Not at the moment. Linea is intentionally a single-author publication. That might change someday, but for now the voice here is just mine.",
  },
  {
    question: "How often do you publish?",
    answer: "When something is ready — not on a schedule. Subscribe to the newsletter if you want to know when something new is out.",
  },
  {
    question: "Are you available for writing or consulting work?",
    answer: "Occasionally. Use the contact form to tell me about your project and I'll let you know if it's a good fit.",
  },
];

const socialLinks = [
  {
    name: "Twitter",
    handle: "@azem",
    href: "https://twitter.com/azem",
    icon: (
      <svg width="16" height="16" viewBox="0 0 15 15" fill="currentColor">
        <path d="M11.56 0h2.3L9.01 6.35 14.73 14H9.72L5.82 9.1 1.37 14H-.93l5.2-6.77L-1.03 0h5.12l3.54 5.47L11.56 0zm-.8 12.58h1.27L4.1 1.3H2.74l7.02 11.28z"/>
      </svg>
    ),
  },
  {
    name: "GitHub",
    handle: "azem",
    href: "https://github.com/azem",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
      </svg>
    ),
  },
  {
    name: "LinkedIn",
    handle: "Azem Dalipi",
    href: "https://linkedin.com/in/azem",
    icon: (
      <svg width="16" height="16" viewBox="0 0 15 15" fill="currentColor">
        <path d="M1.5 0C.67 0 0 .67 0 1.5v12C0 14.33.67 15 1.5 15h12c.83 0 1.5-.67 1.5-1.5v-12C15 .67 14.33 0 13.5 0h-12zm1.25 5h2V13h-2V5zm1-3.25a1.25 1.25 0 110 2.5 1.25 1.25 0 010-2.5zM6.5 5h1.9v1.1C8.8 5.4 9.7 5 10.75 5 12.6 5 13.5 6 13.5 8.2V13h-2V8.5c0-1.1-.4-1.75-1.3-1.75-.9 0-1.45.65-1.45 1.75V13H6.5V5z"/>
      </svg>
    ),
  },
];

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-zinc-100 dark:border-zinc-900">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start justify-between gap-6 py-5 text-left"
      >
        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50 leading-snug">
          {question}
        </span>
        <svg
          width="14" height="14" viewBox="0 0 14 14" fill="none"
          className={`shrink-0 mt-0.5 text-zinc-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          <path d="M1 4l6 6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {open && (
        <p className="pb-5 text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed animate-in fade-in slide-in-from-top-1 duration-200">
          {answer}
        </p>
      )}
    </div>
  );
}

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    try {
      const { sendContactMessageAction } = await import("@/lib/actions/contact");
      await sendContactMessageAction(form);
      setStatus("sent");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="bg-white dark:bg-zinc-950 min-h-screen">

      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-6xl px-6 pt-16 pb-12 border-b border-zinc-100 dark:border-zinc-900">
        <p className="text-xs tracking-[0.2em] uppercase text-zinc-400 dark:text-zinc-500 mb-4">
          Get in touch
        </p>
        <h1 className="font-display text-5xl md:text-6xl font-light text-zinc-900 dark:text-zinc-50 leading-[1.1]">
          Say hello.
        </h1>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">

          {/* ── LEFT — form + email ───────────────────────────────────── */}
          <div className="space-y-10">

            {/* Direct email */}
            <div className="space-y-2">
              <p className="text-xs tracking-[0.2em] uppercase text-zinc-400 dark:text-zinc-500">
                Direct email
              </p>
              <a
                href="mailto:hello@linea.blog"
                className="text-lg font-medium text-zinc-900 dark:text-zinc-50 hover:opacity-60 transition-opacity duration-200 block"
              >
                hello@linea.blog
              </a>
              <p className="text-sm text-zinc-400 dark:text-zinc-600">
                I read everything. Replies may take a few days.
              </p>
            </div>

            {/* Social */}
            <div className="space-y-3">
              <p className="text-xs tracking-[0.2em] uppercase text-zinc-400 dark:text-zinc-500">
                Find me online
              </p>
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

            {/* Contact form */}
            <div className="space-y-4">
              <p className="text-xs tracking-[0.2em] uppercase text-zinc-400 dark:text-zinc-500">
                Or send a message
              </p>

              {status === "sent" ? (
                <div className="py-10 text-center border border-zinc-100 dark:border-zinc-900 space-y-2">
                  <p className="font-display text-2xl font-light text-zinc-900 dark:text-zinc-50">
                    Message sent.
                  </p>
                  <p className="text-sm text-zinc-400 dark:text-zinc-600">
                    Thanks for reaching out — I'll be in touch.
                  </p>
                  <button
                    onClick={() => setStatus("idle")}
                    className="mt-4 text-sm text-zinc-500 underline underline-offset-2 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
                  >
                    Send another
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs tracking-wide text-zinc-400 dark:text-zinc-600 uppercase" htmlFor="name">
                        Name
                      </label>
                      <input
                        id="name"
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="Your name"
                        className="w-full border border-zinc-200 dark:border-zinc-800 bg-transparent px-3 py-2.5 text-sm text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-50 transition-colors"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs tracking-wide text-zinc-400 dark:text-zinc-600 uppercase" htmlFor="email">
                        Email
                      </label>
                      <input
                        id="email"
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="your@email.com"
                        className="w-full border border-zinc-200 dark:border-zinc-800 bg-transparent px-3 py-2.5 text-sm text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-50 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs tracking-wide text-zinc-400 dark:text-zinc-600 uppercase" htmlFor="message">
                      Message
                    </label>
                    <textarea
                      id="message"
                      required
                      rows={6}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="What's on your mind?"
                      className="w-full border border-zinc-200 dark:border-zinc-800 bg-transparent px-3 py-2.5 text-sm text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-50 transition-colors resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={status === "sending"}
                    className="w-full py-3 text-sm bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-200 disabled:opacity-50 transition-colors duration-200"
                  >
                    {status === "sending" ? "Sending..." : "Send message"}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* ── RIGHT — FAQ ───────────────────────────────────────────── */}
          <div className="space-y-4">
            <p className="text-xs tracking-[0.2em] uppercase text-zinc-400 dark:text-zinc-500 mb-8">
              Frequently asked
            </p>
            <div className="divide-y divide-zinc-100 dark:divide-zinc-900 border-t border-zinc-100 dark:border-zinc-900">
              {faqs.map((faq) => (
                <FAQItem key={faq.question} {...faq} />
              ))}
            </div>

            {/* Newsletter nudge */}
            <div className="pt-8 p-6 border border-zinc-100 dark:border-zinc-900 space-y-3">
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                Not in a rush?
              </p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Subscribe to the newsletter and I'll land in your inbox when something new is published — no noise, no schedule.
              </p>
              <Link
                href="/#newsletter"
                className="inline-flex items-center gap-2 text-sm text-zinc-900 dark:text-zinc-50 hover:opacity-60 transition-opacity duration-200"
              >
                Subscribe
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M1 6h10M6.5 1.5L11 6l-4.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
