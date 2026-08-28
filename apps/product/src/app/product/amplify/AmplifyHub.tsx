"use client";
/* AMPLIFY — Pillar 3. "Bring the company's external voice in, and let employee
   moments go out."

   Redesigned around one observation: for an employee this pillar is an ASK, not
   a task they arrived wanting to do. The first version made them read a consent
   card, flip a switch, find a post, open a disclosure and then pick a voice
   before they saw the one genuinely good thing here — a caption written the way
   they write. Five interactions to reach the payoff, on an optional feature.

   So the screen now leads with a single decision:
     · opted out — the hero makes the case, with the switch in it
     · opted in  — the hero IS today's pick: image, caption already drafted,
                   one button. Ten seconds, done.
   Everything else is browsing, below the fold, where browsing belongs.

   Three other things the first pass got wrong:
   · a pillar about social media had no images. Social posts are visual; a
     column of grey text blocks was the single biggest failure.
   · every platform looked identical, so a LinkedIn post and an Instagram post
     read the same. They do not, anywhere else in the world.
   · the impact number was a multiplier (0.1x) that read as failure when it
     actually meant "five people versus the company account". It is additive
     now, which is the same figure told truthfully.

   Nothing here posts. The brief requires a per-platform feasibility spike first,
   so the gate is stated on the card rather than discovered after a click. */
import * as React from "react";
import Image from "next/image";
import { Check, ChevronDown, Copy, Heart, MessageCircle, Repeat2, ShieldCheck, TrendingUp } from "lucide-react";
import { Avatar, Badge, Button, SparkMark, Switch } from "@vadal/design-system";
import { usePersistentState } from "@/lib/usePersistentState";
import { draftCaption, scoreAdvocacy, canAutoMirror, FEASIBILITY, type Voice } from "@/lib/ai/engines/advocacy";
import { bestTimeToPost, type Platform } from "@/lib/ai/engines/timing";
import {
  companyPosts, shares, companyPostReach, advocacyStats, recentSharers, myAdvocacy,
  PLATFORM_MARK, type CompanyPost,
} from "@/lib/amplify";
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

/** Small platform mark — identity without imitating anyone's chrome. */
function Mark({ platform, size = 22 }: { platform: Platform; size?: number }) {
  const m = PLATFORM_MARK[platform];
  return (
    <span
      aria-hidden
      className="grid shrink-0 place-items-center rounded-[7px] font-bold text-white"
      style={{ width: size, height: size, background: m.color, fontSize: size * 0.5, lineHeight: 1 }}
    >
      {m.label}
    </span>
  );
}

function PlatformLine({ p, posted }: { p: Platform; posted: string }) {
  return (
    <span className="flex items-center gap-2 text-[12px] text-faint">
      <Mark platform={p} size={18} />
      <span className="font-semibold text-muted">{p}</span>
      <span aria-hidden>·</span>
      {posted}
    </span>
  );
}

/* ── the caption composer, used by the hero and by any expanded post ── */
function Composer({ post, title }: { post: CompanyPost; title?: string }) {
  const { session } = useSession();
  const [voice, setVoice] = React.useState<Voice>("warm");
  const [edited, setEdited] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);

  const draft = draftCaption(post.text, voice, post.platform, session?.title);
  const value = edited ?? draft.text;
  const timing = bestTimeToPost(post.platform);
  const gate = canAutoMirror(post.platform);

  function copy() {
    navigator.clipboard?.writeText(value);
    setCopied(true);
    toast("Caption copied — paste it wherever you like");
    window.setTimeout(() => setCopied(false), 2200);
  }

  return (
    <div className="rounded-2xl bg-[var(--ai-surface)] p-4 ring-1 ring-[var(--ai-border)]">
      <div className="flex flex-wrap items-center gap-2">
        <span className="ai-grad grid h-6 w-6 place-items-center rounded-full"><SparkMark size={13} tone="solid" /></span>
        <Eyebrow>{title ?? "Your caption"}</Eyebrow>
        <div className="ml-auto flex items-center gap-0.5 rounded-full border border-line bg-card p-0.5">
          {VOICES.map((v) => (
            <button
              key={v.key}
              onClick={() => { setVoice(v.key); setEdited(null); }}
              aria-pressed={voice === v.key}
              /* 44px on touch, compact on desktop. This is the primary control
                 on the screen for someone on a phone; 26px was not tappable. */
              className={`min-h-[44px] rounded-full px-3.5 text-[14px] font-semibold transition lg:min-h-[30px] lg:px-2.5 lg:text-[12px] ${
                voice === v.key ? "bg-soft text-ink" : "text-muted hover:text-ink"
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      <textarea
        value={value}
        onChange={(e) => setEdited(e.target.value)}
        rows={3}
        aria-label="Your caption"
        className="mt-3 w-full resize-y rounded-xl border border-line bg-card p-3 text-[16px] leading-relaxed outline-none transition focus:border-[var(--ai-accent)]"
      />

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
        <Button size="sm" variant={copied ? "tertiary" : "brand"} onClick={copy}
          className="min-h-[44px] lg:min-h-0"
          leadingIcon={copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}>
          {copied ? "Copied" : "Copy caption"}
        </Button>
        <span className="text-[12px] text-faint">{timing.reason}</span>
      </div>

      {/* Stated before anyone tries, not after they click. */}
      <p className="mt-3 text-[12px] leading-snug text-faint">
        <b className="font-semibold text-muted">We can&apos;t post this for you yet.</b> {gate.reason}
      </p>
    </div>
  );
}

export function AmplifyHub() {
  const [role] = useViewAs();
  const isAdmin = canAccess(role, "Campaigns");
  const [optIn, setOptIn] = usePersistentState<boolean>("vadal:advocacy-optin", false);
  const [open, setOpen] = React.useState<string | null>(null);
  const [showPlatforms, setShowPlatforms] = React.useState(false);

  const impact = scoreAdvocacy(shares, companyPostReach);
  const featured = companyPosts.find((p) => p.featured) ?? companyPosts[0];
  const rest = companyPosts.filter((p) => p.id !== featured.id);

  return (
    <div className="flex flex-col gap-6">

      {/* ══ HERO ══ opted out it argues the case; opted in it IS the action ══ */}
      {!optIn ? (
        <header className="rise relative overflow-hidden rounded-[28px] border border-line bg-card shadow-[0_1px_2px_rgba(20,20,40,0.04),0_18px_42px_-26px_rgba(20,20,40,0.22)]">
          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full opacity-[0.08] blur-3xl" style={{ background: "radial-gradient(circle, var(--client-brand, var(--purple)), transparent 70%)" }} aria-hidden />
          <div className="relative grid gap-8 p-7 sm:p-9 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div className="min-w-0">
              <Eyebrow>Amplify</Eyebrow>
              <h1 className="mt-2 text-[clamp(24px,3vw,34px)] font-bold leading-[1.05] tracking-[-0.025em]">
                Your company, in your words
              </h1>
              <p className="mt-3 max-w-md text-[16px] leading-relaxed text-muted">
                When something good goes out publicly, Vadal writes you a caption in your own voice.
                You read it, change what you want, and post it — or don&apos;t. Nothing is ever posted
                under your name automatically.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-4">
                <div>
                  <div className="text-[26px] font-bold leading-none tracking-tight">{advocacyStats.participants}</div>
                  <div className="mt-1 text-[12px] text-faint">colleagues take part</div>
                </div>
                <div>
                  <div className="text-[26px] font-bold leading-none tracking-tight">{impact.estimatedReach.toLocaleString()}</div>
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
                <Switch checked={optIn} onChange={(v: boolean) => { setOptIn(v); toast("You're in — captions are yours to edit"); }} label="Take part in advocacy" />
                <span className="flex items-center gap-1.5 text-[12px] text-faint">
                  <ShieldCheck className="h-3.5 w-3.5" /> Opt out any time. Nothing posts without your tap.
                </span>
              </div>
            </div>

            {/* a look at what they'd get, rather than a description of it */}
            <div className="relative hidden lg:block">
              <div className="pointer-events-none select-none rounded-2xl border border-line bg-soft p-4 opacity-90">
                <div className="flex items-center gap-2"><Mark platform={featured.platform} size={18} /><span className="text-[12px] font-semibold text-muted">Your caption</span></div>
                <p className="mt-2.5 text-[14px] leading-relaxed text-muted">
                  “{draftCaption(featured.text, "warm", featured.platform).text}”
                </p>
                <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[var(--purple)] px-3 py-1.5 text-[12px] font-semibold text-white">
                  <Copy className="h-3 w-3" /> Copy caption
                </span>
              </div>
              <p className="mt-2.5 text-center text-[12px] text-faint">Written for you, in four tones. Yours to edit.</p>
            </div>
          </div>
        </header>
      ) : (
        /* ── opted in: the hero is today's pick, and it is the whole ritual ── */
        <header className="rise overflow-hidden rounded-[28px] border border-line bg-card shadow-[0_1px_2px_rgba(20,20,40,0.04),0_18px_42px_-26px_rgba(20,20,40,0.22)]">
          <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
            {featured.image && (
              <div className="relative min-h-[220px] lg:min-h-full">
                <Image src={featured.image} alt="" fill sizes="(max-width: 1024px) 100vw, 40vw" className="object-cover" priority />
              </div>
            )}
            <div className="p-7 sm:p-8">
              <div className="flex flex-wrap items-center gap-2">
                <Eyebrow>Worth sharing today</Eyebrow>
                {featured.sharedBy ? (
                  <span className="text-[12px] text-faint">· {featured.sharedBy} colleagues already have</span>
                ) : null}
              </div>
              <p className="mt-3 text-[18px] font-semibold leading-relaxed tracking-[-0.01em]">{featured.text}</p>
              <div className="mt-3"><PlatformLine p={featured.platform} posted={featured.posted} /></div>
              <div className="mt-5"><Composer post={featured} /></div>
            </div>
          </div>
        </header>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12 xl:items-start">
        {/* ══ the rest of what the company said ══ */}
        <div className="flex flex-col gap-6 xl:col-span-8">
          <div>
            <div className="flex items-baseline justify-between gap-3 pb-3">
              <div>
                <Eyebrow>From the company</Eyebrow>
                <p className="mt-1 text-[14px] text-muted">Clearly marked as external — this is what the outside world sees.</p>
              </div>
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
                        {p.sharedBy ? <span>· {p.sharedBy} colleagues shared this</span> : null}
                        {optIn && (
                          <Button size="sm" variant={isOpen ? "tertiary" : "secondary"}
                            className="ml-auto min-h-[44px] lg:min-h-0"
                            onClick={() => setOpen(isOpen ? null : p.id)}>
                            {isOpen ? "Close" : "Write my caption"}
                          </Button>
                        )}
                      </div>

                      {isOpen && optIn && <div className="mt-4"><Composer post={p} /></div>}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>

        {/* ══ right rail ══ */}
        <div className="flex flex-col gap-6 xl:col-span-4">
          {/* the motivation loop — personal, not a vanity metric */}
          {optIn && (
            <Card>
              <Eyebrow>Your reach</Eyebrow>
              <div className="mt-3 flex items-end gap-2">
                <span className="text-[30px] font-bold leading-none tracking-tight">{myAdvocacy.estimatedReach.toLocaleString()}</span>
                <span className="pb-1 text-[14px] text-faint">people, from {myAdvocacy.shares} shares</span>
              </div>
              <p className="mt-3 text-[14px] leading-relaxed text-muted">
                You&apos;re {myAdvocacy.rank}th of {myAdvocacy.of}{" "}
                colleagues taking part. Advocacy counts as a
                contribution — it shows up in Recognition, not just marketing&apos;s dashboard.
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

          {isAdmin && (
            <Card>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-[var(--purple)]" />
                <Eyebrow>Advocacy impact</Eyebrow>
              </div>
              {/* Additive, not a multiplier. "0.1x" read as failure when it only
                  ever meant "five people versus the company account". */}
              <div className="mt-3">
                <div className="flex items-end gap-2">
                  <span className="text-[30px] font-bold leading-none tracking-tight">+{impact.estimatedReach.toLocaleString()}</span>
                  <span className="pb-1 text-[14px] text-faint">people beyond the company account</span>
                </div>
                <p className="mt-1 text-[12px] text-faint">
                  The post itself reached {companyPostReach.toLocaleString()}.
                </p>
              </div>
              <div className="mt-4">
                <Eyebrow>Worth recognising</Eyebrow>
                <ul className="mt-2 flex flex-col gap-1.5">
                  {impact.topContributors.map((c) => (
                    <li key={c.employee} className="flex items-center gap-2 text-[14px]">
                      <span className="truncate">{c.employee}</span>
                      <span className="ml-auto shrink-0 text-[12px] font-semibold tabular-nums text-faint">{c.reach.toLocaleString()}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <p className="mt-3 text-[12px] leading-snug text-faint">{impact.caveat}</p>
            </Card>
          )}

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
