"use client";
/* The translation add-on, one store for the whole product.

   Every surface that offers translation reads this, so switching the add-on or
   a surface off removes the control everywhere at once — employees never see a
   translate button that leads to "your company hasn't bought this". */
import * as React from "react";
import type { ProviderId, SurfaceKey } from "@/lib/translation";

export type TranslationAddon = {
  enabled: boolean;
  /** Indian languages go to this provider; everything else to Google. */
  indian: ProviderId;
  surfaces: Record<SurfaceKey, boolean>;
};

const KEY = "vadal:translation-addon";
const DEFAULT: TranslationAddon = { enabled: true, indian: "sarvam", surfaces: { summaries: true, feed: true, surveys: true, learning: true } };

let state = DEFAULT;
let loaded = false;
const subs = new Set<() => void>();
function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      const s = JSON.parse(raw) as Partial<TranslationAddon>;
      state = { ...DEFAULT, ...s, enabled: s.enabled === true, surfaces: { ...DEFAULT.surfaces, ...(s.surfaces ?? {}) } };
    }
  } catch { /* keep the default */ }
}
export function setTranslationAddon(next: Partial<TranslationAddon>) {
  state = { ...state, ...next, surfaces: { ...state.surfaces, ...(next.surfaces ?? {}) } };
  try { window.localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignore */ }
  subs.forEach((f) => f());
}
const subscribe = (f: () => void) => { load(); subs.add(f); return () => { subs.delete(f); }; };

export function useTranslationAddon(): TranslationAddon {
  return React.useSyncExternalStore(subscribe, () => state, () => DEFAULT);
}

/** Is translation on for this surface? */
export function useTranslates(surface: SurfaceKey): boolean {
  const a = useTranslationAddon();
  return a.enabled === true && a.surfaces[surface] === true;
}
