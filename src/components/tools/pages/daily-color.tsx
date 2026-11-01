"use client";
import Game from "../color-game";
import { ToolPage, ToolHeading, Note } from "../shared/page-parts";
export default function DailyColorPage() {
  return (
    <ToolPage>
      <div className="mx-auto max-w-[1080px]">
        <ToolHeading
          eyebrow="11 / PLAY · DAILY COLOR"
          title="A little ritual."
          accent="In color."
          description="One color for everyone. One chance to get close. Come back tomorrow for a fresh hue."
        />
        <div className="relative grid gap-5 overflow-hidden rounded-[36px] border border-orange-300/30 bg-orange-300/10 p-4 sm:p-9">
          <Game daily />
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Note number="YOUR DAILY MOMENT" title="Pause. Look. Match.">
            Use the sliders to recreate today’s target, then reveal your score
            and share your result.
          </Note>
          <Note number="ANOTHER ROUND?" title="Keep your eye in.">
            The daily challenge resets at midnight UTC. ColorSense is always
            open for unlimited practice.
          </Note>
        </div>
      </div>
    </ToolPage>
  );
}
