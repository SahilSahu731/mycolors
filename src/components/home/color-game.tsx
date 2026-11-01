"use client";
import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/ui";
export default function ColorGame() {
  const [found, setFound] = useState(false);
  const [attempt, setAttempt] = useState(false);
  return (
    <section className="mx-auto w-[calc(100%-36px)] max-w-[1200px] md:w-[calc(100%-64px)] xl:w-[calc(100%-96px)] grid items-center gap-8 rounded-2xl border border-violet-200 bg-violet-50 p-7 text-violet-950 dark:border-violet-400/20 dark:bg-violet-400/10 dark:text-violet-100 md:grid-cols-2 md:p-12 lg:gap-16">
      <div className="[&>h2]:my-5 [&>h2]:text-5xl [&>h2]:leading-none [&>h2]:tracking-tight [&>p]:text-xs [&>p]:leading-7 [&>p]:opacity-60">
        <span className="flex items-center gap-2 text-[8px] tracking-widest opacity-60">
          <Icon name="game" size={16} /> A LITTLE LESS WORK, A LITTLE MORE PLAY
        </span>
        <h2>
          Got an eye
          <br />
          for color?
        </h2>
        <p>
          One of these colors doesn’t quite belong.
          <br />
          Find the odd one out. We’ll wait.
        </p>
        <div className="my-5 text-[10px] opacity-70" aria-live="polite">
          {found
            ? "You found it. That’s a good eye."
            : attempt
              ? "Close! Look for the slightly lighter tile."
              : "A tiny warm-up for your creative brain."}
        </div>
        <Link
          href="/tools/daily-color"
          className="inline-flex min-h-11 items-center justify-center gap-3 rounded-lg border border-ink bg-ink px-5 py-3 text-xs font-medium text-page transition hover:-translate-y-0.5 motion-reduce:transform-none disabled:transform-none"
        >
          Try the daily challenge <Icon name="game" size={18} />
        </Link>
      </div>
      <div className="mx-auto w-full max-w-80 rotate-2 rounded-xl border border-violet-200 bg-white/40 p-5 dark:border-violet-400/20 dark:bg-white/5">
        <div className="mb-4 flex justify-between text-[8px] tracking-widest opacity-60">
          <span>SPOT THE DIFFERENCE</span>
          <span>{found ? "COMPLETE" : "01 / 01"}</span>
        </div>
        <div className="grid grid-cols-3 gap-2 [&>button]:grid [&>button]:aspect-square [&>button]:place-items-center [&>button]:rounded-lg [&>button]:text-3xl [&>button]:text-white [&>button]:transition hover:[&>button]:scale-95">
          {Array.from({ length: 9 }, (_, i) => (
            <button
              key={i}
              aria-label={`Choose tile ${i + 1}`}
              style={{ background: i === 5 ? "#b29bd5" : "#a68acb" }}
              className={
                found && i === 5 ? "ring-3 ring-white/70 ring-inset" : ""
              }
              onClick={() => {
                if (i === 5) setFound(true);
                else setAttempt(true);
              }}
            >
              {found && i === 5 ? "✓" : ""}
            </button>
          ))}
        </div>
        <div className="mt-4 flex justify-between gap-3 text-[8px] opacity-60">
          <span>
            {found ? "Nicely spotted." : "Same, same… but different."}
          </span>
          <span>myColors / play</span>
        </div>
      </div>
    </section>
  );
}
