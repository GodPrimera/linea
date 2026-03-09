"use client";

import { useState, useEffect, useTransition } from "react";
import { updateThemeAction } from "@/lib/actions/profile";

type Theme = "light" | "dark" | "system";

export default function AppearanceSettings({
  initialTheme = "system",
}: {
  initialTheme?: Theme;
}) {
  const [theme, setTheme] = useState<Theme>(initialTheme);
  const [fontSize, setFontSize] = useState("base");
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  // On mount, read localStorage as the live source of truth
  useEffect(() => {
    const stored = localStorage.getItem("linea-theme") as Theme | null;
    if (stored === "dark" || stored === "light") {
      setTheme(stored);
    } else {
      setTheme("system");
    }
  }, []);

  function applyThemeToDom(t: Theme) {
    if (t === "dark") {
      document.documentElement.classList.add("dark");
      localStorage.setItem("linea-theme", "dark");
    } else if (t === "light") {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("linea-theme", "light");
    } else {
      localStorage.removeItem("linea-theme");
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      document.documentElement.classList.toggle("dark", prefersDark);
    }
  }

  function handleThemeChange(t: Theme) {
    setTheme(t);
    applyThemeToDom(t);
    startTransition(async () => {
      await updateThemeAction(t);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  const themes: { value: Theme; label: string; description: string; preview: string }[] = [
    { value: "light", label: "Light", description: "Clean white background", preview: "bg-white border-zinc-200" },
    { value: "dark", label: "Dark", description: "Dark zinc background", preview: "bg-zinc-950 border-zinc-700" },
    { value: "system", label: "System", description: "Follows your OS setting", preview: "bg-gradient-to-br from-white to-zinc-950 border-zinc-400" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-base font-medium text-zinc-900 dark:text-zinc-50 mb-1">
          Appearance
        </h2>
        <p className="text-sm text-zinc-400 dark:text-zinc-600">
          Customise how Linea looks for you.
        </p>
      </div>

      {/* Theme */}
      <div className="space-y-4 pb-8 border-b border-zinc-100 dark:border-zinc-900">
        <p className="text-xs tracking-widest uppercase text-zinc-400 dark:text-zinc-600">
          Theme
        </p>
        <div className="grid grid-cols-3 gap-3">
          {themes.map((t) => (
            <button
              key={t.value}
              onClick={() => handleThemeChange(t.value)}
              disabled={isPending}
              className={`group text-left space-y-3 p-1 border-2 transition-colors duration-150 disabled:opacity-60 ${
                theme === t.value
                  ? "border-zinc-900 dark:border-zinc-50"
                  : "border-transparent hover:border-zinc-300 dark:hover:border-zinc-700"
              }`}
            >
              <div className={`aspect-video border ${t.preview} overflow-hidden`}>
                <div className="p-2 space-y-1.5">
                  <div className={`h-1.5 w-8 rounded-full ${t.value === "dark" ? "bg-zinc-700" : "bg-zinc-200"}`} />
                  <div className={`h-1 w-12 rounded-full ${t.value === "dark" ? "bg-zinc-800" : "bg-zinc-100"}`} />
                  <div className={`h-1 w-10 rounded-full ${t.value === "dark" ? "bg-zinc-800" : "bg-zinc-100"}`} />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{t.label}</p>
                <p className="text-xs text-zinc-400 dark:text-zinc-600">{t.description}</p>
              </div>
            </button>
          ))}
        </div>
        {saved && (
          <p className="text-sm text-emerald-500 animate-in fade-in duration-200">
            Theme saved ✓
          </p>
        )}
      </div>

      {/* Reading font size */}
      <div className="space-y-4 pb-8 border-b border-zinc-100 dark:border-zinc-900">
        <p className="text-xs tracking-widest uppercase text-zinc-400 dark:text-zinc-600">
          Reading font size
        </p>
        <div className="flex items-center gap-3">
          {[
            { value: "sm", label: "Small" },
            { value: "base", label: "Default" },
            { value: "lg", label: "Large" },
          ].map((size) => (
            <button
              key={size.value}
              onClick={() => setFontSize(size.value)}
              className={`px-4 py-2 text-sm transition-colors duration-150 ${
                fontSize === size.value
                  ? "bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900"
                  : "border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:border-zinc-400"
              }`}
            >
              {size.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-zinc-400 dark:text-zinc-600">
          Applies to post reading view.
        </p>
      </div>

      {/* Language */}
      <div className="space-y-4">
        <p className="text-xs tracking-widest uppercase text-zinc-400 dark:text-zinc-600">
          Language
        </p>
        <select className="border border-zinc-200 dark:border-zinc-800 bg-transparent px-3 py-2.5 text-sm text-zinc-900 dark:text-zinc-50 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-50 transition-colors">
          <option value="en">English</option>
          <option value="fr">Français</option>
          <option value="es">Español</option>
          <option value="de">Deutsch</option>
        </select>
      </div>
    </div>
  );
}
