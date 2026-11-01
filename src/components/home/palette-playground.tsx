/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui";
import PaletteSwatch from "./palette-swatch";
import PlaygroundOptions from "./playground-options";
import { useScrollExpansion } from "@/hooks/use-scroll-expansion";
import type { PalettePlaygroundState } from "@/hooks/use-palette-playground";

type GradientType = "linear" | "radial" | "conic";
const GRADIENT_TYPES: GradientType[] = ["linear", "radial", "conic"];

const focus =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink";

const buildGradient = (type: GradientType, angle: number, colors: string[]) =>
  type === "linear"
    ? `linear-gradient(${angle}deg, ${colors.join(", ")})`
    : type === "radial"
      ? `radial-gradient(circle at 30% 30%, ${colors.join(", ")})`
      : `conic-gradient(from ${angle}deg, ${colors.join(", ")}, ${colors[0]})`;

const toCssVars = (p: string[]) =>
  `:root {\n${p.map((c, i) => `  --color-${i + 1}: ${c};`).join("\n")}\n}`;

export default function PalettePlayground({
  controller,
}: {
  controller: PalettePlaygroundState;
}) {
  const {
    palette,
    history,
    setHistory,
    setPalette,
    setGeneration,
    setNotice,
    notice,
    shuffle,
    save,
  } = controller;
  const stageRef = useScrollExpansion();
  const panelRef = useRef<HTMLElement>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [format, setFormat] = useState<"hex" | "rgb">("hex");
  const [view, setView] = useState<"swatches" | "gradient">("swatches");
  const [gradientType, setGradientType] = useState<GradientType>("linear");
  const [angle, setAngle] = useState(120);
  const [fullscreen, setFullscreen] = useState(false);
  const [toast, setToast] = useState("");

  const gradient = buildGradient(gradientType, angle, palette);

  // Visible, auto-hiding feedback (the old status text was screen-reader only).
  function flash(message: string) {
    setToast(message);
    setNotice(message);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 2200);
  }
  useEffect(() => {
    if (!notice) return;
    setToast(notice);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 2200);
    return () => clearTimeout(toastTimer.current);
  }, [notice]);

  async function copy(text: string, message: string) {
    try {
      await navigator.clipboard.writeText(text);
      flash(message);
    } catch {
      flash("Copy failed. Select the text manually.");
    }
  }

  useEffect(() => {
    const update = () =>
      setFullscreen(document.fullscreenElement === panelRef.current);
    document.addEventListener("fullscreenchange", update);
    return () => document.removeEventListener("fullscreenchange", update);
  }, []);

  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (panelRef.current?.requestFullscreen)
        await panelRef.current.requestFullscreen();
      else
        setNotice(
          "Fullscreen is unavailable in this browser. Scroll down for the full-width workspace.",
        );
    } catch {
      setNotice(
        "Fullscreen could not open. The scroll-expanded workspace is still available.",
      );
    }
  }

  return (
    <div
      className="relative min-h-[max(1050px,150svh)] pb-24 [--expand:0] [--panel-gutter:max(36px,calc(100vw-1200px))] max-sm:min-h-0 max-[650px]:pb-20"
      ref={stageRef}
    >
      <section
        id="playground"
        ref={panelRef}
        className="sticky top-0 z-10 mx-auto flex h-[max(620px,calc(470px+var(--expand)*(100svh-470px)))] w-[calc(100%-(1-var(--expand))*var(--panel-gutter))] flex-col overflow-hidden rounded-[calc(16px*(1-var(--expand)))] bg-surface shadow-lg shadow-black/5 max-sm:relative max-sm:h-auto max-sm:min-h-svh [@media(max-height:650px)]:relative [@media(max-height:650px)]:h-auto [&:fullscreen]:h-dvh [&:fullscreen]:w-full [&:fullscreen]:overflow-auto [&:fullscreen]:rounded-none [&:fullscreen]:[--expand:1]"
        aria-label="Interactive palette playground"
      >
        {/* top bar */}
        <div className="flex min-h-16 shrink-0 flex-wrap items-center justify-between gap-3 p-4 md:px-6">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 text-sm font-semibold tracking-tight">
              <i className="size-2 rounded-full bg-violet-400" />
              Color playground
            </span>
            <span className="hidden text-xs text-muted lg:inline">
              Lock the colors you like. Edit any swatch.
            </span>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <div
              role="group"
              aria-label="View"
              className="flex gap-1 rounded-lg border border-line bg-soft p-1"
            >
              {(["swatches", "gradient"] as const).map((v) => (
                <button
                  key={v}
                  aria-pressed={view === v}
                  onClick={() => setView(v)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${focus} ${
                    view === v ? "bg-ink text-page" : "text-muted hover:text-ink"
                  }`}
                >
                  {v === "swatches" ? "Palette" : "Gradient"}
                </button>
              ))}
            </div>
            <button
              onClick={toggleFullscreen}
              aria-label={fullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-colors hover:bg-soft ${focus}`}
            >
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.6"
                fill="none"
                aria-hidden="true"
              >
                <path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5" />
              </svg>
              <span className="max-sm:sr-only">
                {fullscreen ? "Exit" : "Full screen"}
              </span>
            </button>
          </div>
        </div>

        {/* canvas */}
        <div
          className="relative min-h-145 flex-1 md:min-h-0"
          data-palette-canvas
        >
          {view === "swatches" ? (
            <div className="absolute inset-0 flex">
              {palette.map((color, i) => (
                <PaletteSwatch
                  key={i}
                  color={color}
                  index={i}
                  controller={controller}
                  format={format}
                />
              ))}
            </div>
          ) : (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 pt-36 pb-32 text-center text-white [text-shadow:0_2px_24px_rgb(0_0_0/0.35)]"
              style={{ background: gradient }}
            >
              <span className="text-3xl tracking-tight md:text-5xl">
                Somewhere in between.
              </span>
              <small className="text-xs md:text-sm">
                Your five colors. One continuous possibility.
              </small>

              {/* gradient controls */}
              <div className="mt-2 flex w-full max-w-md flex-col gap-3 rounded-2xl border border-white/40 bg-surface/85 p-3 text-left text-ink shadow-lg shadow-black/5 backdrop-blur-xl text-shadow-none dark:border-white/10">
                <div
                  role="group"
                  aria-label="Gradient type"
                  className="flex gap-1 rounded-lg border border-line bg-soft p-1"
                >
                  {GRADIENT_TYPES.map((t) => (
                    <button
                      key={t}
                      aria-pressed={gradientType === t}
                      onClick={() => setGradientType(t)}
                      className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors ${focus} ${
                        gradientType === t ? "bg-ink text-page" : "text-muted hover:text-ink"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <label className="flex items-center gap-3 text-xs">
                  <span className="w-16 shrink-0 text-muted">Angle {angle}°</span>
                  <input
                    type="range"
                    min={0}
                    max={360}
                    value={angle}
                    disabled={gradientType === "radial"}
                    onChange={(e) => setAngle(+e.target.value)}
                    className="w-full accent-ink disabled:opacity-40"
                    aria-label="Gradient angle"
                  />
                </label>
                <div className="flex items-center gap-2 rounded-lg border border-line bg-soft py-1.5 pl-3 pr-1.5">
                  <code className="min-w-0 flex-1 truncate text-[11px]">{gradient}</code>
                  <button
                    onClick={() => copy(`background: ${gradient};`, "Gradient CSS copied.")}
                    className={`shrink-0 rounded-md bg-ink px-3 py-1.5 text-xs font-medium text-page ${focus}`}
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="absolute inset-x-3 top-4 z-20 mx-auto max-w-4xl md:inset-x-6">
            <PlaygroundOptions
              controller={controller}
              format={format}
              setFormat={setFormat}
            />
          </div>

          {/* visible feedback */}
          <div
            aria-hidden="true"
            className={`pointer-events-none absolute inset-x-0 bottom-26 z-20 flex justify-center px-4 transition duration-200 motion-reduce:transition-none ${
              toast ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
            }`}
          >
            <span className="rounded-full bg-ink px-4 py-2 text-xs font-medium text-page shadow-lg">
              {toast}
            </span>
          </div>

          {/* action bar */}
          <div className="absolute inset-x-3 bottom-4 z-20 mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/50 bg-surface/85 px-4 py-3 text-ink shadow-lg shadow-black/5 backdrop-blur-xl md:inset-x-6 dark:border-white/10">
            <div className="flex items-center gap-2 md:gap-3">
              <button
                className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-ink px-4 py-2.5 text-xs font-medium text-page transition-transform hover:-translate-y-px motion-reduce:transform-none ${focus}`}
                onClick={shuffle}
              >
                ↻ Generate palette
              </button>
              <button
                className={`grid size-10 place-items-center rounded-lg text-xl transition-colors hover:bg-soft disabled:pointer-events-none disabled:opacity-30 ${focus}`}
                disabled={!history.length}
                aria-label="Undo palette change"
                onClick={() => {
                  setPalette(history[history.length - 1]);
                  setHistory(history.slice(0, -1));
                  setGeneration((v) => v + 1);
                  flash("Previous palette restored.");
                }}
              >
                ↶
              </button>
              <button
                className={`min-h-10 rounded-lg px-3 text-xs font-medium transition-colors hover:bg-soft ${focus}`}
                onClick={() =>
                  view === "gradient"
                    ? copy(`background: ${gradient};`, "Gradient CSS copied.")
                    : copy(toCssVars(palette), "CSS variables copied.")
                }
              >
                Copy CSS
              </button>
              <span className="sr-only" role="status">
                {notice || "Press space to shuffle. Lock the colors you love."}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="hidden text-xs text-muted md:inline">
                <kbd className="rounded border border-line bg-soft px-1.5 py-0.5 font-sans">
                  Space
                </kbd>{" "}
                to shuffle
              </span>
              <Link
                href="/tools/palette-studio"
                onClick={save}
                className={`inline-flex items-center gap-2 rounded-md text-xs font-medium whitespace-nowrap md:text-sm ${focus}`}
              >
                Continue in the studio <Icon name="palette" size={17} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-xs whitespace-nowrap text-muted">
        <span>Keep scrolling for more tools</span>
        <span aria-hidden="true" className="motion-safe:animate-bounce">
          ↓
        </span>
      </div>
    </div>
  );
}