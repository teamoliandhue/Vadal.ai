"use client";
/* Everything people do on the Kudos wall, persisted: what they gave, what they
   celebrated, the boosts they added, the thanks they sent back and the group
   cards they signed.

   `vadal:recognition-given` is also written by the Nudge dock
   (ai-exec · give_recognition), in a smaller shape — `to` as a name, no
   `from`. Reading that as a Kudos crashed the wall, so every entry goes
   through normalise() first. */
import * as React from "react";
import { usePersistentState } from "@/lib/usePersistentState";
import { teammates, type Boost, type Kudos, type Person } from "@/lib/recognize";
import { useMe } from "../useSession";

type Raw = Partial<Kudos> & { to?: Person | string; when?: string };

export function useKudosState() {
  const me = useMe();
  const [rawGiven, setGiven] = usePersistentState<Raw[]>("vadal:recognition-given", []);
  const [celebrated, setCelebrated] = usePersistentState<string[]>("vadal:recognition-reacted", []);
  const [boosts, setBoosts] = usePersistentState<Record<string, Boost[]>>("vadal:recognition-boosts", {});
  const [thanks, setThanks] = usePersistentState<Record<string, string>>("vadal:recognition-thanks", {});
  const [signed, setSigned] = usePersistentState<Record<string, string>>("vadal:recognition-cards", {});

  const mePerson: Person = React.useMemo(() => ({ name: me.fullName, team: me.team, img: me.img }), [me.fullName, me.team, me.img]);

  const given: Kudos[] = React.useMemo(() => rawGiven.map((r, i) => normalise(r, i, mePerson)), [rawGiven, mePerson]);

  const display = React.useCallback((k: Kudos) => ({
    ...k,
    boosts: [...(k.boosts ?? []), ...(boosts[k.id] ?? [])],
    thanks: thanks[k.id] ?? k.thanks,
    celebrated: celebrated.includes(k.id),
    reactions: k.reactions + (celebrated.includes(k.id) ? 1 : 0),
  }), [boosts, thanks, celebrated]);

  return {
    me: mePerson,
    given,
    display,
    signed,
    give: (k: Kudos) => setGiven((g) => [k, ...g]),
    celebrate: (id: string) => setCelebrated((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id])),
    boost: (id: string, text: string) => setBoosts((b) => ({ ...b, [id]: [...(b[id] ?? []), { from: mePerson, text }] })),
    sayThanks: (id: string, text: string) => setThanks((t) => ({ ...t, [id]: text })),
    sign: (cardId: string, text: string) => setSigned((s) => ({ ...s, [cardId]: text })),
  };
}

export type KudosView = ReturnType<ReturnType<typeof useKudosState>["display"]>;

function normalise(r: Raw, i: number, me: Person): Kudos {
  const toName = typeof r.to === "string" ? r.to : r.to?.name ?? "A teammate";
  const to: Person = typeof r.to === "object" && r.to
    ? r.to
    : teammates.find((p) => p.name.toLowerCase().startsWith(toName.toLowerCase())) ?? { name: toName, team: "", img: "/avatars/user-1.svg" };
  return {
    id: r.id ?? `dock-${i}`,
    from: r.from ?? me,
    to,
    also: r.also,
    style: r.style ?? "thanks",
    value: r.value || "Ownership",
    message: r.message ?? "",
    time: r.time ?? "Just now",
    reactions: r.reactions ?? 0,
    points: r.points ?? 25,
    manager: r.manager,
  };
}

/** Is this person among the recipients? */
export const recognises = (k: Kudos, name: string) => k.to.name === name || Boolean(k.also?.some((p) => p.name === name));
