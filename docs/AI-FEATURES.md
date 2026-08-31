# AI features — what is built, and where to find it

> Generated from `apps/product/src/lib/ai/features.ts` by
> `apps/product/scripts/ai-features-md.mjs`. **Do not edit by hand** — regenerate it:
> ```bash
> cd apps/product && node scripts/ai-features-md.mjs --write
> ```

---

## The numbers

| | Count | Meaning |
|---|---:|---|
| **Total in the brief** | **68** | Every AI feature the product brief names |
| 🟢 Live | 52 | Implemented **and** reachable — a person can get to it today |
| 🟡 Not wired | 13 | Implemented, type-checked, and nothing calls it. No amount of clicking finds these |
| 🔴 Blocked | 3 | The brief itself blocks shipping — not our backlog |

> The live index counts **55 reachable**, not 52: the 3 blocked features *are* wired and
> do respond — they explain why they will not act. Reachable and shippable are different
> questions, and this table answers the second one.

**Work remaining: 13 to wire.** Nothing is left to *build* — every one of the 68 has a
named, tested implementation. The gap is between *the code exists* and *a person can reach it*,
which is not the same claim and was reported as the same claim until a call-site audit caught it.

### Why "not wired" is tracked separately

The registry originally proved only that each implementation **existed**. Thirteen features were
exported, covered and invisible while it reported them as done. `scripts/ai-reachability.mjs`
now recomputes reachability from real call sites, and `/api/ai/features` returns **500** if any
claim stops being true — so this table cannot quietly rot.

---

## Where to find them

**Live index (searchable, filterable):**
<https://claude.ai/code/artifact/16e363f1-ff85-4a69-b280-f535d599264b>

**Check it yourself:**

```bash
cd apps/product
node scripts/ai-reachability.mjs     # recompute reachability from call sites
curl -s localhost:3005/api/ai/features | jq   # the product's own answer
```

**Sign in as the right persona first** — role decides what exists, so much of this is invisible
as an employee. Any of these at `/auth`, no password:

| Email | Who |
|---|---|
| `aarav@oliandhue.com` | Employee · desk |
| `ravi@oliandhue.com` | Employee · frontline, Plant Ops |
| `anita@oliandhue.com` | Manager · Design |
| `sunita@oliandhue.com` | Manager · frontline, Night shift |
| `priya@oliandhue.com` | HR admin — sees everything |
| `ops@vadal.ai` | Super admin |

---

## By pillar

### Onboarding

3 features — 0 live, 3 not wired

| Feature | Status | Where | Implementation |
|---|---|---|---|
| Conversational onboarding assistant replaces static forms | 🟡 **Not wired** | — not reachable — | `engines/onboarding.openingTurn` |
| Progressive profiling — 2–3 light questions per session over the first two weeks | 🟡 **Not wired** | — not reachable — | `engines/onboarding.nextTurn` |
| Automatic locale and reading-level adaptation | 🟡 **Not wired** | — not reachable — | `engines/text.localise` |

### Pulse

10 features — 7 live, 3 not wired

| Feature | Status | Where | Implementation |
|---|---|---|---|
| Conversational check-ins converted into a structured Pulse entry to confirm | 🟢 **Live** | AI dock — ask for it | `engines/survey.draftCheckIn` |
| AGENTIC — converts the exchange into a structured Pulse entry for the person to confirm before it's logged ⚡ | 🟢 **Live** | AI dock — ask for it | `tools.log_mood_entry` |
| Sentiment and theme extraction, clustering comments into themes | 🟡 **Not wired** | — not reachable — | `engines/text.extractThemes` |
| Anomaly detection ... and drafts a suggested manager action | 🟢 **Live** | AI dock — ask for it | `engines/signals.detectAnomaly` |
| Adaptive survey length — the next question is chosen based on prior answers | 🟡 **Not wired** | — not reachable — | `engines/survey.nextQuestion` |
| AI-generated plain-language summary of each wave, with source quotes retained | 🟢 **Live** | AI dock — ask for it | `engines/text.summariseWave` |
| Smart send-time and channel selection per person | 🟡 **Not wired** | — not reachable — | `engines/timing.planSend` |
| AGENTIC — launch a quick pulse to a segment on request ⚡ | 🟢 **Live** | AI dock — ask for it | `tools.launch_pulse_survey` |
| AGENTIC — proactively launch a targeted micro-survey when an anomaly is flagged ⚡ | 🟢 **Live** | AI dock — ask for it | `tools.diagnose_anomaly` |
| AGENTIC — chase incomplete mandatory surveys on its own initiative ⚡ | 🟢 **Live** | AI dock — ask for it | `tools.chase_survey` |

### Connect

8 features — 5 live, 3 not wired

| Feature | Status | Where | Implementation |
|---|---|---|---|
| AI-assisted post creation from a rough voice note or a couple of phrases | 🟢 **Live** | AI dock — ask for it | `engines/text.composePost` |
| Auto-tagging of posts by team, topic and sentiment | 🟡 **Not wired** | — not reachable — | `engines/text.tagPost` |
| Toxicity/harassment detection routed to the moderation queue before publish | 🟢 **Live** | AI dock — ask for it | `engines/text.moderate` |
| Personalised feed ranking balancing relevance with company-wide culture moments | 🟡 **Not wired** | — not reachable — | `engines/personalize.rankFeed` |
| AI kudos-spotting — surfaces moments worth recognising and prompts the manager | 🟡 **Not wired** | — not reachable — | `engines/signals.scanAnomalies` |
| AGENTIC — 'write up the Line 2 safety streak as a post' ⚡ | 🟢 **Live** | AI dock — ask: "write up the Line 2 safety streak as a post" | `tools.write_post` |
| AGENTIC — auto-schedule a recognition post for a detected milestone ⚡ | 🟢 **Live** | AI dock — ask for it | `tools.schedule_milestone_post` |
| Peer-to-peer recognition, drafted by the Copilot ⚡ | 🟢 **Live** | AI dock — ask for it | `tools.give_recognition` |

### Amplify

13 features — 12 live, 1 blocked

| Feature | Status | Where | Implementation |
|---|---|---|---|
| AI-suggested personal caption in the employee's own voice | 🟢 **Live** | /product/amplify | `engines/advocacy.draftCaption` |
| Best-time-to-post recommendation per platform | 🟢 **Live** | /product/amplify → the caption composer | `engines/timing.bestTimeToPost` |
| Advocacy impact scoring — estimated reach/engagement uplift | 🟢 **Live** | /product/amplify | `engines/advocacy.scoreAdvocacy` |
| AGENTIC — 'share that last company post for me' ⚡ | 🔴 **Blocked** | AI dock — ask: "share that last company post for me" | `tools.share_to_social` |
| AGENTIC — 'queue this for advocacy' builds the curated card automatically ⚡ | 🟢 **Live** | AI dock — ask: "queue this for advocacy" | `tools.queue_for_advocacy` |
| Surface the person's OWN shareable moments — kudos, launches, certifications, milestones | 🟢 **Live** | /product/amplify | `engines/advocacy.rankMoments` |
| Caption written for the employee's own moment, crediting the people involved | 🟢 **Live** | /product/amplify → the caption composer | `engines/advocacy.draftFromMoment` |
| Social-policy check before a caption goes public — blocks financials and people data, warns on the rest | 🟢 **Live** | /product/amplify → the caption composer | `engines/advocacy.checkPolicy` |
| Two or three real hashtags drawn from what the post is about | 🟢 **Live** | /product/amplify → the caption composer | `engines/advocacy.hashtagsFor` |
| Referral code on a shared hiring post, so an application is attributable | 🟢 **Live** | /product/amplify → the caption composer | `engines/advocacy.referralLinkFor` |
| Reach forecast BEFORE comms queue a post, as a band rather than a false-precision number | 🟢 **Live** | /product/amplify → Programme tab | `engines/advocacy.forecastReach` |
| Reads the decline signal — says whether it is a writing problem, a targeting problem or healthy | 🟢 **Live** | /product/amplify → Programme tab | `engines/advocacy.declineInsight` |
| Quiet advocacy streak — counts up, never warns you that you are about to lose it | 🟢 **Live** | /product/amplify → the right rail | `engines/advocacy.advocacyStreak` |

### Thrive

7 features — 7 live

| Feature | Status | Where | Implementation |
|---|---|---|---|
| Personalised nudges timed to when the person is likely to act | 🟢 **Live** | /product/thrive | `engines/wellbeing.activityNudges` |
| AI financial tips by income band, role and region — guidance only | 🟢 **Live** | /product/thrive | `engines/wellbeing.financialTips` |
| Anomaly-aware wellbeing check, with consent, offering a warm handoff | 🟢 **Live** | /product/thrive | `engines/wellbeing.wellbeingCheck` |
| Smart challenge matching into fair leaderboard cohorts | 🟢 **Live** | /product/thrive | `engines/wellbeing.buildCohorts` |
| AGENTIC — log activity conversationally ('I ran 5k this morning') ⚡ | 🟢 **Live** | AI dock — ask: "I ran 5k this morning" | `tools.log_activity` |
| AGENTIC — renegotiate a goal on request and adjust it ⚡ | 🟢 **Live** | AI dock — ask for it | `tools.adjust_goal` |
| AGENTIC — flag an unused benefit before open enrolment and offer to book a call ⚡ | 🟢 **Live** | AI dock — ask for it | `tools.book_benefit_call` |

### Broadcast

7 features — 5 live, 2 not wired

| Feature | Status | Where | Implementation |
|---|---|---|---|
| AI drafting assistant — bullet points into a clear announcement in company tone | 🟢 **Live** | AI dock — ask for it | `engines/text.composePost` |
| Automatic translation and reading-level simplification per recipient | 🟡 **Not wired** | — not reachable — | `engines/text.localise` |
| AI Q&A over the policy library — a sourced answer, not a PDF search | 🟢 **Live** | AI dock — ask for it | `retrieve.retrieve` |
| Delivery-optimisation — best channel/time per segment | 🟡 **Not wired** | — not reachable — | `engines/timing.planSegment` |
| AI-generated weekly digest for anyone on leave or off-shift | 🟢 **Live** | AI dock — ask for it | `engines/text.weeklyDigest` |
| AGENTIC — 'draft the PPE update for Plant 3', queued for human approval ⚡ | 🟢 **Live** | AI dock — ask: "draft the PPE update for Plant 3" | `tools.draft_announcement` |
| AGENTIC — auto-chase acknowledgement, reminding only non-confirmers ⚡ | 🟢 **Live** | AI dock — ask for it | `tools.chase_acknowledgement` |

### Grow

7 features — 7 live

| Feature | Status | Where | Implementation |
|---|---|---|---|
| Course generation from a PDF/SOP/deck with quiz questions drafted for review | 🟢 **Live** | /product/grow | `engines/learning.generateCourse` |
| Personalised path recommendations from role, Pulse feedback and incident data | 🟢 **Live** | /product/grow | `engines/learning.recommendPaths` |
| Adaptive quizzing with spaced repetition | 🟢 **Live** | /product/grow | `engines/learning.reviewQueue` |
| Match learning to the time actually available, at lesson granularity | 🟢 **Live** | /product/grow → the right rail | `engines/learning.whatFitsIn` |
| AI tutor answering only from that module's source content | 🟢 **Live** | /product/grow | `engines/learning.tutor` |
| AGENTIC — 'make this a course' from pasted notes or an SOP ⚡ | 🟢 **Live** | AI dock — ask: "make this a course" | `tools.make_course` |
| AGENTIC — auto-assign a matching path when Pulse flags a skills gap ⚡ | 🟢 **Live** | AI dock — ask for it | `tools.assign_learning` |

### One-to-One Help

9 features — 7 live, 2 blocked

| Feature | Status | Where | Implementation |
|---|---|---|---|
| Empathetic conversational intake in plain, warm language | 🟢 **Live** | /product/help → the companion | `engines/support.intake` |
| Need and urgency triage into a band — never a clinical diagnosis | 🟢 **Live** | /api/ai/features/route.ts | `engines/support.triage` |
| Consent-based handoff summary, with explicit sign-off | 🟢 **Live** | /product/help | `engines/support.buildHandoff` |
| Self-serve resource matching for lower-stakes moments | 🟢 **Live** | /product/help → the companion | `engines/support.matchResources` |
| Always-visible crisis resources, never gated behind a conversation | 🟢 **Live** | /product/help | `engines/support.crisisResources` |
| AGENTIC — book a session and pass the handoff summary, with consent ⚡ | 🔴 **Blocked** | AI dock — ask for it | `tools.book_counsellor` |
| AGENTIC — acute-risk escalation per the org's configured, human-reviewed policy ⚡ | 🔴 **Blocked** | AI dock — ask for it | `engines/support.escalate` |
| Separate intake for someone worried about a COLLEAGUE — triage reads its input as first-person, so a third-party report was mis-banded | 🟢 **Live** | /product/help → the companion | `engines/support.concernIntake` |
| Executable crisis-phrasing cases — 15 that must trip the crisis path, 10 ordinary phrases that must not | 🟢 **Live** | /api/ai/features/route.ts | `engines/support.checkTriage` |

### Cross-cutting

4 features — 2 live, 2 not wired

| Feature | Status | Where | Implementation |
|---|---|---|---|
| Personalization engine — one profile ranking feed, home order and Grow recommendations | 🟡 **Not wired** | — not reachable — | `engines/personalize.orderHome` |
| Sentiment & signal engine feeding one employee-experience score | 🟡 **Not wired** | — not reachable — | `engines/signals.employeeExperienceScore` |
| A persistent Copilot on every pillar that answers, drafts and surfaces insight | 🟢 **Live** | lib/ai/index.ts | `mock.mockProvider` |
| Every AI output labelled AI-assisted; safety-critical content requires human review | 🟢 **Live** | AI dock — ask for it | `tools.assertRegistryIsSafe` |

⚡ = agentic: it proposes an action, and every one confirms before it does anything and can be undone.

---

## The 13 still to wire

Each has a working implementation and no caller. Wiring means giving it a surface —
a control on a screen, or a route in the Copilot's intent map.

| Feature | Pillar | What to call |
|---|---|---|
| Conversational onboarding assistant replaces static forms | Onboarding | `engines/onboarding.openingTurn()` |
| Progressive profiling — 2–3 light questions per session over the first two weeks | Onboarding | `engines/onboarding.nextTurn()` |
| Automatic locale and reading-level adaptation | Onboarding | `engines/text.localise()` |
| Sentiment and theme extraction, clustering comments into themes | Pulse | `engines/text.extractThemes()` |
| Adaptive survey length — the next question is chosen based on prior answers | Pulse | `engines/survey.nextQuestion()` |
| Smart send-time and channel selection per person | Pulse | `engines/timing.planSend()` |
| Auto-tagging of posts by team, topic and sentiment | Connect | `engines/text.tagPost()` |
| Personalised feed ranking balancing relevance with company-wide culture moments | Connect | `engines/personalize.rankFeed()` |
| AI kudos-spotting — surfaces moments worth recognising and prompts the manager | Connect | `engines/signals.scanAnomalies()` |
| Automatic translation and reading-level simplification per recipient | Broadcast | `engines/text.localise()` |
| Delivery-optimisation — best channel/time per segment | Broadcast | `engines/timing.planSegment()` |
| Personalization engine — one profile ranking feed, home order and Grow recommendations | Cross-cutting | `engines/personalize.orderHome()` |
| Sentiment & signal engine feeding one employee-experience score | Cross-cutting | `engines/signals.employeeExperienceScore()` |

---

## The 3 blocked by the brief

These are **not** outstanding work. The brief requires something to happen before they ship,
and the product refuses them in code until it does.

**AGENTIC — 'share that last company post for me'** *(Amplify)*

> Needs a per-platform feasibility spike and per-employee OAuth — the brief requires the spike before committing.

**AGENTIC — book a session and pass the handoff summary, with consent** *(One-to-One Help)*

> Clinical, legal and HR sign-off on triage thresholds and data-access rules is a hard blocker on launch.

**AGENTIC — acute-risk escalation per the org's configured, human-reviewed policy** *(One-to-One Help)*

> Requires a signed escalation policy — assertLaunchable() throws without one.

---

## One thing that is not a feature gap

**The model is not connected.** Retrieval, citations, grounding, refusals, confirmation and undo
are all real and all enforced; the language itself is generated deterministically until an API key
is set. Setting one changes how the sentences read — it does not change anything in the tables above.
