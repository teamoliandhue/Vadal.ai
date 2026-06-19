// figma-sync — keep Figma Variables and tokens/*.json in sync (the design half of the loop).
//
//   node scripts/figma-sync.mjs pull   # Figma variables  → tokens/ (design edits land in code)
//   node scripts/figma-sync.mjs push   # tokens/           → Figma variables (code edits land in design)
//
// Env: FIGMA_TOKEN (personal access token, scope: file_variables:read / :write),
//      FIGMA_FILE_KEY (default: the Vadal file below).
//
// ⚠️ PLAN NOTE: the Figma *Variables REST API* used here is Enterprise-only. On Pro/Org plans
// the same pull/push is done through a Figma plugin instead — Tokens Studio, or the Figma MCP
// (`use_figma`) which reads/writes variables via the Plugin API on any plan. This repo's
// agent can perform that MCP-driven sync on request; this script is the CI path for when the
// file is on Enterprise. The token shape it reads/writes is identical either way.

import { promises as fs } from 'node:fs';
import path from 'node:path';

const FILE_KEY = process.env.FIGMA_FILE_KEY || 'b6Jb1ttGwnOOD3LYZ9kWJk';
const TOKEN = process.env.FIGMA_TOKEN;
const API = 'https://api.figma.com/v1';
const TOKENS_DIR = new URL('../tokens/', import.meta.url);

const hex = ({ r, g, b, a = 1 }) => {
  const h = (n) => Math.round(n * 255).toString(16).padStart(2, '0');
  return `#${h(r)}${h(g)}${h(b)}${a < 1 ? h(a) : ''}`;
};
const toRgba = (s) => {
  const c = s.replace('#', '');
  const n = (i) => parseInt(c.slice(i, i + 2), 16) / 255;
  return { r: n(0), g: n(2), b: n(4), a: c.length === 8 ? n(6) : 1 };
};

async function api(p, init) {
  if (!TOKEN) throw new Error('Set FIGMA_TOKEN (see header; on Pro use the Figma MCP/Tokens Studio instead).');
  const res = await fetch(`${API}${p}`, { ...init, headers: { 'X-Figma-Token': TOKEN, 'Content-Type': 'application/json', ...(init?.headers) } });
  if (!res.ok) throw new Error(`Figma API ${res.status}: ${await res.text()}`);
  return res.json();
}

// PULL: Figma "Color" collection (Light/Dark modes) → tokens/semantic.{light,dark}.json
async function pull() {
  const { meta } = await api(`/files/${FILE_KEY}/variables/local`);
  const collections = Object.values(meta.variableCollections);
  const vars = Object.values(meta.variables);
  const color = collections.find((c) => c.name === 'Color');
  if (!color) throw new Error('No "Color" collection found.');
  const modeId = (name) => color.modes.find((m) => m.name === name)?.modeId;
  for (const mode of ['Light', 'Dark']) {
    const mid = modeId(mode);
    const out = {};
    for (const v of vars.filter((v) => v.variableCollectionId === color.id && v.resolvedType === 'COLOR')) {
      const name = v.name.replace(/\//g, '-'); // figma "brand/soft" → "brand-soft"
      const val = v.valuesByMode[mid];
      if (val && typeof val === 'object' && 'r' in val) out[name] = { $type: 'color', $value: hex(val) };
    }
    const file = new URL(`semantic.${mode.toLowerCase()}.json`, TOKENS_DIR);
    await fs.writeFile(file, JSON.stringify(out, null, 2) + '\n');
    console.log(`✓ pulled ${Object.keys(out).length} ${mode} tokens → ${path.basename(file.pathname)}`);
  }
}

// PUSH: tokens/semantic.{light,dark}.json → update existing Figma variable values by name
async function push() {
  const { meta } = await api(`/files/${FILE_KEY}/variables/local`);
  const color = Object.values(meta.variableCollections).find((c) => c.name === 'Color');
  const byName = {};
  for (const v of Object.values(meta.variables)) if (v.variableCollectionId === color.id) byName[v.name.replace(/\//g, '-')] = v.id;
  const mode = (n) => color.modes.find((m) => m.name === n)?.modeId;
  const variableModeValues = [];
  for (const m of ['Light', 'Dark']) {
    const toks = JSON.parse(await fs.readFile(new URL(`semantic.${m.toLowerCase()}.json`, TOKENS_DIR)));
    for (const [name, t] of Object.entries(toks)) {
      if (byName[name]) variableModeValues.push({ variableId: byName[name], modeId: mode(m), value: toRgba(t.$value) });
    }
  }
  await api(`/files/${FILE_KEY}/variables`, { method: 'POST', body: JSON.stringify({ variableModeValues }) });
  console.log(`✓ pushed ${variableModeValues.length} mode-values to Figma`);
}

const cmd = process.argv[2];
if (cmd === 'pull') await pull();
else if (cmd === 'push') await push();
else { console.error('Usage: node scripts/figma-sync.mjs <pull|push>'); process.exit(1); }
