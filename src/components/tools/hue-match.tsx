"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { harmony, ink, paletteCSS } from "@/lib/colors";
import Swatches from "@/components/tools/shared/swatches";
import Export from "@/components/tools/shared/export-panel";

type Context = "Branding" | "Interiors" | "Outfits";
type HarmonyMode = "Analogous" | "Complementary" | "Triadic";

const CONTEXTS: { name: Context; number: string; symbol: string }[] = [
  { name: "Branding", number: "01", symbol: "✳" },
  { name: "Interiors", number: "02", symbol: "⌂" },
  { name: "Outfits", number: "03", symbol: "✦" },
];

const HARMONIES: HarmonyMode[] = ["Analogous", "Complementary", "Triadic"];

const FALLBACK = "#7963CF";
const HEX = /^#[0-9a-f]{6}$/i;

function PaletteStrip({
  colors,
  onSelect,
}: {
  colors: string[];
  onSelect: (index: number) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-ink">
            Your color combination
          </h3>
          <p className="mt-1 text-[11px] text-muted">
            Click a color to make it the lead shade.
          </p>
        </div>

        <span className="text-[10px] font-medium text-muted">
          05 COLORS / LIVE
        </span>
      </div>

      <div
        role="group"
        aria-label="Choose a lead color"
        className="flex h-21 gap-1.5 sm:h-26.25"
      >
        {colors.map((color, index) => (
          <button
            key={`${color}-${index}`}
            type="button"
            aria-label={`Make ${color} the lead color`}
            aria-pressed={index === 0}
            title={
              index === 0
                ? `${color} is the lead color`
                : `Make ${color} the lead color`
            }
            onClick={() => onSelect(index)}
            className={`group relative min-w-0 overflow-hidden rounded-[15px] transition-all duration-300 hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink motion-reduce:transform-none sm:rounded-[20px] ${index === 0 ? "flex-[1.35]" : "flex-1"}`}
            style={{ backgroundColor: color, color: ink(color) }}
          >
            <span className="absolute inset-x-2 bottom-3 flex flex-col items-center gap-1 text-center sm:bottom-4">
              {index === 0 && (
                <span className="text-[8px] font-bold uppercase tracking-widest opacity-70">
                  Lead
                </span>
              )}
              <span className="font-mono text-[9px] font-semibold uppercase sm:text-xs">
                {color}
              </span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* BRANDING PREVIEW */

function BrandingPreview({ colors }: { colors: string[] }) {
  const [primary, secondary, accent, detail, deep] = colors;
  const fg = ink(primary);

  return (
    <div
      className="relative isolate flex min-h-107.5 flex-col overflow-hidden rounded-[26px] px-6 py-7 sm:px-10 sm:py-9 lg:min-h-121.25 lg:px-12"
      style={{ backgroundColor: primary, color: fg }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,currentColor_1px,transparent_1.5px)] bg-size-[24px_24px] opacity-[0.055]"
      />

      <div className="relative z-10 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span
            className="relative grid size-8 place-items-center rounded-full"
            style={{ backgroundColor: deep, color: ink(deep) }}
          >
            ✳
          </span>
          <span className="text-xl font-black tracking-[-0.085em]">
            hueform<span style={{ color: deep }}>.</span>
          </span>
        </div>

        <div className="hidden gap-6 text-[11px] font-medium opacity-70 sm:flex">
          <span>Discover</span>
          <span>Collections</span>
          <span>Journal</span>
        </div>

        <span
          className="rounded-full px-4 py-2.5 text-[10px] font-semibold"
          style={{ backgroundColor: deep, color: ink(deep) }}
        >
          Explore ↗
        </span>
      </div>

      <div className="relative z-10 grid flex-1 items-center gap-3 py-10 sm:grid-cols-[1fr_0.85fr]">
        <div className="max-w-120">
          <div className="mb-5 flex items-center gap-2">
            <span
              className="size-2 rounded-full"
              style={{ backgroundColor: deep }}
            />
            <span className="text-[10px] font-bold uppercase tracking-[0.19em] opacity-70">
              Made to stand out
            </span>
          </div>

          <h2 className="text-[clamp(3.4rem,6vw,6.4rem)] font-semibold leading-[0.89] tracking-[-0.085em]">
            Make
            <br />
            some{" "}
            <span
              className="font-serif font-normal italic"
              style={{ color: deep }}
            >
              noise.
            </span>
          </h2>

          <p className="mt-6 max-w-67.5 text-xs leading-[1.8] opacity-75 sm:text-sm">
            For the thinkers, makers, and anyone who refuses to blend in.
          </p>

          <div
            className="mt-6 inline-flex items-center gap-3 rounded-full px-5 py-3 text-xs font-bold"
            style={{ backgroundColor: deep, color: ink(deep) }}
          >
            Explore the collection <span>↗</span>
          </div>
        </div>

        <div className="pointer-events-none relative mx-auto h-41.25 w-full max-w-[320px] sm:h-65 lg:h-77.5">
          <svg
            viewBox="0 0 360 320"
            fill="none"
            aria-hidden="true"
            className="h-full w-full overflow-visible drop-shadow-[0_18px_25px_rgb(0_0_0/0.12)]"
          >
            <ellipse
              cx="177"
              cy="292"
              rx="120"
              ry="12"
              fill="#000"
              opacity=".08"
            />
            <rect
              x="64"
              y="31"
              width="151"
              height="226"
              rx="75"
              fill={secondary}
              transform="rotate(-24 139 144)"
            />
            <circle cx="237" cy="102" r="88" fill={accent} />
            <rect
              x="181"
              y="143"
              width="117"
              height="143"
              rx="57"
              fill={deep}
              transform="rotate(25 239 214)"
            />
            <circle cx="132" cy="202" r="66" fill={detail} />
            <path
              d="M96 202a36 36 0 0 1 72 0"
              stroke={secondary}
              strokeWidth="22"
              strokeLinecap="round"
            />
            <circle cx="237" cy="102" r="34" fill={primary} />
            <circle cx="237" cy="102" r="14" fill={deep} />
          </svg>
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-between gap-3 text-[9px] font-bold uppercase tracking-[0.16em] opacity-65">
        <span>Good design has character</span>
        <span>Identity study / 001</span>
      </div>
    </div>
  );
}

/* INTERIOR PREVIEW */

function InteriorsPreview({ colors }: { colors: string[] }) {
  const [wall, floor, sofa, accent, detail] = colors;

  return (
    <div
      className="relative min-h-100 overflow-hidden rounded-[26px] sm:min-h-121.25"
      style={{ backgroundColor: wall, color: ink(wall) }}
    >
      <svg
        viewBox="0 0 900 480"
        preserveAspectRatio="xMidYMid slice"
        aria-label="Illustrated interior room using your selected palette"
        role="img"
        className="absolute inset-0 h-full w-full"
      >
        <rect width="900" height="480" fill={wall} />

        <path d="M0 353H900V480H0Z" fill={floor} />
        <path
          d="M0 353H900"
          stroke={detail}
          strokeOpacity=".4"
          strokeWidth="5"
        />

        <ellipse
          cx="476"
          cy="416"
          rx="270"
          ry="36"
          fill={accent}
          opacity=".65"
        />

        {/* Wall art */}
        <rect x="135" y="100" width="163" height="159" rx="8" fill={detail} />
        <rect x="147" y="112" width="139" height="135" rx="3" fill={floor} />
        <circle cx="211" cy="170" r="43" fill={accent} />
        <path d="M150 236 203 161 284 236Z" fill={sofa} />

        {/* Floor lamp */}
        <path
          d="M760 190V376"
          stroke={detail}
          strokeWidth="8"
          strokeLinecap="round"
        />
        <path d="M717 191H803L785 121H735Z" fill={accent} />
        <ellipse cx="760" cy="382" rx="39" ry="7" fill={detail} />

        {/* Sofa */}
        <rect x="258" y="287" width="423" height="99" rx="32" fill={sofa} />
        <rect x="288" y="247" width="363" height="112" rx="31" fill={sofa} />
        <rect x="244" y="306" width="80" height="82" rx="29" fill={sofa} />
        <rect x="618" y="306" width="80" height="82" rx="29" fill={sofa} />

        <path
          d="M458 258V356"
          stroke={detail}
          strokeOpacity=".25"
          strokeWidth="4"
        />
        <path d="M319 303C340 286 369 290 384 311L388 340H320Z" fill={accent} />
        <path d="M545 310C567 286 599 294 606 315L605 343H548Z" fill={detail} />

        <rect x="291" y="377" width="26" height="35" rx="7" fill={detail} />
        <rect x="632" y="377" width="26" height="35" rx="7" fill={detail} />

        {/* Coffee table */}
        <ellipse cx="470" cy="389" rx="111" ry="21" fill={detail} />
        <path
          d="M400 392 390 446M537 392 547 446"
          stroke={detail}
          strokeWidth="10"
          strokeLinecap="round"
        />

        {/* Vase */}
        <path d="M448 342H487L481 377Q466 391 452 377Z" fill={accent} />
        <path
          d="M466 345Q454 317 431 311M466 345Q488 324 492 301"
          stroke={detail}
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
        <ellipse
          cx="433"
          cy="309"
          rx="17"
          ry="8"
          fill={sofa}
          transform="rotate(28 433 309)"
        />
        <ellipse
          cx="493"
          cy="303"
          rx="18"
          ry="8"
          fill={detail}
          transform="rotate(-30 493 303)"
        />

        {/* Accent plant */}
        <path d="M98 306 114 388" stroke={detail} strokeWidth="6" />
        <ellipse
          cx="85"
          cy="289"
          rx="28"
          ry="13"
          fill={sofa}
          transform="rotate(35 85 289)"
        />
        <ellipse
          cx="128"
          cy="306"
          rx="31"
          ry="13"
          fill={detail}
          transform="rotate(-35 128 306)"
        />
        <path d="M76 379H151L140 441H88Z" fill={accent} />
      </svg>

      <div className="absolute inset-x-5 top-6 flex items-start justify-between gap-3 sm:inset-x-9 sm:top-8">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] opacity-70">
            Interior color study
          </span>
          <h2 className="mt-2 text-[clamp(1.6rem,3vw,3rem)] font-semibold tracking-[-0.06em]">
            A space to feel good.
          </h2>
        </div>

        <span className="rounded-full bg-white/65 px-3 py-2 text-[10px] font-semibold text-[#29252D] backdrop-blur-sm">
          ROOM 001
        </span>
      </div>

      <div className="absolute bottom-5 left-5 rounded-full bg-white/75 px-4 py-2 text-[10px] font-medium text-[#29252D] backdrop-blur-md sm:bottom-8 sm:left-9">
        Your palette, in a living space.
      </div>
    </div>
  );
}

/* OUTFIT PREVIEW */

function OutfitsPreview({ colors }: { colors: string[] }) {
  const [background, coat, top, trousers, detail] = colors;

  return (
    <div
      className="relative min-h-107.5 overflow-hidden rounded-[26px]"
      style={{ backgroundColor: background, color: ink(background) }}
    >
      <svg
        viewBox="0 0 900 480"
        preserveAspectRatio="xMidYMid slice"
        role="img"
        aria-label="Fashion styling illustration showing clothing in your selected palette"
        className="absolute inset-0 h-full w-full"
      >
        <rect width="900" height="480" fill={background} />
        <circle cx="620" cy="242" r="225" fill={detail} opacity=".55" />

        <path
          d="M520 460C630 435 741 441 826 466"
          stroke={detail}
          strokeOpacity=".4"
          strokeWidth="5"
          strokeLinecap="round"
        />

        {/* Accessories */}
        <path
          d="M349 248Q382 205 416 248"
          stroke={detail}
          strokeWidth="11"
          fill="none"
          strokeLinecap="round"
        />
        <rect x="327" y="242" width="108" height="107" rx="24" fill={coat} />
        <rect x="363" y="290" width="37" height="15" rx="7" fill={detail} />

        {/* Jacket */}
        <path
          d="M551 88 500 111 454 197 502 223 536 176 532 294H686L682 176 716 223 764 197 718 111 669 88 610 125Z"
          fill={coat}
        />
        <path d="M572 95 610 124 647 95 661 293H554Z" fill={top} />
        <path d="M551 88 610 125 573 177 547 117Z" fill={coat} />
        <path d="M669 88 610 125 649 177 675 117Z" fill={coat} />
        <path
          d="M610 126V286"
          stroke={detail}
          strokeOpacity=".45"
          strokeWidth="3"
        />
        <circle cx="610" cy="186" r="4" fill={detail} />
        <circle cx="610" cy="222" r="4" fill={detail} />
        <circle cx="610" cy="258" r="4" fill={detail} />

        {/* Trousers */}
        <path
          d="M532 289H688L703 431H632L612 346 591 431H519Z"
          fill={trousers}
        />
        <path
          d="M611 307 612 347"
          stroke={detail}
          strokeOpacity=".35"
          strokeWidth="4"
        />

        {/* Shoes */}
        <path d="M519 421H591L583 449H506Q494 448 501 438Z" fill={detail} />
        <path d="M632 421H703L715 443Q718 450 705 450H640Z" fill={detail} />

        {/* Sparkle details */}
        <path
          d="M770 85V115M755 100H785"
          stroke={coat}
          strokeWidth="6"
          strokeLinecap="round"
        />
        <circle cx="790" cy="349" r="8" fill={top} />
      </svg>

      <div className="absolute left-6 top-7 z-10 sm:left-10 sm:top-10">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-70">
          The color wardrobe / 01
        </span>

        <h2 className="mt-5 max-w-[320px] text-[clamp(3.1rem,6vw,6rem)] font-semibold leading-[0.9] tracking-[-0.075em]">
          Wear the
          <br />
          <span
            className="font-serif font-normal italic"
            style={{ color: detail }}
          >
            feeling.
          </span>
        </h2>

        <p className="mt-5 max-w-52.5 text-xs leading-[1.8] opacity-75 sm:text-sm">
          Effortless combinations. A little personality in every shade.
        </p>
      </div>

      <div className="absolute bottom-6 left-6 text-[10px] font-semibold uppercase tracking-[0.16em] sm:bottom-9 sm:left-10">
        Style is a color story.
      </div>
    </div>
  );
}

export default function Matcher({
  base,
  setPalette,
}: {
  base: string;
  setPalette: (p: string[]) => void;
}) {
  const [context, setContext] = useState<Context>("Branding");
  const [mode, setMode] = useState<HarmonyMode>("Analogous");
  const [leadIndex, setLeadIndex] = useState(0);
  const [savedKey, setSavedKey] = useState("");

  const generated = useMemo(() => {
    const safeBase = HEX.test(base) ? base : FALLBACK;
    const result = harmony(safeBase, mode).filter((color) => HEX.test(color));
    return Array.from(
      { length: 5 },
      (_, index) => result[index % result.length] || safeBase,
    );
  }, [base, mode]);

  const colors = useMemo(
    () =>
      generated.map(
        (_, index) => generated[(index + leadIndex) % generated.length],
      ),
    [generated, leadIndex],
  );

  const paletteKey = colors.join("|");
  const saved = savedKey === paletteKey;

  const descriptions: Record<Context, string> = {
    Branding:
      "A strong lead color, memorable supporting shades, and a little personality.",
    Interiors:
      "See how your colors could shape a room, from the walls to the smallest details.",
    Outfits:
      "Discover how the same combination works across clothing and accessories.",
  };

  function changeMode(value: HarmonyMode) {
    setMode(value);
    setLeadIndex(0);
  }

  function changeLead(index: number) {
    setLeadIndex((current) => (current + index) % generated.length);
  }

  function applyPalette() {
    setPalette([...colors]);
    setSavedKey(paletteKey);
  }

  return (
    <div className="space-y-7">
      {/* Controls */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div
          role="group"
          aria-label="Preview context"
          className="flex w-full items-center gap-1 rounded-full bg-soft p-1 sm:w-auto"
        >
          {CONTEXTS.map((item) => (
            <button
              key={item.name}
              type="button"
              aria-pressed={context === item.name}
              onClick={() => setContext(item.name)}
              className={`flex min-h-10 flex-1 items-center justify-center gap-2 rounded-full px-4 text-xs font-semibold transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink sm:flex-none ${context === item.name ? "bg-ink text-page shadow-sm" : "text-muted hover:bg-page hover:text-ink"}`}
            >
              <span aria-hidden="true" className="text-base leading-none">
                {item.symbol}
              </span>
              {item.name}
            </button>
          ))}
        </div>

        <label className="flex items-center justify-between gap-3 text-xs font-medium text-muted">
          Color harmony
          <span className="relative">
            <select
              aria-label="Color harmony"
              value={mode}
              onChange={(event) =>
                changeMode(event.target.value as HarmonyMode)
              }
              className="min-h-11 cursor-pointer appearance-none rounded-full bg-soft py-2.5 pl-4 pr-10 text-xs font-semibold text-ink outline-none transition-colors hover:bg-ink/10 focus-visible:bg-ink/10"
            >
              {HARMONIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <span
              aria-hidden="true"
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-ink"
            >
              ⌄
            </span>
          </span>
        </label>
      </div>

      {/* Context preview — visibly different for every use case */}
      <div aria-live="off">
        {context === "Branding" && <BrandingPreview colors={colors} />}
        {context === "Interiors" && <InteriorsPreview colors={colors} />}
        {context === "Outfits" && <OutfitsPreview colors={colors} />}
      </div>

      {/* Explanation */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span
            className="size-2 rounded-full"
            style={{ backgroundColor: colors[0] }}
          />
          <p className="text-xs leading-relaxed text-muted">
            {descriptions[context]}
          </p>
        </div>

        <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
          {mode} harmony
        </span>
      </div>

      {/* Interactive color strip */}
      <PaletteStrip colors={colors} onSelect={changeLead} />

      {/* Original detailed swatches */}
      <Swatches colors={colors} />

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={applyPalette}
            className="group inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-ink px-6 text-xs font-semibold text-page transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink active:translate-y-0 motion-reduce:transform-none"
          >
            {saved ? "✓ Palette saved" : "Use this palette"}
            {!saved && (
              <span className="text-base transition-transform group-hover:translate-x-1">
                ↗
              </span>
            )}
          </button>

          {saved && (
            <Link
              href="/tools/palette-studio"
              className="text-xs font-medium text-ink transition-opacity hover:opacity-60"
            >
              Open in Palette Studio ↗
            </Link>
          )}
        </div>

        <span className="text-[11px] text-muted">
          Five shades. Your next idea.
        </span>
      </div>

      <Export text={paletteCSS(colors)} />
    </div>
  );
}
