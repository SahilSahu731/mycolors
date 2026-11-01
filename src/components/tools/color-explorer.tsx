"use client";
import { useState } from "react";
import { CopyButton } from "@/components/ui";
import { harmony, hsl, mix, paletteCSS, rgb } from "@/lib/colors";
import Swatches from "@/components/tools/shared/swatches";
import Export from "@/components/tools/shared/export-panel";
export default function Explore({
  base,
  theory = false,
}: {
  base: string;
  theory?: boolean;
}) {
  const [mode, setMode] = useState("Analogous");
  const colors = harmony(base, mode);
  const [h, s, l] = hsl(base);
  return (
    <>
      <div className="grid gap-6 md:grid-cols-[1fr_1.5fr]">
        <div className="grid min-h-96 place-items-center rounded-[28px] border border-line bg-soft">
          <div
            className="grid size-64 place-items-center rounded-full bg-[conic-gradient(#e89393,#efcd91,#dcdf98,#b1d398,#97c8b7,#99bacf,#a9a0d1,#d8a6ca,#e89393)] [&>div]:size-25 [&>div]:rounded-full [&>div]:border-10 [&>div]:border-surface"
            style={{ transform: `rotate(${h}deg)` }}
          >
            <div style={{ background: base }} />
          </div>
        </div>
        <section className="rounded-[28px] border border-line bg-surface p-5 md:p-7 [&>h3]:mb-4 [&_h3]:text-base [&_h3]:font-medium [&>p]:text-xs [&>p]:leading-7 [&>p]:text-muted [&>label]:mb-4 [&>textarea]:my-5">
          <h3>
            {theory
              ? "Color relationships, made tangible."
              : "Meet your color."}
          </h3>
          <p>
            {theory
              ? "Move your base color and explore how colors relate on the wheel."
              : "A closer look at the values behind your color."}
          </p>
          <dl className="my-6 grid grid-cols-[70px_1fr] gap-4 text-xs [&>dt]:text-muted [&>dd]:font-mono">
            <dt>HEX</dt>
            <dd>{base.toUpperCase()}</dd>
            <dt>RGB</dt>
            <dd>{rgb(base).join(", ")}</dd>
            <dt>HSL</dt>
            <dd>
              {Math.round(h)}°, {Math.round(s)}%, {Math.round(l)}%
            </dd>
          </dl>
          <CopyButton
            text={`HEX: ${base}\nRGB: ${rgb(base).join(", ")}\nHSL: ${h.toFixed(1)}, ${s.toFixed(1)}%, ${l.toFixed(1)}%`}
            label="Copy color values"
          />
        </section>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4 [&_h3]:text-sm [&_h3]:font-medium">
        <h3>Find your harmony</h3>
        <select
          aria-label="Color harmony"
          value={mode}
          onChange={(e) => setMode(e.target.value)}
        >
          {["Analogous", "Complementary", "Triadic"].map((m) => (
            <option key={m}>{m}</option>
          ))}
        </select>
      </div>
      <p className="text-xs leading-7 text-muted">
        {mode === "Analogous"
          ? "Neighboring hues feel connected and calm. Try them for a cohesive, natural palette."
          : mode === "Complementary"
            ? "Opposite hues create energy and separation. Use one as the lead and the other as an accent."
            : "Three evenly spaced hues create variety. Give one color more space for a balanced composition."}
      </p>
      <Swatches colors={colors} />
      <h3 className="mt-3 text-sm font-medium">Tints & shades</h3>
      <Swatches
        colors={[0.85, 0.65, 0.4, 0]
          .map((t) => mix(base, "#ffffff", t))
          .concat([0.25, 0.5, 0.75].map((t) => mix(base, "#000000", t)))}
      />
      <Export text={paletteCSS(colors)} />
    </>
  );
}
