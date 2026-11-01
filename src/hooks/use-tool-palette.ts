"use client";
import { useEffect, useState } from "react";
import { initialPalette, normalize } from "@/lib/colors";

/** Shared color data only: every tool owns its layout and controls. */
export function useToolPalette() {
  const [palette, updatePalette] = useState(initialPalette);
  const [base, setBase] = useState(initialPalette[0]);
  useEffect(() => {
    try {
      const saved: unknown = JSON.parse(
        localStorage.getItem("kolivra-palette") || "null",
      );
      if (
        Array.isArray(saved) &&
        saved.length === 5 &&
        saved.every((c) => typeof c === "string" && normalize(c))
      ) {
        updatePalette(saved);
        setBase(saved[0]);
      }
    } catch {
      /* Storage is optional. */
    }
  }, []);
  function setPalette(colors: string[]) {
    updatePalette(colors);
    setBase(colors[0]);
    try {
      localStorage.setItem("kolivra-palette", JSON.stringify(colors));
    } catch {
      /* Keep working without storage. */
    }
  }
  return { palette, setPalette, base, setBase };
}
