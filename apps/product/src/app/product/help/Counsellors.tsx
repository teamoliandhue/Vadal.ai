"use client";
/* ══════════════════════ the human side ══════════════════════
   "Talk to a real person" is never routed through triage — booking works
   whether or not you ever say a word to the companion. That was already right.

   What was not: three names, three near-identical qualifications, three lists
   of languages and a Book button. That is not a choice anyone can make.
   Nothing on the card told you whether this was the person for what you are
   actually carrying, and the credential line — the most prominent thing after
   the name — is the least useful, because all three have one.

   So: what people come to them with, in their own words, and the ability to
   filter by the language you want to cry in. In a workforce spread across
   Kerala, Tamil Nadu and Maharashtra, that is not a nice-to-have. */
import * as React from "react";
import { Calendar, Check, MapPin, Phone, Video } from "lucide-react";
import { Avatar, Button } from "@vadal/design-system";
import { counsellors, eap, SESSION_FACTS } from "@/lib/help";
import type { HandoffSummary } from "@/lib/ai/engines/support";
import { Card, Eyebrow } from "./parts";
import { toast } from "../Toaster";

const MODE_ICON = { video: Video, phone: Phone, "in person": MapPin } as const;

/** Every language any counsellor offers, English first then as listed. */
const ALL_LANGUAGES = [...new Set(counsellors.flatMap((c) => c.languages))];

export function Counsellors({
  consent, setConsent, handoff,
}: {
  consent: boolean; setConsent: (v: boolean) => void; handoff: HandoffSummary | null;
}) {
  const [booked, setBooked] = React.useState<string | null>(null);
  const [lang, setLang] = React.useState<string | null>(null);

  const shown = lang ? counsellors.filter((c) => c.languages.includes(lang)) : counsellors;

  return (
    <Card>
      <Eyebrow>Skip me entirely</Eyebrow>
      <h2 className="mt-1.5 text-[19px] font-bold tracking-tight">Talk to a real person</h2>
      <p className="mt-1 text-[14px] leading-relaxed text-muted">
        You never have to go through the companion first. Book directly, any time.
      </p>

      {/* ── the filter that matters most ── */}
      <div className="mt-4">
        <p className="text-[13px] font-semibold">In which language?</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <button
            onClick={() => setLang(null)}
            aria-pressed={lang === null}
            className={`min-h-[44px] rounded-full border px-3.5 text-[14px] font-medium transition lg:min-h-[38px] ${
              lang === null ? "border-transparent bg-soft text-ink" : "border-line text-muted hover:text-ink"
            }`}
          >
            Any
          </button>
          {ALL_LANGUAGES.map((l) => (
            <button
              key={l}
              onClick={() => setLang(l === lang ? null : l)}
              aria-pressed={lang === l}
              className={`min-h-[44px] rounded-full border px-3.5 text-[14px] font-medium transition lg:min-h-[38px] ${
                lang === l ? "border-transparent bg-soft text-ink" : "border-line text-muted hover:text-ink"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      <ul className="mt-4 flex flex-col gap-3">
        {shown.map((c) => {
          const isBooked = booked === c.id;
          return (
            <li key={c.id} className="rounded-2xl border border-line p-4 transition hover:border-faint/40">
              <div className="flex items-start gap-3">
                <Avatar src={c.img} name={c.name} size="lg" />
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-semibold leading-snug">{c.name}</p>
                  <p className="text-[12px] leading-snug text-faint">{c.credentials} · {c.years} years</p>

                  {/* The actual decision criterion. */}
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {c.specialisms.map((s) => (
                      <span key={s} className="rounded-full bg-soft px-2 py-0.5 text-[12px] font-medium text-muted">{s}</span>
                    ))}
                  </div>
                </div>
              </div>

              <p className="mt-3 text-[14px] italic leading-relaxed text-muted">&ldquo;{c.approach}&rdquo;</p>

              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-[12px] text-faint">
                <span>{c.languages.join(" · ")}</span>
                <span className="flex items-center gap-1.5">
                  {c.modes.map((m) => {
                    const Icon = MODE_ICON[m];
                    return <Icon key={m} className="h-3.5 w-3.5" aria-label={m} />;
                  })}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-line pt-3">
                <Button
                  size="sm"
                  variant={isBooked ? "tertiary" : "brand"}
                  className="min-h-[44px] lg:min-h-0"
                  onClick={() => { setBooked(c.id); toast(`Session requested with ${c.name.split(" ")[0]} — confidential`); }}
                  leadingIcon={isBooked ? <Check className="h-3.5 w-3.5" /> : <Calendar className="h-3.5 w-3.5" />}
                >
                  {isBooked ? "Requested" : "Book"}
                </Button>
                <span className="text-[13px] font-medium text-muted">{c.nextAvailable}</span>
              </div>
            </li>
          );
        })}

        {shown.length === 0 && (
          <li className="rounded-2xl border border-dashed border-line p-5 text-center">
            <p className="text-[14px] font-semibold">Nobody on this list speaks {lang}</p>
            <p className="mt-1 text-[13px] leading-snug text-muted">
              The {eap.provider} helpline below has a wider panel and runs {eap.hours.toLowerCase()} — they can match
              you to someone.
            </p>
          </li>
        )}
      </ul>

      {/* consent — the handoff summary exists only if the person says so */}
      <div className="mt-4 rounded-2xl bg-soft p-4">
        <label className="flex cursor-pointer items-start gap-3">
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 h-4 w-4 shrink-0 accent-[var(--purple)]" />
          <span className="text-[14px] leading-snug">
            <b className="font-semibold">Share a short summary with the counsellor</b>
            <span className="block text-faint">So you don&apos;t have to explain it all again in session one. Off unless you switch it on.</span>
          </span>
        </label>
        {handoff && (
          <pre className="mt-3 whitespace-pre-wrap rounded-xl border border-line bg-card p-3 text-[12px] leading-relaxed text-muted">{handoff.text}</pre>
        )}
      </div>
    </Card>
  );
}

/* ── what actually happens if you book ──────────────────────────
   The page asked for a large step with a button and no explanation. Most of
   what stops people is not stigma — it is not knowing the shape of the thing. */
export function SessionFacts() {
  const [open, setOpen] = React.useState<number | null>(0);
  return (
    <Card>
      <Eyebrow>Before you book</Eyebrow>
      <h3 className="mt-1.5 text-[16px] font-bold tracking-tight">What actually happens</h3>
      <ul className="mt-3 flex flex-col">
        {SESSION_FACTS.map((f, i) => {
          const isOpen = open === i;
          return (
            <li key={f.q} className="border-b border-line last:border-b-0">
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                className="flex min-h-[48px] w-full items-center gap-2.5 py-2 text-left"
              >
                <span className="text-[15px] font-medium leading-snug">{f.q}</span>
                <span className="ml-auto shrink-0 text-[18px] leading-none text-faint">{isOpen ? "−" : "+"}</span>
              </button>
              {isOpen && <p className="pb-3 pr-6 text-[14px] leading-relaxed text-muted">{f.a}</p>}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
