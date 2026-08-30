"use client";
/* ════════════════════ the caption composer ════════════════════
   Everything between "I might share this" and it being out of Vadal's hands.

   It takes either a company post or the person's own moment, because the whole
   point of the second half of this pillar is that both are first-class. What
   differs is only how the first draft is written — draftCaption() reshares
   somebody else's news, draftFromMoment() states your own.

   Four things happen here that did not before, each of which was a real reason
   the pillar would have failed:

   · POLICY. An employee posting a revenue figure or a customer name out of an
     internal win is an actual incident, and "the policy says not to" is not a
     control. It is advisory where it can be and blocking where it must be.
   · IMAGERY. One photo does not fit four platforms. A LinkedIn crop posted to
     Instagram reads as low-effort corporate — the exact impression this pillar
     cannot afford.
   · TIMING. bestTimeToPost() existed and its answer was printed as a sentence
     nobody could act on. Now it schedules.
   · ATTRIBUTION. A hiring post shared without a referral code is an
     unattributable impression, and the programme dies in the first budget
     review that asks what it returned.

   Nothing here posts. Every route ends with the person pressing publish in the
   platform's own composer. */
import * as React from "react";
import Image from "next/image";
import {
  AlertTriangle, ArrowUpRight, Check, ChevronDown, Clock, Copy, Hash, ImageIcon, Link2, Share2, ShieldCheck,
} from "lucide-react";
import { Button, SparkMark } from "@vadal/design-system";
import {
  checkPolicy, draftCaption, draftFromMoment, hashtagsFor, isHiringPost, referralLinkFor,
  PLATFORM_ASPECT, type Moment, type Voice,
} from "@/lib/ai/engines/advocacy";
import { bestTimeToPost, type Platform } from "@/lib/ai/engines/timing";
import { myReferralCode, socialPolicy, type CompanyPost } from "@/lib/amplify";
import { canWebShare, routeFor, openShare } from "@/lib/share";
import { useSession } from "../useSession";
import { toast } from "../Toaster";
import { Eyebrow, PlatformPicker, VOICES } from "./parts";

/** What the composer is writing about. */
export type Subject =
  | { kind: "post"; post: CompanyPost }
  | { kind: "moment"; moment: Moment };

/** The share capability never changes after load, so there is nothing to subscribe to. */
const NOOP_SUBSCRIBE = () => () => {};

const CHAR_LIMIT: Record<Platform, number> = { LinkedIn: 3000, X: 280, Instagram: 2200, Facebook: 63206 };

function hhmm(hour: number) {
  const h = hour % 12 === 0 ? 12 : hour % 12;
  return `${h}:15${hour < 12 ? "am" : "pm"}`;
}

/* ── getting the caption out of Vadal and into a post ──────────────
   The route differs per platform because the platforms differ, and a single
   "Copy caption" button for all four pretended otherwise. */
function ShareActions({
  platform, url, caption, onPosted, disabled, disabledReason,
}: {
  platform: Platform; url?: string; caption: string;
  onPosted: () => void; disabled?: boolean; disabledReason?: string;
}) {
  // A browser capability read without a hydration mismatch: the server snapshot
  // is false, the client snapshot is the real answer, and React reconciles the two.
  const webShare = React.useSyncExternalStore(NOOP_SUBSCRIBE, canWebShare, () => false);

  const [copied, setCopied] = React.useState(false);
  const [asked, setAsked] = React.useState(false);
  const [posted, setPosted] = React.useState<boolean | null>(null);

  const route = routeFor(platform, caption, url, webShare);

  function copyCaption() {
    navigator.clipboard?.writeText(caption);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2200);
  }

  async function go() {
    if (route.kind === "web-share") {
      try { await navigator.share({ text: caption, url }); }
      catch { return; } // they backed out of the sheet — not a failure, say nothing
    } else if (route.kind === "intent") {
      openShare(route.url);
    } else if (route.kind === "copy-then-open") {
      copyCaption();
      openShare(route.url);
    } else {
      copyCaption();
      toast("Caption copied");
    }
    setAsked(true);
  }

  const primaryLabel =
    route.kind === "web-share" ? "Share" :
    route.kind === "intent" || route.kind === "copy-then-open" ? route.label :
    "Copy caption";

  const PrimaryIcon =
    route.kind === "web-share" ? Share2 :
    route.kind === "copy-only" ? Copy : ArrowUpRight;

  /* Closing the loop. Every number on this screen is modelled; one honest
     self-report is worth more than a better estimate, and it is what lets
     advocacy count as a contribution rather than a marketing statistic. */
  if (asked && posted === null) {
    return (
      <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl bg-soft px-3.5 py-3">
        <span className="text-[14px] font-semibold">Did you post it?</span>
        <div className="ml-auto flex items-center gap-2">
          <Button size="sm" variant="brand" className="min-h-[44px] lg:min-h-0"
            onClick={() => { setPosted(true); onPosted(); toast("Counted — it'll show in your reach and in Recognition"); }}>
            Yes
          </Button>
          <Button size="sm" variant="tertiary" className="min-h-[44px] lg:min-h-0"
            onClick={() => { setPosted(false); setAsked(false); }}>
            Not yet
          </Button>
        </div>
      </div>
    );
  }

  if (posted) {
    return (
      <div className="mt-3 flex items-center gap-2 rounded-xl bg-soft px-3.5 py-3">
        <Check className="h-4 w-4 shrink-0 text-[var(--success)]" />
        <span className="text-[14px]">Counted. Thank you — that one reaches people we never could.</span>
      </div>
    );
  }

  return (
    <div className="mt-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" variant="brand" onClick={go} disabled={disabled} className="min-h-[44px] lg:min-h-0"
          leadingIcon={<PrimaryIcon className="h-3.5 w-3.5" />}>
          {primaryLabel}
        </Button>
        {route.kind !== "copy-only" && (
          <Button size="sm" variant="tertiary" onClick={copyCaption} disabled={disabled} className="min-h-[44px] lg:min-h-0"
            leadingIcon={copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}>
            {copied ? "Copied" : "Copy"}
          </Button>
        )}
      </div>

      {/* Say what will happen before they press it, not after. */}
      {disabled && disabledReason ? (
        <p className="mt-2.5 text-[12px] leading-snug" style={{ color: "var(--danger)" }}>{disabledReason}</p>
      ) : "because" in route ? (
        <p className="mt-2.5 text-[12px] leading-snug text-faint">{route.because}</p>
      ) : route.kind === "web-share" ? (
        <p className="mt-2.5 text-[12px] leading-snug text-faint">
          Opens your phone&apos;s share sheet with the caption already in it. You still press post.
        </p>
      ) : null}
    </div>
  );
}

/* ── a quiet row of optional depth ─────────────────────────────────
   Tags, image and timing are all real work, and all of it is optional. Given
   equal weight to the caption they would bury it, so they collapse to one line
   each and open only if wanted. */
function Detail({
  icon, label, value, open, onToggle, children,
}: {
  icon: React.ReactNode; label: string; value: string;
  open: boolean; onToggle: () => void; children: React.ReactNode;
}) {
  return (
    <div className="border-t border-line/70 first:border-t-0">
      <button
        onClick={onToggle}
        aria-expanded={open}
        className="flex min-h-[44px] w-full items-center gap-2.5 text-left lg:min-h-[38px]"
      >
        <span className="shrink-0 text-faint">{icon}</span>
        <span className="text-[13px] font-semibold text-muted">{label}</span>
        {/* min-w-0 is load-bearing: `truncate` is white-space:nowrap, so this
            span's min-content is the full string and the flex row cannot shrink
            below it. Without this, a two-tag suggestion set the width of the
            whole hero card and pushed it off a phone screen. */}
        <span className="ml-auto min-w-0 truncate pl-3 text-[13px] text-faint">{value}</span>
        <ChevronDown className={`h-3.5 w-3.5 shrink-0 text-faint transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="pb-3.5">{children}</div>}
    </div>
  );
}

export function Composer({ subject, title }: { subject: Subject; title?: string }) {
  const { session } = useSession();
  const [voice, setVoice] = React.useState<Voice>("warm");
  const [edited, setEdited] = React.useState<string | null>(null);
  const [openDetail, setOpenDetail] = React.useState<null | "tags" | "image" | "timing">(null);
  const [scheduled, setScheduled] = React.useState(false);

  // A moment has no platform of its own — where it goes is the person's call.
  const [momentPlatform, setMomentPlatform] = React.useState<Platform>("LinkedIn");
  const platform = subject.kind === "post" ? subject.post.platform : momentPlatform;
  const url = subject.kind === "post" ? subject.post.url : undefined;
  const image = subject.kind === "post" ? subject.post.image : subject.moment.image;
  const sourceText = subject.kind === "post" ? subject.post.text : subject.moment.what;

  const draft = subject.kind === "post"
    ? draftCaption(subject.post.text, voice, platform, session?.title)
    : draftFromMoment(subject.moment, voice, platform, session?.title);

  const value = edited ?? draft.text;
  const timing = bestTimeToPost(platform);
  const tags = hashtagsFor(sourceText, platform);
  const policy = checkPolicy(value);
  const blocked = policy.issues.filter((i) => i.severity === "block");
  const warnings = policy.issues.filter((i) => i.severity === "warn");
  const aspect = PLATFORM_ASPECT[platform];
  const limit = CHAR_LIMIT[platform];
  const over = value.length > limit;
  const referral = isHiringPost(sourceText) ? referralLinkFor(url, myReferralCode) : null;

  function appendTag(tag: string) {
    const next = `${value.trimEnd()} #${tag}`;
    setEdited(next);
  }

  return (
    <div className="rounded-2xl bg-[var(--ai-surface)] p-4 ring-1 ring-[var(--ai-border)]">
      <div className="flex flex-wrap items-center gap-2">
        <span className="ai-grad grid h-6 w-6 place-items-center rounded-full"><SparkMark size={13} tone="solid" /></span>
        <Eyebrow>{title ?? "Your caption"}</Eyebrow>
        {/* Full width on a phone. Four fixed-width pills that can neither wrap
            nor shrink were wider than a 375px column, and one overflowing
            descendant stretches the whole hero card past the viewport. */}
        <div className="flex w-full items-center justify-between gap-0.5 rounded-full border border-line bg-card p-0.5 lg:ml-auto lg:w-auto lg:justify-start">
          {VOICES.map((v) => (
            <button
              key={v.key}
              onClick={() => { setVoice(v.key); setEdited(null); }}
              aria-pressed={voice === v.key}
              /* 44px on touch, compact on desktop. This is the primary control
                 on the screen for someone on a phone; 26px was not tappable. */
              className={`min-h-[44px] flex-1 rounded-full px-2 text-[14px] font-semibold transition lg:min-h-[30px] lg:flex-none lg:px-2.5 lg:text-[12px] ${
                voice === v.key ? "bg-soft text-ink" : "text-muted hover:text-ink"
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {subject.kind === "moment" && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-[13px] text-muted">Post to</span>
          <PlatformPicker value={momentPlatform} onChange={(p) => { setMomentPlatform(p); setEdited(null); }} />
        </div>
      )}

      <textarea
        value={value}
        onChange={(e) => setEdited(e.target.value)}
        rows={3}
        aria-label="Your caption"
        className="mt-3 w-full resize-y rounded-xl border border-line bg-card p-3 text-[16px] leading-relaxed outline-none transition focus:border-[var(--ai-accent)]"
      />

      {/* The character budget was computed and never shown. On X it is the
          difference between a post and a truncated one. */}
      <div className="mt-1.5 flex items-center gap-2 text-[12px]">
        <span className={over ? "font-semibold" : "text-faint"} style={over ? { color: "var(--danger)" } : undefined}>
          {value.length.toLocaleString()} / {limit.toLocaleString()}
        </span>
        {over && <span style={{ color: "var(--danger)" }}>— {platform} will cut it off</span>}
      </div>

      {/* ── policy ── only present when there is something to say ── */}
      {policy.issues.length > 0 && (
        <div
          className="mt-3 rounded-xl p-3.5"
          style={{
            background: `color-mix(in srgb, var(--${blocked.length ? "danger" : "warning"}) 9%, transparent)`,
            boxShadow: `inset 0 0 0 1px color-mix(in srgb, var(--${blocked.length ? "danger" : "warning"}) 26%, transparent)`,
          }}
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" style={{ color: `var(--${blocked.length ? "danger" : "warning"})` }} />
            <span className="text-[14px] font-semibold">
              {blocked.length ? "This needs clearing before it goes out" : "Worth a second look"}
            </span>
          </div>
          <ul className="mt-2.5 flex flex-col gap-2">
            {policy.issues.map((i) => (
              <li key={i.what} className="text-[13px] leading-snug">
                <span className="font-semibold">{i.what}</span>
                <span className="text-muted"> — “{i.match}”. {i.why}</span>
              </li>
            ))}
          </ul>
          <p className="mt-2.5 flex items-center gap-1.5 text-[12px] text-faint">
            <ShieldCheck className="h-3 w-3 shrink-0" /> Social policy, updated {socialPolicy.updated}.
            {warnings.length > 0 && !blocked.length && " These are advisory — it is your post and your call."}
          </p>
        </div>
      )}

      {/* ── the optional depth ── */}
      <div className="mt-3 rounded-xl bg-card px-3.5 ring-1 ring-line">
        {tags.length > 0 && (
          <Detail
            icon={<Hash className="h-4 w-4" />} label="Tags"
            value={tags.map((t) => `#${t}`).join(" ")}
            open={openDetail === "tags"} onToggle={() => setOpenDetail(openDetail === "tags" ? null : "tags")}
          >
            <div className="flex flex-wrap gap-2">
              {tags.map((t) => (
                <button key={t} onClick={() => appendTag(t)}
                  className="min-h-[44px] rounded-full border border-line px-3 text-[13px] font-medium transition hover:bg-soft lg:min-h-[36px]">
                  #{t}
                </button>
              ))}
            </div>
            <p className="mt-2 text-[12px] leading-snug text-faint">
              Two or three, drawn from what this is about. A caption ending in nine tags is the
              clearest sign a person did not write it.
            </p>
          </Detail>
        )}

        {image && (
          <Detail
            icon={<ImageIcon className="h-4 w-4" />} label="Image"
            value={`${aspect.ratio.replace(/ /g, "")} · ${aspect.px}`}
            open={openDetail === "image"} onToggle={() => setOpenDetail(openDetail === "image" ? null : "image")}
          >
            <div className="flex gap-3">
              <div className="relative w-28 shrink-0 overflow-hidden rounded-lg bg-soft" style={{ aspectRatio: aspect.ratio }}>
                <Image src={image} alt="" fill sizes="112px" className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] leading-snug text-muted">{aspect.note}</p>
                <Button size="sm" variant="tertiary" className="mt-2 min-h-[44px] lg:min-h-0"
                  onClick={() => toast(`${platform} crop saved to your downloads`)}>
                  Get the {platform} crop
                </Button>
              </div>
            </div>
          </Detail>
        )}

        <Detail
          icon={<Clock className="h-4 w-4" />} label="Timing"
          value={scheduled ? `Reminder set · ${hhmm(timing.hour)}` : `Best ${hhmm(timing.hour)}`}
          open={openDetail === "timing"} onToggle={() => setOpenDetail(openDetail === "timing" ? null : "timing")}
        >
          <p className="text-[13px] leading-snug text-muted">{timing.reason}</p>
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            <Button
              size="sm" variant={scheduled ? "tertiary" : "secondary"} className="min-h-[44px] lg:min-h-0"
              onClick={() => {
                setScheduled(!scheduled);
                toast(scheduled ? "Reminder cleared" : `We'll nudge you at ${hhmm(timing.hour)} tomorrow`);
              }}
            >
              {scheduled ? "Clear reminder" : `Remind me at ${hhmm(timing.hour)}`}
            </Button>
            <span className="text-[12px] text-faint">
              A nudge, not a scheduled post — nothing goes out without you.
            </span>
          </div>
        </Detail>

        {referral && (
          <div className="flex min-h-[44px] items-center gap-2.5 border-t border-line/70 lg:min-h-[38px]">
            <Link2 className="h-4 w-4 shrink-0 text-faint" />
            <span className="text-[13px] font-semibold text-muted">Referral link</span>
            <span className="ml-auto min-w-0 truncate pl-3 text-[13px] tabular-nums text-faint">{myReferralCode}</span>
            <button
              onClick={() => { navigator.clipboard?.writeText(referral); toast("Referral link copied"); }}
              className="shrink-0 rounded-full px-2 py-1 text-[13px] font-semibold text-[var(--ai-accent)] transition hover:bg-soft"
            >
              Copy
            </button>
          </div>
        )}
      </div>

      {referral && (
        <p className="mt-2.5 flex items-start gap-1.5 text-[12px] leading-snug text-faint">
          <Link2 className="mt-[2px] h-3 w-3 shrink-0" />
          A hiring post, so your link carries your code. Anyone who applies through it is credited to
          you — which is what makes a share worth counting rather than an impression nobody can trace.
        </p>
      )}

      <ShareActions
        platform={platform}
        url={referral ?? url}
        caption={value}
        onPosted={() => { /* the count lives in the parent's persisted state */ }}
        disabled={blocked.length > 0 || over}
        disabledReason={
          blocked.length > 0 ? "Clear the flagged detail above first — that one needs sign-off before it goes public."
          : over ? `Trim it under ${limit.toLocaleString()} characters for ${platform}.`
          : undefined
        }
      />
    </div>
  );
}
