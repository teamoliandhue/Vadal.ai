/* Vadal Design System docs — nav, icons, pages, hash router, theme toggle. Pure vanilla. */
(function () {
  "use strict";

  /* ── Icons (the real Vadal set; line unless in FILL) ───────────────── */
  const FILL = new Set(["more", "spark"]);
  const ICONS = {
    home: '<path d="M3.5 10.5 12 3.5l8.5 7"/><path d="M5.5 9.2V19a1.3 1.3 0 0 0 1.3 1.3h10.4A1.3 1.3 0 0 0 18.5 19V9.2"/><path d="M9.7 20.3v-5.1a1 1 0 0 1 1-1h2.6a1 1 0 0 1 1 1v5.1"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/>',
    settings: '<path d="M4 7h8"/><path d="M16 7h4"/><circle cx="14" cy="7" r="2"/><path d="M4 12h2"/><path d="M10 12h10"/><circle cx="8" cy="12" r="2"/><path d="M4 17h8"/><path d="M16 17h4"/><circle cx="14" cy="17" r="2"/>',
    bell: '<path d="M6.5 9.5a5.5 5.5 0 0 1 11 0c0 4.5 1.8 5.7 1.8 5.7H4.7s1.8-1.2 1.8-5.7Z"/><path d="M10 19a2 2 0 0 0 4 0"/>',
    plus: '<path d="M12 5.5v13M5.5 12h13"/>',
    check: '<path d="M5 12.5 9.8 17.3 19 7"/>',
    close: '<path d="M6.3 6.3 17.7 17.7M17.7 6.3 6.3 17.7"/>',
    "chevron-down": '<path d="M6.5 9.5 12 15 17.5 9.5"/>',
    "chevron-right": '<path d="M9.5 6.5 15 12 9.5 17.5"/>',
    "chevron-left": '<path d="M14.5 6.5 9 12 14.5 17.5"/>',
    "arrow-right": '<path d="M3.5 12h15.5"/><path d="m13 6 6 6-6 6"/>',
    "arrow-left": '<path d="M20.5 12H5"/><path d="m11 6-6 6 6 6"/>',
    more: '<circle cx="5" cy="12" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="19" cy="12" r="1.7"/>',
    filter: '<path d="M4 5.5h16l-6.2 7.2v5.1l-3.6-1.9v-3.2Z"/>',
    calendar: '<rect x="4" y="5" width="16" height="15.5" rx="2.2"/><path d="M4 9.5h16M8.5 3v4M15.5 3v4"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    user: '<circle cx="12" cy="8.5" r="3.5"/><path d="M5.5 19.5a6.5 6.5 0 0 1 13 0"/>',
    team: '<circle cx="9" cy="8.5" r="3"/><path d="M3.2 19a5.8 5.8 0 0 1 11.6 0"/><path d="M16 5.8a3 3 0 0 1 0 5.7"/><path d="M17.6 19a5.9 5.9 0 0 0-2.6-4.7"/>',
    award: '<circle cx="12" cy="9" r="5"/><path d="M8.7 13.2 7 20.5l5-2.7 5 2.7-1.7-7.3"/>',
    pulse: '<path d="M2.5 12h4l2-5.5 4 11 2-5.5h7"/>',
    heart: '<path d="M12 20.3C8 17.5 4 14 4 9.8a3.8 3.8 0 0 1 8-1.4 3.8 3.8 0 0 1 8 1.4c0 4.2-4 7.7-8 10.5Z"/>',
    message: '<path d="M20.5 11.5a7.5 7.5 0 0 1-10.6 6.8L4 19.5l1.3-4.7A7.5 7.5 0 1 1 20.5 11.5Z"/>',
    megaphone: '<path d="M5 10v4h3l8 4.5V5.5L8 10H5Z"/><path d="M18.5 9.2a4 4 0 0 1 0 5.6"/>',
    mood: '<circle cx="12" cy="12" r="8.5"/><path d="M8.5 14a4 4 0 0 0 7 0"/><path d="M9 9.5v1.2M15 9.5v1.2"/>',
    target: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.8"/><circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none"/>',
    chart: '<path d="M4 4v15.5a.5.5 0 0 0 .5.5H20"/><path d="M8 17V12M12.5 17V8M17 17v-3.5"/>',
    clipboard: '<rect x="5" y="5" width="14" height="15.5" rx="2.2"/><path d="M9 5V4.2A1.2 1.2 0 0 1 10.2 3h3.6A1.2 1.2 0 0 1 15 4.2V5"/><path d="M9 11h6M9 14.5h4"/>',
    compass: '<circle cx="12" cy="12" r="8.5"/><path d="m15.5 8.5-2 5-5 2 2-5Z"/>',
    spark: '<path d="M12 2.3c.5 4.8 2.4 6.7 7.2 7.2-4.8.5-6.7 2.4-7.2 7.2-.5-4.8-2.4-6.7-7.2-7.2C9.6 9 11.5 7.1 12 2.3Z"/>',
  };
  const ICON_GROUPS = {
    UI: ["home", "search", "settings", "bell", "plus", "check", "close", "chevron-down", "chevron-right", "chevron-left", "arrow-right", "arrow-left", "more", "filter", "calendar", "menu"],
    People: ["user", "team", "award"],
    Engagement: ["pulse", "heart", "message", "megaphone", "mood", "target"],
    Analytics: ["chart", "clipboard", "compass"],
    Brand: ["spark"],
  };
  function icon(name, size) {
    size = size || 24;
    const f = FILL.has(name);
    return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="${f ? "currentColor" : "none"}" stroke="${f ? "none" : "currentColor"}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${ICONS[name]}</svg>`;
  }

  /* ── Token data ────────────────────────────────────────────────────── */
  const COLOR_GROUPS = [
    ["Surfaces", ["background", "canvas", "card", "soft", "line", "border-strong", "card-hover", "gauge-track"]],
    ["Text", ["ink", "muted", "faint", "on-brand", "inverse", "inverse-text"]],
    ["Brand & accent", ["brand", "brand-strong", "brand-soft", "brand-text", "spark", "signal"]],
    ["Aurora gradient", ["grad-from", "grad-via", "grad-to"]],
    ["Status", ["success", "success-soft", "danger", "danger-soft", "warning", "warning-soft", "info", "info-soft"]],
    ["Pastel surfaces", ["surface-lilac", "surface-mint", "surface-butter"]],
    ["Interaction states", ["state-hover", "state-pressed", "focus-ring", "disabled-surface", "disabled-content"]],
    ["Icon", ["icon", "icon-muted", "icon-subtle", "icon-brand", "icon-disabled"]],
  ];
  const swatches = (names) => `<div class="swatches">${names.map((n) => `<div class="sw"><div class="chip" style="background:var(--${n})"></div><div><div class="nm">${n}</div><div class="vr">var(--${n})</div></div></div>`).join("")}</div>`;

  /* ── Pages ─────────────────────────────────────────────────────────── */
  const PAGES = {};
  // items: [id, label, soon?]  — soon items are roadmap placeholders (not navigable)
  const NAV = [
    { group: null, items: [["overview", "Overview"]] },
    { group: "Foundations", items: [["colors", "Colours"], ["typography", "Typography"], ["spacing", "Spacing & radius"], ["elevation", "Elevation"], ["motion", "Motion"], ["icons", "Iconography"]] },
    { group: "Components", items: [["button", "Button"], ["input", "Input"], ["badge", "Badge"], ["avatar", "Avatar"], ["checkbox", "Checkbox"], ["radio", "Radio"], ["switch", "Switch"], ["segmented", "Segmented", true], ["tabs", "Tabs", true], ["select", "Select", true], ["card", "Card", true], ["topbar", "Top bar", true], ["sidebar", "Sidebar + nav", true], ["modal", "Modal", true], ["toast", "Toast", true]] },
    { group: "Patterns", items: [["dashboard", "Dashboard", true], ["settings", "Settings", true], ["profile", "Profile", true]] },
  ];
  const chev = '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9.5 12 15 18 9.5"/></svg>';
  let COLLAPSED;
  try { COLLAPSED = new Set(JSON.parse(localStorage.getItem("vadal-ds-collapsed") || "[]")); } catch (e) { COLLAPSED = new Set(); }
  const saveCollapsed = () => { try { localStorage.setItem("vadal-ds-collapsed", JSON.stringify([...COLLAPSED])); } catch (e) {} };

  PAGES.overview = { title: "Overview", crumb: "Overview", render: () => `
    <div class="eyebrow">Vadal Design System · v0.1</div>
    <h1>A calm, human system for the people-side of work.</h1>
    <p class="lede">Aurora colour, the Lumen light + dark style, and Contra-inspired components — defined as tokens in code, kept in sync with the Figma library. This site is the living reference.</p>
    <div class="hero" style="margin:28px 0"><div class="t">Aurora</div><div class="s">Teal → blue → violet, with a warm coral spark. Clarity — signal &amp; insight in motion.</div><div class="spark"></div></div>
    <div class="grid3">
      <a class="card feature" href="#/colors"><div class="fi">${icon("more", 20)}</div><h3>Foundations</h3><p>Colour, type, spacing, elevation, motion and icons — the raw material.</p></a>
      <a class="card feature" href="#/button"><div class="fi">${icon("check", 20)}</div><h3>Components</h3><p>Buttons, inputs and more — each token-bound and documented.</p></a>
      <a class="card feature" href="#/colors"><div class="fi">${icon("settings", 20)}</div><h3>Tokens in code</h3><p>DTCG → Style Dictionary → CSS/Tailwind, synced with Figma variables.</p></a>
    </div>
    <h2>Principles</h2>
    <p>· <b>Human at scale</b> — warm and legible, never clinical.&nbsp;&nbsp; · <b>Daily ritual</b> — built for an app people open every morning.&nbsp;&nbsp; · <b>One source of truth</b> — tokens drive both Figma and code.</p>
    <div class="callout" style="margin-top:18px">${icon("spark", 18)}<div>The full 6-page uSpec (Anatomy · API · Properties · Colour · Structure · Screen reader) for every component lives in the Figma library.</div></div>` };

  PAGES.colors = { title: "Colours", crumb: "Foundations · Colours", render: () => `
    <div class="eyebrow">Foundations</div><h1>Colours</h1>
    <p class="lede">Every token aliases the Aurora system and flips with light / dark. Names mirror the code CSS variables — toggle the theme (top-right) to see dark values.</p>
    <div style="margin-top:28px">${COLOR_GROUPS.map(([g, n]) => `<div class="grp"><div class="grptitle">${g}</div>${swatches(n)}</div>`).join("")}</div>` };

  PAGES.typography = { title: "Typography", crumb: "Foundations · Typography", render: () => {
    const rows = [["Display / 2XL", "Space Grotesk · 48/52", '<div style="font-family:Space Grotesk;font-size:48px;font-weight:700;letter-spacing:-.02em">Keep companies human</div>'],
      ["Heading / H1", "Inter Semibold · 30/36", '<div style="font-size:30px;font-weight:600;letter-spacing:-.01em">The morning signal</div>'],
      ["Heading / H3", "Inter Semibold · 20/26", '<div style="font-size:20px;font-weight:600">Workforce health</div>'],
      ["Body / Base", "Inter · 16/24", '<div style="font-size:16px">A clear read on how people feel — every day, not every quarter.</div>'],
      ["Label / Small", "Inter Medium · 12/16", '<div style="font-size:12px;font-weight:500;letter-spacing:.02em">LABEL TEXT</div>'],
      ["Editorial", "Instrument Serif · 30/36", '<div style="font-family:Instrument Serif;font-size:30px">Intelligence, made human.</div>']];
    return `<div class="eyebrow">Foundations</div><h1>Typography</h1>
    <p class="lede"><b>Inter</b> carries the entire product UI — chosen for legibility across a wide-age workforce (humanist, large x-height, open apertures). Space Grotesk is reserved for marketing/brand display; Instrument Serif for editorial.</p>
    <div class="card" style="margin-top:24px;color:var(--ink)">${rows.map(([n, m, s]) => `<div class="spec"><div class="meta">${n} · ${m}</div><div class="sample">${s}</div></div>`).join("")}</div>
    <h2>Families</h2>
    <table class="tbl"><thead><tr><th>Role</th><th>Family</th><th>Token</th></tr></thead><tbody>
      <tr><td>Product UI &amp; body</td><td>Inter</td><td><code>var(--font-inter)</code></td></tr>
      <tr><td>Display · marketing only</td><td>Space Grotesk</td><td><code>var(--font-grotesk)</code></td></tr>
      <tr><td>Editorial</td><td>Instrument Serif</td><td><code>var(--font-serif)</code></td></tr>
      <tr><td>High-legibility · opt-in</td><td>Atkinson Hyperlegible</td><td><code>var(--font-legible)</code></td></tr></tbody></table>
    <div class="callout" style="margin-top:16px">${icon("spark", 18)}<div>Toggle <b>Aa</b> in the top bar for high-legibility mode — switches the UI to Atkinson Hyperlegible (built for low-vision readers) for employees who need maximum clarity.</div></div>`; } };

  PAGES.spacing = { title: "Spacing & radius", crumb: "Foundations · Spacing & radius", render: () => {
    const sp = [["space-2xs", 4], ["space-xs", 8], ["space-sm", 12], ["space-md", 16], ["space-lg", 20], ["space-xl", 24], ["space-2xl", 32], ["space-3xl", 40], ["space-4xl", 48], ["space-5xl", 64]];
    const rad = [["xs", 6], ["sm", 8], ["md", 12], ["lg", 16], ["xl", 20], ["2xl", 28], ["full", 36]];
    return `<div class="eyebrow">Foundations</div><h1>Spacing &amp; radius</h1>
    <p class="lede">A 4-based spacing scale and a soft, generous radius scale. Pills use full; cards use lg.</p>
    <h2>Spacing</h2><div class="card"><div class="bars">${sp.map(([n, v]) => `<div class="bar-row"><div class="lbl">${n} · ${v}</div><div class="bar" style="width:${v}px"></div></div>`).join("")}</div></div>
    <h2>Radius</h2><div class="card"><div class="radii">${rad.map(([n, v]) => `<div class="cell"><div class="sq" style="border-radius:${v}px"></div><div class="rl">${n}${n === "full" ? "" : " · " + v}</div></div>`).join("")}</div></div>`; } };

  PAGES.elevation = { title: "Elevation", crumb: "Foundations · Elevation", render: () => {
    const sh = [["Subtle", "0 1px 2px rgba(10,10,12,.06)"], ["Card", "0 1px 2px -1px rgba(10,10,12,.08), 0 8px 24px -16px rgba(10,10,12,.18)"], ["Lifted", "0 2px 6px -2px rgba(10,10,12,.10), 0 18px 40px -20px rgba(10,10,12,.22)"], ["Overlay", "0 4px 12px -4px rgba(10,10,12,.14), 0 24px 60px -16px rgba(10,10,12,.30)"], ["Glow / AI", "0 6px 24px -6px rgba(124,92,248,.45), 0 2px 10px -2px rgba(255,138,91,.28)"]];
    return `<div class="eyebrow">Foundations</div><h1>Elevation</h1>
    <p class="lede">Soft Lumen shadows plus the Aurora AI glow. Subtle in light, surface-tinted in dark.</p>
    <div class="card" style="margin-top:24px"><div class="elev">${sh.map(([n, s]) => `<div><div class="ecard" style="box-shadow:${s}"></div><div class="el">${n}</div></div>`).join("")}</div></div>`; } };

  PAGES.motion = { title: "Motion", crumb: "Foundations · Motion", render: () => `
    <div class="eyebrow">Foundations</div><h1>Motion</h1>
    <p class="lede">Durations and easing curves, tokenised for consistent, calm transitions.</p>
    <h2>Duration</h2><table class="tbl"><thead><tr><th>Token</th><th>Value</th><th>Use</th></tr></thead><tbody>
      <tr><td>duration-fast</td><td><code>120ms</code></td><td>Hovers, small toggles</td></tr>
      <tr><td>duration-base</td><td><code>200ms</code></td><td>Most state changes</td></tr>
      <tr><td>duration-slow</td><td><code>320ms</code></td><td>Cards, overlays</td></tr>
      <tr><td>duration-slower</td><td><code>480ms</code></td><td>Page / hero motion</td></tr></tbody></table>
    <h2>Easing</h2><table class="tbl"><thead><tr><th>Token</th><th>Curve</th></tr></thead><tbody>
      <tr><td>easing-standard</td><td><code>cubic-bezier(0.2, 0, 0, 1)</code></td></tr>
      <tr><td>easing-entrance</td><td><code>cubic-bezier(0, 0, 0, 1)</code></td></tr>
      <tr><td>easing-spring</td><td><code>cubic-bezier(0.5, 1.5, 0.5, 1)</code></td></tr></tbody></table>` };

  PAGES.icons = { title: "Iconography", crumb: "Foundations · Iconography", render: () => `
    <div class="eyebrow">Foundations</div><h1>Iconography</h1>
    <p class="lede">Contra-inspired line icons — 24×24 grid, 1.5px stroke, round caps & joins. Stroke binds to the <code>icon</code> token; sizes 16–24 are the honest UI range.</p>
    ${Object.entries(ICON_GROUPS).map(([g, names]) => `<div class="grp"><div class="grptitle">${g}</div><div class="iconset">${names.map((n) => `<div class="iconcell">${icon(n, 24)}<div class="in">${n}</div></div>`).join("")}</div></div>`).join("")}` };

  const btn = (cls, label, opts) => { opts = opts || {}; const l = opts.lead ? icon(opts.lead, 18) : ""; const t = opts.trail ? icon(opts.trail, 18) : ""; const sz = opts.size ? " " + opts.size : ""; const st = opts.style ? ` style="${opts.style}"` : ""; return `<button class="btn ${cls}${sz}"${st}>${l}${label}${t}</button>`; };
  const spinner = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" stroke="currentColor" stroke-opacity=".3" stroke-width="2"/><path d="M14.5 8a6.5 6.5 0 0 0-6.5-6.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';

  PAGES.button = { title: "Button", crumb: "Components · Button", render: () => `
    <div class="eyebrow">Components</div><h1>Button</h1>
    <p class="lede">A pill with an optional leading icon, a label, and an optional trailing icon. Seven types across an emphasis ladder; bound to <code>button/*</code> tokens.</p>

    <h2>Types</h2>
    <div class="example">
      ${btn("b-primary", "New", { lead: "plus" })}
      ${btn("b-brand", "Next", { trail: "arrow-right" })}
      ${btn("b-secondary", "Details", { trail: "chevron-right" })}
      ${btn("b-tertiary", "Back", { lead: "arrow-left" })}
      ${btn("b-ghost", "Skip")}
      ${btn("b-destructive", "Delete", { lead: "close" })}
      ${btn("b-ai", "Ask HR", { lead: "spark" })}
    </div>
    <table class="tbl" style="margin-top:16px"><thead><tr><th>Type</th><th>Use</th></tr></thead><tbody>
      <tr><td>Primary</td><td>The single most important neutral action.</td></tr>
      <tr><td>Brand</td><td>The primary on-brand call to action.</td></tr>
      <tr><td>Secondary (soft)</td><td>A quieter brand action beside a primary.</td></tr>
      <tr><td>Tertiary (outline)</td><td>Low-emphasis, bordered — e.g. Cancel.</td></tr>
      <tr><td>Ghost</td><td>Minimal, text-only.</td></tr>
      <tr><td>Destructive</td><td>Irreversible / dangerous actions.</td></tr>
      <tr><td>AI</td><td>AI affordances — the Aurora gradient + spark.</td></tr></tbody></table>

    <h2>Sizes</h2>
    <div class="example">${btn("b-brand", "Small", { size: "sm" })}${btn("b-brand", "Medium")}${btn("b-brand", "Large", { size: "lg" })}</div>

    <h2>States</h2>
    <div class="example">
      ${btn("b-brand", "Default")}
      ${btn("b-brand", "Focus", { style: "outline:3px solid var(--button-focus-ring);outline-offset:0" })}
      ${btn("b-disabled", "Disabled")}
      ${btn("b-brand", "Loading", { lead: null }).replace(">Loading", ">" + spinner + "Loading")}
      <span class="faint" style="font-size:13px">· hover the buttons above — states are live</span>
    </div>

    <h2>Props</h2>
    <table class="tbl"><thead><tr><th>Prop</th><th>Type</th><th>Values</th><th>Default</th></tr></thead><tbody>
      <tr><td>variant</td><td>enum</td><td>primary · brand · secondary · tertiary · ghost · destructive · ai</td><td>primary</td></tr>
      <tr><td>size</td><td>enum</td><td>sm · md · lg</td><td>md</td></tr>
      <tr><td>leadingIcon / trailingIcon</td><td>ReactNode</td><td>any icon</td><td>—</td></tr>
      <tr><td>loading · disabled</td><td>boolean</td><td>true / false</td><td>false</td></tr></tbody></table>

    <h2>Usage</h2>
    <div class="dd">
      <div class="box2 do"><div class="hd">Do</div><div class="bd"><ul><li>One primary/brand action per view.</li><li>Lead with a verb: “Send invite”, “Save changes”.</li><li>Pair Brand with Secondary or Ghost for the quieter action.</li></ul></div></div>
      <div class="box2 dont"><div class="hd">Don’t</div><div class="bd"><ul><li>Stack multiple Brand buttons competing for attention.</li><li>Use Destructive for ordinary actions.</li><li>Write vague labels like “OK” or “Submit”.</li></ul></div></div>
    </div>

    <h2>Code</h2>
    <pre class="code">import { Button } from "@vadal/design-system";

&lt;Button variant="brand" trailingIcon={&lt;ArrowRight /&gt;}&gt;Next&lt;/Button&gt;</pre>
    <div class="callout" style="margin-top:16px">${icon("spark", 18)}<div>Full anatomy, colour annotation, structure and screen-reader specs live in the Figma uSpec.</div></div>` };

  PAGES.input = { title: "Input", crumb: "Components · Input", render: () => {
    const field = (cls, label, value, helper, lead) => `<div class="field ${cls}"><div class="fl">${label}</div><div class="box">${lead ? icon(lead, 18) : ""}${value}</div><div class="fh">${helper}</div></div>`;
    return `<div class="eyebrow">Components</div><h1>Input</h1>
    <p class="lede">A Contra-style field — label above, soft-rounded box, muted placeholder, helper / error below. Optional leading (search) and trailing (select) icons.</p>
    <h2>States</h2>
    <div class="example" style="display:block"><div class="fields">
      ${field("", "Email", "Placeholder", "Helper text")}
      ${field("focus", "Email", "jane@oliandhue.com", "Looks good.")}
      ${field("error", "Email", "not-an-email", "This field is required")}
      ${field("disabled", "Email", "Placeholder", "Helper text")}
      ${field("", "Search", "Search people…", "With a leading icon", "search")}
      ${field("", "Country", "Select…", "With a trailing chevron").replace("</div><div class=\"fh\">", icon("chevron-down", 18) + "</div><div class=\"fh\">")}
    </div></div>
    <h2>Props</h2>
    <table class="tbl"><thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead><tbody>
      <tr><td>label · value · helper</td><td>string</td><td>—</td></tr>
      <tr><td>state</td><td>enum (default · hover · focus · filled · error · disabled)</td><td>default</td></tr>
      <tr><td>required · leadingIcon · trailingIcon</td><td>boolean</td><td>false</td></tr></tbody></table>
    <h2>Usage</h2>
    <div class="dd">
      <div class="box2 do"><div class="hd">Do</div><div class="bd"><ul><li>Always show a visible label above the field.</li><li>Use the error state with a clear, specific message.</li></ul></div></div>
      <div class="box2 dont"><div class="hd">Don’t</div><div class="bd"><ul><li>Use placeholder text as the label.</li><li>Signal errors with colour alone.</li></ul></div></div>
    </div>`; } };

  PAGES.badge = { title: "Badge", crumb: "Components · Badge", render: () => {
    const tones = [["neutral", "Neutral"], ["brand", "Brand"], ["success", "Success"], ["warning", "Warning"], ["danger", "Danger"], ["info", "Info"]];
    return `<div class="eyebrow">Components</div><h1>Badge</h1>
    <p class="lede">A small pill for status, counts and taxonomy — a soft tinted fill (status) or a neutral outline (tags). Bound to <code>badge/*</code> tokens; every tone flips with the theme.</p>
    <h2>Tones</h2>
    <div class="example"><div class="badges">${tones.map(([t, l]) => `<span class="badge bd-${t}">${l}</span>`).join("")}</div></div>
    <h2>Outline</h2>
    <div class="example"><div class="badges">
      <span class="badge bd-outline" style="color:var(--badge-neutral-label)">Draft</span>
      <span class="badge bd-outline" style="color:var(--badge-brand-label)">Beta</span>
      <span class="badge bd-outline" style="color:var(--badge-success-label)">Active</span>
    </div></div>
    <h2>With dot &amp; icon</h2>
    <div class="example"><div class="badges">
      <span class="badge bd-success"><span class="bdot"></span>Online</span>
      <span class="badge bd-neutral"><span class="bdot"></span>Offline</span>
      <span class="badge bd-brand">${icon("spark", 14)}Pro</span>
      <span class="badge bd-warning">${icon("bell", 14)}3 due</span>
    </div></div>
    <h2>Sizes</h2>
    <div class="example"><div class="badges"><span class="badge bd-brand sm">Small</span><span class="badge bd-brand">Medium</span></div></div>
    <h2>Props</h2>
    <table class="tbl"><thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead><tbody>
      <tr><td>tone</td><td>neutral · brand · success · warning · danger · info</td><td>neutral</td></tr>
      <tr><td>variant</td><td>soft · outline</td><td>soft</td></tr>
      <tr><td>size</td><td>sm · md</td><td>md</td></tr>
      <tr><td>dot · icon</td><td>boolean · ReactNode</td><td>—</td></tr></tbody></table>
    <h2>Usage</h2>
    <div class="dd">
      <div class="box2 do"><div class="hd">Do</div><div class="bd"><ul><li>Map tone to meaning — success for healthy, danger for at-risk.</li><li>Keep labels to one or two words.</li></ul></div></div>
      <div class="box2 dont"><div class="hd">Don’t</div><div class="bd"><ul><li>Use a badge as a button — it isn’t interactive.</li><li>Rely on colour alone; pair with a clear word.</li></ul></div></div>
    </div>
    <h2>Code</h2>
    <pre class="code">import { Badge } from "@vadal/design-system";

&lt;Badge tone="success" dot&gt;Online&lt;/Badge&gt;</pre>
    <div class="callout" style="margin-top:16px">${icon("spark", 18)}<div>Full anatomy, colour annotation, structure and screen-reader specs live in the Figma uSpec.</div></div>`; } };

  PAGES.avatar = { title: "Avatar", crumb: "Components · Avatar", render: () => {
    const p1 = "background:linear-gradient(135deg,#7c5cf8,#3b9eff)", p2 = "background:linear-gradient(135deg,#23d7be,#3b9eff)", p3 = "background:linear-gradient(135deg,#ff8a5b,#fb4b43)";
    const ini = (size, t) => `<span class="avatar ${size}"><span class="av-inner"><span>${t}</span></span></span>`;
    const photo = (size, ph, extra) => `<span class="avatar ${size}${extra || ""}"><span class="av-inner" style="${ph}"></span></span>`;
    const dot = (size, ph, t, st) => `<span class="avatar ${size}"><span class="av-inner"${ph ? ` style="${ph}"` : ""}>${ph ? "" : `<span>${t}</span>`}</span><span class="st ${st}"></span></span>`;
    return `<div class="eyebrow">Components</div><h1>Avatar</h1>
    <p class="lede">A circular portrait with a graceful fallback chain — photo → initials → icon — plus an optional status dot, brand ring and overlapping group. Bound to <code>avatar/*</code> tokens.</p>
    <h2>Sizes</h2>
    <div class="example"><div class="avatars">${["xs", "sm", "md", "lg", "xl"].map((s) => ini(s, "JS")).join("")}</div></div>
    <h2>Fallbacks</h2>
    <div class="example"><div class="avatars">
      ${photo("lg", p1)}
      ${ini("lg", "OH")}
      <span class="avatar lg"><span class="av-inner"><span class="av-icon">${icon("user", 24)}</span></span></span>
    </div></div>
    <h2>Status</h2>
    <div class="example"><div class="avatars">
      ${dot("md", p1, "", "online")}${dot("md", "", "BL", "busy")}${dot("md", p2, "", "away")}${dot("md", "", "SK", "offline")}
    </div></div>
    <h2>Ring &amp; group</h2>
    <div class="example" style="gap:32px">
      ${photo("lg", p1, " ring")}
      <div class="avatar-group">
        ${photo("md", p1)}${photo("md", p2)}${photo("md", p3)}${ini("md", "JS")}${ini("md", "+3")}
      </div>
    </div>
    <h2>Props</h2>
    <table class="tbl"><thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead><tbody>
      <tr><td>size</td><td>xs · sm · md · lg · xl</td><td>md</td></tr>
      <tr><td>src · name · icon</td><td>photo → initials → icon fallback chain</td><td>—</td></tr>
      <tr><td>status</td><td>online · busy · away · offline</td><td>—</td></tr>
      <tr><td>ring</td><td>boolean — brand ring for the active / AI person</td><td>false</td></tr></tbody></table>
    <h2>Code</h2>
    <pre class="code">import { Avatar, AvatarGroup } from "@vadal/design-system";

&lt;Avatar name="Jane Smith" status="online" /&gt;
&lt;AvatarGroup max={4}&gt;{team.map((p) =&gt; &lt;Avatar key={p.id} {...p} /&gt;)}&lt;/AvatarGroup&gt;</pre>
    <div class="callout" style="margin-top:16px">${icon("spark", 18)}<div>Full anatomy, colour annotation, structure and screen-reader specs live in the Figma uSpec.</div></div>`; } };

  const ckSvgs = '<svg class="ck" viewBox="0 0 16 16" fill="none" stroke="var(--checkbox-check)" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 8.5 6.5 11.5 12.5 4.5"/></svg><svg class="dash" viewBox="0 0 16 16" fill="none" stroke="var(--checkbox-check)" stroke-width="2.25" stroke-linecap="round"><path d="M4 8h8"/></svg>';
  const ctlTx = (label, desc) => `<span class="ctl-tx"><span class="lbl">${label}</span>${desc ? `<span class="desc">${desc}</span>` : ""}</span>`;

  PAGES.checkbox = { title: "Checkbox", crumb: "Components · Checkbox", render: () => {
    const ctl = (state, label, desc) => `<label class="ctl ${state}"><span class="cbox">${ckSvgs}</span>${ctlTx(label, desc)}</label>`;
    return `<div class="eyebrow">Components</div><h1>Checkbox</h1>
    <p class="lede">A rounded-square control for multi-select and consent — checked, indeterminate and error states, with an optional description. Bound to <code>checkbox/*</code> tokens.</p>
    <h2>States</h2>
    <div class="example"><div class="controls">
      ${ctl("", "Unchecked", "Email me about product updates")}
      ${ctl("checked", "Checked", "Notify me about new messages")}
      ${ctl("indet", "Indeterminate", "Some sub-options are selected")}
      ${ctl("checked focus", "Focused", "Keyboard focus ring is visible")}
      ${ctl("error", "Required", "You must accept the terms")}
      ${ctl("disabled", "Disabled", "Unavailable on your current plan")}
    </div></div>
    <h2>Props</h2>
    <table class="tbl"><thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead><tbody>
      <tr><td>label · description</td><td>ReactNode</td><td>—</td></tr>
      <tr><td>checked · indeterminate · error · disabled</td><td>boolean</td><td>false</td></tr>
      <tr><td>size</td><td>sm · md</td><td>md</td></tr></tbody></table>
    <h2>Usage</h2>
    <div class="dd">
      <div class="box2 do"><div class="hd">Do</div><div class="bd"><ul><li>Use for independent options that can be on together.</li><li>Use indeterminate for a parent of mixed children.</li></ul></div></div>
      <div class="box2 dont"><div class="hd">Don’t</div><div class="bd"><ul><li>Use a checkbox for mutually exclusive choices — use Radio.</li><li>Toggle an instant setting with it — use Switch.</li></ul></div></div>
    </div>
    <h2>Code</h2>
    <pre class="code">import { Checkbox } from "@vadal/design-system";

&lt;Checkbox label="Email me" description="Product updates" defaultChecked /&gt;</pre>` ; } };

  PAGES.radio = { title: "Radio", crumb: "Components · Radio", render: () => {
    const ctl = (state, label, desc) => `<label class="ctl ${state}"><span class="rbox"><span class="rdot"></span></span>${ctlTx(label, desc)}</label>`;
    return `<div class="eyebrow">Components</div><h1>Radio</h1>
    <p class="lede">A circular control for choosing one option from a set. Group radios with the same <code>name</code>; bound to <code>radio/*</code> tokens.</p>
    <h2>States</h2>
    <div class="example"><div class="controls">
      ${ctl("", "Unselected", "")}
      ${ctl("checked", "Selected", "")}
      ${ctl("checked focus", "Focused", "")}
      ${ctl("disabled", "Disabled", "")}
    </div></div>
    <h2>In a group</h2>
    <div class="example"><div class="controls">
      ${ctl("checked", "Weekly digest", "A summary every Monday")}
      ${ctl("", "Daily summary", "One email each morning")}
      ${ctl("", "Real-time", "Notify me as things happen")}
    </div></div>
    <h2>Props</h2>
    <table class="tbl"><thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead><tbody>
      <tr><td>label · description</td><td>ReactNode</td><td>—</td></tr>
      <tr><td>name · value · checked · error · disabled</td><td>string · boolean</td><td>—</td></tr>
      <tr><td>size</td><td>sm · md</td><td>md</td></tr></tbody></table>
    <h2>Usage</h2>
    <div class="dd">
      <div class="box2 do"><div class="hd">Do</div><div class="bd"><ul><li>Use for 2–6 mutually exclusive options.</li><li>Pre-select a sensible default.</li></ul></div></div>
      <div class="box2 dont"><div class="hd">Don’t</div><div class="bd"><ul><li>Use radios when more than one can be true — use Checkbox.</li><li>Leave a group with no option selected if a choice is required.</li></ul></div></div>
    </div>
    <h2>Code</h2>
    <pre class="code">import { Radio } from "@vadal/design-system";

&lt;Radio name="cadence" value="weekly" label="Weekly digest" defaultChecked /&gt;</pre>`; } };

  PAGES.switch = { title: "Switch", crumb: "Components · Switch", render: () => {
    const ctl = (state, label, desc) => `<label class="ctl ${state}"><span class="swt"><span class="thumb"></span></span>${ctlTx(label, desc)}</label>`;
    return `<div class="eyebrow">Components</div><h1>Switch</h1>
    <p class="lede">A toggle for an instant on/off setting — no Save needed. The track fills with brand when on; bound to <code>switch/*</code> tokens.</p>
    <h2>States</h2>
    <div class="example"><div class="controls">
      ${ctl("", "Off", "Accepting new clients")}
      ${ctl("checked", "On", "Availability reminders")}
      ${ctl("checked focus", "Focused", "Keyboard focus ring is visible")}
      ${ctl("disabled", "Disabled (off)", "Locked by your admin")}
      ${ctl("checked disabled", "Disabled (on)", "Enforced by policy")}
    </div></div>
    <h2>Props</h2>
    <table class="tbl"><thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead><tbody>
      <tr><td>label · description</td><td>ReactNode</td><td>—</td></tr>
      <tr><td>checked · disabled</td><td>boolean</td><td>false</td></tr>
      <tr><td>size</td><td>sm · md</td><td>md</td></tr></tbody></table>
    <h2>Usage</h2>
    <div class="dd">
      <div class="box2 do"><div class="hd">Do</div><div class="bd"><ul><li>Use for settings that apply immediately.</li><li>Write a label that reads as a state, not a verb.</li></ul></div></div>
      <div class="box2 dont"><div class="hd">Don’t</div><div class="bd"><ul><li>Use a switch inside a form that needs Submit — use Checkbox.</li><li>Require a separate Save step after toggling.</li></ul></div></div>
    </div>
    <h2>Code</h2>
    <pre class="code">import { Switch } from "@vadal/design-system";

&lt;Switch label="Accepting new clients" defaultChecked /&gt;</pre>`; } };

  /* ── Router + chrome ───────────────────────────────────────────────── */
  const app = document.querySelector(".app");
  const navEl = document.getElementById("nav");
  const pageEl = document.getElementById("page");
  const crumbEl = document.getElementById("crumb");

  const itemHtml = ([id, label, soon]) => soon
    ? `<span class="navitem soon"><span class="dot"></span>${label}<em>Soon</em></span>`
    : `<a href="#/${id}" data-id="${id}"><span class="dot"></span>${label}</a>`;
  navEl.innerHTML = NAV.map((sec) => {
    const items = sec.items.map(itemHtml).join("");
    if (!sec.group) return `<div class="group-items nogroup">${items}</div>`;
    const c = COLLAPSED.has(sec.group) ? " collapsed" : "";
    return `<div class="navgroup${c}" data-group="${sec.group}"><button class="group-toggle" data-group="${sec.group}" aria-expanded="${!c}">${sec.group}<span class="chev">${chev}</span></button><div class="group-items">${items}</div></div>`;
  }).join("");

  // collapse / expand groups (delegated), persisted
  navEl.addEventListener("click", (e) => {
    const t = e.target.closest(".group-toggle");
    if (!t) return;
    const grp = t.closest(".navgroup");
    const collapsed = grp.classList.toggle("collapsed");
    t.setAttribute("aria-expanded", String(!collapsed));
    if (collapsed) COLLAPSED.add(t.dataset.group); else COLLAPSED.delete(t.dataset.group);
    saveCollapsed();
  });

  function route() {
    let id = (location.hash.replace(/^#\//, "") || "overview");
    if (!PAGES[id]) id = "overview";
    const p = PAGES[id];
    pageEl.innerHTML = p.render();
    crumbEl.innerHTML = "Design system <b>· " + (p.crumb || p.title) + "</b>";
    document.title = "Vadal DS — " + p.title;
    navEl.querySelectorAll("a").forEach((a) => a.classList.toggle("active", a.dataset.id === id));
    const activeA = navEl.querySelector("a.active");          // keep the active item's group open
    if (activeA) { const g = activeA.closest(".navgroup"); if (g) g.classList.remove("collapsed"); }
    pageEl.scrollTop = 0; window.scrollTo(0, 0);
    app.classList.remove("nav-open");
  }
  window.addEventListener("hashchange", route);

  /* theme toggle */
  const themebtn = document.getElementById("themebtn");
  const sun = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M4.5 4.5l1.4 1.4M18.1 18.1l1.4 1.4M2.5 12h2M19.5 12h2M4.5 19.5l1.4-1.4M18.1 5.9l1.4-1.4"/></svg>';
  const moon = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13.5A8 8 0 1 1 10.5 4a6.2 6.2 0 0 0 9.5 9.5Z"/></svg>';
  function syncTheme() { themebtn.innerHTML = document.documentElement.classList.contains("dark") ? sun : moon; }
  themebtn.addEventListener("click", () => {
    const dark = document.documentElement.classList.toggle("dark");
    try { localStorage.setItem("vadal-ds-theme", dark ? "dark" : "light"); } catch (e) {}
    syncTheme();
  });
  syncTheme();

  /* high-legibility mode (Atkinson Hyperlegible) */
  const hlbtn = document.getElementById("hlbtn");
  const syncHl = () => hlbtn.setAttribute("aria-pressed", String(document.documentElement.classList.contains("hl")));
  hlbtn.addEventListener("click", () => {
    const on = document.documentElement.classList.toggle("hl");
    try { localStorage.setItem("vadal-ds-hl", on ? "1" : "0"); } catch (e) {}
    syncHl();
  });
  syncHl();

  /* mobile menu + nav filter */
  document.getElementById("menubtn").addEventListener("click", () => app.classList.toggle("nav-open"));
  document.getElementById("scrim").addEventListener("click", () => app.classList.remove("nav-open"));
  document.getElementById("navfilter").addEventListener("input", (e) => {
    const q = e.target.value.trim().toLowerCase();
    navEl.querySelectorAll("a, .navitem").forEach((el) => { el.style.display = el.textContent.toLowerCase().includes(q) ? "" : "none"; });
    navEl.querySelectorAll(".navgroup").forEach((grp) => {
      const hit = [...grp.querySelectorAll("a, .navitem")].some((i) => i.style.display !== "none");
      grp.style.display = hit ? "" : "none";
      if (q) grp.classList.remove("collapsed");                 // expand while searching
      else grp.classList.toggle("collapsed", COLLAPSED.has(grp.dataset.group)); // restore saved state
    });
  });

  route();
})();
