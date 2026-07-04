"use client";
/* Applies the client's saved branding (Settings → Branding) across the product.
   Reads the persisted brand colour / white-label / band-fill from localStorage and
   sets them as CSS variables + data-attributes on <html>, so surfaces like the
   Home greeting band can theme themselves with the customer's colour. Re-applies
   live when Branding is saved (vadal:brand event) or another tab changes it. */
import * as React from "react";

function apply() {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  let color: string | null = null;
  let whiteLabel = false;
  let bandFill = true;
  try {
    color = JSON.parse(localStorage.getItem("vadal:brand-color") ?? "null");
    whiteLabel = JSON.parse(localStorage.getItem("vadal:brand-whitelabel") ?? "false");
    bandFill = JSON.parse(localStorage.getItem("vadal:brand-band-fill") ?? "true");
  } catch {
    /* ignore malformed values */
  }
  if (color) root.style.setProperty("--client-brand", color);
  else root.style.removeProperty("--client-brand");
  root.dataset.whitelabel = whiteLabel ? "on" : "off";
  root.dataset.bandFill = bandFill ? "on" : "off";
}

export function BrandProvider() {
  React.useEffect(() => {
    apply();
    const onBrand = () => apply();
    window.addEventListener("vadal:brand", onBrand);
    window.addEventListener("storage", onBrand);
    return () => {
      window.removeEventListener("vadal:brand", onBrand);
      window.removeEventListener("storage", onBrand);
    };
  }, []);
  return null;
}
