"use client";
import Gradient from "../gradient-lab";
import { ToolPage, ToolHeading } from "../shared/page-parts";
import { useToolPalette } from "@/hooks/use-tool-palette";
export default function GradientLabPage() {
  const { palette } = useToolPalette();
  return (
    <ToolPage>
      <ToolHeading
        eyebrow="05 / CREATE · GRADIENT LAB"
        title="Go with"
        accent="the flow."
        description="A soft sunrise. A vivid collision. Blend your way to something unexpected."
      />
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px] lg:[&>div:last-child]:col-span-2">
        <Gradient key={palette.join("")} palette={palette} />
      </div>
    </ToolPage>
  );
}
