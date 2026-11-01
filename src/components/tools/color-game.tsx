"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CopyButton, Icon } from "@/components/ui";
import { fromHsl, ink, rgb } from "@/lib/colors";
export default function Game({ daily }: { daily: boolean }) {
  const [target, setTarget] = useState("#91b9a1");
  const [guess, setGuess] = useState([180, 45, 55]);
  const [score, setScore] = useState<number | null>(null);
  const [best, setBest] = useState(0);
  const [date, setDate] = useState("");
  const [round, setRound] = useState(1);
  useEffect(() => {
    setScore(null);
    setGuess([180, 45, 55]);
    setRound(1);
    const day = new Date().toISOString().slice(0, 10);
    setDate(day);
    if (daily) {
      let seed = 0;
      for (const char of day) seed = (seed * 31 + char.charCodeAt(0)) >>> 0;
      setTarget(fromHsl(seed % 360, 35 + (seed % 40), 40 + (seed % 35)));
      try {
        const old = JSON.parse(
          localStorage.getItem("kolivra-daily-" + day) || "null",
        );
        if (old) {
          setScore(old.score);
          setGuess(old.guess);
        }
      } catch {}
    } else
      setTarget(
        fromHsl(
          Math.random() * 360,
          35 + Math.random() * 40,
          40 + Math.random() * 30,
        ),
      );
    setBest(Number(localStorage.getItem("kolivra-best") || 0));
  }, [daily]);
  const chosen = fromHsl(...(guess as [number, number, number]));
  function submit() {
    const a = rgb(target),
      b = rgb(chosen);
    const result = Math.max(
      0,
      Math.round(
        100 *
          (1 -
            Math.sqrt(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0)) /
              (255 * Math.sqrt(3))),
      ),
    );
    setScore(result);
    if (result > best) {
      setBest(result);
      localStorage.setItem("kolivra-best", String(result));
    }
    if (daily)
      localStorage.setItem(
        "kolivra-daily-" + date,
        JSON.stringify({ score: result, guess }),
      );
  }
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4 [&_h3]:text-sm [&_h3]:font-medium">
        <span className="flex items-center gap-2 text-[9px] font-semibold tracking-[0.15em]">
          {daily
            ? `${date} · DAILY CHALLENGE (UTC)`
            : `PRACTICE · ROUND ${round}`}
        </span>
        <span className="text-xs leading-7 text-muted">
          Personal best: {best}/100
        </span>
      </div>
      <p className="text-xs leading-7 text-muted">
        Recreate the target using hue, saturation and lightness.{" "}
        {daily
          ? "One submission per day on this browser."
          : "Practice as many times as you like."}
      </p>
      <div className="flex gap-3 md:gap-5 [&>div]:flex [&>div]:min-h-60 [&>div]:flex-1 [&>div]:flex-col [&>div]:justify-between [&>div]:rounded-[28px] [&>div]:p-5 md:[&>div]:min-h-96 [&_span]:text-xs [&_strong]:text-3xl md:[&_strong]:text-5xl [&_strong]:font-medium [&_strong]:tracking-[-0.06em]">
        <div style={{ background: target, color: ink(target) }}>
          <span>The target</span>
          <strong>Meet your match.</strong>
          <span>{score !== null ? target.toUpperCase() : "Look closely."}</span>
        </div>
        <div style={{ background: chosen, color: ink(chosen) }}>
          <span>Your color</span>
          <strong>{score !== null ? `${score}/100` : "Trust your eye."}</strong>
          <span>
            {score !== null ? chosen.toUpperCase() : "Make it yours."}
          </span>
        </div>
      </div>
      <section className="rounded-[28px] border border-line bg-surface p-5 md:p-7 [&>button]:mt-7">
        {["Hue", "Saturation", "Lightness"].map((v, i) => (
          <label
            className="mt-6 block text-xs [&>b]:float-right [&>b]:text-muted [&>b]:font-normal [&>input]:mt-4"
            key={v}
          >
            {v}
            <b>
              {Math.round(guess[i])}
              {i === 0 ? "°" : "%"}
            </b>
            <input
              disabled={score !== null}
              type="range"
              min="0"
              max={i === 0 ? 360 : 100}
              value={guess[i]}
              onChange={(e) =>
                setGuess(guess.map((x, j) => (j === i ? +e.target.value : x)))
              }
            />
          </label>
        ))}
        {score === null ? (
          <button
            className="inline-flex min-h-11 items-center justify-center gap-3 rounded-lg border border-ink bg-ink px-5 py-3 text-xs font-medium text-page transition hover:-translate-y-0.5 motion-reduce:transform-none disabled:transform-none"
            onClick={submit}
          >
            Reveal my score <Icon />
          </button>
        ) : (
          <div
            className="mt-8 border-t border-line pt-6 [&>h3]:text-base [&>p]:my-4 [&>p]:text-xs [&>p]:text-muted"
            aria-live="polite"
          >
            <h3>
              {score >= 90
                ? "An incredible eye for color."
                : score >= 70
                  ? "You’re getting the hang of hue."
                  : "Every color is a little practice."}
            </h3>
            <p>Score is based on RGB distance from the target.</p>
            <div className="flex flex-wrap items-center gap-3">
              <CopyButton
                text={`myColors ${daily ? "Daily Color " + date : "ColorSense"}: ${score}/100 🎨\n${location.origin}/tools/${daily ? "daily-color" : "color-sense"}`}
                label="Share result"
              />
              {!daily ? (
                <button
                  className="inline-flex min-h-11 items-center justify-center gap-3 rounded-lg border border-ink bg-ink px-5 py-3 text-xs font-medium text-page transition hover:-translate-y-0.5 motion-reduce:transform-none disabled:transform-none"
                  onClick={() => {
                    setTarget(
                      fromHsl(
                        Math.random() * 360,
                        35 + Math.random() * 40,
                        40 + Math.random() * 30,
                      ),
                    );
                    setScore(null);
                    setRound(round + 1);
                  }}
                >
                  Play again{" "}
                </button>
              ) : (
                <Link
                  className="inline-flex min-h-11 items-center justify-center gap-3 rounded-lg border border-ink bg-ink px-5 py-3 text-xs font-medium text-page transition hover:-translate-y-0.5 motion-reduce:transform-none disabled:transform-none"
                  href="/tools/color-sense"
                >
                  Keep practicing{" "}
                </Link>
              )}
            </div>
          </div>
        )}
      </section>
    </>
  );
}
