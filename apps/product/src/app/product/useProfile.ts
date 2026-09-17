"use client";
/* The one PersonProfile for the signed-in person (lib/ai/engines/personalize).

   Built from what the product already knows, never asked for all at once:
   · the session — role, team, title, desk or frontline
   · context — inferFromContext (frontline reads simpler; plant teams care about safety)
   · behaviour — topics of the posts they reacted to, and their joined communities
   · the day's check-in — mood

   The same object ranks the Social feed and orders Home. That is the brief's
   point: one profile, not four rankers that disagree about who someone is. */
import * as React from "react";
import { emptyProfile, inferFromContext, type PersonProfile } from "@/lib/ai/engines/personalize";
import { tagPost } from "@/lib/ai/engines/text";
import { feedItems } from "@/lib/feed";
import { groupMap } from "@/lib/groups";
import { usePersistentState } from "@/lib/usePersistentState";
import { useSession } from "./useSession";
import { useViewAs } from "./useViewAs";

const MOOD: Record<string, number> = { Great: 0.8, Good: 0.4, Okay: 0, Struggling: -0.6 };

export function useProfile(): PersonProfile {
  const { session } = useSession();
  const [role] = useViewAs();
  const [reacts] = usePersistentState<Record<string, string>>("vadal:feed2-reacts", {});
  const [joined] = usePersistentState<string[]>("vadal:groups-joined", []);
  const [mood] = usePersistentState<{ mood: string } | null>("vadal:mood", null);

  return React.useMemo(() => {
    const base = emptyProfile(session?.email ?? "", role, session?.team ?? "", session?.title ?? "", session?.profile ?? "desk");
    const inferred = inferFromContext(base);
    const interests: Record<string, number> = { ...(inferred.interests ?? {}) };
    const bump = (t: string, by: number) => { interests[t] = Math.min(1, (interests[t] ?? 0) + by); };
    for (const id of Object.keys(reacts)) {
      const post = feedItems.find((p) => p.id === id);
      if (post) for (const t of tagPost(post.text).topics) bump(t, 0.25);
    }
    for (const g of joined) for (const t of groupMap[g]?.tags ?? []) bump(t, 0.15);
    return { ...base, ...inferred, interests, mood: mood ? MOOD[mood.mood] ?? 0 : 0 };
  }, [session, role, reacts, joined, mood]);
}
