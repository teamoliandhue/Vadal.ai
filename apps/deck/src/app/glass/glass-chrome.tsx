"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Check, Moon, Palette, Sun } from "lucide-react";

/** Observe theme class + background data attrs on <html>. */
function subscribe(cb: () => void) {
  const mo = new MutationObserver(cb);
  mo.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class", "data-glbg-light", "data-glbg-dark"],
  });
  return () => mo.disconnect();
}
const getDark = () => document.documentElement.classList.contains("dark");
const getBgLight = () => document.documentElement.dataset.glbgLight ?? "sky";
const getBgDark = () => document.documentElement.dataset.glbgDark ?? "ocean";

/** Theme toggle — shares the same `dark` class + storage key as Lumen. */
export function GlassThemeToggle() {
  const dark = useSyncExternalStore(subscribe, getDark, () => false);

  // apply persisted/system theme on mount (mutating the DOM is an allowed effect)
  useEffect(() => {
    const stored = localStorage.getItem("vadal-theme");
    const prefers = window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.classList.toggle("dark", stored ? stored === "dark" : prefers);
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
      className="glass-nav-item relative grid h-10 w-10 place-items-center overflow-hidden rounded-2xl"
    >
      <Sun
        className={`absolute h-[17px] w-[17px] transition-all duration-300 ${
          dark ? "translate-y-0 rotate-0 opacity-100" : "translate-y-3 -rotate-45 opacity-0"
        }`}
        strokeWidth={2}
      />
      <Moon
        className={`absolute h-[17px] w-[17px] transition-all duration-300 ${
          dark ? "-translate-y-3 rotate-45 opacity-0" : "translate-y-0 rotate-0 opacity-100"
        }`}
        strokeWidth={2}
      />
    </button>
  );
}

/* ── background picker ── */

type BgPreset = { id: string; label: string; swatch: string };

const LIGHT_BGS: BgPreset[] = [
  { id: "sky", label: "Sky", swatch: "linear-gradient(135deg, #dde6fa, #8ba2f5, #d8e9fb)" },
  { id: "lilac", label: "Lilac", swatch: "linear-gradient(135deg, #eae4fb, #c1a4f8, #f3b8e0)" },
  { id: "mint", label: "Mint", swatch: "linear-gradient(135deg, #d2f3ec, #5eead4, #7fc8fb)" },
  { id: "dawn", label: "Dawn", swatch: "linear-gradient(135deg, #fdeee3, #fbbf7a, #f99eb6)" },
];

const DARK_BGS: BgPreset[] = [
  { id: "ocean", label: "Ocean", swatch: "linear-gradient(135deg, #01030a, #0a2a6e, #3b82f6)" },
  { id: "violet", label: "Violet", swatch: "linear-gradient(135deg, #0a1430, #3b2a7e, #7c3aed)" },
  { id: "aurora", label: "Aurora", swatch: "linear-gradient(135deg, #02070d, #0d9488, #7c3aed)" },
  { id: "graphite", label: "Graphite", swatch: "linear-gradient(135deg, #050507, #26272e, #4b5563)" },
];

function applyBg(mode: "light" | "dark", id: string) {
  if (mode === "light") document.documentElement.dataset.glbgLight = id;
  else document.documentElement.dataset.glbgDark = id;
  localStorage.setItem(`vadal-glass-bg-${mode}`, id);
}

function SwatchRow({
  presets,
  active,
  onPick,
}: {
  presets: BgPreset[];
  active: string;
  onPick: (id: string) => void;
}) {
  return (
    <div className="mt-1.5 flex gap-2">
      {presets.map((b) => (
        <button
          key={b.id}
          title={b.label}
          aria-label={b.label}
          onClick={() => onPick(b.id)}
          style={{ background: b.swatch }}
          className={`relative grid h-8 w-8 place-items-center rounded-full transition ${
            active === b.id
              ? "scale-110 ring-2 ring-[var(--gl-active-fg)]"
              : "ring-1 ring-[var(--gl-border-soft)] hover:scale-105"
          }`}
        >
          {active === b.id && (
            <Check className="h-3.5 w-3.5 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]" strokeWidth={3} />
          )}
        </button>
      ))}
    </div>
  );
}

export function GlassBgPicker() {
  const [open, setOpen] = useState(false);
  const bgLight = useSyncExternalStore(subscribe, getBgLight, () => "sky");
  const bgDark = useSyncExternalStore(subscribe, getBgDark, () => "ocean");

  // restore persisted choices on mount (DOM mutation only)
  useEffect(() => {
    const l = localStorage.getItem("vadal-glass-bg-light");
    const d = localStorage.getItem("vadal-glass-bg-dark");
    if (l) document.documentElement.dataset.glbgLight = l;
    if (d) document.documentElement.dataset.glbgDark = d;
  }, []);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Change background"
        className="glass-nav-item grid h-10 w-10 place-items-center rounded-2xl"
      >
        <Palette className="h-[17px] w-[17px]" strokeWidth={1.9} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden />
          <div className="glass-card absolute right-0 top-12 z-50 w-60 rounded-3xl p-4">
            <div className="t-faint text-[10.5px] font-bold tracking-[0.14em]">BACKGROUND</div>
            <div className="t-muted mt-3 text-[11.5px] font-semibold">Light mode</div>
            <SwatchRow presets={LIGHT_BGS} active={bgLight} onPick={(id) => applyBg("light", id)} />
            <div className="t-muted mt-3.5 text-[11.5px] font-semibold">Dark mode</div>
            <SwatchRow presets={DARK_BGS} active={bgDark} onPick={(id) => applyBg("dark", id)} />
          </div>
        </>
      )}
    </div>
  );
}

const PERIODS = ["7 days", "30 days", "Quarter", "Year"];

export function GlassPeriodPills() {
  const [active, setActive] = useState("30 days");
  return (
    <div className="glass-soft inline-flex items-center gap-0.5 rounded-full p-1">
      {PERIODS.map((p) => (
        <button
          key={p}
          onClick={() => setActive(p)}
          className={`rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition ${
            active === p
              ? "bg-white text-[#2f5eff] shadow-sm dark:bg-white/15 dark:text-white"
              : "t-muted hover:text-[color:var(--gl-text)]"
          }`}
        >
          {p}
        </button>
      ))}
    </div>
  );
}
