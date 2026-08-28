# 006 · The AI runtime — citations, refusals, and the agentic confirmation pattern

**Status:** built in code · no API key required to see it work.
**Source:** §"AI Features"/"Agentic" bullets throughout the AI Feature Product Inputs brief,
plus §8 Cross-Cutting AI Layer.
**See it live:** open the Vadal AI dock and try — as a **manager** — *"launch a quick pulse to
Design about the new tooling"*, then *"how many paid leaves do I get"*, then something the
knowledge base does not cover.

---

## 1 · What changed, and why it matters for design

Until now every AI surface in the product was scripted text. It is now a real runtime: retrieval
over the org's own documents, real citations, an honest refusal, and — the important one —
**actions the Copilot proposes and a person confirms.**

The model itself is still not connected (no API key yet). That deliberately changes nothing about
the designs below: retrieval, citation, confirmation, undo and labelling all run today, and the
model swaps in behind them later. **What you design now is what ships.**

---

## 2 · Three answer states, not one

The Copilot bubble now has three outcomes and they must look different, because the difference is
the whole point of a grounded assistant.

| State | When | Label under the bubble |
|---|---|---|
| **Grounded** | Answered from the org's approved documents | "AI-assisted · answered from your company's documents" |
| **Refused** | Retrieval found nothing confident | "AI-assisted · no source found" |
| **Action** | The Copilot is proposing to *do* something | "AI-assisted" + a confirmation card |

**Refusal is a feature, not an error state.** Do not style it as a failure — no red, no warning
icon. It reads: *"I couldn't find that in your company's approved documents, so I'd rather not
guess — policy answers are only as good as their source."* A confidently wrong answer about
someone's leave or pay is the exact failure this pillar exists to prevent.

`Component / AI / Answer label` — variants `State = Grounded | No source | Action`.

---

## 3 · Citations — new component

Citations are no longer chips with a filename. Each one carries **the sentence the answer came
from**, so a reader can check the claim without leaving the conversation.

`Component / AI / Citation`
- Rounded-xl, `bg-soft`, 10px × 6px padding, hover to `--card-hover`
- Row 1: 12px file icon (`text-faint`) + document title, 12px/600 `text-ink`
- Row 2: the source passage in quotes, 12px `text-faint`, **clamped to 2 lines**
- The whole card links to that document in Knowledge and closes the dock
- Stacked vertically under a 12px uppercase "SOURCES" label — not a horizontal chip row, because
  the passage needs the width

Usually one citation, occasionally two. Three is the cap.

---

## 4 · The confirmation card — the most important new pattern

This is the shape **all 16 agentic features** in the brief will use. Designing it once, well, is
the difference between shipping agentic AI and shipping 16 inconsistent one-offs.

`Component / AI / Tool confirmation` — variants `State = Proposed | Running | Done | Undone | Cancelled | Failed`

### Proposed (the default)
- Full-width card inside the AI bubble column, rounded-2xl, `bg-[--ai-surface]`, 1px `--ai-border`
- **Title** 14px bold — "Launch a quick pulse"
- **Summary** 14px `text-muted`, one plain sentence of exactly what will happen
- **Divider**, then a definition list: 84px label column (12px uppercase `text-faint`) + value
  (14px `text-ink`, `white-space: pre-line` so multi-line question lists render)
- **Actions row:** primary "Confirm & send" · secondary "Cancel" · right-aligned 12px `text-faint`
  reassurance: **"You can undo this"**

The full payload is visible *before* confirming. Never a summary the person has to trust.

### Done
Collapses to a single row: green check + result message + an **Undo** button that stays on screen.

### Undone
Same row, check goes `text-faint`, message struck through. The person can see what they reversed.

### Cancelled
One line, 14px `text-faint`: "Cancelled — nothing was sent." No card, no residue.

---

## 5 · Reasoning trace

The "thinking" state now shows **real steps** from the runtime, not decorative text:
`Reading the request` → `Scoping the audience — Design` → `Drafting questions`.

Design note that cost us a bug: the trace must state the **final** value, not the requested one.
A manager who asks for Plant Ops sees "Scoping the audience — Design", because Design is what will
actually happen. A trace that reports something the action then overrides is worse than no trace.

---

## 6 · Permission and scope inside the conversation

The Copilot never proposes an action the person could not perform themselves. Two refusals to
design copy for:

- **Wrong role** — *"Launching a pulse survey is a manager and HR admin action, so I can't do that
  from your account. If there's something your team should be asked, tell your manager or the
  People team — or I can help you word it."* Note it offers the nearest thing it *can* do.
- **Out of scope** — *"You can only survey **Design**, so I've scoped it there rather than Plant
  Ops — ask an HR admin if you need a wider send."* It narrows and says so, rather than refusing.

---

## 7 · Empty-state prompts are role-aware

The dock's opening suggestions differ by role, because an employee and a manager want different
first moves:

| Role | Suggestions |
|---|---|
| Employee | "How many leaves do I get?" · "What's our WFH policy?" · "Am I covered for hospital bills?" |
| Manager / Admin | "Launch a quick pulse for my team about workload" · "How many leaves do I get?" · "Give kudos to Anita" |

The greeting uses the session's first name.

---

## 8 · An open gap the design needs to close

A manager **can launch a pulse** (a Pulse capability) but **cannot open Surveys** (admin
configuration) — so today the confirmation says *"Pulse sent to Design. Responses start arriving
today"* and deliberately does not point anywhere, because pointing someone at a screen they will
be refused from is worse than not pointing at all.

**Where does a manager read the results of a pulse they launched?** Most likely a "My pulses"
section inside Manager hub or Pulse. It needs designing; it is currently a dead end.

## 9 · What to draw, in priority order

1. `Component / AI / Tool confirmation` — 6 states *(this is the one that unlocks 16 features)*
2. `Component / AI / Citation`
3. `Component / AI / Answer label` — Grounded · No source · Action
4. Reasoning-trace step row
5. Role-aware dock empty state — 2 variants
6. "My pulses" — the missing manager destination in §8
