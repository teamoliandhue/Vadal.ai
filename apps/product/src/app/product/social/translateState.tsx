"use client";
/* Translation state for posts, kept apart from the post parts so the
   engagement bar can hold the Translate button without an import cycle.

   Two stores:
   · the person's preference — language and "always translate" — shared by
     every surface that translates (Social, surveys, iLearn, Knowledge);
   · which posts are showing a translation right now, so the button in the
     action bar and the text above it agree without passing props through. */
import * as React from "react";
import { Languages } from "lucide-react";
import { TRANSLATE_LANGS } from "@/lib/ai/engines/translate";
import { useTranslates } from "../useTranslationAddon";

type Pref = { lang: string; auto: boolean };
const KEY = "vadal:translate";
const DEFAULT: Pref = { lang: "hi", auto: false };

let pref: Pref = DEFAULT;
let loaded = false;
const subs = new Set<() => void>();
function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) pref = { ...DEFAULT, ...(JSON.parse(raw) as Partial<Pref>) };
  } catch { /* unavailable storage — keep the default */ }
}
function setPref(next: Partial<Pref>) {
  pref = { ...pref, ...next };
  try { window.localStorage.setItem(KEY, JSON.stringify(pref)); } catch { /* ignore */ }
  subs.forEach((f) => f());
}
const subscribe = (f: () => void) => { load(); subs.add(f); return () => { subs.delete(f); }; };

export function useTranslatePref() {
  const p = React.useSyncExternalStore(subscribe, () => pref, () => DEFAULT);
  return [p, setPref] as const;
}

/* Per-post choice: true / false chosen by hand, missing = follow "always translate". */
let manual: Record<string, boolean> = {};
const postSubs = new Set<() => void>();
const subscribePosts = (f: () => void) => { postSubs.add(f); return () => { postSubs.delete(f); }; };
export function setPostTranslated(id: string, on: boolean | null) {
  const next = { ...manual };
  if (on === null) delete next[id]; else next[id] = on;
  manual = next;
  postSubs.forEach((f) => f());
}

/** Whether this post is showing its translation. False whenever the add-on is off. */
export function usePostTranslated(id: string): boolean {
  const on = useTranslates("feed");
  const [p] = useTranslatePref();
  const m = React.useSyncExternalStore(subscribePosts, () => manual, () => manual);
  return on && (m[id] ?? p.auto);
}

/** The Translate button for a post's action bar. Renders nothing without the add-on. */
export function TranslateToggle({ id }: { id: string }) {
  const on = useTranslates("feed");
  const [p] = useTranslatePref();
  const shown = usePostTranslated(id);
  if (!on) return null;
  const lang = TRANSLATE_LANGS.find((l) => l.code === p.lang) ?? TRANSLATE_LANGS[0];
  return (
    <button
      onClick={() => setPostTranslated(id, !shown)}
      aria-pressed={shown}
      aria-label={shown ? "Show the original only" : `Translate to ${lang.english}`}
      title={shown ? "Show the original only" : `Translate to ${lang.english}`}
      className={`flex min-h-[44px] items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[13px] font-semibold transition hover:bg-soft lg:min-h-0 ${shown ? "text-[var(--ai-accent)]" : "text-muted hover:text-ink"}`}
    >
      <Languages className="h-4 w-4" /> <span lang={lang.code} className="max-md:hidden">{lang.label}</span>
    </button>
  );
}
