"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ColorInput, Icon } from "@/components/ui";
import { fromHsl, initialPalette, normalize } from "@/lib/colors";
import { toolsList } from "@/config/tools";
import Theme from "./tools/theme-studio";
import ContrastTool from "./tools/contrast-checker";
import Gradient from "./tools/gradient-lab";
import Palette from "./tools/palette-studio";
import Extractor from "./tools/image-to-colors";
import Explore from "./tools/color-explorer";
import Matcher from "./tools/hue-match";
import Vision from "./tools/vision-simulator";
import Game from "./tools/color-game";
export default function Workspace({ slug }: { slug: string }) {
  const tool = toolsList.find((t) => t.slug === slug)!;
  const [base, setBase] = useState("#779d70");
  const [palette, setPaletteState] = useState(initialPalette);
  useEffect(() => {
    try {
      const stored = JSON.parse(
        localStorage.getItem("kolivra-palette") || "null",
      );
      if (
        Array.isArray(stored) &&
        stored.length === 5 &&
        stored.every((c) => typeof c === "string" && normalize(c))
      ) {
        setPaletteState(stored);
        setBase(stored[0]);
      }
    } catch {}
  }, []);
  function setPalette(p: string[]) {
    setPaletteState(p);
    setBase(p[0]);
    localStorage.setItem("kolivra-palette", JSON.stringify(p));
  }
  const withBase = [
    "hue-match",
    "theme-studio",
    "color-explorer",
    "color-theory",
  ].includes(slug);
  return (
    <main
      className="mx-auto w-[calc(100%-36px)] max-w-[1200px] md:w-[calc(100%-64px)] xl:w-[calc(100%-96px)] py-9 md:py-12"
      id="main"
    >
      <Link
        href="/#tools"
        className="mb-8 inline-block text-xs text-muted hover:text-ink"
      >
        ← All tools
      </Link>
      <div className="mb-8 flex items-center justify-between gap-5 [&_h1]:mt-3 [&_h1]:text-4xl [&_h1]:font-medium [&_h1]:tracking-tight md:[&_h1]:text-5xl [&_p]:mt-3 [&_p]:text-sm [&_p]:text-muted [&_h1_span]:text-violet-400">
        <div>
          <div className="flex items-center gap-2 text-[9px] font-semibold tracking-[0.15em]">
            {tool.category.toUpperCase()} / MYCOLORS TOOLBOX
          </div>
          <h1>
            {tool.name}
            <span>.</span>
          </h1>
          <p>{tool.description}</p>
        </div>
        <span className="grid size-14 shrink-0 place-items-center rounded-2xl border border-line bg-soft md:size-18">
          <Icon name={tool.icon} size={32} />
        </span>
      </div>
      {withBase && (
        <div className="mb-8 flex flex-wrap items-center gap-6 rounded-xl border border-line bg-surface p-5 [&>p]:hidden [&>p]:text-xs [&>p]:text-muted md:[&>p]:block [&>button]:ml-auto">
          <ColorInput
            label="Your starting color"
            value={base}
            onChange={setBase}
          />
          <p>Start with a color. See where it takes you.</p>
          <button
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-line bg-surface px-4 py-2.5 text-xs font-medium text-ink transition hover:bg-soft"
            onClick={() => setBase(fromHsl(Math.random() * 360, 50, 55))}
          >
            ↻ Surprise me
          </button>
        </div>
      )}
      <div className="flex flex-col gap-6">
        {slug === "theme-studio" && <Theme base={base} />}
        {slug === "palette-studio" && (
          <Palette palette={palette} setPalette={setPalette} />
        )}
        {slug === "gradient-lab" && (
          <Gradient key={palette.join("")} palette={palette} />
        )}
        {(slug === "contrast-checker" || slug === "color-fix") && (
          <ContrastTool fix={slug === "color-fix"} />
        )}
        {slug === "image-to-colors" && <Extractor setPalette={setPalette} />}
        {slug === "hue-match" && (
          <Matcher base={base} setPalette={setPalette} />
        )}
        {(slug === "color-explorer" || slug === "color-theory") && (
          <Explore base={base} theory={slug === "color-theory"} />
        )}
        {slug === "vision-simulator" && <Vision palette={palette} />}
        {(slug === "color-sense" || slug === "daily-color") && (
          <Game daily={slug === "daily-color"} />
        )}
      </div>
      <div className="mt-14 flex flex-wrap items-center gap-4 border-t border-line pt-8 [&>div]:mr-auto [&_h2]:mt-3 [&_h2]:text-xl [&>a]:flex [&>a]:items-center [&>a]:gap-3 [&>a]:rounded-lg [&>a]:border [&>a]:border-line [&>a]:bg-surface [&>a]:p-4 [&>a]:text-xs">
        <div>
          <div className="flex items-center gap-2 text-[9px] font-semibold tracking-[0.15em]">
            KEEP THE IDEAS FLOWING
          </div>
          <h2>A little more to explore.</h2>
        </div>
        {toolsList
          .filter((t) => t.slug !== slug && t.category === tool.category)
          .slice(0, 2)
          .concat(
            toolsList.filter((t) => t.category !== tool.category).slice(0, 1),
          )
          .slice(0, 3)
          .map((t) => (
            <Link href={`/tools/${t.slug}`} key={t.slug}>
              <Icon name={t.icon} />
              <span>{t.name}</span>
              <Icon size={16} />
            </Link>
          ))}
      </div>
    </main>
  );
}
