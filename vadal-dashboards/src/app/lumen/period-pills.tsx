"use client";

import { useState } from "react";

const PERIODS = ["7 days", "30 days", "Quarter", "Year"];

export function PeriodPills() {
  const [active, setActive] = useState("30 days");
  return (
    <div className="flex items-center gap-1.5">
      {PERIODS.map((p) => (
        <button
          key={p}
          onClick={() => setActive(p)}
          className={`rounded-full px-3.5 py-1.5 text-[12px] transition ${
            active === p
              ? "bg-ink font-semibold text-background"
              : "border border-line bg-card font-medium text-muted hover:border-faint/40 hover:text-ink"
          }`}
        >
          {p}
        </button>
      ))}
    </div>
  );
}
