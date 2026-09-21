"use client";
/* Ask — the desk's front door (SmartWork, spec 051).

   Two things people arrive with, and they are not the same thing:
   · a question — answered here, from a named policy, with its age shown;
   · a task — "send me my payslip" — finished on the spot, with a receipt.

   The empty box is the hard part of any help screen, so the tasks are visible
   before you type and the common questions fill the box rather than sending
   it: the first words on screen are still yours to change.

   Nothing here pretends to be sure. An answer says which document it came
   from, says so loudly when that document is stale, and offers a person the
   moment it is not enough. */
import * as React from "react";
import Link from "next/link";
import {
  ArrowRight, BadgeCheck, CreditCard, FileText, MapPin, Receipt, Search, ShieldAlert, Sparkles, UserRound, Wallet,
} from "lucide-react";
import { Button, SparkMark } from "@vadal/design-system";
import {
  answerFor, commonQuestions, instantActions, type DeskAnswer, type InstantAction,
} from "@/lib/smartwork";
import { Card, Eyebrow } from "./parts";

const ICON = {
  payslip: Receipt, letter: FileText, leave: BadgeCheck, card: CreditCard, address: MapPin, tax: Wallet,
} as const;

export function Ask({ onDone, onAnswered, onEscalate }: {
  onDone: (a: InstantAction) => void;
  onAnswered: (q: string, outcome: string) => void;
  onEscalate: (q: string, answer: DeskAnswer | null) => void;
}) {
  const [q, setQ] = React.useState("");
  const [asked, setAsked] = React.useState<string | null>(null);
  const [thinking, setThinking] = React.useState(false);
  const [settled, setSettled] = React.useState<"yes" | null>(null);
  const answer = asked ? answerFor(asked) : null;

  function ask(text: string) {
    const t = text.trim();
    if (t.length < 3) return;
    setThinking(true);
    setSettled(null);
    window.setTimeout(() => { setAsked(t); setThinking(false); }, 420);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ── the box ── */}
      <section className="relative overflow-hidden rounded-[28px] border border-line bg-card p-6 shadow-[0_1px_2px_rgba(20,20,40,0.04),0_24px_56px_-36px_rgba(20,20,40,0.3)] sm:p-8">
        <span aria-hidden className="ai-grad absolute inset-x-0 top-0 h-[2px] opacity-70" />
        <h2 className="text-[clamp(20px,2.2vw,26px)] font-bold leading-tight tracking-[-0.02em]">What do you need?</h2>
        <p className="mt-1.5 text-[15px] leading-relaxed text-muted">
          Pay, leave, insurance, letters, policy. Answered from the company&rsquo;s own documents — and if it needs a person, they get the whole conversation, not a ticket number.
        </p>

        <form
          onSubmit={(e) => { e.preventDefault(); ask(q); }}
          className="mt-5 flex flex-col gap-2 sm:flex-row"
        >
          <label className="relative flex-1">
            <span className="sr-only">Your question</span>
            <Search aria-hidden className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Ask anything — “how many paid leaves do I have?”"
              className="min-h-[52px] w-full rounded-full border border-line bg-card pl-11 pr-4 text-[16px] outline-none transition focus:border-[var(--ai-accent)]"
            />
          </label>
          <Button type="submit" variant="brand" className="min-h-[52px] shrink-0 px-6" disabled={q.trim().length < 3}>Ask</Button>
        </form>

        <ul className="mt-3 flex flex-wrap gap-1.5">
          {commonQuestions.map((c) => (
            <li key={c}>
              <button
                onClick={() => { setQ(c); ask(c); }}
                className="min-h-[44px] rounded-full border border-line px-3.5 text-[14px] text-muted transition hover:border-[var(--purple)] hover:text-ink lg:min-h-[36px]"
              >
                {c}
              </button>
            </li>
          ))}
        </ul>
      </section>

      {thinking && (
        <Card>
          <p className="flex items-center gap-2 text-[15px] text-muted"><SparkMark size={15} tone="gradient" className="ai-breathe" /> Reading the policy…</p>
        </Card>
      )}

      {/* ── the answer ── */}
      {asked && !thinking && (
        <Card>
          <Eyebrow>You asked</Eyebrow>
          <p className="mt-1.5 text-[17px] font-semibold leading-snug">{asked}</p>

          {answer ? (
            <>
              <p className="mt-4 whitespace-pre-line text-[16px] leading-relaxed text-ink">{strip(answer.text)}</p>

              <ul className="mt-4 flex flex-col gap-2">
                {answer.sources.map((s) => (
                  <li key={s.id} className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[14px]">
                    <FileText aria-hidden className="h-4 w-4 shrink-0 text-faint" />
                    <Link href={`/product/knowledge?a=${s.id}`} className="font-semibold text-[var(--purple)] hover:underline">{s.title}</Link>
                    <span className="text-faint">· {s.updated.toLowerCase().startsWith("updated") ? s.updated : `updated ${s.updated}`}</span>
                    {s.stale && (
                      <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[12px] font-semibold" style={{ background: "color-mix(in srgb, var(--warning) 14%, transparent)", color: "var(--warning)" }}>
                        <ShieldAlert className="h-3.5 w-3.5" /> Past its review date — check before you rely on it
                      </span>
                    )}
                  </li>
                ))}
              </ul>

              {answer.action && (
                <div className="mt-5 rounded-2xl bg-[var(--ai-surface)] p-4 ring-1 ring-[var(--ai-border)]">
                  <p className="flex items-center gap-2 text-[15px] font-semibold"><Sparkles className="h-4 w-4 text-[var(--ai-accent)]" /> I can do this part for you</p>
                  <p className="mt-1 text-[14px] text-muted">{answer.action.result} · {answer.action.takes}</p>
                  <Button variant="brand" size="sm" className="mt-3 min-h-[44px] lg:min-h-0" onClick={() => onDone(answer.action!)}>{answer.action.label}</Button>
                </div>
              )}

              <div className="mt-6 border-t border-line pt-4">
                {settled === "yes" ? (
                  <p className="text-[14px] font-semibold text-[var(--success)]">Good. It&rsquo;s in your requests if you need it again.</p>
                ) : (
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-[15px] font-semibold">Did that answer it?</span>
                    <Button variant="secondary" size="sm" className="min-h-[44px] lg:min-h-0"
                      onClick={() => { setSettled("yes"); onAnswered(asked, strip(answer.text).slice(0, 140)); }}>
                      Yes, done
                    </Button>
                    <Button variant="tertiary" size="sm" className="min-h-[44px] lg:min-h-0" onClick={() => onEscalate(asked, answer)}>
                      No — get me a person
                    </Button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="mt-4 rounded-2xl bg-soft p-5">
              <p className="text-[16px] font-semibold">No policy covers this one.</p>
              <p className="mt-1.5 text-[14px] leading-relaxed text-muted">
                Rather than guess, this goes to the People team with what you wrote. They answer these in about a day, and the answer becomes a document so the next person gets it instantly.
              </p>
              <Button variant="brand" size="sm" className="mt-3 min-h-[44px] lg:min-h-0" trailingIcon={<ArrowRight className="h-4 w-4" />} onClick={() => onEscalate(asked, null)}>
                Send it to a person
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* ── the tasks ── */}
      <section aria-labelledby="now-h" className="flex flex-col gap-3">
        <div>
          <h2 id="now-h" className="text-[18px] font-bold tracking-tight">Things I can finish now</h2>
          <p className="mt-0.5 text-[14px] text-muted">No form, no ticket, no waiting for someone to open their laptop.</p>
        </div>
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {instantActions.map((a) => {
            const Icon = ICON[a.icon];
            return (
              <li key={a.id}>
                <button
                  onClick={() => onDone(a)}
                  className="flex min-h-[92px] w-full items-start gap-3.5 rounded-2xl border border-line bg-card p-4 text-left transition hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--purple)_40%,var(--line))] hover:shadow-[0_18px_40px_-30px_rgba(20,20,40,0.45)]"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--lav)] text-[var(--purple)]"><Icon className="h-5 w-5" strokeWidth={1.8} /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-semibold text-ink">{a.label}</span>
                    <span className="mt-0.5 block text-[14px] leading-snug text-muted">{a.hint}</span>
                    <span className="mt-1.5 block text-[13px] text-faint">{a.takes}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <p className="flex items-start gap-2 text-[13px] leading-relaxed text-faint">
        <UserRound className="mt-[2px] h-4 w-4 shrink-0" />
        Anything personal — your health, your money, how you are doing — belongs in <Link href="/product/support" className="inline-flex min-h-[44px] items-center font-semibold text-[var(--purple)] hover:underline lg:min-h-0">Support</Link>, where it stays between you and a counsellor.
      </p>
    </div>
  );
}

/** The library writes **bold** in its answers; the desk renders plain text. */
function strip(s: string) {
  return s.replace(/\*\*/g, "");
}
