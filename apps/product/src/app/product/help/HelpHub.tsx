"use client";
/* ONE-TO-ONE HELP — Pillar 7. "A private first door to support, with a real
   person always one step away."

   Three rules from the brief are structural here, not styling choices:

   1. Crisis resources sit at the TOP of the screen, before the AI, before
      anything the model has decided. "Regional emergency and crisis-line contact
      details are shown on every screen of this pillar, independent of anything
      the AI detects, never gated behind a conversation."
   2. "Talk to a real person" is visible at all times and never routed through
      triage — booking works whether or not you ever speak to the companion.
   3. The conversation is the person's own: they can read it, and delete it, and
      nothing reaches a manager or HR without per-instance consent.

   The pillar is also gated. The brief calls clinical, legal and HR sign-off a
   hard blocker on launch, so an unsigned policy is shown as an unsigned policy. */
import * as React from "react";
import { Calendar, Lock, Phone, ShieldAlert } from "lucide-react";
import { usePersistentState } from "@/lib/usePersistentState";
import { crisisResources, isLaunchable, buildHandoff, type Triage } from "@/lib/ai/engines/support";
import { POLICY, eap, promises } from "@/lib/help";
import { canAccess } from "@/lib/access";
import { useViewAs } from "../useViewAs";
import { Card, Eyebrow } from "./parts";
import { Companion, type Mode } from "./Companion";
import { Counsellors, SessionFacts } from "./Counsellors";
import { Library } from "./Library";

export function HelpHub() {
  const [role] = useViewAs();
  const [mode, setMode] = React.useState<Mode>("me");
  const [triage, setTriage] = React.useState<Triage | null>(null);
  const [said, setSaid] = React.useState<string[]>([]);
  const [consent, setConsent] = usePersistentState<boolean>("vadal:help-consent", false);
  const humanRef = React.useRef<HTMLDivElement>(null);

  const crisis = crisisResources(POLICY.region);
  const launchable = isLaunchable(POLICY);

  const handoff = triage
    ? buildHandoff(said, triage, {
        granted: consent, shareWith: consent ? ["counsellor"] : [], at: "now",
      })
    : null;

  return (
    <div className="flex flex-col gap-6">
      {/* ── 1 · CRISIS RESOURCES — first on the page, always, unconditionally ── */}
      <section className="rise rounded-[26px] border border-[color-mix(in_srgb,var(--danger)_28%,transparent)] bg-[color-mix(in_srgb,var(--danger)_7%,var(--card))] p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl" style={{ background: "color-mix(in srgb, var(--danger) 14%, transparent)", color: "var(--danger)" }}>
            <ShieldAlert className="h-5 w-5" strokeWidth={1.9} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[16px] font-bold tracking-tight">If you need help right now</p>
            <p className="mt-0.5 text-[14px] text-muted">These are here whatever else is on this page. You do not have to talk to anything first.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {crisis.map((r) => (
              /* The most important tap targets in the product. 48px, not the 44px
                 floor — someone reaching for these is not steady-handed. */
              <a key={r.number} href={`tel:${r.number.replace(/\s/g, "")}`}
                 className="flex min-h-[48px] items-center gap-2 rounded-full border border-line bg-card px-4 py-2.5 text-[16px] font-semibold transition hover:border-[var(--danger)]">
                <Phone className="h-3.5 w-3.5" style={{ color: "var(--danger)" }} />
                {r.label.split("(")[0].trim()} · {r.number}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── the launch blocker, shown honestly to admins ── */}
      {!launchable && canAccess(role, "Settings") && (
        <div className="flex items-start gap-2.5 rounded-2xl border border-line bg-soft px-4 py-3">
          <Lock className="mt-[2px] h-4 w-4 shrink-0 text-faint" strokeWidth={1.85} />
          <p className="text-[14px] leading-snug text-muted">
            <b className="font-semibold text-ink">This pillar is not cleared for launch.</b> The brief treats clinical,
            legal and HR sign-off on the triage thresholds, crisis-escalation policy and data-access rules as a hard
            blocker — not a fast-follow. Until it is signed, no third party is ever notified and no conversation leaves
            this device.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12 xl:items-start">
        {/* ── 2 · the companion ── */}
        <div className="flex flex-col gap-6 xl:col-span-7">
          <Companion
            mode={mode}
            setMode={setMode}
            triage={triage}
            setTriage={setTriage}
            onSaid={(t) => setSaid((all) => [...all, t])}
            onWantHuman={() => humanRef.current?.scrollIntoView({ block: "center" })}
          />

          {/* The door for someone not ready to talk to anybody, machine
              included — which is a great many of the people who open this. */}
          <Library />

          {/* what we promise — stated, because it is the only reason anyone would use this */}
          <Card>
            <Eyebrow>What this is, and isn&apos;t</Eyebrow>
            <ul className="mt-3 flex flex-col gap-2.5">
              {promises.map((p) => (
                <li key={p} className="flex items-start gap-2.5 text-[16px] leading-relaxed text-muted">
                  <Lock className="mt-[5px] h-3.5 w-3.5 shrink-0 text-faint" strokeWidth={2} />
                  {p}
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* ── 3 · a real person — always available, never behind triage ── */}
        <div ref={humanRef} className="flex flex-col gap-6 xl:col-span-5">
          <Counsellors consent={consent} setConsent={setConsent} handoff={handoff} />

          <SessionFacts />

          <Card>
            <Eyebrow>Your EAP</Eyebrow>
            <h3 className="mt-1.5 text-[16px] font-bold tracking-tight">{eap.provider}</h3>
            <a href={`tel:${eap.helpline.replace(/\s/g, "")}`} className="mt-3 flex items-center gap-2.5 rounded-2xl border border-line px-4 py-3 transition hover:bg-soft">
              <Phone className="h-4 w-4 text-[var(--purple)]" />
              <span className="text-[16px] font-semibold">{eap.helpline}</span>
              <span className="ml-auto text-[12px] text-faint">{eap.hours}</span>
            </a>
            <p className="mt-3 flex items-center gap-2 text-[14px] text-muted">
              <Calendar className="h-3.5 w-3.5 shrink-0 text-faint" />
              {eap.sessionsIncluded} sessions a year, included
            </p>
            <p className="mt-2 text-[14px] leading-relaxed text-faint">{eap.note}</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
