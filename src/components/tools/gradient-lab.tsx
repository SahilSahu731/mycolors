"use client";
import { useState } from "react";
import { ColorInput } from "@/components/ui";
import Export from "@/components/tools/shared/export-panel";
export default function Gradient({ palette }: { palette: string[] }) {
  const [stops, setStops] = useState(palette.slice(0, 3));
  const [angle, setAngle] = useState(120);
  const [type, setType] = useState("linear");
  const css =
    type === "linear"
      ? `linear-gradient(${angle}deg, ${stops.join(", ")})`
      : `radial-gradient(circle, ${stops.join(", ")})`;
  return (
    <>
      <div
        className="relative grid min-h-[380px] place-items-center overflow-hidden rounded-[32px] p-8 text-center lg:min-h-[620px] [&>span]:max-w-lg [&>span]:text-5xl [&>span]:font-semibold [&>span]:leading-[0.95] [&>span]:tracking-[-0.07em] [&>span]:text-white [&>span]:drop-shadow-lg md:[&>span]:text-7xl"
        style={{ background: css }}
      >
        <span>Let your ideas flow.</span>
      </div>
      <section className="rounded-[28px] border border-line bg-surface p-5 md:p-7 [&>h3]:mb-4 [&_h3]:text-base [&_h3]:font-medium [&>p]:text-xs [&>p]:leading-7 [&>p]:text-muted [&>label]:mb-4 [&>textarea]:my-5">
        <div className="flex flex-wrap items-center justify-between gap-4 [&_h3]:text-sm [&_h3]:font-medium">
          <h3>Make it your own</h3>
          <select
            aria-label="Gradient type"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="linear">Linear</option>
            <option value="radial">Radial</option>
          </select>
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-5">
          {stops.map((c, i) => (
            <div key={i}>
              <ColorInput
                label={`Stop ${i + 1}`}
                value={c}
                onChange={(v) =>
                  setStops(stops.map((x, j) => (j === i ? v : x)))
                }
              />
              {stops.length > 2 && (
                <button
                  className="inline-flex items-center gap-3 bg-transparent py-2 text-xs"
                  onClick={() => setStops(stops.filter((_, j) => i !== j))}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          {stops.length < 5 && (
            <button
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-line bg-surface px-4 py-2.5 text-xs font-medium text-ink transition hover:bg-soft"
              onClick={() => setStops([...stops, "#f0a7c2"])}
            >
              + Add stop
            </button>
          )}
        </div>
        {type === "linear" && (
          <label className="mt-6 block text-xs [&>b]:float-right [&>b]:text-muted [&>b]:font-normal [&>input]:mt-4">
            Angle <b>{angle}°</b>
            <input
              type="range"
              min="0"
              max="360"
              value={angle}
              onChange={(e) => setAngle(+e.target.value)}
            />
          </label>
        )}
      </section>
      <Export text={`.gradient {\n  background: ${css};\n}`} />
    </>
  );
}
