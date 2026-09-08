"use client";
/* Home's view layer — the ritual hero, then what the product does.

   Home used to be the greeting plus one person's to-do list, which meant a
   product with seventeen sections was represented by a calendar and a kudos
   card. The daily workspace moved to /product/myday, unchanged; what replaces
   it here is a live showcase (./Showcase) built from the real engines on the
   real data.

   This is a client component for one specific reason: the first-run preview is
   driven by ?view=new, and awaiting the server-side `searchParams` promise made
   the segment dynamic — against this route's loading.tsx boundary that hydrated
   to a blank tree, so Home silently rendered nothing. Reading the query with
   useSearchParams here fixes it and keeps the preview working. The greeting is
   still computed on the server and passed in, so there is no hydration mismatch
   on the one string that depends on the clock. (Same defect and same fix as
   /product/analytics.) */
import * as React from "react";
import { useSearchParams } from "next/navigation";
import { Clock } from "lucide-react";
import { Button } from "@vadal/design-system";
import { org, me, myDay, myCalendar } from "@/lib/data";
import { MoodCheck } from "./MoodCheck";
import { Showcase } from "./Showcase";
import { HomeBrandLayer, VadalBadge } from "./HomeBrandLayer";
import { ViewAsSwitch } from "./HomeRole";
import { MyFirstName } from "./Identity";

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-faint">{children}</p>;
}

export function HomeContent({ greeting }: { greeting: string }) {
  // Home §1–7: client-brand band, conversational mood, calendar, hooks, view-as role.
  const firstTime = useSearchParams().get("view") === "new";
  return (
    <>
      <RitualHero firstTime={firstTime} greeting={greeting} />
      <Showcase />
    </>
  );
}

/* ── 1 · Ritual hero — greeting + mood, with a focal "Up next" ── */
function RitualHero({ firstTime, greeting }: { firstTime: boolean; greeting: string }) {
  const upNext = myCalendar.find((e) => e.now) ?? myCalendar.find((e) => e.prep) ?? myCalendar[0];
  return (
    <header className="rise relative overflow-hidden rounded-[28px] border border-line bg-card shadow-[0_1px_2px_rgba(20,20,40,0.04),0_18px_42px_-26px_rgba(20,20,40,0.22)]">
      <HomeBrandLayer />
      <div
        className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full opacity-[0.08] blur-3xl"
        style={{ background: "radial-gradient(circle, var(--client-brand, var(--purple)), transparent 70%)" }}
        aria-hidden
      />
      <div className="relative flex flex-wrap items-center justify-between gap-3 px-7 pt-5 sm:px-9">
        <ViewAsSwitch />
        <VadalBadge />
      </div>
      <div className="relative grid gap-8 px-7 pb-7 pt-4 sm:px-9 sm:pb-9 lg:grid-cols-[1.25fr_0.85fr] lg:items-start lg:gap-12">
        <div>
          <Eyebrow>{org.date}</Eyebrow>
          <h1 className="mt-3 text-[clamp(30px,4.4vw,46px)] font-bold leading-[1.03] tracking-[-0.025em]">
            {firstTime ? "Welcome" : greeting}, <MyFirstName /> <span aria-hidden>👋</span>
          </h1>
          <p className="mt-3 max-w-md text-[16px] leading-relaxed text-muted">
            {firstTime ? (
              <>Let’s set up your day — start with a quick mood check-in. We’ll fill the rest as you go.</>
            ) : (
              <>You’ve got <b className="font-semibold text-ink">{myDay.length} things</b> today, and you’re on a <b className="font-semibold text-ink">{me.streak}-day</b> streak. 🔥</>
            )}
          </p>
        </div>
        <div className="lg:border-l lg:border-line lg:pl-12">
          <MoodCheck firstTime={firstTime} />
        </div>
      </div>
      {!firstTime && (
        <div className="relative flex flex-wrap items-center justify-between gap-3 border-t border-line bg-soft px-7 py-4 sm:px-9">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[var(--lav)] text-[var(--purple)]">
              <Clock className="h-[18px] w-[18px]" />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Eyebrow>Up next</Eyebrow>
                <span className="flex items-center gap-1 text-[11px] font-medium text-faint"><span aria-hidden>📅</span> Google Calendar</span>
              </div>
              <p className="truncate text-[14px] font-semibold">
                {upNext.title} <span className="font-normal text-faint">· {upNext.time} · {upNext.with}</span>
              </p>
            </div>
          </div>
          <Button variant="brand" size="sm" className="min-h-[44px] lg:min-h-0">{upNext.now ? "Join" : upNext.prep ? "Prep" : "View"}</Button>
        </div>
      )}
    </header>
  );
}
