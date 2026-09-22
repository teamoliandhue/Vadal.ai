/* Link — the two capabilities that had no screen (Enterprise AI platform, spec 058).

   Link promises HR Integrations · Data Sync · Open API · Unified Data. The
   connections and the API were built. The two in the middle of that list are
   the ones an HR admin is actually asked about in a review:

   · DATA SYNC. A connection that is "Connected" says nothing about whether
     last night's run worked. So: every field, which system owns it, which way
     it moves, and — the part products hide — who wins when two systems
     disagree. Then the last runs, and every record that failed, by name, with
     the fix.
   · UNIFIED DATA. One workforce record behind every module. That is only a
     promise worth making if you can see the record: what is in it, how much of
     it is filled in, which module reads which field, and what breaks when a
     field is blank.

   Deterministic demo data. */

export const PEOPLE = 12480;

export type FieldSource = "Darwinbox" | "Microsoft Entra ID" | "Vadal" | "The person";
export type FieldMode = "Read" | "Write" | "Both";

export type RecordField = {
  key: string;
  label: string;
  /** the system that owns the value — the one that wins a disagreement */
  source: FieldSource;
  mode: FieldMode;
  /** modules that read this field */
  readBy: string[];
  /** people where it is blank */
  missing: number;
  /** what a blank one costs */
  breaks?: string;
  /** the person chooses whether to set it — a blank one is not a gap, so it is never shown as a shortfall */
  optional?: boolean;
  note?: string;
};

export const recordFields: RecordField[] = [
  { key: "name", label: "Name", source: "Darwinbox", mode: "Read", readBy: ["Everywhere"], missing: 0 },
  { key: "preferred", label: "Preferred name", source: "The person", mode: "Write", readBy: ["Social", "Kudos", "For you"], missing: 9840, optional: true, note: "Only set if someone chooses to. A blank one is not a gap." },
  { key: "email", label: "Work email", source: "Darwinbox", mode: "Read", readBy: ["Sign-in", "Onboard", "Flow"], missing: 212, breaks: "They sign in with a one-time code instead — by design for frontline roles." },
  { key: "mobile", label: "Personal mobile", source: "Darwinbox", mode: "Read", readBy: ["Listen", "Pulse", "Onboard"], missing: 486, breaks: "No WhatsApp or SMS reach. These are the people a survey never gets to." },
  { key: "manager", label: "Manager", source: "Darwinbox", mode: "Read", readBy: ["Manager hub", "Pulse", "Flow", "Insight"], missing: 38, breaks: "They are in nobody's team view, and team-scoped pulses skip them." },
  { key: "team", label: "Team", source: "Darwinbox", mode: "Read", readBy: ["Everywhere"], missing: 0 },
  { key: "site", label: "Site", source: "Darwinbox", mode: "Read", readBy: ["Insight", "Listen", "Launch"], missing: 4 },
  { key: "title", label: "Job title", source: "Darwinbox", mode: "Read", readBy: ["Onboard", "Alumni", "iLearn"], missing: 0 },
  { key: "type", label: "Employment type", source: "Darwinbox", mode: "Read", readBy: ["Insight", "Trust"], missing: 0, note: "Permanent, contract, apprentice. Decides which policies the desk quotes." },
  { key: "start", label: "Start date", source: "Darwinbox", mode: "Read", readBy: ["Onboard", "Journey", "Insight"], missing: 0 },
  { key: "shift", label: "Shift pattern", source: "Darwinbox", mode: "Read", readBy: ["Listen", "Pulse", "Campaigns"], missing: 1870, breaks: "Quiet hours fall back to the site default, so a night worker can be asked at 09:00." },
  { key: "language", label: "Language", source: "The person", mode: "Write", readBy: ["Listen", "Pulse", "Social", "SmartWork"], missing: 2140, optional: true, note: "Falls back to the site language until someone picks their own." },
  { key: "identity", label: "Sign-in identity", source: "Microsoft Entra ID", mode: "Read", readBy: ["Sign-in"], missing: 2212, breaks: "No SSO account — they use a one-time code. Matches the frontline count." },
  { key: "status", label: "Joiner / leaver status", source: "Microsoft Entra ID", mode: "Read", readBy: ["Onboard", "Alumni", "Trust"], missing: 0, note: "SCIM removes access the hour someone is deprovisioned." },
  { key: "consent", label: "Consent and opt-outs", source: "Vadal", mode: "Write", readBy: ["Listen", "Pulse", "Sentiment", "Nudge"], missing: 0, note: "Held in Vadal because it is about Vadal. It is never written back." },
];

export const fieldStats = {
  fields: recordFields.length,
  /** fields where a blank one actually costs something */
  withGaps: recordFields.filter((f) => f.breaks && f.missing > 0).length,
  people: PEOPLE,
  /** people with everything the product needs: manager, team, and one way to reach them */
  reachable: PEOPLE - 486,
};

/** What Vadal is allowed to write back into the systems of record. Stated, not implied. */
export const writeBack = {
  does: ["Preferred name, when the person sets one", "Language, when the person picks one", "Nothing else"],
  never: ["Pay, grade or band", "Performance or appraisal records", "Anything a person told Pulse, Listen or iThrive"],
};

/* ── sync runs ────────────────────────────────────────────────────── */
export type SyncPass = {
  id: string;
  when: string;
  source: string;
  created: number;
  updated: number;
  failed: number;
  note?: string;
};

export const syncPasses: SyncPass[] = [
  { id: "s1", when: "Today 07:10", source: "Darwinbox", created: 4, updated: 214, failed: 3, note: "Three records could not be matched — listed below." },
  { id: "s2", when: "Today 07:04", source: "Microsoft Entra ID", created: 4, updated: 61, failed: 0, note: "Two leavers deprovisioned; access removed the same minute." },
  { id: "s3", when: "Yesterday 07:10", source: "Darwinbox", created: 9, updated: 188, failed: 1 },
  { id: "s4", when: "Yesterday 07:04", source: "Microsoft Entra ID", created: 9, updated: 44, failed: 0 },
  { id: "s5", when: "Sat 07:10", source: "Darwinbox", created: 0, updated: 51, failed: 0, note: "Weekend run — payroll is quiet." },
];

export type SyncFailure = {
  id: string;
  who: string;
  team: string;
  field: string;
  why: string;
  fix: string;
  since: string;
};

export const syncFailures: SyncFailure[] = [
  {
    id: "f1", who: "Rakesh Yadav", team: "Plant Ops", field: "Manager",
    why: "The manager on the record left in July and has no replacement in Darwinbox.",
    fix: "Set a manager in Darwinbox. The next run picks it up — no import needed.", since: "6 days",
  },
  {
    id: "f2", who: "Two records, one person", team: "Logistics", field: "Employee ID",
    why: "The same person appears twice with different IDs, so neither record is trusted and both were held.",
    fix: "Merge them in Darwinbox. Vadal never merges people on its own.", since: "2 days",
  },
  {
    id: "f3", who: "Sunita Rao", team: "Support", field: "Personal mobile",
    why: "The number failed validation — ten digits expected, eleven given.",
    fix: "Correct it in Darwinbox, or she can add it herself in Settings.", since: "Today",
  },
];

export const syncStats = {
  cadence: "Nightly at 07:00 IST, and on demand",
  lastRun: "Today 07:10",
  changedYesterday: 214,
  failed: syncFailures.length,
  /** runs that finished clean in the last 30 days */
  cleanPct: 94,
};

/** Who wins when two systems hold different values — one rule, written down. */
export const conflictRules = [
  { field: "Anything from the HRIS", wins: "Darwinbox", why: "It is the system of record for employment. Vadal never argues with it." },
  { field: "Sign-in and joiner/leaver status", wins: "Microsoft Entra ID", why: "Access has to follow the identity provider, to the minute." },
  { field: "Preferred name and language", wins: "The person", why: "Nobody else should be deciding what you are called or what you read in." },
  { field: "Consent and opt-outs", wins: "Vadal", why: "It is consent for Vadal, so it lives here and is never overwritten by an import." },
];
