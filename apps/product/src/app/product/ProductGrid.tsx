"use client";
/* ═══════════════════ the nine, as windows ═══════════════════
   One card per product, each carrying a live fragment of it at stamp size —
   the thing you would see inside — so the grid is a set of small windows,
   not a menu. Shared by Get Started (where a card jumps to that product's
   scene) and Home (where a card opens the product itself). Monochrome and
   violet; colour only where it means something. */
import * as React from "react";
import Link from "next/link";
import { ArrowRight, FolderKanban, Gauge, GraduationCap, HeartPulse, LifeBuoy, Lock, Megaphone, Newspaper, Share2, UsersRound } from "lucide-react";
import { Avatar } from "@vadal/design-system";
import { Sparkline } from "@/components/charts";
import { productTiles, type ProductTile } from "@/lib/tour";
import { engagementTrend } from "@/lib/data";
import { feedItems } from "@/lib/feed";
import { myReachSeries } from "@/lib/amplify";
import { challengeProgress } from "@/lib/thrive";
import { campaigns } from "@/lib/campaigns";
import { learningDays } from "@/lib/grow";
import { counsellors } from "@/lib/help";
import { reports } from "@/lib/manager";
import { cases } from "@/lib/cases";
import { useViewAs } from "./useViewAs";

/** The nav's own icon for each product — so the thing you meet here is the
    thing you will recognise in the sidebar a minute later. Drawn at the app's
    line weight (1.75 at 17px), not the library default. */
const ICO = "h-[17px] w-[17px]";
const PRODUCT_ICON: Record<string, React.ReactNode> = {
  Listen: <Gauge className={ICO} strokeWidth={1.75} />,
  Social: <Newspaper className={ICO} strokeWidth={1.75} />,
  Amplify: <Share2 className={ICO} strokeWidth={1.75} />,
  iThrive: <HeartPulse className={ICO} strokeWidth={1.75} />,
  Broadcast: <Megaphone className={ICO} strokeWidth={1.75} />,
  iLearn: <GraduationCap className={ICO} strokeWidth={1.75} />,
  SmartWork: <LifeBuoy className={ICO} strokeWidth={1.75} />,
  Managers: <UsersRound className={ICO} strokeWidth={1.75} />,
  Flow: <FolderKanban className={ICO} strokeWidth={1.75} />,
};

/* A fragment of each product, live — the thing you would see inside it, at
   stamp size. A falling report is red, reach is green; everything else stays
   monochrome and violet. */
function Mini({ name, idPrefix }: { name: string; idPrefix: string }) {
  const V = "var(--client-brand, var(--purple))";
  switch (name) {
    case "Listen":
      return <span className="flex items-end gap-2"><span className="w-16"><Sparkline id={`${idPrefix}-pulse`} values={engagementTrend.series} color={V} height={26} /></span><span className="text-[13px] font-bold tabular-nums">{engagementTrend.series.at(-1)}</span></span>;
    case "Social": {
      const post = feedItems[0];
      const hearts = Object.values(post.reactions).reduce((a, b) => a + (b ?? 0), 0);
      return <span className="flex items-center gap-1.5"><span className="flex -space-x-1.5">{post.reactedBy.slice(0, 3).map((src, i) => <Avatar key={i} src={src} name="" size="xs" />)}</span><span className="text-[12px] font-semibold tabular-nums text-muted">♥ {hearts}</span></span>;
    }
    case "Amplify":
      return <span className="flex items-end gap-2"><span className="w-16"><Sparkline id={`${idPrefix}-reach`} values={myReachSeries} color="var(--success)" height={26} /></span><span className="text-[13px] font-bold tabular-nums">{myReachSeries.at(-1)}</span></span>;
    case "iThrive": {
      const d = challengeProgress.days, mx = Math.max(...d);
      return <span className="flex h-7 items-end gap-[3px]">{d.map((v, i) => <span key={i} className="w-[6px] rounded-[2px]" style={{ height: `${Math.max(18, (v / mx) * 100)}%`, background: v >= challengeProgress.target ? V : "color-mix(in srgb, var(--muted) 30%, transparent)" }} />)}</span>;
    }
    case "Broadcast": {
      const c = campaigns[0];
      return <span className="flex w-24 flex-col gap-1"><span className="flex justify-between text-[10.5px] text-faint"><span>reach</span><span className="font-semibold tabular-nums text-ink">{c.reach}%</span></span><span className="h-1.5 overflow-hidden rounded-full bg-soft"><span className="block h-full rounded-full" style={{ width: `${c.reach}%`, background: V }} /></span></span>;
    }
    case "iLearn": {
      const mx = Math.max(...learningDays.map((d) => d.minutes), 1);
      return <span className="flex h-7 items-end gap-[3px]">{learningDays.map((d, i) => <span key={i} className="w-[6px] rounded-[2px]" style={{ height: d.minutes ? `${Math.max(22, (d.minutes / mx) * 100)}%` : "14%", background: d.minutes ? V : "var(--line)" }} />)}</span>;
    }
    case "SmartWork": {
      const c = counsellors[0];
      return <span className="flex items-center gap-2"><Avatar src={c.img} name={c.name} size="sm" /><span className="text-[11.5px] leading-tight text-muted">{c.nextAvailable.replace("Today, ", "")}<br /><span className="text-faint">today</span></span></span>;
    }
    case "Managers": {
      const r = reports[0];
      return <span className="flex items-end gap-2"><span className="w-16"><Sparkline id={`${idPrefix}-team`} values={r.spark} color={r.trend === "down" ? "var(--danger)" : "var(--success)"} height={26} /></span><span className="text-[13px] font-bold tabular-nums">{r.sentiment}</span></span>;
    }
    case "Flow": {
      const c = cases[0]; const r = 14, circ = 2 * Math.PI * r, pct = Math.max(0, Math.min(1, c.slaDays / 3));
      return <span className="relative grid h-9 w-9 place-items-center"><svg viewBox="0 0 36 36" className="absolute inset-0 -rotate-90" aria-hidden><circle cx="18" cy="18" r={r} fill="none" stroke="var(--line)" strokeWidth="3.5" /><circle cx="18" cy="18" r={r} fill="none" stroke="var(--warning)" strokeWidth="3.5" strokeLinecap="round" strokeDasharray={`${pct * circ} ${circ}`} /></svg><span className="text-[10.5px] font-bold tabular-nums">{c.slaDays}d</span></span>;
    }
    default: return null;
  }
}

const CARD = "prod-tile prod-card group relative flex min-h-[86px] w-full items-center gap-3 overflow-hidden rounded-2xl border border-line bg-card px-4 py-3 text-left focus:outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--brand)]";

function CardBody({ t, idPrefix }: { t: ProductTile; idPrefix: string }) {
  return (
    <>
      <span aria-hidden className="pointer-events-none absolute -bottom-3 right-3 select-none text-[44px] font-extrabold leading-none tracking-[-0.06em] text-ink opacity-[0.025]">{String(t.n).padStart(2, "0")}</span>
      <span className="prod-ico grid h-9 w-9 shrink-0 place-items-center rounded-[11px]">{PRODUCT_ICON[t.name]}</span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <span className="text-[14.5px] font-semibold leading-tight tracking-[-0.01em]">{t.name}</span>
          {t.locked && <Lock className="h-3 w-3 shrink-0 text-faint" aria-label="Not available to your role" />}
          <ArrowRight className="prod-go hidden h-3.5 w-3.5 shrink-0 sm:block" aria-hidden />
        </span>
        <span className="mt-0.5 block text-[11.5px] leading-tight text-faint">{t.short}</span>
      </span>
      <span className="relative hidden shrink-0 sm:block"><Mini name={t.name} idPrefix={idPrefix} /></span>
    </>
  );
}

/**
 * `mode="tour"` — a card jumps to that product's scene (`onGo(index)`), and the
 *   cards enter with the scene (`story-in`, lit by the scene's `data-in`).
 * `mode="nav"` — a card is a link to the product; a locked one stays visible,
 *   says so, and goes nowhere. Cards rise on mount, like the rest of Home.
 */
export function ProductGrid({ mode, onGo, idPrefix = "mini" }: { mode: "tour" | "nav"; onGo?: (i: number) => void; idPrefix?: string }) {
  const [role] = useViewAs();
  const tiles = productTiles(role);
  const enter = mode === "tour" ? "story-in" : "rise";
  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {tiles.map((t, i) => {
        const delay = mode === "tour" ? { transitionDelay: `${i * 45}ms` } : { animationDelay: `${0.05 + i * 0.04}s` };
        return (
          <li key={t.n} className="min-w-0">
            {mode === "tour" ? (
              <button type="button" onClick={() => onGo?.(t.index)} className={`${CARD} ${enter}`} style={delay}>
                <CardBody t={t} idPrefix={idPrefix} />
              </button>
            ) : t.locked ? (
              <div aria-disabled="true" className={`${CARD} ${enter} cursor-default opacity-70`} style={delay}>
                <CardBody t={t} idPrefix={idPrefix} />
              </div>
            ) : (
              <Link href={t.href} className={`${CARD} ${enter}`} style={delay}>
                <CardBody t={t} idPrefix={idPrefix} />
              </Link>
            )}
          </li>
        );
      })}
    </ul>
  );
}
