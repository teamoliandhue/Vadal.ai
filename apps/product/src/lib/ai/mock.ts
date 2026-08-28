/**
 * The deterministic provider — what answers today, with no API key.
 *
 * It is not a stub around the real thing; it runs the *same* pipeline the real
 * provider will: it calls the same engines, retrieves from the org's documents,
 * emits real citations, refuses when retrieval is weak, and proposes tool calls
 * the client must confirm. Only the language generation is canned.
 *
 * Intent routing is explicit here. A real model does this implicitly, but
 * keeping it visible means the routing is inspectable and testable, and the
 * surface contract stays identical when the model takes over.
 */
import { retrieve, toCitations, isGrounded, matchesKeyword } from "./retrieve";
import { TOOLS, toolsFor } from "./tools";
import { departments } from "@/lib/data";
import type { AiChunk, AiProvider, AiRequest, ToolCall } from "./types";
import type { Role } from "@/lib/auth";

import { composePost, moderate, summariseWave, weeklyDigest, readability, simplify } from "./engines/text";
import { seedBaseline, detectAnomaly } from "./engines/signals";
import { draftCheckIn, draftMicroSurvey } from "./engines/survey";
import { generateCourse } from "./engines/learning";
import { financialTips } from "./engines/wellbeing";
import { intake, crisisResources, matchResources, UNSIGNED_POLICY, escalate, triage } from "./engines/support";
import { draftCaption, buildAdvocacyCard, canAutoMirror } from "./engines/advocacy";
import { bestTimeToPost, type Platform } from "./engines/timing";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function* streamText(text: string): AsyncGenerator<AiChunk> {
  const tokens = text.split(/(\s+)/);
  for (let i = 0; i < tokens.length; i += 2) {
    yield { type: "text", delta: tokens.slice(i, i + 2).join("") };
    await sleep(10);
  }
}

let seq = 0;
function proposeTool(name: string, args: Record<string, unknown>): AiChunk {
  const def = TOOLS[name];
  const call: ToolCall = {
    id: `tc_${name}_${++seq}`,
    tool: def.name,
    title: def.title,
    summary: def.summarise(args),
    preview: def.preview(args),
    args,
    requiresConfirmation: def.requiresConfirmation,
    undoable: def.undoable,
    blockedReason: def.blockedReason,
    state: "proposed",
  };
  return { type: "tool", call };
}

const titleCase = (s: string) => s.replace(/\b\w/g, (c) => c.toUpperCase());

function findTeam(low: string, fallback?: string): string {
  const dept = departments.find((d) => low.includes(d.name.toLowerCase()));
  if (dept) return dept.name;
  const line = low.match(/line\s*\d+|night shift|plant ops|day shift/);
  return line ? titleCase(line[0]) : fallback ?? "All teams";
}

function topicFrom(low: string, fallback: string): string {
  // "…about the new tooling" — the explicit form.
  const about = low.match(/about (?:the |our )?([a-z0-9 ’'-]{3,45})/);
  if (about) return clean(about[1]);
  // "write up the Line 2 safety streak as a post" — the brief's own phrasing,
  // which has no "about" at all and was previously falling through to a generic
  // fallback on the one example the document actually gives.
  const asA = low.match(/(?:write up|draft|turn) (?:the |our |this )?([a-z0-9 ’'-]{3,45}?) (?:as|into) a\b/);
  if (asA) return clean(asA[1]);
  const forX = low.match(/(?:update|announcement|notice) for (?:the |our )?([a-z0-9 ’'-]{3,45})/);
  if (forX) return clean(forX[1]);
  return fallback;
}

function clean(s: string): string {
  return s.trim().replace(/\s+(for|to|in|on|of)$/, "").trim();
}

function platformFrom(low: string): Platform {
  if (/linkedin/.test(low)) return "LinkedIn";
  if (/instagram|insta/.test(low)) return "Instagram";
  if (/facebook|\bfb\b/.test(low)) return "Facebook";
  return "X";
}

/* ── intents, in priority order ─────────────────────────────────
   Ordered so specific asks beat general ones. Anything that is not
   an action or a wellbeing moment falls through to grounded document
   search, which is the safe default. */
type Intent =
  | { k: "help" }
  | { k: "checkin"; said: string }
  | { k: "pulse"; team: string; topic: string }
  | { k: "diagnose"; team: string }
  | { k: "chase_survey"; survey: string }
  | { k: "summary" }
  | { k: "recognise"; to: string }
  | { k: "writeup"; team: string; subject: string }
  | { k: "milestone"; person: string; milestone: string }
  | { k: "share"; platform: Platform }
  | { k: "advocacy" }
  | { k: "posttime"; platform: Platform }
  | { k: "log_activity"; activity: string }
  | { k: "adjust_goal"; metric: string }
  | { k: "benefit" }
  | { k: "money"; question: string }
  | { k: "announce"; team: string; subject: string }
  | { k: "chase_ack"; message: string }
  | { k: "digest" }
  | { k: "course" }
  | { k: "assign_learning"; team: string }
  | { k: "smalltalk" }
  | { k: "policy" };

const RE = {
  help: /\b(struggling|overwhelmed|burnt out|burned out|can'?t cope|cant cope|anxious|anxiety|depress|panic|counsell?or|therapy|mental health|talk to someone|hurt myself|harm myself|kill myself|end my life|suicid|no reason to live|abusive|harassed)\b/i,
  checkin: /\b(check.?in|my week has been|how my week|log my mood|been a (rough|tough|good|hard) week)\b/i,
  pulse: /(launch|run|send|start|do)\b[^.]*\b(pulse|survey|poll)|quick pulse/i,
  diagnose: /(why|what happened|find out)[^.]*\b(drop|dip|dipped|fell|down)\b|diagnos/i,
  chaseSurvey: /(chase|remind|nudge)[^.]*(survey|pulse|non.?respon|haven'?t (done|completed|filled|responded))/i,
  summary: /(summar[iy]|what did (people|they|the survey) say|wave results)/i,
  recognise: /\b(kudos|recognise|recognize|shout ?out|appreciate)\b/i,
  writeup: /(write|draft|turn)[^.]*\bpost\b|write it up/i,
  milestone: /(anniversary|work.?versary|milestone|certification)[^.]*\bpost\b|schedule[^.]*\bpost\b/i,
  share: /(share|repost|reshare)[^.]*(linkedin|twitter|instagram|facebook|social)|post (that|this|it) for me/i,
  advocacy: /queue[^.]*(advocacy|for sharing)|advocacy (card|queue)/i,
  postTime: /(best time to post|when should (i|we) post)/i,
  logActivity: /\b(i (ran|walked|cycled|swam|jogged)|did \d+ ?k\b|steps today)\b/i,
  adjustGoal: /\bgoal\b[^.]*(too (easy|hard)|change|increase|lower|adjust)|(change|adjust)[^.]*\b(goal|target)\b/i,
  benefit: /(benefit|enrolment|enrollment|insurance add|unused)/i,
  money: /\b(saving|savings|invest|budget|debt|pension|epf|ppf|nps|401k|financial)\b/i,
  announce: /(draft|write|send)[^.]*(announcement|update|notice|memo|bulletin)|ppe update/i,
  chaseAck: /(chase|remind)[^.]*(acknowledg|confirm|read receipt)/i,
  digest: /(digest|what did i miss|catch me up|while i was (away|off|on leave))/i,
  course: /(make|turn|convert)[^.]*\b(course|training|module)\b|course from/i,
  assignLearning: /(assign|enrol|enroll)[^.]*(learning|course|path|training)/i,
  smalltalk: /^(hi|hey|hello|thanks|thank you|ok|okay|cool|nice)\b/i,
};

function detect(q: string, team?: string): Intent {
  const low = q.toLowerCase();

  // Pillar 7 is checked before everything else, deliberately. Someone saying
  // they cannot cope must never be routed into a survey builder because their
  // sentence happened to contain the word "team".
  //
  // Acute risk is delegated to the support engine's own triage rather than
  // re-detected here. Two lists WILL drift: this router's list said "end my
  // life" while a person wrote "ending my life", and the message was answered
  // with the work-from-home policy. One list, one place, no drift.
  if (triage(q).acute) return { k: "help" };
  if (RE.help.test(low)) return { k: "help" };

  if (RE.checkin.test(low)) return { k: "checkin", said: q };
  if (RE.chaseSurvey.test(low)) return { k: "chase_survey", survey: "Q2 Engagement Pulse" };
  if (RE.diagnose.test(low)) return { k: "diagnose", team: findTeam(low, team) };
  if (RE.pulse.test(low)) return { k: "pulse", team: findTeam(low, team), topic: topicFrom(low, "how the team is doing") };
  if (RE.summary.test(low)) return { k: "summary" };

  if (RE.milestone.test(low)) {
    const p = low.match(/for ([a-z]+)/);
    return { k: "milestone", person: titleCase(p?.[1] ?? "your teammate"), milestone: /certif/.test(low) ? "certification" : "work anniversary" };
  }
  if (RE.writeup.test(low)) return { k: "writeup", team: findTeam(low, team), subject: topicFrom(low, "what the team did") };
  if (RE.recognise.test(low)) {
    const m = low.match(/(?:to|for)\s+([a-z]+)/);
    return { k: "recognise", to: titleCase(m?.[1] ?? "your teammate") };
  }

  if (RE.advocacy.test(low)) return { k: "advocacy" };
  if (RE.share.test(low)) return { k: "share", platform: platformFrom(low) };
  if (RE.postTime.test(low)) return { k: "posttime", platform: platformFrom(low) };

  if (RE.logActivity.test(low)) return { k: "log_activity", activity: q.trim() };
  if (RE.adjustGoal.test(low)) return { k: "adjust_goal", metric: /step/.test(low) ? "daily steps" : "weekly activity" };
  if (RE.benefit.test(low)) return { k: "benefit" };

  if (RE.chaseAck.test(low)) return { k: "chase_ack", message: "Safety policy update" };
  if (RE.announce.test(low)) return { k: "announce", team: findTeam(low, team), subject: topicFrom(low, "the update") };
  if (RE.digest.test(low)) return { k: "digest" };

  if (RE.course.test(low)) return { k: "course" };
  if (RE.assignLearning.test(low)) return { k: "assign_learning", team: findTeam(low, team) };

  if (RE.money.test(low)) return { k: "money", question: q };
  if (RE.smalltalk.test(low.trim())) return { k: "smalltalk" };
  return { k: "policy" };
}

export const mockProvider: AiProvider = {
  name: "mock",
  available: true,

  async *stream(req: AiRequest): AsyncGenerator<AiChunk> {
    const q = [...req.messages].reverse().find((m) => m.role === "user")?.content ?? "";
    const role = (req.role ?? "employee") as Role;
    const allowed = new Set(toolsFor(role).map((t) => t.name));
    const has = (t: string) => allowed.has(t);
    const intent = detect(q, req.team);

    /** Refuse an action this role cannot take — with the real reason. */
    const deny = async function* (why: string): AsyncGenerator<AiChunk> {
      yield* streamText(why);
      yield { type: "done", grounding: "none" };
    };

    switch (intent.k) {
      /* ── Pillar 7 · One-to-One Help ───────────────────────── */
      case "help": {
        const turn = intake(q, "IN");
        const esc = escalate(turn.triage, UNSIGNED_POLICY);

        yield* streamText(turn.reflection);
        if (turn.question) yield* streamText(` ${turn.question}`);

        // Crisis resources are never gated on anything the model decided.
        const lines = crisisResources("IN").map((r) => `${r.label} — ${r.number} (${r.hours})`);
        yield* streamText(`\n\nWhatever this is, these are always here: ${lines.join(" · ")}.`);

        if (turn.triage.acute) {
          yield* streamText(`\n\n${esc.note}`);
        } else {
          const res = matchResources(turn.triage);
          if (res.length) yield* streamText(`\n\nIf it would help right now: ${res.map((r) => `${r.title} (${r.minutes} min)`).join(", ")}.`);
        }

        if (has("book_counsellor")) {
          yield proposeTool("book_counsellor", {
            provider: "EAP counsellor",
            when: "Next available",
            shareSummary: false,
            summary: "Nothing shared unless you say so",
          });
        }
        yield { type: "followups", items: ["Talk to a real person", "Just give me something to read"] };
        yield { type: "done", grounding: "none" };
        return;
      }

      /* ── Pillar 1 · Pulse ─────────────────────────────────── */
      case "checkin": {
        yield { type: "step", text: "Listening" };
        await sleep(280);
        const draft = draftCheckIn(intent.said);
        yield* streamText(
          `Got it. That reads as a ${draft.mood}/5 week${draft.themes.length ? `, mostly about ${draft.themes.map((t) => t.label.toLowerCase()).join(" and ")}` : ""}. ${
            draft.followUps[0] ?? "I'll log it as that unless you'd change it."
          }`,
        );
        yield proposeTool("log_mood_entry", {
          mood: `${draft.mood}/5`,
          themes: draft.themes.map((t) => t.label).join(", ") || "none detected",
          quote: draft.quote,
        });
        yield { type: "followups", items: draft.followUps.length ? draft.followUps : ["Change the score", "Add a note"] };
        yield { type: "done", grounding: "data" };
        return;
      }

      case "pulse": {
        if (!has("launch_pulse_survey")) {
          yield* deny("Launching a pulse is a manager and HR admin action, so I can't do that from your account. Tell your manager what should be asked — or I can help you word it.");
          return;
        }
        const audience = req.team ?? intent.team;
        const redirected = Boolean(req.team) && intent.team !== req.team && intent.team !== "All teams";
        yield { type: "step", text: "Reading the request" };
        await sleep(260);
        yield { type: "step", text: `Scoping the audience — ${audience}` };
        await sleep(300);
        yield { type: "step", text: "Drafting questions" };
        await sleep(320);
        yield* streamText(
          redirected
            ? `You can only survey **${audience}**, so I've scoped it there rather than ${intent.team}. Three questions on ${intent.topic}, open for 3 days. Nothing sends until you confirm.`
            : `Here's a 3-question pulse for **${audience}** on ${intent.topic}, open for 3 days. It respects quiet hours and the survey-fatigue limit. Nothing sends until you confirm.`,
        );
        yield proposeTool("launch_pulse_survey", {
          audience, topic: intent.topic, questions: draftMicroSurvey(intent.topic, "request"), duration: "3 days",
        });
        yield { type: "followups", items: ["Make it 2 questions", "Send it tomorrow morning"] };
        yield { type: "done", grounding: "data" };
        return;
      }

      case "diagnose": {
        if (!has("diagnose_anomaly")) { yield* deny("Diagnosing a team dip is a manager and admin action."); return; }
        const team = req.team ?? intent.team;
        yield { type: "step", text: `Checking ${team}'s own baseline` };
        await sleep(320);
        const anomaly = detectAnomaly(seedBaseline(team, "sentiment")) ?? detectAnomaly(seedBaseline(team, "responseRate"));
        if (!anomaly) {
          yield* streamText(`${team} is sitting inside its own normal range — nothing that looks like a real dip. I compare a team against itself rather than against other teams, so a consistently lower score isn't flagged as a problem.`);
          yield { type: "done", grounding: "data" };
          return;
        }
        yield* streamText(`${anomaly.explanation}\n\n${anomaly.suggestedAction.detail}`);
        yield proposeTool("diagnose_anomaly", {
          team, metric: anomaly.metric, explanation: anomaly.explanation,
          questions: draftMicroSurvey(anomaly.metric === "responseRate" ? "how things are going" : "workload and support", "anomaly"),
        });
        yield { type: "done", grounding: "data" };
        return;
      }

      case "chase_survey": {
        if (!has("chase_survey")) { yield* deny("Chasing survey responses is a manager and admin action."); return; }
        yield* streamText(`I'll remind only the people who haven't responded to **${intent.survey}** — in whichever channel each of them actually reads, and never inside quiet hours.`);
        yield proposeTool("chase_survey", { survey: intent.survey, count: 34, channel: "Per person — push, SMS or app" });
        yield { type: "done", grounding: "data" };
        return;
      }

      case "summary": {
        const comments = [
          "Workload has been relentless this month, we're two people down.",
          "Recognition has genuinely improved, my lead thanked me properly.",
          "Equipment on line 2 keeps stopping and nobody fixes it.",
          "Scheduling changes land too late to plan childcare.",
          "Workload is fine but I've no idea what growth looks like here.",
        ];
        yield { type: "step", text: "Reading responses" };
        await sleep(300);
        const sum = summariseWave(comments, 1);
        yield* streamText(
          `${sum.headline}\n\n${sum.themes.slice(0, 3).map((t) => `• ${t.label} — ${t.mentions} mentions, sentiment ${t.sentiment > 0 ? "+" : ""}${t.sentiment}`).join("\n")}\n\nIn their words: “${sum.quotes[0] ?? "—"}”`,
        );
        yield { type: "followups", items: ["Launch a follow-up pulse", "Which team is worst affected?"] };
        yield { type: "done", grounding: "data" };
        return;
      }

      /* ── Pillar 2 · Connect ───────────────────────────────── */
      case "writeup": {
        if (!has("write_post")) { yield* deny("Posting to the company feed on someone's behalf needs a manager or admin account."); return; }
        const text = composePost(`the ${intent.team} team hit a real milestone on ${intent.subject} and it is worth everyone seeing`);
        const mod = moderate(text);
        yield { type: "step", text: `Pulling the underlying ${intent.team} data` };
        await sleep(300);
        yield { type: "step", text: "Drafting and checking it" };
        await sleep(280);
        yield* streamText(`Here's a draft built from the ${intent.team} data. It passed moderation, so it's ready once you're happy with it.`);
        yield proposeTool("write_post", {
          channel: "Company feed", source: `${intent.team} · ${intent.subject}`, text,
          moderation: mod.risk === "none" ? "Passed" : `Flagged: ${mod.reasons.join(", ")}`,
        });
        yield { type: "done", grounding: "data" };
        return;
      }

      case "milestone": {
        if (!has("schedule_milestone_post")) { yield* deny("Scheduling posts needs a manager or admin account."); return; }
        yield* streamText(`I spotted ${intent.person}'s ${intent.milestone} coming up. Here's a post ready for that morning — confirm and I'll schedule it.`);
        yield proposeTool("schedule_milestone_post", {
          person: intent.person, milestone: intent.milestone, when: "That morning, 09:00",
          text: composePost(`congratulations to ${intent.person} on their ${intent.milestone}, thank you for everything you bring to the team`),
        });
        yield { type: "done", grounding: "data" };
        return;
      }

      case "recognise": {
        if (!has("give_recognition")) { yield* deny("I can't post recognition from your account. Open Recognition and I'll help you word it there."); return; }
        yield* streamText(`I've drafted recognition for **${intent.to}**. Change anything you'd like, then confirm to post it.`);
        yield proposeTool("give_recognition", {
          to: intent.to, value: "Ownership",
          message: `${intent.to} — thank you for the way you handled this. It made a real difference to the team.`,
        });
        yield { type: "done", grounding: "data" };
        return;
      }

      /* ── Pillar 3 · Amplify ───────────────────────────────── */
      case "share": {
        const cap = draftCaption("Our team shipped a change that cuts onboarding time in half.", "warm", intent.platform);
        const gate = canAutoMirror(intent.platform);
        yield* streamText(`Here's a caption in your own voice for ${intent.platform}.\n\n“${cap.text}”\n\n${gate.reason}`);
        if (has("share_to_social")) {
          yield proposeTool("share_to_social", {
            platform: intent.platform, caption: cap.text,
            bestTime: `${String(bestTimeToPost(intent.platform).hour).padStart(2, "0")}:00`,
          });
        }
        yield { type: "done", grounding: "data" };
        return;
      }

      case "advocacy": {
        if (!has("queue_for_advocacy")) { yield* deny("Building an advocacy queue is an HR or marketing admin action."); return; }
        const card = buildAdvocacyCard("p1", "Our team shipped a change that cuts onboarding time in half.", ["LinkedIn", "X"]);
        yield* streamText(`I've built the advocacy card — two caption options per platform and a suggested send time. Employees still opt in individually; nothing posts under anyone's name automatically.`);
        yield proposeTool("queue_for_advocacy", {
          title: card.summary, platforms: card.platforms.join(", "),
          captions: card.captions.slice(0, 2).map((c) => c.text), captionCount: card.captions.length,
          bestTime: `${String(card.suggestedHour).padStart(2, "0")}:00`,
        });
        yield { type: "done", grounding: "data" };
        return;
      }

      case "posttime": {
        const t = bestTimeToPost(intent.platform);
        yield* streamText(`${t.reason} Second-best windows: ${t.alternatives.map((h) => `${String(h).padStart(2, "0")}:00`).join(", ") || "none"}.`);
        yield { type: "done", grounding: "data" };
        return;
      }

      /* ── Pillar 4 · Thrive ────────────────────────────────── */
      case "log_activity": {
        yield* streamText(`Logged that as today's activity — confirm and it counts toward your week.`);
        yield proposeTool("log_activity", { activity: intent.activity, when: "Today", challenge: "Your weekly goal" });
        yield { type: "done", grounding: "data" };
        return;
      }

      case "adjust_goal": {
        yield* streamText(`Happy to change it. I've set a target about 15% above what you've actually been hitting — enough to notice, not enough to give up on.`);
        yield proposeTool("adjust_goal", { metric: intent.metric, from: "8,000", to: "9,200", reason: "About 15% above your recent average" });
        yield { type: "done", grounding: "data" };
        return;
      }

      case "benefit": {
        yield* streamText(`You haven't used the dental add-on this year and enrolment closes in 21 days. I can book a call with benefits support — nothing is shared beyond the fact that you asked about it.`);
        yield proposeTool("book_benefit_call", { benefit: "Dental add-on", reason: "Unused, enrolment closes in 21 days" });
        yield { type: "done", grounding: "data" };
        return;
      }

      case "money": {
        const tips = financialTips("mid", "IN", intent.question);
        if ("refused" in tips) {
          yield* streamText(tips.refused);
          yield { type: "done", grounding: "none" };
          return;
        }
        const t = tips[0];
        yield* streamText(`${t.title}. ${t.body}\n\n${t.disclaimer} ${t.handoff}`);
        yield { type: "followups", items: ["Book a call with benefits", "How do EPF and NPS differ?"] };
        yield { type: "done", grounding: "data" };
        return;
      }

      /* ── Pillar 5 · Broadcast ─────────────────────────────── */
      case "announce": {
        if (!has("draft_announcement")) { yield* deny("Authoring announcements needs a manager or HR admin account."); return; }
        const audience = req.team ?? intent.team;
        const body = simplify(
          `All ${audience} colleagues must review the updated requirements for ${intent.subject} before your next shift. Supervisors will confirm you have read it. Speak to your supervisor if anything is unclear.`,
          "simple",
        );
        const r = readability(body);
        yield { type: "step", text: "Drafting in your company tone" };
        await sleep(300);
        yield { type: "step", text: `Checking reading level — grade ${r.grade}` };
        await sleep(260);
        yield* streamText(`Drafted for **${audience}** at grade ${r.grade} (${r.band}). It sits in pending approval — an AI-assisted draft can't send itself.`);
        yield proposeTool("draft_announcement", { audience, priority: "Critical", text: body, readingLevel: `Grade ${r.grade} · ${r.band}` });
        yield { type: "done", grounding: "data" };
        return;
      }

      case "chase_ack": {
        if (!has("chase_acknowledgement")) { yield* deny("Chasing acknowledgement needs a manager or HR admin account."); return; }
        yield* streamText(`I'll remind only the people who haven't confirmed, in the channel each of them actually reads. Critical messages ignore the fatigue limit, so this reaches everyone outstanding.`);
        yield proposeTool("chase_acknowledgement", { message: intent.message, count: 62, channel: "Per person", critical: "Yes" });
        yield { type: "done", grounding: "data" };
        return;
      }

      case "digest": {
        yield* streamText(
          weeklyDigest([
            { title: "Updated PPE requirements for Plant 3", when: "Mon", priority: "critical" },
            { title: "Q2 engagement results are out", when: "Wed" },
            { title: "New shift-swap process", when: "Thu" },
          ]),
        );
        yield { type: "done", grounding: "data" };
        return;
      }

      /* ── Pillar 6 · Grow ──────────────────────────────────── */
      case "course": {
        if (!has("make_course")) { yield* deny("Creating courses needs a manager or admin account."); return; }
        const sample = `Lockout Tagout Procedure
Before any maintenance, isolate the machine from all energy sources. Every worker must apply a personal lock. Locks are never removed by anyone other than the person who applied them.
Verification
After isolating, attempt a start to confirm the machine cannot run. Record the check in the log within 15 minutes.`;
        yield { type: "step", text: "Reading the document" };
        await sleep(340);
        yield { type: "step", text: "Splitting into modules and drafting questions" };
        await sleep(380);
        const course = generateCourse(sample, "Lockout Tagout");
        yield* streamText(
          `I've drafted **${course.title}** — ${course.modules.length} module${course.modules.length === 1 ? "" : "s"}, ${course.totalMinutes} minutes, with ${course.quiz.length} quiz question${course.quiz.length === 1 ? "" : "s"}.${
            course.safetyCritical ? " This is safety-critical content, so it stays a draft until a named person reviews it." : ""
          }`,
        );
        yield proposeTool("make_course", {
          title: course.title, modules: course.modules.length, questions: course.quiz.length,
          minutes: course.totalMinutes, reviewNote: course.warnings[0] ?? "Draft — needs human review before publishing",
        });
        yield { type: "done", grounding: "data" };
        return;
      }

      case "assign_learning": {
        if (!has("assign_learning")) { yield* deny("Assigning learning needs a manager or admin account."); return; }
        const team = req.team ?? intent.team;
        yield* streamText(`${team} flagged equipment training as a gap in their last check-in, so that's the obvious path. Everyone assigned gets a note explaining why — being enrolled with no explanation reads as a punishment.`);
        yield proposeTool("assign_learning", {
          path: "Equipment handling refresher", audience: team,
          because: "Pulse flagged equipment training as a recurring gap for this team",
          note: "Your team raised equipment training in the last check-in, so here's a short refresher — about 12 minutes.",
        });
        yield { type: "done", grounding: "data" };
        return;
      }

      case "smalltalk": {
        yield* streamText("I'm here — ask me about a policy, or tell me what you'd like done.");
        yield { type: "followups", items: ["How many paid leaves do I get?", "What's our WFH policy?"] };
        yield { type: "done", grounding: "none" };
        return;
      }

      /* ── grounded policy answer (the safe default) ────────── */
      default: {
        yield { type: "step", text: "Searching your company's documents" };
        await sleep(300);
        const passages = retrieve(q);
        if (!isGrounded(passages)) {
          yield { type: "step", text: "No confident match" };
          await sleep(200);
          yield* streamText(
            "I couldn't find that in your company's approved documents, so I'd rather not guess — policy answers are only as good as their source. I've logged the question for the People team.",
          );
          yield { type: "done", grounding: "none" };
          return;
        }
        yield { type: "step", text: `Reading ${passages.length} document${passages.length > 1 ? "s" : ""}` };
        await sleep(260);
        const { answers: curated } = await import("@/lib/knowledge");
        const hit = curated.find((a) => a.keywords.some((k) => matchesKeyword(q, k)));
        yield* streamText(hit ? hit.answer : `From ${passages[0].article.title}: ${passages[0].snippet}`);
        yield { type: "citations", citations: toCitations(passages) };
        yield { type: "followups", items: hit ? ["Where is this written down?", "Who approves it?"] : ["Show me the full policy"] };
        yield { type: "done", grounding: "grounded" };
        return;
      }
    }
  },
};
