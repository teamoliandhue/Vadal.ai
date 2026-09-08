"use client";
/* Which tour steps this person has explored. Persisted, because a tour you
   have to restart every time is a tour nobody finishes — and read by the rail
   too, so the nav can say how much is left. Two hook instances live at once
   (the page and the rail), so every write announces itself and the others
   re-read; otherwise the rail's count would only catch up on the next reload. */
import * as React from "react";
import { usePersistentState } from "@/lib/usePersistentState";
import { TOUR_STORAGE_KEY, type DemoKey } from "@/lib/tour";

const EVENT = "vadal:tour";

export function useTourProgress() {
  const [explored, setExplored, hydrated] = usePersistentState<DemoKey[]>(TOUR_STORAGE_KEY, []);

  React.useEffect(() => {
    if (!hydrated) return;
    const reread = () => {
      try {
        const raw = window.localStorage.getItem(TOUR_STORAGE_KEY);
        setExplored(raw ? (JSON.parse(raw) as DemoKey[]) : []);
      } catch {
        /* ignore malformed / unavailable storage */
      }
    };
    window.addEventListener(EVENT, reread);
    return () => window.removeEventListener(EVENT, reread);
  }, [hydrated, setExplored]);

  const write = React.useCallback(
    (next: DemoKey[]) => {
      try {
        window.localStorage.setItem(TOUR_STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* ignore quota / unavailable storage */
      }
      window.dispatchEvent(new Event(EVENT));
    },
    [],
  );

  const mark = React.useCallback(
    (id: DemoKey) => {
      setExplored((e) => {
        const next = e.includes(id) ? e : [...e, id];
        if (next !== e) write(next);
        return next;
      });
    },
    [setExplored, write],
  );
  const reset = React.useCallback(() => {
    setExplored([]);
    write([]);
  }, [setExplored, write]);

  return { explored, mark, reset };
}
