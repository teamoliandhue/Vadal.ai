"use client";
/* One community on the hub. The whole card opens the room; the button on it
   joins without leaving the page. A tinted band carries the emoji so a grid of
   them reads as different places rather than one list. */
import Link from "next/link";
import { Check, Clock3, Lock } from "lucide-react";
import { Avatar, Badge } from "@vadal/design-system";
import { KIND_LABEL, type Group } from "@/lib/groups";

export function Faces({ people, max = 4 }: { people: { name: string; img: string }[]; max?: number }) {
  return (
    <span className="flex -space-x-2">
      {people.slice(0, max).map((p) => (
        <span key={p.name} className="flex rounded-full ring-2 ring-[var(--card)]"><Avatar src={p.img} name={p.name} size="sm" /></span>
      ))}
    </span>
  );
}

export function JoinButton({
  group, member, asked, onJoin, onWithdraw, size = "sm",
}: {
  group: Group; member: boolean; asked: boolean; onJoin: () => void; onWithdraw: () => void; size?: "sm" | "md";
}) {
  const base = `inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-full px-4 text-[13px] font-semibold transition ${size === "md" ? "lg:min-h-[40px]" : "lg:min-h-[34px]"}`;
  if (group.mine) return <span className={`${base} bg-soft text-muted`}>Owner</span>;
  if (member) return <span className={`${base} bg-[var(--lav)] text-[var(--purple)]`}><Check className="h-3.5 w-3.5" /> Joined</span>;
  if (asked)
    return (
      <button onClick={onWithdraw} className={`${base} bg-soft text-muted hover:text-ink`}>
        <Clock3 className="h-3.5 w-3.5" /> Requested
      </button>
    );
  return (
    <button
      onClick={onJoin}
      className={`${base} bg-[var(--purple)] text-white hover:opacity-90`}
    >
      {group.privacy === "request" ? "Ask to join" : "Join"}
    </button>
  );
}

export function GroupCard({
  group, member, asked, count, onJoin, onWithdraw, index = 0,
}: {
  group: Group; member: boolean; asked: boolean; count: number; onJoin: () => void; onWithdraw: () => void; index?: number;
}) {
  const project = group.kind === "project";
  return (
    /* A stretched link, not a link around everything: the Join button is a
       real button beside it, never an interactive element inside an anchor. */
    <article
      style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
      className="rise card-lift group relative flex flex-col overflow-hidden rounded-[22px] border border-line bg-card transition focus-within:ring-2 focus-within:ring-[var(--purple)]"
    >
      <div className={`relative flex h-[76px] items-end px-5 ${project ? "bg-[var(--lav)]" : "bg-[var(--ai-surface)]"}`}>
        <span className="absolute right-4 top-3 flex items-center gap-1.5">
          {group.status === "draft" && <Badge tone="warning" size="sm">Draft</Badge>}
          <Badge tone={project ? "brand" : "info"} size="sm">{KIND_LABEL[group.kind]}</Badge>
        </span>
        <span className="grid h-14 w-14 translate-y-5 place-items-center rounded-2xl border border-line bg-card text-[28px] shadow-sm" aria-hidden>{group.emoji}</span>
      </div>
      <div className="flex flex-1 flex-col px-5 pb-5 pt-8">
        <h3 className="flex items-center gap-1.5 text-[16px] font-bold tracking-tight text-ink">
          <Link href={`/product/feed/groups/${group.id}`} className="truncate outline-none after:absolute after:inset-0 after:content-['']">{group.name}</Link>
          {group.privacy === "request" && <Lock className="h-3.5 w-3.5 shrink-0 text-faint" aria-label="Ask to join" />}
        </h3>
        <p className="mt-1 line-clamp-2 min-h-[40px] text-[14px] leading-snug text-muted">{group.desc}</p>
        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="flex min-w-0 items-center gap-2">
            <Faces people={group.roster} />
            <span className="truncate text-[12px] text-faint">{count} · {group.activity}</span>
          </span>
          <span className="relative z-10 shrink-0"><JoinButton group={group} member={member} asked={asked} onJoin={onJoin} onWithdraw={onWithdraw} /></span>
        </div>
      </div>
    </article>
  );
}
