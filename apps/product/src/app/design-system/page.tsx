/* Vadal Design System — code preview (living styleguide).
   Rendered from the generated tokens (packages/design-system → tokens.scoped.css), scoped under
   [data-ds] so it stays Aurora without affecting other product pages. Surfaced from the Project
   Dashboard ("Design system" card). */
import "./tokens.scoped.css";
import type { CSSProperties } from "react";

export const metadata = { title: "Vadal Design System — code preview" };

const v = (name: string): CSSProperties => ({ background: `var(--${name})` });

const COLOR_GROUPS: { group: string; names: string[] }[] = [
  { group: "Surfaces", names: ["background", "canvas", "card", "soft", "line", "border-strong"] },
  { group: "Text", names: ["ink", "muted", "faint", "on-brand", "inverse", "inverse-text"] },
  { group: "Brand & accent", names: ["brand", "brand-strong", "brand-soft", "brand-text", "spark", "signal"] },
  { group: "Aurora gradient", names: ["grad-from", "grad-via", "grad-to"] },
  { group: "Status", names: ["success", "success-soft", "danger", "danger-soft", "warning", "warning-soft", "info", "info-soft"] },
  { group: "Pastel surfaces", names: ["surface-lilac", "surface-mint", "surface-butter"] },
];

function Swatch({ name }: { name: string }) {
  return (
    <div className="flex items-center gap-2.5 w-[210px]">
      <div className="h-10 w-10 rounded-lg shrink-0" style={{ ...v(name), boxShadow: "inset 0 0 0 1px var(--line)" }} />
      <div className="min-w-0">
        <div className="text-[13px] font-medium leading-tight" style={{ color: "var(--ink)" }}>{name}</div>
        <div className="text-[11px]" style={{ color: "var(--faint)" }}>var(--{name})</div>
      </div>
    </div>
  );
}

function Palette() {
  return (
    <div className="flex flex-col gap-5">
      {COLOR_GROUPS.map((g) => (
        <div key={g.group} className="flex flex-col gap-2.5">
          <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--muted)" }}>{g.group}</div>
          <div className="flex flex-wrap gap-3">{g.names.map((n) => <Swatch key={n} name={n} />)}</div>
        </div>
      ))}
    </div>
  );
}

/* ---- Button (mirrors @vadal/design-system Button, token-bound) ---- */
const BTN: Record<string, CSSProperties> = {
  primary: { background: "var(--button-primary-bg)", color: "var(--button-primary-label)" },
  brand: { background: "var(--button-brand-bg)", color: "var(--button-brand-label)" },
  secondary: { background: "var(--button-secondary-bg)", color: "var(--button-secondary-label)" },
  tertiary: { background: "var(--button-tertiary-bg)", color: "var(--button-tertiary-label)", boxShadow: "inset 0 0 0 1px var(--button-tertiary-border)" },
  ghost: { background: "transparent", color: "var(--button-ghost-label)" },
  destructive: { background: "var(--button-danger-bg)", color: "var(--button-danger-label)" },
  ai: { backgroundImage: "linear-gradient(105deg, var(--grad-from), var(--grad-via), var(--grad-to))", color: "#fff" },
};
function Btn({ variant, children, lead, trail }: { variant: keyof typeof BTN; children: string; lead?: React.ReactNode; trail?: React.ReactNode }) {
  return (
    <button className="inline-flex h-10 items-center justify-center gap-2 rounded-full px-4 text-sm font-medium" style={BTN[variant]}>
      {lead}{children}{trail}
    </button>
  );
}
const ArrowR = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3.5 12h15.5" /><path d="m13 6 6 6-6 6" /></svg>);
const Plus = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M12 5.5v13M5.5 12h13" /></svg>);
const Spark = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.3c.5 4.8 2.4 6.7 7.2 7.2-4.8.5-6.7 2.4-7.2 7.2-.5-4.8-2.4-6.7-7.2-7.2C9.6 9 11.5 7.1 12 2.3Z" /></svg>);

/* ---- Input (mirrors the Figma Input states) ---- */
function Field({ label, value, helper, state }: { label: string; value: string; helper: string; state: "default" | "focus" | "error" | "disabled" }) {
  const border = state === "focus" ? "var(--input-border-focus)" : state === "error" ? "var(--input-border-error)" : "var(--input-border)";
  return (
    <div className="flex w-[280px] flex-col gap-1.5">
      <div className="text-[13px] font-medium" style={{ color: state === "disabled" ? "var(--input-label-disabled)" : "var(--input-label)" }}>{label}</div>
      <div className="flex h-11 items-center rounded-[10px] px-3.5 text-sm"
        style={{ background: state === "disabled" ? "var(--input-bg-disabled)" : "var(--input-bg)", boxShadow: `inset 0 0 0 ${state === "focus" ? 1.5 : 1}px ${border}`, color: value === "Placeholder" ? "var(--input-placeholder)" : "var(--input-value)", outline: state === "focus" ? "3px solid var(--input-focus-ring)" : "none" }}>
        {value}
      </div>
      <div className="text-xs" style={{ color: state === "error" ? "var(--input-helper-error)" : "var(--input-helper)" }}>{helper}</div>
    </div>
  );
}

/* ---- Badge (mirrors @vadal/design-system Badge tones) ---- */
const BADGE: Record<string, CSSProperties> = {
  neutral: { background: "var(--badge-neutral-bg)", color: "var(--badge-neutral-label)" },
  brand: { background: "var(--badge-brand-bg)", color: "var(--badge-brand-label)" },
  success: { background: "var(--badge-success-bg)", color: "var(--badge-success-label)" },
  warning: { background: "var(--badge-warning-bg)", color: "var(--badge-warning-label)" },
  danger: { background: "var(--badge-danger-bg)", color: "var(--badge-danger-label)" },
  info: { background: "var(--badge-info-bg)", color: "var(--badge-info-label)" },
};
function Badge({ tone, children, dot }: { tone: keyof typeof BADGE; children: string; dot?: boolean }) {
  return (
    <span className="inline-flex h-6 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium" style={BADGE[tone]}>
      {dot && <span className="h-1.5 w-1.5 rounded-full" style={{ background: "currentColor" }} />}
      {children}
    </span>
  );
}

/* ---- Avatar (mirrors @vadal/design-system Avatar — photo/initials, status, group) ---- */
const AV_PX = { sm: 32, md: 40, lg: 48 } as const;
function Avatar({ initials, photo, size = "md", status, ring }: { initials?: string; photo?: string; size?: keyof typeof AV_PX; status?: "online" | "busy" | "away" | "offline"; ring?: boolean }) {
  const px = AV_PX[size];
  const dot = Math.round(px * 0.28);
  return (
    <span className="relative inline-flex shrink-0 items-center justify-center rounded-full font-semibold"
      style={{ width: px, height: px, background: "var(--avatar-bg)", color: "var(--avatar-label)", fontSize: size === "sm" ? 12 : size === "lg" ? 16 : 14, backgroundImage: photo, boxShadow: ring ? "0 0 0 2px var(--avatar-ring), 0 0 0 4px var(--brand)" : undefined }}>
      {!photo && initials}
      {status && <span className="absolute bottom-0 right-0 rounded-full" style={{ width: dot, height: dot, background: `var(--avatar-status-${status})`, boxShadow: "0 0 0 2px var(--avatar-status-ring)" }} />}
    </span>
  );
}

/* ---- Selection controls (static specimens — checkbox · radio · switch) ---- */
const Tick = () => (<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="var(--checkbox-check)" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round"><path d="M3.5 8.5 6.5 11.5 12.5 4.5" /></svg>);
const Dash = () => (<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="var(--checkbox-check)" strokeWidth="2.25" strokeLinecap="round"><path d="M4 8h8" /></svg>);
function CheckBox({ state }: { state: "off" | "on" | "indeterminate" }) {
  const filled = state !== "off";
  return (
    <span className="grid h-[18px] w-[18px] place-items-center rounded-[6px]"
      style={{ background: filled ? "var(--checkbox-bg-checked)" : "var(--checkbox-bg)", boxShadow: `inset 0 0 0 1px ${filled ? "var(--checkbox-border-checked)" : "var(--checkbox-border)"}` }}>
      {state === "on" && <Tick />}
      {state === "indeterminate" && <Dash />}
    </span>
  );
}
function RadioDot({ on }: { on: boolean }) {
  return (
    <span className="grid h-[18px] w-[18px] place-items-center rounded-full"
      style={{ background: "var(--radio-bg)", boxShadow: `inset 0 0 0 ${on ? 1.5 : 1}px ${on ? "var(--radio-border-checked)" : "var(--radio-border)"}` }}>
      {on && <span className="h-2 w-2 rounded-full" style={{ background: "var(--radio-dot)" }} />}
    </span>
  );
}
function Toggle({ on }: { on: boolean }) {
  return (
    <span className="flex h-6 w-11 items-center rounded-full p-0.5" style={{ background: on ? "var(--switch-track-on)" : "var(--switch-track-off)" }}>
      <span className="h-5 w-5 rounded-full" style={{ background: "var(--switch-thumb)", boxShadow: "0 1px 3px rgba(0,0,0,.22)", transform: on ? "translateX(20px)" : "none" }} />
    </span>
  );
}
function ControlRow({ control, label }: { control: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-2.5 text-sm" style={{ color: "var(--ink)" }}>
      {control}<span className="font-medium">{label}</span>
    </span>
  );
}

function Section({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold" style={{ color: "var(--ink)" }}>{title}</h2>
        {desc && <p className="text-sm" style={{ color: "var(--muted)" }}>{desc}</p>}
      </div>
      {children}
    </section>
  );
}
function Card({ children, label }: { children: React.ReactNode; label?: string }) {
  return (
    <div className="rounded-2xl p-6" style={{ background: "var(--card)", boxShadow: "inset 0 0 0 1px var(--line)" }}>
      {label && <div className="mb-4 text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--faint)" }}>{label}</div>}
      {children}
    </div>
  );
}

export default function DesignSystemPage() {
  return (
    <main data-ds style={{ background: "var(--canvas)" }} className="min-h-screen px-6 py-12 sm:px-10">
      <div className="mx-auto flex max-w-[1100px] flex-col gap-12">
        {/* header */}
        <header className="flex flex-col gap-3">
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: "var(--brand-text)" }}>Vadal Design System · in code</span>
          <h1 className="text-4xl font-bold" style={{ color: "var(--ink)", fontFamily: "var(--font-grotesk)" }}>Design system</h1>
          <p className="max-w-[640px] text-[15px]" style={{ color: "var(--muted)" }}>
            Rendered live from <code>@vadal/design-system</code> tokens (DTCG → Style Dictionary), kept in sync with the
            Figma library. Aurora colour · Lumen light + dark · Contra-inspired components.
          </p>
        </header>

        {/* aurora hero */}
        <div className="relative h-40 overflow-hidden rounded-2xl px-8 py-7" style={{ backgroundImage: "linear-gradient(105deg, var(--grad-from), var(--grad-via), var(--grad-to))" }}>
          <div className="text-3xl font-bold text-white" style={{ fontFamily: "var(--font-grotesk)" }}>Aurora</div>
          <div className="mt-1 text-sm text-white/90">Clarity — signal &amp; insight in motion</div>
          <div className="absolute right-7 top-7 h-6 w-6 rounded-full" style={{ background: "var(--spark)" }} />
        </div>

        {/* color */}
        <Section title="Colour tokens" desc="Every token aliases the Aurora system and flips with light / dark. Names mirror the code CSS variables.">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card label="Light"><Palette /></Card>
            <div className="dark"><div data-ds><Card label="Dark"><Palette /></Card></div></div>
          </div>
        </Section>

        {/* type */}
        <Section title="Typography" desc="Space Grotesk for display, Inter for UI, Instrument Serif for editorial.">
          <Card>
            <div className="flex flex-col gap-3" style={{ color: "var(--ink)" }}>
              <div style={{ fontFamily: "var(--font-grotesk)", fontSize: 40, fontWeight: 700, letterSpacing: "-0.01em" }}>Keep companies human</div>
              <div style={{ fontSize: 24, fontWeight: 600 }}>The morning signal</div>
              <div style={{ fontSize: 16 }}>A clear read on how people feel — every day, not every quarter.</div>
              <div style={{ fontFamily: "var(--font-serif)", fontSize: 26 }}>Intelligence, made human.</div>
            </div>
          </Card>
        </Section>

        {/* components */}
        <Section title="Components" desc="The canonical components live in @vadal/design-system and map 1:1 to the Figma library via Code Connect.">
          <Card label="Button — 7 types">
            <div className="flex flex-wrap items-center gap-3">
              <Btn variant="primary" lead={<Plus />}>New</Btn>
              <Btn variant="brand" trail={<ArrowR />}>Next</Btn>
              <Btn variant="secondary">Details</Btn>
              <Btn variant="tertiary">Cancel</Btn>
              <Btn variant="ghost">Skip</Btn>
              <Btn variant="destructive">Delete</Btn>
              <Btn variant="ai" lead={<Spark />}>Ask HR</Btn>
            </div>
          </Card>
          <Card label="Input — states">
            <div className="flex flex-wrap gap-6">
              <Field label="Email" value="Placeholder" helper="Helper text" state="default" />
              <Field label="Email" value="jane@oliandhue.com" helper="Looks good." state="focus" />
              <Field label="Email" value="not-an-email" helper="This field is required" state="error" />
              <Field label="Email" value="Placeholder" helper="Helper text" state="disabled" />
            </div>
          </Card>
          <Card label="Badge — tones">
            <div className="flex flex-wrap items-center gap-2.5">
              <Badge tone="neutral">Neutral</Badge>
              <Badge tone="brand">Brand</Badge>
              <Badge tone="success" dot>Online</Badge>
              <Badge tone="warning">3 due</Badge>
              <Badge tone="danger">At risk</Badge>
              <Badge tone="info">Beta</Badge>
            </div>
          </Card>
          <Card label="Avatar — sizes, status & group">
            <div className="flex flex-wrap items-center gap-7">
              <div className="flex items-center gap-3">
                <Avatar initials="JS" size="sm" />
                <Avatar photo="linear-gradient(135deg,#7c5cf8,#3b9eff)" size="md" status="online" />
                <Avatar initials="BL" size="lg" status="busy" />
                <Avatar photo="linear-gradient(135deg,#23d7be,#3b9eff)" size="md" ring />
              </div>
              <div className="flex items-center">
                {["linear-gradient(135deg,#7c5cf8,#3b9eff)", "linear-gradient(135deg,#23d7be,#3b9eff)", "linear-gradient(135deg,#ff8a5b,#fb4b43)"].map((g, i) => (
                  <span key={i} className="-ml-2 rounded-full first:ml-0" style={{ boxShadow: "0 0 0 2px var(--avatar-ring)" }}><Avatar photo={g} size="md" /></span>
                ))}
                <span className="-ml-2 rounded-full" style={{ boxShadow: "0 0 0 2px var(--avatar-ring)" }}><Avatar initials="+3" size="md" /></span>
              </div>
            </div>
          </Card>
          <Card label="Selection controls — checkbox · radio · switch">
            <div className="flex flex-wrap gap-x-10 gap-y-4">
              <ControlRow control={<CheckBox state="off" />} label="Unchecked" />
              <ControlRow control={<CheckBox state="on" />} label="Checked" />
              <ControlRow control={<CheckBox state="indeterminate" />} label="Indeterminate" />
              <ControlRow control={<RadioDot on={false} />} label="Radio off" />
              <ControlRow control={<RadioDot on={true} />} label="Radio on" />
              <ControlRow control={<Toggle on={false} />} label="Switch off" />
              <ControlRow control={<Toggle on={true} />} label="Switch on" />
            </div>
          </Card>
        </Section>

        <footer className="border-t pt-6 text-sm" style={{ borderColor: "var(--line)", color: "var(--faint)" }}>
          Source of truth: <code>packages/design-system</code> · Figma library kept in sync · full 6-page uSpec lives in Figma.
        </footer>
      </div>
    </main>
  );
}
