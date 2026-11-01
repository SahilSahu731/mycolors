"use client";
import Link from "next/link";
import { usePaletteShortcut } from "@/hooks/use-palette-shortcut";
import { useState } from "react";
import { ColorInput, CopyButton, download } from "@/components/ui";
import { fromHsl, harmony, ink, paletteCSS } from "@/lib/colors";
import Export from "./shared/export-panel";
export default function Palette({
  palette,
  setPalette,
}: {
  palette: string[];
  setPalette: (p: string[]) => void;
}) {
  const [locked, setLocked] = useState<boolean[]>(Array(5).fill(false));
  const [mode, setMode] = useState("Analogous");
  const [previous, setPrevious] = useState<string[] | null>(null);
  function change(next: string[]) {
    setPrevious(palette);
    setPalette(next);
  }
  function generate() {
    const next = harmony(
      fromHsl(Math.random() * 360, 40 + Math.random() * 40, 60),
      mode,
    );
    change(palette.map((v, i) => (locked[i] ? v : next[i])));
  }
  usePaletteShortcut(generate);
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[22px] bg-soft p-3">
        <div className="flex flex-wrap items-center gap-2">
          <select
            aria-label="Palette harmony"
            value={mode}
            onChange={(e) => setMode(e.target.value)}
          >
            {["Analogous", "Complementary", "Triadic"].map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
          <button
            disabled={!previous}
            onClick={() => {
              if (previous) {
                setPalette(previous);
                setPrevious(null);
              }
            }}
            className="min-h-11 rounded-full px-4 text-xs disabled:opacity-35"
          >
            ↶ Undo
          </button>
          <button
            onClick={() => setLocked(Array(5).fill(false))}
            className="min-h-11 rounded-full px-4 text-xs hover:bg-surface"
          >
            Unlock all
          </button>
        </div>
        <button
          onClick={generate}
          className="min-h-11 rounded-full bg-ink px-6 text-xs font-semibold text-page hover:opacity-80"
        >
          ↻ Generate palette
        </button>
      </div>
      <div className="grid overflow-hidden rounded-[32px] sm:grid-cols-5">
        {palette.map((color, i) => (
          <section
            key={i}
            className="group relative flex min-h-64 flex-col justify-between gap-5 p-5 sm:min-h-[480px] sm:px-3 lg:min-h-[540px] lg:px-5"
            style={{ background: color, color: ink(color) }}
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs opacity-55">0{i + 1}</span>
              <button
                aria-label={`${locked[i] ? "Unlock" : "Lock"} color ${i + 1}`}
                aria-pressed={locked[i]}
                onClick={() =>
                  setLocked(locked.map((v, j) => (j === i ? !v : v)))
                }
                className="min-h-10 rounded-full bg-white/25 px-3 text-xs hover:bg-white/45"
              >
                {locked[i] ? "● Locked" : "○ Lock"}
              </button>
            </div>
            <div className="flex flex-col gap-4">
              <p className="text-xl font-semibold tracking-tight lg:text-2xl">
                {color.toUpperCase()}
              </p>
              <div className="rounded-2xl bg-surface/95 p-3 text-ink [&_label]:min-w-0 [&_label>div]:flex-wrap [&_input]:max-w-full">
                <ColorInput
                  label={`Color ${i + 1}`}
                  value={color}
                  onChange={(v) =>
                    change(palette.map((c, j) => (j === i ? v : c)))
                  }
                />
                <div className="mt-3">
                  <CopyButton text={color} label="Copy HEX" />
                </div>
              </div>
            </div>
          </section>
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
        <Export text={paletteCSS(palette)} />
        <div className="flex flex-col items-start justify-center gap-5 rounded-[28px] bg-soft p-6">
          <h2 className="text-2xl font-semibold tracking-tight">
            Good colors deserve a home.
          </h2>
          <button
            className="min-h-11 rounded-full bg-ink px-5 text-xs text-page"
            onClick={() =>
              download(
                JSON.stringify(palette, null, 2),
                "mycolors-palette.json",
              )
            }
          >
            Download JSON ↓
          </button>
          <Link href="/tools/theme-studio" className="text-xs font-semibold">
            Build a theme →
          </Link>
        </div>
      </div>
    </>
  );
}
