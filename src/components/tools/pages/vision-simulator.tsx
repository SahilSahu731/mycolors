"use client";
import Vision from "../vision-simulator";
import { ToolPage, ToolHeading, ArtCard } from "../shared/page-parts";
import { useToolPalette } from "@/hooks/use-tool-palette";
import { ColorInput } from "@/components/ui";
export default function VisionSimulatorPage() {
  const { palette, setPalette } = useToolPalette();
  return (
    <ToolPage>
      <ToolHeading
        eyebrow="09 / IMPROVE · VISION SIMULATOR"
        title="A different"
        accent="perspective."
        description="Explore how your palette may appear through another lens. Make every color count."
      />
      <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="grid content-start gap-4">
          <ArtCard
            tool="vision-simulator"
            colors={palette}
            caption="Design with more people in mind."
          />
          <div className="grid gap-4 rounded-[24px] bg-soft p-5">
            <h2 className="text-sm font-semibold">Your source palette</h2>
            {palette.map((color, index) => (
              <ColorInput
                key={index}
                label={`Color ${index + 1}`}
                value={color}
                onChange={(value) =>
                  setPalette(palette.map((c, i) => (i === index ? value : c)))
                }
              />
            ))}
          </div>
        </aside>
        <div className="flex min-w-0 flex-col gap-5">
          <Vision palette={palette} />
        </div>
      </div>
    </ToolPage>
  );
}
