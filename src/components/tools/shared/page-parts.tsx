"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ColorInput } from "@/components/ui";
import { fromHsl } from "@/lib/colors";
import ToolArtwork from "./tool-artwork";

const COLORS = ["#FF795B", "#F6C85F", "#D7E7A9", "#9AAAF0", "#7963CF"];

function ColorSignature() {
  return (
    <span aria-hidden="true" className="flex items-center gap-0.5">
      {COLORS.map((color, index) => (
        <span
          key={color}
          className="h-4 w-2 rounded-[3px] transition-transform duration-300 hover:-translate-y-1"
          style={{
            backgroundColor: color,
            transform: `rotate(${(index - 2) * 7}deg)`,
          }}
        />
      ))}
    </span>
  );
}

export function ToolPage({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <main
      id="main"
      className={`mx-auto w-[calc(100%-24px)] max-w-[1600px] scroll-mt-20 pb-14 pt-5 sm:w-[calc(100%-48px)] sm:pt-7 lg:w-[calc(100%-80px)] ${className}`}
    >
      {/* Minimal navigation */}
      <nav
        aria-label="Tool navigation"
        className="mb-9 flex items-center justify-between gap-4 md:mb-12"
      >
        <Link
          href="/#tools"
          className="group inline-flex min-h-10 items-center gap-2.5 rounded-full pr-3 text-xs font-semibold text-muted transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        >
          <span className="grid size-9 place-items-center rounded-full bg-soft text-ink transition-all duration-200 group-hover:-translate-x-1 group-hover:bg-ink group-hover:text-page motion-reduce:transform-none">
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M19 12H5m6 6-6-6 6-6" />
            </svg>
          </span>
          <span>All tools</span>
        </Link>

        <div className="flex items-center gap-3">
          <span className="hidden text-[10px] font-medium uppercase tracking-[0.16em] text-muted sm:inline">
            A space to create
          </span>
          <ColorSignature />
        </div>
      </nav>

      {/* Tool content */}
      {children}

      {/* Small colorful signature */}
      <div
        aria-hidden="true"
        className="mt-16 flex h-1 w-28 overflow-hidden rounded-full md:mt-24"
      >
        {COLORS.map((color) => (
          <span
            key={color}
            className="flex-1"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>

      {/* Footer */}
      <footer className="mt-6 flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted">
            Keep exploring
          </span>
          <p className="mt-2 text-sm font-medium tracking-tight text-ink sm:text-base">
            One tool down. A world of color to go.
          </p>
        </div>

        <Link
          href="/#tools"
          className="group inline-flex min-h-11 items-center gap-3 rounded-full text-xs font-semibold text-ink transition-colors hover:text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        >
          Discover more tools
          <span className="grid size-9 place-items-center rounded-full bg-ink text-page transition-transform duration-200 group-hover:translate-x-1 group-hover:-translate-y-1 motion-reduce:transform-none">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M5 19 19 5M8 5h11v11" />
            </svg>
          </span>
        </Link>
      </footer>
    </main>
  );
}

export function ToolHeading({
  eyebrow,
  title,
  accent,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  accent: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <header className="mb-10 flex flex-col justify-between gap-6 md:mb-12 lg:flex-row lg:items-end">
      <div className="max-w-4xl">
        <h1 className="text-5xl font-semibold leading-[1.02] tracking-[-0.065em] text-ink">
          {title}{" "}
          <span className="bg-linear-to-r from-[#FF795B] via-[#9AAAF0] to-[#7963CF] bg-clip-text text-transparent">
            {accent}
          </span>
        </h1>

        <p className="mt-5 max-w-2xl text-sm leading-[1.8] text-muted sm:text-base">
          {description}
        </p>
      </div>

      {children && <div className="shrink-0">{children}</div>}
    </header>
  );
}

export function ArtCard({
  tool,
  colors,
  caption,
  className = "",
}: {
  tool: string;
  colors: string[];
  caption: string;
  className?: string;
}) {
  const palette = COLORS.map((fallback, i) =>
    /^#[0-9a-f]{6}$/i.test(colors[i] ?? "") ? colors[i] : fallback,
  );

  return (
    <figure
      className={`group relative flex min-w-0 flex-col overflow-hidden rounded-3xl p-5 sm:p-7 ${className}`}
      style={{
        backgroundColor: `color-mix(in oklab, ${palette[3]} 15%, var(--surface))`,
      }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,currentColor_1px,transparent_1.5px)] bg-size-[22px_22px] text-black/[0.035] dark:text-white/4.5"
      />

      <div className="relative mx-auto flex w-full max-w-sm flex-1 items-center justify-center py-6 transition-transform duration-500 ease-out group-hover:scale-[1.025] motion-reduce:transform-none">
        <ToolArtwork slug={tool} colors={palette} />
      </div>

      <figcaption className="relative mt-3 text-center text-xs leading-relaxed text-muted">
        {caption}
      </figcaption>
    </figure>
  );
}

export function BaseControl({
  base,
  onChange,
  label = "Your starting color",
}: {
  base: string;
  onChange: (value: string) => void;
  label?: string;
}) {
  function surprise() {
    onChange(fromHsl(Math.random() * 360, 55, 58));
  }

  return (
    <div className="flex flex-wrap items-end gap-4">
      <ColorInput label={label} value={base} onChange={onChange} />

      <button
        type="button"
        onClick={surprise}
        className="group inline-flex min-h-11 items-center justify-center gap-2.5 rounded-full bg-ink px-5 text-xs font-semibold text-page transition-all duration-200 hover:-translate-y-0.5 hover:opacity-90 active:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink motion-reduce:transform-none"
      >
        <span className="text-base leading-none transition-transform duration-300 group-hover:rotate-90">
          ✳
        </span>
        Surprise me
      </button>
    </div>
  );
}

export function Note({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <article className="flex flex-col items-start">
      <div className="mb-4 flex items-center gap-2.5">
        <span className="size-2 rounded-full bg-[#9AAAF0]" />
        <span className="font-mono text-xs font-medium text-muted">
          {number}
        </span>
      </div>

      <h2 className="text-xl font-semibold leading-tight tracking-[-0.035em] text-ink sm:text-2xl">
        {title}
      </h2>

      <div className="mt-3 text-sm leading-[1.8] text-muted [&_a]:font-medium [&_a]:text-ink [&_a]:underline [&_li]:mb-2 [&_p+p]:mt-3">
        {children}
      </div>
    </article>
  );
}
