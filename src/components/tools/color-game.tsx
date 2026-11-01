"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fromHsl, hsl, rgb } from "@/lib/colors";

type HSL = [number, number, number];

const INITIAL_GUESS: HSL = [180, 45, 55];

const CHANNELS = [
  { name: "Hue", short: "H", unit: "°", max: 359 },
  { name: "Saturation", short: "S", unit: "%", max: 100 },
  { name: "Lightness", short: "L", unit: "%", max: 100 },
] as const;

function randomTarget() {
  return fromHsl(
    Math.random() * 360,
    35 + Math.random() * 40,
    40 + Math.random() * 30,
  );
}

function dailyTarget(day: string) {
  let seed = 0;

  for (const char of day) {
    seed = (seed * 31 + char.charCodeAt(0)) >>> 0;
  }

  return fromHsl(seed % 360, 35 + (seed % 40), 40 + (seed % 35));
}

function calculateScore(target: string, chosen: string) {
  const a = rgb(target);
  const b = rgb(chosen);

  const distance = Math.sqrt(
    a.reduce((sum, value, index) => sum + (value - b[index]) ** 2, 0),
  );

  return Math.max(
    0,
    Math.min(100, Math.round(100 * (1 - distance / (255 * Math.sqrt(3))))),
  );
}

function getVerdict(score: number) {
  if (score >= 98) {
    return {
      title: "Practically identical.",
      subtitle: "That was an exceptionally precise match.",
    };
  }

  if (score >= 92) {
    return {
      title: "You've got an incredible eye.",
      subtitle: "Only a tiny adjustment separates these colors.",
    };
  }

  if (score >= 82) {
    return {
      title: "You're seeing the details.",
      subtitle: "A strong attempt. Pay attention to the subtler differences.",
    };
  }

  if (score >= 70) {
    return {
      title: "Getting closer.",
      subtitle: "Try paying more attention to saturation and brightness.",
    };
  }

  return {
    title: "Your eyes are still warming up.",
    subtitle: "Every attempt is another chance to sharpen your color sense.",
  };
}

function clamp(value: number, max: number) {
  return Math.max(0, Math.min(max, Math.round(value)));
}

function formatUTC(day: string) {
  if (!day) return "";

  return new Date(`${day}T00:00:00Z`)
    .toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    })
    .toUpperCase();
}

function TuneControl({
  index,
  value,
  guess,
  disabled,
  onChange,
}: {
  index: number;
  value: number;
  guess: HSL;
  disabled: boolean;
  onChange: (index: number, value: number) => void;
}) {
  const channel = CHANNELS[index];

  const gradients = [
    "linear-gradient(to right, #FF4D4D, #FFD34D, #58DE87, #4DCFE9, #6868F7, #E961D5, #FF4D4D)",
    `linear-gradient(to right, ${fromHsl(guess[0], 0, guess[2])}, ${fromHsl(guess[0], 100, guess[2])})`,
    `linear-gradient(to right, #08090D, ${fromHsl(guess[0], guess[1], 50)}, #FFFFFF)`,
  ];

  return (
    <div className="min-w-0 flex-1">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <span className="font-mono text-[10px] font-semibold tracking-[0.17em] text-white/35">
            CHANNEL 0{index + 1}
          </span>

          <h3 className="mt-1.5 text-sm font-semibold tracking-tight text-white">
            {channel.name}
          </h3>
        </div>

        <div className="flex items-baseline gap-1">
          <span className="font-mono text-3xl font-medium tracking-[-0.08em] tabular-nums text-white sm:text-4xl">
            {value}
          </span>
          <span className="font-mono text-sm text-white/40">
            {channel.unit}
          </span>
        </div>
      </div>

      <input
        type="range"
        min={0}
        max={channel.max}
        step={1}
        value={value}
        disabled={disabled}
        aria-label={`Adjust ${channel.name.toLowerCase()}`}
        onChange={(event) => onChange(index, Number(event.target.value))}
        className="h-3 w-full cursor-pointer appearance-none rounded-full outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-4 focus-visible:ring-offset-[#141720] disabled:cursor-not-allowed disabled:opacity-65 [&::-webkit-slider-thumb]:size-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-[0_2px_9px_rgb(0_0_0/0.3)] [&::-moz-range-thumb]:size-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-white"
        style={{ background: gradients[index] }}
      />

      <div className="mt-4 flex items-center justify-between gap-2">
        <span className="font-mono text-[10px] text-white/35">
          {index === 0 ? "0°" : "0%"}
        </span>

        <span className="font-mono text-[10px] text-white/35">
          {index === 0 ? "359°" : "100%"}
        </span>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <button
          type="button"
          disabled={disabled || value === 0}
          onClick={() => onChange(index, value - 1)}
          aria-label={`Decrease ${channel.name.toLowerCase()}`}
          className="grid size-9 place-items-center rounded-full bg-white/8 text-lg text-white/75 transition-colors hover:bg-white/15 hover:text-white focus-visible:outline-2 focus-visible:outline-white disabled:opacity-25"
        >
          −
        </button>

        <span className="font-mono text-[10px] text-white/35">FINE TUNE</span>

        <button
          type="button"
          disabled={disabled || value === channel.max}
          onClick={() => onChange(index, value + 1)}
          aria-label={`Increase ${channel.name.toLowerCase()}`}
          className="grid size-9 place-items-center rounded-full bg-white/8 text-lg text-white/75 transition-colors hover:bg-white/15 hover:text-white focus-visible:outline-2 focus-visible:outline-white disabled:opacity-25"
        >
          +
        </button>
      </div>
    </div>
  );
}

function ColorDial({
  target,
  chosen,
  revealed,
}: {
  target: string;
  chosen: string;
  revealed: boolean;
}) {
  return (
    <div className="relative mx-auto w-full max-w-107.5">
      {/* Calibration marks */}
      <div className="relative mx-auto aspect-square w-full">
        <svg
          viewBox="0 0 400 400"
          className="pointer-events-none absolute inset-0 size-full"
          aria-hidden="true"
        >
          <circle
            cx="200"
            cy="200"
            r="186"
            fill="none"
            stroke="#FFFFFF"
            strokeOpacity=".08"
            strokeWidth="1"
          />

          {Array.from({ length: 60 }, (_, index) => (
            <line
              key={index}
              x1="200"
              y1="11"
              x2="200"
              y2={index % 5 === 0 ? "28" : "20"}
              transform={`rotate(${index * 6} 200 200)`}
              stroke="#FFFFFF"
              strokeOpacity={index % 5 === 0 ? ".5" : ".18"}
              strokeWidth={index % 5 === 0 ? "2" : "1"}
              strokeLinecap="round"
            />
          ))}
        </svg>

        {/* Split target/guess disc */}
        <div
          className="absolute inset-[10%] overflow-hidden rounded-full shadow-[0_25px_70px_rgb(0_0_0/0.32)]"
          style={{
            background: `linear-gradient(to right, ${target} 0%, ${target} 50%, ${chosen} 50%, ${chosen} 100%)`,
          }}
        >
          <div
            aria-hidden="true"
            className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-black/15"
          />
        </div>

        {/* Center notch */}
        <div
          aria-hidden="true"
          className="absolute left-1/2 top-[6%] h-[11%] w-0.75 -translate-x-1/2 rounded-full bg-white/70"
        />
      </div>

      {/* Readout labels */}
      <div className="mt-1 grid grid-cols-2 gap-4 px-5 text-center sm:px-10">
        <div>
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.17em] text-white/40">
            01 / Target
          </p>

          <p className="mt-2 font-mono text-sm font-semibold text-white">
            {revealed ? target.toUpperCase() : "•••••••"}
          </p>
        </div>

        <div>
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.17em] text-white/40">
            02 / Your mix
          </p>

          <p className="mt-2 font-mono text-sm font-semibold text-white">
            {chosen.toUpperCase()}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Game({ daily }: { daily: boolean }) {
  const [target, setTarget] = useState("#91B9A1");
  const [guess, setGuess] = useState<HSL>(INITIAL_GUESS);
  const [score, setScore] = useState<number | null>(null);
  const [best, setBest] = useState(0);
  const [date, setDate] = useState("");
  const [round, setRound] = useState(1);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const day = new Date().toISOString().slice(0, 10);

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDate(day);
    setRound(1);
    setGuess([...INITIAL_GUESS]);
    setScore(null);
    setNotice("");

    if (daily) {
      setTarget(dailyTarget(day));

      try {
        const saved = JSON.parse(
          localStorage.getItem(`kolivra-daily-${day}`) || "null",
        );

        if (
          saved &&
          Array.isArray(saved.guess) &&
          saved.guess.length === 3 &&
          Number.isFinite(saved.score)
        ) {
          setGuess([
            clamp(Number(saved.guess[0]), 359),
            clamp(Number(saved.guess[1]), 100),
            clamp(Number(saved.guess[2]), 100),
          ]);

          setScore(clamp(Number(saved.score), 100));
        }
      } catch {
        // Local storage may be unavailable.
      }
    } else {
      setTarget(randomTarget());
    }

    try {
      const previousBest = Number(localStorage.getItem("kolivra-best") || 0);

      setBest(Number.isFinite(previousBest) ? clamp(previousBest, 100) : 0);
    } catch {
      setBest(0);
    }

    setReady(true);
  }, [daily]);

  const chosen = fromHsl(...guess);
  const revealed = score !== null;

  const verdict = revealed ? getVerdict(score) : null;

  const targetHSL = hsl(target);

  const hueDifference = Math.abs(((targetHSL[0] - guess[0] + 540) % 360) - 180);

  const saturationDifference = Math.abs(targetHSL[1] - guess[1]);

  const lightnessDifference = Math.abs(targetHSL[2] - guess[2]);

  function updateGuess(index: number, value: number) {
    if (revealed) return;

    setGuess((current) => {
      const next: HSL = [...current];

      next[index] = clamp(value, CHANNELS[index].max);

      return next;
    });
  }

  function submit() {
    if (!ready || revealed) return;

    if (daily && date !== new Date().toISOString().slice(0, 10)) {
      setNotice("A new UTC day has started. Refresh for today's challenge.");
      return;
    }

    if (daily) {
      try {
        const existing = JSON.parse(
          localStorage.getItem(`kolivra-daily-${date}`) || "null",
        );

        if (
          existing &&
          Number.isFinite(existing.score) &&
          Array.isArray(existing.guess) &&
          existing.guess.length === 3
        ) {
          setScore(clamp(Number(existing.score), 100));
          setGuess([
            clamp(Number(existing.guess[0]), 359),
            clamp(Number(existing.guess[1]), 100),
            clamp(Number(existing.guess[2]), 100),
          ]);
          return;
        }
      } catch {
        // Continue without persistence if storage is unavailable.
      }
    }

    const result = calculateScore(target, chosen);

    setScore(result);

    if (result > best) {
      setBest(result);

      try {
        localStorage.setItem("kolivra-best", String(result));
      } catch {
        // The score still works for the current session.
      }
    }

    if (daily) {
      try {
        localStorage.setItem(
          `kolivra-daily-${date}`,
          JSON.stringify({
            score: result,
            guess,
          }),
        );
      } catch {
        setNotice(
          "Result saved for this session only. Browser storage is unavailable.",
        );
      }
    }
  }

  function nextRound() {
    setTarget(randomTarget());
    setGuess([...INITIAL_GUESS]);
    setScore(null);
    setRound((current) => current + 1);
    setNotice("");
  }

  async function share() {
    if (score === null) return;

    const title = daily
      ? `Daily Color · ${date}`
      : `ColorSense · Round ${round}`;

    const result = [
      `myColors / ${title}`,
      `🎯 ${score}/100`,
      `🎨 ${score >= 90 ? "Almost a perfect match!" : "Can you match this color?"}`,
      `${window.location.origin}/tools/${daily ? "daily-color" : "color-sense"}`,
    ].join("\n");

    try {
      await navigator.clipboard.writeText(result);
      setNotice("Result copied. Share it with your friends!");
    } catch {
      setNotice("Couldn't copy the result. Check clipboard permissions.");
    }
  }

  if (!ready) {
    return (
      <div
        className="grid min-h-120 place-items-center rounded-[30px] bg-[#101117] px-6 text-center text-xs font-medium text-white/60"
        role="status"
      >
        Preparing your color challenge…
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Arcade cabinet */}
      <section className="relative isolate overflow-hidden rounded-[30px] bg-[#101117] text-white sm:rounded-[38px]">
        {/* Top color signal */}
        <div aria-hidden="true" className="flex h-1.5">
          {["#FF795B", "#F6C85F", "#D7E7A9", "#9AAAF0", "#7963CF"].map(
            (color) => (
              <span
                key={color}
                className="flex-1"
                style={{ backgroundColor: color }}
              />
            ),
          )}
        </div>

        {/* Very subtle technical background */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle,currentColor_1px,transparent_1.5px)] bg-size-[28px_28px] text-white/2.5"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-40 top-20 -z-10 size-105 rounded-full bg-[#7963CF]/8 blur-[100px]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-40 bottom-20 -z-10 size-105 rounded-full bg-[#FF795B]/7 blur-[100px]"
        />

        {/* Game status bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 px-5 pt-6 sm:px-9 sm:pt-8 lg:px-12">
          <div className="flex items-center gap-3">
            <span className="relative flex size-9 items-center justify-center rounded-xl bg-white/8">
              <span className="size-3 rotate-45 rounded-[3px] bg-[#FF795B]" />
              <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-[#9AAAF0]" />
            </span>

            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.19em] text-white">
                Color<span className="text-[#FF795B]">Sense</span>
              </p>
              <p className="mt-1 font-mono text-[9px] uppercase tracking-widest text-white/35">
                The eye test
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-white/7 px-3.5 py-2.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-white/75">
              {daily
                ? `Daily / ${formatUTC(date)}`
                : `Practice / Round ${String(round).padStart(2, "0")}`}
            </span>

            <span className="rounded-full bg-[#D7E7A9]/12 px-3.5 py-2.5 font-mono text-[10px] font-semibold text-[#D7E7A9]">
              BEST {best}
            </span>
          </div>
        </div>

        {/* The main game arena */}
        <div className="grid items-center gap-8 px-5 pb-9 pt-12 sm:px-9 lg:grid-cols-[minmax(0,0.8fr)_minmax(300px,1.35fr)_minmax(0,0.8fr)] lg:gap-5 lg:px-12 lg:pb-16 lg:pt-14">
          {/* Left challenge copy */}
          <div className="max-w-[320px]">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.19em] text-[#F6C85F]">
              {daily
                ? "01 / Today's challenge"
                : `01 / Color experiment ${String(round).padStart(2, "0")}`}
            </span>

            <h2 className="mt-5 text-[clamp(2.8rem,4.5vw,5.25rem)] font-semibold leading-[0.98] tracking-[-0.075em]">
              Trust
              <br />
              <span className="font-serif font-normal italic text-[#9AAAF0]">
                your eyes.
              </span>
            </h2>

            <p className="mt-6 max-w-62.5 text-sm leading-[1.8] text-white/50">
              Match the left half with the right. Adjust the three channels
              until they look like one color.
            </p>

            <div className="mt-8 flex items-center gap-2.5">
              <span
                className={`size-2 rounded-full ${revealed ? "bg-[#D7E7A9]" : "bg-[#FF795B]"}`}
              />
              <span className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-white/50">
                {revealed ? "Attempt complete" : "Awaiting your guess"}
              </span>
            </div>
          </div>

          {/* The physical comparison dial */}
          <div className="min-w-0">
            <ColorDial target={target} chosen={chosen} revealed={revealed} />
          </div>

          {/* Digital score display */}
          <div className="flex flex-col items-center text-center lg:items-end lg:text-right">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">
              02 / Match accuracy
            </span>

            <div aria-live="polite" className="mt-4 flex items-baseline gap-1">
              <span className="font-mono text-[clamp(4.5rem,7vw,8rem)] font-medium leading-none tracking-[-0.13em] tabular-nums text-white">
                {revealed ? score : "—"}
              </span>
              <span className="ml-1 font-mono text-xl text-white/35">/100</span>
            </div>

            <div className="mt-5 h-2 w-full max-w-57.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-linear-to-r from-[#FF795B] via-[#F6C85F] to-[#D7E7A9] transition-[width] duration-700"
                style={{ width: revealed ? `${score}%` : "0%" }}
              />
            </div>

            <p className="mt-4 max-w-57.5 text-xs leading-[1.8] text-white/45">
              {revealed
                ? getVerdict(score).title
                : "Your score stays hidden until you lock in your mix."}
            </p>

            {revealed && (
              <span className="mt-4 font-mono text-[10px] font-semibold uppercase tracking-wider text-[#D7E7A9]">
                Result unlocked ✓
              </span>
            )}
          </div>
        </div>

        {/* The tuning console */}
        <div className="bg-white/4.5 px-5 py-8 sm:px-9 sm:py-10 lg:px-12">
          <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[#F6C85F]">
                The mixing console
              </span>

              <h3 className="mt-2 text-xl font-semibold tracking-tighter text-white">
                Tune your color.
              </h3>
            </div>

            <p className="max-w-65 text-xs leading-[1.7] text-white/40">
              {revealed
                ? "Your controls are locked. Check your differences below."
                : "Slide to adjust. Use the + and − buttons for tiny changes."}
            </p>
          </div>

          <div className="grid gap-9 md:grid-cols-3 md:gap-8 lg:gap-12">
            {CHANNELS.map((channel, index) => (
              <TuneControl
                key={channel.name}
                index={index}
                value={guess[index]}
                guess={guess}
                disabled={revealed}
                onChange={updateGuess}
              />
            ))}
          </div>

          {/* Main game action */}
          <div className="mt-10 flex flex-wrap items-center justify-between gap-5">
            <p className="max-w-sm font-mono text-[10px] leading-[1.8] text-white/35">
              {daily
                ? "ONE SUBMISSION PER UTC DAY · THIS BROWSER"
                : "UNLIMITED ROUNDS · KEEP SHARPENING YOUR EYE"}
            </p>

            {!revealed ? (
              <button
                type="button"
                onClick={submit}
                className="group inline-flex min-h-14 w-full items-center justify-center gap-5 rounded-full bg-[#D7E7A9] px-8 text-sm font-bold tracking-tight text-[#1C2519] transition-transform duration-200 hover:-translate-y-0.5 hover:bg-[#E6F3C9] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D7E7A9] active:translate-y-0 motion-reduce:transform-none sm:w-auto"
              >
                Lock in my color
                <span className="text-lg transition-transform group-hover:translate-x-1">
                  →
                </span>
              </button>
            ) : (
              <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto">
                <button
                  type="button"
                  onClick={share}
                  className="inline-flex min-h-12 flex-1 items-center justify-center rounded-full bg-white/10 px-6 text-xs font-semibold text-white transition-colors hover:bg-white/17 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:flex-none"
                >
                  Copy result ↗
                </button>

                {daily ? (
                  <Link
                    href="/tools/color-sense"
                    className="inline-flex min-h-12 flex-1 items-center justify-center rounded-full bg-[#D7E7A9] px-6 text-xs font-bold text-[#1C2519] transition-colors hover:bg-[#E6F3C9] sm:flex-none"
                  >
                    Keep practicing →
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={nextRound}
                    className="inline-flex min-h-12 flex-1 items-center justify-center rounded-full bg-[#D7E7A9] px-6 text-xs font-bold text-[#1C2519] transition-colors hover:bg-[#E6F3C9] sm:flex-none"
                  >
                    Next round →
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Post-game analysis */}
      {revealed && verdict && (
        <section aria-live="polite" className="space-y-5 py-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
                Your color breakdown
              </span>
              <h3 className="mt-2 text-2xl font-semibold tracking-[-0.055em] text-ink">
                {verdict.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {verdict.subtitle}
              </p>
            </div>

            <span className="rounded-full bg-soft px-4 py-2 font-mono text-[11px] font-semibold text-ink">
              {score}/100
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {[
              {
                name: "Hue difference",
                value: `${Math.round(hueDifference)}°`,
                detail: "Distance around the color wheel",
                max: 180,
                amount: hueDifference,
              },
              {
                name: "Saturation difference",
                value: `${Math.round(saturationDifference)}%`,
                detail: "Difference in color intensity",
                max: 100,
                amount: saturationDifference,
              },
              {
                name: "Lightness difference",
                value: `${Math.round(lightnessDifference)}%`,
                detail: "Difference in brightness",
                max: 100,
                amount: lightnessDifference,
              },
            ].map((item, index) => (
              <div key={item.name} className="rounded-[20px] bg-soft/65 p-5">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-semibold text-ink">
                    {item.name}
                  </span>
                  <span className="font-mono text-sm font-semibold tabular-nums text-ink">
                    {item.value}
                  </span>
                </div>

                <div className="mt-5 h-2 overflow-hidden rounded-full bg-ink/10">
                  <div
                    className="h-full rounded-full transition-[width] duration-500"
                    style={{
                      width: `${Math.min(100, (item.amount / item.max) * 100)}%`,
                      backgroundColor: ["#FF795B", "#9AAAF0", "#F6C85F"][index],
                    }}
                  />
                </div>

                <p className="mt-3 text-[11px] leading-relaxed text-muted">
                  {item.detail}
                </p>
              </div>
            ))}
          </div>

          <p className="text-[11px] leading-relaxed text-muted">
            Score uses normalized RGB distance, while the breakdown shows HSL
            differences to help you understand where your guess varied. Smaller
            differences are better.
          </p>
        </section>
      )}

      {!revealed && (
        <p className="text-center text-xs leading-[1.8] text-muted">
          {daily
            ? "A new color appears each UTC day. Your completed result is saved locally when browser storage is available."
            : "No timer. No pressure. Just you, a target color, and your ability to notice the difference."}
        </p>
      )}

      {notice && (
        <div
          role="status"
          aria-live="polite"
          className="fixed inset-x-0 bottom-6 z-50 flex justify-center px-4"
        >
          <span className="rounded-full bg-ink px-5 py-3 text-xs font-semibold text-page shadow-xl">
            {notice}
          </span>
        </div>
      )}
    </div>
  );
}
