"use client";
/* Communities — the hub. Find a room, join it, or make one.
   Discover shows what is published; Yours shows the rooms you are in and the
   drafts you have not published yet. Nudge's suggestions sit on top, and only
   name rooms you are not already in. */
import * as React from "react";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { Button, SparkMark } from "@vadal/design-system";
import { SUGGESTED, type Group, type GroupKind } from "@/lib/groups";
import { SocialTabs } from "../SocialTabs";
import { CreateGroup } from "./CreateGroup";
import { GroupCard, JoinButton } from "./GroupCard";
import { useGroups } from "./useGroups";

type View = "discover" | "yours";
type KindFilter = "all" | GroupKind;

export function GroupsHub() {
  const g = useGroups();
  const [view, setView] = React.useState<View>("discover");
  const [kind, setKind] = React.useState<KindFilter>("all");
  const [q, setQ] = React.useState("");
  const [creating, setCreating] = React.useState(false);

  const pool = view === "yours" ? g.mineList : g.all.filter((x) => x.status === "published");
  const term = q.trim().toLowerCase();
  const list = pool.filter((x) =>
    (kind === "all" || x.kind === kind) &&
    (!term || `${x.name} ${x.desc} ${x.tags.join(" ")}`.toLowerCase().includes(term)),
  );
  const suggested = SUGGESTED.map((s) => ({ ...s, group: g.byId[s.id] })).filter((s) => s.group && !g.isMember(s.id)).slice(0, 3);

  const onCreate = (grp: Group) => { g.create(grp); setView("yours"); setKind("all"); setQ(""); };

  const seg = (on: boolean) => `min-h-[44px] rounded-full px-3.5 text-[13px] font-semibold transition lg:min-h-[34px] ${on ? "bg-card text-ink shadow-sm" : "text-muted hover:text-ink"}`;

  return (
    <div className="mx-auto w-full max-w-[1100px] space-y-6">
      <SocialTabs active="groups" count={g.mineList.length} />

      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[24px] font-bold tracking-tight text-ink">Communities</h1>
          <p className="text-[14px] text-muted">Project rooms and interest circles. Find your people.</p>
        </div>
        <Button variant="brand" size="md" className="min-h-[44px] lg:min-h-0" leadingIcon={<Plus className="h-4 w-4" />} onClick={() => setCreating(true)}>New community</Button>
      </header>

      {/* Nudge — suggested for you */}
      {view === "discover" && !term && suggested.length > 0 && (
        <section aria-label="Suggested for you" className="rounded-[22px] border border-[var(--ai-border)] bg-[var(--ai-surface)] p-5">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <SparkMark size={18} tone="gradient" state="idle" />
            <h2 className="text-[15px] font-bold text-ink">Suggested for you</h2>
            <span className="w-full text-[13px] text-muted sm:w-auto">From what you post and who you work with</span>
          </div>
          <div className="mt-3 grid gap-2.5 md:grid-cols-3">
            {suggested.map(({ group, why }) => (
              <div key={group.id} className="relative flex min-w-0 items-center gap-3 rounded-2xl bg-card p-3 ring-1 ring-[var(--ai-border)] transition focus-within:ring-2 focus-within:ring-[var(--purple)] hover:shadow-sm">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[var(--ai-surface)] text-[22px]" aria-hidden>{group.emoji}</span>
                <span className="min-w-0 flex-1">
                  <Link href={`/product/feed/groups/${group.id}`} className="block truncate text-[14px] font-semibold text-ink outline-none after:absolute after:inset-0 after:content-['']">{group.name}</Link>
                  <span className="block truncate text-[12px] text-muted">{why}</span>
                </span>
                <span className="relative z-10 shrink-0"><JoinButton group={group} member={false} asked={g.hasAsked(group.id)} onJoin={() => g.join(group)} onWithdraw={() => g.withdraw(group)} /></span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-full bg-soft p-0.5" role="group" aria-label="View">
          <button className={seg(view === "discover")} aria-pressed={view === "discover"} onClick={() => setView("discover")}>Discover</button>
          <button className={seg(view === "yours")} aria-pressed={view === "yours"} onClick={() => setView("yours")}>Yours · {g.mineList.length}</button>
        </div>
        <div className="flex rounded-full bg-soft p-0.5" role="group" aria-label="Kind">
          {([["all", "All"], ["project", "Projects"], ["interest", "Interests"]] as const).map(([id, label]) => (
            <button key={id} className={seg(kind === id)} aria-pressed={kind === id} onClick={() => setKind(id)}>{label}</button>
          ))}
        </div>
        <label className="relative ml-auto w-full sm:w-[260px]">
          <span className="sr-only">Search communities</span>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search communities"
            className="min-h-[44px] w-full rounded-full border border-line bg-card pl-10 pr-4 text-[16px] text-ink outline-none transition placeholder:text-faint focus:border-[var(--purple)] lg:min-h-[38px] lg:text-[14px]"
          />
        </label>
      </div>

      {/* grid */}
      {list.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-[22px] border border-dashed border-line px-6 py-16 text-center">
          <SparkMark size={28} tone="gradient" state="idle" />
          <p className="text-[15px] font-semibold text-ink">
            {term ? `Nothing matches “${q.trim()}”` : view === "yours" ? "You are not in any communities yet" : "No communities of this kind yet"}
          </p>
          <p className="max-w-[360px] text-[14px] text-faint">
            {term ? "Try a different word — or start the room yourself." : "Join one from Discover, or make the room you wish existed."}
          </p>
          <Button variant="secondary" size="sm" className="mt-2 min-h-[44px] lg:min-h-0" onClick={() => setCreating(true)}>New community</Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((x, i) => (
            <GroupCard
              key={x.id}
              group={x}
              index={i}
              member={g.isMember(x.id)}
              asked={g.hasAsked(x.id)}
              count={g.memberCount(x)}
              onJoin={() => g.join(x)}
              onWithdraw={() => g.withdraw(x)}
            />
          ))}
        </div>
      )}

      <CreateGroup open={creating} onClose={() => setCreating(false)} onCreate={onCreate} />
    </div>
  );
}
