/**
 * Proves the feature registry is honest.
 *
 * FEATURES claims that each AI feature in the brief is implemented by a named
 * export in a named module. This resolves every one of those claims against the
 * real modules. A feature that is listed but not wired shows up as `missing`,
 * which is the only way "all the AI features are built" can be a fact rather
 * than a sentence in a status update.
 */
import { FEATURES, type FeatureStatus } from "./features";
import { TOOLS } from "./tools";

import * as text from "./engines/text";
import * as signals from "./engines/signals";
import * as personalize from "./engines/personalize";
import * as timing from "./engines/timing";
import * as survey from "./engines/survey";
import * as learning from "./engines/learning";
import * as wellbeing from "./engines/wellbeing";
import * as support from "./engines/support";
import * as advocacy from "./engines/advocacy";
import * as onboarding from "./engines/onboarding";
import * as retrieveMod from "./retrieve";
import * as mockMod from "./mock";
import * as toolsMod from "./tools";

const MODULES: Record<string, Record<string, unknown>> = {
  "engines/text": text,
  "engines/signals": signals,
  "engines/personalize": personalize,
  "engines/timing": timing,
  "engines/survey": survey,
  "engines/learning": learning,
  "engines/wellbeing": wellbeing,
  "engines/support": support,
  "engines/advocacy": advocacy,
  "engines/onboarding": onboarding,
  retrieve: retrieveMod,
  mock: mockMod,
  tools: toolsMod,
};

export type Verification = {
  total: number;
  wired: number;
  missing: { id: string; module: string; entry: string }[];
  blocked: { id: string; reason: string }[];
  byPillar: { pillar: string; total: number; agentic: number; copilot: number; screen: number; engineOnly: number }[];
  agenticTools: { registered: number; declared: number; unregistered: string[] };
  ok: boolean;
};

function resolves(f: FeatureStatus): boolean {
  // Tool entries are registry keys, not module exports.
  if (f.module === "tools" && f.entry in TOOLS) return true;
  const mod = MODULES[f.module];
  if (!mod) return false;
  return f.entry in mod;
}

export function verifyFeatures(): Verification {
  const missing = FEATURES.filter((f) => !resolves(f)).map((f) => ({ id: f.id, module: f.module, entry: f.entry }));

  const pillars = [...new Set(FEATURES.map((f) => f.pillar))];
  const byPillar = pillars.map((pillar) => {
    const fs = FEATURES.filter((f) => f.pillar === pillar);
    return {
      pillar,
      total: fs.length,
      agentic: fs.filter((f) => f.agentic).length,
      copilot: fs.filter((f) => f.surface === "copilot").length,
      screen: fs.filter((f) => f.surface === "screen").length,
      engineOnly: fs.filter((f) => f.surface === "engine-only").length,
    };
  });

  // Every agentic feature must correspond to a registered tool, and every
  // registered tool must be claimed by a feature — drift in either direction
  // means the registry and the brief have come apart.
  const declaredTools = FEATURES.filter((f) => f.agentic && f.module === "tools").map((f) => f.entry);
  const registered = Object.keys(TOOLS);
  const unregistered = [
    ...declaredTools.filter((t) => !registered.includes(t)).map((t) => `declared but not registered: ${t}`),
    ...registered.filter((t) => !declaredTools.includes(t)).map((t) => `registered but not declared: ${t}`),
  ];

  return {
    total: FEATURES.length,
    wired: FEATURES.length - missing.length,
    missing,
    blocked: FEATURES.filter((f) => f.blocked).map((f) => ({ id: f.id, reason: f.blocked! })),
    byPillar,
    agenticTools: { registered: registered.length, declared: declaredTools.length, unregistered },
    ok: missing.length === 0 && unregistered.length === 0,
  };
}
