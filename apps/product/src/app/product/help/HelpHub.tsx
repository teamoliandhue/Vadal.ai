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
import { Calendar, Lock, Phone, ShieldAlert, Trash2, Video } from "lucide-react";
import { Avatar, Badge, Button, SparkMark } from "@vadal/design-system";
import { usePersistentState } from "@/lib/usePersistentState";
import { crisisResources, intake, matchResources, isLaunchable, buildHandoff, type Triage } from "@/lib/ai/engines/support";
import { POLICY, counsellors, eap, promises } from "@/lib/help";
import { canAccess } from "@/lib/access";
import { useViewAs } from "../useViewAs";
import { toast } from "../Toaster";

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-faint">{children}</p>;
}
function Card({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <section className={`card-lift flex flex-col rounded-[26px] border border-line bg-card p-6 sm:p-7 ${className}`}>{children}</section>;
}

type Turn = { who: "me" | "vadal"; text: string };

export function HelpHub() {
  const [role] = useViewAs();
  const [turns, setTurns] = React.useState<Turn[]>([]);
  const [draft, setDraft] = React.useState("");
  const [triage, setTriage] = React.useState<Triage | null>(null);
  const [consent, setConsent] = usePersistentState<boolean>("vadal:help-consent", false);
  const [booked, setBooked] = React.useState<string | null>(null);

  const crisis = crisisResources(POLICY.region);
  const launchable = isLaunchable(POLICY);
  const resources = triage ? matchResources(triage, 3) : [];

  function say(text: string) {
    const t = text.trim();
    if (!t) return;
    const turn = intake(t, POLICY.region);
    setTurns((all) => [
      ...all,
      { who: "me", text: t },
      { who: "vadal", text: [turn.reflection, turn.question].filter(Boolean).join(" ") },
    ]);
    setTriage(turn.triage);
    setDraft("");
  }

  function clearHistory() {
    setTurns([]);
    setTriage(null);
    toast("Conversation deleted — nothing was kept.");
  }

  const handoff = triage
    ? buildHandoff(turns.filter((t) => t.who === "me").map((t) => t.text), triage, {
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
          <Card>
            <div className="flex items-start justify-between gap-3">
              <div>
                <Eyebrow>Private</Eyebrow>
                <h2 className="mt-1.5 text-[18px] font-bold tracking-tight">Talk it through</h2>
                <p className="mt-1 max-w-md text-[14px] leading-relaxed text-muted">
                  Say as much or as little as you like. I listen, I help you work out what would help — and I hand you
                  to a real person the moment that is the better answer.
                </p>
              </div>
              {turns.length > 0 && (
                <button onClick={clearHistory} className="flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[12px] font-semibold text-faint transition hover:bg-soft hover:text-ink">
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              )}
            </div>

            <div className="mt-5 flex flex-col gap-3">
              {turns.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-line p-5 text-center">
                  <span className="ai-grad mx-auto grid h-10 w-10 place-items-center rounded-full"><SparkMark size={20} tone="solid" /></span>
                  <p className="mt-3 text-[14px] font-semibold">Nothing here is stored anywhere you can&apos;t reach.</p>
                  <p className="mt-1 text-[14px] text-faint">Start wherever you want. There&apos;s no form.</p>
                </div>
              ) : (
                turns.map((t, i) =>
                  t.who === "me" ? (
                    <div key={i} className="flex justify-end">
                      <p className="max-w-[80%] rounded-2xl bg-[var(--purple)] px-3.5 py-2.5 text-[16px] leading-relaxed text-white">{t.text}</p>
                    </div>
                  ) : (
                    <div key={i} className="flex items-start gap-2">
                      <span className="ai-grad mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full"><SparkMark size={13} tone="solid" /></span>
                      <p className="max-w-[85%] rounded-2xl bg-[var(--ai-surface)] px-3.5 py-2.5 text-[16px] leading-relaxed ring-1 ring-[var(--ai-border)]">{t.text}</p>
                    </div>
                  ),
                )
              )}
            </div>

            {/* urgency band — a routing decision, stated as one, never a diagnosis */}
            {triage && (
              <div className="mt-4 rounded-2xl bg-soft p-4">
                <div className="flex items-center gap-2">
                  <Eyebrow>What I&apos;d suggest</Eyebrow>
                  <Badge tone={triage.acute ? "danger" : triage.band === "counsellor" ? "warning" : "info"} variant="soft" size="sm">
                    {triage.acute ? "Speak to someone now" : triage.band === "counsellor" ? "Worth a counsellor" : "Might be enough on its own"}
                  </Badge>
                </div>
                <p className="mt-2 text-[14px] leading-relaxed text-muted">{triage.why}</p>
                <p className="mt-2 text-[12px] text-faint">This is a routing suggestion, not a diagnosis. I don&apos;t do those.</p>
              </div>
            )}

            {resources.length > 0 && (
              <div className="mt-4">
                <Eyebrow>Might help right now</Eyebrow>
                <ul className="mt-2 flex flex-col gap-2">
                  {resources.map((r) => (
                    <li key={r.id}>
                      <button onClick={() => toast(`Opening “${r.title}”`)} className="flex w-full items-center gap-3 rounded-xl border border-line px-3.5 py-2.5 text-left transition hover:bg-soft">
                        <span className="text-[14px] font-semibold">{r.title}</span>
                        <span className="ml-auto shrink-0 text-[12px] text-faint">{r.minutes} min</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <form onSubmit={(e) => { e.preventDefault(); say(draft); }} className="mt-5 flex items-center gap-2">
              <input
                value={draft} onChange={(e) => setDraft(e.target.value)}
                placeholder="However you'd put it…"
                className="min-h-[44px] min-w-0 flex-1 rounded-full border border-line bg-soft px-4 text-[16px] outline-none transition focus:border-[var(--ai-accent)]"
              />
              <Button type="submit" variant="brand">Send</Button>
            </form>
          </Card>

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
        <div className="flex flex-col gap-6 xl:col-span-5">
          <Card>
            <Eyebrow>Skip me entirely</Eyebrow>
            <h2 className="mt-1.5 text-[18px] font-bold tracking-tight">Talk to a real person</h2>
            <p className="mt-1 text-[14px] leading-relaxed text-muted">
              You never have to go through the companion first. Book directly, any time.
            </p>

            <ul className="mt-4 flex flex-col gap-3">
              {counsellors.map((c) => (
                <li key={c.id} className="rounded-2xl border border-line p-4">
                  <div className="flex items-center gap-3">
                    <Avatar src="/avatars/user-7.svg" name={c.name} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] font-semibold">{c.name}</p>
                      <p className="truncate text-[12px] text-faint">{c.credentials}</p>
                    </div>
                  </div>
                  <p className="mt-2.5 text-[12px] text-faint">{c.languages.join(" · ")}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <Button
                      size="sm"
                      variant={booked === c.id ? "tertiary" : "brand"}
                      onClick={() => { setBooked(c.id); toast(`Session requested with ${c.name.split(" ")[0]} — confidential`); }}
                      leadingIcon={c.modes.includes("video") ? <Video className="h-3.5 w-3.5" /> : <Phone className="h-3.5 w-3.5" />}
                    >
                      {booked === c.id ? "Requested" : "Book"}
                    </Button>
                    <span className="text-[12px] text-faint">{c.nextAvailable}</span>
                  </div>
                </li>
              ))}
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
