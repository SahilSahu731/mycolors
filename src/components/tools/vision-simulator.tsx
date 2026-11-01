"use client";
import Link from "next/link";
import { useState } from "react";
import { hex, paletteCSS, rgb } from "@/lib/colors";
import Swatches from "@/components/tools/shared/swatches";
import Export from "@/components/tools/shared/export-panel";
const matrices: Record<string, number[][]> = {
  Protanopia: [
    [0.152286, 1.052583, -0.204868],
    [0.114503, 0.786281, 0.099216],
    [-0.003882, -0.048116, 1.051998],
  ],
  Deuteranopia: [
    [0.367322, 0.860646, -0.227968],
    [0.280085, 0.672501, 0.047413],
    [-0.01182, 0.04294, 0.968881],
  ],
  Tritanopia: [
    [1.255528, -0.076749, -0.178779],
    [-0.078411, 0.930809, 0.147602],
    [0.004733, 0.691367, 0.3039],
  ],
};
function simulate(c: string, mode: string) {
  const linear = rgb(c)
    .map((v) => v / 255)
    .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  if (mode === "Achromatopsia") {
    const y = 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
    return hex(
      Array(3).fill(
        255 * (y <= 0.0031308 ? 12.92 * y : 1.055 * y ** (1 / 2.4) - 0.055),
      ),
    );
  }
  return hex(
    matrices[mode]
      .map((row) => row.reduce((sum, v, i) => sum + v * linear[i], 0))
      .map((v) => Math.max(0, Math.min(1, v)))
      .map(
        (v) =>
          255 * (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055),
      ),
  );
}
export default function Vision({ palette }: { palette: string[] }) {
  const [mode, setMode] = useState("Deuteranopia");
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4 [&_h3]:text-sm [&_h3]:font-medium">
        <h3>Different perspectives. Better design.</h3>
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          aria-label="Vision simulation"
        >
          {["Protanopia", "Deuteranopia", "Tritanopia", "Achromatopsia"].map(
            (v) => (
              <option key={v}>{v}</option>
            ),
          )}
        </select>
      </div>
      <h3 className="mt-3 text-sm font-medium">Original palette</h3>
      <Swatches colors={palette} />
      <h3 className="mt-3 text-sm font-medium">{mode} simulation</h3>
      <Swatches colors={palette.map((c) => simulate(c, mode))} />
      <section className="rounded-xl border border-line bg-surface p-5 md:p-7 [&>h3]:mb-4 [&_h3]:text-base [&_h3]:font-medium [&>p]:text-xs [&>p]:leading-7 [&>p]:text-muted [&>label]:mb-4 [&>textarea]:my-5">
        <h3>Use more than color to communicate.</h3>
        <p>
          Pair colors with labels, shapes and patterns. These approximate
          full-severity simulations use linear-light color transformations;
          individual experiences vary.
        </p>
        <Link
          className="inline-flex items-center gap-3 bg-transparent py-2 text-xs"
          href="/tools/palette-studio"
        >
          Edit your palette{" "}
        </Link>
      </section>
      <Export text={paletteCSS(palette.map((c) => simulate(c, mode)))} />
    </>
  );
}
