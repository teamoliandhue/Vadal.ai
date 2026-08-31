"use client";
/* ══════════════════ the Amplify context rail ══════════════════
   It held three cards against a 2,245px column — a third of the screen was
   blank and one of the three was a disclaimer.

   Filling it is not the point; what went in was chosen because each card was
   something the pillar already owed the person:

   · YOUR VOICE — the opt-out control disappeared the moment you opted in, so
     "opt out any time" was a promise with nothing behind it. And consent was
     all-or-nothing: someone happy to share their own wins but not marketing's
     posts had no way to say so, which is exactly the person we lose (58% of
     declines are "reads too corporate"). A narrowed opt-in beats a churned one.
   · WHAT YOU'VE SENT — we ask "did you post it?", count it, and never mention
     it again.
   · WHAT GOOD LOOKS LIKE — nobody knows what to write. Three captions
     colleagues actually sent teach the norm better than instruction can.
   · QUESTIONS — the real objections, unanswered anywhere in the product.

   The rail's job changes with state. Opted out it is reassurance, not
   statistics: the questions come first and the numbers do not appear at all. */
import * as React from "react";
import { ChevronDown, Link2, Minus, Plus } from "lucide-react";
import { Avatar, SparkMark } from "@vadal/design-system";
import { advocacyStreak, type Voice } from "@/lib/ai/engines/advocacy";
import type { Platform } from "@/lib/ai/engines/timing";
import {
  advocacyFaq, advocacyStats, exemplarShares, myActiveWeeks, myAdvocacy, myReachSeries,
  mySentShares, reachWeekLabels, recentSharers, socialPolicy, type AdvocacyScope,
} from "@/lib/amplify";
import { FEASIBILITY } from "@/lib/ai/engines/advocacy";
import { DayArea } from "@/components/charts";
import { Card, Eyebrow, Mark, VOICES, ALL_PLATFORMS } from "./parts";

export type Prefs = { scope: AdvocacyScope; voice: Voice; platform: Platform };

/* ── 1 · your voice ────────────────────────────────────────────────
   Settings, but only the ones that change what this screen does. */
const SCOPES: { key: AdvocacyScope; label: string; blurb: string }[] = [
  { key: "both", label: "Both", blurb: "Your own moments and the company's posts." },
  { key: "mine", label: "Only my own", blurb: "Your wins. We'll never put a company post in front of you." },
  { key: "company", label: "Only the company's", blurb: "Company posts only. We'll leave your own moments alone." },
];

export function VoiceCard({
  prefs, setPrefs, optIn, onOptOut,
}: {
  prefs: Prefs; setPrefs: (p: Prefs) => void; optIn: boolean; onOptOut: () => void;
}) {
  const [open, setOpen] = React.useState(false);
  if (!optIn) return null;

  return (
    <Card>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex min-h-[44px] w-full items-center gap-2 text-left"
      >
        <div className="min-w-0 flex-1">
          <Eyebrow>Your voice</Eyebrow>
          <p className="mt-1 text-[14px] leading-snug text-muted">
            {SCOPES.find((s) => s.key === prefs.scope)?.label} · {VOICES.find((v) => v.key === prefs.voice)?.label} ·{" "}
            {prefs.platform}
          </p>
        </div>
        <ChevronDown className={`h-4 w-4 shrink-0 text-faint transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="mt-4 flex flex-col gap-4">
          {/* The setting that matters most, and the one that did not exist. */}
          <div>
            <p className="text-[13px] font-semibold">What should we ask you about?</p>
            <div className="mt-2 flex flex-col gap-1.5">
              {SCOPES.map((s) => (
                <button
                  key={s.key}
                  onClick={() => setPrefs({ ...prefs, scope: s.key })}
                  aria-pressed={prefs.scope === s.key}
                  className={`rounded-xl border px-3.5 py-2.5 text-left transition ${
                    prefs.scope === s.key
                      ? "border-[var(--ai-border)] bg-[var(--ai-surface)]"
                      : "border-line hover:bg-soft"
                  }`}
                >
                  <span className="text-[14px] font-semibold">{s.label}</span>
                  <span className="mt-0.5 block text-[12px] leading-snug text-muted">{s.blurb}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[13px] font-semibold">Start drafts in</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {VOICES.map((v) => (
                <button
                  key={v.key}
                  onClick={() => setPrefs({ ...prefs, voice: v.key })}
                  aria-pressed={prefs.voice === v.key}
                  className={`min-h-[36px] rounded-full border px-3 text-[13px] font-medium transition ${
                    prefs.voice === v.key ? "border-transparent bg-soft text-ink" : "border-line text-muted hover:text-ink"
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[13px] font-semibold">Default platform for your own moments</p>
            <div className="mt-2 flex items-center gap-1.5">
              {ALL_PLATFORMS.map((p) => (
                <button
                  key={p}
                  onClick={() => setPrefs({ ...prefs, platform: p })}
                  aria-pressed={prefs.platform === p}
                  aria-label={p}
                  className={`grid min-h-[40px] min-w-[40px] place-items-center rounded-full transition ${
                    prefs.platform === p ? "bg-soft" : "opacity-45 hover:opacity-100"
                  }`}
                >
                  <Mark platform={p} size={18} />
                </button>
              ))}
            </div>
          </div>

          {/* The promise the product was making with nothing behind it. */}
          <div className="border-t border-line pt-3.5">
            <button
              onClick={onOptOut}
              className="min-h-[44px] w-full rounded-full border border-line text-[14px] font-semibold text-muted transition hover:border-[var(--danger)] hover:text-[var(--danger)] lg:min-h-[40px]"
            >
              Opt out of advocacy
            </button>
            <p className="mt-2 text-[12px] leading-snug text-faint">
              Turns everything here off. Nothing you have already posted is affected — those are your
              posts, on your accounts.
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}

/* ── 2 · your reach ────────────────────────────────────────────── */
export function ReachCard() {
  const streak = advocacyStreak(myActiveWeeks);
  return (
    <Card>
      <div className="flex items-baseline justify-between gap-2">
        <Eyebrow>Your reach</Eyebrow>
        <span className="text-[12px] text-faint">8 weeks</span>
      </div>
      <div className="mt-2 flex items-end gap-2">
        <span className="text-[32px] font-bold leading-none tracking-tight tabular-nums">
          {myAdvocacy.estimatedReach.toLocaleString()}
        </span>
        <span className="pb-1 text-[14px] text-faint">people, from {myAdvocacy.shares} shares</span>
      </div>

      {/* The shape of it, not just the total — a flat total hides that this has
          been building. */}
      <DayArea
        id="amp-reach"
        className="mt-3"
        values={myReachSeries}
        labels={reachWeekLabels}
        unit="people reached"
        height={84}
      />

      {/* Quiet on purpose. A streak on an OPTIONAL, public-facing action is a
          pressure device if it shouts — nobody should feel they owe their own
          social account to their employer. It counts up and never warns you
          that you are about to lose it. */}
      {streak.current > 1 && (
        <p className="mt-3 text-[13px] text-muted">
          {streak.current} weeks running{streak.best > streak.current ? ` · best ${streak.best}` : ""}
        </p>
      )}

      <p className="mt-3 text-[14px] leading-relaxed text-muted">
        {/* {" "} is load-bearing. When a JSX text node spans lines, every line
            is trimmed — including the first — so a space sitting right after an
            expression is eaten and you get "148colleagues". */}
        You&apos;re {myAdvocacy.rank}th of {myAdvocacy.of}{" "}
        colleagues taking part. Advocacy counts as a contribution — it shows up in Recognition,
        not just marketing&apos;s dashboard.
      </p>
      <p className="mt-2 text-[12px] leading-snug text-faint">
        Reach is modelled from follower counts, not measured.
      </p>
    </Card>
  );
}

/* ── 3 · what you've sent ──────────────────────────────────────────
   We ask "did you post it?", count it, and then never mention it again. */
export function SentCard() {
  if (mySentShares.length === 0) return null;
  return (
    <Card>
      <Eyebrow>What you&apos;ve sent</Eyebrow>
      <ul className="mt-3 flex flex-col gap-3.5">
        {mySentShares.map((s) => (
          <li key={s.id} className="flex gap-2.5">
            <Mark platform={s.platform} size={20} />
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-[13px] leading-snug text-ink/90">{s.caption}</p>
              <p className="mt-1 flex flex-wrap items-center gap-x-2 text-[12px] text-faint">
                <span>{s.when}</span>
                <span aria-hidden>·</span>
                <span>{s.source === "moment" ? "your moment" : "company post"}</span>
                {s.referralClicks != null && (
                  <>
                    <span aria-hidden>·</span>
                    <span className="flex items-center gap-1 font-semibold text-muted">
                      <Link2 className="h-3 w-3" />{s.referralClicks} clicks
                    </span>
                  </>
                )}
              </p>
            </div>
          </li>
        ))}
      </ul>
      {/* Say what we cannot see, rather than estimating it next to a real date. */}
      <p className="mt-3.5 border-t border-line pt-3 text-[12px] leading-snug text-faint">
        We can&apos;t see how these did — the platforms don&apos;t tell us, and we&apos;d rather say so
        than guess. Referral clicks are the exception: that link is ours, so those are counted.
      </p>
    </Card>
  );
}

/* ── 4 · what good looks like ──────────────────────────────────────
   The "sharing this week" social proof folded in as the header, because two
   thin cards saying adjacent things is worse than one that says both. */
export function ExemplarsCard() {
  const [i, setI] = React.useState(0);
  const ex = exemplarShares[i];
  return (
    <Card>
      <Eyebrow>What good looks like</Eyebrow>
      <div className="mt-2.5 flex items-center gap-3">
        <div className="flex -space-x-2">
          {recentSharers.slice(0, 5).map((s) => (
            <span key={s.name} className="rounded-full ring-2 ring-[var(--card)]" title={s.name}>
              <Avatar src={s.img} name={s.name} size="sm" />
            </span>
          ))}
        </div>
        <p className="text-[13px] leading-snug text-muted">
          <b className="font-semibold text-ink">{advocacyStats.participants}</b> colleagues,{" "}
          {advocacyStats.resharesThisMonth} shares this month.
        </p>
      </div>

      <figure className="mt-4 rounded-2xl bg-soft p-4">
        <blockquote className="text-[14px] leading-relaxed">&ldquo;{ex.caption}&rdquo;</blockquote>
        <figcaption className="mt-3 flex items-center gap-2">
          <Avatar src={ex.img} name={ex.name} size="sm" />
          <span className="text-[13px] font-semibold">{ex.name}</span>
          <Mark platform={ex.platform} size={16} />
          <span className="text-[12px] text-faint">{ex.when}</span>
        </figcaption>
      </figure>

      <p className="mt-2.5 flex items-start gap-1.5 text-[12px] leading-snug text-muted">
        <SparkMark size={12} tone="solid" className="mt-[3px] shrink-0" />
        {ex.why}
      </p>

      <div className="mt-3 flex items-center gap-1.5">
        {exemplarShares.map((_, n) => (
          <button
            key={n}
            onClick={() => setI(n)}
            aria-label={`Example ${n + 1}`}
            aria-pressed={n === i}
            /* The dot is 6px; the thing you tap is 44. */
            className="grid min-h-[44px] min-w-[24px] place-items-center lg:min-h-[28px]"
          >
            <span
              className={`block h-1.5 rounded-full transition-all ${n === i ? "w-5 bg-[var(--client-brand,var(--purple))]" : "w-1.5 bg-line"}`}
            />
          </button>
        ))}
      </div>
    </Card>
  );
}

/* ── 5 · the questions people actually ask ────────────────────────
   The real objections. Nothing in the product answered them, and the rail is
   emptiest in exactly the state where the job is reassurance. */
export function FaqCard() {
  const [open, setOpen] = React.useState<number | null>(null);
  return (
    <Card>
      <Eyebrow>Before you decide</Eyebrow>
      <ul className="mt-2 flex flex-col">
        {advocacyFaq.map((f, n) => {
          const isOpen = open === n;
          return (
            <li key={f.q} className="border-b border-line last:border-b-0">
              <button
                onClick={() => setOpen(isOpen ? null : n)}
                aria-expanded={isOpen}
                className="flex min-h-[48px] w-full items-center gap-2.5 py-2 text-left"
              >
                <span className="shrink-0 text-faint">
                  {isOpen ? <Minus className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                </span>
                <span className="text-[14px] font-medium leading-snug">{f.q}</span>
              </button>
              {isOpen && <p className="pb-3 pl-6 text-[13px] leading-relaxed text-muted">{f.a}</p>}
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-[12px] leading-snug text-faint">
        Social policy, updated {socialPolicy.updated}.
      </p>
    </Card>
  );
}

/* ── 6 · the feasibility gate ─────────────────────────────────────
   Collapsed to one line. Four warning badges made a working feature look
   broken; the detail is still one tap away for whoever needs it. */
export function FeasibilityCard() {
  const [open, setOpen] = React.useState(false);
  return (
    <Card>
      <button onClick={() => setOpen((v) => !v)} aria-expanded={open} className="flex w-full items-center gap-2 text-left">
        <div className="min-w-0 flex-1">
          <Eyebrow>Posting for you</Eyebrow>
          <p className="mt-1 text-[14px] leading-snug text-muted">
            Not enabled on any platform yet — the brief asks for a feasibility spike first.
          </p>
        </div>
        <ChevronDown className={`h-4 w-4 shrink-0 text-faint transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <ul className="mt-4 flex flex-col gap-2">
          {FEASIBILITY.map((f) => (
            <li key={f.platform} className="rounded-xl bg-soft px-3.5 py-2.5">
              <div className="flex items-center gap-2">
                <Mark platform={f.platform} size={16} />
                <span className="text-[14px] font-semibold">{f.platform}</span>
              </div>
              <p className="mt-1 text-[12px] leading-snug text-faint">{f.note}</p>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

/* ── the rail, ordered by what the state is for ────────────────── */
export function AmplifyRail({
  optIn, prefs, setPrefs, onOptOut,
}: {
  optIn: boolean; prefs: Prefs; setPrefs: (p: Prefs) => void; onOptOut: () => void;
}) {
  /* Opted out, the job is reassurance rather than statistics: the objections
     come first and none of the personal numbers appear at all — quoting
     somebody's reach at them before they have agreed to anything is the wrong
     kind of persuasion. */
  if (!optIn) {
    return (
      <div className="flex flex-col gap-6">
        <FaqCard />
        <ExemplarsCard />
        <FeasibilityCard />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <ReachCard />
      <SentCard />
      <ExemplarsCard />
      <VoiceCard prefs={prefs} setPrefs={setPrefs} optIn={optIn} onOptOut={onOptOut} />
      <FaqCard />
      <FeasibilityCard />
    </div>
  );
}
