"use client";
/* ══════════════════════ the Grow rail ══════════════════════
   Two cards against a 2,091px column. What went in was chosen because each was
   something this screen already knew and never said:

   · FIVE MINUTES — the pillar's headline promise, which was a sentence and not
     a control. Nothing let anyone act on "five minutes is enough".
   · YOUR RECORD — the page tracked mandatory status, due dates and completion,
     and never produced the one artefact all that tracking exists for: proof.
   · YOUR TEAM — every course carries `enrolled` and `completion` and both were
     rendered nowhere. For compliance in particular, "71% of your colleagues
     have finished this" does more than any due date.
   · BADGES — three grey pills with no next one. A badge with nothing in reach
     is a trophy cabinet, not a mechanic. */
import * as React from "react";
import { Award, BookOpen, Check, Clock, FileText, HelpCircle, Lock, Users } from "lucide-react";
import { Button } from "@vadal/design-system";
import { whatFitsIn } from "@/lib/ai/engines/learning";
import { badges, complianceRecord, courses, minutesThisMonth } from "@/lib/grow";
import { Card, Eyebrow } from "./parts";
import { toast } from "../Toaster";

const KIND_ICON = { read: FileText, video: BookOpen, quiz: HelpCircle } as const;
const CHOICES = [2, 5, 10, 15];

/* ── 1 · the headline, as a control ─────────────────────────────── */
export function TimeFit({ done }: { done: string[] }) {
  const [mins, setMins] = React.useState(5);
  const fits = whatFitsIn(mins, courses, done);
  const best = fits[0];

  return (
    <Card>
      <Eyebrow>How long have you got?</Eyebrow>
      <p className="mt-1.5 text-[14px] leading-relaxed text-muted">
        We&apos;ll find something you can actually finish — a lesson, not a course.
      </p>

      <div className="mt-3.5 flex flex-wrap gap-1.5">
        {CHOICES.map((m) => (
          <button
            key={m}
            onClick={() => setMins(m)}
            aria-pressed={mins === m}
            className={`min-h-[44px] rounded-full border px-4 text-[14px] font-semibold transition lg:min-h-[38px] ${
              mins === m ? "border-transparent bg-ink text-[var(--card)]" : "border-line text-muted hover:text-ink"
            }`}
          >
            {m} min
          </button>
        ))}
      </div>

      {best ? (
        <div className="mt-4 rounded-2xl border border-line p-4">
          <div className="flex items-start gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-soft text-[var(--purple)]">
              {React.createElement(KIND_ICON[best.kind], { className: "h-[17px] w-[17px]", strokeWidth: 1.85 })}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-semibold leading-snug">{best.lessonTitle}</p>
              <p className="mt-0.5 text-[12px] text-faint">
                {best.courseTitle} · lesson {best.index} of {best.total}
              </p>
            </div>
            <span className="shrink-0 text-[13px] font-semibold tabular-nums text-muted">{best.minutes} min</span>
          </div>
          <p className="mt-2.5 text-[13px] leading-snug text-muted">{best.why}</p>
          <Button
            variant="brand" size="sm" className="mt-3 min-h-[44px] lg:min-h-0"
            onClick={() => toast(`Starting “${best.lessonTitle}” — ${best.minutes} min`)}
          >
            Start this one
          </Button>
        </div>
      ) : (
        <p className="mt-4 rounded-2xl border border-dashed border-line p-4 text-[14px] leading-snug text-faint">
          Nothing fits in {mins} minutes right now — the shortest next lesson is longer than that.
          Try a bigger number.
        </p>
      )}

      {fits.length > 1 && (
        <p className="mt-3 text-[12px] text-faint">
          {fits.length - 1} other {fits.length - 1 === 1 ? "lesson fits" : "lessons fit"} in {mins} minutes.
        </p>
      )}

      <p className="mt-3 border-t border-line pt-3 text-[12px] leading-snug text-faint">
        {minutesThisMonth} minutes this month — about {Math.round(minutesThisMonth / 6)} courses&apos; worth,
        taken in breaks.
      </p>
    </Card>
  );
}

/* ── 2 · proof, which is what the tracking was for ──────────────── */
const STATE = {
  clear: { color: "var(--success)", label: "Clear" },
  due: { color: "var(--warning)", label: "Not done" },
  lapsed: { color: "var(--danger)", label: "Lapsed" },
} as const;

export function ComplianceRecord() {
  const clear = complianceRecord.filter((c) => c.state === "clear").length;
  return (
    <Card>
      <div className="flex items-center gap-2">
        <Lock className="h-4 w-4 text-faint" strokeWidth={1.9} />
        <Eyebrow>Your record</Eyebrow>
      </div>
      <p className="mt-1.5 text-[14px] leading-relaxed text-muted">
        Cleared on <b className="font-semibold text-ink">{clear} of {complianceRecord.length}</b>. This is
        what to show anyone who asks.
      </p>

      <ul className="mt-4 flex flex-col">
        {complianceRecord.map((c) => {
          const st = STATE[c.state];
          return (
            <li key={c.courseId} className="flex items-start gap-2.5 border-t border-line py-3 first:border-t-0 first:pt-0">
              <span
                className="mt-[3px] grid h-5 w-5 shrink-0 place-items-center rounded-full"
                style={{ background: `color-mix(in srgb, ${st.color} 14%, transparent)`, color: st.color }}
              >
                {c.state === "clear" ? <Check className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-medium leading-snug">{c.title}</p>
                <p className="mt-0.5 text-[12px] leading-snug text-faint">
                  {c.state === "clear" ? (
                    <>Done {c.completedOn} · valid to {c.validUntil}</>
                  ) : c.state === "lapsed" ? (
                    <>Expired {c.validUntil} — last done {c.completedOn}</>
                  ) : (
                    <>Never completed</>
                  )}
                </p>
              </div>
              <span className="shrink-0 text-[12px] font-semibold" style={{ color: st.color }}>{st.label}</span>
            </li>
          );
        })}
      </ul>

      <Button
        variant="secondary" size="sm" className="mt-3 min-h-[44px] lg:min-h-0"
        onClick={() => toast("Record downloaded — a PDF you can send to anyone")}
      >
        Download my record
      </Button>
    </Card>
  );
}

/* ── 3 · what everyone else has done ────────────────────────────── */
export function TeamProgress() {
  /* enrolled and completion exist on every course and were shown nowhere. For
     compliance in particular this does more work than a due date: "most of your
     colleagues have already done this" is the argument, not the deadline. */
  const tracked = courses.filter((c) => c.mandatory).slice(0, 3);
  return (
    <Card>
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-faint" strokeWidth={1.9} />
        <Eyebrow>How everyone else is doing</Eyebrow>
      </div>
      <ul className="mt-4 flex flex-col gap-3.5">
        {tracked.map((c) => (
          <li key={c.id}>
            <div className="flex items-baseline gap-2 text-[14px]">
              <span className="min-w-0 flex-1 truncate">{c.title}</span>
              <span className="shrink-0 text-[13px] font-semibold tabular-nums">{c.completion}%</span>
            </div>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-line">
              <span
                className="block h-full rounded-full transition-[width] duration-700"
                style={{ width: `${c.completion}%`, background: "var(--client-brand, var(--purple))" }}
              />
            </div>
            <p className="mt-1 text-[12px] text-faint">
              of {c.enrolled.toLocaleString()} people it was given to
            </p>
          </li>
        ))}
      </ul>
      <p className="mt-3.5 border-t border-line pt-3 text-[12px] leading-snug text-faint">
        Nobody is named and nobody is ranked. It is here because knowing most people have already
        done a thing is a better reason to do it than a deadline.
      </p>
    </Card>
  );
}

/* ── 4 · badges, with something in reach ────────────────────────── */
export function Badges() {
  const earned = badges.filter((b) => b.earned);
  const next = badges.filter((b) => !b.earned);
  return (
    <Card>
      <Eyebrow>Badges</Eyebrow>
      <div className="mt-3 flex flex-wrap gap-2">
        {earned.map((b) => (
          <span key={b.id} title={b.hint} className="inline-flex items-center gap-1.5 rounded-full bg-soft px-3 py-1.5 text-[14px] font-semibold">
            <Award className="h-3.5 w-3.5 text-[var(--purple)]" /> {b.label}
          </span>
        ))}
      </div>

      {next.length > 0 && (
        <div className="mt-4 border-t border-line pt-3.5">
          <p className="text-[13px] font-semibold">Closest to next</p>
          <ul className="mt-2.5 flex flex-col gap-3">
            {next.map((b) => (
              <li key={b.id}>
                <div className="flex items-baseline gap-2">
                  <span className="text-[14px] text-muted">{b.label}</span>
                  {b.at != null && b.of != null && (
                    <span className="ml-auto shrink-0 text-[12px] font-semibold tabular-nums text-faint">{b.at}/{b.of}</span>
                  )}
                </div>
                {b.at != null && b.of != null && (
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-line">
                    <span
                      className="block h-full rounded-full"
                      style={{ width: `${(b.at / b.of) * 100}%`, background: "color-mix(in srgb, var(--client-brand, var(--purple)) 55%, transparent)" }}
                    />
                  </div>
                )}
                <p className="mt-1 text-[12px] text-faint">{b.hint}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}
