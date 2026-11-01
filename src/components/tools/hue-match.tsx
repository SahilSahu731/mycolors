"use client";
import { useState } from "react";
import { harmony, ink, paletteCSS } from "@/lib/colors";
import Swatches from "@/components/tools/shared/swatches";
import Export from "@/components/tools/shared/export-panel";
export default function Matcher({
  base,
  setPalette,
}: {
  base: string;
  setPalette: (p: string[]) => void;
}) {
  const [mode, setMode] = useState("Analogous");
  const [context, setContext] = useState("Branding");
  const [saved, setSaved] = useState(false);
  const colors = harmony(base, mode);
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4 [&_h3]:text-sm [&_h3]:font-medium">
        <div className="flex flex-wrap gap-1 [&>button]:flex [&>button]:items-center [&>button]:gap-2 [&>button]:rounded-md [&>button]:px-3 [&>button]:py-2 [&>button]:text-xs [&>button]:text-muted [&_span]:text-[9px]">
          {["Branding", "Interiors", "Outfits"].map((v) => (
            <button
              className={v === context ? "bg-ink! text-page!" : ""}
              key={v}
              onClick={() => setContext(v)}
            >
              {v}
            </button>
          ))}
        </div>
        <select
          aria-label="Harmony type"
          value={mode}
          onChange={(e) => setMode(e.target.value)}
        >
          {["Analogous", "Complementary", "Triadic"].map((v) => (
            <option key={v}>{v}</option>
          ))}
        </select>
      </div>
      <div
        className="flex flex-col items-start justify-between gap-8 rounded-xl p-7 md:min-h-80 md:flex-row md:items-center md:p-12 [&>div:first-child]:max-w-md [&_span]:text-[9px] [&_span]:tracking-widest [&_h2]:mt-5 [&_h2]:text-4xl [&_h2]:tracking-tight [&_p]:mt-4 [&_p]:text-xs [&_p]:leading-7 [&_p]:opacity-70"
        style={{ background: colors[0], color: ink(colors[0]) }}
      >
        <div>
          <span>{context.toUpperCase()} / COLOR STORY</span>
          <h2>
            {context === "Branding"
              ? "A brand with a point of hue."
              : context === "Interiors"
                ? "A space that feels like you."
                : "A well-matched kind of day."}
          </h2>
          <p>
            {context === "Branding"
              ? "Lead with your primary color. Let your accents do the talking."
              : context === "Interiors"
                ? "Try 60% base, 30% secondary, and 10% accent."
                : "Start with a base piece, add a supporting color, finish with a small accent."}
          </p>
        </div>
        <div className="ml-6 flex min-w-44 items-center [&>i]:-ml-5 [&>i]:h-32 [&>i]:w-20 [&>i]:rotate-20 [&>i]:rounded-full [&>i:nth-child(2)]:h-44 [&>i:nth-child(2)]:-rotate-20">
          {colors.slice(1, 4).map((c) => (
            <i style={{ background: c }} key={c} />
          ))}
        </div>
      </div>
      <Swatches colors={colors} />
      <button
        className="inline-flex min-h-11 items-center justify-center gap-3 rounded-lg border border-ink bg-ink px-5 py-3 text-xs font-medium text-page transition hover:-translate-y-0.5 motion-reduce:transform-none disabled:transform-none"
        onClick={() => {
          setPalette(colors);
          setSaved(true);
        }}
      >
        {saved ? "✓ Palette saved" : "Use this palette "}
      </button>
      <Export text={paletteCSS(colors)} />
    </>
  );
}
