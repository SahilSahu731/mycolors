/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import {
  contrast,
  fromHsl,
  harmony,
  hsl,
  ink,
  mix,
  paletteCSS,
  rgb,
} from "@/lib/colors";
import Export from "@/components/tools/shared/export-panel";

type HarmonyMode = "Analogous" | "Complementary" | "Triadic";

const FALLBACK = "#7963CF";
// const HEX = /^#[0-9a-f]{6}$/i;

const MODES: {
  name: HarmonyMode;
  label: string;
  description: string;
  angles: number[];
}[] = [
  {
    name: "Analogous",
    label: "Close together",
    description: "Neighboring hues create gentle, unified combinations.",
    angles: [-30, 0, 30],
  },
  {
    name: "Complementary",
    label: "Opposites attract",
    description: "Colors across the wheel create strong visual contrast.",
    angles: [0, 180],
  },
  {
    name: "Triadic",
    label: "Perfectly spaced",
    description: "Three equally spaced hues create colorful balance.",
    angles: [0, 120, 240],
  },
];

const HARMONY_HELP: Record<HarmonyMode, string> = {
  Analogous:
    "Analogous colors sit near one another on the wheel. They often feel connected because they share similar hues.",
  Complementary:
    "Complementary colors sit opposite one another, approximately 180° apart. They're useful when an accent needs to stand out.",
  Triadic:
    "Triadic relationships use three hue positions approximately 120° apart. They create variety without relying on a single pair of opposites.",
};

function normalizeHex(value: string): string | null {
  const raw = value.trim().replace(/^#/, "");

  if (/^[0-9a-f]{3}$/i.test(raw)) {
    return `#${raw
      .split("")
      .map((character) => character + character)
      .join("")}`.toUpperCase();
  }

  if (/^[0-9a-f]{6}$/i.test(raw)) {
    return `#${raw.toUpperCase()}`;
  }

  return null;
}

// function clamp(value: number, min = 0, max = 100) {
//   return Math.max(min, Math.min(max, value));
// }

function wheelPosition(hue: number, radius = 42) {
  const radians = (hue * Math.PI) / 180;

  return {
    x: 50 + Math.sin(radians) * radius,
    y: 50 - Math.cos(radians) * radius,
  };
}

function HarmonySymbol({ angles }: { angles: number[] }) {
  const points = angles.map((angle) => wheelPosition((angle + 360) % 360, 34));

  return (
    <svg
      viewBox="0 0 100 100"
      width="36"
      height="36"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="50"
        cy="50"
        r="34"
        stroke="currentColor"
        strokeOpacity=".25"
        strokeWidth="2.5"
      />
      {points.length > 1 && (
        <polyline
          points={points.map((point) => `${point.x},${point.y}`).join(" ")}
          stroke="currentColor"
          strokeOpacity=".65"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
      {points.map((point, index) => (
        <circle
          key={index}
          cx={point.x}
          cy={point.y}
          r="7"
          fill={["#FF795B", "#9AAAF0", "#F6C85F"][index]}
          stroke="currentColor"
          strokeOpacity=".2"
          strokeWidth="1"
        />
      ))}
    </svg>
  );
}

export default function Explore({
  base,
  theory = false,
}: {
  base: string;
  theory?: boolean;
}) {
  const safeBase = normalizeHex(base) ?? FALLBACK;

  const [currentColor, setCurrentColor] = useState(safeBase);
  const [mode, setMode] = useState<HarmonyMode>("Analogous");
  const [hexDraft, setHexDraft] = useState(safeBase);
  const [notice, setNotice] = useState("");

  const wheelRef = useRef<HTMLDivElement>(null);
  const pointerRef = useRef<number | null>(null);
  const noticeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setCurrentColor(safeBase);
    setHexDraft(safeBase);
  }, [safeBase]);

  useEffect(() => {
    setHexDraft(currentColor);
  }, [currentColor]);

  useEffect(() => {
    return () => {
      if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
    };
  }, []);

  const [hue, saturation, lightness] = hsl(currentColor);
  const rgbValues = rgb(currentColor);
  const textColor = ink(currentColor);

  const colors = useMemo(() => {
    const generated = harmony(currentColor, mode);
    const valid = generated
      .map(normalizeHex)
      .filter((color): color is string => color !== null);

    return Array.from(
      { length: 5 },
      (_, index) => valid[index % valid.length] ?? currentColor,
    );
  }, [currentColor, mode]);

  const markers = colors.map((color, index) => ({
    color,
    index,
    ...wheelPosition(hsl(color)[0]),
  }));

  const tones = useMemo(() => {
    return [
      ...[0.88, 0.7, 0.5, 0.3, 0.14].map((amount) =>
        mix(currentColor, "#FFFFFF", amount),
      ),
      currentColor,
      ...[0.14, 0.3, 0.5, 0.7, 0.88].map((amount) =>
        mix(currentColor, "#000000", amount),
      ),
    ];
  }, [currentColor]);

  const whiteContrast = contrast(currentColor, "#FFFFFF");
  const blackContrast = contrast(currentColor, "#000000");
  const preferredText = whiteContrast >= blackContrast ? "#FFFFFF" : "#000000";
  const preferredRatio = Math.max(whiteContrast, blackContrast);

  function flash(message: string) {
    if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);

    setNotice(message);
    noticeTimerRef.current = setTimeout(() => setNotice(""), 2200);
  }

  async function copy(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value);
      flash(`${label} copied.`);
    } catch {
      flash("Clipboard access is unavailable.");
    }
  }

  function updateHsl(channel: "h" | "s" | "l", value: number) {
    const next = {
      h: hue,
      s: saturation,
      l: lightness,
      [channel]: value,
    };

    setCurrentColor(fromHsl(next.h, next.s, next.l));
  }

  function applyHex() {
    const normalized = normalizeHex(hexDraft);

    if (!normalized) {
      setHexDraft(currentColor);
      flash("Enter a valid HEX color.");
      return;
    }

    setCurrentColor(normalized);
  }

  function setHueFromPointer(
    event: PointerEvent<HTMLDivElement>,
    requireRing: boolean,
  ) {
    const rect = wheelRef.current?.getBoundingClientRect();
    if (!rect) return false;

    const x = event.clientX - (rect.left + rect.width / 2);
    const y = event.clientY - (rect.top + rect.height / 2);

    if (requireRing && Math.hypot(x, y) < rect.width * 0.3) return false;

    const nextHue = ((Math.atan2(y, x) * 180) / Math.PI + 90 + 360) % 360;

    setCurrentColor((previous) => {
      const [, s, l] = hsl(previous);
      return fromHsl(Math.round(nextHue) % 360, s, l);
    });

    return true;
  }

  function onWheelPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) return;

    if (!setHueFromPointer(event, true)) return;

    event.preventDefault();
    pointerRef.current = event.pointerId;
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onWheelPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (pointerRef.current !== event.pointerId) return;
    setHueFromPointer(event, false);
  }

  function onWheelKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const step = event.shiftKey ? 10 : 1;

    if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
      event.preventDefault();
      updateHsl("h", (Math.round(hue) - step + 360) % 360);
    } else if (event.key === "ArrowRight" || event.key === "ArrowUp") {
      event.preventDefault();
      updateHsl("h", (Math.round(hue) + step) % 360);
    } else if (event.key === "Home") {
      event.preventDefault();
      updateHsl("h", 0);
    } else if (event.key === "End") {
      event.preventDefault();
      updateHsl("h", 359);
    }
  }

  function reset() {
    setCurrentColor(safeBase);
    flash("Original color restored.");
  }

  return (
    <div className="space-y-9">
      {/* Main introduction */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-muted">
            {theory ? "Color relationships" : "Color anatomy"}
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.055em] text-ink sm:text-3xl">
            {theory ? "See how colors connect." : "Get to know your color."}
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-muted">
            {theory
              ? "Explore the wheel, move between hues, and discover why combinations work."
              : "Move around the color wheel, experiment with its values, and discover related shades."}
          </p>
        </div>

        <button
          type="button"
          onClick={reset}
          className="min-h-10 rounded-full bg-soft px-4 text-xs font-semibold text-ink transition-colors hover:bg-ink/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        >
          ↶ Reset color
        </button>
      </div>

      {/* Interactive wheel and color inspector */}
      <div className="grid items-stretch gap-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(330px,0.95fr)]">
        <section
          aria-label="Interactive color wheel"
          className="relative isolate flex min-h-97.5 flex-col items-center justify-center overflow-hidden rounded-[28px] bg-soft/70 px-5 py-10 sm:min-h-122.5 sm:p-10"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle,currentColor_1px,transparent_1.5px)] bg-size-[22px_22px] text-black/[0.035] dark:text-white/4"
          />

          <div
            ref={wheelRef}
            role="slider"
            tabIndex={0}
            aria-label="Explore hue on the color wheel"
            aria-valuemin={0}
            aria-valuemax={359}
            aria-valuenow={Math.round(hue) % 360}
            aria-valuetext={`${Math.round(hue)} degrees`}
            onPointerDown={onWheelPointerDown}
            onPointerMove={onWheelPointerMove}
            onPointerUp={() => {
              pointerRef.current = null;
            }}
            onPointerCancel={() => {
              pointerRef.current = null;
            }}
            onLostPointerCapture={() => {
              pointerRef.current = null;
            }}
            onKeyDown={onWheelKeyDown}
            className="relative aspect-square w-full max-w-87.5 cursor-crosshair touch-none select-none rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-4 focus-visible:ring-offset-page sm:max-w-97.5"
          >
            {/* Actual hue spectrum */}
            <div
              aria-hidden="true"
              className="absolute inset-0 rounded-full shadow-[0_12px_35px_rgb(0_0_0/0.08)]"
              style={{
                background:
                  "conic-gradient(from 0deg, #FF4545 0deg, #FFFF4D 60deg, #45FF45 120deg, #45FFFF 180deg, #4545FF 240deg, #FF45FF 300deg, #FF4545 360deg)",
              }}
            />

            {/* Clean center cutout */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-[21%] rounded-full bg-page shadow-[0_5px_20px_rgb(0_0_0/0.07)]"
            />

            {/* Harmony connections */}
            <svg
              viewBox="0 0 100 100"
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
            >
              <polyline
                points={markers
                  .map((marker) => `${marker.x},${marker.y}`)
                  .join(" ")}
                fill="none"
                stroke="currentColor"
                strokeWidth="0.6"
                strokeOpacity="0.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            {/* Generated harmony markers */}
            {markers.map((marker) => (
              <span
                key={marker.index}
                aria-hidden="true"
                className="pointer-events-none absolute z-10 grid size-5 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white shadow-[0_2px_9px_rgb(0_0_0/0.3)] sm:size-6"
                style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
              >
                <span
                  className="size-3 rounded-full sm:size-4"
                  style={{ backgroundColor: marker.color }}
                />
              </span>
            ))}

            {/* Active hue marker */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute z-20 size-8 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white p-1 shadow-[0_3px_14px_rgb(0_0_0/0.3)]"
              style={{
                left: `${wheelPosition(hue).x}%`,
                top: `${wheelPosition(hue).y}%`,
              }}
            >
              <span
                className="block size-full rounded-full"
                style={{ backgroundColor: currentColor }}
              />
            </span>

            {/* Central readout */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-[24%] flex flex-col items-center justify-center rounded-full"
            >
              <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted">
                Current color
              </span>
              <span
                className="mt-3 size-14 rounded-full shadow-md sm:size-17"
                style={{ backgroundColor: currentColor }}
              />
              <span className="mt-4 font-mono text-[clamp(0.9rem,2vw,1.4rem)] font-semibold tracking-tight text-ink">
                {currentColor.toUpperCase()}
              </span>
              <span className="mt-1 font-mono text-[10px] text-muted">
                {Math.round(hue)}° Hue
              </span>
            </div>
          </div>

          <p className="mt-7 text-center text-[11px] text-muted">
            Drag the wheel to change hue. Use arrow keys for precise steps.
          </p>
        </section>

        {/* Minimal color inspector */}
        <section
          aria-labelledby="color-values-title"
          className="flex min-w-0 flex-col rounded-[28px] bg-soft/70 p-5 sm:p-8"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
                Color inspector
              </p>
              <h3
                id="color-values-title"
                className="mt-2 text-2xl font-semibold tracking-[-0.055em] text-ink"
              >
                The details.
              </h3>
            </div>

            <span className="rounded-full bg-page px-3 py-2 text-[10px] font-semibold text-muted">
              LIVE VALUES
            </span>
          </div>

          {/* Color sample with real foreground contrast */}
          <div
            className="mt-6 flex min-h-31 items-center justify-between gap-4 rounded-[20px] px-6 transition-colors duration-200"
            style={{ backgroundColor: currentColor, color: textColor }}
          >
            <span className="text-[64px] font-semibold leading-none -tracking-widest">
              Aa
            </span>
            <div className="text-right">
              <p className="font-mono text-base font-bold">
                {currentColor.toUpperCase()}
              </p>
              <p className="mt-2 text-[10px] font-medium opacity-65">
                YOUR COLOR / 001
              </p>
            </div>
          </div>

          {/* Hex picker */}
          <div className="mt-6 flex items-end gap-3">
            <label
              className="relative grid size-12 shrink-0 cursor-pointer place-items-center overflow-hidden rounded-xl shadow-sm"
              style={{ backgroundColor: currentColor, color: textColor }}
            >
              <input
                type="color"
                aria-label="Choose color visually"
                value={currentColor}
                onChange={(event) =>
                  setCurrentColor(event.target.value.toUpperCase())
                }
                className="absolute inset-0 size-full cursor-pointer opacity-0"
              />
              <span
                aria-hidden="true"
                className="pointer-events-none text-xl font-semibold"
              >
                +
              </span>
            </label>

            <label className="block min-w-0 flex-1">
              <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.13em] text-muted">
                HEX
              </span>
              <input
                value={hexDraft}
                maxLength={7}
                autoComplete="off"
                spellCheck={false}
                onChange={(event) => setHexDraft(event.target.value)}
                onBlur={applyHex}
                onKeyDown={(event) => {
                  if (event.key === "Enter") event.currentTarget.blur();
                  if (event.key === "Escape") {
                    setHexDraft(currentColor);
                    event.currentTarget.blur();
                  }
                }}
                className="min-h-12 w-full rounded-xl bg-page px-4 font-mono text-sm font-semibold uppercase text-ink outline-none focus-visible:ring-2 focus-visible:ring-ink/30"
              />
            </label>

            <button
              type="button"
              onClick={() => copy(currentColor, "HEX")}
              aria-label="Copy HEX"
              className="min-h-12 rounded-xl bg-page px-4 text-[11px] font-semibold text-ink transition-colors hover:bg-ink/10"
            >
              Copy ↗
            </button>
          </div>

          {/* RGB and HSL values */}
          <div className="mt-5 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => copy(`rgb(${rgbValues.join(", ")})`, "RGB")}
              className="rounded-xl bg-page p-4 text-left transition-colors hover:bg-ink/5"
            >
              <span className="block text-[10px] font-bold uppercase tracking-[0.12em] text-muted">
                RGB
              </span>
              <span className="mt-2 block font-mono text-xs font-semibold text-ink">
                {rgbValues.join(", ")}
              </span>
              <span className="mt-1 block text-[10px] text-muted">
                Click to copy ↗
              </span>
            </button>

            <button
              type="button"
              onClick={() =>
                copy(
                  `hsl(${Math.round(hue)}, ${Math.round(saturation)}%, ${Math.round(lightness)}%)`,
                  "HSL",
                )
              }
              className="rounded-xl bg-page p-4 text-left transition-colors hover:bg-ink/5"
            >
              <span className="block text-[10px] font-bold uppercase tracking-[0.12em] text-muted">
                HSL
              </span>
              <span className="mt-2 block font-mono text-xs font-semibold text-ink">
                {Math.round(hue)}°, {Math.round(saturation)}%,{" "}
                {Math.round(lightness)}%
              </span>
              <span className="mt-1 block text-[10px] text-muted">
                Click to copy ↗
              </span>
            </button>
          </div>

          {/* Precision adjustments */}
          <div className="mt-7 space-y-5">
            {[
              {
                key: "h" as const,
                name: "Hue",
                value: Math.round(hue),
                max: 359,
                suffix: "°",
                background:
                  "linear-gradient(to right,#FF4545,#FFFF4D,#45FF45,#45FFFF,#4545FF,#FF45FF,#FF4545)",
              },
              {
                key: "s" as const,
                name: "Saturation",
                value: Math.round(saturation),
                max: 100,
                suffix: "%",
                background: `linear-gradient(to right,${fromHsl(hue, 0, lightness)},${fromHsl(hue, 100, lightness)})`,
              },
              {
                key: "l" as const,
                name: "Lightness",
                value: Math.round(lightness),
                max: 100,
                suffix: "%",
                background: `linear-gradient(to right,#000000,${fromHsl(hue, saturation, 50)},#FFFFFF)`,
              },
            ].map((control) => (
              <label key={control.key} className="block">
                <span className="mb-3 flex items-center justify-between gap-3">
                  <span className="text-xs font-semibold text-ink">
                    {control.name}
                  </span>
                  <span className="font-mono text-xs font-medium tabular-nums text-muted">
                    {control.value}
                    {control.suffix}
                  </span>
                </span>
                <input
                  type="range"
                  min={0}
                  max={control.max}
                  value={control.value}
                  onChange={(event) =>
                    updateHsl(control.key, Number(event.target.value))
                  }
                  className="h-3 w-full cursor-pointer appearance-none rounded-full accent-ink"
                  style={{ background: control.background }}
                />
              </label>
            ))}
          </div>

          <div className="mt-auto pt-7">
            <div className="flex items-center justify-between gap-3 rounded-xl bg-page p-3">
              <div>
                <p className="text-[11px] font-semibold text-ink">
                  Readable text pairing
                </p>
                <p className="mt-1 text-[10px] text-muted">
                  {preferredRatio.toFixed(2)}:1 contrast with{" "}
                  {preferredText === "#FFFFFF" ? "white" : "black"}
                </p>
              </div>
              <span
                className="grid size-11 place-items-center rounded-xl text-xl font-semibold"
                style={{ backgroundColor: currentColor, color: preferredText }}
              >
                Aa
              </span>
            </div>
          </div>
        </section>
      </div>

      {/* Harmony exploration */}
      <section className="space-y-5">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.17em] text-muted">
            Explore relationships
          </p>
          <h3 className="mt-2 text-xl font-semibold tracking-tighter text-ink">
            Colors that belong together.
          </h3>
          <p className="mt-2 text-xs leading-relaxed text-muted">
            Choose a relationship to see it plotted on your wheel and applied to
            a real palette.
          </p>
        </div>

        {/* Always-visible visual harmony selector */}
        <div
          role="group"
          aria-label="Select a color harmony"
          className="grid gap-2 sm:grid-cols-3"
        >
          {MODES.map((item) => (
            <button
              key={item.name}
              type="button"
              aria-pressed={mode === item.name}
              onClick={() => setMode(item.name)}
              className={`flex min-h-26.25 items-center gap-4 rounded-[19px] p-4 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${mode === item.name ? "bg-ink text-page" : "bg-soft/70 text-ink hover:bg-soft"}`}
            >
              <span className="grid size-13 shrink-0 place-items-center rounded-xl bg-white/10">
                <HarmonySymbol angles={item.angles} />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold">{item.name}</span>
                <span
                  className={`mt-1 block text-[11px] ${mode === item.name ? "text-page/65" : "text-muted"}`}
                >
                  {item.label}
                </span>
              </span>
              {mode === item.name && (
                <span aria-hidden="true" className="ml-auto text-sm">
                  ✓
                </span>
              )}
            </button>
          ))}
        </div>

        <p className="max-w-3xl text-xs leading-[1.8] text-muted">
          {HARMONY_HELP[mode]}
        </p>

        {/* Colors extracted from the currently explored hue */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none [&::-webkit-scrollbar]:hidden sm:overflow-visible sm:pb-0">
          {colors.map((color, index) => (
            <div
              key={`${mode}-${index}`}
              className="min-w-32 flex-1 sm:min-w-0"
            >
              <button
                type="button"
                onClick={() => setCurrentColor(color)}
                aria-label={`Explore harmony color ${index + 1}, ${color}`}
                title={`Explore ${color}`}
                className="group relative flex h-32.5 w-full flex-col justify-between overflow-hidden rounded-[17px] p-3 text-left transition-transform duration-200 hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink motion-reduce:transform-none sm:h-45 sm:p-4"
                style={{ backgroundColor: color, color: ink(color) }}
              >
                <span className="font-mono text-[10px] font-semibold opacity-60">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="font-mono text-[11px] font-bold uppercase sm:text-sm">
                  {color}
                </span>
                <span
                  aria-hidden="true"
                  className="absolute right-3 top-3 text-sm opacity-0 transition-opacity group-hover:opacity-100"
                >
                  ↗
                </span>
              </button>
              <button
                type="button"
                onClick={() => copy(color, color)}
                className="mt-2 min-h-8 w-full text-center text-[10px] font-semibold text-muted transition-colors hover:text-ink"
              >
                Copy HEX ↗
              </button>
            </div>
          ))}
        </div>

        {theory && (
          <div className="flex flex-wrap items-start gap-4 rounded-[19px] bg-soft/65 p-5 sm:gap-6">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-page text-xl text-ink">
              ◎
            </span>
            <div className="max-w-2xl flex-1">
              <h4 className="text-sm font-semibold text-ink">
                Why {mode.toLowerCase()} works
              </h4>
              <p className="mt-2 text-xs leading-[1.85] text-muted">
                {HARMONY_HELP[mode]} The angle is only part of the relationship:
                saturation and lightness also affect how balanced or readable
                the resulting combination feels.
              </p>
            </div>
          </div>
        )}
      </section>

      {/* Tonal scale */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
              The tonal spectrum
            </p>
            <h3 className="mt-2 text-xl font-semibold tracking-tighter text-ink">
              One color. Many personalities.
            </h3>
            <p className="mt-1.5 text-xs text-muted">
              Explore lighter tints and deeper shades. Select one to inspect it.
            </p>
          </div>
          <span className="font-mono text-[10px] text-muted">11 TONES</span>
        </div>

        <div className="flex h-25.5 gap-1 overflow-hidden rounded-[20px] sm:h-33.75">
          {tones.map((color, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setCurrentColor(color)}
              title={`Explore ${color}`}
              aria-label={`Explore tone ${index + 1}, ${color}`}
              className="group relative min-w-0 flex-1 transition-[flex-grow] duration-200 hover:flex-[1.6] focus-visible:z-10 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ink"
              style={{ backgroundColor: color, color: ink(color) }}
            >
              {index === 5 && (
                <span className="absolute inset-x-0 top-3 text-center text-[9px] font-bold uppercase tracking-wider">
                  Base
                </span>
              )}
              <span className="absolute inset-x-0 bottom-3 hidden text-center font-mono text-[9px] font-bold opacity-0 transition-opacity group-hover:opacity-100 sm:block">
                {color.toUpperCase()}
              </span>
            </button>
          ))}
        </div>

        <div className="flex justify-between text-[10px] font-medium uppercase tracking-[0.14em] text-muted">
          <span>Lightest tints</span>
          <span>Original</span>
          <span>Deepest shades</span>
        </div>
      </section>

      {/* Export current harmony */}
      <Export text={paletteCSS(colors)} />

      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4"
      >
        {notice && (
          <span className="rounded-full bg-ink px-5 py-3 text-xs font-semibold text-page shadow-xl">
            {notice}
          </span>
        )}
      </div>
    </div>
  );
}
