"use client";

import { useEffect } from "react";
import { handlePaletteShortcut } from "@/lib/palette-shortcut";

/** Shared shortcut for the landing-page playground and Palette Studio. */
export function usePaletteShortcut(generate: () => void) {
  useEffect(() => {
    const handle = (event: KeyboardEvent) => handlePaletteShortcut(event, generate);
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [generate]);
}
