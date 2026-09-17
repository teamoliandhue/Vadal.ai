/**
 * Posting rights and moderation — the per-workspace rules.
 *
 * From the 16 Sep meeting: every tenant decides who may post and who may share
 * (some want everyone, some want leadership only), and nothing harmful should
 * reach the feed before a person has looked at it. These are the admin's
 * settings; lib/ai/engines/moderation applies them to a post.
 */
import type { Role } from "./auth";
import { ROLE_RANK } from "./access";

export type Audience = "everyone" | "managers" | "admins";
export type Sensitivity = "relaxed" | "standard" | "strict";

export type PostingPolicy = {
  /** Post in the company feed (communities are governed by membership). */
  feed: Audience;
  /** Post in #company — the announcement channel. */
  announcements: Audience;
  /** Start a community. */
  communities: Audience;
  /** Share a post outside the company through Amplify. */
  share: Audience;
  /** Read the words of a post before it publishes. */
  checkText: boolean;
  /** Look at an attached photo before it publishes. */
  checkPhotos: boolean;
  /** Flag phone numbers, email addresses and ID numbers. */
  personalData: boolean;
  sensitivity: Sensitivity;
};

export const DEFAULT_POLICY: PostingPolicy = {
  feed: "everyone",
  announcements: "admins",
  communities: "everyone",
  share: "everyone",
  checkText: true,
  checkPhotos: true,
  personalData: true,
  sensitivity: "standard",
};

const MIN_RANK: Record<Audience, number> = { everyone: 0, managers: ROLE_RANK.manager, admins: ROLE_RANK.admin };

export function allowed(audience: Audience, role: Role | null | undefined): boolean {
  return ROLE_RANK[role ?? "employee"] >= MIN_RANK[audience];
}

export const AUDIENCE_LABEL: Record<Audience, string> = {
  everyone: "Everyone",
  managers: "Managers & up",
  admins: "Admins only",
};

/** For sentences: "open to managers and admins in this workspace". */
export const AUDIENCE_PHRASE: Record<Audience, string> = {
  everyone: "everyone",
  managers: "managers and admins",
  admins: "admins",
};

export const SENSITIVITY_LABEL: Record<Sensitivity, { label: string; hint: string }> = {
  relaxed: { label: "Relaxed", hint: "Only threats and posts that single out a group are held." },
  standard: { label: "Standard", hint: "Threats are held; harsh words and personal details get a nudge first." },
  strict: { label: "Strict", hint: "Anything flagged is held for a person to look at." },
};

/** Moderation is an admin's job (lib/access: "Moderate content — admin only"). */
export const canModerate = (role: Role | null | undefined) => ROLE_RANK[role ?? "employee"] >= ROLE_RANK.admin;
