"use client";
/* A community's own page: who it is for, the conversation inside it, and the
   people in it. Members post; everyone else reads an open room and is asked to
   join, or sees only the door of a closed one. It carries the conversation
   about the work — never the tasks. */
import * as React from "react";
import Link from "next/link";
import { ArrowLeft, CalendarClock, ChevronDown, Globe2, Lock, LogOut, Users } from "lucide-react";
import { Avatar, Badge, Button, SparkMark } from "@vadal/design-system";
import { KIND_LABEL, groupPosts, refOf, type Group } from "@/lib/groups";
import { Composer } from "../../Composer";
import { PostCard } from "../../PostCard";
import { PostDrawer } from "../../PostDrawer";
import { score, timeMins, useFeedState } from "../../useFeedState";
import { PANE, SPLIT } from "../../../panes";
import { Faces, JoinButton } from "../GroupCard";
import { useGroups } from "../useGroups";
import { useMe } from "../../../useSession";

const ask = (q: string) => window.dispatchEvent(new CustomEvent("vadal:ask", { detail: { q } }));
type Tab = "posts" | "members" | "about";

function JoinedMenu({ onLeave }: { onLeave: () => void }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); };
  }, [open]);
  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full bg-[var(--lav)] px-4 text-[13px] font-semibold text-[var(--purple)] transition hover:opacity-90 lg:min-h-[40px]"
      >
        Joined <ChevronDown className="h-3.5 w-3.5" />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-full z-20 mt-1 w-52 overflow-hidden rounded-xl border border-line bg-card py-1 shadow-[0_12px_30px_-10px_rgba(20,20,40,0.3)]">
          <button role="menuitem" onClick={() => { setOpen(false); onLeave(); }} className="flex min-h-[44px] w-full items-center gap-2.5 px-3 text-left text-[14px] text-[var(--danger)] transition hover:bg-soft lg:min-h-[38px]">
            <LogOut className="h-4 w-4" /> Leave community
          </button>
        </div>
      )}
    </div>
  );
}

export function GroupPage({ id }: { id: string }) {
  const g = useGroups();
  const me = useMe();
  const feed = useFeedState();
  const [tab, setTab] = React.useState<Tab>("posts");
  const [openId, setOpenId] = React.useState<string | null>(null);

  const group: Group | undefined = g.byId[id];
  const member = group ? g.isMember(group.id) : false;

  const posts = React.useMemo(() => {
    const all = [...feed.mine, ...groupPosts].filter((p) => p.group?.id === id).map(feed.toDisplay);
    const pinned = all.filter((p) => p.pinned);
    const rest = all.filter((p) => !p.pinned).sort((a, b) => timeMins(a.time) - timeMins(b.time) || score(b) - score(a));
    return [...pinned, ...rest];
  }, [feed.mine, feed.toDisplay, id]);
  const openItem = openId ? posts.find((p) => p.id === openId) ?? null : null;

  /* A created room is only known once localStorage has been read. */
  if (!group) {
    if (!g.hydrated) return <div className="mx-auto w-full max-w-[1100px] py-10" aria-busy="true" />;
    return (
      <div className="mx-auto flex w-full max-w-[560px] flex-col items-center gap-2 py-24 text-center">
        <SparkMark size={28} tone="gradient" state="idle" />
        <h1 className="text-[18px] font-bold text-ink">This community is not here</h1>
        <p className="text-[14px] text-muted">It may have been a draft on another device, or it has been closed.</p>
        <Link href="/product/feed/groups" className="mt-3 text-[14px] font-semibold text-[var(--purple)] hover:underline">Browse communities</Link>
      </div>
    );
  }

  const project = group.kind === "project";
  const closedToMe = group.privacy === "request" && !member;
  const count = g.memberCount(group);
  const roster = member && !group.mine ? [{ name: `${me.fullName} · you`, role: me.title, img: me.img }, ...group.roster] : group.roster;
  const tabs: { id: Tab; label: string }[] = [
    { id: "posts", label: "Posts" },
    { id: "members", label: `Members · ${count}` },
    { id: "about", label: "About" },
  ];

  const about = (
    <section className="rounded-[22px] border border-line bg-card p-5">
      <h3 className="text-[12px] font-semibold uppercase tracking-[0.14em] text-faint">About</h3>
      <p className="mt-2.5 text-[14px] leading-relaxed text-ink/90">{group.about}</p>
      <ul className="mt-4 space-y-2.5 text-[13px] text-muted">
        <li className="flex items-center gap-2.5">{group.privacy === "open" ? <Globe2 className="h-4 w-4 text-faint" /> : <Lock className="h-4 w-4 text-faint" />}{group.privacy === "open" ? "Open — anyone at the company can join" : "Closed — people ask to join"}</li>
        <li className="flex items-center gap-2.5"><Users className="h-4 w-4 text-faint" />{count} members · {group.activity.toLowerCase()}</li>
        {group.wraps && <li className="flex items-center gap-2.5"><CalendarClock className="h-4 w-4 text-faint" />{group.wraps}</li>}
      </ul>
      {group.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {group.tags.map((t) => <span key={t} className="rounded-full bg-soft px-2.5 py-1 text-[12px] font-semibold text-muted">#{t}</span>)}
        </div>
      )}
      <div className="mt-4 flex items-center gap-2.5 border-t border-line pt-4">
        <Avatar src={group.owner.img} name={group.owner.name} size="sm" />
        <div className="min-w-0">
          <div className="truncate text-[14px] font-semibold text-ink">{group.owner.name}</div>
          <div className="truncate text-[12px] text-faint">{group.mine ? "You started this" : `Started it · ${group.owner.role}`}</div>
        </div>
      </div>
    </section>
  );

  const members = (wide: boolean) => (
    <section className="rounded-[22px] border border-line bg-card p-5">
      <h3 className="text-[12px] font-semibold uppercase tracking-[0.14em] text-faint">Members · {count}</h3>
      <ul className={`mt-3 grid gap-3 ${wide ? "sm:grid-cols-2" : ""}`}>
        {roster.map((p) => (
          <li key={p.name} className="flex items-center gap-2.5">
            <Avatar src={p.img} name={p.name} size="sm" />
            <div className="min-w-0">
              <div className="truncate text-[14px] font-semibold text-ink">{p.name}</div>
              <div className="truncate text-[12px] text-faint">{p.role}</div>
            </div>
          </li>
        ))}
      </ul>
      {count > roster.length && <p className="mt-3 text-[13px] text-faint">and {count - roster.length} more</p>}
    </section>
  );

  return (
    <div className={`${SPLIT} mx-auto max-w-[1100px] justify-center`}>
      <div tabIndex={0} aria-label={group.name} className={`${PANE} w-full max-w-[680px] space-y-4`}>
        <Link href="/product/feed/groups" className="inline-flex min-h-[44px] items-center gap-1.5 text-[13px] font-semibold text-muted transition hover:text-ink lg:min-h-0">
          <ArrowLeft className="h-4 w-4" /> Communities
        </Link>

        {/* the door */}
        <header className="overflow-hidden rounded-[22px] border border-line bg-card">
          <div className={`h-[92px] ${project ? "bg-[var(--lav)]" : "bg-[var(--ai-surface)]"}`} />
          <div className="px-5 pb-5 sm:px-6">
            <div className="-mt-9 flex items-end justify-between gap-3">
              <span className="grid h-[72px] w-[72px] place-items-center rounded-[20px] border border-line bg-card text-[36px] shadow-sm" aria-hidden>{group.emoji}</span>
              <div className="flex items-center gap-2 pb-1">
                {group.mine && group.status === "draft" && <Button variant="brand" size="md" onClick={() => g.publish(group.id)}>Publish</Button>}
                {member && !group.mine
                  ? <JoinedMenu onLeave={() => g.leave(group)} />
                  : <JoinButton size="md" group={group} member={member} asked={g.hasAsked(group.id)} onJoin={() => g.join(group)} onWithdraw={() => g.withdraw(group)} />}
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <h1 className="text-[24px] font-bold tracking-tight text-ink">{group.name}</h1>
              <Badge tone={project ? "brand" : "info"} size="sm">{KIND_LABEL[group.kind]}</Badge>
              {group.status === "draft" && <Badge tone="warning" size="sm">Draft · only you can see it</Badge>}
            </div>
            <p className="mt-1 text-[15px] leading-relaxed text-muted">{group.desc}</p>
            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-faint">
              <span className="flex items-center gap-2"><Faces people={group.roster} /> {count} members</span>
              <span aria-hidden>·</span><span>{group.activity}</span>
              {group.wraps && (<><span aria-hidden>·</span><span>{group.wraps}</span></>)}
            </div>
          </div>
          <nav aria-label="Community sections" className="flex gap-1 border-t border-line px-3 sm:px-4">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                aria-current={tab === t.id ? "page" : undefined}
                className={`-mb-px min-h-[44px] border-b-2 px-3 text-[14px] font-semibold transition ${tab === t.id ? "border-[var(--purple)] text-ink" : "border-transparent text-muted hover:text-ink"}`}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </header>

        {tab === "posts" && (
          closedToMe ? (
            <div className="flex flex-col items-center gap-2 rounded-[22px] border border-dashed border-line px-6 py-14 text-center">
              <Lock className="h-6 w-6 text-faint" />
              <p className="text-[15px] font-semibold text-ink">Posts are for members</p>
              <p className="max-w-[340px] text-[14px] text-faint">{g.hasAsked(group.id) ? `Your request is with ${group.owner.name.split(" ")[0]}.` : `Ask to join and ${group.owner.name.split(" ")[0]} will let you in.`}</p>
            </div>
          ) : (
            <>
              {member ? (
                <Composer group={refOf(group)} onPost={feed.addMine} />
              ) : (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-[22px] bg-[var(--lav)] px-5 py-3.5">
                  <p className="text-[14px] font-semibold text-[var(--purple)]">Join to post and to see this room in your feed.</p>
                  <JoinButton group={group} member={false} asked={false} onJoin={() => g.join(group)} onWithdraw={() => {}} />
                </div>
              )}
              {posts.length === 0 ? (
                <div className="flex flex-col items-center gap-2 rounded-[22px] border border-dashed border-line px-6 py-14 text-center">
                  <SparkMark size={28} tone="gradient" state="idle" />
                  <p className="text-[15px] font-semibold text-ink">Nothing here yet</p>
                  <p className="text-[14px] text-faint">{member ? "Say what this room is for — the first post sets the tone." : "Be the first in."}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {posts.map((it) => (
                    <PostCard
                      key={it.id}
                      item={it}
                      onReact={(e) => feed.react(it.id, e)}
                      onBookmark={() => feed.bookmark(it.id)}
                      onVote={(o) => feed.vote(it.id, o)}
                      onGoing={() => feed.rsvp(it.id)}
                      onOpen={() => setOpenId(it.id)}
                      onShare={feed.share}
                      onMenu={feed.menu}
                    />
                  ))}
                </div>
              )}
            </>
          )
        )}
        {tab === "members" && members(true)}
        {tab === "about" && about}
      </div>

      {/* context rail */}
      <aside tabIndex={0} aria-label="About this community" className={`hidden w-[320px] shrink-0 xl:block ${PANE}`}>
        <div className="space-y-4">
          {!closedToMe && posts.length > 0 && (
            <section className="rounded-[22px] border border-[var(--ai-border)] bg-[var(--ai-surface)] p-5">
              <div className="flex items-center gap-2">
                <SparkMark size={20} tone="gradient" state="idle" />
                <h3 className="text-[15px] font-bold text-ink">What&apos;s happening here</h3>
              </div>
              <p className="mt-2 text-[13px] leading-relaxed text-muted">
                {posts.length} recent posts, {group.postsThisWeek} this week. The latest is from {posts[0].author.name.split(" ")[0]}.
              </p>
              <button
                onClick={() => ask(`Summarise what has been happening in the ${group.name} community this week.`)}
                className="mt-3.5 flex min-h-[40px] w-full items-center justify-center gap-1.5 rounded-full bg-card text-[13px] font-semibold text-[var(--ai-accent)] ring-1 ring-[var(--ai-border)] transition hover:bg-[var(--ai-surface)]"
              >
                <SparkMark size={14} tone="gradient" /> Ask Nudge to catch me up
              </button>
            </section>
          )}
          {about}
          {tab !== "members" && members(false)}
        </div>
      </aside>

      <PostDrawer
        item={openItem}
        onClose={() => setOpenId(null)}
        onReact={(e) => openItem && feed.react(openItem.id, e)}
        onBookmark={() => openItem && feed.bookmark(openItem.id)}
        onVote={(o) => openItem && feed.vote(openItem.id, o)}
        onGoing={() => openItem && feed.rsvp(openItem.id)}
        onShare={feed.share}
        onComment={(t) => openItem && feed.addComment(openItem.id, t)}
        onLikeComment={feed.likeComment}
      />
    </div>
  );
}
