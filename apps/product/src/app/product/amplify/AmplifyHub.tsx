"use client";
/* AMPLIFY — Pillar 3. "Bring the company's external voice in, and let employee
   moments go out."

   Three AI features from the brief are live here: a personal caption drafted in
   the employee's own voice, best-time-to-post per platform, and advocacy impact
   scoring that makes resharing visible as a recognised contribution.

   Nothing on this screen posts anywhere. The brief is explicit that this pillar
   "carries the most external-API and compliance risk in the whole platform" and
   asks for a per-platform feasibility spike BEFORE the auto-mirror feature is
   committed to. That spike has not happened, so the screen says so and hands the
   employee a caption to copy instead of pretending to publish. */
import * as React from "react";
import { Copy, Heart, MessageCircle, Repeat2, ShieldCheck, TrendingUp } from "lucide-react";
import { Badge, Button, SparkMark, Switch } from "@vadal/design-system";
import { usePersistentState } from "@/lib/usePersistentState";
import { draftCaption, scoreAdvocacy, canAutoMirror, FEASIBILITY, type Voice } from "@/lib/ai/engines/advocacy";
import { bestTimeToPost, type Platform } from "@/lib/ai/engines/timing";
import { companyPosts, shares, companyPostReach, advocacyStats } from "@/lib/amplify";
import { canAccess } from "@/lib/access";
import { useViewAs } from "../useViewAs";
import { useSession } from "../useSession";
import { toast } from "../Toaster";

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-faint">{children}</p>;
}
function Card({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <section className={`card-lift flex flex-col rounded-[26px] border border-line bg-card p-6 sm:p-7 ${className}`}>{children}</section>;
}

const VOICES: { key: Voice; label: string }[] = [
  { key: "plain", label: "Plain" },
  { key: "warm", label: "Warm" },
  { key: "proud", label: "Proud" },
  { key: "technical", label: "Technical" },
];

export function AmplifyHub() {
  const [role] = useViewAs();
  const { session } = useSession();
  const isAdmin = canAccess(role, "Campaigns");

  const [optIn, setOptIn] = usePersistentState<boolean>("vadal:advocacy-optin", false);
  const [open, setOpen] = React.useState<string | null>(null);
  const [voice, setVoice] = React.useState<Voice>("warm");
  const [edited, setEdited] = React.useState<Record<string, string>>({});

  const impact = scoreAdvocacy(shares, companyPostReach);
  const queue = companyPosts.filter((p) => p.inAdvocacyQueue);

  return (
    <div className="flex flex-col gap-6">
      <header className="rise relative overflow-hidden rounded-[28px] border border-line bg-card p-7 shadow-[0_1px_2px_rgba(20,20,40,0.04),0_18px_42px_-26px_rgba(20,20,40,0.22)] sm:p-9">
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full opacity-[0.08] blur-3xl" style={{ background: "radial-gradient(circle, var(--client-brand, var(--purple)), transparent 70%)" }} aria-hidden />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <Eyebrow>Amplify</Eyebrow>
            <h1 className="mt-2 text-[clamp(24px,3vw,34px)] font-bold leading-[1.05] tracking-[-0.025em]">Your company, in your words</h1>
            <p className="mt-2 max-w-lg text-[16px] leading-relaxed text-muted">
              What the company says publicly, in one place — and a caption written the way you would write it, if you
              want to share it. Never automatic, never under your name without your say-so.
            </p>
          </div>
          {isAdmin && (
            <div className="flex items-center gap-5">
              {[[advocacyStats.participants, "opted in"], [advocacyStats.resharesThisMonth, "reshares"], [`${impact.multiplier}×`, "reach vs company"]].map(([v, l]) => (
                <div key={String(l)} className="text-center">
                  <div className="text-[22px] font-bold tracking-tight">{v}</div>
                  <div className="mt-0.5 text-[12px] text-faint">{l}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* the opt-in — off by default, always */}
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 max-w-xl">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[var(--purple)]" />
              <Eyebrow>Your choice</Eyebrow>
            </div>
            <p className="mt-2 text-[16px] leading-relaxed text-muted">
              Advocacy is opt-in per person. With it off you can still read everything here — you just won&apos;t be
              offered captions or counted in the numbers. Nothing is ever posted under your name automatically.
            </p>
          </div>
          <Switch checked={optIn} onChange={(v: boolean) => { setOptIn(v); toast(v ? "You're in — captions are yours to edit" : "Opted out"); }} label="Take part in advocacy" />
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12 xl:items-start">
        {/* inbound company posts */}
        <div className="flex flex-col gap-6 xl:col-span-7">
          <Card>
            <Eyebrow>From the company</Eyebrow>
            <p className="mt-1 text-[14px] text-muted">Clearly marked as external — this is what the outside world sees.</p>
            <ul className="mt-4 flex flex-col gap-3">
              {companyPosts.map((p) => {
                const isOpen = open === p.id;
                const caption = draftCaption(p.text, voice, p.platform, session?.title);
                const value = edited[p.id] ?? caption.text;
                const timing = bestTimeToPost(p.platform);
                const gate = canAutoMirror(p.platform);

                return (
                  <li key={p.id} className="rounded-2xl border border-line p-4">
                    <div className="flex items-center gap-2">
                      <Badge tone="neutral" variant="soft" size="sm">{p.platform}</Badge>
                      <span className="text-[12px] text-faint">{p.posted}</span>
                      {p.inAdvocacyQueue && <Badge tone="brand" variant="soft" size="sm">In advocacy queue</Badge>}
                    </div>
                    <p className="mt-2.5 text-[16px] leading-relaxed">{p.text}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-4 text-[12px] text-faint">
                      <span className="flex items-center gap-1"><Heart className="h-3 w-3" />{p.likes.toLocaleString()}</span>
                      <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" />{p.comments}</span>
                      <span className="flex items-center gap-1"><Repeat2 className="h-3 w-3" />{p.shares}</span>
                      {optIn && (
                        <button onClick={() => setOpen(isOpen ? null : p.id)} className="ml-auto font-semibold text-[var(--purple)]">
                          {isOpen ? "Close" : "Share this"}
                        </button>
                      )}
                    </div>

                    {isOpen && optIn && (
                      <div className="mt-4 rounded-2xl bg-[var(--ai-surface)] p-4 ring-1 ring-[var(--ai-border)]">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="ai-grad grid h-6 w-6 place-items-center rounded-full"><SparkMark size={13} tone="solid" /></span>
                          <Eyebrow>Your caption</Eyebrow>
                          <div className="ml-auto flex items-center gap-0.5 rounded-full border border-line bg-card p-0.5">
                            {VOICES.map((v) => (
                              <button key={v.key} onClick={() => { setVoice(v.key); setEdited((e) => { const n = { ...e }; delete n[p.id]; return n; }); }}
                                className={`rounded-full px-2.5 py-1 text-[12px] font-semibold transition ${voice === v.key ? "bg-soft text-ink" : "text-muted hover:text-ink"}`}>
                                {v.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <textarea value={value} onChange={(e) => setEdited((x) => ({ ...x, [p.id]: e.target.value }))} rows={3}
                          className="mt-3 w-full resize-y rounded-xl border border-line bg-card p-3 text-[14px] leading-relaxed outline-none focus:border-[var(--ai-accent)]" />

                        <p className="mt-2 text-[12px] text-faint">{timing.reason}</p>

                        {/* the feasibility gate, stated before anyone tries */}
                        <p className="mt-3 rounded-xl bg-soft px-3 py-2.5 text-[12px] leading-snug text-muted">
                          <b className="font-semibold text-ink">We can&apos;t post this for you yet.</b> {gate.reason}
                        </p>

                        <Button className="mt-3" size="sm" variant="brand" leadingIcon={<Copy className="h-3.5 w-3.5" />}
                          onClick={() => { navigator.clipboard?.writeText(value); toast("Caption copied — paste it wherever you like"); }}>
                          Copy caption
                        </Button>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </Card>
        </div>

        <div className="flex flex-col gap-6 xl:col-span-5">
          {/* impact — modelled, and labelled as modelled */}
          {isAdmin && (
            <Card>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-[var(--purple)]" />
                <Eyebrow>Advocacy impact</Eyebrow>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-4">
                <div><div className="text-[22px] font-bold tracking-tight">{impact.estimatedReach.toLocaleString()}</div><div className="text-[12px] text-faint">estimated reach</div></div>
                <div><div className="text-[22px] font-bold tracking-tight">{impact.multiplier}×</div><div className="text-[12px] text-faint">vs the company account</div></div>
              </div>
              <div className="mt-4">
                <Eyebrow>Worth recognising</Eyebrow>
                <ul className="mt-2 flex flex-col gap-1.5">
                  {impact.topContributors.map((c) => (
                    <li key={c.employee} className="flex items-center gap-2 text-[14px]">
                      <span className="truncate">{c.employee}</span>
                      <span className="ml-auto shrink-0 text-[12px] font-semibold text-faint">{c.reach.toLocaleString()} reached</span>
                    </li>
                  ))}
                </ul>
              </div>
              <p className="mt-3 text-[12px] leading-snug text-faint">{impact.caveat}</p>
            </Card>
          )}

          {/* the advocacy queue */}
          <Card>
            <Eyebrow>Advocacy queue</Eyebrow>
            <p className="mt-1 text-[14px] text-muted">{queue.length} post{queue.length === 1 ? "" : "s"} HR has put forward for resharing.</p>
            <ul className="mt-3 flex flex-col gap-2">
              {queue.map((p) => (
                <li key={p.id} className="rounded-xl border border-line p-3.5">
                  <p className="text-[14px] leading-snug">{p.text.slice(0, 110)}{p.text.length > 110 ? "…" : ""}</p>
                  <p className="mt-1.5 text-[12px] text-faint">{p.platform} · best at {String(bestTimeToPost(p.platform).hour).padStart(2, "0")}:00</p>
                </li>
              ))}
            </ul>
          </Card>

          {/* the honest status of this pillar */}
          <Card>
            <Eyebrow>Platform status</Eyebrow>
            <p className="mt-1.5 text-[14px] leading-relaxed text-muted">
              The brief asks for a platform-by-platform feasibility spike before auto-mirroring is committed to. None has
              run, so nothing here posts.
            </p>
            <ul className="mt-3 flex flex-col gap-2">
              {FEASIBILITY.map((f) => (
                <li key={f.platform} className="rounded-xl bg-soft px-3.5 py-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-semibold">{f.platform}</span>
                    <Badge tone="warning" variant="soft" size="sm">Spike not run</Badge>
                  </div>
                  <p className="mt-1 text-[12px] leading-snug text-faint">{f.note}</p>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
