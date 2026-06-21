/* Section registry for not-yet-built nav destinations — drives the [section]
   coming-soon route + keeps labels in sync with the sidebar (Shell RAIL). */
import {
  BookOpen, FolderKanban, HeartHandshake,
  Megaphone, Settings, UsersRound, type LucideIcon,
} from "lucide-react";

export type SectionMeta = {
  label: string; // must match the sidebar RAIL label exactly (drives active state)
  Icon: LucideIcon;
  tagline: string;
  bullets: string[];
  ask: string;
};

export const SECTIONS: Record<string, SectionMeta> = {
  recognition: {
    label: "Recognition", Icon: HeartHandshake,
    tagline: "Make appreciation flow — give kudos, run values campaigns, and close cold zones.",
    bullets: ["Peer & manager recognition", "Values-tagged kudos & leaderboards", "Coverage & cold-zone insights"],
    ask: "What will the Recognition section do?",
  },
  campaigns: {
    label: "Campaigns", Icon: Megaphone,
    tagline: "Launch and measure interventions — wellness weeks, 1:1 sprints, nudges.",
    bullets: ["Targeted, scheduled campaigns", "Reach, participation & lift tracking", "AI-suggested next campaign"],
    ask: "What can I do with Campaigns?",
  },
  managers: {
    label: "Manager hub", Icon: UsersRound,
    tagline: "Everything a manager needs to lift their team — actions, 1:1s, recognition.",
    bullets: ["Team health & at-risk reports", "1:1 cadence & AI prep", "Coaching nudges"],
    ask: "What's in the Manager hub?",
  },
  cases: {
    label: "Cases", Icon: FolderKanban,
    tagline: "Track and resolve people issues — from flight-risk follow-ups to ER cases.",
    bullets: ["Cases from Pulse actions & risks", "Owner, SLA & status tracking", "Confidential by design"],
    ask: "How will Cases work?",
  },
  knowledge: {
    label: "Knowledge", Icon: BookOpen,
    tagline: "The company brain — policies, how-tos and answers, powered by Vadal AI.",
    bullets: ["Searchable policy & HR knowledge", "AI answers with sources", "Gap detection from real questions"],
    ask: "What will Knowledge cover?",
  },
  settings: {
    label: "Settings", Icon: Settings,
    tagline: "Workspace, people, integrations and permissions — all in one place.",
    bullets: ["Org & workspace settings", "Roles & permissions", "Integrations & data controls"],
    ask: "What settings will be available?",
  },
};
