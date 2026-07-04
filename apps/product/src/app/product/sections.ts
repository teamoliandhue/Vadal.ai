/* Section registry for not-yet-built nav destinations — drives the [section]
   coming-soon route + keeps labels in sync with the sidebar (Shell RAIL).
   Every nav destination now has a real route, so this registry is empty and the
   [section] catch-all simply 404s unknown paths. Add an entry here to stub a new
   section before it's built. */
import { type LucideIcon } from "lucide-react";

export type SectionMeta = {
  label: string; // must match the sidebar RAIL label exactly (drives active state)
  Icon: LucideIcon;
  tagline: string;
  bullets: string[];
  ask: string;
};

export const SECTIONS: Record<string, SectionMeta> = {};
