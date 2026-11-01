"use client";
import { useCallback, useState } from "react";
import { usePaletteShortcut } from "@/hooks/use-palette-shortcut";
import { launchPalette } from "@/config/site";
import { fromHsl, harmony } from "@/lib/colors";
/** Palette editing, undo, locking and keyboard interactions shared by homepage sections. */
export function usePalettePlayground() {
  const [palette, setPalette] = useState(launchPalette);
  const [locked, setLocked] = useState<boolean[]>(Array(5).fill(false));
  const [history, setHistory] = useState<string[][]>([]);
  const [notice, setNotice] = useState("");
  const [generation, setGeneration] = useState(0);
  const [harmonyMode, setHarmonyMode] = useState("Analogous");
  const shuffle = useCallback(() => {
    const next = harmony(
      fromHsl(Math.random() * 360, 55 + Math.random() * 25, 64),
      harmonyMode,
    );
    setHistory((h) => [...h.slice(-19), palette]);
    setPalette(palette.map((c, i) => (locked[i] ? c : next[i])));
    setGeneration((v) => v + 1);
    setNotice("Fresh colors, fresh possibilities.");
  }, [palette, locked, harmonyMode]);
  usePaletteShortcut(shuffle);
  const save = () =>
    localStorage.setItem("kolivra-palette", JSON.stringify(palette));
  const change = (index: number, color: string) => {
    setHistory((h) => [...h.slice(-19), palette]);
    setPalette(palette.map((c, i) => (i === index ? color : c)));
    setGeneration((v) => v + 1);
  };
  return {
    harmonyMode,
    setHarmonyMode,
    palette,
    setPalette,
    locked,
    setLocked,
    history,
    setHistory,
    notice,
    setNotice,
    generation,
    setGeneration,
    shuffle,
    save,
    change,
  };
}
export type PalettePlaygroundState = ReturnType<typeof usePalettePlayground>;
