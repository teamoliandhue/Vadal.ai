"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";

/** Animated count-up for big stat numbers. Parses "74%", "2,840", "+38"
 *  and counts the numeric part from 0 with an ease-out curve. */
export function CountUp({ value, duration = 1100 }: { value: string; duration?: number }) {
  const m = value.match(/^([+−-]?)([\d,]+(?:\.\d+)?)(.*)$/);
  const prefix = m ? m[1] : "";
  const target = m ? parseFloat(m[2].replace(/,/g, "")) : 0;
  const suffix = m ? m[3] : "";
  const decimals = m && m[2].includes(".") ? m[2].split(".")[1].length : 0;
  const grouped = m ? m[2].includes(",") : false;

  const [display, setDisplay] = useState(0);
  const raf = useRef(0);

  useEffect(() => {
    if (!m) return;
    // all setState happens inside rAF callbacks (async), satisfying
    // the Next 16 react-hooks/set-state-in-effect rule
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dur = reduced ? 0 : duration;
    const start = performance.now();
    const tick = (now: number) => {
      const t = dur === 0 ? 1 : Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(target * eased);
      if (t < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  if (!m) return <>{value}</>;
  const formatted = grouped
    ? Math.round(display).toLocaleString("en-US")
    : display.toFixed(decimals);
  return (
    <>
      {prefix}
      {formatted}
      {suffix}
    </>
  );
}

function subscribe(cb: () => void) {
  const mo = new MutationObserver(cb);
  mo.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => mo.disconnect();
}
const getDark = () => document.documentElement.classList.contains("dark");

export function GenAlphaThemeToggle() {
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
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      className="ga-pillbox relative grid h-[30px] w-[30px] place-items-center !p-0"
      style={{ color: "var(--ga-muted)" }}
    >
      <Sun
        className={`absolute inset-0 m-auto h-[15px] w-[15px] transition-all duration-300 ${
          dark ? "scale-100 opacity-100" : "scale-75 opacity-0"
        }`}
        strokeWidth={2}
      />
      <Moon
        className={`absolute inset-0 m-auto h-[15px] w-[15px] transition-all duration-300 ${
          dark ? "scale-75 opacity-0" : "scale-100 opacity-100"
        }`}
        strokeWidth={2}
      />
    </button>
  );
}
