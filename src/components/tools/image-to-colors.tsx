"use client";
import Link from "next/link";
import { useRef, useState } from "react";
import { CopyButton, Icon } from "@/components/ui";
import { hex, paletteCSS, rgb } from "@/lib/colors";
import Swatches from "@/components/tools/shared/swatches";
import Export from "@/components/tools/shared/export-panel";
export default function Extractor({
  setPalette,
}: {
  setPalette: (p: string[]) => void;
}) {
  const [src, setSrc] = useState("");
  const [colors, setColors] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [sample, setSample] = useState("");
  const canvas = useRef<HTMLCanvasElement>(null);
  function load(file?: File) {
    if (!file) return;
    if (
      ![
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
        "image/avif",
      ].includes(file.type)
    ) {
      setError("Choose a JPG, PNG, WebP, GIF or AVIF image.");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setError("Please choose an image smaller than 20 MB.");
      return;
    }
    setError("");
    setSaved(false);
    setSample("");
    const reader = new FileReader();
    reader.onerror = () =>
      setError("This image could not be read. Please try another file.");
    reader.onload = () => {
      const image = new Image();
      image.onerror = () =>
        setError("This image could not be decoded. Please try another file.");
      image.onload = () => {
        const el = canvas.current;
        if (!el) return;
        const scale = Math.min(1, 700 / image.width, 440 / image.height);
        el.width = Math.round(image.width * scale);
        el.height = Math.round(image.height * scale);
        const ctx = el.getContext("2d", { willReadFrequently: true });
        if (!ctx) return;
        ctx.drawImage(image, 0, 0, el.width, el.height);
        const pixels = ctx.getImageData(0, 0, el.width, el.height).data;
        const buckets = new Map<
          string,
          {
            n: number;
            sum: number[];
          }
        >();
        for (let i = 0; i < pixels.length; i += 16) {
          if (pixels[i + 3] < 128) continue;
          const v = [pixels[i], pixels[i + 1], pixels[i + 2]];
          const key = v.map((v) => Math.floor(v / 32)).join(",");
          const b = buckets.get(key) || { n: 0, sum: [0, 0, 0] };
          b.n++;
          b.sum = b.sum.map((x, j) => x + v[j]);
          buckets.set(key, b);
        }
        const ranked = [...buckets.values()].sort((a, b) => b.n - a.n);
        const chosen: string[] = [];
        for (const b of ranked) {
          const c = hex(b.sum.map((v) => v / b.n));
          if (
            chosen.every(
              (x) =>
                rgb(x).reduce((s, v, j) => s + (v - rgb(c)[j]) ** 2, 0) > 1800,
            )
          )
            chosen.push(c);
          if (chosen.length === 5) break;
        }
        if (!chosen.length) {
          setError("No opaque colors found. Try an image with visible pixels.");
          return;
        }
        setColors(chosen);
        setSrc(String(reader.result));
      };
      image.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  }
  return (
    <>
      <label
        className="relative flex min-h-80 cursor-pointer flex-col items-center justify-center gap-5 rounded-xl border border-dashed border-violet-300 bg-soft px-5 py-8 text-center [&>h2]:text-2xl [&>h2]:tracking-tight [&>p]:text-xs [&>p]:text-muted [&>small]:text-[10px] [&>small]:text-muted [&>input]:absolute [&>input]:inset-0 [&>input]:size-full [&>input]:cursor-pointer [&>input]:opacity-0 focus-within:ring-2 focus-within:ring-violet-400"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          load(e.dataTransfer.files[0]);
        }}
      >
        <Icon name="image" size={36} />
        <h2>A whole palette, hiding in your photo.</h2>
        <p>Drop an image here, or click to choose a file.</p>
        <span className="inline-flex min-h-11 items-center justify-center gap-3 rounded-lg border border-ink bg-ink px-5 py-3 text-xs font-medium text-page transition hover:-translate-y-0.5 motion-reduce:transform-none disabled:transform-none">
          Choose an image ↑
        </span>
        <small>
          JPG, PNG, WebP, GIF or AVIF · Up to 20 MB · Stays on your device
        </small>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
          onChange={(e) => load(e.target.files?.[0])}
        />
      </label>
      {error && (
        <p role="alert" className="text-orange-700 dark:text-orange-300">
          {error}
        </p>
      )}
      <div
        className={
          src
            ? "flex justify-center rounded-xl bg-soft p-5 [&_canvas]:h-auto [&_canvas]:max-w-full [&_canvas]:cursor-crosshair [&_canvas]:rounded-md"
            : "flex justify-center rounded-xl bg-soft p-5 [&_canvas]:h-auto [&_canvas]:max-w-full [&_canvas]:cursor-crosshair [&_canvas]:rounded-md hidden"
        }
      >
        <canvas
          ref={canvas}
          aria-label="Uploaded image: click to sample a color"
          onClick={(e) => {
            const el = e.currentTarget;
            const r = el.getBoundingClientRect();
            const data = el
              .getContext("2d")
              ?.getImageData(
                Math.min(
                  el.width - 1,
                  Math.floor(((e.clientX - r.left) * el.width) / r.width),
                ),
                Math.min(
                  el.height - 1,
                  Math.floor(((e.clientY - r.top) * el.height) / r.height),
                ),
                1,
                1,
              ).data;
            if (data) setSample(hex([...data].slice(0, 3)));
          }}
        />
      </div>
      {colors.length > 0 && (
        <>
          <p className="text-xs leading-7 text-muted">
            Click the image to sample any pixel.{" "}
            {sample && `Selected: ${sample}`}
          </p>
          {sample && <CopyButton text={sample} label={`Copy ${sample}`} />}
          <Swatches colors={colors} onChange={setSample} />
          <button
            className="inline-flex min-h-11 items-center justify-center gap-3 rounded-lg border border-ink bg-ink px-5 py-3 text-xs font-medium text-page transition hover:-translate-y-0.5 motion-reduce:transform-none disabled:transform-none"
            onClick={() => {
              setPalette(
                Array.from({ length: 5 }, (_, i) => colors[i % colors.length]),
              );
              setSaved(true);
            }}
          >
            {saved ? "✓ Palette saved" : "Use this palette "}
          </button>
          {saved && (
            <p className="text-emerald-700 dark:text-emerald-300" role="status">
              Continue in{" "}
              <Link href="/tools/palette-studio">Palette Studio </Link> or{" "}
              <Link href="/tools/theme-studio">Theme Studio </Link>.
            </p>
          )}
          <Export text={paletteCSS(colors)} />
        </>
      )}
    </>
  );
}
