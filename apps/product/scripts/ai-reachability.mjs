/**
 * Recompute which AI features a person can actually reach, and write the answer
 * back into lib/ai/features.ts.
 *
 * verifyFeatures() checks that each feature's implementation EXISTS. That is not
 * the same as it being reachable: an exported function nothing imports is real,
 * tested, and invisible. Thirteen features were sitting in exactly that state
 * while the registry reported them as reachable, so the check now looks for a
 * call site, and `wiredTo` records it.
 *
 * Run: node scripts/ai-reachability.mjs [--write]
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const SRC = "src";
const FEATURES = join(SRC, "lib/ai/features.ts");

function walk(dir, out = []) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(ts|tsx)$/.test(p)) out.push(p);
  }
  return out;
}

// Anything a person can reach: the screens, plus the provider that answers the
// Copilot. The registry itself is excluded — listing a feature is not using it.
const callers = walk(join(SRC, "app"))
  // index.ts resolves the provider the API route serves, so a feature the
  // provider IS (rather than calls) still counts as reachable.
  .concat([join(SRC, "lib/ai/mock.ts"), join(SRC, "lib/ai/retrieve.ts"), join(SRC, "lib/ai/index.ts")])
  .filter((p) => !/features\.ts|verify\.ts/.test(p))
  .map((p) => ({ p, src: readFileSync(p, "utf8") }));

const mock = readFileSync(join(SRC, "lib/ai/mock.ts"), "utf8");
const featuresSrc = readFileSync(FEATURES, "utf8");

const entries = [...featuresSrc.matchAll(
  /\{ id: "([^"]+)".*?module: "([^"]+)", entry: "([^"]+)"/g,
)].map(([, id, module, entry]) => ({ id, module, entry }));

const results = entries.map(({ id, module, entry }) => {
  // A tool is only reachable if the provider can actually propose it. Entries
  // in tools.ts that are not themselves tools (the registry's own guardrail)
  // fall through to the general call-site check below.
  const toolsSrc = readFileSync(join(SRC, "lib/ai/tools.ts"), "utf8");
  const isTool = new RegExp(`^  ${entry}: \\{`, "m").test(toolsSrc);
  if (module === "tools" && isTool) {
    return { id, wiredTo: mock.includes(`proposeTool("${entry}"`) ? "lib/ai/mock.ts" : null };
  }
  const re = new RegExp(`\\b${entry.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`);
  const hit = callers.find(
    ({ p, src }) => re.test(src) && !p.endsWith(`${module}.ts`),
  );
  if (hit) return { id, wiredTo: hit.p.replace(/^src\//, "") };

  // A guardrail that invokes itself at module load is enforced, not dormant —
  // tools.ts ends with assertRegistryIsSafe(), which throws the build if a tool
  // is missing a confirmation or an undo. That is a call site, just not one in
  // a screen.
  const own = readFileSync(join(SRC, "lib/ai", `${module}.ts`), "utf8");
  if (new RegExp(`^${entry}\\(\\);`, "m").test(own)) {
    return { id, wiredTo: `lib/ai/${module}.ts (runs at import)` };
  }
  return { id, wiredTo: null };
});

const unwired = results.filter((r) => !r.wiredTo);
console.log(`${results.length} features · ${results.length - unwired.length} reachable · ${unwired.length} not wired`);
if (unwired.length) console.log("not wired:", unwired.map((r) => r.id).join(", "));

if (process.argv.includes("--write")) {
  let out = featuresSrc;
  for (const { id, wiredTo } of results) {
    const value = wiredTo ? `"${wiredTo}"` : "null";
    const re = new RegExp(`(\\{ id: "${id}",[^\\n]*?)(, wiredTo: (?:"[^"]*"|null))?( \\}\\,)`);
    out = out.replace(re, `$1, wiredTo: ${value}$3`);
  }
  writeFileSync(FEATURES, out);
  console.log("features.ts updated");
}
