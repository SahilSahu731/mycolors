"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { ink } from "@/lib/colors";
import Export from "@/components/tools/shared/export-panel";

type GradientType = "linear" | "radial" | "conic";

type Stop = {
  id: number;
  color: string;
  at: number;
};

type Point = {
  x: number;
  y: number;
};

const FALLBACK = ["#FF795B", "#F6C85F", "#9AAAF0"];
// const HEX = /^#[0-9a-f]{6}$/i;
const MAX_STOPS = 7;
const MIN_STOPS = 2;

const TYPES: { value: GradientType; label: string; description: string }[] = [
  {
    value: "linear",
    label: "Linear",
    description: "Colors flowing in one direction",
  },
  {
    value: "radial",
    label: "Radial",
    description: "Colors radiating from a center",
  },
  {
    value: "conic",
    label: "Conic",
    description: "Colors rotating around a point",
  },
];

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function normalizeHex(value: string): string | null {
  const raw = value.trim().replace(/^#/, "");

  if (/^[0-9a-f]{3}$/i.test(raw)) {
    return `#${raw
      .split("")
      .map((c) => c + c)
      .join("")}`.toUpperCase();
  }

  if (/^[0-9a-f]{6}$/i.test(raw)) {
    return `#${raw.toUpperCase()}`;
  }

  return null;
}

function initialStops(palette: string[]): Stop[] {
  return [0, 1, 2].map((index) => ({
    id: index + 1,
    color: normalizeHex(palette[index] ?? "") ?? FALLBACK[index],
    at: index * 50,
  }));
}

function sortedStops(stops: Stop[]) {
  return [...stops].sort((a, b) => a.at - b.at || a.id - b.id);
}

function gradientCSS(
  type: GradientType,
  stops: Stop[],
  angle: number,
  center: Point,
) {
  const values = sortedStops(stops)
    .map((stop) => `${stop.color} ${stop.at}%`)
    .join(", ");

  if (type === "radial") {
    return `radial-gradient(circle at ${center.x}% ${center.y}%, ${values})`;
  }

  if (type === "conic") {
    return `conic-gradient(from ${angle}deg at ${center.x}% ${center.y}%, ${values})`;
  }

  return `linear-gradient(${angle}deg, ${values})`;
}

function blend(a: string, b: string) {
  const components = [1, 3, 5].map((index) => {
    const first = parseInt(a.slice(index, index + 2), 16);
    const second = parseInt(b.slice(index, index + 2), 16);
    return Math.round((first + second) / 2)
      .toString(16)
      .padStart(2, "0");
  });

  return `#${components.join("").toUpperCase()}`;
}

function CopyIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="8" y="8" width="12" height="12" rx="2" />
      <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
    </svg>
  );
}

function RotateIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 7v5h-5M4 17v-5h5" />
      <path d="M5.5 9A7.5 7.5 0 0 1 18 7l2 5M4 12l2 5a7.5 7.5 0 0 0 12.5-2" />
    </svg>
  );
}

export default function Gradient({ palette }: { palette: string[] }) {
  const [stops, setStops] = useState<Stop[]>(() => initialStops(palette));
  const [type, setType] = useState<GradientType>("linear");
  const [angle, setAngle] = useState(120);
  const [center, setCenter] = useState<Point>({ x: 50, y: 50 });
  const [selectedId, setSelectedId] = useState(1);
  const [hexDraft, setHexDraft] = useState("");
  const [showText, setShowText] = useState(true);
  const [notice, setNotice] = useState("");

  const nextId = useRef(4);
  const previewRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const stopDragRef = useRef<{ id: number; pointerId: number } | null>(null);
  const centerDragRef = useRef<number | null>(null);
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const ordered = useMemo(() => sortedStops(stops), [stops]);
  const selectedStop =
    stops.find((stop) => stop.id === selectedId) ?? ordered[0];

  const background = useMemo(
    () => gradientCSS(type, stops, angle, center),
    [type, stops, angle, center],
  );

  const trackGradient = useMemo(
    () =>
      `linear-gradient(to right, ${ordered.map((stop) => `${stop.color} ${stop.at}%`).join(", ")})`,
    [ordered],
  );

  const css = `.gradient {\n  background: ${background};\n}`;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHexDraft(selectedStop.color);
  }, [selectedStop.id, selectedStop.color]);

  useEffect(() => {
    return () => {
      if (noticeTimer.current) clearTimeout(noticeTimer.current);
    };
  }, []);

  function flash(message: string) {
    if (noticeTimer.current) clearTimeout(noticeTimer.current);

    setNotice(message);
    noticeTimer.current = setTimeout(() => setNotice(""), 2200);
  }

  function updateStop(
    id: number,
    changes: Partial<Pick<Stop, "color" | "at">>,
  ) {
    setStops((current) =>
      current.map((stop) => (stop.id === id ? { ...stop, ...changes } : stop)),
    );
  }

  function updatePosition(id: number, value: number) {
    updateStop(id, { at: clamp(Math.round(value)) });
  }

  function positionFromPointer(clientX: number) {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect || !rect.width) return 0;
    return clamp(Math.round(((clientX - rect.left) / rect.width) * 100));
  }

  function handleStopDown(
    id: number,
    event: ReactPointerEvent<HTMLButtonElement>,
  ) {
    if (event.button !== 0) return;

    event.preventDefault();
    setSelectedId(id);

    stopDragRef.current = { id, pointerId: event.pointerId };
    event.currentTarget.setPointerCapture(event.pointerId);

    updatePosition(id, positionFromPointer(event.clientX));
  }

  function handleStopMove(
    id: number,
    event: ReactPointerEvent<HTMLButtonElement>,
  ) {
    if (
      stopDragRef.current?.id !== id ||
      stopDragRef.current.pointerId !== event.pointerId
    )
      return;
    updatePosition(id, positionFromPointer(event.clientX));
  }

  function handleStopKeys(
    id: number,
    current: number,
    event: ReactKeyboardEvent<HTMLButtonElement>,
  ) {
    const step = event.shiftKey ? 5 : 1;

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      updatePosition(id, current - step);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      updatePosition(id, current + step);
    } else if (event.key === "Home") {
      event.preventDefault();
      updatePosition(id, 0);
    } else if (event.key === "End") {
      event.preventDefault();
      updatePosition(id, 100);
    }
  }

  function updateCenterFromPointer(clientX: number, clientY: number) {
    const rect = previewRef.current?.getBoundingClientRect();
    if (!rect || !rect.width || !rect.height) return;

    setCenter({
      x: clamp(Math.round(((clientX - rect.left) / rect.width) * 100)),
      y: clamp(Math.round(((clientY - rect.top) / rect.height) * 100)),
    });
  }

  function handleCenterDown(event: ReactPointerEvent<HTMLButtonElement>) {
    if (event.button !== 0) return;

    event.preventDefault();
    centerDragRef.current = event.pointerId;
    event.currentTarget.setPointerCapture(event.pointerId);
    updateCenterFromPointer(event.clientX, event.clientY);
  }

  function handleCenterMove(event: ReactPointerEvent<HTMLButtonElement>) {
    if (centerDragRef.current !== event.pointerId) return;
    updateCenterFromPointer(event.clientX, event.clientY);
  }

  function handleCenterKeys(event: ReactKeyboardEvent<HTMLButtonElement>) {
    const step = event.shiftKey ? 5 : 1;

    const directions: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    };

    if (!directions[event.key]) return;

    event.preventDefault();
    const [dx, dy] = directions[event.key];

    setCenter((current) => ({
      x: clamp(current.x + dx),
      y: clamp(current.y + dy),
    }));
  }

  function addStop() {
    if (stops.length >= MAX_STOPS) return;

    let widestGap = -1;
    let left = ordered[0];
    let right = ordered[1];

    for (let i = 0; i < ordered.length - 1; i++) {
      const gap = ordered[i + 1].at - ordered[i].at;

      if (gap > widestGap) {
        widestGap = gap;
        left = ordered[i];
        right = ordered[i + 1];
      }
    }

    const newStop: Stop = {
      id: nextId.current++,
      color: blend(left.color, right.color),
      at: Math.round((left.at + right.at) / 2),
    };

    setStops((current) => [...current, newStop]);
    setSelectedId(newStop.id);
    flash("New color stop added.");
  }

  function removeStop() {
    if (stops.length <= MIN_STOPS) return;

    const index = ordered.findIndex((stop) => stop.id === selectedId);
    const remaining = ordered.filter((stop) => stop.id !== selectedId);

    setStops(remaining);
    setSelectedId(remaining[Math.min(index, remaining.length - 1)].id);
    flash("Color stop removed.");
  }

  function reverse() {
    setStops((current) =>
      current.map((stop) => ({ ...stop, at: 100 - stop.at })),
    );
    flash("Gradient direction reversed.");
  }

  function resetToPalette() {
    setStops(initialStops(palette));
    setSelectedId(1);
    nextId.current = 4;
    flash("Colors restored from your palette.");
  }

  function applyHex() {
    const normalized = normalizeHex(hexDraft);

    if (!normalized) {
      setHexDraft(selectedStop.color);
      flash("Enter a valid HEX color.");
      return;
    }

    updateStop(selectedStop.id, { color: normalized });
  }

  async function copyCSS() {
    try {
      await navigator.clipboard.writeText(css);
      flash("Gradient CSS copied.");
    } catch {
      flash("Clipboard access is unavailable.");
    }
  }

  return (
    <div className="space-y-7">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div
          role="group"
          aria-label="Gradient type"
          className="inline-flex items-center gap-1 rounded-full bg-soft p-1"
        >
          {TYPES.map((item) => (
            <button
              key={item.value}
              type="button"
              aria-pressed={type === item.value}
              title={item.description}
              onClick={() => setType(item.value)}
              className={`min-h-10 rounded-full px-4 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink sm:px-5 ${type === item.value ? "bg-ink text-page" : "text-muted hover:bg-page hover:text-ink"}`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            aria-pressed={showText}
            onClick={() => setShowText((value) => !value)}
            className="min-h-10 rounded-full bg-soft px-4 text-xs font-semibold text-ink transition-colors hover:bg-ink/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            Aa {showText ? "Hide text" : "Show text"}
          </button>

          <button
            type="button"
            onClick={copyCSS}
            className="inline-flex min-h-10 items-center gap-2 rounded-full bg-ink px-4 text-xs font-semibold text-page transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            <CopyIcon />
            Copy CSS
          </button>
        </div>
      </div>

      {/* Full-width live gradient canvas */}
      <div
        ref={previewRef}
        className="relative isolate flex min-h-97.5 flex-col justify-between overflow-hidden rounded-[30px] p-6 sm:min-h-120 sm:p-9 lg:min-h-135 lg:rounded-[36px] lg:p-12"
        style={{ background }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-linear-to-b from-black/15 via-transparent to-black/25"
        />

        <div className="pointer-events-none relative z-10 flex items-center justify-between gap-4">
          <span className="rounded-full bg-black/20 px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white backdrop-blur-lg">
            Live gradient
          </span>

          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-white drop-shadow-md">
            {type} / {String(stops.length).padStart(2, "0")} stops
          </span>
        </div>

        {showText && (
          <div className="pointer-events-none relative z-10 my-auto py-10">
            <h2 className="max-w-4xl text-[clamp(3.5rem,8vw,8.5rem)] font-semibold leading-[0.94] tracking-[-0.08em] text-white [text-shadow:0_4px_35px_rgba(0,0,0,0.25)]">
              Let color
              <br />
              <span className="font-serif font-normal italic">take over.</span>
            </h2>
          </div>
        )}

        {(type === "radial" || type === "conic") && (
          <button
            type="button"
            aria-label={`Move gradient center. Current position ${center.x}% horizontal, ${center.y}% vertical. Drag or use arrow keys.`}
            title="Drag to move the gradient center"
            onPointerDown={handleCenterDown}
            onPointerMove={handleCenterMove}
            onPointerUp={() => {
              centerDragRef.current = null;
            }}
            onPointerCancel={() => {
              centerDragRef.current = null;
            }}
            onLostPointerCapture={() => {
              centerDragRef.current = null;
            }}
            onKeyDown={handleCenterKeys}
            className="absolute z-20 grid size-12 -translate-x-1/2 -translate-y-1/2 touch-none place-items-center rounded-full bg-white/90 text-[#24222B] shadow-[0_8px_35px_rgba(0,0,0,0.2)] backdrop-blur-md transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            style={{ left: `${center.x}%`, top: `${center.y}%` }}
          >
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="5" />
              <path d="M12 2v5M12 17v5M2 12h5M17 12h5" />
            </svg>
          </button>
        )}

        <div className="pointer-events-none relative z-10 flex flex-wrap items-center justify-between gap-3">
          <span className="text-[11px] font-medium text-white/85 drop-shadow-md">
            {type === "linear"
              ? "A continuous flow of color."
              : "Drag the target to move the gradient's center."}
          </span>

          <span className="rounded-full bg-black/20 px-3 py-2 font-mono text-[10px] text-white backdrop-blur-lg">
            {type === "radial" ? `${center.x}% × ${center.y}%` : `${angle}°`}
          </span>
        </div>
      </div>

      {/* Stop editor + gradient settings */}
      <div className="grid items-start gap-9 lg:grid-cols-[minmax(0,1.3fr)_minmax(280px,0.7fr)] lg:gap-12">
        {/* Stop editor */}
        <section
          aria-labelledby="gradient-stops-title"
          className="min-w-0 space-y-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3
                id="gradient-stops-title"
                className="text-base font-semibold tracking-tight text-ink"
              >
                Your color stops
              </h3>
              <p className="mt-1 text-xs text-muted">
                Drag the dots to change how your colors blend.
              </p>
            </div>

            <button
              type="button"
              disabled={stops.length >= MAX_STOPS}
              onClick={addStop}
              className="min-h-10 rounded-full bg-soft px-4 text-xs font-semibold text-ink transition-colors hover:bg-ink/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:cursor-not-allowed disabled:opacity-35"
            >
              + Add stop
            </button>
          </div>

          <div className="px-1 pb-3 pt-3">
            <div
              ref={trackRef}
              className="relative mx-5 h-14 rounded-2xl shadow-[inset_0_2px_8px_rgba(0,0,0,0.08)]"
              style={{ background: trackGradient }}
            >
              {ordered.map((stop) => (
                <button
                  key={stop.id}
                  type="button"
                  aria-label={`Color stop ${stop.color} at ${stop.at} percent. Drag or use left and right arrow keys.`}
                  aria-pressed={selectedId === stop.id}
                  onPointerDown={(event) => handleStopDown(stop.id, event)}
                  onPointerMove={(event) => handleStopMove(stop.id, event)}
                  onPointerUp={() => {
                    stopDragRef.current = null;
                  }}
                  onPointerCancel={() => {
                    stopDragRef.current = null;
                  }}
                  onLostPointerCapture={() => {
                    stopDragRef.current = null;
                  }}
                  onKeyDown={(event) => handleStopKeys(stop.id, stop.at, event)}
                  className={`absolute top-1/2 z-10 grid size-9 -translate-x-1/2 -translate-y-1/2 touch-none place-items-center rounded-full shadow-[0_3px_12px_rgba(0,0,0,0.22)] transition-[box-shadow,scale] hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink ${selectedId === stop.id ? "shadow-[0_0_0_4px_rgba(255,255,255,0.6),0_4px_18px_rgba(0,0,0,0.2)]" : ""}`}
                  style={{ left: `${stop.at}%`, backgroundColor: stop.color }}
                >
                  <span
                    className="size-2.5 rounded-full"
                    style={{ backgroundColor: ink(stop.color) }}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] text-muted">
            <span>
              0% <span className="mx-2 opacity-40">—</span> 100%
            </span>
            <span>
              {stops.length} / {MAX_STOPS} stops · Arrow keys for precision
            </span>
          </div>

          {/* Selected color editing */}
          <div className="flex flex-col gap-4 rounded-[22px] bg-soft/70 p-4 sm:flex-row sm:items-end sm:gap-5 sm:p-5">
            <div className="flex min-w-0 flex-1 items-end gap-3">
              <label
                className="relative grid size-12 shrink-0 cursor-pointer place-items-center overflow-hidden rounded-xl shadow-sm"
                style={{
                  backgroundColor: selectedStop.color,
                  color: ink(selectedStop.color),
                }}
              >
                <input
                  type="color"
                  aria-label="Pick selected stop color"
                  value={selectedStop.color}
                  onChange={(event) =>
                    updateStop(selectedStop.id, {
                      color: event.target.value.toUpperCase(),
                    })
                  }
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                />
                <span
                  aria-hidden="true"
                  className="pointer-events-none text-xl font-semibold"
                >
                  +
                </span>
              </label>

              <label className="block min-w-0 flex-1">
                <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
                  Selected color
                </span>
                <input
                  value={hexDraft}
                  maxLength={7}
                  spellCheck={false}
                  autoComplete="off"
                  onChange={(event) => setHexDraft(event.target.value)}
                  onBlur={applyHex}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") event.currentTarget.blur();
                    if (event.key === "Escape") {
                      setHexDraft(selectedStop.color);
                      event.currentTarget.blur();
                    }
                  }}
                  className="min-h-12 w-full rounded-xl bg-page px-3 font-mono text-sm font-semibold uppercase text-ink outline-none focus-visible:bg-page/80"
                />
              </label>
            </div>

            <label className="block w-full sm:w-25">
              <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
                Position
              </span>
              <span className="flex min-h-12 items-center rounded-xl bg-page px-3">
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={selectedStop.at}
                  onChange={(event) =>
                    updatePosition(selectedStop.id, Number(event.target.value))
                  }
                  aria-label="Selected stop position percentage"
                  className="w-full min-w-0 bg-transparent text-sm font-semibold text-ink outline-none"
                />
                <span className="text-xs text-muted">%</span>
              </span>
            </label>

            <button
              type="button"
              disabled={stops.length <= MIN_STOPS}
              onClick={removeStop}
              className="min-h-12 rounded-full px-3 text-xs font-semibold text-muted transition-colors hover:bg-page hover:text-ink disabled:cursor-not-allowed disabled:opacity-30"
            >
              Remove
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={reverse}
              className="inline-flex min-h-10 items-center gap-2 rounded-full bg-soft px-4 text-xs font-semibold text-ink transition-colors hover:bg-ink/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            >
              <RotateIcon />
              Reverse colors
            </button>

            <button
              type="button"
              onClick={resetToPalette}
              className="min-h-10 rounded-full px-3 text-xs font-medium text-muted transition-colors hover:bg-soft hover:text-ink"
            >
              Reset to my palette
            </button>
          </div>
        </section>

        {/* Geometry controls */}
        <section
          aria-labelledby="gradient-settings-title"
          className="min-w-0 space-y-6"
        >
          <div>
            <h3
              id="gradient-settings-title"
              className="text-base font-semibold tracking-tight text-ink"
            >
              Shape & direction
            </h3>
            <p className="mt-1 text-xs text-muted">
              Control how your gradient moves across the canvas.
            </p>
          </div>

          {(type === "linear" || type === "conic") && (
            <label className="block space-y-4">
              <span className="flex items-center justify-between gap-4">
                <span className="text-xs font-semibold text-ink">
                  {type === "conic" ? "Rotation" : "Direction"}
                </span>
                <span className="font-mono text-sm font-semibold tabular-nums text-ink">
                  {angle}°
                </span>
              </span>

              <input
                type="range"
                min={0}
                max={360}
                step={1}
                value={angle}
                onChange={(event) => setAngle(Number(event.target.value))}
                className="w-full cursor-pointer accent-ink"
                aria-label={
                  type === "conic" ? "Conic rotation" : "Linear gradient angle"
                }
              />

              <div className="flex items-center justify-between text-[10px] text-muted">
                <span>0°</span>
                <span>180°</span>
                <span>360°</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {[0, 45, 90, 135, 180].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setAngle(value)}
                    aria-pressed={angle === value}
                    className={`min-h-9 rounded-full px-3 font-mono text-[11px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${angle === value ? "bg-ink text-page" : "bg-soft text-muted hover:text-ink"}`}
                  >
                    {value}°
                  </button>
                ))}
              </div>
            </label>
          )}

          {(type === "radial" || type === "conic") && (
            <div className="space-y-5">
              <p className="text-xs font-semibold text-ink">Focal point</p>

              <label className="block space-y-3">
                <span className="flex items-center justify-between">
                  <span className="text-xs text-muted">Horizontal</span>
                  <span className="font-mono text-xs font-semibold text-ink">
                    {center.x}%
                  </span>
                </span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={center.x}
                  onChange={(event) =>
                    setCenter((current) => ({
                      ...current,
                      x: Number(event.target.value),
                    }))
                  }
                  className="w-full cursor-pointer accent-ink"
                />
              </label>

              <label className="block space-y-3">
                <span className="flex items-center justify-between">
                  <span className="text-xs text-muted">Vertical</span>
                  <span className="font-mono text-xs font-semibold text-ink">
                    {center.y}%
                  </span>
                </span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={center.y}
                  onChange={(event) =>
                    setCenter((current) => ({
                      ...current,
                      y: Number(event.target.value),
                    }))
                  }
                  className="w-full cursor-pointer accent-ink"
                />
              </label>

              <button
                type="button"
                onClick={() => setCenter({ x: 50, y: 50 })}
                className="min-h-9 text-xs font-semibold text-muted transition-colors hover:text-ink"
              >
                ↺ Center the gradient
              </button>
            </div>
          )}
        </section>
      </div>

      {/* CSS export */}
      <Export text={css} />

      {/* Status */}
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
