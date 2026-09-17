"use client";
/* A post's text, with translation in place.

   "Translate · हिन्दी" sits under the text; the translation replaces nothing —
   it appears in its own Aurora block with the original one tap away, because a
   machine translation is a reading aid, not the post. The language and the
   "always translate" choice are the person's, remembered across the product,
   and shared by every post on screen (one store, not one per card). */
import * as React from "react";
import { Check, ChevronDown, Languages } from "lucide-react";
import { TRANSLATE_LANGS, translatePost } from "@/lib/ai/engines/translate";
import { renderRich } from "./parts";

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

export function PostText({ id, text, size = "md" }: { id: string; text: string; size?: "md" | "lg" }) {
  const [p, set] = useTranslatePref();
  /* null = follow the "always" preference; true/false = this post, chosen by hand */
  const [manual, setManual] = React.useState<boolean | null>(null);
  const [menu, setMenu] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  const shown = manual ?? p.auto;
  const lang = TRANSLATE_LANGS.find((l) => l.code === p.lang) ?? TRANSLATE_LANGS[0];
  const result = shown ? translatePost(id, text, lang.code) : null;

  React.useEffect(() => {
    if (!menu) return;
    const onDown = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setMenu(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMenu(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); };
  }, [menu]);

  const body = size === "lg" ? "text-[17px] leading-[1.65]" : "text-[15px] leading-relaxed";
  const link = "inline-flex min-h-[44px] items-center gap-1.5 text-[13px] font-semibold transition lg:min-h-[28px]";

  return (
    <div className="mt-3">
      <p className={`whitespace-pre-line text-ink/90 ${body}`}>{renderRich(text)}</p>

      {/* everything below is a control inside a clickable card — keep clicks here */}
      <div onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
        {result?.ok && (
          <div lang={lang.code} className="mt-3 rounded-2xl border border-[var(--ai-border)] bg-[var(--ai-surface)] px-4 py-3">
            <p className={`whitespace-pre-line text-ink ${body}`}>{renderRich(result.text)}</p>
            <p lang="en" className="mt-2 text-[12px] text-muted">Translated from {result.from} to {lang.english} by Nudge · a reading aid, the original is above</p>
          </div>
        )}
        {result && !result.ok && (
          <p className="mt-3 rounded-2xl border border-dashed border-line px-4 py-3 text-[13px] text-muted">{result.reason}</p>
        )}

        <div ref={ref} className="relative mt-1 flex flex-wrap items-center gap-x-3">
          <button onClick={() => setManual(!shown)} aria-pressed={shown} className={`${link} ${shown ? "text-muted hover:text-ink" : "text-[var(--ai-accent)] hover:opacity-80"}`}>
            <Languages className="h-4 w-4" /> {shown ? "Hide translation" : <>Translate · <span lang={lang.code}>{lang.label}</span></>}
          </button>
          <button onClick={() => setMenu((m) => !m)} aria-haspopup="menu" aria-expanded={menu} aria-label="Translation language" className={`${link} text-faint hover:text-ink`}>
            Language <ChevronDown className="h-3.5 w-3.5" />
          </button>
          {shown && result?.ok && (
            <label className={`${link} cursor-pointer text-muted`}>
              <input type="checkbox" checked={p.auto} onChange={(e) => { set({ auto: e.target.checked }); setManual(null); }} className="h-4 w-4 accent-[var(--purple)]" />
              Always translate posts
            </label>
          )}
          {menu && (
            <div role="menu" className="absolute left-0 top-full z-20 mt-1 w-64 overflow-hidden rounded-xl border border-line bg-card py-1 shadow-[0_12px_30px_-10px_rgba(20,20,40,0.3)]">
              {TRANSLATE_LANGS.map((l) => (
                <button
                  key={l.code}
                  role="menuitemradio"
                  aria-checked={l.code === lang.code}
                  disabled={!l.live}
                  onClick={() => { set({ lang: l.code }); setMenu(false); setManual(true); }}
                  className="flex min-h-[44px] w-full items-center gap-2.5 px-3 text-left transition enabled:hover:bg-soft disabled:opacity-55 lg:min-h-[38px]"
                >
                  <span lang={l.code} className="text-[14px] font-semibold text-ink">{l.label}</span>
                  <span className="text-[12px] text-faint">{l.english}</span>
                  <span className="ml-auto text-[12px] text-faint">{l.code === lang.code ? <Check className="h-4 w-4 text-[var(--purple)]" /> : l.live ? "" : "Soon"}</span>
                </button>
              ))}
              <p className="border-t border-line px-3 py-2 text-[12px] leading-snug text-faint">More languages arrive with the translation provider.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
