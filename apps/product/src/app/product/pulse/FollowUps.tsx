"use client";
/* Follow-ups — where a result stops being a chart (Pulse v2, spec 049).

   Commit: a fix, one owner, a date, and who it's for. Done: say what changed,
   in words people will read, and it goes to Social as "You said, we did".
   That note is the whole point — people answer the next survey when they saw
   the last one change something. */
import * as React from "react";
import { Check, CircleDot, Megaphone, Plus } from "lucide-react";
import { Avatar, Button, SparkMark } from "@vadal/design-system";
import type { FeedItem } from "@/lib/feed";
import {
  OWNERS, addDays, daysBetween, draftUpdate, fmtDate, pulseSurveys, topicLabel, TOPICS,
  type FollowUp, type FollowUpStatus, type Topic,
} from "@/lib/pulse";
import { Drawer } from "../Drawer";
import { toast } from "../Toaster";
import { useMe } from "../useSession";
import type { PulseState } from "./parts";

const FEED_KEY = "vadal:feed2-mine";
let fid = 0;

export type CommitSeed = { surveyId: string; topic: Topic; audience?: string; title?: string } | null;

const AUDIENCES = ["Everyone", "Plant Ops", "Engineering", "Sales", "Support", "Design", "New joiners"];

function field(label: string, children: React.ReactNode) {
  return (
    <label className="block">
      <span className="text-[13px] font-semibold text-muted">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
const input = "w-full rounded-xl border border-line bg-card px-3.5 py-2.5 text-[16px] outline-none transition focus:border-[var(--purple)] lg:text-[14px]";

/* ── commit to a fix ───────────────────────────────────────────── */
export function CommitDrawer({ seed, s, onClose }: { seed: CommitSeed; s: PulseState; onClose: () => void }) {
  /* Seeded once per opening — the hub remounts this with a new key each time. */
  const [title, setTitle] = React.useState(seed?.title ?? "");
  const [owner, setOwner] = React.useState(OWNERS[0].name);
  const [due, setDue] = React.useState(addDays(s.today, 21));
  const [audience, setAudience] = React.useState(seed?.audience ?? "Everyone");
  const [topic, setTopic] = React.useState<Topic>(seed?.topic ?? "growth");

  const survey = seed ? pulseSurveys.find((x) => x.id === seed.surveyId) : null;
  const ok = title.trim().length > 3 && due >= s.today;

  function save() {
    if (!seed || !ok) return;
    s.addFollowUp({
      id: `fu-me-${fid++}-${title.length}`, surveyId: seed.surveyId, topic, title: title.trim(),
      owner: OWNERS.find((o) => o.name === owner)!, due, audience, status: "planned",
    });
    toast(`Follow-up set — ${owner.split(" ")[0]} owns it, due ${fmtDate(due)}`);
    onClose();
  }

  const IDEAS: Record<Topic, string[]> = {
    growth: ["Publish promotion criteria for every level", "Career conversations in every 1:1 this quarter"],
    workload: ["Hire two floaters for night shift", "No-meeting Wednesday afternoons"],
    recognition: ["Shout-outs in every team huddle", "Managers give one kudos a week"],
    manager: ["Manager training on feedback", "Skip-level 1:1s every quarter"],
    belonging: ["Team lunches once a month", "Buddy for every new joiner"],
    tools: ["Fix single sign-on timeouts", "Laptops set up before day one"],
  };

  return (
    <Drawer open={!!seed} title="Commit to a fix" onClose={onClose} footer={
      <div className="flex items-center justify-end gap-2">
        <Button variant="tertiary" size="sm" className="min-h-[44px] lg:min-h-0" onClick={onClose}>Cancel</Button>
        <Button variant="brand" size="sm" className="min-h-[44px] lg:min-h-0" disabled={!ok} onClick={save}>Save follow-up</Button>
      </div>
    }>
      <h2 className="pr-12 text-[22px] font-bold tracking-tight">Commit to a fix</h2>
      <p className="mt-1.5 text-[14px] leading-relaxed text-muted">
        One thing that will change, one person who owns it, and a date. When it&rsquo;s done, you&rsquo;ll tell people what changed.
        {survey && <span className="text-faint"> · From {survey.name}</span>}
      </p>

      <div className="mt-6 flex flex-col gap-4">
        {field("What's it about?", (
          <div className="flex flex-wrap gap-1.5">
            {TOPICS.map((t) => (
              <button key={t.key} onClick={() => setTopic(t.key)} aria-pressed={topic === t.key}
                className={`min-h-[44px] rounded-full border px-3.5 text-[14px] font-medium transition lg:min-h-[36px] ${topic === t.key ? "border-[var(--purple)] bg-[var(--lav)] text-ink" : "border-line text-muted hover:text-ink"}`}>
                {t.label}
              </button>
            ))}
          </div>
        ))}
        {field("The fix", <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Publish promotion criteria for every level" className={input} />)}
        <div className="-mt-2 flex flex-wrap items-center gap-1.5">
          <SparkMark size={12} tone="gradient" />
          {IDEAS[topic].map((i) => (
            <button key={i} onClick={() => setTitle(i)} className="min-h-[44px] rounded-full px-2 text-[13px] font-medium text-[var(--ai-accent)] hover:underline lg:min-h-0">{i}</button>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {field("Owner", (
            <select value={owner} onChange={(e) => setOwner(e.target.value)} className={input}>
              {OWNERS.map((o) => <option key={o.name}>{o.name}</option>)}
            </select>
          ))}
          {field("Due", <input type="date" value={due} min={s.today} onChange={(e) => setDue(e.target.value)} className={input} />)}
        </div>
        {field("Who it's for", (
          <select value={audience} onChange={(e) => setAudience(e.target.value)} className={input}>
            {AUDIENCES.map((a) => <option key={a}>{a}</option>)}
          </select>
        ))}
        <p className="text-[13px] leading-snug text-faint">They&rsquo;ll hear about it when it&rsquo;s done — not before, so nothing is promised that doesn&rsquo;t happen.</p>
      </div>
    </Drawer>
  );
}

/* ── done: say what changed ────────────────────────────────────── */
export function DoneDrawer({ f, s, onClose }: { f: FollowUp | null; s: PulseState; onClose: () => void }) {
  const me = useMe();
  const [text, setText] = React.useState(f ? f.update ?? draftUpdate(f) : "");
  const [share, setShare] = React.useState(true);

  function done() {
    if (!f) return;
    s.updateFollowUp(f.id, { status: "done", update: text.trim(), shared: share });
    if (share) {
      const item: FeedItem = {
        id: `pulse-${f.id}`, type: "announcement", channel: "company", time: "now",
        text: `You said, we did. ${text.trim()}`,
        author: { name: me.fullName, role: `${me.title} · You`, img: me.img },
        reactions: {}, reactedBy: [], comments: [], views: 1,
      };
      try {
        const cur = JSON.parse(localStorage.getItem(FEED_KEY) ?? "[]") as FeedItem[];
        localStorage.setItem(FEED_KEY, JSON.stringify([item, ...cur.filter((x) => x.id !== item.id)]));
      } catch { /* storage unavailable — the follow-up is still marked done */ }
    }
    toast(share ? `Done — "You said, we did" is on Social for ${f.audience}` : "Marked done");
    onClose();
  }

  return (
    <Drawer open={!!f} title="Tell people what changed" onClose={onClose} footer={
      <div className="flex items-center justify-end gap-2">
        <Button variant="tertiary" size="sm" className="min-h-[44px] lg:min-h-0" onClick={onClose}>Cancel</Button>
        <Button variant="brand" size="sm" className="min-h-[44px] lg:min-h-0" leadingIcon={share ? <Megaphone className="h-4 w-4" /> : <Check className="h-4 w-4" />} disabled={text.trim().length < 10} onClick={done}>
          {share ? "Mark done and share" : "Mark done"}
        </Button>
      </div>
    }>
      {f && (
        <>
          <h2 className="pr-12 text-[22px] font-bold tracking-tight">Tell people what changed</h2>
          <p className="mt-1.5 text-[14px] leading-relaxed text-muted">{f.title} · for {f.audience}</p>

          <label className="mt-6 block">
            <span className="flex items-center gap-1.5 text-[13px] font-semibold text-muted"><SparkMark size={12} tone="gradient" /> You said, we did — drafted, yours to edit</span>
            <textarea value={text} onChange={(e) => setText(e.target.value)} rows={5} className={`${input} mt-1.5 resize-y leading-relaxed`} />
          </label>
          <p className="mt-1.5 text-[13px] text-faint">Say what they told you, what changed, and when. Skip the thank-you paragraph.</p>

          <label className="mt-5 flex min-h-[44px] cursor-pointer items-start gap-3 rounded-2xl border border-line p-4">
            <input type="checkbox" checked={share} onChange={(e) => setShare(e.target.checked)} className="mt-1 h-4 w-4 accent-[var(--purple)]" />
            <span>
              <span className="block text-[14px] font-semibold">Post it on Social</span>
              <span className="block text-[13px] text-muted">In #company, so {f.audience === "Everyone" ? "everyone" : `${f.audience}`} sees it — and it&rsquo;s quoted in the next survey&rsquo;s intro.</span>
            </span>
          </label>
        </>
      )}
    </Drawer>
  );
}

/* ── the list ─────────────────────────────────────────────────── */
const GROUPS: { status: FollowUpStatus; label: string }[] = [
  { status: "doing", label: "In progress" },
  { status: "planned", label: "Planned" },
  { status: "done", label: "Done" },
];

export function FollowUpList({ s, items, onDone, onCommit, empty }: {
  s: PulseState; items: FollowUp[]; onDone: (f: FollowUp) => void; onCommit?: () => void; empty?: string;
}) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-line px-5 py-8 text-center">
        <p className="text-[14px] text-muted">{empty ?? "No follow-ups yet."}</p>
        {onCommit && <Button variant="secondary" size="sm" className="mt-3 min-h-[44px] lg:min-h-0" leadingIcon={<Plus className="h-4 w-4" />} onClick={onCommit}>Commit to a fix</Button>}
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-5">
      {GROUPS.map((g) => {
        const list = items.filter((f) => f.status === g.status);
        if (!list.length) return null;
        return (
          <section key={g.status}>
            <h3 className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.12em] text-faint">
              {g.label}<span className="rounded-full bg-soft px-1.5 text-[11px] tracking-normal text-muted">{list.length}</span>
            </h3>
            <ul className="mt-2 flex flex-col divide-y divide-[var(--line)]">
              {list.map((f) => {
                const left = daysBetween(s.today, f.due);
                const late = f.status !== "done" && left < 0;
                return (
                  <li key={f.id} className="flex flex-wrap items-center gap-x-3 gap-y-2 py-3">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full" style={{ background: f.status === "done" ? "color-mix(in srgb, var(--success) 14%, transparent)" : "var(--soft)" }}>
                      {f.status === "done" ? <Check className="h-4 w-4 text-[var(--success)]" /> : <CircleDot className="h-4 w-4 text-[var(--purple)]" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[14px] font-semibold leading-snug text-ink">{f.title}</p>
                      <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-[13px] text-muted">
                        <span>{topicLabel(f.topic)}</span><span aria-hidden>·</span><span>{f.audience}</span><span aria-hidden>·</span>
                        {f.status === "done"
                          ? <span>{f.shared ? "Shared on Social" : "Done"}</span>
                          : <span className={late ? "font-semibold text-[var(--danger)]" : ""}>{late ? `${-left} day${left === -1 ? "" : "s"} late · was due ${fmtDate(f.due)}` : left === 0 ? "Due today" : `Due ${fmtDate(f.due, true)}`}</span>}
                      </p>
                    </div>
                    <span className="flex items-center gap-2">
                      <Avatar src={f.owner.img} name={f.owner.name} size="sm" />
                      <span className="hidden text-[13px] text-muted sm:inline">{f.owner.name.split(" ")[0]}</span>
                    </span>
                    {f.status !== "done" && (
                      <div className="flex w-full items-center gap-1 sm:w-auto">
                        {f.status === "planned" && (
                          <Button variant="tertiary" size="sm" className="min-h-[44px] lg:min-h-0" onClick={() => { s.updateFollowUp(f.id, { status: "doing" }); toast("Moved to in progress"); }}>Start</Button>
                        )}
                        <Button variant="secondary" size="sm" className="min-h-[44px] lg:min-h-0" leadingIcon={<Check className="h-3.5 w-3.5" />} onClick={() => onDone(f)}>Done</Button>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
