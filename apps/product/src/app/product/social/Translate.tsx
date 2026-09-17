"use client";
/* A post's text: long posts fold behind "Read more", and a translation, when
   asked for, sits under the original in its own Aurora block.

   The Translate button lives in the post's action bar (translateState). It
   used to be a row of its own under every post — "Translate · हिन्दी ·
   Language" repeated down the whole feed. The language and "always translate"
   now live inside the translation, where they matter. A machine translation is
   a reading aid, not the post, so the original always stays above it. */
import * as React from "react";
import { Check, ChevronDown } from "lucide-react";
import { TRANSLATE_LANGS, translatePost } from "@/lib/ai/engines/translate";
import { renderRich } from "./parts";
import { setPostTranslated, usePostTranslated, useTranslatePref } from "./translateState";

export { useTranslatePref } from "./translateState";

/** Characters before a post folds. Long enough that most posts never do. */
const FOLD_AT = 280;

export function PostText({ id, text, size = "md", fold = true }: { id: string; text: string; size?: "md" | "lg"; fold?: boolean }) {
  const [p, set] = useTranslatePref();
  const shown = usePostTranslated(id);
  const [menu, setMenu] = React.useState(false);
  const [expanded, setExpanded] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  const lang = TRANSLATE_LANGS.find((l) => l.code === p.lang) ?? TRANSLATE_LANGS[0];
  const result = shown ? translatePost(id, text, lang.code) : null;
  const long = fold && text.length > FOLD_AT;

  React.useEffect(() => {
    if (!menu) return;
    const onDown = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setMenu(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMenu(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); };
  }, [menu]);

  const body = size === "lg" ? "text-[17px] leading-[1.65]" : "text-[15px] leading-relaxed";
  const link = "inline-flex min-h-[44px] items-center gap-1 text-[12px] font-semibold transition lg:min-h-[24px]";

  return (
    <div className="mt-3">
      <p className={`whitespace-pre-line text-ink/90 ${body} ${long && !expanded ? "line-clamp-4" : ""}`}>{renderRich(text)}</p>
      {long && (
        <button
          onClick={(e) => { e.stopPropagation(); setExpanded((v) => !v); }}
          className="mt-0.5 inline-flex min-h-[44px] items-center text-[14px] font-semibold text-[var(--purple)] hover:underline lg:min-h-[28px]"
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      )}

      {/* controls inside a clickable card — keep clicks here */}
      {result && (
        <div onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
          {result.ok ? (
            <div lang={lang.code} className="mt-3 rounded-2xl border border-[var(--ai-border)] bg-[var(--ai-surface)] px-4 py-3">
              <p className={`whitespace-pre-line text-ink ${body}`}>{renderRich(result.text)}</p>
            </div>
          ) : (
            <p className="mt-3 rounded-2xl border border-dashed border-line px-4 py-3 text-[13px] text-muted">{result.reason}</p>
          )}
          <div ref={ref} lang="en" className="relative mt-1 flex flex-wrap items-center gap-x-3 text-muted">
            {result.ok && <span className="text-[12px] text-faint">Translated by Nudge · a reading aid</span>}
            <button onClick={() => setMenu((m) => !m)} aria-haspopup="menu" aria-expanded={menu} className={`${link} hover:text-ink`}>
              <span lang={lang.code}>{lang.label}</span> <ChevronDown className="h-3.5 w-3.5" />
            </button>
            <label className={`${link} cursor-pointer`}>
              <input type="checkbox" checked={p.auto} onChange={(e) => { set({ auto: e.target.checked }); setPostTranslated(id, null); }} className="h-4 w-4 accent-[var(--purple)]" />
              Always translate
            </label>
            <button onClick={() => setPostTranslated(id, false)} className={`${link} hover:text-ink`}>Hide</button>
            {menu && (
              <div role="menu" className="absolute left-0 top-full z-20 mt-1 w-64 overflow-hidden rounded-xl border border-line bg-card py-1 shadow-[0_12px_30px_-10px_rgba(20,20,40,0.3)]">
                {TRANSLATE_LANGS.map((l) => (
                  <button
                    key={l.code}
                    role="menuitemradio"
                    aria-checked={l.code === lang.code}
                    disabled={!l.live}
                    onClick={() => { set({ lang: l.code }); setMenu(false); setPostTranslated(id, true); }}
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
      )}
    </div>
  );
}
