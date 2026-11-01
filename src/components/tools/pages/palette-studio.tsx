"use client";
import Palette from "../palette-studio";
import { ToolPage, ToolHeading } from "../shared/page-parts";
import { useToolPalette } from "@/hooks/use-tool-palette";
export default function PaletteStudioPage() {
  const { palette, setPalette } = useToolPalette();
  return (
    <ToolPage>
      <ToolHeading
        eyebrow="04 / CREATE · PALETTE STUDIO"
        title="Your next"
        accent="favorite five."
        description="Follow your curiosity. Lock a keeper. Press space and see what happens."
      >
        <span className="shrink-0 self-start rounded-full bg-soft px-5 py-3 text-xs text-muted">
          <kbd className="mr-2 rounded-md bg-surface px-2 py-1 font-mono">
            space
          </kbd>{" "}
          A fresh combination
        </span>
      </ToolHeading>
      <div className="flex flex-col gap-6">
        <Palette palette={palette} setPalette={setPalette} />
      </div>
    </ToolPage>
  );
}
