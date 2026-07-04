"use client";
/* Shared client-branding state (Settings → Branding). Reads the saved brand
   colour, band-fill, white-label flag and Vadal-logo placement from localStorage
   and stays in sync via the vadal:brand event. Used by the sidebar logo, the
   Home brand layer and the "Powered by Vadal" badge. */
import * as React from "react";

export type Brand = { color: string | null; band: boolean; white: boolean; placement: string };
const DEFAULT: Brand = { color: null, band: true, white: false, placement: "Next to profile" };

function read(): Brand {
  if (typeof localStorage === "undefined") return DEFAULT;
  try {
    return {
      color: JSON.parse(localStorage.getItem("vadal:brand-color") ?? "null"),
      band: JSON.parse(localStorage.getItem("vadal:brand-band-fill") ?? "true"),
      white: JSON.parse(localStorage.getItem("vadal:brand-whitelabel") ?? "false"),
      placement: JSON.parse(localStorage.getItem("vadal:brand-vadal-placement") ?? '"Next to profile"'),
    };
  } catch {
    return DEFAULT;
  }
}

export function useBrand(): Brand {
  // Start from DEFAULT so SSR and the first client render match (no hydration flip).
  const [brand, setBrand] = React.useState<Brand>(DEFAULT);
  React.useEffect(() => {
    setBrand(read());
    const on = () => setBrand(read());
    window.addEventListener("vadal:brand", on);
    window.addEventListener("storage", on);
    return () => { window.removeEventListener("vadal:brand", on); window.removeEventListener("storage", on); };
  }, []);
  return brand;
}
