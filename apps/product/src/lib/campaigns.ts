/**
 * Campaigns module data (route /product/campaigns · "Engage" group).
 * Interventions that move the needle: wellness weeks, 1:1 sprints, recognition
 * pushes, burnout resets. Each campaign has an objective, an audience, a channel
 * mix, a step timeline, and reach / participation / lift results. The AI suggests
 * the next campaign from live Pulse signals. Figures are kept consistent with the
 * org-level `campaigns` seed and known signals in lib/data.ts.
 */

/* Used by the seed dates below, so declared before them. */
const DAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export type CampaignStatus = "live" | "scheduled" | "completed" | "draft" | "paused";

/** Campaign objectives — `color`/`emoji` drive chips + bars. */
export type Objective = { key: string; label: string; emoji: string; color: string };
export const objectives: Objective[] = [
  { key: "engagement", label: "Lift engagement", emoji: "📈", color: "var(--purple)" },
  { key: "burnout", label: "Reduce burnout", emoji: "🌿", color: "var(--success)" },
  { key: "recognition", label: "Boost recognition", emoji: "🎉", color: "var(--warning)" },
  { key: "manager", label: "Manager 1:1s", emoji: "🤝", color: "var(--info)" },
  { key: "onboarding", label: "Onboarding", emoji: "🚀", color: "var(--danger)" },
];

/** Delivery channels a campaign can use (icon resolved in the component).
 *  WhatsApp and SMS reach the frontline; Teams and email reach desks. */
export const channels = [
  { key: "feed", label: "Social post" },
  { key: "whatsapp", label: "WhatsApp" },
  { key: "sms", label: "SMS" },
  { key: "teams", label: "Teams" },
  { key: "email", label: "Email" },
  { key: "push", label: "Push" },
  { key: "survey", label: "Pulse survey" },
] as const;

/** A dated send. `critical` (safety) sends don't count toward the weekly limit. */
export type Step = { label: string; when: string; done: boolean; date?: string; channel?: string; critical?: boolean };

export type ChannelResult = { channel: string; participation: number };

export type Campaign = {
  id: string;
  name: string;
  objective: string; // objective key
  audience: string;
  status: CampaignStatus;
  reach: number; // % of audience reached
  participation: number; // % of audience that engaged
  lift: number; // engagement pts vs baseline
  window: string;
  channels: string[];
  steps: Step[];
  aiReadout: string;
  /** Who runs it — managers see company campaigns but can't change them. */
  owner?: string;
  /** Participation per channel, so the next campaign uses what worked. */
  byChannel?: ChannelResult[];
  /** The same measure for a similar group that wasn't in the campaign. */
  comparison?: { group: string; lift: number };
  /** What to change next time — drives "Run again". */
  lessons?: { note: string; addStep?: string; addChannel?: string }[];
};

export const campaignStats = { active: 3, avgParticipation: 74, avgLift: 4.1, reached: "10.4K" };

const st = (label: string, date: string, done: boolean, channel?: string, critical?: boolean): Step => ({ label, when: fmtDate(date), date, done, channel, critical });

export const campaigns: Campaign[] = [
  {
    id: "c1", name: "Wellness Week", objective: "burnout", audience: "All org", status: "live", owner: "People team",
    reach: 91, participation: 76, lift: 5.2, window: "14 – 28 Sep",
    channels: ["feed", "teams", "whatsapp"],
    steps: [
      st("Kickoff post from the CEO", "2026-09-14", true, "feed"),
      st("No-meeting Wednesday", "2026-09-16", true, "teams"),
      st("Mid-week pulse check", "2026-09-21", false, "survey"),
      st("Refreshed benefits guide", "2026-09-24", false, "whatsapp"),
      st("Wrap-up and results", "2026-09-28", false, "feed"),
    ],
    byChannel: [{ channel: "whatsapp", participation: 71 }, { channel: "feed", participation: 64 }, { channel: "teams", participation: 58 }],
    comparison: { group: "The same teams in the four weeks before", lift: 0.6 },
    aiReadout: "Participation is 12 pts above the Wellness benchmark. Engineering — your burnout hotspot — is engaging at 68%, its highest in six months.",
  },
  {
    id: "c2", name: "Manager 1:1 sprint", objective: "manager", audience: "People managers", status: "live", owner: "People team",
    reach: 88, participation: 84, lift: 3.8, window: "1 – 30 Sep",
    channels: ["email", "teams", "survey"],
    steps: [
      st("Kickoff and AI prep guide", "2026-09-01", true, "email"),
      st("Week 1 — overdue 1:1s cleared", "2026-09-08", true, "teams"),
      st("Week 2 — coaching nudges", "2026-09-15", true, "teams"),
      st("1:1 quality survey", "2026-09-22", false, "survey"),
      st("Manager scorecard update", "2026-09-30", false, "email"),
    ],
    byChannel: [{ channel: "teams", participation: 86 }, { channel: "email", participation: 61 }],
    comparison: { group: "Managers who joined after the sprint began", lift: 0.9 },
    aiReadout: "1:1 completion rose from 71% to 88%. Sales · West — where you had two overdue 1:1s — is now fully caught up.",
  },
  {
    id: "c3", name: "Recognition push — cold zones", objective: "recognition", audience: "Night shift · Plant Ops · Logistics", status: "scheduled", owner: "People team",
    reach: 0, participation: 0, lift: 0, window: "Starts 28 Sep",
    channels: ["feed", "whatsapp"],
    steps: [
      st("Manager nudge — give one shout-out", "2026-09-28", false, "whatsapp"),
      st("Values spotlight on Social", "2026-09-30", false, "feed"),
      st("Peer kudos challenge", "2026-10-05", false, "whatsapp"),
      st("Coverage re-check", "2026-10-12", false, "survey"),
    ],
    aiReadout: "Targeted at the three teams with recognition cold zones (34–48% coverage). Predicted +3 pts to 30-day retention intent.",
  },
  {
    id: "c6", name: "Dock 3 safety refresher", objective: "engagement", audience: "Plant Ops", status: "scheduled", owner: "Plant Safety",
    reach: 0, participation: 0, lift: 0, window: "Starts 28 Sep",
    channels: ["whatsapp", "sms"],
    steps: [
      st("New floor markings — must read", "2026-09-28", false, "whatsapp", true),
      st("Toolbox talk at shift start", "2026-09-29", false, "sms"),
      st("Two-minute quiz in iLearn", "2026-10-01", false, "whatsapp"),
    ],
    aiReadout: "Pairs the must-read in Social with a quiz, so confirmation isn't the only signal that people understood.",
  },
  {
    id: "c4", name: "Onboarding boost — September cohort", objective: "onboarding", audience: "New joiners", status: "live", owner: "People team",
    reach: 97, participation: 89, lift: 4.6, window: "14 Sep – 14 Oct",
    channels: ["email", "whatsapp", "survey"],
    steps: [
      st("Welcome and buddy match", "2026-09-14", true, "email"),
      st("Week-1 check-in", "2026-09-21", false, "survey"),
      st("Manager 30-day sync", "2026-10-14", false, "email"),
    ],
    byChannel: [{ channel: "email", participation: 92 }, { channel: "whatsapp", participation: 88 }],
    aiReadout: "89% of new joiners completed the week-1 check-in — 18 pts above last cohort. Buddy matching is the strongest driver.",
  },
  {
    id: "c5", name: "Night-shift pulse", objective: "engagement", audience: "Plant Ops", status: "completed", owner: "People team",
    reach: 64, participation: 41, lift: 1.1, window: "3 – 17 Aug",
    channels: ["push", "survey"],
    steps: [
      st("Push at clock-in", "2026-08-03", true, "push"),
      st("Anonymous voice prompt", "2026-08-10", true, "survey"),
      st("Supervisor readout", "2026-08-17", true, "email"),
    ],
    byChannel: [{ channel: "survey", participation: 47 }, { channel: "push", participation: 29 }],
    comparison: { group: "Day shift, same weeks", lift: 0.8 },
    lessons: [
      { note: "Push alone didn't reach people on shared phones — WhatsApp reaches 9 in 10 of them.", addChannel: "whatsapp" },
      { note: "Pair it with a QR poster on the floor, scanned at shift change.", addStep: "QR poster at every shift-change point" },
    ],
    aiReadout: "Reach lagged at 64% — push-only didn't cut through. Lift was barely above day shift over the same weeks, so most of it wasn't the campaign.",
  },
];

/* ── dates, weeks and the weekly send limit ─────────────────────── */

/** "Mon 28 Sep" — by hand, because ICU writes "Sept" in some browsers and not others. */
export function fmtDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  return `${DAY[d.getDay()]} ${d.getDate()} ${MON[d.getMonth()]}`;
}
export function addDays(iso: string, n: number): string {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
/** Monday of the week an ISO date falls in. */
export function weekOf(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  return addDays(iso, -((d.getDay() + 6) % 7));
}

/** Teams a send can land on, for counting what each team receives. */
export const TEAMS = ["Engineering", "Sales", "Support", "Design", "Plant Ops", "Night shift", "Logistics", "People managers", "New joiners"] as const;
/** Does an audience include this team? "All org" includes everyone. */
export const covers = (audience: string, team: string) => audience === "All org" || audience.split(" · ").some((a) => a === team || a.startsWith(`${team} `) || team.startsWith(a));

export type Collision = { team: string; week: string; count: number; sends: { campaign: Campaign; step: Step }[] };

/** Teams that would get more than the weekly limit of non-critical sends. */
export function collisions(list: Campaign[], limit: number): Collision[] {
  const byKey = new Map<string, Collision>();
  for (const c of list) {
    if (c.status === "completed" || c.status === "draft" || c.status === "paused") continue;
    for (const step of c.steps) {
      if (!step.date || step.done || step.critical) continue;
      for (const team of TEAMS) {
        if (!covers(c.audience, team)) continue;
        const week = weekOf(step.date);
        const key = `${team}|${week}`;
        const cur = byKey.get(key) ?? { team, week, count: 0, sends: [] };
        cur.count++; cur.sends.push({ campaign: c, step });
        byKey.set(key, cur);
      }
    }
  }
  return [...byKey.values()]
    .filter((x) => x.count > limit)
    .map((x) => ({ ...x, sends: [...x.sends].sort((a, b) => a.step.date!.localeCompare(b.step.date!)) }))
    .sort((a, b) => a.week.localeCompare(b.week) || b.count - a.count);
}

/** First and last send — the span a campaign occupies on a timeline. */
export function spanOf(c: Campaign): { start: string; end: string } | null {
  const dates = c.steps.map((s) => s.date).filter((d): d is string => Boolean(d)).sort();
  return dates.length ? { start: dates[0], end: dates[dates.length - 1] } : null;
}

/** Whole days from a to b. */
export function daysBetween(a: string, b: string): number {
  return Math.round((new Date(`${b}T00:00:00`).getTime() - new Date(`${a}T00:00:00`).getTime()) / 86400000);
}

/** Non-critical, not-yet-sent messages per team per week — the planner's load grid. */
export function loadGrid(list: Campaign[], weeks: string[]): { team: string; counts: number[] }[] {
  const rows = TEAMS.map((team) => ({
    team,
    counts: weeks.map((w) => list
      .filter((c) => c.status === "live" || c.status === "scheduled")
      .filter((c) => covers(c.audience, team))
      .reduce((n, c) => n + c.steps.filter((s) => s.date && !s.done && !s.critical && weekOf(s.date) === w).length, 0)),
  }));
  return rows.filter((r) => r.counts.some((n) => n > 0));
}

/** Shift a campaign's undone steps by n days. */
export function shiftCampaign(c: Campaign, days: number): Campaign {
  if (!days) return c;
  const steps = c.steps.map((s) => (s.date && !s.done ? { ...s, date: addDays(s.date, days), when: fmtDate(addDays(s.date, days)) } : s));
  const first = steps.find((s) => s.date && !s.done)?.date;
  return { ...c, steps, window: c.status === "scheduled" && first ? `Starts ${fmtDate(first).replace(/^\w+ /, "")}` : c.window };
}

/** AI-suggested next campaign — derived from live Pulse signals (data.ts). */
export const suggested = {
  name: "Burnout reset — Engineering",
  objective: "burnout",
  audience: "Engineering",
  predictedLift: "+3.4",
  window: "2 weeks",
  reason:
    "Engineering engagement is down 6 pts and “workload & burnout” is your fastest-rising theme (312 mentions). A focused 2-week reset here has the highest predicted lift of any intervention right now.",
  steps: [
    "Workload audit — flag the 12-weekend-commit pattern",
    "No-meeting Wednesday for Engineering",
    "Manager 1:1s focused on load, not delivery",
    "Mid-point burnout pulse",
  ],
};

export type Template = { key: string; name: string; objective: string; desc: string; duration: string };
export const templates: Template[] = [
  { key: "wellness", name: "Wellness Week", objective: "burnout", desc: "Company-wide reset — focus weeks, no-meeting days, benefits refresh.", duration: "2 weeks" },
  { key: "1v1", name: "Manager 1:1 sprint", objective: "manager", desc: "Clear overdue 1:1s and lift 1:1 quality with AI prep.", duration: "1 month" },
  { key: "recognition", name: "Recognition push", objective: "recognition", desc: "Warm up cold zones with manager nudges and a kudos challenge.", duration: "2 weeks" },
  { key: "onboarding", name: "Onboarding boost", objective: "onboarding", desc: "Buddy matching, week-1 check-ins and a 30-day sync for new joiners.", duration: "30 days" },
  { key: "burnout", name: "Burnout reset", objective: "burnout", desc: "Targeted intervention for a team with a rising burnout theme.", duration: "2 weeks" },
  { key: "values", name: "Values Week", objective: "engagement", desc: "Spotlight one company value a day with stories and recognition.", duration: "1 week" },
];

/** Starter step plans for the builder, keyed by objective. */
export const starterSteps: Record<string, string[]> = {
  engagement: ["Kickoff post from leadership", "Mid-campaign pulse check", "Team spotlights on the feed", "Wrap-up & results share"],
  burnout: ["Workload audit", "No-meeting focus day", "Manager 1:1s on load", "Mid-point burnout pulse", "Benefits & support reminder"],
  recognition: ["Manager nudge — give one shout-out", "Values spotlight on the feed", "Peer kudos challenge", "Coverage re-check"],
  manager: ["Manager kickoff & AI prep guide", "Clear overdue 1:1s", "Coaching nudges", "1:1 quality survey"],
  onboarding: ["Welcome + buddy match", "Week-1 check-in survey", "Manager 30-day sync"],
};

export const audiences = [
  "All org", "Engineering", "Sales", "Sales · West", "Support", "Design", "People managers",
  "New joiners", "Plant Ops", "Night shift", "Logistics", "Night shift · Plant Ops · Logistics",
] as const;

/* ── delivery previews (Broadcast) ─────────────────────────────────
   Who a send reaches, as recipients the timing engine can plan for. Seeded
   deterministically from the audience: frontline audiences are mostly shift
   workers on WhatsApp/SMS, desk teams are in the app and Teams. */
import type { Recipient, ShiftPattern, Channel } from "./ai/engines/timing";

const FRONT = /Plant Ops|Night shift|Logistics/;

export function recipientsFor(audience: string, count = 24): Recipient[] {
  let h = 7;
  for (const ch of audience) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const rnd = () => { h = (h * 1103515245 + 12345) >>> 0; return (h >>> 16) / 65536; };
  const frontline = FRONT.test(audience);
  const mixed = audience === "All org";
  return Array.from({ length: count }, (_, i) => {
    const r = rnd();
    const shift: ShiftPattern = frontline
      ? (/Night shift/.test(audience) && r < 0.6 ? "night" : r < 0.7 ? "day" : "evening")
      : mixed ? (r < 0.5 ? "desk" : r < 0.75 ? "day" : r < 0.9 ? "evening" : "night")
      : "desk";
    const channels: Channel[] = shift === "desk" ? (rnd() < 0.5 ? ["teams", "app"] : ["app", "email"]) : (rnd() < 0.7 ? ["whatsapp", "sms"] : ["sms"]);
    const history = rnd() < 0.55;
    const respondsAt = !history ? [] : shift === "desk" ? [10, 11, 10] : shift === "day" ? [12, 13] : shift === "evening" ? [16] : [22, 23];
    return { email: `${audience}-${i}`, team: audience, shift, respondsAt, reachableOn: channels, recentSends: rnd() < 0.12 ? 3 : Math.floor(rnd() * 2) };
  });
}

/** A first message per objective, written the way first drafts usually are. */
export const DRAFT_MESSAGE: Record<string, string> = {
  engagement: "Commencing Monday, Wednesdays will be meeting-free across the organisation in order to facilitate focused work. Prior to scheduling a meeting on a Wednesday, please consider whether it can be moved to Tuesday or Thursday, and managers will check in with their teams subsequent to the first week to understand what additional support is required.",
  wellbeing: "In order to support your wellbeing, we are introducing additional mental-health days this quarter. Employees are required to book them in advance via the leave system, and managers will facilitate cover so that nobody is required to work while they are away.",
  recognition: "This month we are asking every manager to recognise at least one person on their team. Recognition that is specific and timely is the most effective, so please utilise the kudos feature subsequent to any piece of work that went well.",
  retention: "We would like to understand what keeps you here. Over the next two weeks, managers will commence short stay conversations with each member of their team, and any additional feedback can be shared anonymously via the pulse.",
  onboarding: "Welcome to your first week. Prior to your first day, please complete your profile and payroll details, and your buddy will facilitate introductions to the team.",
};
