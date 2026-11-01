"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Icon } from "@/components/ui";

type Round = {
  base: string;
  odd: string;
  oddIndex: number;
  size: number;
  direction: "lighter" | "darker";
};
type Phase = "playing" | "review" | "complete";

const BEST_KEY = "mycolors-odd-one-best-v1";
const ACCENTS = ["#FF795B", "#F6C85F", "#D7E7A9", "#9AAAF0", "#7963CF"];
const LEVELS = [
  { size: 3, delta: 0.115, name: "Warm up" },
  { size: 3, delta: 0.095, name: "Look closer" },
  { size: 4, delta: 0.078, name: "Getting tricky" },
  { size: 4, delta: 0.065, name: "Eagle eyes" },
  { size: 5, delta: 0.055, name: "Final boss" },
] as const;

const clamp = (number: number, min = 0, max = 1) =>
  Math.max(min, Math.min(max, number));

// OKLCH -> sRGB. Changing perceptual lightness is more consistent than adding to RGB channels.
function oklchToHex(lightness: number, chroma: number, hue: number) {
  const angle = (hue * Math.PI) / 180;
  const a = chroma * Math.cos(angle);
  const b = chroma * Math.sin(angle);
  const l = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (lightness - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const channels = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
  const srgb = (value: number) =>
    value <= 0.0031308
      ? 12.92 * value
      : 1.055 * Math.pow(value, 1 / 2.4) - 0.055;
  return `#${channels
    .map((value) =>
      Math.round(clamp(srgb(value)) * 255)
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;
}

function makeRound(level: number, randomize = true): Round {
  const config = LEVELS[level];
  const hue = randomize ? Math.random() * 360 : 283;
  const lightness = randomize ? 0.6 + Math.random() * 0.12 : 0.69;
  const chroma = randomize ? 0.085 + Math.random() * 0.035 : 0.11;
  const direction = randomize && Math.random() < 0.5 ? "darker" : "lighter";
  const difference = direction === "lighter" ? config.delta : -config.delta;
  const size = config.size;
  return {
    base: oklchToHex(lightness, chroma, hue),
    odd: oklchToHex(lightness + difference, chroma, hue),
    oddIndex: randomize ? Math.floor(Math.random() * size * size) : 5,
    size,
    direction,
  };
}

function Sparkle({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M24 1c3.2 14.5 8.5 19.8 23 23-14.5 3.2-19.8 8.5-23 23C20.8 32.5 15.5 27.2 1 24 15.5 20.8 20.8 15.5 24 1Z" />
    </svg>
  );
}

export default function ColorGame() {
  const [level, setLevel] = useState(0);
  const [round, setRound] = useState<Round>(() => makeRound(0, false));
  const [phase, setPhase] = useState<Phase>("playing");
  const [mistakes, setMistakes] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [earned, setEarned] = useState(0);
  const [skipped, setSkipped] = useState(false);
  const [focusTile, setFocusTile] = useState(0);
  const boardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const stored = Number(window.localStorage.getItem(BEST_KEY)); 
      if (Number.isFinite(stored) && stored >= 0)
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setBest(Math.min(500, stored));
    } catch {}
  }, []);

  function finish(finalScore: number) {
    setPhase("complete");
    if (finalScore > best) {
      setBest(finalScore);
      try {
        window.localStorage.setItem(BEST_KEY, String(finalScore));
      } catch {}
    }
  }

  function selectTile(index: number) {
    if (phase !== "playing" || mistakes.includes(index)) return;

    if (index !== round.oddIndex) {
      setMistakes((previous) => [...previous, index]);
      return;
    }

    const points = Math.max(25, 100 - mistakes.length * 25);
    const nextScore = score + points;
    setEarned(points);
    setSkipped(false);
    setScore(nextScore);

    if (level === LEVELS.length - 1) finish(nextScore);
    else setPhase("review");
  }

  function skipRound() {
    if (phase !== "playing" || mistakes.length < 2) return;
    setEarned(0);
    setSkipped(true);
    if (level === LEVELS.length - 1) finish(score);
    else setPhase("review");
  }

  function nextRound() {
    const next = level + 1;
    setLevel(next);
    setRound(makeRound(next));
    setMistakes([]);
    setEarned(0);
    setSkipped(false);
    setFocusTile(0);
    setPhase("playing");
  }

  function playAgain() {
    setLevel(0);
    setRound(makeRound(0));
    setMistakes([]);
    setScore(0);
    setEarned(0);
    setSkipped(false);
    setFocusTile(0);
    setPhase("playing");
  }

  function onTileKeyDown(
    event: React.KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    const movement: Record<string, number> = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -round.size,
      ArrowDown: round.size,
    };
    const delta = movement[event.key];
    if (delta === undefined) return;
    const next = index + delta;
    if (next < 0 || next >= round.size ** 2) return;
    if (event.key === "ArrowLeft" && index % round.size === 0) return;
    if (event.key === "ArrowRight" && index % round.size === round.size - 1)
      return;
    event.preventDefault();
    setFocusTile(next);
    boardRef.current
      ?.querySelector<HTMLButtonElement>(`[data-tile="${next}"]`)
      ?.focus();
  }

  const completed = phase === "complete";
  const revealed = phase !== "playing";
  const message = completed
    ? score === 500
      ? "Flawless. Your color instincts are unreal."
      : "Nice run! Think you can beat your score?"
    : phase === "review"
      ? skipped
        ? "No worries. Here's the shade you missed."
        : `You spotted it! +${earned} points.`
      : mistakes.length >= 2
        ? `Hint: the odd tile is slightly ${round.direction}.`
        : mistakes.length === 1
          ? "Not that one. The difference is subtle—try again."
          : "Tap the tile with a different shade. Which one is the impostor?";

  return (
    <section
      aria-labelledby="color-game-title"
      className="mx-auto w-[calc(100%-24px)] max-w-[1560px] py-16 sm:w-[calc(100%-48px)] md:py-24 lg:w-[calc(100%-80px)]"
    >
      <div className="relative isolate overflow-hidden rounded-[30px] bg-[#181725] text-white shadow-[0_24px_75px_rgba(20,16,40,0.16)] sm:rounded-[38px]">
        {/* A little joyful chaos, without distracting from the puzzle. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle,currentColor_1px,transparent_1.5px)] bg-size-[22px_22px] text-white/6.5"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-24 top-0 -z-10 size-96 rounded-full bg-[#7963CF]/25 blur-[110px]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-36 right-0 -z-10 size-125 rounded-full bg-[#FF795B]/15 blur-[120px]"
        />
        <Sparkle className="pointer-events-none absolute -left-6 top-1/3 size-24 rotate-12 text-[#F6C85F]/15 sm:size-36" />
        <Sparkle className="pointer-events-none absolute right-7 top-9 size-9 -rotate-12 text-[#D7E7A9]/40 sm:right-16 sm:top-14 sm:size-14" />

        <div className="relative grid items-center gap-8 px-5 py-9 sm:px-9 sm:py-12 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-10 lg:px-14 lg:py-16 xl:gap-16 xl:px-20">
          {/* The editorial side of the game. */}
          <div className="relative z-10 max-w-165">
            <div className="mb-8 inline-flex items-center gap-2.5 rounded-full bg-white/10 px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.15em] text-white/80 sm:text-[11px]">
              <span className="size-2 rounded-full bg-[#B9EF9D] shadow-[0_0_14px_#B9EF9D]" />
              A tiny game for your eyes
            </div>

            <h2
              id="color-game-title"
              className="max-w-162.5 text-[clamp(3.1rem,5.5vw,6.5rem)] font-semibold leading-[0.98] tracking-[-0.075em]"
            >
              One shade
              <br />
              is{" "}
              <span className="relative inline-block">
                <span className="bg-linear-to-r from-[#FF795B] via-[#F6C85F] to-[#9AAAF0] bg-clip-text text-transparent">
                  lying.
                </span>
                <span
                  aria-hidden="true"
                  className="absolute -right-6 -top-3 rotate-12 text-[0.45em] text-[#F6C85F]"
                >
                  
                </span>
              </span>
            </h2>

            <p className="mt-6 max-w-92.5 text-sm leading-[1.9] text-white/60 sm:text-base">
              Five fast rounds. One sneaky color in every grid. Find the odd
              shade and see how sharp your color sense really is.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3 sm:mt-10">
              <div className="flex items-center gap-3 rounded-2xl bg-white/[0.07] px-4 py-3">
                <span className="text-2xl font-semibold tracking-tight tabular-nums">
                  {score}
                  <span className="text-sm text-white/40">/500</span>
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-white/45">
                  Your
                  <br />
                  score
                </span>
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-white/[0.07] px-4 py-3">
                <span className="text-2xl font-semibold tracking-tight tabular-nums">
                  {best}
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-white/45">
                  Personal
                  <br />
                  best
                </span>
              </div>
            </div>

            <div className="mt-9 flex flex-col gap-3 sm:mt-11">
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/40">
                Five shades of difficulty
              </span>
              <div
                className="flex max-w-87.5 gap-1.5"
                aria-label={`Round ${level + 1} of ${LEVELS.length}`}
              >
                {LEVELS.map((_, index) => (
                  <span
                    key={index}
                    className={`h-2 flex-1 rounded-full transition-colors duration-300 ${index <= level ? "" : "bg-white/15"}`}
                    style={
                      index <= level
                        ? { backgroundColor: ACCENTS[index] }
                        : undefined
                    }
                  />
                ))}
              </div>
              <span className="text-xs font-medium text-white/65">
                {completed
                  ? "Sprint complete · Try for a perfect run"
                  : `Round ${String(level + 1).padStart(2, "0")} · ${LEVELS[level].name}`}
              </span>
            </div>

            <Link
              href="/tools/daily-color"
              className="group mt-9 inline-flex min-h-11 items-center gap-2.5 rounded-full bg-white px-5 text-xs font-bold text-[#181725] transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:shadow-[0_0_0_4px_#B7A8FF] motion-reduce:transform-none"
            >
              <Icon name="daily" size={17} />
              Try the daily color challenge
              <span
                aria-hidden="true"
                className="transition-transform group-hover:translate-x-1"
              >
                →
              </span>
            </Link>
          </div>

          {/* The interactive puzzle. */}
          <div className="relative mx-auto w-full max-w-147.5 lg:ml-auto">
            <div
              aria-hidden="true"
              className="absolute -inset-3 rotate-3 rounded-[36px] bg-[#7963CF]/35 sm:-inset-4"
            />
            <div
              aria-hidden="true"
              className="absolute -inset-1 -rotate-2 rounded-[34px] bg-[#FF795B]/30 sm:-inset-2"
            />
            <div className="relative overflow-hidden rounded-[28px] bg-[#F8F6F1] p-4 text-[#27232D] shadow-[0_25px_75px_rgba(0,0,0,0.26)] sm:rounded-4xl sm:p-7">
              <div className="mb-5 flex items-center justify-between gap-3 sm:mb-6">
                <div className="flex items-center gap-2.5">
                  <span className="grid size-9 place-items-center rounded-xl bg-[#27232D] text-white">
                    <Icon name="vision" size={19} />
                  </span>
                  <div>
                    <p className="text-xs font-bold tracking-tight sm:text-sm">
                      Spot the impostor
                    </p>
                    <p className="mt-0.5 text-[10px] font-medium text-[#77717B]">
                      {LEVELS[level].name} · {round.size} × {round.size}
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-[#EAE6E0] px-3 py-2 text-[10px] font-bold tabular-nums sm:text-xs">
                  {String(level + 1).padStart(2, "0")} / 05
                </span>
              </div>

              {completed ? (
                <div className="flex min-h-83.75 flex-col items-center justify-center rounded-[22px] bg-[#232133] px-5 py-8 text-center text-white sm:min-h-103.75">
                  <div className="mb-5 flex items-center gap-2">
                    {ACCENTS.map((color, index) => (
                      <span
                        key={index}
                        className="size-9 rounded-full shadow-[0_10px_20px_#00000025] sm:size-12"
                        style={{
                          backgroundColor: color,
                          transform: `translateY(${index % 2 ? 8 : -4}px)`,
                        }}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-white/50">
                    The verdict is in
                  </span>
                  <p className="mt-3 text-[clamp(3rem,8vw,5rem)] font-semibold tracking-[-0.09em] tabular-nums">
                    {score}
                    <span className="text-xl text-white/35"> / 500</span>
                  </p>
                  <p className="mt-1 max-w-61.25 text-sm leading-relaxed text-white/70">
                    {message}
                  </p>
                  <button
                    type="button"
                    onClick={playAgain}
                    className="mt-7 min-h-12 rounded-full bg-[#F6C85F] px-6 text-xs font-bold text-[#29221A] transition-transform hover:scale-105 focus-visible:outline-none focus-visible:shadow-[0_0_0_4px_#FFFFFF] motion-reduce:transform-none"
                  >
                    Play another sprint →
                  </button>
                </div>
              ) : (
                <>
                  <div
                    ref={boardRef}
                    role="group"
                    aria-label={`Odd color puzzle, ${round.size} by ${round.size} grid. Use arrow keys to move between tiles.`}
                    className="grid gap-2 rounded-[22px] bg-[#EAE6E0] p-2.5 sm:gap-2.5 sm:p-3.5"
                    style={{
                      gridTemplateColumns: `repeat(${round.size}, minmax(0, 1fr))`,
                    }}
                  >
                    {Array.from(
                      { length: round.size * round.size },
                      (_, index) => {
                        const correct = index === round.oddIndex;
                        const wrong = mistakes.includes(index);
                        const showCorrect = revealed && correct;
                        const tileColor = correct ? round.odd : round.base;

                        return (
                          <button
                            key={index}
                            data-tile={index}
                            type="button"
                            disabled={revealed}
                            aria-disabled={wrong || undefined}
                            tabIndex={focusTile === index ? 0 : -1}
                            onFocus={() => setFocusTile(index)}
                            onKeyDown={(event) => onTileKeyDown(event, index)}
                            onClick={() => selectTile(index)}
                            aria-label={`Tile ${index + 1}${wrong ? ", already tried" : ""}${showCorrect ? ", the odd tile" : ""}`}
                            className={`relative grid aspect-square min-w-0 place-items-center overflow-hidden rounded-[13px] transition-[transform,box-shadow,filter] duration-200 focus-visible:outline-none focus-visible:shadow-[0_0_0_4px_#ffffff] motion-reduce:transition-none sm:rounded-[17px] ${wrong ? "opacity-65" : ""} ${revealed ? "cursor-default" : "cursor-pointer hover:-translate-y-0.5 hover:shadow-[0_10px_20px_#00000020] active:scale-[0.96]"}`}
                            style={
                              { backgroundColor: tileColor } as CSSProperties
                            }
                          >
                            {wrong && (
                              <span
                                aria-hidden="true"
                                className="grid size-7 place-items-center rounded-full bg-black/20 text-xl font-bold text-white"
                              >
                                ×
                              </span>
                            )}
                            {showCorrect && (
                              <span
                                aria-hidden="true"
                                className="grid size-9 place-items-center rounded-full bg-white/85 text-xl font-bold text-[#27232D] shadow-lg sm:size-11"
                              >
                                ✓
                              </span>
                            )}
                          </button>
                        );
                      },
                    )}
                  </div>

                  <div className="flex min-h-23 flex-wrap items-center justify-between gap-3 pt-4 sm:pt-5">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`size-2 shrink-0 rounded-full ${revealed ? "bg-[#47B881]" : mistakes.length ? "bg-[#F09A68]" : "bg-[#7963CF]"}`}
                        />
                        <p
                          role="status"
                          aria-live="polite"
                          className="text-[11px] font-semibold leading-relaxed sm:text-xs"
                        >
                          {message}
                        </p>
                      </div>
                      {revealed && (
                        <p className="mt-1.5 pl-4 font-mono text-[10px] text-[#77717B]">
                          {round.base.toUpperCase()} → {round.odd.toUpperCase()}
                        </p>
                      )}
                      {!revealed && mistakes.length >= 2 && (
                        <button
                          type="button"
                          onClick={skipRound}
                          className="mt-2 pl-4 text-[11px] font-medium text-[#77717B] underline underline-offset-4 hover:text-[#27232D] focus-visible:outline-none focus-visible:text-[#27232D]"
                        >
                          Reveal & skip this round
                        </button>
                      )}
                    </div>
                    {phase === "review" && (
                      <button
                        type="button"
                        onClick={nextRound}
                        className="min-h-11 shrink-0 rounded-full bg-[#27232D] px-4 text-[11px] font-bold text-white transition-transform hover:scale-105 focus-visible:outline-none focus-visible:shadow-[0_0_0_4px_#7963CF] motion-reduce:transform-none"
                      >
                        Next round →
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-center text-[10px] font-medium text-white/45">
              <span>No timer</span>
              <span>✳</span>
              <span>No pressure</span>
              <span>✳</span>
              <span>Just your eyes</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
