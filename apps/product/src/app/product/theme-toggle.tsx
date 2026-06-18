"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("vadal-theme");
    const prefers = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial = stored ? stored === "dark" : prefers;
    setDark(initial);
    document.documentElement.classList.toggle("dark", initial);
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("vadal-theme", next ? "dark" : "light");
  }

  return (
    <button
      onClick={toggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      className="relative grid h-9 w-9 place-items-center overflow-hidden rounded-full text-muted transition hover:bg-soft"
    >
      <Sun
        className={`absolute h-[16px] w-[16px] transition-all duration-300 ${
          dark ? "translate-y-0 rotate-0 opacity-100" : "translate-y-3 -rotate-45 opacity-0"
        }`}
        strokeWidth={1.9}
      />
      <Moon
        className={`absolute h-[16px] w-[16px] transition-all duration-300 ${
          dark ? "-translate-y-3 rotate-45 opacity-0" : "translate-y-0 rotate-0 opacity-100"
        }`}
        strokeWidth={1.9}
      />
    </button>
  );
}
