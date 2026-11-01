"use client";

import Hero from "./home/hero";
import PalettePlayground from "./home/palette-playground";
import TrustNote from "./home/trust-note";
import PalettePreviews from "./home/palette-previews";
import ToolDirectory from "./home/tool-directory";
import ColorGame from "./home/color-game";
import ClosingCTA from "./home/closing-cta";
import { usePalettePlayground } from "@/hooks/use-palette-playground";

/** Reorder, add, or remove landing-page sections here. */
export default function Home() {
  const playground = usePalettePlayground();
  return (
    <main id="main" className="overflow-x-clip">
      <Hero palette={playground.palette} onPick={playground.change} />
      <PalettePlayground controller={playground} />
      <PalettePreviews palette={playground.palette} onSave={playground.save} />
      <ToolDirectory palette={playground.palette} onSave={playground.save} />
      <ColorGame />
      <TrustNote />
      <ClosingCTA />
    </main>
  );
}
