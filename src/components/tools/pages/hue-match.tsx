"use client";
import Matcher from "../hue-match";
import {
  ToolPage,
  ToolHeading,
  ArtCard,
  BaseControl,
  Note,
} from "../shared/page-parts";
import { useToolPalette } from "@/hooks/use-tool-palette";
export default function HueMatchPage() {
  const { palette, base, setBase, setPalette } = useToolPalette();
  return (
    <ToolPage>
      <ToolHeading
        eyebrow="02 / DISCOVER · HUEMATCH"
        title="Better"
        accent="together."
        description="Find the colors that bring out the best in each other."
      />
      <div className="grid items-start gap-5 lg:grid-cols-[300px_1fr]">
        <aside className="grid gap-4 lg:sticky lg:top-24">
          <ArtCard
            tool="hue-match"
            colors={palette}
            caption="A little chemistry. A lot of color."
          />
          <BaseControl base={base} onChange={setBase} />
          <Note number="THE MIX" title="Find your balance.">
            Try your combination as a brand, an interior, or an outfit. Change
            the harmony to shift the mood.
          </Note>
        </aside>
        <div className="flex min-w-0 flex-col gap-5">
          <Matcher base={base} setPalette={setPalette} />
        </div>
      </div>
    </ToolPage>
  );
}
