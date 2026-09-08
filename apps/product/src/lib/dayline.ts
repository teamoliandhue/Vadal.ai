/**
 * One day with Vadal, seen from both sides.
 *
 * Home's job for a first-time visitor is to make the product MEAN something in
 * a few seconds, with every feature one click away. Two designs failed at it
 * before this one, for the same reason: a grid of sixteen tiles is a sitemap and
 * a stack of preview cards is a dashboard. Both hold content; neither says
 * anything.
 *
 * The positioning is "human pulse × daily ritual", and that is a picture: a day.
 * Above the line, the employee's ritual — check in, a kudos lands, a lesson at
 * lunch, a door that is open if the day was heavy. Below it, what the people
 * team hears — the score updates, sentiment clusters, a manager sees who needs
 * attention. The assistant is the line itself, because it runs through all of
 * it.
 *
 * Every beat here is a section that exists in NAV. `live` is a real figure from
 * the same data that section renders, so the day is the product, not a story
 * about it.
 */
import type { LucideIcon } from "lucide-react";
import {
  BarChart3, BookOpen, ClipboardList, FolderKanban, Gauge, GraduationCap, HeartHandshake,
  HeartPulse, LifeBuoy, Megaphone, Newspaper, Radio, Share2, Smile, Sun, UsersRound,
} from "lucide-react";
import { experienceScore } from "./experience";
import { me, managerSummary, myRecognition } from "./data";
import { retention } from "./grow";
import { reviewQueue } from "./ai/engines/learning";
import { sentiment, surveys } from "./listen";
import { crisisResources } from "./ai/engines/support";
import { myMoments, advocacyCampaign } from "./amplify";
import { cases } from "./cases";

export type Lane = "you" | "team";

export type Beat = {
  /** Wall-clock label. The day has to read as a day. */
  time: string;
  lane: Lane;
  section: string;
  /** Fits an eight-across column where the full name does not. Optional. */
  short?: string;
  href: string;
  icon: LucideIcon;
  /** What happens, in one line, in the second person. */
  moment: string;
  /** A real figure from that section's own data, when there is one worth showing. */
  live?: string;
};

export type Part = { label: string; span: string; beats: Beat[] };

const ex = experienceScore();
const due = reviewQueue(retention, 3).length;
const crisis = crisisResources("IN")[0];

/** Five parts of the day. Each column holds the beats that fall in it. */
export const DAY: Part[] = [
  {
    label: "Morning", span: "07–09",
    beats: [
      { time: "07:40", lane: "you", section: "Home", href: "/product/myday", icon: Sun,
        moment: "Check in — five seconds, private to you.", live: `${me.streak}-day streak` },
      { time: "08:10", lane: "you", section: "Feed", href: "/product/feed", icon: Newspaper,
        moment: "What happened overnight, and who was thanked for it." },
      { time: "08:00", lane: "team", section: "Pulse", href: "/product", icon: Gauge,
        moment: "One score from every listening surface, recomputed.", live: `Health ${ex.score}` },
    ],
  },
  {
    label: "Mid-morning", span: "09–11",
    beats: [
      { time: "09:15", lane: "you", section: "Recognition", href: "/product/recognition", icon: HeartHandshake,
        moment: "Someone noticed your work, and said so where others can see.", live: `${myRecognition.length} for you this week` },
      { time: "10:30", lane: "you", section: "Knowledge", href: "/product/knowledge", icon: BookOpen,
        moment: "“How many leave days do I have?” — answered, with the source." },
      { time: "09:00", lane: "team", section: "Sentiment", href: "/product/sentiment", icon: Smile,
        moment: "What people are actually saying, clustered and anonymised.", live: `${sentiment.positive}% positive` },
      { time: "10:00", lane: "team", section: "Always-on listening", short: "Listening", href: "/product/listening", icon: Radio,
        moment: "Signals between surveys, not once a quarter." },
    ],
  },
  {
    label: "Midday", span: "11–14",
    beats: [
      { time: "12:30", lane: "you", section: "Grow", href: "/product/grow", icon: GraduationCap,
        moment: "A four-minute lesson on the break — and what you were about to forget.", live: `${due} due for review` },
      { time: "11:00", lane: "team", section: "Surveys", href: "/product/surveys", icon: ClipboardList,
        moment: "Micro-surveys that adapt to the answers as they come in.", live: `${surveys.filter((s) => s.status === "live").length} live` },
      { time: "13:00", lane: "team", section: "Manager hub", href: "/product/managers", icon: UsersRound,
        moment: "A manager sees who needs attention before the 1:1, not after.", live: `${managerSummary.withActions} actions open` },
    ],
  },
  {
    label: "Afternoon", span: "14–17",
    beats: [
      { time: "14:00", lane: "you", section: "Amplify", href: "/product/amplify", icon: Share2,
        moment: "A moment of yours worth the outside seeing, drafted in your voice.", live: `${myMoments.length} of yours to share` },
      { time: "16:30", lane: "you", section: "Thrive", href: "/product/thrive", icon: HeartPulse,
        moment: "Pay landed. The ₹3,000 you meant to set aside, moved now." },
      { time: "14:30", lane: "team", section: "Campaigns", href: "/product/campaigns", icon: Megaphone,
        moment: "Run a programme and see what it actually moved.", live: `${advocacyCampaign.shares} shares this campaign` },
      { time: "15:30", lane: "team", section: "Analytics", href: "/product/analytics", icon: BarChart3,
        moment: "Slice it by team, tenure, site or shift." },
    ],
  },
  {
    label: "Evening", span: "17–23",
    beats: [
      { time: "21:00", lane: "you", section: "One-to-One Help", short: "1:1 Help", href: "/product/help", icon: LifeBuoy,
        moment: "If the day was heavy — a door that is always open, and never routes through AI first.", live: `${crisis.label.split("(")[0].trim()} · ${crisis.number}` },
      { time: "17:00", lane: "team", section: "Cases", href: "/product/cases", icon: FolderKanban,
        moment: "Something confidential, handled with an audit trail.", live: `${cases.filter((c) => c.status !== "Resolved").length} open` },
    ],
  },
];

