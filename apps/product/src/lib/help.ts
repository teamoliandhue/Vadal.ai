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
};

export const counsellors: Counsellor[] = [
  { id: "c1", name: "Dr. Anjali Menon", credentials: "Clinical Psychologist · RCI-registered", languages: ["English", "हिन्दी", "മലയാളം"], nextAvailable: "Today, 6:00 PM", modes: ["video", "phone"] },
  { id: "c2", name: "Rahul Iyer", credentials: "Counselling Psychologist · M.Phil", languages: ["English", "हिन्दी", "தமிழ்"], nextAvailable: "Tomorrow, 11:00 AM", modes: ["video", "phone", "in person"] },
  { id: "c3", name: "Sana Qureshi", credentials: "Counselling Psychologist · M.A.", languages: ["English", "हिन्दी", "मराठी"], nextAvailable: "Thursday, 4:30 PM", modes: ["video", "phone"] },
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
