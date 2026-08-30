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
import Image from "next/image";
import { ChevronDown, Copy, Flame, Heart, MessageCircle, Repeat2, ShieldCheck, ThumbsDown } from "lucide-react";
import { Avatar, Badge, Button, SparkMark, Switch } from "@vadal/design-system";
import { usePersistentState } from "@/lib/usePersistentState";
import {
  advocacyStreak, draftCaption, rankMoments, scoreAdvocacy, FEASIBILITY,
} from "@/lib/ai/engines/advocacy";
import {
  advocacyStats, companyPosts, companyPostReach, myActiveWeeks, myAdvocacy, myMoments,
  myReachSeries, reachWeekLabels, recentSharers, shares, type CompanyPost,
} from "@/lib/amplify";
import { DECLINE_REASONS, type DeclineReason } from "@/lib/share";
import { DayArea } from "@/components/charts";
import { canAccess } from "@/lib/access";
import { useViewAs } from "../useViewAs";
import { toast } from "../Toaster";
import { Card, Eyebrow, Mark, PlatformLine } from "./parts";
import { Composer } from "./Composer";
import { MomentHero, MomentStrip } from "./Moments";
import { Programme } from "./Programme";

export function AmplifyHub() {
  const [role] = useViewAs();
  const isAdmin = canAccess(role, "Campaigns");
  const [tab, setTab] = React.useState<"share" | "programme">("share");

  /* `=== true` is deliberate. A consent flag whose stored value is anything
     other than a literal true must read as OFF — never on. Demo sessions from
     before the fix above hold a truthy event object here, and the safe reading
     of an unreadable consent value is "they did not consent". */
  const [optInRaw, setOptIn] = usePersistentState<boolean>("vadal:advocacy-optin", false);
  const optIn = optInRaw === true;
  const [open, setOpen] = React.useState<string | null>(null);
  const [openMoment, setOpenMoment] = React.useState<string | null>(null);
  const [showPlatforms, setShowPlatforms] = React.useState(false);
  /* Declines persist. Being shown the same post you already passed on is the
     fastest way to make an optional feature feel like nagging. */
  const [passed, setPassed] = usePersistentState<string[]>("vadal:advocacy-passed", []);
  const [passedMoments, setPassedMoments] = usePersistentState<string[]>("vadal:advocacy-passed-moments", []);
  const [declining, setDeclining] = React.useState(false);

  const impact = scoreAdvocacy(shares, companyPostReach);
  const live = companyPosts.filter((p) => !passed.includes(p.id));
  const featured = live.find((p) => p.featured) ?? live[0] ?? null;
  const moments = rankMoments(myMoments, passedMoments);
  const heroMoment = optIn ? moments[0] ?? null : null;
  const streak = advocacyStreak(myActiveWeeks);

  /* When a moment takes the hero, the company's pick does not vanish — it drops
     into the browse list, still marked. Yours first, theirs still there. */
  const rest = heroMoment ? live : live.filter((p) => p.id !== featured?.id);

  function decline(reason: DeclineReason) {
    if (!featured) return;
    setPassed((all) => [...all, featured.id]);
    setDeclining(false);
    toast(reason === "never" ? "Noted — we'll stop putting these in front of you" : "Passed. We'll show you something else.");
  }

  if (isAdmin && tab === "programme") {
    return (
      <div className="flex flex-col gap-6">
        <Tabs tab={tab} setTab={setTab} />
        <Programme />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {isAdmin && <Tabs tab={tab} setTab={setTab} />}

      {/* ══ HERO ══ four states, and yours outranks theirs ══ */}
      {!optIn ? (
        <OptInHero optIn={optIn} setOptIn={setOptIn} featured={featured} impact={impact} />
      ) : heroMoment ? (
        <MomentHero
          moment={heroMoment}
          onPass={() => { setPassedMoments((a) => [...a, heroMoment.id]); toast("Skipped — we'll leave that one alone"); }}
        />
      ) : featured ? (
        <CompanyHero
          post={featured}
          declining={declining}
          setDeclining={setDeclining}
          onDecline={decline}
        />
      ) : (
        /* Nothing left to ask for. An empty queue should read as finished, not
           broken — and it is the one moment we can say thank you plainly. */
        <header className="rise rounded-[28px] border border-line bg-card p-8 text-center sm:p-10">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-soft text-[var(--purple)]">
            <SparkMark size={22} tone="gradient" />
          </span>
          <h1 className="mt-4 text-[22px] font-bold tracking-tight">You&apos;re all caught up</h1>
          <p className="mx-auto mt-2 max-w-sm text-[16px] leading-relaxed text-muted">
            Nothing queued, and nothing of your own waiting. We&apos;ll put something here when there
            is — and never more than one thing at a time.
          </p>
          {(passed.length > 0 || passedMoments.length > 0) && (
            <button
              onClick={() => { setPassed([]); setPassedMoments([]); toast("Showing everything again"); }}
              className="mt-5 min-h-[44px] rounded-full border border-line px-4 text-[14px] font-semibold transition hover:bg-soft"
            >
              Show the ones I passed on
            </button>
          )}
        </header>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12 xl:items-start">
        <div className="flex flex-col gap-6 xl:col-span-8">
          {/* ══ the rest of your own moments ══ */}
          {optIn && <MomentStrip moments={moments.slice(1)} openId={openMoment} onOpen={setOpenMoment} />}

          {/* ══ the rest of what the company said ══ */}
          {rest.length > 0 && (
            <div>
              <div className="pb-3">
                <Eyebrow>From the company</Eyebrow>
                <p className="mt-1 text-[14px] text-muted">
                  Clearly marked as external — this is what the outside world sees.
                </p>
              </div>

              <div className="flex flex-col gap-4">
                {rest.map((p) => {
                  const isOpen = open === p.id;
                  return (
                    <article key={p.id} className="card-lift overflow-hidden rounded-[26px] border border-line bg-card">
                      {p.image && (
                        <div className="relative aspect-[16/7] w-full">
                          <Image src={p.image} alt="" fill sizes="(max-width: 1280px) 100vw, 60vw" className="object-cover" />
                        </div>
                      )}
                      <div className="p-6">
                        <div className="flex flex-wrap items-center gap-2">
                          <PlatformLine p={p.platform} posted={p.posted} />
                          {p.inAdvocacyQueue && <Badge tone="brand" variant="soft" size="sm">Picked by HR</Badge>}
                        </div>
                        <p className="mt-3 text-[16px] leading-relaxed">{p.text}</p>

                        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px] text-faint">
                          <span className="flex items-center gap-1"><Heart className="h-3 w-3" />{p.likes.toLocaleString()}</span>
                          <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" />{p.comments}</span>
                          <span className="flex items-center gap-1"><Repeat2 className="h-3 w-3" />{p.shares}</span>
                          {p.sharedBy ? <span>· {p.sharedBy} shared</span> : null}
                          {p.passedBy ? <span>· {p.passedBy} passed</span> : null}
                          {optIn && (
                            <Button size="sm" variant={isOpen ? "tertiary" : "secondary"}
                              className="ml-auto min-h-[44px] lg:min-h-0"
                              onClick={() => setOpen(isOpen ? null : p.id)}>
                              {isOpen ? "Close" : "Write my caption"}
                            </Button>
                          )}
                        </div>

                        {isOpen && optIn && (
                          <div className="mt-4"><Composer subject={{ kind: "post", post: p }} /></div>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ══ right rail ══ the person's own record, and nothing of anyone else's ══ */}
        <div className="flex flex-col gap-6 xl:col-span-4">
          {optIn && (
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

              {/* The shape of it, not just the total — a flat total hides that
                  this has been building. */}
              <DayArea
                id="amp-reach"
                className="mt-3"
                values={myReachSeries}
                labels={reachWeekLabels}
                unit="people reached"
                height={84}
              />

              {/* Quiet on purpose. A streak on an OPTIONAL, public-facing action
                  is a pressure device if it shouts — nobody should feel they owe
                  their own social account to their employer. It counts up and
                  never warns you that you are about to lose it. */}
              {streak.current > 1 && (
                <p className="mt-3 flex items-center gap-1.5 text-[13px] text-muted">
                  <Flame className="h-3.5 w-3.5 text-[var(--client-brand,var(--purple))]" />
                  {streak.current} weeks running{streak.best > streak.current ? ` · best ${streak.best}` : ""}
                </p>
              )}

              <p className="mt-3 text-[14px] leading-relaxed text-muted">
                You&apos;re {myAdvocacy.rank}th of {myAdvocacy.of}{" "}
                colleagues taking part. Advocacy counts as a contribution — it shows up in
                Recognition, not just marketing&apos;s dashboard.
              </p>
              <p className="mt-2 text-[12px] leading-snug text-faint">
                Reach is modelled from follower counts, not measured.
              </p>
            </Card>
          )}

          <Card>
            <Eyebrow>Sharing this week</Eyebrow>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex -space-x-2">
                {recentSharers.map((s) => (
                  <span key={s.name} className="rounded-full ring-2 ring-[var(--card)]" title={s.name}>
                    <Avatar src={s.img} name={s.name} size="sm" />
                  </span>
                ))}
              </div>
              <p className="text-[14px] leading-snug text-muted">
                <b className="font-semibold text-ink">{advocacyStats.participants}</b> colleagues,{" "}
                {advocacyStats.resharesThisMonth} shares this month.
              </p>
            </div>
          </Card>

          {/* Collapsed to one line. Four warning badges made a working feature
              look broken; the detail is still one tap away for whoever needs it. */}
          <Card>
            <button
              onClick={() => setShowPlatforms((v) => !v)}
              aria-expanded={showPlatforms}
              className="flex w-full items-center gap-2 text-left"
            >
              <div className="min-w-0 flex-1">
                <Eyebrow>Posting for you</Eyebrow>
                <p className="mt-1 text-[14px] leading-snug text-muted">
                  Not enabled on any platform yet — the brief asks for a feasibility spike first.
                </p>
              </div>
              <ChevronDown className={`h-4 w-4 shrink-0 text-faint transition-transform ${showPlatforms ? "rotate-180" : ""}`} />
            </button>
            {showPlatforms && (
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
        </div>
      </div>
    </div>
  );
}

/* ── the two jobs, kept apart ─────────────────────────────────────── */
function Tabs({ tab, setTab }: { tab: "share" | "programme"; setTab: (t: "share" | "programme") => void }) {
  return (
    <div className="flex w-fit rounded-full bg-soft p-1 text-[14px] font-semibold">
      {([["share", "Share"], ["programme", "Programme"]] as const).map(([k, label]) => (
        <button
          key={k}
          onClick={() => setTab(k)}
          aria-pressed={tab === k}
          className={`min-h-[44px] rounded-full px-5 transition lg:min-h-[36px] ${
            tab === k ? "bg-card text-ink shadow-sm" : "text-muted hover:text-ink"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
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
              “{sample ? `Aarav, Dev and I just ${sample.what.charAt(0).toLowerCase()}${sample.what.slice(1)}. Good week.` : draftCaption(featured?.text ?? "", "warm", "LinkedIn").text}”
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

/* ── opted in, nothing of your own: today's company pick ── */
function CompanyHero({
  post, declining, setDeclining, onDecline,
}: {
  post: CompanyPost; declining: boolean;
  setDeclining: (f: (v: boolean) => boolean) => void;
  onDecline: (r: DeclineReason) => void;
}) {
  return (
    <header className="rise overflow-hidden rounded-[28px] border border-line bg-card shadow-[0_1px_2px_rgba(20,20,40,0.04),0_24px_56px_-32px_rgba(20,20,40,0.32)]">
      <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
        {post.image && (
          <div className="relative min-h-[220px] lg:min-h-full">
            <Image src={post.image} alt="" fill sizes="(max-width: 1024px) 100vw, 40vw" className="object-cover" priority />
          </div>
        )}
        <div className="min-w-0 p-7 sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <Eyebrow>Worth sharing today</Eyebrow>
            {post.sharedBy ? <span className="text-[12px] text-faint">· {post.sharedBy} colleagues already have</span> : null}
            {/* Saying no has to be as easy as saying yes, or the ask stops being
                an invitation. It is also the signal HR would never otherwise
                get: which posts our own people won't put their name on. */}
            <button
              onClick={() => setDeclining((v) => !v)}
              aria-expanded={declining}
              className="ml-auto flex min-h-[44px] items-center gap-1.5 rounded-full px-2.5 text-[12px] font-semibold text-faint transition hover:bg-soft hover:text-ink lg:min-h-[36px]"
            >
              <ThumbsDown className="h-3.5 w-3.5" /> Not for me
            </button>
          </div>

          {declining && (
            <div className="mt-3 rounded-2xl bg-soft p-4">
              <p className="text-[14px] font-semibold">No problem. Anything we should know?</p>
              <p className="mt-1 text-[12px] text-faint">Optional, and never attributed to you.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {DECLINE_REASONS.map((r) => (
                  <button
                    key={r.key}
                    onClick={() => onDecline(r.key)}
                    className="min-h-[40px] rounded-full border border-line bg-card px-3.5 text-[14px] font-medium transition hover:border-faint/50 hover:bg-[var(--card-hover)]"
                  >
                    {r.label}
                  </button>
                ))}
              </div>
              <button
                onClick={() => onDecline("not-now")}
                className="mt-3 text-[12px] font-semibold text-faint underline-offset-2 hover:underline"
              >
                Just skip it
              </button>
            </div>
          )}

          <p className="mt-3 text-[18px] font-semibold leading-relaxed tracking-[-0.01em]">{post.text}</p>
          <div className="mt-3"><PlatformLine p={post.platform} posted={post.posted} /></div>
          <div className="mt-5"><Composer subject={{ kind: "post", post }} /></div>
        </div>
      </div>
    </header>
  );
}
