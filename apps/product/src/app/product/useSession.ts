"use client";
/* The signed-in person, available anywhere in the product.

   Before this, the product read identity from the seeded `me` object in
   lib/data — so it greeted "Priya" no matter who had actually signed in. This
   hook is the bridge: the session is the truth, `me` supplies only the
   engagement stats the demo has no real source for (points, streak, rank).

   SSR-safe: returns null on the server and the first client paint, then reads
   localStorage in an effect, so hydration always matches. `ready` lets callers
   avoid flashing fallback identity before the real one loads. */
import * as React from "react";
import { getSession, type Session } from "@/lib/auth";
import { me as seedMe } from "@/lib/data";

export function useSession() {
  const [session, setSession] = React.useState<Session | null>(null);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    const read = () => {
      setSession(getSession());
      setReady(true);
    };
    read();
    window.addEventListener("vadal:session", read);
    window.addEventListener("storage", read);
    return () => {
      window.removeEventListener("vadal:session", read);
      window.removeEventListener("storage", read);
    };
  }, []);

  return { session, ready } as const;
}

export type Me = {
  /** First name — what the greeting uses. */
  name: string;
  fullName: string;
  email: string;
  /** "Software Engineer · Engineering" */
  role: string;
  title: string;
  team: string;
  img: string;
  /** Demo engagement stats — no real source yet, so they stay seeded. */
  streak: number;
  points: number;
  rank: number;
  nextBadge: { name: string; left: number };
  /** False until localStorage has been read. */
  ready: boolean;
};

/** The current person, session-first with the seeded demo data as fallback. */
export function useMe(): Me {
  const { session, ready } = useSession();
  return React.useMemo(() => {
    if (!session) {
      return { ...seedMe, title: seedMe.title, ready };
    }
    return {
      name: session.name.split(" ")[0],
      fullName: session.name,
      email: session.email,
      role: `${session.title} · ${session.team}`,
      title: session.title,
      team: session.team,
      img: session.img,
      streak: seedMe.streak,
      points: seedMe.points,
      rank: seedMe.rank,
      nextBadge: seedMe.nextBadge,
      ready,
    };
  }, [session, ready]);
}
