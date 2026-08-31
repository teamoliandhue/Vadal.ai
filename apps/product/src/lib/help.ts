/**
 * One-to-One Help — Pillar 7 (route /product/help).
 *
 * "A private first door to support, with a real person always one step away."
 *
 * This file holds only the non-clinical furniture: EAP provider details, the
 * self-serve library, and the workspace's escalation policy record. All triage,
 * crisis detection and handoff logic lives in lib/ai/engines/support, where the
 * launch blocker is enforced.
 *
 * The brief treats clinical, legal and HR sign-off as a hard blocker on launch.
 * POLICY below is deliberately unsigned, so the product behaves the way it must
 * before that review happens: crisis resources always visible, a human always
 * reachable, and no third-party notification of any kind.
 */
import type { EscalationPolicy } from "./ai/engines/support";

export const POLICY: EscalationPolicy = {
  clinicalReviewer: "",
  legalReviewer: "",
  signedOn: "",
  crisisResponder: null,
  notifyResponderOnAcuteRisk: false,
  region: "IN",
};

export type Counsellor = {
  id: string; name: string; credentials: string; languages: string[];
  nextAvailable: string; modes: ("video" | "phone" | "in person")[];
  img: string;
  /**
   * What people actually come to them with.
   *
   * Choosing a therapist from three names and three qualifications is not a
   * choice anyone can make — the credential line is near-identical across all
   * of them and tells you nothing about whether this is the person for what you
   * are carrying. Specialism is the real decision criterion and it was missing.
   */
  specialisms: string[];
  /** Their own words. One sentence, so the page is not three identical rows. */
  approach: string;
  years: number;
};

export const counsellors: Counsellor[] = [
  {
    id: "c1", name: "Dr. Anjali Menon", credentials: "Clinical Psychologist · RCI-registered",
    languages: ["English", "हिन्दी", "മലയാളം"], nextAvailable: "Today, 6:00 PM", modes: ["video", "phone"],
    img: "/avatars/user-7.svg", years: 12,
    specialisms: ["Anxiety", "Burnout", "Sleep"],
    approach: "I work best with people who feel they should be coping and are quietly not.",
  },
  {
    id: "c2", name: "Rahul Iyer", credentials: "Counselling Psychologist · M.Phil",
    languages: ["English", "हिन्दी", "தமிழ்"], nextAvailable: "Tomorrow, 11:00 AM", modes: ["video", "phone", "in person"],
    img: "/avatars/user-2.svg", years: 8,
    specialisms: ["Work conflict", "Confidence", "Life changes"],
    approach: "Practical and direct. We will spend as much time on what you do next as on how you feel.",
  },
  {
    id: "c3", name: "Sana Qureshi", credentials: "Counselling Psychologist · M.A.",
    languages: ["English", "हिन्दी", "मराठी"], nextAvailable: "Thursday, 4:30 PM", modes: ["video", "phone"],
    img: "/avatars/user-5.svg", years: 6,
    specialisms: ["Relationships", "Grief", "Money stress"],
    approach: "Slow and unhurried. Some things need to be said several times before they make sense.",
  },
];

/**
 * The openers.
 *
 * The screen's entire job is to lower the cost of asking for help, and it
 * opened with an empty text box and the words "start wherever you want, there
 * is no form". For someone who cannot yet name what is wrong — which is most
 * people, most of the time — a blank field is the single hardest thing you can
 * put in front of them.
 *
 * These are deliberately first-person sentences rather than categories.
 * "Anxiety" and "Depression" are labels people will not apply to themselves at
 * the moment they most need to; "I don't know what's wrong, I just feel off"
 * is a sentence someone will recognise. Tapping one fills the box rather than
 * sending it, so the first words on the screen are still theirs to change.
 */
export const WAYS_IN = [
  "I'm not sleeping",
  "I think I'm burnt out",
  "I feel anxious most days",
  "Something at home is hard right now",
  "Someone here is making work difficult",
  "Money is keeping me up at night",
  "I don't know what's wrong, I just feel off",
];

/** The same door, for the people who are not here for themselves. */
export const WAYS_IN_OTHER = [
  "A colleague has seemed really down",
  "Someone on my team is struggling and I don't know what to say",
  "Somebody said something that worried me",
  "I think a friend at work is in trouble",
];

/**
 * What actually happens if you book.
 *
 * Booking a counsellor is a large step and the page asked for it with a button
 * and no explanation. Most of what stops people is not stigma, it is not
 * knowing the shape of the thing: how long, who sees it, what it costs, whether
 * they can leave.
 */
export const SESSION_FACTS: { q: string; a: string }[] = [
  { q: "How long is it?", a: "Fifty minutes. The first one is mostly you talking and them listening." },
  { q: "What does it cost me?", a: "Nothing. Eight sessions a year are already paid for as part of your package." },
  { q: "Who finds out?", a: "Nobody. Your employer is billed for the service and never told who used it — not your manager, not HR, not the people who booked the contract." },
  { q: "Is it recorded?", a: "No. Nothing you say is written down here, and the counsellor's own notes are theirs under their professional obligations, not the company's." },
  { q: "What if it isn't right?", a: "You can stop, or ask for a different counsellor, at any point and without giving a reason. Changing your mind does not use up a session." },
];

export const eap = {
  provider: "1to1help",
  helpline: "1800 258 8999",
  hours: "24/7, every day",
  sessionsIncluded: 8,
  note: "Free and confidential. Your employer is billed for the service, never told who used it.",
};

/** Employee-controlled history — the person can see and delete their own. */
export type Conversation = { id: string; when: string; preview: string; band: string };

export const myConversations: Conversation[] = [];

export const promises = [
  "Nothing you say here reaches your manager or HR.",
  "You can delete this conversation, and everything in it, at any time.",
  "A real person is one tap away on every screen — you never have to go through me first.",
  "I am not a clinician and will never pretend to be one.",
];
