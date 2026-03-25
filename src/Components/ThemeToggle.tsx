"use client";

import { useEffect, useSyncExternalStore } from "react";

const THEME_KEY = "theme";

type ThemeMode = "light" | "dark";

const THEME_EVENT = "theme-change";

function applyTheme(theme: ThemeMode) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
}

function getStoredTheme(): ThemeMode | null {
  const stored = window.localStorage.getItem(THEME_KEY) as ThemeMode | null;
  return stored === "dark" || stored === "light" ? stored : null;
}

function getPreferredTheme(): ThemeMode {
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function getSnapshot(): ThemeMode {
  return getStoredTheme() ?? getPreferredTheme();
}

function getServerSnapshot(): ThemeMode {
  return "light";
}

function subscribe(onStoreChange: () => void) {
  const onThemeChange = () => onStoreChange();
  const mediaQuery = window.matchMedia?.("(prefers-color-scheme: dark)");

  window.addEventListener(THEME_EVENT, onThemeChange);
  window.addEventListener("storage", onThemeChange);
  mediaQuery?.addEventListener("change", onThemeChange);

  return () => {
    window.removeEventListener(THEME_EVENT, onThemeChange);
    window.removeEventListener("storage", onThemeChange);
    mediaQuery?.removeEventListener("change", onThemeChange);
  };
}

function setThemePreference(theme: ThemeMode) {
  window.localStorage.setItem(THEME_KEY, theme);
  window.dispatchEvent(new Event(THEME_EVENT));
}

export default function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setThemePreference(nextTheme);
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      className="inline-flex items-center gap-2 cursor-pointer rounded-full border border-border bg-card/70 px-3 py-2 text-xs font-semibold text-foreground shadow-sm transition hover:bg-card"
    >
      <span className="hidden sm:inline">
        {theme === "dark" ? "Light" : "Dark"}
      </span>
      <span className="sm:hidden">Theme</span>
    </button>
  );
}
