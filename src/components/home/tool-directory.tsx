"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Icon } from "@/components/ui";
import { toolsList } from "@/config/tools";

const FALLBACK = ["#FF795B", "#F6C85F", "#D7E7A9", "#9AAAF0", "#7963CF"];
const HEX = /^#[0-9a-f]{6}$/i;
const CATEGORIES = [
  "All tools",
  "Discover",
  "Create",
  "Improve",
  "Play",
] as const;
const FEATURED = ["image-to-colors", "theme-studio"];

type ArtProps = { slug: string; colors: string[] };

function ToolArtwork({ slug, colors: c }: ArtProps) {
  const [a, b, d, e, f] = c;
  const paper = "#FAF8F1";
  const dark = "#25232B";

  return (
    <svg
      viewBox="0 0 340 190"
      fill="none"
      aria-hidden="true"
      className="h-full w-full overflow-visible transition-transform duration-700 ease-out group-hover:scale-[1.06] motion-reduce:transform-none"
    >
      <defs>
        <linearGradient id={`art-gradient-${slug}`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor={a} />
          <stop offset=".48" stopColor={d} />
          <stop offset="1" stopColor={f} />
        </linearGradient>
        <linearGradient id={`art-soft-${slug}`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor={b} />
          <stop offset="1" stopColor={e} />
        </linearGradient>
      </defs>

      {slug === "image-to-colors" && (
        <>
          <rect
            x="30"
            y="16"
            width="200"
            height="150"
            rx="17"
            fill={paper}
            transform="rotate(-8 130 91)"
          />
          <g transform="rotate(-8 130 91)">
            <rect x="43" y="29" width="174" height="114" rx="10" fill={d} />
            <circle cx="173" cy="58" r="22" fill={b} />
            <path d="M43 132 93 74l38 35 28-22 58 45v11H43Z" fill={f} />
            <path d="M43 142 108 101l48 41Z" fill={a} />
          </g>
          <rect
            x="195"
            y="90"
            width="110"
            height="76"
            rx="15"
            fill={paper}
            transform="rotate(7 250 128)"
          />
          {[a, b, d, e, f].map((color, i) => (
            <rect
              key={i}
              x={207 + i * 17}
              y="110"
              width="17"
              height="43"
              rx="8"
              fill={color}
              transform="rotate(7 250 128)"
            />
          ))}
          <path d="m252 45 8 8-8 8-8-8Z" fill={a} />
        </>
      )}

      {slug === "theme-studio" && (
        <>
          <rect
            x="45"
            y="28"
            width="153"
            height="125"
            rx="14"
            fill={paper}
            transform="rotate(-8 122 90)"
          />
          <g transform="rotate(-8 122 90)">
            <rect x="56" y="42" width="130" height="20" rx="7" fill={d} />
            <circle cx="66" cy="52" r="4" fill={a} />
            <rect x="58" y="78" width="62" height="56" rx="10" fill={a} />
            <rect x="129" y="78" width="53" height="12" rx="6" fill={f} />
            <rect x="129" y="100" width="45" height="7" rx="3.5" fill={e} />
            <rect x="129" y="117" width="35" height="7" rx="3.5" fill={b} />
          </g>
          <rect
            x="150"
            y="45"
            width="152"
            height="119"
            rx="15"
            fill={dark}
            transform="rotate(8 226 105)"
          />
          <g transform="rotate(8 226 105)">
            <rect
              x="164"
              y="58"
              width="125"
              height="14"
              rx="7"
              fill="#55505E"
            />
            <circle cx="177" cy="65" r="4" fill={b} />
            <rect x="164" y="86" width="58" height="62" rx="10" fill={f} />
            <rect x="232" y="89" width="43" height="8" rx="4" fill={d} />
            <rect x="232" y="105" width="37" height="7" rx="3.5" fill={e} />
            <rect x="232" y="122" width="47" height="7" rx="3.5" fill={a} />
          </g>
        </>
      )}

      {slug === "hue-match" && (
        <>
          <circle cx="138" cy="94" r="72" fill={a} opacity=".95" />
          <circle cx="202" cy="94" r="72" fill={e} opacity=".9" />
          <path
            d="M170 30a72 72 0 0 0 0 128 72 72 0 0 0 0-128Z"
            fill={b}
            opacity=".92"
          />
          <circle
            cx="138"
            cy="94"
            r="38"
            stroke={paper}
            strokeWidth="3"
            strokeDasharray="5 8"
          />
          <circle
            cx="202"
            cy="94"
            r="38"
            stroke={paper}
            strokeWidth="3"
            strokeDasharray="5 8"
          />
          <path
            d="m163 94 7 7 16-17"
            stroke={dark}
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      )}

      {slug === "palette-studio" && (
        <>
          {[a, b, d, e, f].map((color, i) => (
            <g key={i} transform={`rotate(${(i - 2) * 7} ${66 + i * 51} 98)`}>
              <rect
                x={42 + i * 51}
                y={29 + (i % 2) * 9}
                width="53"
                height="134"
                rx="23"
                fill={color}
              />
              <circle
                cx={68 + i * 51}
                cy="141"
                r="6"
                fill={paper}
                opacity=".55"
              />
            </g>
          ))}
        </>
      )}

      {slug === "gradient-lab" && (
        <>
          <rect
            x="32"
            y="26"
            width="276"
            height="139"
            rx="25"
            fill={`url(#art-gradient-${slug})`}
          />
          <path
            d="M33 124C98 38 150 206 222 106s64-53 85-35"
            stroke={paper}
            strokeWidth="12"
            strokeLinecap="round"
            opacity=".65"
          />
          <circle cx="92" cy="72" r="15" fill={paper} opacity=".7" />
          <circle cx="258" cy="121" r="10" fill={paper} opacity=".75" />
        </>
      )}

      {slug === "contrast-checker" && (
        <>
          <rect x="45" y="24" width="250" height="144" rx="22" fill={dark} />
          <path
            d="M170 24h103a22 22 0 0 1 22 22v100a22 22 0 0 1-22 22H170Z"
            fill={b}
          />
          <text
            x="108"
            y="118"
            textAnchor="middle"
            fontSize="71"
            fontWeight="750"
            fill={paper}
            fontFamily="Arial, sans-serif"
          >
            Aa
          </text>
          <text
            x="232"
            y="118"
            textAnchor="middle"
            fontSize="71"
            fontWeight="750"
            fill={dark}
            fontFamily="Arial, sans-serif"
          >
            Aa
          </text>
          <rect x="135" y="134" width="70" height="25" rx="12.5" fill={e} />
          <text
            x="170"
            y="151"
            textAnchor="middle"
            fontSize="12"
            fontWeight="700"
            fill={dark}
            fontFamily="Arial, sans-serif"
          >
            AA ✓
          </text>
        </>
      )}

      {slug === "color-fix" && (
        <>
          <rect
            x="39"
            y="42"
            width="110"
            height="108"
            rx="22"
            fill={a}
            transform="rotate(-9 94 96)"
          />
          <path
            d="m71 70 50 50m0-50-50 50"
            stroke={paper}
            strokeWidth="14"
            strokeLinecap="round"
            opacity=".8"
            transform="rotate(-9 94 96)"
          />
          <path
            d="M154 96h30m-10-11 11 11-11 11"
            stroke={dark}
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <rect
            x="189"
            y="29"
            width="114"
            height="131"
            rx="25"
            fill={e}
            transform="rotate(8 246 94)"
          />
          <path
            d="m219 93 20 19 35-41"
            stroke={dark}
            strokeWidth="13"
            strokeLinecap="round"
            strokeLinejoin="round"
            transform="rotate(8 246 94)"
          />
        </>
      )}

      {slug === "color-explorer" && (
        <>
          {[76, 56, 35].map((r, i) => (
            <circle
              key={r}
              cx="170"
              cy="95"
              r={r}
              stroke={[a, e, f][i]}
              strokeWidth="11"
              opacity={1 - i * 0.12}
            />
          ))}
          <circle cx="170" cy="95" r="19" fill={b} />
          {[
            [-76, 0],
            [76, 0],
            [0, -76],
            [0, 76],
          ].map(([x, y], i) => (
            <circle
              key={i}
              cx={170 + x}
              cy={95 + y}
              r="13"
              fill={[a, b, d, f][i]}
              stroke={paper}
              strokeWidth="4"
            />
          ))}
        </>
      )}

      {slug === "vision-simulator" && (
        <>
          <rect x="55" y="33" width="230" height="126" rx="23" fill={d} />
          <path d="M55 110 121 55l58 55 51-39 55 39v49H55Z" fill={a} />
          <circle cx="212" cy="62" r="23" fill={b} />
          <circle
            cx="178"
            cy="96"
            r="58"
            fill="#F7F6F0"
            fillOpacity=".18"
            stroke={paper}
            strokeWidth="10"
          />
          <path
            d="m217 136 34 28"
            stroke={paper}
            strokeWidth="13"
            strokeLinecap="round"
          />
          <path
            d="M178 39v114"
            stroke={paper}
            strokeWidth="4"
            strokeDasharray="7 7"
            opacity=".9"
          />
        </>
      )}

      {slug === "color-sense" && (
        <>
          {[a, e, a, a, a].map((color, i) => (
            <rect
              key={i}
              x={31 + i * 57}
              y={49 + (i % 2) * 9}
              width="51"
              height="90"
              rx="16"
              fill={color}
            />
          ))}
          <circle cx="170" cy="34" r="18" fill={b} />
          <path
            d="m163 34 5 5 10-11"
            stroke={dark}
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      )}

      {slug === "daily-color" && (
        <>
          <rect x="89" y="18" width="163" height="157" rx="27" fill={paper} />
          <path
            d="M89 45a27 27 0 0 1 27-27h109a27 27 0 0 1 27 27v23H89Z"
            fill={f}
          />
          <circle cx="124" cy="27" r="5" fill={paper} />
          <circle cx="216" cy="27" r="5" fill={paper} />
          <circle cx="170" cy="113" r="42" fill={a} />
          <text
            x="170"
            y="130"
            textAnchor="middle"
            fontSize="50"
            fontWeight="750"
            fill={paper}
            fontFamily="Arial, sans-serif"
          >
            ?
          </text>
          <circle cx="260" cy="144" r="14" fill={b} />
        </>
      )}

      {slug === "color-theory" && (
        <>
          {[a, b, d, e, f, a, b, d, e, f, a, b].map((color, i) => (
            <path
              key={i}
              d="M170 95 170 16 A79 79 0 0 1 209.5 26.6Z"
              fill={color}
              transform={`rotate(${i * 30} 170 95)`}
            />
          ))}
          <circle cx="170" cy="95" r="36" fill={paper} />
          <circle cx="170" cy="95" r="15" fill={dark} />
          <circle
            cx="253"
            cy="29"
            r="11"
            fill={a}
            stroke={paper}
            strokeWidth="4"
          />
        </>
      )}
    </svg>
  );
}

function PaletteMark({ colors }: { colors: string[] }) {
  return (
    <span aria-hidden="true" className="flex items-center -space-x-1">
      {colors.map((color, index) => (
        <span
          key={index}
          className="size-3 rounded-full shadow-[0_0_0_1.5px_var(--surface)]"
          style={{ backgroundColor: color }}
        />
      ))}
    </span>
  );
}

export default function ToolDirectory({
  palette,
  onSave,
}: {
  palette: string[];
  onSave: () => void;
}) {
  const [category, setCategory] =
    useState<(typeof CATEGORIES)[number]>("All tools");
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  const colors = FALLBACK.map((fallback, index) =>
    HEX.test(palette[index] ?? "") ? palette[index] : fallback,
  );
  const normalizedQuery = query.trim().toLowerCase();
  const shown = toolsList
    .filter(
      (tool) =>
        (category === "All tools" || category === tool.category) &&
        `${tool.name} ${tool.description} ${tool.category} ${tool.tag}`
          .toLowerCase()
          .includes(normalizedQuery),
    )
    .sort((a, b) => {
      const aRank = FEATURED.indexOf(a.slug);
      const bRank = FEATURED.indexOf(b.slug);
      return (aRank < 0 ? 99 : aRank) - (bRank < 0 ? 99 : bRank);
    });

  useEffect(() => {
    function shortcut(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const typing = target?.matches(
        "input, textarea, select, [contenteditable='true']",
      );
      if (
        event.key === "/" &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.altKey &&
        !typing
      ) {
        event.preventDefault();
        searchRef.current?.focus();
      }
      if (
        event.key === "Escape" &&
        document.activeElement === searchRef.current
      ) {
        setQuery("");
        searchRef.current?.blur();
      }
    }
    window.addEventListener("keydown", shortcut);
    return () => window.removeEventListener("keydown", shortcut);
  }, []);

  function resetFilters() {
    setCategory("All tools");
    setQuery("");
    searchRef.current?.focus();
  }

  return (
    <section
      id="tools"
      aria-labelledby="tools-title"
      className="relative left-1/2 w-[calc(100dvw-24px)] -translate-x-1/2 py-16 sm:w-[calc(100dvw-48px)] md:py-12 lg:w-[calc(100dvw-80px)]"
    >
      {/* Intro */}
      <div className="mb-8 flex flex-col justify-between gap-6 px-1 lg:mb-11 lg:flex-row lg:items-end">
        <div className="max-w-4xl">
          <div className="mb-5 flex items-center gap-3">
            <PaletteMark colors={colors} />
            <span className=" text-muted">
              The creative toolbox · {toolsList.length} ways to play
            </span>
          </div>
          <h2
            id="tools-title"
            className="text-8xl font-semibold leading-[0.98] tracking-[-0.075em] text-ink"
          >
            Make something{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: `linear-gradient(110deg, ${colors[0]}, ${colors[3]}, ${colors[4]})`,
              }}
            >
              colorful.
            </span>
          </h2>
          <p className="mt-5 max-w-lg text-sm leading-relaxed text-muted sm:text-base">
            One playground. A whole universe of color experiments. Pick a tool
            and see where your imagination goes.
          </p>
        </div>
        <div className="flex items-center gap-3 self-start rounded-full bg-soft px-4 py-3 text-xs font-medium text-ink lg:self-auto">
          <span className="relative flex size-2.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-40 motion-reduce:animate-none" />
            <span className="relative inline-flex size-2.5 rounded-full bg-emerald-400" />
          </span>
          All tools ready to explore
          <span className="font-mono text-muted">↗</span>
        </div>
      </div>

      {/* Filter and search station */}
      <div className="mb-5 flex flex-col justify-between gap-3 rounded-[23px] bg-soft/70 p-2.5 md:mb-6 md:flex-row md:items-center md:p-3">
        <div
          role="group"
          aria-label="Filter tools by category"
          className="flex min-w-0 items-center gap-1 overflow-x-auto p-0.5 scrollbar-none [&::-webkit-scrollbar]:hidden"
        >
          {CATEGORIES.map((item) => {
            const count =
              item === "All tools"
                ? toolsList.length
                : toolsList.filter((tool) => tool.category === item).length;
            return (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                aria-pressed={category === item}
                className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full px-3.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:bg-ink/15 sm:px-4 ${category === item ? "bg-ink text-page shadow-sm" : "text-muted hover:bg-page hover:text-ink"}`}
              >
                {item}
                <span
                  className={`font-mono text-[10px] ${category === item ? "opacity-65" : "opacity-50"}`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
        <label className="flex min-h-11 w-full items-center gap-2.5 rounded-2xl bg-page px-3.5 text-muted md:w-68.75 lg:w-[320px]">
          <Icon name="search" size={17} />
          <input
            ref={searchRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            type="search"
            placeholder="Search your next obsession..."
            aria-label="Search color tools"
            className="min-w-0 flex-1 bg-transparent text-xs text-ink outline-none placeholder:text-muted focus-visible:outline-none"
          />
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                searchRef.current?.focus();
              }}
              aria-label="Clear search"
              className="grid size-7 place-items-center rounded-full hover:bg-soft focus-visible:outline-none focus-visible:bg-soft"
            >
              <Icon name="close" size={14} />
            </button>
          ) : (
            <kbd className="hidden rounded-md bg-soft px-2 py-1 font-mono text-[11px] text-muted sm:inline">
              /
            </kbd>
          )}
        </label>
      </div>

      {/* Every tool gets its own artwork, two favorites get extra room */}
      {shown.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:gap-4 xl:grid-cols-4">
          {shown.map((tool, index) => {
            const featured = FEATURED.includes(tool.slug);
            const accent =
              colors[
                (toolsList.findIndex((entry) => entry.slug === tool.slug) + 5) %
                  5
              ];
            const background = `color-mix(in oklab, ${accent} ${featured ? 20 : 13}%, var(--surface))`;
            const artBackground = `color-mix(in oklab, ${accent} 22%, var(--page))`;
            const cardStyle = {
              backgroundColor: background,
              "--card-accent": accent,
            } as CSSProperties;

            return (
              <Link
                key={tool.slug}
                href={`/tools/${tool.slug}`}
                onClick={onSave}
                style={cardStyle}
                className={`group relative isolate flex min-w-0 flex-col overflow-hidden rounded-[26px] p-4 text-ink transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_22px_55px_rgb(0_0_0/0.12)] focus-visible:-translate-y-1 focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_var(--card-accent),0_22px_55px_rgb(0_0_0/0.12)] motion-reduce:transform-none sm:p-5 lg:p-6 ${featured ? "min-h-85 sm:col-span-2 sm:min-h-78.75 lg:min-h-86.25 xl:col-span-2" : "min-h-80 sm:min-h-83.75"}`}
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle,currentColor_1px,transparent_1.5px)] bg-size-[22px_22px] text-black/4.5 dark:text-white/4.5"
                />
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-2 rounded-full bg-page/75 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-ink">
                    <span
                      className="size-1.5 rounded-full"
                      style={{ backgroundColor: accent }}
                    />
                    {tool.category}
                  </span>
                  {tool.tag ? (
                    <span className="rounded-full bg-ink px-3 py-1.5 text-[10px] font-semibold text-page">
                      {tool.tag}
                    </span>
                  ) : (
                    <span className="font-mono text-[10px] text-muted">
                      /{String(index + 1).padStart(2, "0")}
                    </span>
                  )}
                </div>
                <div
                  className={`${featured ? "flex flex-1 flex-col-reverse gap-3 sm:flex-row sm:items-center sm:gap-5" : "flex flex-1 flex-col"}`}
                >
                  <div
                    className={`${featured ? "flex-1 pb-3 sm:pb-0" : "order-2 mt-4"}`}
                  >
                    {featured && (
                      <p className="mb-3 font-semibold text-muted">
                        Editor&apos;s pick / Start here
                      </p>
                    )}
                    <h3
                      className={`${featured ? "text-[clamp(1.75rem,3vw,2.9rem)] leading-[1.05]" : "text-[21px] leading-tight"} font-semibold tracking-[-0.055em]`}
                    >
                      {tool.name}
                    </h3>
                    <p
                      className={`mt-2 max-w-70 leading-relaxed text-muted ${featured ? "text-sm" : "text-xs"}`}
                    >
                      {tool.description}
                    </p>
                    {featured && (
                      <span className="mt-5 hidden items-center gap-2 text-xs font-bold sm:inline-flex">
                        Start creating <Icon name="arrow" size={15} />
                      </span>
                    )}
                  </div>
                  <div
                    className={`${featured ? "relative h-38.75 flex-1 sm:h-58.75" : "order-1 mt-4 h-36.25 sm:h-41.25"} grid min-w-0 place-items-center overflow-hidden rounded-[21px]`}
                    style={{ backgroundColor: artBackground }}
                  >
                    <ToolArtwork slug={tool.slug} colors={colors} />
                  </div>
                </div>
                <div
                  className={`flex items-center justify-between gap-3 ${featured ? "sm:mt-2" : "mt-4"}`}
                >
                  <PaletteMark colors={colors} />
                  <span
                    className="flex size-9 items-center justify-center rounded-full bg-page/85 text-ink transition-all duration-300 group-hover:-rotate-45 group-hover:bg-ink group-hover:text-page motion-reduce:transform-none"
                    aria-hidden="true"
                  >
                    <Icon name="arrow" size={17} />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="flex min-h-72.5 flex-col items-center justify-center overflow-hidden rounded-[28px] bg-soft/70 px-5 py-12 text-center">
          <div className="mb-6 flex -space-x-4">
            {colors.slice(0, 3).map((color, index) => (
              <span
                key={index}
                className="size-14 rounded-full shadow-[0_10px_25px_rgb(0_0_0/0.12)]"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <h3 className="text-2xl font-semibold tracking-tight text-ink">
            No colors in this corner.
          </h3>
          <p className="mt-2 max-w-sm text-sm text-muted">
            Try a different search or explore the complete toolbox.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-6 min-h-11 rounded-full bg-ink px-6 text-xs font-semibold text-page transition-opacity hover:opacity-85 focus-visible:outline-none focus-visible:opacity-75"
          >
            Show all tools ↗
          </button>
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 px-1 text-xs text-muted">
        <span>
          Showing{" "}
          <strong className="font-semibold text-ink">{shown.length}</strong> of{" "}
          {toolsList.length} creative tools
        </span>
        <span className="hidden sm:inline">
          No accounts. Just ideas and color.
        </span>
      </div>
    </section>
  );
}
