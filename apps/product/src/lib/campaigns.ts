/**
 * Campaigns module data (route /product/campaigns · "Engage" group).
 * Interventions that move the needle: wellness weeks, 1:1 sprints, recognition
 * pushes, burnout resets. Each campaign has an objective, an audience, a channel
 * mix, a step timeline, and reach / participation / lift results. The AI suggests
 * the next campaign from live Pulse signals. Figures are kept consistent with the
 * org-level `campaigns` seed and known signals in lib/data.ts.
 */

export type CampaignStatus = "live" | "scheduled" | "completed" | "draft";

/** Campaign objectives — `color`/`emoji` drive chips + bars. */
export type Objective = { key: string; label: string; emoji: string; color: string };
export const objectives: Objective[] = [
  { key: "engagement", label: "Lift engagement", emoji: "📈", color: "var(--purple)" },
  { key: "burnout", label: "Reduce burnout", emoji: "🌿", color: "var(--success)" },
  { key: "recognition", label: "Boost recognition", emoji: "🎉", color: "var(--warning)" },
  { key: "manager", label: "Manager 1:1s", emoji: "🤝", color: "var(--info)" },
  { key: "onboarding", label: "Onboarding", emoji: "🚀", color: "var(--danger)" },
];

/** Delivery channels a campaign can use (icon resolved in the component). */
export const channels = [
  { key: "feed", label: "Feed post" },
  { key: "email", label: "Email" },
  { key: "push", label: "Push" },
  { key: "survey", label: "Pulse survey" },
] as const;

export type Step = { label: string; when: string; done: boolean };

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
};

export const campaignStats = { active: 3, avgParticipation: 74, avgLift: 4.1, reached: "10.4K" };

export const campaigns: Campaign[] = [
  {
    id: "c1", name: "Wellness Week", objective: "burnout", audience: "All org", status: "live",
    reach: 91, participation: 76, lift: 5.2, window: "Jun 3 – Jun 17",
    channels: ["feed", "email", "push"],
    steps: [
      { label: "Kickoff post from the CEO", when: "Jun 3", done: true },
      { label: "No-meeting Wednesday", when: "Jun 5", done: true },
      { label: "Mid-week pulse check", when: "Jun 10", done: true },
      { label: "Refreshed benefits guide drop", when: "Jun 12", done: false },
      { label: "Wrap-up & results share", when: "Jun 17", done: false },
    ],
    aiReadout: "Participation is 12 pts above the Wellness benchmark. Engineering — your burnout hotspot — is engaging at 68%, its highest in six months.",
  },
  {
    id: "c2", name: "Manager 1:1 sprint", objective: "manager", audience: "People managers", status: "live",
    reach: 88, participation: 84, lift: 3.8, window: "Jun 1 – Jun 30",
    channels: ["email", "survey"],
    steps: [
      { label: "Manager kickoff & AI prep guide", when: "Jun 1", done: true },
      { label: "Week 1 — overdue 1:1s cleared", when: "Jun 8", done: true },
      { label: "Week 2 — coaching nudges", when: "Jun 15", done: true },
      { label: "Week 3 — 1:1 quality survey", when: "Jun 22", done: false },
      { label: "Manager scorecard update", when: "Jun 30", done: false },
    ],
    aiReadout: "1:1 completion rose from 71% to 88%. Sales · West — where you had two overdue 1:1s — is now fully caught up.",
  },
  {
    id: "c3", name: "Recognition push — cold zones", objective: "recognition", audience: "Night shift · Plant Ops · Logistics", status: "scheduled",
    reach: 0, participation: 0, lift: 0, window: "Starts Jun 24",
    channels: ["feed", "push"],
    steps: [
      { label: "Manager nudge — give one shout-out", when: "Jun 24", done: false },
      { label: "Values spotlight on the feed", when: "Jun 26", done: false },
      { label: "Peer-to-peer kudos challenge", when: "Jul 1", done: false },
      { label: "Coverage re-check", when: "Jul 8", done: false },
    ],
    aiReadout: "Targeted at the three teams with recognition cold zones (34–48% coverage) that overlap with your highest flight-risk. Predicted +3 pts to 30-day retention intent.",
  },
  {
    id: "c4", name: "Onboarding boost — June cohort", objective: "onboarding", audience: "New joiners", status: "live",
    reach: 97, participation: 89, lift: 4.6, window: "Jun 2 – Jun 30",
    channels: ["email", "push", "survey"],
    steps: [
      { label: "Welcome + buddy match", when: "Day 1", done: true },
      { label: "Week-1 check-in survey", when: "Day 7", done: true },
      { label: "Manager 30-day sync", when: "Day 30", done: false },
    ],
    aiReadout: "89% of new joiners completed week-1 check-in — 18 pts above last cohort. Buddy matching is the strongest correlated driver.",
  },
  {
    id: "c5", name: "Night-shift pulse", objective: "engagement", audience: "Plant Ops", status: "completed",
    reach: 64, participation: 41, lift: 1.1, window: "May 5 – May 19",
    channels: ["push", "survey"],
    steps: [
      { label: "Shift-friendly timing (push at clock-in)", when: "May 5", done: true },
      { label: "Anonymous voice prompt", when: "May 10", done: true },
      { label: "Supervisor readout", when: "May 19", done: true },
    ],
    aiReadout: "Reach lagged at 64% — push-only didn't cut through. Lesson logged: pair with an on-floor QR poster next time to lift participation.",
  },
];

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
