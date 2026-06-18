/* ════════════════════════════════════════════════════════════════════
   ASSETS — downloadable brand files (what we have today).
   The established Iris × Quiet Clarity lockups + the mark.
   ════════════════════════════════════════════════════════════════════ */

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vadal.ai — Assets",
  description: "Download the Vadal brand assets — lockups and the mark.",
};

type Asset = { name: string; file: string; note: string; mode: "light" | "dark"; box?: string };

const ASSETS: Asset[] = [
  { name: "Primary lockup — light", file: "/brand/lockup-light.svg", note: "SVG · for light backgrounds", mode: "light", box: "max-w-[300px]" },
  { name: "Primary lockup — dark", file: "/brand/lockup-dark.svg", note: "SVG · for dark backgrounds", mode: "dark", box: "max-w-[300px]" },
  { name: "Mark — Iris", file: "/brand/iris-mark.svg", note: "SVG · the symbol alone", mode: "light", box: "h-[120px]" },
  { name: "Mark — on dark", file: "/brand/iris-mark.svg", note: "SVG · the symbol on dark", mode: "dark", box: "h-[120px]" },
];

function DownloadIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 3v12m0 0 4-4m-4 4-4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
    </svg>
  );
}

export default function Assets() {
  return (
    <main className="mx-auto max-w-[1180px] px-6 py-16 sm:px-10 sm:py-20">
      <p className="font-grotesk text-[11px] font-semibold uppercase tracking-[0.24em] text-[#7c5cf8]">Brand assets</p>
      <h1 className="mt-4 font-grotesk text-[clamp(2.4rem,6vw,4.2rem)] font-bold leading-[0.98] tracking-[-0.03em]">Assets</h1>
      <p className="mt-5 max-w-[56ch] text-[17px] leading-relaxed text-muted">
        The current Iris × Quiet Clarity brand files. More formats (PNG, app icon, the full deck
        export) land here as we produce them.
      </p>

      <div className="mt-12 grid gap-5 sm:grid-cols-2">
        {ASSETS.map((a) => (
          <div key={a.name} className="overflow-hidden rounded-3xl border border-line bg-card">
            <div
              className={`flex items-center justify-center p-8 ${a.mode === "light" ? "" : ""}`}
              style={{ background: a.mode === "light" ? "#f4f6f9" : "#0d0b16", minHeight: 200 }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={a.file} alt={a.name} className={`w-full ${a.box ?? ""}`} />
            </div>
            <div className="flex items-center justify-between gap-4 px-6 py-5">
              <div>
                <div className="font-grotesk text-[15.5px] font-semibold">{a.name}</div>
                <div className="mt-0.5 text-[12.5px] text-muted">{a.note}</div>
              </div>
              <a
                href={a.file}
                download
                className="inline-flex shrink-0 items-center gap-2 rounded-full border border-line bg-white px-4 py-2 font-grotesk text-[13px] font-semibold text-ink transition-colors hover:border-[#c9b8ff] hover:text-[#5b4bd6]"
              >
                <DownloadIcon /> Download
              </a>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-10 text-[13px] text-faint">
        Source files live in <code className="font-grotesk">brand/logo/</code>. Need a specific
        format or size? Just ask.
      </p>
    </main>
  );
}
