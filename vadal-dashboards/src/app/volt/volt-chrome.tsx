"use client";

import { useEffect, useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";

function subscribe(cb: () => void) {
  const mo = new MutationObserver(cb);
  mo.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => mo.disconnect();
}
const getDark = () => document.documentElement.classList.contains("dark");

export function VoltThemeToggle() {
  const dark = useSyncExternalStore(subscribe, getDark, () => false);

  useEffect(() => {
    const stored = localStorage.getItem("vadal-theme");
    const prefers = window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.classList.toggle(
      "dark",
      stored ? stored === "dark" : prefers,
    );
  }, []);

  function toggle() {
    const next = !getDark();
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("vadal-theme", next ? "dark" : "light");
  }

  return (
    <button
      onClick={toggle}
      aria-label={dark ? "Switch to lite mode" : "Switch to dark mode"}
      className="relative grid h-10 w-10 place-items-center rounded-full transition"
      style={{ color: "var(--vt-muted)", border: "1px solid var(--vt-border)" }}
      onMouseEnter={(e) =>
        ((e.currentTarget as HTMLElement).style.background =
          "rgba(127,127,127,0.1)")
      }
      onMouseLeave={(e) =>
        ((e.currentTarget as HTMLElement).style.background = "")
      }
    >
      <Sun
        className={`absolute h-[15px] w-[15px] transition-all duration-300 ${
          dark ? "scale-100 opacity-100" : "scale-75 opacity-0"
        }`}
        strokeWidth={1.8}
      />
      <Moon
        className={`absolute h-[15px] w-[15px] transition-all duration-300 ${
          dark ? "scale-75 opacity-0" : "scale-100 opacity-100"
        }`}
        strokeWidth={1.8}
      />
    </button>
  );
}
