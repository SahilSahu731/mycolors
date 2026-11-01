"use client";
import Link from "next/link";
import { usePaletteShortcut } from "@/hooks/use-palette-shortcut";
import { useState } from "react";
import { ColorInput, download } from "@/components/ui";
import { fromHsl, harmony, ink, paletteCSS } from "@/lib/colors";
import Export from "@/components/tools/shared/export-panel";
export default function Palette({
  palette,
  setPalette,
}: {
  palette: string[];
  setPalette: (p: string[]) => void;
}) {
  const [locked, setLocked] = useState<boolean[]>(Array(5).fill(false));
  function generate() {
    const c = fromHsl(Math.random() * 360, 40 + Math.random() * 40, 60);
    const next = harmony(
      c,
      ["Analogous", "Triadic", "Complementary"][Math.floor(Math.random() * 3)],
    );
    setPalette(palette.map((v, i) => (locked[i] ? v : next[i])));
  }
  usePaletteShortcut(generate);
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4 [&_h3]:text-sm [&_h3]:font-medium">
        <p className="text-xs leading-7 text-muted">
          Press space to explore. Lock the colors you love.
        </p>
        <button
          className="inline-flex min-h-11 items-center justify-center gap-3 rounded-lg border border-ink bg-ink px-5 py-3 text-xs font-medium text-page transition hover:-translate-y-0.5 motion-reduce:transform-none disabled:transform-none"
          onClick={generate}
        >
          ↻ Generate palette
        </button>
      </div>
      <div className="grid grid-cols-5 gap-1 md:gap-2 [&_label]:mt-4 [&_label]:min-w-0 [&_input]:min-w-0 [&_input:not([type=color])]:w-full [&_input:not([type=color])]:text-[9px] max-sm:[&_label>div]:flex-col">
        {palette.map((c, i) => (
          <div key={i}>
            <div
              className="flex h-60 flex-col items-center justify-between rounded-lg px-1 py-5 md:h-80 md:px-4 [&>span]:self-start [&>span]:text-[10px] [&>span]:opacity-50 [&>button]:rounded-lg [&>button]:bg-white/20 [&>button]:p-2 [&>button]:text-[9px] [&>b]:text-[9px] [&>b]:font-medium md:[&>b]:text-sm"
              style={{ background: c, color: ink(c) }}
            >
              <span>0{i + 1}</span>
              <button
                aria-label={`${locked[i] ? "Unlock" : "Lock"} color ${i + 1}`}
                onClick={() =>
                  setLocked(locked.map((v, j) => (j === i ? !v : v)))
                }
              >
                {locked[i] ? "● Locked" : "○ Lock"}
              </button>
              <b>{c.toUpperCase()}</b>
            </div>
            <ColorInput
              label={`Color ${i + 1}`}
              value={c}
              onChange={(v) =>
                setPalette(palette.map((x, j) => (j === i ? v : x)))
              }
            />
          </div>
        ))}
      </div>
      <Export text={paletteCSS(palette)} />
      <div className="flex flex-wrap items-center gap-3">
        <button
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-line bg-surface px-4 py-2.5 text-xs font-medium text-ink transition hover:bg-soft"
          onClick={() =>
            download(JSON.stringify(palette, null, 2), "mycolors-palette.json")
          }
        >
          Export JSON ↓
        </button>
        <Link
          href="/tools/theme-studio"
          className="inline-flex items-center gap-3 bg-transparent py-2 text-xs"
        >
          Build a theme with these colors{" "}
        </Link>
      </div>
    </>
  );
}
