"use client";

import Link from "next/link";
import ToolArtwork from "@/components/tools/shared/tool-artwork";
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
                    className="flex size-9 items-center justify-center rounded-full bg-page/85 text-ink transition-all duration-300 group-hover:bg-ink group-hover:text-page motion-reduce:transform-none"
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
            Show all tools
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
