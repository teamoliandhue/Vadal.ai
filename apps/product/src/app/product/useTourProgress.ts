"use client";
/* Which tour steps this person has explored. Persisted, because a tour you
   have to restart every time is a tour nobody finishes — and read by the rail
   too, so the nav can say how much is left.

   Explored means *did*, not *read*: the real features announce what happened
   (check-in, recognition, a knowledge question, the assistant) and the step
   that names that action is marked — from whichever page it happened on.
   Two hook instances live at once (the page and the rail), so every write
   announces itself and the others re-read; otherwise the rail's count would
   only catch up on the next reload. */
import * as React from "react";
import { usePersistentState } from "@/lib/usePersistentState";
import { TOUR_STORAGE_KEY, TOUR_ACTION_EVENT, stepForAction, type DemoKey, type TourAction } from "@/lib/tour";

const SYNC_EVENT = "vadal:tour";

export function useTourProgress(visiting?: string) {
  const [explored, setExplored, hydrated] = usePersistentState<DemoKey[]>(TOUR_STORAGE_KEY, []);

  const write = React.useCallback((next: DemoKey[]) => {
    try {
      window.localStorage.setItem(TOUR_STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore quota / unavailable storage */
    }
    window.dispatchEvent(new Event(SYNC_EVENT));
  }, []);

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

  /* stay in step with the other instance */
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
    window.addEventListener(SYNC_EVENT, reread);
    return () => window.removeEventListener(SYNC_EVENT, reread);
  }, [hydrated, setExplored]);

  /* explored by doing — `vadal:ask` is the assistant's own event, no emitter needed */
  React.useEffect(() => {
    if (!hydrated) return;
    const onDid = (e: Event) => {
      const action = (e as CustomEvent<{ action: TourAction }>).detail?.action;
      const id = action ? stepForAction(action) : null;
      if (id) mark(id);
    };
    const onAsk = () => mark("copilot");
    window.addEventListener(TOUR_ACTION_EVENT, onDid);
    window.addEventListener("vadal:ask", onAsk);
    return () => {
      window.removeEventListener(TOUR_ACTION_EVENT, onDid);
      window.removeEventListener("vadal:ask", onAsk);
    };
  }, [hydrated, mark]);

  /* being on a section is the action for the "open …" steps; done here rather
     than as an event so it cannot fire before the listener exists */
  React.useEffect(() => {
    if (!hydrated || !visiting) return;
    const id = stepForAction(`open:${visiting}`);
    if (id) mark(id);
  }, [hydrated, visiting, mark]);

  return { explored, mark, reset, hydrated };
}
