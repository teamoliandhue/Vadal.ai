"use client";
/* SSR-safe localStorage state. Renders `initial` on the server and the first client
   paint (so hydration matches), then hydrates from localStorage in an effect and
   persists on change. `hydrated` lets callers avoid acting before the stored value loads. */
import * as React from "react";

export function usePersistentState<T>(key: string, initial: T) {
  const [state, setState] = React.useState<T>(initial);
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw != null) setState(JSON.parse(raw) as T);
    } catch {
      /* ignore malformed / unavailable storage */
    }
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  React.useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch {
      /* ignore quota / unavailable storage */
    }
  }, [key, state, hydrated]);

  return [state, setState, hydrated] as const;
}
