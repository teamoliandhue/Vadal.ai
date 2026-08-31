#!/usr/bin/env node
/**
 * Generates docs/AI-FEATURES.md from the registry.
 *
 * Written rather than hand-maintained because the hand-maintained version drifted
 * three separate ways in a single day: a feature pointed at a function the screen
 * had stopped calling, three shipped features were never registered at all, and
 * the published index still quoted counts from two weeks earlier. A list of what
 * is built is only worth having if it cannot say something the code does not.
 *
 *   node scripts/ai-features-md.mjs          # print
 *   node scripts/ai-features-md.mjs --write  # write ../../docs/AI-FEATURES.md
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const src = fs.readFileSync(path.join(here, "../src/lib/ai/features.ts"), "utf8");
const body = src.slice(src.indexOf("export const FEATURES"));

const RE = /\{\s*id:\s*"([^"]+)",\s*pillar:\s*"([^"]+)",\s*brief:\s*"((?:[^"\\]|\\.)*)",\s*module:\s*"([^"]+)",\s*entry:\s*"([^"]+)",\s*agentic:\s*(true|false),\s*surface:\s*"([^"]+)"(?:,\s*blocked:\s*"((?:[^"\\]|\\.)*)")?(?:,\s*wiredTo:\s*(null|"[^"]*"))?/g;

const unesc = (s) => s.replace(/\\"/g, '"').replace(/\\\\/g, "\\");
const rows = [...body.matchAll(RE)].map((m) => ({
  id: m[1], pillar: m[2], brief: unesc(m[3]), module: m[4], entry: m[5],
  agentic: m[6] === "true", surface: m[7],
  blocked: m[8] ? unesc(m[8]) : null,
  wiredTo: !m[9] || m[9] === "null" ? null : m[9].slice(1, -1),
}));

/* A component file usually names the part of the screen it draws, which is a
   better direction than the route alone when a pillar has a dozen features. */
const AREA = {
  Composer: "the caption composer", Programme: "Programme tab", Rail: "the right rail",
  Moments: "your own moments", Companion: "the companion", Counsellors: "Talk to a real person",
  Library: "the library", Challenges: "Challenges", Cohorts: "leaderboard groups",
};

/** Where a person meets it, derived from the real call site. */
function where(f) {
  if (!f.wiredTo) return "— not reachable —";

  if (f.wiredTo.startsWith("app/product/")) {
    const parts = f.wiredTo.split("/");
    const route = "/product/" + parts[2];
    const file = parts[parts.length - 1].replace(/\.tsx?$/, "");
    return AREA[file] ? route + " → " + AREA[file] : route;
  }

  if (f.wiredTo.includes("mock.ts") || f.wiredTo.includes("tools.ts")) {
    // The brief carries the trigger phrase for most agentic features, in quotes.
    const said = f.brief.match(/['‘’"“”]([^'‘’"“”]{8,})['‘’"“”]/);
    return said ? 'AI dock — ask: "' + said[1] + '"' : "AI dock — ask for it";
  }

  if (f.wiredTo.startsWith("app/api/")) return f.wiredTo.replace("app", "");
  return f.wiredTo;
}

function status(f) {
  if (f.blocked) return "🔴 **Blocked**";
  if (!f.wiredTo) return "🟡 **Not wired**";
  return "🟢 **Live**";
}

const live = rows.filter((f) => f.wiredTo && !f.blocked);
const blocked = rows.filter((f) => f.blocked);
const unwired = rows.filter((f) => !f.wiredTo);
const pillars = [...new Set(rows.map((f) => f.pillar))];

const L = [];
const p = (s = "") => L.push(s);

p("# AI features — what is built, and where to find it");
p();
p("> Generated from `apps/product/src/lib/ai/features.ts` by");
p("> `apps/product/scripts/ai-features-md.mjs`. **Do not edit by hand** — regenerate it:");
p("> ```bash");
p("> cd apps/product && node scripts/ai-features-md.mjs --write");
p("> ```");
p();
p("---");
p();
p("## The numbers");
p();
p("| | Count | Meaning |");
p("|---|---:|---|");
p(`| **Total in the brief** | **${rows.length}** | Every AI feature the product brief names |`);
p(`| 🟢 Live | ${live.length} | Implemented **and** reachable — a person can get to it today |`);
p(`| 🟡 Not wired | ${unwired.length} | Implemented, type-checked, and nothing calls it. No amount of clicking finds these |`);
p(`| 🔴 Blocked | ${blocked.length} | The brief itself blocks shipping — not our backlog |`);
p();
p(`> The live index counts **${live.length + blocked.length} reachable**, not ${live.length}: the ${blocked.length} blocked features *are* wired and`);
p("> do respond — they explain why they will not act. Reachable and shippable are different");
p("> questions, and this table answers the second one.");
p();
p(`**Work remaining: ${unwired.length} to wire.** Nothing is left to *build* — every one of the ${rows.length} has a`);
p("named, tested implementation. The gap is between *the code exists* and *a person can reach it*,");
p("which is not the same claim and was reported as the same claim until a call-site audit caught it.");
p();
p("### Why \"not wired\" is tracked separately");
p();
p("The registry originally proved only that each implementation **existed**. Thirteen features were");
p("exported, covered and invisible while it reported them as done. `scripts/ai-reachability.mjs`");
p("now recomputes reachability from real call sites, and `/api/ai/features` returns **500** if any");
p("claim stops being true — so this table cannot quietly rot.");
p();
p("---");
p();
p("## Where to find them");
p();
p("**Live index (searchable, filterable):**");
p("<https://claude.ai/code/artifact/16e363f1-ff85-4a69-b280-f535d599264b>");
p();
p("**Check it yourself:**");
p();
p("```bash");
p("cd apps/product");
p("node scripts/ai-reachability.mjs     # recompute reachability from call sites");
p("curl -s localhost:3005/api/ai/features | jq   # the product's own answer");
p("```");
p();
p("**Sign in as the right persona first** — role decides what exists, so much of this is invisible");
p("as an employee. Any of these at `/auth`, no password:");
p();
p("| Email | Who |");
p("|---|---|");
p("| `aarav@oliandhue.com` | Employee · desk |");
p("| `ravi@oliandhue.com` | Employee · frontline, Plant Ops |");
p("| `anita@oliandhue.com` | Manager · Design |");
p("| `sunita@oliandhue.com` | Manager · frontline, Night shift |");
p("| `priya@oliandhue.com` | HR admin — sees everything |");
p("| `ops@vadal.ai` | Super admin |");
p();
p("---");
p();
p("## By pillar");
p();

for (const pil of pillars) {
  const fs_ = rows.filter((f) => f.pillar === pil);
  const l = fs_.filter((f) => f.wiredTo && !f.blocked).length;
  const u = fs_.filter((f) => !f.wiredTo).length;
  const b = fs_.filter((f) => f.blocked).length;
  p(`### ${pil}`);
  p();
  p(`${fs_.length} features — ${l} live${u ? `, ${u} not wired` : ""}${b ? `, ${b} blocked` : ""}`);
  p();
  p("| Feature | Status | Where | Implementation |");
  p("|---|---|---|---|");
  for (const f of fs_) {
    const brief = f.brief.replace(/\|/g, "\\|");
    const tag = f.agentic ? " ⚡" : "";
    p(`| ${brief}${tag} | ${status(f)} | ${where(f).replace(/\|/g, "\\|")} | \`${f.module}.${f.entry}\` |`);
  }
  p();
}

p("⚡ = agentic: it proposes an action, and every one confirms before it does anything and can be undone.");
p();
p("---");
p();
p(`## The ${unwired.length} still to wire`);
p();
p("Each has a working implementation and no caller. Wiring means giving it a surface —");
p("a control on a screen, or a route in the Copilot's intent map.");
p();
p("| Feature | Pillar | What to call |");
p("|---|---|---|");
for (const f of unwired) {
  p(`| ${f.brief.replace(/\|/g, "\\|")} | ${f.pillar} | \`${f.module}.${f.entry}()\` |`);
}
p();
p("---");
p();
p(`## The ${blocked.length} blocked by the brief`);
p();
p("These are **not** outstanding work. The brief requires something to happen before they ship,");
p("and the product refuses them in code until it does.");
p();
for (const f of blocked) {
  p(`**${f.brief.replace(/\|/g, "\\|")}** *(${f.pillar})*`);
  p();
  p(`> ${f.blocked}`);
  p();
}
p("---");
p();
p("## One thing that is not a feature gap");
p();
p("**The model is not connected.** Retrieval, citations, grounding, refusals, confirmation and undo");
p("are all real and all enforced; the language itself is generated deterministically until an API key");
p("is set. Setting one changes how the sentences read — it does not change anything in the tables above.");

const out = L.join("\n") + "\n";
if (process.argv.includes("--write")) {
  const dest = path.join(here, "../../../docs/AI-FEATURES.md");
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, out);
  console.log(`wrote ${path.relative(process.cwd(), dest)} — ${rows.length} features · ${live.length} live · ${unwired.length} to wire · ${blocked.length} blocked`);
} else {
  process.stdout.write(out);
}
