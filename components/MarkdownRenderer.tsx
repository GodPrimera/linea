"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutoLinkHeadings from "rehype-autolink-headings";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight, oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useEffect, useState } from "react";

function useIsDark() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const check = () => setDark(document.documentElement.classList.contains("dark"));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);
  return dark;
}

export default function MarkdownRenderer({ content }: { content: string }) {
  const isDark = useIsDark();

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[
        rehypeSlug,
        [rehypeAutoLinkHeadings, { behavior: "wrap" }],
      ]}
      components={{
        // ── Headings ───────────────────────────────────────────────────────
        h1: ({ children, ...props }) => (
          <h1
            className="font-display text-4xl font-light text-zinc-900 dark:text-zinc-50 mt-14 mb-5 leading-snug scroll-mt-24"
            {...props}
          >
            {children}
          </h1>
        ),
        h2: ({ children, ...props }) => (
          <h2
            className="font-display text-3xl font-light text-zinc-900 dark:text-zinc-50 mt-14 mb-5 leading-snug scroll-mt-24"
            {...props}
          >
            {children}
          </h2>
        ),
        h3: ({ children, ...props }) => (
          <h3
            className="font-display text-2xl font-light text-zinc-900 dark:text-zinc-50 mt-10 mb-4 scroll-mt-24"
            {...props}
          >
            {children}
          </h3>
        ),
        h4: ({ children, ...props }) => (
          <h4
            className="text-xl font-medium text-zinc-900 dark:text-zinc-50 mt-8 mb-3 scroll-mt-24"
            {...props}
          >
            {children}
          </h4>
        ),

        // ── Paragraph ──────────────────────────────────────────────────────
        p: ({ children }) => (
          <p className="text-zinc-600 dark:text-zinc-400 leading-[1.85] text-lg mb-6">
            {children}
          </p>
        ),

        // ── Lists ──────────────────────────────────────────────────────────
        ul: ({ children }) => (
          <ul className="mb-6 ml-6 space-y-1.5 list-disc marker:text-zinc-400 dark:marker:text-zinc-600">
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className="mb-6 ml-6 space-y-1.5 list-decimal marker:text-zinc-400 dark:marker:text-zinc-600">
            {children}
          </ol>
        ),
        li: ({ children }) => (
          <li className="text-zinc-600 dark:text-zinc-400 leading-[1.75] text-lg pl-1">
            {children}
          </li>
        ),

        // ── Blockquote ─────────────────────────────────────────────────────
        blockquote: ({ children }) => (
          <blockquote className="my-8 pl-6 border-l-2 border-zinc-300 dark:border-zinc-700">
            <div className="text-zinc-500 dark:text-zinc-400 italic text-lg leading-relaxed [&>p]:mb-0">
              {children}
            </div>
          </blockquote>
        ),

        // ── Code ───────────────────────────────────────────────────────────
        code({ node, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || "");
          const isBlock = !!match;
          const codeString = String(children).replace(/\n$/, "");

          if (isBlock) {
            return (
              <div className="my-8 rounded-none overflow-hidden border border-zinc-200 dark:border-zinc-800">
                {/* Language label */}
                <div className="flex items-center justify-between px-4 py-2 bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
                  <span className="text-xs tracking-widest uppercase text-zinc-400 dark:text-zinc-600">
                    {match[1]}
                  </span>
                  <CopyButton code={codeString} />
                </div>
                <SyntaxHighlighter
                  style={isDark ? oneDark : oneLight}
                  language={match[1]}
                  PreTag="div"
                  customStyle={{
                    margin: 0,
                    padding: "1.25rem 1rem",
                    background: "transparent",
                    fontSize: "0.875rem",
                    lineHeight: "1.7",
                  }}
                >
                  {codeString}
                </SyntaxHighlighter>
              </div>
            );
          }

          return (
            <code
              className="px-1.5 py-0.5 rounded-sm bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-[0.875em] font-mono"
              {...props}
            >
              {children}
            </code>
          );
        },

        // ── Horizontal rule ────────────────────────────────────────────────
        hr: () => (
          <hr className="my-12 border-none flex items-center justify-center after:content-['···'] after:text-zinc-300 dark:after:text-zinc-700 after:text-2xl after:tracking-[0.5em]" />
        ),

        // ── Links ──────────────────────────────────────────────────────────
        a: ({ href, children }) => (
          <a
            href={href}
            target={href?.startsWith("http") ? "_blank" : undefined}
            rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
            className="text-zinc-900 dark:text-zinc-50 underline underline-offset-2 decoration-zinc-300 dark:decoration-zinc-700 hover:decoration-zinc-900 dark:hover:decoration-zinc-50 transition-colors"
          >
            {children}
          </a>
        ),

        // ── Images ─────────────────────────────────────────────────────────
        img: ({ src, alt }) => (
          <figure className="my-10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={alt ?? ""}
              className="w-full object-cover"
              loading="lazy"
            />
            {alt && (
              <figcaption className="mt-3 text-center text-sm text-zinc-400 dark:text-zinc-600 italic">
                {alt}
              </figcaption>
            )}
          </figure>
        ),

        // ── Tables ─────────────────────────────────────────────────────────
        table: ({ children }) => (
          <div className="my-8 overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              {children}
            </table>
          </div>
        ),
        thead: ({ children }) => (
          <thead className="border-b border-zinc-200 dark:border-zinc-800">
            {children}
          </thead>
        ),
        th: ({ children }) => (
          <th className="px-4 py-2.5 text-left text-xs tracking-widest uppercase text-zinc-500 dark:text-zinc-400 font-medium">
            {children}
          </th>
        ),
        tbody: ({ children }) => (
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
            {children}
          </tbody>
        ),
        td: ({ children }) => (
          <td className="px-4 py-2.5 text-zinc-600 dark:text-zinc-400">
            {children}
          </td>
        ),

        // ── Inline formatting ──────────────────────────────────────────────
        strong: ({ children }) => (
          <strong className="font-semibold text-zinc-900 dark:text-zinc-50">
            {children}
          </strong>
        ),
        em: ({ children }) => (
          <em className="italic text-zinc-700 dark:text-zinc-300">{children}</em>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

// ── Copy button for code blocks ────────────────────────────────────────────────
function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <button
      onClick={handleCopy}
      className="text-xs text-zinc-400 dark:text-zinc-600 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}
