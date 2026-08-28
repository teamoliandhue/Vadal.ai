"use client";
/* Session identity on Home.

   Home is a server component and used to read the seeded `me` object, so it
   greeted "Priya" no matter who had signed in — the audit's fourth critical.
   These small client pieces read the real session instead.

   Each one holds a neutral placeholder until localStorage has been read, rather
   than painting the seeded name and swapping it a frame later. A visible flash
   of the wrong person's name is worse than a beat of nothing, especially on the
   one line of the product that is explicitly personal. */
import * as React from "react";
import { Avatar } from "@vadal/design-system";
import { useMe } from "../useSession";

/** The greeting's first name — "Good morning, Aarav 👋". */
export function MyFirstName() {
  const me = useMe();
  if (!me.ready) {
    return (
      <span
        className="inline-block h-[0.72em] w-[3.2em] animate-pulse rounded-full bg-line align-baseline"
        aria-hidden
      />
    );
  }
  return <span style={{ color: "var(--client-brand, var(--purple))" }}>{me.name}</span>;
}

/** Avatar + name + "Title · Team" — the header of the You card. */
export function MyIdentityHeader() {
  const me = useMe();
  return (
    <div className="flex items-center gap-3">
      <span
        className="grid place-items-center rounded-full p-[2.5px]"
        style={{ background: "linear-gradient(135deg,var(--purple),#a99df9)" }}
      >
        <span className="rounded-full ring-2 ring-card">
          <Avatar src={me.img} name={me.fullName} size="lg" />
        </span>
      </span>
      <div className="min-w-0">
        {me.ready ? (
          <>
            <h3 className="truncate text-[16px] font-bold tracking-tight">{me.name}</h3>
            <p className="truncate text-[12px] text-faint">{me.role}</p>
          </>
        ) : (
          <>
            <span className="block h-[15px] w-24 animate-pulse rounded-full bg-line" aria-hidden />
            <span className="mt-1.5 block h-[11px] w-32 animate-pulse rounded-full bg-line" aria-hidden />
          </>
        )}
      </div>
    </div>
  );
}
