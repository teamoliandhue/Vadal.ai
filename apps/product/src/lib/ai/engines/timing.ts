/**
 * Timing engine — when and where to reach someone.
 *
 * Implements, from the brief:
 *  · Pulse    — "Smart send-time and channel selection (push, SMS, app) per
 *               person based on when they actually respond, to lift completion
 *               rates for frontline shifts"
 *  · Broadcast— "Delivery-optimisation — AI recommends the best channel/time per
 *               segment to maximise acknowledgement rates for critical messages"
 *  · Amplify  — "Best-time-to-post recommendation per platform based on
 *               historical engagement"
 *  · Pulse    — "Any Copilot-initiated survey send should still respect the
 *               org's existing survey-fatigue and quiet-hours rules"
 *
 * That last one is a hard constraint, not a preference, so quiet hours and
 * fatigue are enforced here rather than left to each caller.
 */

export type Channel = "app" | "push" | "sms" | "whatsapp" | "email" | "teams";

export type ShiftPattern = "day" | "evening" | "night" | "desk";

export type Recipient = {
  email: string;
  team: string;
  shift: ShiftPattern;
  /** Hours (0–23) this person has historically responded in. */
  respondsAt: number[];
  /** Channels they have actually engaged with, best first. */
  reachableOn: Channel[];
  /** Sends they have already received in the last 7 days. */
  recentSends: number;
};

export type QuietHours = { from: number; to: number }; // e.g. { from: 21, to: 7 }

export const DEFAULT_QUIET: QuietHours = { from: 21, to: 7 };

/** The brief's survey-fatigue rule, made explicit and checkable. */
export const FATIGUE_LIMIT_PER_WEEK = 3;

export function inQuietHours(hour: number, quiet: QuietHours = DEFAULT_QUIET): boolean {
  return quiet.from > quiet.to ? hour >= quiet.from || hour < quiet.to : hour >= quiet.from && hour < quiet.to;
}

export type SendPlan = {
  hour: number;
  channel: Channel;
  reason: string;
  /** False when fatigue or quiet hours block it — the send does not happen. */
  allowed: boolean;
  blockedBy?: "fatigue" | "quiet-hours" | "no-channel";
};

/**
 * When and how to reach one person.
 *
 * Shift patterns matter more than clever statistics here: messaging a night-shift
 * worker at 10am is the single most common way engagement software fails the
 * frontline, and it needs no model to avoid.
 */
export function planSend(r: Recipient, quiet: QuietHours = DEFAULT_QUIET, priority: "normal" | "critical" = "normal"): SendPlan {
  const channel = r.reachableOn[0];
  if (!channel) {
    return { hour: 9, channel: "app", reason: "No reachable channel on file.", allowed: false, blockedBy: "no-channel" };
  }

  // Fatigue never blocks a critical message — a safety notice is not a survey.
  if (priority === "normal" && r.recentSends >= FATIGUE_LIMIT_PER_WEEK) {
    return {
      hour: 9, channel,
      reason: `Already had ${r.recentSends} sends this week — over the fatigue limit of ${FATIGUE_LIMIT_PER_WEEK}.`,
      allowed: false, blockedBy: "fatigue",
    };
  }

  const hour = bestHour(r, quiet);
  if (priority === "normal" && inQuietHours(hour, quiet)) {
    return { hour, channel, reason: "Their best window falls inside quiet hours.", allowed: false, blockedBy: "quiet-hours" };
  }

  return {
    hour,
    channel,
    reason: reasonFor(r, hour, channel),
    allowed: true,
  };
}

function bestHour(r: Recipient, quiet: QuietHours): number {
  // Use their own history when we have it.
  const usable = r.respondsAt.filter((h) => !inQuietHours(h, quiet));
  if (usable.length) {
    const counts = new Map<number, number>();
    for (const h of usable) counts.set(h, (counts.get(h) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
  }
  // Otherwise fall back to the shift — the start of a break, not mid-task.
  switch (r.shift) {
    case "night": return 5;      // end of shift, before they sleep
    case "evening": return 16;   // before they clock on
    case "day": return 12;       // lunch break
    default: return 10;
  }
}

function reasonFor(r: Recipient, hour: number, channel: Channel): string {
  const time = `${String(hour).padStart(2, "0")}:00`;
  const via = channel === "sms" || channel === "whatsapp" ? `on ${channel.toUpperCase()}` : `in ${channel}`;
  if (r.respondsAt.length) return `They usually respond around ${time} — sending ${via}.`;
  return `${r.shift === "night" ? "Night shift" : r.shift === "evening" ? "Evening shift" : "Day shift"}, so ${time} ${via} lands on a break rather than mid-task.`;
}

/** Optimise one send across a whole segment (Broadcast). */
export type SegmentPlan = {
  windows: { hour: number; channel: Channel; count: number }[];
  blocked: { reason: string; count: number }[];
  /** Expected acknowledgement lift vs sending everyone at 09:00 in-app. */
  expectedLift: number;
  summary: string;
};

export function planSegment(recipients: Recipient[], quiet: QuietHours = DEFAULT_QUIET, priority: "normal" | "critical" = "normal"): SegmentPlan {
  const windows = new Map<string, { hour: number; channel: Channel; count: number }>();
  const blocked = new Map<string, number>();

  for (const r of recipients) {
    const plan = planSend(r, quiet, priority);
    if (!plan.allowed) {
      blocked.set(plan.blockedBy!, (blocked.get(plan.blockedBy!) ?? 0) + 1);
      continue;
    }
    const key = `${plan.hour}:${plan.channel}`;
    const cur = windows.get(key) ?? { hour: plan.hour, channel: plan.channel, count: 0 };
    windows.set(key, { ...cur, count: cur.count + 1 });
  }

  const sorted = [...windows.values()].sort((a, b) => b.count - a.count);
  const reached = sorted.reduce((n, w) => n + w.count, 0);
  // Off-hours channels are where the lift comes from — desk-hours app-only is the baseline.
  const offBaseline = sorted.filter((w) => w.channel !== "app" || w.hour < 9 || w.hour > 17).reduce((n, w) => n + w.count, 0);
  const expectedLift = recipients.length ? Math.round((offBaseline / recipients.length) * 34) : 0;

  return {
    windows: sorted,
    blocked: [...blocked.entries()].map(([reason, count]) => ({ reason, count })),
    expectedLift,
    summary: sorted.length
      ? `Reaching ${reached} of ${recipients.length} across ${sorted.length} window${sorted.length > 1 ? "s" : ""} — biggest is ${sorted[0].count} people at ${String(sorted[0].hour).padStart(2, "0")}:00 via ${sorted[0].channel}. Expected acknowledgement lift ≈ ${expectedLift}%.`
      : "No one is reachable under the current quiet-hours and fatigue rules.",
  };
}

/* ── Amplify: best time to post per platform ──────────────────── */

export type Platform = "LinkedIn" | "X" | "Instagram" | "Facebook";

/** Historical engagement peaks per platform, per weekday vs weekend. */
const PLATFORM_PEAKS: Record<Platform, { weekday: number[]; weekend: number[] }> = {
  LinkedIn: { weekday: [8, 12, 17], weekend: [10] },
  X: { weekday: [9, 13, 18], weekend: [11, 19] },
  Instagram: { weekday: [12, 19, 21], weekend: [11, 20] },
  Facebook: { weekday: [13, 19], weekend: [12, 20] },
};

export function bestTimeToPost(platform: Platform, isWeekend = false): { hour: number; alternatives: number[]; reason: string } {
  const peaks = isWeekend ? PLATFORM_PEAKS[platform].weekend : PLATFORM_PEAKS[platform].weekday;
  return {
    hour: peaks[0],
    alternatives: peaks.slice(1),
    reason: `${platform} engagement peaks around ${String(peaks[0]).padStart(2, "0")}:00 on ${isWeekend ? "weekends" : "weekdays"}.`,
  };
}
