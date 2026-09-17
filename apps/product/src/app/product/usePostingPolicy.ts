"use client";
/* The workspace's posting rules, readable anywhere and live everywhere — change
   a rule in Settings and every composer, the communities hub and Amplify follow
   on the next render, in this tab and in any other. One store, not a copy per
   component. */
import * as React from "react";
import { DEFAULT_POLICY, type PostingPolicy } from "@/lib/posting";

const KEY = "vadal:posting-policy";
let policy: PostingPolicy = DEFAULT_POLICY;
let loaded = false;
const subs = new Set<() => void>();

function readStorage() {
  try {
    const raw = window.localStorage.getItem(KEY);
    policy = raw ? { ...DEFAULT_POLICY, ...(JSON.parse(raw) as Partial<PostingPolicy>) } : DEFAULT_POLICY;
  } catch { policy = DEFAULT_POLICY; }
}
function subscribe(f: () => void) {
  if (!loaded && typeof window !== "undefined") {
    loaded = true;
    readStorage();
    window.addEventListener("storage", (e) => { if (e.key === KEY) { readStorage(); subs.forEach((s) => s()); } });
  }
  subs.add(f);
  return () => { subs.delete(f); };
}

export function setPostingPolicy(next: Partial<PostingPolicy>) {
  policy = { ...policy, ...next };
  try { window.localStorage.setItem(KEY, JSON.stringify(policy)); } catch { /* ignore */ }
  subs.forEach((f) => f());
}

export function usePostingPolicy() {
  const p = React.useSyncExternalStore(subscribe, () => policy, () => DEFAULT_POLICY);
  return [p, setPostingPolicy] as const;
}
