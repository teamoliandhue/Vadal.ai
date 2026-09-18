"use client";
/* AMPLIFY — Pillar 3. "Bring the company's external voice in, and let employee
   moments go out."

   The brief's sentence has two clauses, and the first build served only one.
   Every feature pointed the same way: the company publishes, we ask an employee
   to carry it. That asymmetry is precisely why corporate advocacy programmes
   die — a screen that only ever asks you for something is a screen you opt out
   of. So the second clause is built now, and it OUTRANKS the first: if Neha
   recognised you yesterday, that is the most shareable thing on this page.
   More shareable than anything marketing published, because it is true, recent
   and yours.

   The hero therefore has four states, in priority order:
     · opted out       — the case, with the switch in it
     · your moment     — YOUR win, drafted, one button        ← the inversion
     · the company's   — today's pick, when you have no moment of your own
     · caught up       — nothing to ask for, said as finished rather than empty

   Two audiences, split rather than stacked. Comms running the programme has a
   genuinely different job from the person sharing, and the first build mixed
   them: admin cards sat in the employee's right rail, so an employee's screen
   was half somebody else's dashboard and comms' most important numbers were a
   footnote on it. Admins get a tab; employees never see one.

   Nothing here posts. The brief requires a per-platform feasibility spike
   first, so the gate is stated on the card rather than discovered after a
   click. */
import * as React from "react";
import { Copy, ShieldCheck, SlidersHorizontal } from "lucide-react";
import { Avatar, Button, SparkMark, Switch } from "@vadal/design-system";
import { usePersistentState } from "@/lib/usePersistentState";
import { draftCaption, draftFromMoment, rankMoments, scoreAdvocacy } from "@/lib/ai/engines/advocacy";
import {
  advocacyStats, companyPosts, companyPostReach, myAdvocacy, myMoments, recentSharers, shares,
  DEFAULT_PREFS, type CompanyPost,
} from "@/lib/amplify";
import type { DeclineReason } from "@/lib/share";
import { canAccess } from "@/lib/access";
import { useViewAs } from "../useViewAs";
import { useSession } from "../useSession";
import { toast } from "../Toaster";
import { Eyebrow, Mark } from "./parts";
import { ExemplarsCard, FaqCard, FeasibilityCard, ReachCard, SentCard, VoiceCard, type Prefs } from "./Rail";
import { Studio, type Item } from "./Studio";
import { Programme } from "./Programme";
import { Results } from "./Results";

export function AmplifyHub() {
  const [role] = useViewAs();
  const isAdmin = canAccess(role, "Campaigns");
  const [tab, setTab] = React.useState<AmplifyTab>("share");

  /* `=== true` is deliberate. A consent flag whose stored value is anything
     other than a literal true must read as OFF — never on. Demo sessions from
     before the fix above hold a truthy event object here, and the safe reading
     of an unreadable consent value is "they did not consent". */
  const [optInRaw, setOptIn] = usePersistentState<boolean>("vadal:advocacy-optin", false);
  const optIn = optInRaw === true;
  /* How the person wants to be asked — see Rail.VoiceCard. These are not
     decorative settings: `scope` decides what this screen is allowed to put in
     front of them at all. */
  const [prefs, setPrefs] = usePersistentState<Prefs>("vadal:advocacy-prefs", DEFAULT_PREFS);
  /* Declines persist. Being shown the same post you already passed on is the
     fastest way to make an optional feature feel like nagging. */
  const [passed, setPassed] = usePersistentState<string[]>("vadal:advocacy-passed", []);
  const [passedMoments, setPassedMoments] = usePersistentState<string[]>("vadal:advocacy-passed-moments", []);
  const [prefsOpen, setPrefsOpen] = React.useState(false);

  const impact = scoreAdvocacy(shares, companyPostReach);

  /* "Only my own" and "only the company's" are real filters, not labels. */
  const wantsCompany = prefs.scope !== "mine";
  const wantsMine = prefs.scope !== "company";
  const live = wantsCompany ? companyPosts.filter((p) => !passed.includes(p.id)) : [];
  const featured = live.find((p) => p.featured) ?? live[0] ?? null;
  const moments = wantsMine ? rankMoments(myMoments, passedMoments) : [];

  /* Yours first, then the company's — the featured pick leads its group. */
  const items: Item[] = [
    ...moments.map((m) => ({ kind: "moment" as const, id: m.id, moment: m })),
    ...[...live].sort((a, b) => Number(b.id === featured?.id) - Number(a.id === featured?.id)).map((p) => ({ kind: "post" as const, id: p.id, post: p })),
  ];

  function decline(id: string, reason: DeclineReason) {
    setPassed((all) => [...all, id]);
    toast(reason === "never" ? "Noted — we'll stop putting these in front of you" : "Passed. We'll show you something else.");
  }

  const tabs = isAdmin ? <Tabs tab={tab} setTab={setTab} /> : null;

  if (isAdmin && tab !== "share") {
    return (
      <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-6">
        <PageHeader tabs={tabs} subtitle={tab === "programme" ? "Run the programme — what's queued for people to share, what's working, and why people pass." : "What sharing did for the company — reach, applications and hires traced to a share."} />
        {tab === "programme" ? <Programme /> : <Results />}
      </div>
    );
  }

  if (!optIn) {
    return (
      <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-6">
        {tabs}
        <OptInHero optIn={optIn} setOptIn={setOptIn} featured={featured} impact={impact} />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <FaqCard />
          <ExemplarsCard />
          <FeasibilityCard />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-6">
      <PageHeader
        tabs={tabs}
        aside={(
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-line bg-card px-3.5 py-2 text-[13px] text-muted">
              <span className="font-semibold tabular-nums text-ink">{myAdvocacy.estimatedReach.toLocaleString("en-IN")}</span> people reached · <span className="font-semibold tabular-nums text-ink">{myAdvocacy.shares}</span> shares
            </span>
            <Button variant="secondary" size="sm" className="min-h-[44px] lg:min-h-0" leadingIcon={<SlidersHorizontal className="h-4 w-4" />} onClick={() => setPrefsOpen((v) => !v)} aria-expanded={prefsOpen}>
              Preferences
            </Button>
          </div>
        )}
      />

      {prefsOpen && (
        <div className="lg:max-w-[520px] lg:self-end">
          <VoiceCard prefs={prefs} setPrefs={setPrefs} optIn={optIn} onOptOut={() => { setOptIn(false); toast("Opted out. Nothing will be put in front of you."); }} />
        </div>
      )}

      <Studio
        items={items}
        prefs={prefs}
        onPassMoment={(id) => { setPassedMoments((a) => [...a, id]); toast("Skipped — we'll leave that one alone"); }}
        onDeclinePost={decline}
        caughtUp={(
          <section className="rounded-[28px] border border-line bg-card p-8 text-center sm:p-10">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-soft text-[var(--purple)]"><SparkMark size={22} tone="gradient" /></span>
            <h2 className="mt-4 text-[22px] font-bold tracking-tight">You&apos;re all caught up</h2>
            <p className="mx-auto mt-2 max-w-sm text-[16px] leading-relaxed text-muted">Nothing queued, and nothing of your own waiting. We&apos;ll put something here when there is.</p>
            {(passed.length > 0 || passedMoments.length > 0) && (
              <button onClick={() => { setPassed([]); setPassedMoments([]); toast("Showing everything again"); }} className="mt-5 min-h-[44px] rounded-full border border-line px-4 text-[14px] font-semibold transition hover:bg-soft">
                Show the ones I passed on
              </button>
            )}
          </section>
        )}
      />

      <section aria-labelledby="record-h" className="flex flex-col gap-3">
        <h2 id="record-h" className="text-[13px] font-semibold uppercase tracking-[0.14em] text-faint">Your record</h2>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ReachCard />
          <SentCard />
        </div>
      </section>

      <section aria-labelledby="know-h" className="flex flex-col gap-3">
        <h2 id="know-h" className="text-[13px] font-semibold uppercase tracking-[0.14em] text-faint">Good to know</h2>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <ExemplarsCard />
          <FaqCard />
          <FeasibilityCard />
        </div>
      </section>
    </div>
  );
}

function PageHeader({ tabs, aside, subtitle }: { tabs: React.ReactNode; aside?: React.ReactNode; subtitle?: string }) {
  return (
    <>
      <header className="rise flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <Eyebrow>Engage</Eyebrow>
          <h1 className="mt-2 text-[clamp(28px,3.2vw,38px)] font-bold leading-[1.05] tracking-[-0.03em]">Amplify</h1>
          <p className="mt-2.5 max-w-xl text-[15px] leading-relaxed text-muted">{subtitle ?? "Your wins and the company’s news, shared in your own words. Nothing ever posts without you."}</p>
        </div>
        {aside}
      </header>
      {tabs}
    </>
  );
}

/* ── the two jobs, kept apart ─────────────────────────────────────── */
type AmplifyTab = "share" | "programme" | "results";
function Tabs({ tab, setTab }: { tab: AmplifyTab; setTab: (t: AmplifyTab) => void }) {
  return (
    <nav aria-label="Amplify" className="flex items-center gap-1 border-b border-line">
      {([["share", "Share"], ["programme", "Programme"], ["results", "Results"]] as const).map(([k, label]) => (
        <button key={k} onClick={() => setTab(k)} aria-current={tab === k ? "page" : undefined}
          className={`-mb-px min-h-[44px] border-b-2 px-3.5 text-[14px] font-semibold transition lg:min-h-[42px] ${tab === k ? "border-[var(--purple)] text-ink" : "border-transparent text-muted hover:text-ink"}`}>
          {label}
        </button>
      ))}
    </nav>
  );
}

/* ── opted out: make the case, and show the thing rather than describe it ── */
function OptInHero({
  optIn, setOptIn, featured, impact,
}: {
  optIn: boolean; setOptIn: (v: boolean) => void;
  featured: CompanyPost | null; impact: ReturnType<typeof scoreAdvocacy>;
}) {
  const sample = myMoments[0];
  const { session } = useSession();
  const first = session?.name.split(" ")[0];
  const sampleText = sample
    ? draftFromMoment({ ...sample, withPeople: sample.withPeople?.filter((n) => n !== first) }, "warm", "LinkedIn").text
    : draftCaption(featured?.text ?? "", "warm", "LinkedIn", undefined, session?.email).text;
  return (
    <header className="rise relative overflow-hidden rounded-[28px] border border-line bg-card shadow-[0_1px_2px_rgba(20,20,40,0.04),0_24px_56px_-32px_rgba(20,20,40,0.32)]">
      <span aria-hidden className="ai-grad absolute inset-x-0 top-0 h-[2px] opacity-70" />
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(120% 100% at 100% 0%, color-mix(in srgb, var(--client-brand, var(--purple)) 9%, transparent), transparent 62%)" }}
        aria-hidden
      />
      <div className="relative grid gap-8 p-7 sm:p-9 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <div className="min-w-0">
          <Eyebrow>Amplify</Eyebrow>
          <h1 className="mt-2 text-[clamp(24px,3vw,34px)] font-bold leading-[1.05] tracking-[-0.025em]">
            Your work, in your words
          </h1>
          <p className="mt-3 max-w-md text-[16px] leading-relaxed text-muted">
            When something you did is worth the outside seeing — or something good goes out publicly —
            Vadal writes you a caption in your own voice. You read it, change what you want, and post
            it. Or don&apos;t. Nothing is ever posted under your name automatically.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-4">
            <div>
              <div className="text-[26px] font-bold leading-none tracking-tight tabular-nums">{advocacyStats.participants}</div>
              <div className="mt-1 text-[12px] text-faint">colleagues take part</div>
            </div>
            <div>
              <div className="text-[26px] font-bold leading-none tracking-tight tabular-nums">{impact.estimatedReach.toLocaleString()}</div>
              <div className="mt-1 text-[12px] text-faint">people their shares reached</div>
            </div>
            <div className="flex -space-x-2">
              {recentSharers.slice(0, 5).map((s) => (
                <span key={s.name} className="rounded-full ring-2 ring-[var(--card)]" title={s.name}>
                  <Avatar src={s.img} name={s.name} size="sm" />
                </span>
              ))}
            </div>
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-4">
            {/* Switch is an <input type="checkbox">, so onChange hands us a
                ChangeEvent. Storing it raw put a 279-byte React event in
                localStorage where a boolean belongs — truthy, so opting IN
                worked by accident and opting OUT stored another truthy event.
                The switch could never be turned off. */}
            <Switch
              checked={optIn}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setOptIn(e.target.checked);
                toast(e.target.checked ? "You're in — captions are yours to edit" : "Opted out. Nothing will be put in front of you.");
              }}
              label="Take part in advocacy"
            />
            <span className="flex items-center gap-1.5 text-[12px] text-faint">
              <ShieldCheck className="h-3.5 w-3.5" /> Opt out any time. Nothing posts without your tap.
            </span>
          </div>
        </div>

        {/* A look at what they'd get, rather than a description of it — and it
            is THEIR moment, not the company's, because that is the offer. */}
        <div className="relative hidden lg:block">
          <div className="pointer-events-none select-none rounded-2xl border border-line bg-soft p-4 opacity-90">
            <div className="flex items-center gap-2">
              <Mark platform="LinkedIn" size={18} />
              <span className="text-[12px] font-semibold text-muted">Your caption</span>
            </div>
            <p className="mt-2.5 text-[14px] leading-relaxed text-muted">
              “{sampleText}”
            </p>
            <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[var(--purple)] px-3 py-1.5 text-[12px] font-semibold text-white">
              <Copy className="h-3 w-3" /> Copy caption
            </span>
          </div>
          <p className="mt-2.5 text-center text-[12px] text-faint">Written for you, in four tones. Yours to edit.</p>
        </div>
      </div>
    </header>
  );
}
