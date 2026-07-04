"use client";
/* Branding & white-label — the client-configuration centrepiece from the call.
   Upload a client logo, pick a brand colour (with a readable-on-dark-and-light
   variant suggested when the raw colour won't read), see it applied live to the
   home band, and control Vadal's own logo placement / white-labelling. Choices
   persist to localStorage (demo). */
import * as React from "react";
import { Check, ImagePlus, Info } from "lucide-react";
import { Button, Switch } from "@vadal/design-system";
import { toast } from "../Toaster";
import { usePersistentState } from "@/lib/usePersistentState";
import { workspace, brandSwatches } from "@/lib/settings";

/* ── colour helpers ─────────────────────────────────────────────── */
type RGB = { r: number; g: number; b: number };
type HSL = { h: number; s: number; l: number };
function hexToRgb(hex: string): RGB {
  let h = hex.replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const n = parseInt(h, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}
const clamp = (v: number, a: number, b: number) => Math.min(Math.max(v, a), b);
function rgbToHex({ r, g, b }: RGB) {
  return "#" + [r, g, b].map((v) => clamp(Math.round(v), 0, 255).toString(16).padStart(2, "0")).join("");
}
function rgbToHsl({ r, g, b }: RGB): HSL {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  let h = 0; const l = (max + min) / 2;
  const s = d === 0 ? 0 : l > 0.5 ? d / (2 - max - min) : d / (max + min);
  if (d !== 0) {
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h /= 6;
  }
  return { h: h * 360, s, l };
}
function hslToRgb({ h, s, l }: HSL): RGB {
  h /= 360;
  if (s === 0) return { r: l * 255, g: l * 255, b: l * 255 };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const t = (tc: number) => {
    if (tc < 0) tc += 1; if (tc > 1) tc -= 1;
    if (tc < 1 / 6) return p + (q - p) * 6 * tc;
    if (tc < 1 / 2) return q;
    if (tc < 2 / 3) return p + (q - p) * (2 / 3 - tc) * 6;
    return p;
  };
  return { r: t(h + 1 / 3) * 255, g: t(h) * 255, b: t(h - 1 / 3) * 255 };
}
const isHex = (v: string) => /^#?[0-9a-fA-F]{6}$/.test(v.trim()) || /^#?[0-9a-fA-F]{3}$/.test(v.trim());
/* A brand colour has to read as an accent on BOTH near-black and white. Keep
   lightness in a mid band and saturation up; flag when the raw value is outside. */
const READABLE_L = [0.48, 0.68] as const;
const MIN_S = 0.38;
function analyse(hex: string) {
  const hsl = rgbToHsl(hexToRgb(hex));
  const needsAdjust = hsl.l < READABLE_L[0] || hsl.l > READABLE_L[1] || hsl.s < MIN_S;
  const safe = rgbToHex(hslToRgb({ h: hsl.h, s: Math.max(hsl.s, MIN_S), l: clamp(hsl.l, READABLE_L[0], READABLE_L[1]) }));
  return { needsAdjust, safe, reason: hsl.l > READABLE_L[1] ? "too light for dark mode" : hsl.l < READABLE_L[0] ? "too dark to read as an accent" : "too muted to stand out" };
}

const PLACEMENTS = ["Next to profile", "Header only", "Sign-in only", "Hidden"] as const;

export function BrandingPanel() {
  const [color, setColor] = usePersistentState<string>("vadal:brand-color", "#5D63E1");
  const [draft, setDraft] = React.useState(color);
  const [whiteLabel, setWhiteLabel] = usePersistentState<boolean>("vadal:brand-whitelabel", false);
  const [placement, setPlacement] = usePersistentState<string>("vadal:brand-vadal-placement", PLACEMENTS[0]);
  const [bandFill, setBandFill] = usePersistentState<boolean>("vadal:brand-band-fill", true);

  const valid = isHex(draft);
  const active = valid ? (draft.startsWith("#") ? draft : `#${draft}`) : color;
  const { needsAdjust, safe, reason } = analyse(active);
  const applied = needsAdjust ? safe : active; // what actually gets used

  const tint = (pct: number) => `color-mix(in srgb, ${applied} ${pct}%, transparent)`;

  function save() {
    setColor(applied);
    setDraft(applied);
    // let the BrandProvider re-apply live across the product (same-tab)
    if (typeof window !== "undefined") window.dispatchEvent(new Event("vadal:brand"));
    toast(`Brand theme saved — ${applied.toUpperCase()} applied to ${workspace.name} ✓`);
  }

  return (
    <div className="flex flex-col gap-8">
      {/* logo */}
      <section>
        <h3 className="text-[15px] font-bold">Client logo</h3>
        <p className="mt-1 text-[13px] text-muted">Shown across the workspace so it feels like {workspace.legalName}&rsquo;s own product.</p>
        <div className="mt-3 flex flex-wrap items-center gap-4">
          <div className="grid h-16 w-16 place-items-center overflow-hidden rounded-2xl border border-line bg-soft">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={workspace.logo} alt={workspace.name} className="h-10 w-10 object-contain" />
          </div>
          <div className="flex flex-col gap-2">
            <Button variant="secondary" size="sm" leadingIcon={<ImagePlus className="h-4 w-4" />} onClick={() => toast("Upload opens the asset picker (demo)", "info")}>Replace logo</Button>
            <span className="text-[12px] text-faint">SVG or PNG, at least 128×128. Transparent background recommended.</span>
          </div>
        </div>
      </section>

      {/* brand colour */}
      <section>
        <h3 className="text-[15px] font-bold">Brand colour</h3>
        <p className="mt-1 text-[13px] text-muted">Used for the workspace accents and the home band. We keep it readable on both dark and light themes.</p>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <label className="relative h-11 w-11 shrink-0 cursor-pointer overflow-hidden rounded-xl border border-line" style={{ background: active }}>
            <input type="color" value={active} onChange={(e) => setDraft(e.target.value)} className="absolute inset-0 cursor-pointer opacity-0" aria-label="Pick brand colour" />
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[14px] text-faint">#</span>
            <input
              value={draft.replace("#", "")}
              onChange={(e) => setDraft(e.target.value)}
              spellCheck={false}
              className={`w-36 rounded-xl border bg-card py-2.5 pl-7 pr-3 text-[14px] uppercase tracking-wide outline-none transition ${valid ? "border-line focus:border-[var(--purple)]" : "border-[var(--danger)]"}`}
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {brandSwatches.map((s) => (
              <button key={s} onClick={() => setDraft(s)} aria-label={`Use ${s}`} className="h-7 w-7 rounded-lg border border-line transition hover:scale-110" style={{ background: s }}>
                {active.toLowerCase() === s.toLowerCase() && <Check className="mx-auto h-4 w-4 text-white mix-blend-difference" />}
              </button>
            ))}
          </div>
        </div>

        {/* readable-variant advisory (the call ask) */}
        {needsAdjust && valid && (
          <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-[var(--warning)]/40 bg-[color-mix(in_srgb,var(--warning)_10%,transparent)] p-3">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-[var(--warning)]" />
            <div className="min-w-0 text-[13px] leading-relaxed text-muted">
              <span className="font-semibold text-ink">{active.toUpperCase()} is {reason}.</span> We&rsquo;ll use a balanced variant so it stays legible everywhere:
              <span className="mt-2 flex items-center gap-2">
                <span className="h-5 w-5 rounded-md border border-line" style={{ background: active }} />
                <span className="text-faint">→</span>
                <span className="h-5 w-5 rounded-md border border-line" style={{ background: safe }} />
                <span className="font-semibold text-ink">{safe.toUpperCase()}</span>
              </span>
            </div>
          </div>
        )}
      </section>

      {/* live preview */}
      <section>
        <div className="flex items-center justify-between">
          <h3 className="text-[15px] font-bold">Live preview</h3>
          <label className="flex items-center gap-2 text-[13px] text-muted"><Switch size="sm" checked={bandFill} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBandFill(e.target.checked)} /> Fill the home band</label>
        </div>
        <div className="mt-3 overflow-hidden rounded-2xl border border-line">
          <div className="relative p-5" style={{ background: bandFill ? tint(14) : "var(--card)" }}>
            <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-40 blur-2xl" style={{ background: tint(30) }} aria-hidden />
            <div className="relative flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={workspace.logo} alt="" className="h-7 w-7 rounded-lg object-contain" />
              <span className="text-[13px] font-semibold text-muted">{workspace.name}</span>
              {!whiteLabel && placement !== "Hidden" && (
                <span className="ml-auto flex items-center gap-1 text-[11px] text-faint">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/brand/signal-mark.svg" alt="" className="h-3.5 w-3.5" /> Powered by Vadal
                </span>
              )}
            </div>
            <p className="mt-4 text-[12px] font-semibold uppercase tracking-[0.16em] text-faint">Tuesday, 9 June</p>
            <h4 className="mt-1 text-[22px] font-bold tracking-tight">Good morning, <span style={{ color: applied }}>Priya</span> 👋</h4>
            <p className="mt-1 text-[13px] text-muted">You&rsquo;ve got 4 things today, and you&rsquo;re on a 12-day streak. 🔥</p>
            <div className="mt-4 flex items-center gap-2">
              <span className="rounded-full px-3 py-1.5 text-[13px] font-semibold text-white" style={{ background: applied }}>Give recognition</span>
              <span className="rounded-full border px-3 py-1.5 text-[13px] font-semibold" style={{ borderColor: tint(45), color: applied }}>View pulse</span>
            </div>
          </div>
        </div>
      </section>

      {/* white-label */}
      <section className="flex flex-col gap-3">
        <h3 className="text-[15px] font-bold">Vadal branding</h3>
        <div className="rounded-2xl border border-line p-4">
          <Switch checked={whiteLabel} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWhiteLabel(e.target.checked)} label="White-label this workspace" description="Hide the Vadal mark entirely — for larger organisations that ship this as their own." />
        </div>
        <div className={`rounded-2xl border border-line p-4 transition ${whiteLabel ? "pointer-events-none opacity-50" : ""}`}>
          <div className="text-[14px] font-semibold">Vadal logo placement</div>
          <div className="text-[13px] text-muted">Where the &ldquo;Powered by Vadal&rdquo; mark appears when not white-labelled.</div>
          <div className="mt-3 flex flex-wrap gap-2">
            {PLACEMENTS.map((p) => (
              <button key={p} onClick={() => setPlacement(p)} className={`rounded-full border px-3 py-1.5 text-[13px] font-semibold transition ${placement === p ? "border-[var(--purple)] bg-[color-mix(in_srgb,var(--purple)_14%,transparent)] text-ink" : "border-line text-muted hover:text-ink"}`}>{p}</button>
            ))}
          </div>
        </div>
      </section>

      <div className="sticky bottom-0 -mx-6 -mb-6 flex items-center justify-between gap-2 border-t border-line bg-card px-6 py-4 sm:-mx-7 sm:px-7">
        <span className="text-[12px] text-faint">Applied colour · <span className="font-semibold text-muted">{applied.toUpperCase()}</span></span>
        <Button variant="brand" size="sm" onClick={save}>Save branding</Button>
      </div>
    </div>
  );
}
