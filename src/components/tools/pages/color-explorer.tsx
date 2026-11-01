"use client";
import Explore from "../color-explorer";
import { ToolPage, ToolHeading, BaseControl } from "../shared/page-parts";
import { useToolPalette } from "@/hooks/use-tool-palette";
export default function ColorExplorerPage() {
  const { base, setBase } = useToolPalette();
  return (
    <ToolPage>
      <ToolHeading
        eyebrow="08 / DISCOVER · COLOR EXPLORER"
        title="One hue."
        accent="Endless stories."
        description="Get to know a color from every angle. Values, variations, and unexpected companions."
      >
        <BaseControl base={base} onChange={setBase} />
      </ToolHeading>
      <div className="flex flex-col gap-5">
        <Explore base={base} />
      </div>
    </ToolPage>
  );
}
