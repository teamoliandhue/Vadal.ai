"use client";
/* ══════════════════════ the companion ══════════════════════
   Two things were wrong here, one cosmetic and one that mattered.

   THE EMPTY BOX. This screen's entire job is to lower the cost of asking for
   help, and it opened with a blank text field and the words "start wherever you
   want, there's no form". For someone who cannot yet name what is wrong — which
   is most people, most of the time — a blank field is the hardest thing you can
   put in front of them. There are ways in now: first-person sentences someone
   might recognise, which fill the box rather than sending it, so the first
   words on the screen are still theirs to change.

   THE OTHER PERSON. A large share of the people who open a support screen are
   not here for themselves, and the page did not merely ignore them — it got
   them wrong. triage() reads its input as a first-person account, so "my
   colleague said he wants to die" hit the acute band and answered the SPEAKER
   as though they were the one at risk. The one human who noticed got told to
   look after themselves and was handed nothing to act on. There is a separate
   door for that now, with its own intake. */
import * as React from "react";
import { ArrowRight, Heart, Trash2, Users } from "lucide-react";
import { Badge, Button, SparkMark } from "@vadal/design-system";
import {
  concernIntake, intake, matchResources, type ConcernTurn, type Triage,
} from "@/lib/ai/engines/support";
import { POLICY, WAYS_IN, WAYS_IN_OTHER } from "@/lib/help";
import { Card, Eyebrow } from "./parts";
import { toast } from "../Toaster";

export type Mode = "me" | "other";
type Turn =
  | { who: "me"; text: string }
  | { who: "vadal"; text: string }
  | { who: "concern"; turn: ConcernTurn };

export function Companion({
  mode, setMode, triage, setTriage, onSaid, onWantHuman,
}: {
  mode: Mode; setMode: (m: Mode) => void;
  triage: Triage | null; setTriage: (t: Triage | null) => void;
  /** Only what the person said about THEMSELVES — the handoff summary must
   *  never carry a description of a third party they were worried about. */
  onSaid: (text: string) => void;
  onWantHuman: () => void;
}) {
  const [turns, setTurns] = React.useState<Turn[]>([]);
  const [draft, setDraft] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  const resources = triage ? matchResources(triage, 3) : [];
  const ways = mode === "me" ? WAYS_IN : WAYS_IN_OTHER;

  function say(text: string) {
    const t = text.trim();
    if (!t) return;

    if (mode === "other") {
      setTurns((all) => [...all, { who: "me", text: t }, { who: "concern", turn: concernIntake(t, POLICY.region) }]);
      // Deliberately not set: the band describes the person being described, and
      // routing the SPEAKER on it is the exact bug this mode exists to fix.
      setTriage(null);
    } else {
      const turn = intake(t, POLICY.region);
      setTurns((all) => [
        ...all,
        { who: "me", text: t },
        { who: "vadal", text: [turn.reflection, turn.question].filter(Boolean).join(" ") },
      ]);
      setTriage(turn.triage);
      onSaid(t);
    }
    setDraft("");
  }

  function switchMode(m: Mode) {
    setMode(m);
    setTurns([]);
    setTriage(null);
    setDraft("");
  }

  return (
    <Card className="relative overflow-hidden">
      {/* A warm ground rather than flat white. This is the one screen in the
          product where the surface itself is doing emotional work. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(120% 90% at 0% 0%, color-mix(in srgb, var(--ai-accent) 7%, transparent), transparent 60%)" }}
      />

      <div className="relative">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <Eyebrow>Private</Eyebrow>
            <h2 className="mt-1.5 text-[19px] font-bold tracking-tight">
              {mode === "me" ? "Talk it through" : "Helping someone else"}
            </h2>
          </div>
          {turns.length > 0 && (
            <button
              onClick={() => { setTurns([]); setTriage(null); toast("Conversation deleted — nothing was kept."); }}
              className="flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-full px-2.5 text-[12px] font-semibold text-faint transition hover:bg-soft hover:text-ink lg:min-h-[36px]"
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </button>
          )}
        </div>

        {/* ── who is this for ── the door that did not exist ── */}
        <div className="mt-3 flex w-full rounded-full bg-soft p-1 text-[14px] font-semibold sm:w-fit">
          {([["me", "For me", Heart], ["other", "For someone else", Users]] as const).map(([k, label, Icon]) => (
            <button
              key={k}
              onClick={() => switchMode(k)}
              aria-pressed={mode === k}
              className={`flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-full px-4 transition sm:flex-none lg:min-h-[38px] ${
                mode === k ? "bg-card text-ink shadow-sm" : "text-muted hover:text-ink"
              }`}
            >
              <Icon className="h-4 w-4" strokeWidth={1.9} /> {label}
            </button>
          ))}
        </div>

        <p className="mt-3 max-w-md text-[14px] leading-relaxed text-muted">
          {mode === "me"
            ? "Say as much or as little as you like. I listen, I help you work out what would help — and I hand you to a real person the moment that is the better answer."
            : "Tell me what you've noticed. I'll help you work out how to raise it, what to say, and when it needs more than a conversation."}
        </p>

        {/* ── the conversation ── */}
        <div className="mt-5 flex flex-col gap-3">
          {turns.length === 0 ? (
            <WaysIn
              ways={ways}
              mode={mode}
              onPick={(w) => { setDraft(w); inputRef.current?.focus(); }}
            />
          ) : (
            turns.map((t, i) =>
              t.who === "me" ? (
                <div key={i} className="flex justify-end">
                  <p className="max-w-[80%] rounded-2xl bg-[var(--purple)] px-3.5 py-2.5 text-[16px] leading-relaxed text-white">{t.text}</p>
                </div>
              ) : t.who === "vadal" ? (
                <div key={i} className="flex items-start gap-2">
                  <span className="ai-grad mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full"><SparkMark size={13} tone="solid" /></span>
                  <p className="max-w-[85%] rounded-2xl bg-[var(--ai-surface)] px-3.5 py-2.5 text-[16px] leading-relaxed ring-1 ring-[var(--ai-border)]">{t.text}</p>
                </div>
              ) : (
                <ConcernAnswer key={i} turn={t.turn} />
              ),
            )
          )}
        </div>

        {/* urgency band — a routing decision, stated as one, never a diagnosis.
            Only ever shown in "for me" mode: the band describes whoever the text
            is about, and showing it here would rate the wrong person. */}
        {mode === "me" && triage && (
          <div className="mt-4 rounded-2xl bg-soft p-4">
            <div className="flex flex-wrap items-center gap-2">
              <Eyebrow>What I&apos;d suggest</Eyebrow>
              <Badge tone={triage.acute ? "danger" : triage.band === "counsellor" ? "warning" : "info"} variant="soft" size="sm">
                {triage.acute ? "Speak to someone now" : triage.band === "counsellor" ? "Worth a counsellor" : "Might be enough on its own"}
              </Badge>
            </div>
            <p className="mt-2 text-[14px] leading-relaxed text-muted">{triage.why}</p>
            {triage.band !== "self-serve" && (
              <Button variant="brand" className="mt-3 min-h-[44px]" onClick={onWantHuman} trailingIcon={<ArrowRight className="h-3.5 w-3.5" />}>
                Talk to a real person
              </Button>
            )}
            <p className="mt-2.5 text-[12px] text-faint">This is a routing suggestion, not a diagnosis. I don&apos;t do those.</p>
          </div>
        )}

        {resources.length > 0 && (
          <div className="mt-4">
            <Eyebrow>Might help right now</Eyebrow>
            <ul className="mt-2 flex flex-col gap-2">
              {resources.map((r) => (
                <li key={r.id}>
                  <button onClick={() => toast(`Opening “${r.title}”`)} className="flex min-h-[44px] w-full items-center gap-3 rounded-xl border border-line px-3.5 text-left transition hover:bg-soft">
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
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={mode === "me" ? "However you'd put it…" : "What have you noticed?"}
            aria-label={mode === "me" ? "Tell the companion how you are" : "Describe what you have noticed"}
            className="min-h-[48px] min-w-0 flex-1 rounded-full border border-line bg-soft px-4 text-[16px] outline-none transition focus:border-[var(--ai-accent)]"
          />
          <Button type="submit" variant="brand" className="min-h-[48px]">Send</Button>
        </form>
      </div>
    </Card>
  );
}

/* ── the ways in ────────────────────────────────────────────────── */
function WaysIn({ ways, mode, onPick }: { ways: readonly string[]; mode: Mode; onPick: (w: string) => void }) {
  return (
    <div className="rounded-2xl border border-dashed border-line p-5">
      <div className="flex items-center gap-2">
        <span className="ai-grad grid h-7 w-7 shrink-0 place-items-center rounded-full"><SparkMark size={15} tone="solid" /></span>
        <p className="text-[14px] font-semibold">
          {mode === "me" ? "If it's hard to start, start here" : "If it's hard to start, start here"}
        </p>
      </div>
      <p className="mt-1.5 text-[13px] leading-snug text-muted">
        Tap one to put it in the box — then change it, or add to it. Nothing sends until you do.
      </p>
      <div className="mt-3.5 flex flex-wrap gap-2">
        {ways.map((w) => (
          <button
            key={w}
            onClick={() => onPick(w)}
            className="min-h-[44px] rounded-full border border-line bg-card px-3.5 text-left text-[14px] leading-snug transition hover:border-[var(--ai-border)] hover:bg-[var(--ai-surface)] lg:min-h-[38px]"
          >
            {w}
          </button>
        ))}
      </div>
      <p className="mt-3.5 text-[12px] leading-snug text-faint">
        Nothing here is stored anywhere you can&apos;t reach, and a real person is one tap away on
        every screen — you never have to go through me first.
      </p>
    </div>
  );
}

/* ── the answer when it is about someone else ───────────────────── */
function ConcernAnswer({ turn }: { turn: ConcernTurn }) {
  return (
    <div className="flex items-start gap-2">
      <span className="ai-grad mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full"><SparkMark size={13} tone="solid" /></span>
      <div
        className="min-w-0 flex-1 rounded-2xl p-4"
        style={
          turn.urgent
            ? {
                background: "color-mix(in srgb, var(--danger) 7%, var(--card))",
                boxShadow: "inset 0 0 0 1px color-mix(in srgb, var(--danger) 28%, transparent)",
              }
            : { background: "var(--ai-surface)", boxShadow: "inset 0 0 0 1px var(--ai-border)" }
        }
      >
        <p className="text-[16px] leading-relaxed">{turn.reflection}</p>

        <div className="mt-4">
          <Eyebrow>{turn.urgent ? "Do this now" : "What tends to help"}</Eyebrow>
          <ol className="mt-2 flex flex-col gap-2.5">
            {turn.steps.map((s, i) => (
              <li key={i} className="flex gap-2.5 text-[15px] leading-relaxed">
                <span
                  className="mt-[3px] grid h-5 w-5 shrink-0 place-items-center rounded-full text-[11px] font-bold"
                  style={{
                    background: turn.urgent ? "color-mix(in srgb, var(--danger) 14%, transparent)" : "var(--card)",
                    color: turn.urgent ? "var(--danger)" : "var(--ai-accent)",
                  }}
                >
                  {i + 1}
                </span>
                <span>{s}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-4">
          <Eyebrow>Try not to</Eyebrow>
          <ul className="mt-2 flex flex-col gap-1.5">
            {turn.avoid.map((a) => (
              <li key={a} className="text-[14px] leading-relaxed text-muted">— {a}</li>
            ))}
          </ul>
        </div>

        {turn.urgent && (
          <div className="mt-4 flex flex-wrap gap-2">
            {turn.crisis.map((c) => (
              <a
                key={c.number}
                href={`tel:${c.number.replace(/\s/g, "")}`}
                className="flex min-h-[48px] items-center gap-2 rounded-full px-4 text-[16px] font-semibold text-white"
                style={{ background: "var(--danger)" }}
              >
                {c.label.split("(")[0].trim()} · {c.number}
              </a>
            ))}
          </div>
        )}

        <p className="mt-4 border-t border-line pt-3 text-[13px] leading-relaxed text-muted">{turn.alsoForYou}</p>
      </div>
    </div>
  );
}
