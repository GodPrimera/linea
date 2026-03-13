"use client";

import { useState } from "react";
import Link from "next/link";

const faqs = [
  {
    question: "Can I republish or share writing from Linea?",
    answer:
      "You're welcome to share links to any piece on Linea. For republishing full essays, please contact the author directly — most are open to it with proper attribution.",
  },
  {
    question: "How do I become an author on Linea?",
    answer:
      "Submit an application through our Apply page. Tell us about yourself, what you'd write about, and why Linea is the right platform for your work. We review every application carefully.",
  },
  {
    question: "How often do authors publish?",
    answer:
      "There is no schedule requirement on Linea. Authors publish when something is ready — not to satisfy an algorithm or a calendar. Quality over cadence, always.",
  },
  {
    question: "Can I suggest a topic or commission a piece?",
    answer:
      "Use the contact form to reach us. We'll forward relevant requests to the appropriate author, or respond directly if it's a platform-level question.",
  },
  {
    question: "I found a bug or have a feature suggestion.",
    answer:
      "We'd love to hear it. Use the contact form with the subject 'Feedback' and describe what you noticed or what you'd like to see. Every message is read.",
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
          <path d="M1 4l6 6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <p className="pb-5 text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
          {answer}
        </p>
      )}
    </div>
  );
}

export default function ContactClient({
  founderEmail,
  socials,
}: {
  founderEmail: string | null;
  socials: { platform: string; handle: string; href: string; icon: React.ReactNode }[];
}) {
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

          {/* ── LEFT — contact info + form ───────────────────────────── */}
          <div className="space-y-10">

            {/* Direct email */}
            {founderEmail && (
              <div className="space-y-2">
                <p className="text-xs tracking-[0.2em] uppercase text-zinc-400 dark:text-zinc-500">
                  Direct email
                </p>
                <a
                  href={`mailto:${founderEmail}`}
                  className="text-lg font-medium text-zinc-900 dark:text-zinc-50 hover:opacity-60 transition-opacity duration-200 block"
                >
                  {founderEmail}
                </a>
                <p className="text-sm text-zinc-400 dark:text-zinc-600">
                  We read everything. Replies may take a few days.
                </p>
              </div>
            )}

            {/* Social links */}
            {socials.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs tracking-[0.2em] uppercase text-zinc-400 dark:text-zinc-500">
                  Find us online
                </p>
                {socials.map((s) => (
                  <a
                    key={s.platform}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors duration-200 group"
                  >
                    <span className="text-zinc-300 dark:text-zinc-700 group-hover:text-zinc-900 dark:group-hover:text-zinc-50 transition-colors">
                      {s.icon}
                    </span>
                    <span className="text-sm">{s.platform}</span>
                    <span className="text-xs text-zinc-400 dark:text-zinc-600">{s.handle}</span>
                  </a>
                ))}
              </div>
            )}

            {/* Contact form */}
            <div className="space-y-4">
              <p className="text-xs tracking-[0.2em] uppercase text-zinc-400 dark:text-zinc-500">
                Send a message
              </p>

              {status === "sent" ? (
                <div className="py-10 text-center border border-zinc-100 dark:border-zinc-900 space-y-2">
                  <p className="font-display text-2xl font-light text-zinc-900 dark:text-zinc-50">
                    Message sent.
                  </p>
                  <p className="text-sm text-zinc-400 dark:text-zinc-600">
                    Thanks for reaching out — we'll be in touch.
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
                    <label className="text-xs tracking-wide text-zinc-400 dark:text-zinc-600 uppercase" htmlFor="subject">
                      Subject
                    </label>
                    <input
                      id="subject"
                      type="text"
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      placeholder="What's this about?"
                      className="w-full border border-zinc-200 dark:border-zinc-800 bg-transparent px-3 py-2.5 text-sm text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-50 transition-colors"
                    />
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

                  {status === "error" && (
                    <p className="text-sm text-red-500 border border-red-200 dark:border-red-900 px-4 py-3">
                      Something went wrong. Please try again or email us directly.
                    </p>
                  )}

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
                Want to stay in the loop?
              </p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Subscribe to the newsletter and we'll reach you when something new is published — no noise, no schedule, no spam.
              </p>
              <Link
                href="/#newsletter"
                className="inline-flex items-center gap-2 text-sm text-zinc-900 dark:text-zinc-50 hover:opacity-60 transition-opacity duration-200"
              >
                Subscribe
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M1 6h10M6.5 1.5L11 6l-4.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
