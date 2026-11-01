"use client";
import Theme from "../theme-studio";
import {
  ToolPage,
  ToolHeading,
  ArtCard,
  BaseControl,
  Note,
} from "../shared/page-parts";
import { useToolPalette } from "@/hooks/use-tool-palette";
export default function ThemeStudioPage() {
  const { palette, base, setBase } = useToolPalette();
  return (
    <ToolPage>
      <ToolHeading
        eyebrow="03 / CREATE · THEME STUDIO"
        title="One color."
        accent="A whole world."
        description="Build a considered interface, from the first accent to the last detail."
      />
      <div className="grid gap-5 xl:grid-cols-[1fr_300px]">
        <div className="flex min-w-0 flex-col gap-5 rounded-[32px] bg-soft/60 p-4 sm:p-7">
          <Theme base={base} />
        </div>
        <aside className="grid content-start gap-4 xl:sticky xl:top-24 xl:self-start">
          <BaseControl
            base={base}
            onChange={setBase}
            label="Your brand color"
          />
          <ArtCard
            tool="theme-studio"
            colors={palette}
            caption="Two modes. One unmistakable identity."
          />
          <Note number="READY TO BUILD" title="A system, not a swatch.">
            Preview both modes, inspect seven semantic tokens, then copy or
            download the CSS.
          </Note>
        </aside>
      </div>
    </ToolPage>
  );
}
