"use client";

import { useEffect, useState } from "react";

interface Heading {
  level: number;
  text: string;
  id: string;
}

export default function TableOfContents({ headings }: { headings: Heading[] }) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-80px 0px -60% 0px",
        threshold: 0,
      }
    );

    headings.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  return (
    <nav aria-label="Table of contents">
      <p className="text-xs tracking-[0.2em] uppercase text-zinc-400 dark:text-zinc-500 mb-4">
        Contents
      </p>
      <ul className="space-y-2">
        {headings.map(({ id, text, level }) => (
          <li key={id}>
            <a
              href={`#${id}`}
              className={`block text-sm leading-snug transition-colors duration-200 ${
                level === 3 ? "pl-3" : ""
              } ${
                activeId === id
                  ? "text-zinc-900 dark:text-zinc-50"
                  : "text-zinc-400 dark:text-zinc-600 hover:text-zinc-700 dark:hover:text-zinc-300"
              }`}
            >
              {text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
