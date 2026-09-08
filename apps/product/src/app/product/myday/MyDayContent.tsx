"use client";
/* MY DAY — the employee daily workspace.

   This was the body of Home. Home now opens the product: the greeting stays
   there and the rest of it — what you have to do, your calendar, your kudos,
   your feed — lives here, one click away and unchanged.

   Split because Home was doing two jobs badly at once. It was the personal
   ritual AND the only screen anyone saw first, so a product with seventeen
   sections was represented by one person's to-do list. Neither job was served:
   the ritual was buried under cards, and the breadth was invisible.

   Client component for the same reason Home was: the first-run preview is
   driven by ?view=new, and awaiting server-side searchParams made the segment
   dynamic, which against this route's loading.tsx boundary hydrated to a blank
   tree. */
import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight, Award, Gift, Heart, Trophy } from "lucide-react";
import { Avatar, Badge, Button, Trend } from "@vadal/design-system";
import { Sparkline } from "@/components/charts";
import { me, myRecognition, communities, engagementTrend } from "@/lib/data";
import { MyDay } from "../home/MyDay";
import { QuickPoll } from "../home/QuickPoll";
import { Feed } from "../home/Feed";
import { AskAi } from "../home/AskAi";
import { CalendarCard } from "../home/CalendarCard";
import { HooksCard } from "../home/HooksCard";
import { ManagerSnapshot } from "../home/HomeRole";
import { MyIdentityHeader } from "../home/Identity";

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-faint">{children}</p>;
}

export function MyDayContent() {
  const firstTime = useSearchParams().get("view") === "new";
  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-12 xl:items-start">
      {/* LEFT (wider, action-first) — what you need to do, then who you are */}
      <div className="flex flex-col gap-6 xl:col-span-7">
        <ManagerSnapshot />
        <MyDay empty={firstTime} />
        <CalendarCard />
        <YouCard firstTime={firstTime} />
        <HooksCard />
        <QuickPoll className="card-lift" firstTime={firstTime} />
        <RecognitionCard firstTime={firstTime} />
        <CommunitiesCard />
      </div>
      {/* RIGHT (narrower) — AI on top, then the feed (natural height) */}
      <div className="flex flex-col gap-6 xl:col-span-5">
        <AskAi />
        <Feed empty={firstTime} showMore />
      </div>
    </div>
  );
}

/* ── 2 · You — personal panel with a narrative engagement trend ── */
function YouCard({ className = "", firstTime = false }: { className?: string; firstTime?: boolean }) {
  const es = engagementTrend.series;
  const engScore = es[es.length - 1];
  const engDelta = engScore - es[es.length - 4];
  const stats: [React.ReactNode, string][] = firstTime
    ? [["0", "Points"], ["0", "Day streak"], ["—", "Team rank"]]
    : [[me.points.toLocaleString(), "Points"], [me.streak, "Day streak"], [`#${me.rank}`, "Team rank"]];
  return (
    <section className={`card-lift flex flex-col rounded-[26px] border border-line bg-card p-6 sm:p-7 ${className}`}>
      <MyIdentityHeader />

      <div className="mt-6 grid grid-cols-3 divide-x divide-line">
        {stats.map(([value, label]) => (
          <div key={label} className="px-2 text-center first:pl-0 last:pr-0">
            <div className="text-[22px] font-bold tracking-tight">{value}</div>
            <div className="mt-0.5 text-[12px] text-faint">{label}</div>
          </div>
        ))}
      </div>

      {firstTime ? (
        <div className="mt-5 rounded-2xl border border-dashed border-line p-4 text-center">
          <p className="text-[14px] font-semibold">Your engagement insights appear after your first week 📈</p>
          <p className="mt-1 text-[14px] text-faint">Check in daily and recognise teammates to get started.</p>
        </div>
      ) : (
        <div className="mt-5 rounded-2xl border border-line p-4">
          <div className="flex items-center justify-between">
            <Eyebrow>Your engagement</Eyebrow>
            <span className="flex items-center gap-1.5">
              <span className="text-[16px] font-bold tracking-tight">{engScore}</span>
              <Trend direction={engDelta >= 0 ? "up" : "down"} value={String(Math.abs(engDelta))} />
            </span>
          </div>
          <Sparkline values={engagementTrend.series} benchmark={engagementTrend.benchmark} color="#6d5df0" id="you-eng" height={42} className="mt-2.5" />
          <div className="mt-1.5 flex items-center gap-3 text-[12px] text-faint">
            <span className="flex items-center gap-1.5"><span className="h-[2px] w-4 rounded-full bg-[#6d5df0]" /> You</span>
            <span className="flex items-center gap-1.5"><span className="h-0 w-4 border-t border-dashed border-faint" /> Benchmark</span>
          </div>
          <p className="mt-2 text-[14px] leading-snug text-faint">{engagementTrend.insight}</p>
        </div>
      )}

      <div className="mt-4 rounded-2xl bg-soft p-4">
        <div className="flex items-center gap-2 text-[14px] font-semibold">
          <Award className="h-4 w-4 text-[var(--purple)]" /> {firstTime ? "Earn points to unlock badges" : `${me.nextBadge.left} more to “${me.nextBadge.name}”`}
        </div>
        <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-line">
          <span className="block h-full rounded-full bg-[var(--purple)]" style={{ width: firstTime ? "4%" : "66%" }} />
        </div>
      </div>

      <Link href="/product/recognition" className="mt-auto block">
        <Button variant="tertiary" leadingIcon={<Trophy className="h-4 w-4 text-[var(--purple)]" />} className="w-full">
          View leaderboard
        </Button>
      </Link>
    </section>
  );
}

/* ── 3 · Recognition ── */
function RecognitionCard({ className = "", firstTime = false }: { className?: string; firstTime?: boolean }) {
  return (
    <section className={`card-lift flex flex-col rounded-[26px] border border-line bg-card p-6 sm:p-7 ${className}`}>
      <div className="flex items-end justify-between">
        <div>
          <Eyebrow>Kudos</Eyebrow>
          <h2 className="mt-1.5 text-[18px] font-bold tracking-tight">Recognition for you</h2>
        </div>
        <Heart className="h-4 w-4 text-[var(--purple)]" />
      </div>
      {firstTime ? (
        <div className="mt-4 flex flex-1 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-line py-12 text-center">
          <Gift className="h-7 w-7 text-[var(--purple)]" />
          <p className="text-[14px] font-semibold">No kudos yet</p>
          <p className="text-[14px] text-faint">Give recognition first — it usually comes back around.</p>
        </div>
      ) : (
        <ul className="mt-4 space-y-3">
          {myRecognition.map((r) => (
            <li key={r.from} className="rounded-2xl border border-line p-4">
              <div className="flex items-center gap-2.5">
                <Avatar src={r.img} name={r.from} size="sm" />
                <span className="text-[14px] font-semibold">{r.from}</span>
                <Badge tone="brand" variant="soft" size="sm">{r.value}</Badge>
                <span className="ml-auto text-[12px] text-faint">{r.time}</span>
              </div>
              <p className="mt-2 text-[16px] leading-relaxed text-muted">{r.text}</p>
            </li>
          ))}
        </ul>
      )}
      <Link href="/product/recognition" className="mt-auto block">
        <Button variant="tertiary" leadingIcon={<Gift className="h-4 w-4 text-[var(--purple)]" />} className="w-full">
          Recognise a teammate
        </Button>
      </Link>
    </section>
  );
}

/* ── 4 · Communities ── */
function CommunitiesCard({ className = "" }: { className?: string }) {
  return (
    <section className={`card-lift rounded-[26px] border border-line bg-card p-6 sm:p-7 ${className}`}>
      <div className="flex items-end justify-between">
        <div>
          <Eyebrow>Belong</Eyebrow>
          <h2 className="mt-1.5 text-[18px] font-bold tracking-tight">Your communities</h2>
        </div>
        <button className="flex items-center gap-1 text-[14px] font-semibold text-[var(--purple)] transition hover:gap-1.5">
          Explore <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {communities.map((c) => (
          <button key={c.name} className="flex items-center gap-3 rounded-2xl border border-line p-3.5 text-left transition hover:bg-soft">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-[16px] font-bold text-white" style={{ background: c.color }}>{c.name[0]}</span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[14px] font-semibold">{c.name}</div>
              <div className="mt-0.5 flex items-center gap-1.5 text-[12px] text-faint">
                <span>{c.members} members</span>
                {c.fresh > 0 && <span className="font-semibold text-[var(--purple)]">· {c.fresh} new</span>}
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
