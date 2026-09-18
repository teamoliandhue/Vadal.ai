"use client";
/* The share studio (Amplify v2, spec 048).

   Left: everything that's ready to share, yours first — a moment of your own
   outranks anything the company published, because it's true, recent and
   yours. Right: the one you picked — why it's worth the outside seeing, the
   caption in your voice, and a live preview of the post beside it.

   On a phone the list is the page and the studio opens as a bottom sheet, so
   choosing and writing never compete for 375 pixels. */
import * as React from "react";
import Image from "next/image";
import { Award, GraduationCap, PartyPopper, Rocket, Sparkles, ThumbsDown, type LucideIcon } from "lucide-react";
import { Badge, SparkMark } from "@vadal/design-system";
import type { Moment, MomentKind, Voice } from "@/lib/ai/engines/advocacy";
import type { Platform } from "@/lib/ai/engines/timing";
import type { CompanyPost } from "@/lib/amplify";
import { DECLINE_REASONS, type DeclineReason } from "@/lib/share";
import { Drawer } from "../Drawer";
import { Composer } from "./Composer";
import { Mark } from "./parts";

const KIND: Record<MomentKind, { icon: LucideIcon; label: string }> = {
  kudos: { icon: Award, label: "Recognition" },
  shipped: { icon: Rocket, label: "Shipped" },
  certification: { icon: GraduationCap, label: "Certification" },
  milestone: { icon: PartyPopper, label: "Milestone" },
};

export type Item =
  | { kind: "moment"; id: string; moment: Moment }
  | { kind: "post"; id: string; post: CompanyPost };

const NARROW = "(max-width: 1023px)";
const subscribe = (f: () => void) => { const m = window.matchMedia(NARROW); m.addEventListener("change", f); return () => m.removeEventListener("change", f); };
const useNarrow = () => React.useSyncExternalStore(subscribe, () => window.matchMedia(NARROW).matches, () => false);

export function Studio({ items, prefs, onPassMoment, onDeclinePost, caughtUp }: {
  items: Item[];
  prefs: { voice: Voice; platform: Platform };
  onPassMoment: (id: string) => void;
  onDeclinePost: (id: string, reason: DeclineReason) => void;
  caughtUp: React.ReactNode;
}) {
  const narrow = useNarrow();
  const [selected, setSelected] = React.useState<string | null>(null);
  const [sheet, setSheet] = React.useState(false);
  const current = items.find((i) => i.id === selected) ?? (narrow ? null : items[0]) ?? null;
  const mine = items.filter((i) => i.kind === "moment");
  const company = items.filter((i) => i.kind === "post");

  const pick = (id: string) => { setSelected(id); if (narrow) setSheet(true); };

  if (items.length === 0) return <>{caughtUp}</>;

  const list = (
    <nav aria-label="Ready to share" className="flex flex-col gap-5">
      {mine.length > 0 && <Group title="Yours" hint="Things that happened to you" items={mine} current={narrow ? null : current?.id ?? null} onPick={pick} />}
      {company.length > 0 && <Group title="From the company" hint="Already public — reshare in your words" items={company} current={narrow ? null : current?.id ?? null} onPick={pick} />}
    </nav>
  );

  const panel = current && (
    <Panel
      key={current.id} item={current} prefs={prefs}
      onPass={() => { if (current.kind === "moment") onPassMoment(current.id); setSelected(null); setSheet(false); }}
      onDecline={(r) => { if (current.kind === "post") onDeclinePost(current.id, r); setSelected(null); setSheet(false); }}
    />
  );

  if (narrow) {
    return (
      <>
        {list}
        <Drawer open={sheet && !!current} title="Share" onClose={() => setSheet(false)}>{panel}</Drawer>
      </>
    );
  }

  return (
    <div className="grid grid-cols-[300px_minmax(0,1fr)] items-start gap-6">
      <div className="sticky top-4">{list}</div>
      <section className="rounded-[28px] border border-line bg-card p-6 shadow-[0_1px_2px_rgba(20,20,40,0.04),0_24px_56px_-36px_rgba(20,20,40,0.3)] xl:p-7">{panel}</section>
    </div>
  );
}

function Group({ title, hint, items, current, onPick }: { title: string; hint: string; items: Item[]; current: string | null; onPick: (id: string) => void }) {
  return (
    <section>
      <div className="flex items-baseline justify-between gap-2 px-1">
        <h2 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-faint">{title} <span className="tabular-nums">{items.length}</span></h2>
      </div>
      <p className="px-1 text-[12px] text-faint">{hint}</p>
      <ul className="mt-2 flex flex-col gap-1.5">
        {items.map((it) => {
          const on = current === it.id;
          const upcoming = it.kind === "moment" && /^in \d/.test(it.moment.when);
          return (
            <li key={it.id}>
              <button
                onClick={() => onPick(it.id)}
                aria-current={on ? "true" : undefined}
                className={`flex w-full items-center gap-3 rounded-2xl border p-2.5 text-left transition ${on ? "border-[color-mix(in_srgb,var(--purple)_45%,var(--line))] bg-[var(--lav)]" : "border-transparent hover:bg-soft"}`}
              >
                <Thumb item={it} />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5 text-[12px] text-faint">
                    {it.kind === "moment" ? <>{KIND[it.moment.kind].label} · {it.moment.when}</> : <><Mark platform={it.post.platform} size={14} /> {it.post.posted}</>}
                    {upcoming && <Badge tone="brand" variant="soft" size="sm">Soon</Badge>}
                    {it.kind === "post" && it.post.inAdvocacyQueue && <Badge tone="brand" variant="soft" size="sm">Picked</Badge>}
                  </span>
                  <span className="mt-0.5 line-clamp-2 block text-[14px] font-semibold leading-snug text-ink">{it.kind === "moment" ? it.moment.what : it.post.text}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function Thumb({ item }: { item: Item }) {
  const img = item.kind === "moment" ? item.moment.image : item.post.image;
  if (img) return <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-soft"><Image src={img} alt="" fill sizes="48px" className="object-cover" /></span>;
  const Icon = item.kind === "moment" ? KIND[item.moment.kind].icon : Sparkles;
  return <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-soft text-[var(--purple)]"><Icon className="h-5 w-5" strokeWidth={1.8} /></span>;
}

function Panel({ item, prefs, onPass, onDecline }: {
  item: Item; prefs: { voice: Voice; platform: Platform }; onPass: () => void; onDecline: (r: DeclineReason) => void;
}) {
  const [declining, setDeclining] = React.useState(false);
  const isMoment = item.kind === "moment";
  const Icon = isMoment ? KIND[item.moment.kind].icon : Sparkles;

  return (
    <div className="flex flex-col gap-5">
      <header className="pr-10 lg:pr-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-soft px-2.5 py-1 text-[12px] font-semibold text-muted">
            <Icon className="h-3.5 w-3.5" /> {isMoment ? `${KIND[item.moment.kind].label} · ${item.moment.when}` : `${item.post.platform} · ${item.post.posted}`}
          </span>
          {!isMoment && item.post.sharedBy ? <span className="text-[12px] text-faint">{item.post.sharedBy} colleagues shared it</span> : null}
          <button
            onClick={() => (isMoment ? onPass() : setDeclining((v) => !v))}
            aria-expanded={isMoment ? undefined : declining}
            className="ml-auto flex min-h-[44px] items-center gap-1.5 rounded-full px-3 text-[13px] font-semibold text-muted transition hover:bg-soft hover:text-ink lg:min-h-[34px]"
          >
            <ThumbsDown className="h-3.5 w-3.5" /> {isMoment ? "Not this one" : "Not for me"}
          </button>
        </div>
        <h2 className={`mt-3 font-bold leading-[1.25] tracking-[-0.02em] text-ink ${isMoment ? "text-[clamp(20px,2vw,24px)]" : "line-clamp-3 text-[clamp(18px,1.8vw,21px)]"}`}>
          {isMoment ? item.moment.what : item.post.text}
        </h2>
        {!isMoment && <p className="mt-2 text-[13px] text-faint">The company&rsquo;s post is attached to yours — see it in the preview.</p>}
        {isMoment && (
          <p className="mt-2.5 flex items-start gap-2 text-[14px] leading-relaxed text-muted">
            <SparkMark size={14} tone="gradient" className="mt-[3px] shrink-0" /> {item.moment.why}
          </p>
        )}
      </header>

      {declining && !isMoment && (
        <div className="rounded-2xl bg-soft p-4">
          <p className="text-[14px] font-semibold">No problem. Anything we should know?</p>
          <p className="mt-1 text-[12px] text-faint">Optional, and never attributed to you.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {DECLINE_REASONS.map((r) => (
              <button key={r.key} onClick={() => onDecline(r.key)} className="min-h-[44px] rounded-full border border-line bg-card px-3.5 text-[14px] font-medium transition hover:border-[var(--purple)] lg:min-h-[38px]">
                {r.label}
              </button>
            ))}
          </div>
          <button onClick={() => onDecline("not-now")} className="mt-2 min-h-[44px] text-[13px] font-semibold text-muted hover:text-ink lg:min-h-0">Just skip it</button>
        </div>
      )}

      <Composer
        subject={isMoment ? { kind: "moment", moment: item.moment } : { kind: "post", post: item.post }}
        title="Written as you" defaultVoice={prefs.voice} defaultPlatform={prefs.platform} layout="studio"
      />
    </div>
  );
}

