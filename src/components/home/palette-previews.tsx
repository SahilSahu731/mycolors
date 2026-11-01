"use client";

import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { ink, paletteCSS } from "@/lib/colors";

type Scene = "aurora" | "poster" | "website";
type Point = { x: number; y: number };

const FALLBACK = ["#FF795B", "#F6C85F", "#D7E7A9", "#9AAAF0", "#7963CF"];
const HEX = /^#[0-9a-f]{6}$/i;

const INITIAL_POINTS: Point[] = [
  { x: 15, y: 32 },
  { x: 42, y: 20 },
  { x: 83, y: 30 },
  { x: 27, y: 75 },
  { x: 77, y: 72 },
];

const SCENES: { id: Scene; label: string }[] = [
  { id: "aurora", label: "Aurora" },
  { id: "poster", label: "Poster" },
  { id: "website", label: "Website" },
];

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

function ColorFlower({ colors }: { colors: string[] }) {
  return (
    <svg
      viewBox="0 0 500 500"
      fill="none"
      aria-hidden="true"
      className="h-full w-full overflow-visible drop-shadow-[0_30px_40px_rgba(0,0,0,0.14)]"
    >
      <g transform="translate(250 250)">
        {colors.map((color, index) => (
          <ellipse
            key={index}
            cx="0"
            cy="-112"
            rx="78"
            ry="158"
            fill={color}
            transform={`rotate(${index * 72})`}
          />
        ))}
        <circle r="66" fill={colors[1]} />
        <circle r="30" fill={colors[4]} />
        <circle r="12" fill={colors[2]} />
      </g>
    </svg>
  );
}

function WebsiteScene({ colors, dark }: { colors: string[]; dark: boolean }) {
  const text = dark ? "#FAF9F6" : "#25232A";
  const muted = dark ? "#B0ADB8" : "#77717B";

  return (
    <div
      className="pointer-events-none absolute inset-0 flex flex-col px-6 pb-12 pt-25 sm:px-12 lg:px-20 lg:pt-27"
      style={{ color: text }}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className="size-8 rotate-[-14deg] rounded-[10px]"
            style={{ backgroundColor: colors[0] }}
          />
          <span className="text-2xl font-black tracking-[-0.09em]">forma.</span>
        </div>
        <div
          className="hidden items-center gap-8 text-xs font-semibold lg:flex"
          style={{ color: muted }}
        >
          <span>Discover</span>
          <span>Collections</span>
          <span>Our story</span>
        </div>
        <span
          className="rounded-full px-5 py-3 text-xs font-bold"
          style={{ backgroundColor: colors[4], color: ink(colors[4]) }}
        >
          Explore ↗
        </span>
      </div>

      <div className="grid flex-1 items-center gap-4 lg:grid-cols-[1fr_0.9fr]">
        <div className="relative z-10">
          <span
            className="text-[10px] font-bold uppercase tracking-[0.2em]"
            style={{ color: muted }}
          >
            A different kind of design studio
          </span>
          <h3 className="mt-6 max-w-175 text-[clamp(3.3rem,7vw,8rem)] font-semibold leading-[0.89] tracking-[-0.085em]">
            Be a little
            <br />
            <span
              className="font-serif font-normal italic"
              style={{ color: colors[0] }}
            >
              different.
            </span>
          </h3>
          <p
            className="mt-7 max-w-[320px] text-sm leading-relaxed"
            style={{ color: muted }}
          >
            A world of unexpected forms, bright ideas, and things that make you
            feel something.
          </p>
          <div
            className="mt-8 inline-flex items-center gap-4 rounded-full px-6 py-3.5 text-xs font-bold"
            style={{ backgroundColor: colors[1], color: ink(colors[1]) }}
          >
            Discover more <span>↗</span>
          </div>
        </div>

        <div className="relative mx-auto hidden aspect-square w-full max-w-125 lg:block">
          <ColorFlower colors={colors} />
        </div>
      </div>

      <div
        className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.15em]"
        style={{ color: muted }}
      >
        <span>Independent by design</span>
        <span>Made to stand out / 2026</span>
      </div>
    </div>
  );
}

function PosterScene({
  colors,
  outline,
}: {
  colors: string[];
  outline: boolean;
}) {
  const fg = ink(colors[2]);

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden p-7 pt-26 sm:p-12 sm:pt-28 lg:p-20 lg:pt-30"
      style={{ color: fg }}
    >
      <div className="absolute right-[-18%] top-[14%] size-[85%] rotate-[-14deg] opacity-95 sm:right-[-4%] sm:size-[65%] lg:right-[-2%] lg:top-[6%]">
        <ColorFlower colors={colors} />
      </div>

      <div className="relative z-10 flex h-full flex-col justify-between">
        <div className="flex items-center justify-between gap-3 text-[10px] font-black uppercase tracking-[0.18em]">
          <span>The beautiful disorder</span>
          <span>No. 005</span>
        </div>

        <div>
          <span className="text-xs font-bold uppercase tracking-[0.25em]">
            A study of everything vibrant
          </span>
          <h3
            className="mt-6 text-[clamp(4.5rem,11vw,12rem)] font-black uppercase leading-[0.78] tracking-[-0.11em]"
            style={
              outline
                ? { color: "transparent", WebkitTextStroke: `2px ${fg}` }
                : undefined
            }
          >
            Make.
            <br />
            Some.
            <br />
            Noise.
          </h3>
        </div>

        <div className="flex justify-between gap-3 text-[10px] font-bold uppercase tracking-[0.15em]">
          <span>Color is a feeling.</span>
          <span>Not just a number.</span>
        </div>
      </div>
    </div>
  );
}

function AuroraScene({ colors }: { colors: string[] }) {
  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-5 text-center text-white">
      <span className="mb-6 text-[10px] font-bold uppercase tracking-[0.28em] text-white/65">
        An experiment in beautiful chaos
      </span>
      <h3 className="max-w-287.5 text-[clamp(3.7rem,9vw,11rem)] font-semibold leading-[0.88] tracking-[-0.095em] [text-shadow:0_8px_60px_rgb(0_0_0/0.2)]">
        Let colors
        <br />
        <span className="font-serif font-normal italic">collide.</span>
      </h3>
      <div className="mt-8 flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-[11px] font-medium text-white/85 backdrop-blur-xl">
        <span
          className="size-2 animate-pulse rounded-full motion-reduce:animate-none"
          style={{ backgroundColor: colors[1] }}
        />
        Drag the color orbs to reshape the atmosphere
      </div>
    </div>
  );
}

export default function PalettePreviews({
  palette,
  onSave,
}: {
  palette: string[];
  onSave: () => void;
}) {
  const colors = FALLBACK.map((fallback, index) =>
    HEX.test(palette[index] ?? "") ? palette[index] : fallback,
  );

  const [scene, setScene] = useState<Scene>("aurora");
  const [points, setPoints] = useState<Point[]>(INITIAL_POINTS);
  const [active, setActive] = useState(0);
  const [intensity, setIntensity] = useState(85);
  const [websiteDark, setWebsiteDark] = useState(false);
  const [posterOutline, setPosterOutline] = useState(false);
  const [notice, setNotice] = useState("");

  const stageRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const baseColor =
    scene === "poster"
      ? colors[2]
      : scene === "website"
        ? websiteDark
          ? "#171821"
          : "#F8F6F0"
        : "#0C0D19";

  const alpha = Math.round((intensity / 100) * 190)
    .toString(16)
    .padStart(2, "0");

  const mesh = points
    .map(
      (point, index) =>
        `radial-gradient(ellipse 48% 60% at ${point.x}% ${point.y}%, ${colors[index]}${alpha} 0%, ${colors[index]}55 43%, transparent 100%)`,
    )
    .reverse()
    .join(", ");

  function flash(message: string) {
    if (timerRef.current) clearTimeout(timerRef.current);
    setNotice(message);
    timerRef.current = setTimeout(() => setNotice(""), 2300);
  }

  function movePoint(index: number, clientX: number, clientY: number) {
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = clamp(((clientX - rect.left) / rect.width) * 100, 7, 93);
    const y = clamp(((clientY - rect.top) / rect.height) * 100, 16, 83);

    setPoints((previous) =>
      previous.map((point, i) => (i === index ? { x, y } : point)),
    );
  }

  function startDrag(
    index: number,
    event: ReactPointerEvent<HTMLButtonElement>,
  ) {
    if (event.button !== 0) return;
    draggingRef.current = index;
    setActive(index);
    event.currentTarget.setPointerCapture(event.pointerId);
    movePoint(index, event.clientX, event.clientY);
  }

  function moveDrag(
    index: number,
    event: ReactPointerEvent<HTMLButtonElement>,
  ) {
    if (draggingRef.current !== index) return;
    movePoint(index, event.clientX, event.clientY);
  }

  function stopDrag() {
    draggingRef.current = null;
  }

  function nudge(index: number, key: string) {
    const offsets: Record<string, [number, number]> = {
      ArrowLeft: [-2, 0],
      ArrowRight: [2, 0],
      ArrowUp: [0, -2],
      ArrowDown: [0, 2],
    };

    const offset = offsets[key];
    if (!offset) return false;

    setPoints((previous) =>
      previous.map((point, i) =>
        i === index
          ? {
              x: clamp(point.x + offset[0], 7, 93),
              y: clamp(point.y + offset[1], 16, 83),
            }
          : point,
      ),
    );
    return true;
  }

  function remix() {
    setPoints(
      INITIAL_POINTS.map(() => ({
        x: 12 + Math.random() * 76,
        y: 19 + Math.random() * 62,
      })),
    );
    flash("New composition created.");
  }

  async function copy(text: string, message: string) {
    try {
      await navigator.clipboard.writeText(text);
      flash(message);
    } catch {
      flash("Clipboard access is unavailable.");
    }
  }

  function exportArt() {
    const circles = points
      .map(
        (point, index) =>
          `<circle cx="${point.x * 16}" cy="${point.y * 9}" r="480" fill="${colors[index]}" opacity="${(intensity / 130).toFixed(2)}" filter="url(#blur)"/>`,
      )
      .join("");
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900"><defs><filter id="blur" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="130"/></filter></defs><rect width="1600" height="900" fill="#0C0D19"/>${circles}</svg>`;

    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = "mycolors-color-reactor.svg";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);

    flash("Color artwork exported.");
  }

  return (
    <section
      aria-labelledby="reactor-title"
      className="relative left-1/2 w-[calc(100dvw-24px)] -translate-x-1/2 py-16 sm:w-[calc(100dvw-48px)] md:py-24 lg:w-[calc(100dvw-80px)]"
    >
      {/* Section introduction */}
      <div className="mb-8 flex flex-col justify-between gap-5 px-1 md:mb-10 md:flex-row md:items-end">
        <div>
          <div className="mb-4 flex items-center gap-2">
            {colors.map((color, index) => (
              <span
                key={index}
                className="size-2 rounded-full"
                style={{ backgroundColor: color }}
              />
            ))}
            <span className="ml-2 text-[10px] font-bold uppercase tracking-[0.22em] text-muted">
              The Color Reactor / Interactive experiment
            </span>
          </div>
          <h2
            id="reactor-title"
            className="max-w-5xl text-[clamp(2.8rem,6vw,6rem)] font-semibold leading-[0.98] tracking-[-0.075em] text-ink"
          >
            Your palette has
            <br />
            <span className="font-serif font-normal italic text-muted">
              a wild side.
            </span>
          </h2>
        </div>

        <p className="max-w-72.5 text-sm leading-[1.8] text-muted">
          Five colors. Three creative worlds. Move them, remix them, and turn
          them into something unexpected.
        </p>
      </div>

      {/* Giant creative canvas */}
      <div
        ref={stageRef}
        className="relative isolate min-h-155 overflow-hidden rounded-[28px] bg-[#0C0D19] sm:min-h-175 lg:min-h-190"
        style={{ backgroundColor: baseColor }}
      >
        {/* Live reactive color field */}
        {scene !== "poster" && (
          <div
            aria-hidden="true"
            className={`pointer-events-none absolute inset-0 transition-opacity duration-500 ${scene === "website" ? "opacity-25" : "opacity-100"}`}
            style={{ backgroundImage: mesh }}
          />
        )}

        {/* Original dotted texture */}
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 bg-[radial-gradient(circle,currentColor_1px,transparent_1.5px)] bg-size-[22px_22px] ${scene === "website" && !websiteDark ? "text-black/10" : "text-white/10"}`}
        />

        {/* Scene content */}
        {scene === "aurora" && <AuroraScene colors={colors} />}
        {scene === "poster" && (
          <PosterScene colors={colors} outline={posterOutline} />
        )}
        {scene === "website" && (
          <WebsiteScene colors={colors} dark={websiteDark} />
        )}

        {/* Top workspace controls */}
        <div className="absolute inset-x-4 top-4 z-30 flex flex-wrap items-center justify-between gap-3 sm:inset-x-7 sm:top-7">
          <div className="inline-flex items-center gap-2 rounded-full bg-black/35 px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.15em] text-white backdrop-blur-xl">
            <span className="size-1.5 animate-pulse rounded-full bg-[#B8F0BA] motion-reduce:animate-none" />
            Live composition
          </div>

          <div
            role="group"
            aria-label="Creative preview mode"
            className="flex items-center gap-1 rounded-full bg-black/45 p-1 text-white backdrop-blur-xl"
          >
            {SCENES.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={scene === item.id}
                onClick={() => setScene(item.id)}
                className={`rounded-full px-3.5 py-2.5 text-[11px] font-semibold transition-all focus-visible:outline-none focus-visible:bg-white/30 sm:px-5 ${scene === item.id ? "bg-white text-[#17171B]" : "text-white/75 hover:bg-white/15 hover:text-white"}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Connections and draggable color sources */}
        {scene === "aurora" && (
          <>
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 h-full w-full"
            >
              <polyline
                points={points
                  .map((point) => `${point.x},${point.y}`)
                  .join(" ")}
                fill="none"
                stroke="white"
                strokeOpacity=".22"
                strokeWidth="1"
                strokeDasharray="3 7"
                vectorEffect="non-scaling-stroke"
              />
            </svg>

            {points.map((point, index) => (
              <button
                key={index}
                type="button"
                aria-label={`Move color ${index + 1}, ${colors[index]}. Drag or use arrow keys.`}
                aria-pressed={active === index}
                onPointerDown={(event) => startDrag(index, event)}
                onPointerMove={(event) => moveDrag(index, event)}
                onPointerUp={stopDrag}
                onPointerCancel={stopDrag}
                onLostPointerCapture={stopDrag}
                onKeyDown={(event) => {
                  if (nudge(index, event.key)) event.preventDefault();
                }}
                onClick={() => setActive(index)}
                className={`group absolute z-20 grid size-12 -translate-x-1/2 -translate-y-1/2 touch-none place-items-center rounded-full shadow-[0_12px_35px_rgb(0_0_0/0.3)] transition-[box-shadow,scale] duration-200 hover:scale-110 focus-visible:scale-110 focus-visible:outline-none sm:size-15 ${active === index ? "shadow-[0_0_0_6px_rgb(255_255_255/0.28),0_15px_45px_rgb(0_0_0/0.3)]" : ""}`}
                style={{
                  left: `${point.x}%`,
                  top: `${point.y}%`,
                  backgroundColor: colors[index],
                  color: ink(colors[index]),
                }}
              >
                <span className="size-4 rounded-full bg-current/25 sm:size-5" />
                <span className="pointer-events-none absolute -bottom-9 left-1/2 -translate-x-1/2 rounded-full bg-black/55 px-2.5 py-1 font-mono text-[10px] font-semibold whitespace-nowrap text-white opacity-0 backdrop-blur-lg transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                  {colors[index].toUpperCase()}
                </span>
              </button>
            ))}
          </>
        )}

        {/* Context-specific stage actions */}
        <div className="absolute inset-x-4 bottom-5 z-30 flex flex-wrap items-center justify-between gap-3 sm:inset-x-8 sm:bottom-8">
          <div className="inline-flex items-center gap-3 rounded-full bg-black/40 px-4 py-2.5 text-white backdrop-blur-xl">
            <div className="flex gap-1">
              {colors.map((color, index) => (
                <span
                  key={index}
                  className={`size-2.5 rounded-full ${active === index ? "scale-125" : ""}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <span className="font-mono text-[11px] font-semibold">
              {colors[active].toUpperCase()}
            </span>
          </div>

          {scene === "aurora" && (
            <span className="hidden text-[11px] font-medium text-white/75 sm:inline">
              DRAG • EXPLORE • REMIX
            </span>
          )}
          {scene === "poster" && (
            <button
              type="button"
              onClick={() => setPosterOutline((value) => !value)}
              className="rounded-full bg-black/40 px-5 py-3 text-xs font-semibold text-white backdrop-blur-xl transition-colors hover:bg-black/60 focus-visible:outline-none"
            >
              Switch typography ↗
            </button>
          )}
          {scene === "website" && (
            <button
              type="button"
              onClick={() => setWebsiteDark((value) => !value)}
              className="rounded-full bg-black/40 px-5 py-3 text-xs font-semibold text-white backdrop-blur-xl transition-colors hover:bg-black/60 focus-visible:outline-none"
            >
              Switch to {websiteDark ? "light" : "dark"} ↗
            </button>
          )}
        </div>
      </div>

      {/* Controls below the canvas */}
      <div className="flex flex-col justify-between gap-6 px-1 py-6 lg:flex-row lg:items-center">
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          <button
            type="button"
            onClick={remix}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-soft px-5 text-xs font-semibold text-ink transition-colors hover:bg-ink/10 focus-visible:outline-none focus-visible:bg-ink/15"
          >
            <span className="text-lg">↻</span> Remix composition
          </button>

          <label className="flex items-center gap-3 text-xs font-semibold text-muted">
            Intensity
            <input
              type="range"
              min={20}
              max={100}
              value={intensity}
              onChange={(event) => setIntensity(Number(event.target.value))}
              aria-label="Color atmosphere intensity"
              className="w-26 cursor-pointer accent-ink sm:w-32"
            />
            <span className="min-w-7 tabular-nums">{intensity}%</span>
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() =>
              copy(
                `${paletteCSS(colors)}\n\n.reactor-mesh {\n  background-color: ${baseColor};\n  background-image: ${mesh};\n}`,
                "Color CSS copied.",
              )
            }
            className="min-h-11 rounded-full bg-soft px-5 text-xs font-semibold text-ink transition-colors hover:bg-ink/10 focus-visible:outline-none focus-visible:bg-ink/15"
          >
            Copy CSS
          </button>
          <button
            type="button"
            onClick={exportArt}
            className="min-h-11 rounded-full bg-soft px-5 text-xs font-semibold text-ink transition-colors hover:bg-ink/10 focus-visible:outline-none focus-visible:bg-ink/15"
          >
            Export art ↓
          </button>
          <button
            type="button"
            onClick={onSave}
            className="min-h-11 rounded-full bg-ink px-6 font-semibold text-page transition-transform hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:opacity-80"
          >
            Save palette
          </button>
        </div>
      </div>

      {/* <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4"
      >
        {notice && (
          <span className="rounded-full bg-ink px-5 py-3 text-xs font-semibold text-page shadow-2xl">
            {notice}
          </span>
        )}
      </div> */}
    </section>
  );
}
