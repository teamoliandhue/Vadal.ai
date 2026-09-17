"use client";
/* Which communities this person is in, has asked to join, and has made.
   Persisted in the browser — the demo has no server to hold membership — and
   merged over the seed list so a created room behaves like any other. */
import * as React from "react";
import { usePersistentState } from "@/lib/usePersistentState";
import { DEFAULT_JOINED, groups as seedGroups, type Group } from "@/lib/groups";
import { toast } from "../../Toaster";

export function useGroups() {
  const [joined, setJoined, hydrated] = usePersistentState<string[]>("vadal:groups-joined", DEFAULT_JOINED);
  const [requested, setRequested] = usePersistentState<string[]>("vadal:groups-requested", []);
  const [created, setCreated] = usePersistentState<Group[]>("vadal:groups-created", []);

  const all = React.useMemo(() => [...created, ...seedGroups], [created]);
  const byId = React.useMemo(() => Object.fromEntries(all.map((g) => [g.id, g])) as Record<string, Group>, [all]);

  const isMember = (id: string) => joined.includes(id) || created.some((g) => g.id === id);
  const hasAsked = (id: string) => requested.includes(id);
  /** Headcount including me — the seed number is everyone else. */
  const memberCount = (g: Group) => g.members + (joined.includes(g.id) && !g.mine ? 1 : 0);

  const join = (g: Group) => {
    if (g.privacy === "request") {
      setRequested((r) => (r.includes(g.id) ? r : [...r, g.id]));
      toast(`Asked to join ${g.name} — ${g.owner.name.split(" ")[0]} will see it`);
      return;
    }
    setJoined((j) => (j.includes(g.id) ? j : [...j, g.id]));
    toast(`You're in ${g.name} ${g.emoji}`);
  };
  const withdraw = (g: Group) => { setRequested((r) => r.filter((x) => x !== g.id)); toast("Request withdrawn"); };
  const leave = (g: Group) => { setJoined((j) => j.filter((x) => x !== g.id)); toast(`You left ${g.name}`); };

  const create = (g: Group) => setCreated((c) => [g, ...c]);
  const publish = (id: string) => {
    setCreated((c) => c.map((g) => (g.id === id ? { ...g, status: "published" } : g)));
    toast("Published — people can find and join it now 🎉");
  };
  const remove = (id: string) => { setCreated((c) => c.filter((g) => g.id !== id)); toast("Draft deleted"); };

  const mineList = React.useMemo(() => all.filter((g) => g.mine || joined.includes(g.id)), [all, joined]);

  return { all, byId, joined, mineList, hydrated, isMember, hasAsked, memberCount, join, withdraw, leave, create, publish, remove };
}
