/**
 * Adoption — whether people use Vadal, measured without points.
 *
 * Points can be switched off per workspace (roadmap: "points mode is a product
 * mode, not a flag"), so adoption cannot be read from anything points-shaped —
 * earned, redeemed, leaderboard rank. Every figure here counts something a
 * person did: opened the app, checked in, posted, asked. It reads the same
 * with points on or off.
 *
 *   weekly active  — opened Vadal at least once in the week
 *   checked in     — did the daily check-in at least once in the week
 *   daily / monthly — the share of monthly-active people who come on a given day
 *   activated      — signed in at least once since launch
 *
 * Seeded per team (headcounts sum to the org's 12,480); every org figure is
 * computed from the teams, so a team scope and the org view always agree.
 */
export const FRONTLINE_TEAMS = ["Plant Ops", "Night shift", "Logistics"];

export type TeamAdoption = {
  team: string;
  headcount: number;
  /** % of the team active this week. */
  weeklyActive: number;
  /** % of the team who checked in at least once this week. */
  checkedIn: number;
  /** Of the team's weekly-active people, the share on a typical day. */
  dailyShare: number;
  /** Change in weekly active over the last 4 weeks, in points. */
  change4w: number;
};

export const TEAMS: TeamAdoption[] = [
  { team: "Sales", headcount: 1180, weeklyActive: 92, checkedIn: 71, dailyShare: 0.72, change4w: 2 },
  { team: "Design", headcount: 420, weeklyActive: 95, checkedIn: 78, dailyShare: 0.76, change4w: 1 },
  { team: "Marketing", headcount: 560, weeklyActive: 91, checkedIn: 69, dailyShare: 0.7, change4w: 0 },
  { team: "Support", headcount: 1340, weeklyActive: 90, checkedIn: 74, dailyShare: 0.78, change4w: 3 },
  { team: "Finance", headcount: 610, weeklyActive: 86, checkedIn: 58, dailyShare: 0.6, change4w: -2 },
  { team: "Engineering", headcount: 1720, weeklyActive: 88, checkedIn: 52, dailyShare: 0.62, change4w: -4 },
  { team: "HR", headcount: 380, weeklyActive: 97, checkedIn: 83, dailyShare: 0.8, change4w: 1 },
  { team: "Plant Ops", headcount: 3120, weeklyActive: 89, checkedIn: 76, dailyShare: 0.74, change4w: 6 },
  { team: "Night shift", headcount: 1650, weeklyActive: 84, checkedIn: 68, dailyShare: 0.7, change4w: 9 },
  { team: "Logistics", headcount: 1500, weeklyActive: 87, checkedIn: 64, dailyShare: 0.66, change4w: 4 },
];

/** The last twelve weeks, oldest first; each label is the week's Monday. */
export const WEEKS = ["29 Jun", "6 Jul", "13 Jul", "20 Jul", "27 Jul", "3 Aug", "10 Aug", "17 Aug", "24 Aug", "31 Aug", "7 Sep", "14 Sep"];
const ORG_ACTIVE = [71, 74, 76, 79, 80, 82, 84, 85, 86, 87, 88, 89];
const ORG_CHECKIN = [48, 52, 55, 57, 60, 61, 63, 64, 66, 67, 68, 69];

/* The same monthly shape for Analytics, which reads 14-month series. */
export const MONTHLY = {
  weeklyActive: [58, 61, 63, 66, 68, 71, 73, 76, 79, 82, 84, 86, 88, 89],
  checkedIn: [31, 35, 38, 42, 45, 48, 52, 55, 58, 61, 64, 66, 68, 69],
};

/* What people come back for — % of weekly-active people who used each, this week. */
const SURFACES: [string, number][] = [
  ["Daily check-in", 77], ["Social", 64], ["Nudge", 41], ["Kudos", 38], ["Knowledge", 29], ["iLearn", 26], ["Pulse surveys", 19],
];

export const WINDOW_WEEKS: Record<string, number> = { "7 days": 6, "30 days": 8, "Quarter": 12 };

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));
const hash = (s: string) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);

type Totals = { people: number; weeklyActive: number; checkedIn: number; daily: number; monthly: number; activated: number; change4w: number };
function totals(rows: TeamAdoption[]): Totals {
  const people = rows.reduce((s, r) => s + r.headcount, 0);
  const sum = (f: (r: TeamAdoption) => number) => rows.reduce((s, r) => s + r.headcount * f(r), 0);
  return {
    people,
    weeklyActive: sum((r) => r.weeklyActive / 100),
    checkedIn: sum((r) => r.checkedIn / 100),
    daily: sum((r) => (r.weeklyActive / 100) * r.dailyShare),
    monthly: sum((r) => Math.min(99, r.weeklyActive + 6) / 100),
    activated: sum((r) => Math.min(99.5, r.weeklyActive + 9) / 100),
    change4w: sum((r) => r.change4w) / Math.max(1, people),
  };
}

/* A team's twelve weeks: the org's shape before the last month, then its own
   four-week movement — so a team that is falling reads as falling. */
function teamSeries(end: number, change: number, org: number[]) {
  const pivot = end - change;
  /* index 7 is four weeks before the latest, so it is the pivot exactly and the
     last four weeks move by `change` — the tile and the team table agree */
  return org.map((v, i) => i >= 8 ? Math.round(pivot + (change * (i - 7)) / 4) : Math.round(clamp(pivot - (org[7] - v) * 0.6, 20, 99)));
}

const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : 0);

export function deriveAdoption(scope: string, period: string) {
  const team = TEAMS.find((t) => t.team === scope);
  const rows = team ? [team] : TEAMS;
  const t = totals(rows);
  const n = WINDOW_WEEKS[period] ?? 8;

  const activePct = pct(t.weeklyActive, t.people);
  const checkinPct = pct(t.checkedIn, t.people);
  const active = team ? teamSeries(team.weeklyActive, team.change4w, ORG_ACTIVE) : [...ORG_ACTIVE.slice(0, -1), activePct];
  const checkin = team ? teamSeries(team.checkedIn, Math.round(team.change4w * 0.8), ORG_CHECKIN) : [...ORG_CHECKIN.slice(0, -1), checkinPct];

  const deskRows = TEAMS.filter((r) => !FRONTLINE_TEAMS.includes(r.team));
  const lineRows = TEAMS.filter((r) => FRONTLINE_TEAMS.includes(r.team));
  const profile = (rs: TeamAdoption[], label: string) => {
    const x = totals(rs);
    return { label, people: x.people, weeklyActive: pct(x.weeklyActive, x.people), checkedIn: pct(x.checkedIn, x.people) };
  };
  const profiles = team
    ? [profile([team], FRONTLINE_TEAMS.includes(team.team) ? "Frontline" : "Desk")]
    : [profile(deskRows, "Desk"), profile(lineRows, "Frontline")];

  const surfaces = SURFACES.map(([label, v]) => {
    if (!team) return { label, value: v };
    const front = FRONTLINE_TEAMS.includes(team.team);
    const tilt = label === "Daily check-in" ? (front ? 6 : -4) : label === "Social" ? (front ? -8 : 3) : label === "iLearn" ? (front ? 5 : 0) : 0;
    return { label, value: clamp(v + tilt + ((hash(team.team + label) % 9) - 4), 5, 95) };
  }).sort((a, b) => b.value - a.value);

  const byTeam = [...TEAMS]
    .map((r) => ({ ...r, dailyActivePct: Math.round(r.weeklyActive * r.dailyShare) }))
    .sort((a, b) => a.weeklyActive - b.weeklyActive);

  /* readings — computed from the numbers above, not written beside them */
  const w = active.slice(-n), c = checkin.slice(-n);
  const gapNow = w[w.length - 1] - c[c.length - 1], gapThen = w[0] - c[0];
  const move = (a: number[]) => { const d = a[a.length - 1] - a[0]; return d === 0 ? "flat" : `${d > 0 ? "up" : "down"} ${Math.abs(d)} ${Math.abs(d) === 1 ? "point" : "points"}`; };
  const recent = active[active.length - 1] - active[active.length - 5];
  const trendReading = `Weekly active is ${move(w)} over ${n} weeks, check-ins ${move(c)}.${
    team && recent !== 0 && Math.sign(recent) !== Math.sign(w[w.length - 1] - w[0])
      ? w[w.length - 1] === w[0]
        ? ` That hides a ${recent > 0 ? "rise" : "fall"} of ${Math.abs(recent)} in the last month.`
        : ` The last month runs the other way: ${recent > 0 ? "up" : "down"} ${Math.abs(recent)}.`
      : ""
  } ${
    gapNow === gapThen
      ? `Check-ins still trail weekly active by ${gapNow} points — the check-in is the habit to build.`
      : `Check-ins now trail weekly active by ${gapNow} points, ${gapNow < gapThen ? "down" : "up"} from ${gapThen}.`
  }`;
  const falling = [...TEAMS].sort((a, b) => a.change4w - b.change4w)[0];
  const rising = [...TEAMS].sort((a, b) => b.change4w - a.change4w)[0];
  const teamReading = falling.change4w < 0
    ? `${falling.team} is falling — down ${Math.abs(falling.change4w)} points in 4 weeks${
        falling.checkedIn === Math.min(...TEAMS.map((r) => r.checkedIn)) ? `, with the lowest check-in rate (${falling.checkedIn}%)` : ""
      }. ${rising.team} gained ${rising.change4w}.`
    : `Every team is flat or rising. ${rising.team} gained the most: ${rising.change4w} points in 4 weeks.`;
  const profileReading = profiles.length === 2
    ? profiles[1].checkedIn > profiles[0].checkedIn
      ? `Frontline teams check in more than desk teams (${profiles[1].checkedIn}% vs ${profiles[0].checkedIn}%), though slightly fewer open Vadal each week. The check-in works on the floor.`
      : `Desk teams check in more than frontline (${profiles[0].checkedIn}% vs ${profiles[1].checkedIn}%).`
    : `${scope} is a ${profiles[0].label.toLowerCase()} team: ${profiles[0].weeklyActive}% active this week, ${profiles[0].checkedIn}% checked in.`;

  return {
    scope, isTeam: Boolean(team), weeks: n,
    people: t.people,
    weeklyActive: { pct: activePct, count: Math.round(t.weeklyActive), change4w: active[active.length - 1] - active[active.length - 5] },
    checkedIn: { pct: checkinPct, count: Math.round(t.checkedIn), change4w: checkin[checkin.length - 1] - checkin[checkin.length - 5] },
    stickiness: { pct: pct(t.daily, t.monthly), daily: Math.round(t.daily), monthly: Math.round(t.monthly) },
    activated: { pct: pct(t.activated, t.people), count: Math.round(t.activated) },
    series: { labels: WEEKS.slice(-n), active: w, checkin: c, activeFull: active, checkinFull: checkin },
    profiles, surfaces, byTeam,
    frontlineActive: profile(lineRows, "Frontline").weeklyActive,
    readings: { trend: trendReading, team: teamReading, profile: profileReading },
  };
}

export type AdoptionView = ReturnType<typeof deriveAdoption>;
