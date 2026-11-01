"use client";
import Game from "../color-game";
import { ToolPage, ToolHeading, Note } from "../shared/page-parts";
export default function ColorSensePage() {
  return (
    <ToolPage>
      <ToolHeading
        eyebrow="10 / PLAY · COLORSENSE"
        title="Trust"
        accent="your eye."
        description="A tiny challenge for your color intuition. No rush, no limits. Just one more round."
      />
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="grid gap-5 rounded-4xl bg-violet-400/10 p-4 sm:p-7">
          <Game daily={false} />
        </div>
        <aside className="grid gap-4">
          <Note number="H / HUE" title="Find the family.">
            Start with the hue slider. Is your target closer to a warm orange or
            a cool blue?
          </Note>
          <Note number="S / SATURATION" title="Set the intensity.">
            Slide down for a muted color. Push up for a richer, more vivid
            shade.
          </Note>
          <Note number="L / LIGHTNESS" title="Catch the light.">
            Dial in how light or dark the target looks. Reveal your score when
            it feels right.
          </Note>
        </aside>
      </div>
    </ToolPage>
  );
}
