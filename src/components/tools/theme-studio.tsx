"use client";

import { useMemo, useState } from "react";
import { accessible, contrast, mix } from "@/lib/colors";
import Export from "@/components/tools/shared/export-panel";

type ThemeTokens = {
  background: string;
  surface: string;
  foreground: string;
  muted: string;
  primary: string;
  "primary-foreground": string;
  border: string;
};

const TOKEN_LABELS: Record<keyof ThemeTokens, string> = {
  background: "Background",
  surface: "Surface",
  foreground: "Text",
  muted: "Muted text",
  primary: "Primary",
  "primary-foreground": "On primary",
  border: "Outline",
};

function createTokens(base: string, dark: boolean): ThemeTokens {
  const background = dark
    ? mix(base, "#14151B", 0.96)
    : mix(base, "#FFFFFF", 0.97);

  const surface = dark ? mix(base, "#252630", 0.94) : "#FFFFFF";

  const primary = accessible(base, background, 3);

  const primaryForeground =
    contrast(primary, "#FFFFFF") >= contrast(primary, "#15151B")
      ? "#FFFFFF"
      : "#15151B";

  return {
    background,
    surface,
    foreground: dark ? "#F7F7FA" : "#202127",
    muted: accessible(dark ? "#A1A5B3" : "#696D77", background, 4.5),
    primary,
    "primary-foreground": primaryForeground,
    border: mix(base, dark ? "#393A46" : "#E5E5EA", 0.9),
  };
}

function ArrowIcon() {
  return (
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
      <path d="M5 12h14m-6-6 6 6-6 6" />
    </svg>
  );
}

function Artwork({ base, dark }: { base: string; dark: boolean }) {
  const light = mix(base, "#FFFFFF", 0.65);
  const deep = mix(base, "#161720", 0.45);
  const middle = mix(base, "#F6C85F", 0.55);

  return (
    <svg
      viewBox="0 0 440 340"
      fill="none"
      aria-hidden="true"
      className="h-full w-full overflow-visible transition-transform duration-700 ease-out group-hover:scale-[1.045] motion-reduce:transition-none"
    >
      <ellipse
        cx="229"
        cy="306"
        rx="138"
        ry="13"
        fill="#000000"
        opacity={dark ? 0.14 : 0.06}
      />
      <rect
        x="84"
        y="35"
        width="160"
        height="235"
        rx="80"
        fill={base}
        transform="rotate(-24 164 152)"
      />
      <circle cx="283" cy="109" r="93" fill={light} />
      <rect
        x="222"
        y="139"
        width="139"
        height="153"
        rx="69"
        fill={deep}
        transform="rotate(26 291 215)"
      />
      <circle cx="169" cy="216" r="72" fill={middle} />
      <path
        d="M128 215a41 41 0 0 1 82 0"
        stroke={base}
        strokeWidth="25"
        strokeLinecap="round"
      />
      <circle cx="283" cy="109" r="38" fill={base} />
      <circle cx="283" cy="109" r="15" fill={deep} />
      <path
        d="M49 76h32M65 60v32"
        stroke={base}
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path
        d="M368 59h30M383 44v30"
        stroke={middle}
        strokeWidth="6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function Theme({ base }: { base: string }) {
  const [previewDark, setPreviewDark] = useState(false);
  const [projectName, setProjectName] = useState("The next big idea");
  const [notice, setNotice] = useState("");

  const tokens = useMemo(
    () => createTokens(base, previewDark),
    [base, previewDark],
  );

  const css = useMemo(
    () =>
      [false, true]
        .map((dark) => {
          const values = createTokens(base, dark);
          const selector = dark ? '[data-theme="dark"]' : ":root";

          return `${selector} {\n${Object.entries(values)
            .map(([name, value]) => `  --${name}: ${value};`)
            .join("\n")}\n}`;
        })
        .join("\n\n"),
    [base],
  );

  const bodyContrast = contrast(tokens.foreground, tokens.background);
  const mutedContrast = contrast(tokens.muted, tokens.background);
  const buttonContrast = contrast(tokens["primary-foreground"], tokens.primary);

  async function copyToken(name: string, color: string) {
    try {
      await navigator.clipboard.writeText(color);
      setNotice(`${name} copied: ${color}`);
    } catch {
      setNotice("Unable to copy. Please check clipboard permissions.");
    }
  }

  return (
    <div className="space-y-7">
      {/* Preview toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span
              className="size-2 rounded-full"
              style={{ backgroundColor: tokens.primary }}
            />
            <h3 className="text-sm font-semibold tracking-tight text-ink">
              Live theme preview
            </h3>
          </div>
          <p className="mt-1 text-xs text-muted">
            Your color, turned into a complete interface.
          </p>
        </div>

        <div
          role="group"
          aria-label="Preview color mode"
          className="inline-flex items-center gap-1 rounded-full bg-soft p-1"
        >
          <button
            type="button"
            aria-pressed={!previewDark}
            onClick={() => setPreviewDark(false)}
            className={`flex min-h-10 items-center gap-2 rounded-full px-4 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${!previewDark ? "bg-ink text-page" : "text-muted hover:text-ink"}`}
          >
            <span aria-hidden="true">☀</span>
            Light
          </button>

          <button
            type="button"
            aria-pressed={previewDark}
            onClick={() => setPreviewDark(true)}
            className={`flex min-h-10 items-center gap-2 rounded-full px-4 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${previewDark ? "bg-ink text-page" : "text-muted hover:text-ink"}`}
          >
            <span aria-hidden="true">☾</span>
            Dark
          </button>
        </div>
      </div>

      {/* Actual interface preview */}
      <div
        className="overflow-hidden rounded-[28px] transition-colors duration-300 sm:rounded-4xl"
        style={{ backgroundColor: tokens.background, color: tokens.foreground }}
      >
        {/* Website header */}
        <div className="flex items-center justify-between gap-4 px-5 py-6 sm:px-9 lg:px-12">
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 grid-cols-2 gap-0.5 rotate-[-10deg]">
              <span
                className="rounded-[5px]"
                style={{ backgroundColor: tokens.primary }}
              />
              <span
                className="rounded-[5px]"
                style={{ backgroundColor: mix(base, "#FFFFFF", 0.45) }}
              />
              <span
                className="rounded-[5px]"
                style={{ backgroundColor: mix(base, "#15151B", 0.4) }}
              />
              <span
                className="rounded-[5px]"
                style={{ backgroundColor: mix(base, "#F6C85F", 0.6) }}
              />
            </span>
            <span className="text-xl font-bold tracking-[-0.085em]">
              muse<span style={{ color: tokens.primary }}>.</span>
            </span>
          </div>

          <div
            className="hidden items-center gap-8 text-xs font-medium md:flex"
            style={{ color: tokens.muted }}
          >
            <span>Discover</span>
            <span>Collections</span>
            <span>Our story</span>
          </div>

          <span
            className="rounded-full px-4 py-2.5 text-[11px] font-semibold"
            style={{
              backgroundColor: tokens.surface,
              color: tokens.foreground,
            }}
          >
            Your space ↗
          </span>
        </div>

        {/* Main hero */}
        <div className="grid items-center gap-6 px-5 pb-8 pt-9 sm:px-9 lg:grid-cols-[1.02fr_0.98fr] lg:gap-10 lg:px-12 lg:pb-12 lg:pt-12">
          <div className="relative z-10 max-w-xl">
            <div className="mb-5 flex items-center gap-2">
              <span
                className="size-1.5 rounded-full"
                style={{ backgroundColor: tokens.primary }}
              />
              <span
                className="text-[10px] font-bold uppercase tracking-[0.2em]"
                style={{ color: tokens.muted }}
              >
                A place for bright ideas
              </span>
            </div>

            <h2 className="text-[clamp(2.8rem,5.2vw,6rem)] font-semibold leading-[0.98] tracking-[-0.075em]">
              Create with
              <br />
              <span
                className="font-serif font-normal italic"
                style={{ color: tokens.primary }}
              >
                confidence.
              </span>
            </h2>

            <p
              className="mt-5 max-w-90 text-sm leading-[1.8]"
              style={{ color: tokens.muted }}
            >
              Your next great project starts with a little inspiration and a
              color that feels just right.
            </p>

            <button
              type="button"
              onClick={() => setPreviewDark((value) => !value)}
              className="mt-7 inline-flex min-h-11 items-center gap-3 rounded-full px-5 text-xs font-semibold transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current motion-reduce:transform-none"
              style={{
                backgroundColor: tokens.primary,
                color: tokens["primary-foreground"],
              }}
            >
              Try {previewDark ? "light" : "dark"} mode
              <ArrowIcon />
            </button>
          </div>

          <div
            className="group relative mx-auto flex aspect-[1.25] w-full max-w-120 items-center justify-center overflow-hidden rounded-3xl"
            style={{ backgroundColor: tokens.surface }}
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,currentColor_1px,transparent_1.5px)] bg-size-[22px_22px] opacity-[0.07]"
            />
            <div className="relative h-[90%] w-[92%]">
              <Artwork base={base} dark={previewDark} />
            </div>
            <span
              className="absolute bottom-4 left-5 text-[10px] font-bold uppercase tracking-[0.14em]"
              style={{ color: tokens.muted }}
            >
              01 / A study in color
            </span>
          </div>
        </div>

        {/* UI samples, not fake metrics */}
        <div className="grid gap-3 px-5 pb-5 sm:grid-cols-2 sm:px-9 sm:pb-9 lg:px-12 lg:pb-12">
          <div
            className="rounded-[22px] p-5 sm:p-6"
            style={{ backgroundColor: tokens.surface }}
          >
            <div className="mb-5 flex items-center justify-between gap-3">
              <span className="text-xs font-semibold">Your project</span>
              <span
                className="rounded-full px-2.5 py-1 text-[10px] font-medium"
                style={{
                  backgroundColor: tokens.background,
                  color: tokens.muted,
                }}
              >
                Editable
              </span>
            </div>

            <label
              className="block text-[11px] font-medium"
              style={{ color: tokens.muted }}
              htmlFor="theme-preview-project"
            >
              Give your project a name
            </label>
            <input
              id="theme-preview-project"
              value={projectName}
              maxLength={40}
              onChange={(event) => setProjectName(event.target.value)}
              className="mt-2 min-h-11 w-full rounded-xl px-4 text-sm font-semibold outline-none focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{
                backgroundColor: tokens.background,
                color: tokens.foreground,
                outlineColor: tokens.primary,
              }}
            />

            <p
              className="mt-3 truncate text-[11px]"
              style={{ color: tokens.muted }}
            >
              Now creating: {projectName || "Untitled project"}
            </p>
          </div>

          <div
            className="rounded-[22px] p-5 sm:p-6"
            style={{ backgroundColor: tokens.surface }}
          >
            <div className="mb-5 flex items-center justify-between gap-3">
              <span className="text-xs font-semibold">Your color system</span>
              <span
                className="text-[10px] font-medium"
                style={{ color: tokens.muted }}
              >
                Auto-generated
              </span>
            </div>

            <div className="flex h-11 overflow-hidden rounded-xl">
              {[
                tokens.primary,
                mix(base, "#FFFFFF", 0.35),
                mix(base, "#FFFFFF", 0.7),
                mix(base, "#15151B", 0.35),
                mix(base, "#15151B", 0.7),
              ].map((color, index) => (
                <span
                  key={index}
                  className="flex-1"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between gap-2 text-[11px]">
              <span style={{ color: tokens.muted }}>
                Built around your starting color
              </span>
              <span
                className="font-mono font-semibold"
                style={{ color: tokens.foreground }}
              >
                {base.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Generated tokens */}
      <section aria-label="Generated color tokens" className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-ink">
              Your color tokens
            </h3>
            <p className="mt-1 text-xs text-muted">
              Click any color to copy its HEX value.
            </p>
          </div>
          <span className="font-mono text-[11px] text-muted">
            {Object.keys(tokens).length} tokens
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-7">
          {(Object.entries(tokens) as [keyof ThemeTokens, string][]).map(
            ([name, color]) => (
              <button
                key={name}
                type="button"
                title={`Copy ${name}: ${color}`}
                onClick={() => copyToken(TOKEN_LABELS[name], color)}
                className="group min-w-0 rounded-xl text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
              >
                <span
                  className="block h-13 w-full rounded-xl shadow-[inset_0_0_0_1px_rgb(128_128_128/0.10)] transition-transform duration-200 group-hover:-translate-y-1 motion-reduce:transform-none"
                  style={{ backgroundColor: color }}
                />
                <span className="mt-2.5 block truncate text-[11px] font-semibold text-ink">
                  {TOKEN_LABELS[name]}
                </span>
                <span className="mt-1 block font-mono text-[10px] text-muted">
                  {color.toUpperCase()}
                </span>
              </button>
            ),
          )}
        </div>
      </section>

      {/* Contrast report */}
      <section
        aria-label="Color contrast results"
        className="flex flex-wrap items-center gap-x-7 gap-y-4 rounded-2xl bg-soft/65 px-5 py-4"
      >
        {[
          { label: "Body text", value: bodyContrast, threshold: 4.5 },
          { label: "Muted text", value: mutedContrast, threshold: 4.5 },
          { label: "Button text", value: buttonContrast, threshold: 4.5 },
        ].map((item) => {
          const passes = item.value >= item.threshold;

          return (
            <div key={item.label} className="flex items-center gap-2.5 text-xs">
              <span
                className={`size-2 rounded-full ${passes ? "bg-emerald-500" : "bg-orange-500"}`}
              />
              <span className="text-muted">{item.label}</span>
              <span className="font-mono font-semibold tabular-nums text-ink">
                {item.value.toFixed(2)}:1
              </span>
              <span
                className={`text-[10px] font-semibold ${passes ? "text-emerald-600 dark:text-emerald-400" : "text-orange-600 dark:text-orange-400"}`}
              >
                {passes ? "AA" : "Below AA"}
              </span>
            </div>
          );
        })}
      </section>

      <div
        aria-live="polite"
        aria-atomic="true"
        className="min-h-4 text-xs text-muted"
      >
        {notice}
      </div>

      <Export text={css} />
    </div>
  );
}
