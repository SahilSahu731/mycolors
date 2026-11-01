"use client";
import Extractor from "../image-to-colors";
import { ToolPage, ToolHeading, ArtCard, Note } from "../shared/page-parts";
import { useToolPalette } from "@/hooks/use-tool-palette";
export default function ImageToColorsPage() {
  const { palette, setPalette } = useToolPalette();
  return (
    <ToolPage>
      <ToolHeading
        eyebrow="01 / DISCOVER · IMAGE TO COLORS"
        title="Every pixel."
        accent="A possibility."
        description="Turn a photo, a memory, or a happy accident into your next color story."
      />
      <div className="grid items-start gap-5 lg:grid-cols-[1fr_320px]">
        <div className="flex min-w-0 flex-col gap-5 rounded-4xl bg-soft/50 p-3 sm:p-6">
          <Extractor setPalette={setPalette} />
        </div>
        <aside className="grid gap-4">
          <ArtCard
            tool="image-to-colors"
            colors={palette}
            caption="Inspiration is already all around you."
          />
          <Note number="01 — DROP" title="Start with a photo.">
            Choose an image or drag it onto the canvas. Your photo stays on your
            device.
          </Note>
          <Note number="02 — DISCOVER" title="Get closer to the details.">
            Pick a pixel, copy a shade, or send the whole palette to Palette
            Studio.
          </Note>
        </aside>
      </div>
    </ToolPage>
  );
}
