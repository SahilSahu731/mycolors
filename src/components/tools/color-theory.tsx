"use client";
import { useState } from "react";
import { fromHsl, harmony, hsl, paletteCSS } from "@/lib/colors";
import { ColorInput } from "@/components/ui";
import Swatches from "./shared/swatches";
import Export from "./shared/export-panel";

const lessons = {
  Analogous: {
    offsets: [-30, 0, 30],
    title: "Neighbors with a natural rhythm.",
    copy: "Nearby hues share a family resemblance. Use them for a calm, connected composition, then vary lightness to keep the details clear.",
    tip: "Try a landscape: blue-green water, green leaves, and yellow-green light.",
  },
  Complementary: {
    offsets: [0, 180],
    title: "Opposites bring out the energy.",
    copy: "Colors on opposite sides of the wheel make each other stand out. Give one more space and keep the other for a deliberate accent.",
    tip: "Try an orange call to action against a quiet blue background.",
  },
  Triadic: {
    offsets: [0, 120, 240],
    title: "Three hues. One lively conversation.",
    copy: "Three evenly spaced hues give you variety without losing the relationship. Choose a leading color and let the other two support it.",
    tip: "Try a playful illustration with one dominant hue and two smaller accents.",
  },
};
export default function Theory({
  base,
  onChange,
}: {
  base: string;
  onChange: (color: string) => void;
}) {
  const [mode, setMode] = useState<keyof typeof lessons>("Analogous");
  const [hue, saturation, lightness] = hsl(base);
  const lesson = lessons[mode];
  const colors = harmony(base, mode);
  const points = lesson.offsets.map((offset) => {
    const angle = ((hue + offset - 90) * Math.PI) / 180;
    return [160 + Math.cos(angle) * 113, 160 + Math.sin(angle) * 113];
  });
  return (
    <div className="grid gap-5 lg:grid-cols-[1.1fr_1fr]">
      <section className="relative flex flex-col items-center justify-center overflow-hidden rounded-[32px] bg-soft p-6 sm:p-10">
        <p className="mb-6 self-start text-xs font-medium text-muted">
          THE COLOR WHEEL / Click a hue to explore
        </p>
        <svg
          viewBox="0 0 320 320"
          className="w-full max-w-[440px] overflow-visible"
          role="group"
          aria-label="Interactive color wheel"
        >
          {Array.from({ length: 36 }, (_, i) => {
            const angle = i * 10;
            return (
              <path
                key={i}
                d="M160 14 A146 146 0 0 1 185.35 16.22 L177.71 59.55 A102 102 0 0 0 160 58Z"
                transform={`rotate(${angle} 160 160)`}
                fill={fromHsl(angle, 70, 62)}
                role="button"
                tabIndex={0}
                aria-label={`Choose hue ${angle} degrees`}
                onClick={() => onChange(fromHsl(angle, saturation, lightness))}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onChange(fromHsl(angle, saturation, lightness));
                  }
                }}
                className="cursor-pointer transition-opacity hover:opacity-60 focus:opacity-50 focus:outline-none"
              />
            );
          })}
          <polygon
            points={points.map((p) => p.join(",")).join(" ")}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="4 5"
            className="text-ink/50"
          />
          {points.map(([x, y], i) => (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="9"
              fill={fromHsl(hue + lesson.offsets[i], 70, 62)}
              stroke="var(--surface)"
              strokeWidth="4"
              className="pointer-events-none"
            />
          ))}
          <circle cx="160" cy="160" r="51" fill={base} />
        </svg>
        <label className="mt-8 w-full max-w-md text-xs">
          Base hue{" "}
          <span className="float-right font-mono text-muted">
            {Math.round(hue)}°
          </span>
          <input
            aria-label="Base hue"
            className="mt-4 w-full"
            type="range"
            min="0"
            max="359"
            value={Math.round(hue)}
            onChange={(e) =>
              onChange(fromHsl(+e.target.value, saturation, lightness))
            }
          />
        </label>
      </section>
      <section className="flex flex-col justify-between gap-6 rounded-[32px] bg-violet-400/10 p-6 sm:p-9">
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="Harmony lesson"
        >
          {(Object.keys(lessons) as (keyof typeof lessons)[]).map((name) => (
            <button
              key={name}
              aria-pressed={mode === name}
              onClick={() => setMode(name)}
              className={`min-h-10 rounded-full px-4 text-xs font-semibold transition-colors ${mode === name ? "bg-ink text-page" : "bg-surface text-muted hover:text-ink"}`}
            >
              {name}
            </button>
          ))}
        </div>
        <div>
          <p className="text-xs text-muted">A LITTLE COLOR KNOW-HOW</p>
          <h2 className="mt-4 text-4xl font-semibold leading-tight tracking-[-0.05em]">
            {lesson.title}
          </h2>
          <p className="mt-5 text-sm leading-7 text-muted">{lesson.copy}</p>
          <p className="mt-6 rounded-2xl bg-surface/70 p-5 text-sm leading-6">
            {lesson.tip}
          </p>
        </div>
        <ColorInput
          label="Explore a starting color"
          value={base}
          onChange={onChange}
        />
      </section>
      <div className="grid gap-5 lg:col-span-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight">
            The relationship, in a palette.
          </h2>
          <span className="text-xs text-muted">{mode}</span>
        </div>
        <Swatches colors={colors} />
        <Export text={paletteCSS(colors)} />
      </div>
    </div>
  );
}
