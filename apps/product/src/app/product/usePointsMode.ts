"use client";
/* Whether this workspace uses points. One store, live everywhere: flip it in
   Settings and Home, Kudos, iThrive and the profile menu follow on the next
   render, in this tab and any other. On by default. */
import * as React from "react";

const KEY = "vadal:points-mode";
type Mode = { enabled: boolean };
const DEFAULT: Mode = { enabled: true };
let mode: Mode = DEFAULT;
let loaded = false;
const subs = new Set<() => void>();

function read() {
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as Partial<Mode>) : {};
    /* a stored value that is not literally false reads as the default (on) */
    mode = { enabled: parsed.enabled !== false };
  } catch { mode = DEFAULT; }
}
function subscribe(f: () => void) {
  if (!loaded && typeof window !== "undefined") {
    loaded = true;
    read();
    window.addEventListener("storage", (e) => { if (e.key === KEY) { read(); subs.forEach((s) => s()); } });
  }
  subs.add(f);
  return () => { subs.delete(f); };
}

export function setPointsMode(enabled: boolean) {
  mode = { enabled };
  try { window.localStorage.setItem(KEY, JSON.stringify(mode)); } catch { /* ignore */ }
  subs.forEach((f) => f());
}

/** true when the workspace shows points. */
export function usePoints() {
  return React.useSyncExternalStore(subscribe, () => mode, () => DEFAULT).enabled;
}
