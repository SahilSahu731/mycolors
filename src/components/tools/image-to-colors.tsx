
"use client";

import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
  type DragEvent,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import { Icon } from "@/components/ui";
import { hex, ink, paletteCSS } from "@/lib/colors";

type Mode = "balanced" | "vibrant";
type Point = { x: number; y: number };
type RGB = [number, number, number];

type Candidate = {
  color: string;
  count: number;
  saturation: number;
  lab: RGB;
};

const MAX_SIZE = 20 * 1024 * 1024;
const MAX_PIXELS = 60_000_000;

const ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
];

const BRAND_COLORS = [
  "#FF795B",
  "#F6C85F",
  "#D7E7A9",
  "#9AAAF0",
  "#7963CF",
];

function toOklab([r, g, b]: RGB): RGB {
  const linear = (value: number) => {
    const c = value / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };

  const R = linear(r);
  const G = linear(g);
  const B = linear(b);

  const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B);
  const m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B);
  const s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B);

  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

function distance(a: RGB, b: RGB) {
  return Math.hypot(
    a[0] - b[0],
    a[1] - b[1],
    a[2] - b[2],
  );
}

function extractPalette(
  canvas: HTMLCanvasElement,
  mode: Mode,
): string[] {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });

  if (!ctx || !canvas.width || !canvas.height) return [];

  const { width, height } = canvas;
  const pixels = ctx.getImageData(0, 0, width, height).data;

  const stride = Math.max(
    1,
    Math.floor(Math.sqrt((width * height) / 18000)),
  );

  const buckets = new Map<number, { count: number; sum: RGB }>();

  for (let y = 0; y < height; y += stride) {
    for (let x = 0; x < width; x += stride) {
      const i = (y * width + x) * 4;
      const alpha = pixels[i + 3] / 255;

      if (alpha < 0.15) continue;

      const r = Math.round(pixels[i] * alpha + 255 * (1 - alpha));
      const g = Math.round(pixels[i + 1] * alpha + 255 * (1 - alpha));
      const b = Math.round(pixels[i + 2] * alpha + 255 * (1 - alpha));

      const key =
        ((r >> 4) << 8) |
        ((g >> 4) << 4) |
        (b >> 4);

      const bucket = buckets.get(key);

      if (bucket) {
        bucket.count++;
        bucket.sum[0] += r;
        bucket.sum[1] += g;
        bucket.sum[2] += b;
      } else {
        buckets.set(key, {
          count: 1,
          sum: [r, g, b],
        });
      }
    }
  }

  const candidates: Candidate[] = [...buckets.values()].map((bucket) => {
    const values = bucket.sum.map((n) =>
      Math.round(n / bucket.count),
    ) as RGB;

    const max = Math.max(...values);
    const min = Math.min(...values);

    return {
      color: hex(values).toUpperCase(),
      count: bucket.count,
      saturation: max === 0 ? 0 : (max - min) / max,
      lab: toOklab(values),
    };
  });

  const score = (candidate: Candidate) =>
    candidate.count *
    (mode === "vibrant"
      ? 0.3 + candidate.saturation * 2.5
      : 1);

  candidates.sort((a, b) => score(b) - score(a));

  const pool = candidates.slice(0, 240);
  const selected: Candidate[] = [];

  for (const threshold of [0.13, 0.085, 0.045, 0]) {
    while (selected.length < 5) {
      let best: Candidate | null = null;
      let bestScore = -Infinity;

      for (const candidate of pool) {
        if (selected.some((item) => item.color === candidate.color)) {
          continue;
        }

        const separation = selected.length
          ? Math.min(
              ...selected.map((item) =>
                distance(item.lab, candidate.lab),
              ),
            )
          : 1;

        if (separation < threshold) continue;

        const diversity = selected.length
          ? Math.min(1, separation / 0.25)
          : 1;

        const vibrance =
          mode === "vibrant"
            ? 0.4 + candidate.saturation * 1.8
            : 1;

        const currentScore =
          Math.log1p(candidate.count) *
          vibrance *
          (0.55 + diversity);

        if (currentScore > bestScore) {
          best = candidate;
          bestScore = currentScore;
        }
      }

      if (!best) break;

      selected.push(best);
    }

    if (selected.length === 5) break;
  }

  return selected.map((item) => item.color);
}

function UploadIllustration() {
  return (
    <span aria-hidden="true" className="relative mb-9 block h-40 w-56 shrink-0 transition-transform duration-500 ease-out group-hover:-translate-y-2 group-hover:rotate-2 sm:h-48 sm:w-68 motion-reduce:transition-none">
      <span className="absolute left-[7%] top-[8%] h-[81%] w-[66%] -rotate-12 overflow-hidden rounded-[25px] bg-[#9AAAF0] shadow-[0_18px_35px_rgb(0_0_0/0.13)]">
        <svg viewBox="0 0 120 120" className="h-full w-full">
          <rect width="120" height="120" fill="#D7E7A9" />
          <circle cx="91" cy="30" r="18" fill="#F6C85F" />
          <path d="M0 106 43 48 79 86 103 50 120 79V120H0Z" fill="#9AAAF0" />
          <path d="M0 120 44 78 74 100 120 59V120H0Z" fill="#FF795B" />
        </svg>
      </span>

      <span className="absolute bottom-[4%] right-[2%] flex h-[71%] w-[40%] rotate-12 items-center justify-center gap-1 rounded-[20px] bg-white px-2 shadow-[0_18px_35px_rgb(0_0_0/0.15)]">
        {BRAND_COLORS.map((color) => (
          <span key={color} className="h-[66%] min-w-0 flex-1 rounded-full" style={{ backgroundColor: color }} />
        ))}
      </span>

      <span className="absolute -right-2 -top-2 size-9 rounded-full bg-[#7963CF] shadow-lg" />
      <span className="absolute -bottom-1 left-1 size-6 rounded-full bg-[#F6C85F] shadow-md" />
      <span className="absolute right-[40%] top-[1%] size-3 rounded-full bg-[#FF795B]" />
    </span>
  );
}

export default function Extractor({
  setPalette,
}: {
  setPalette: (p: string[]) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageUrlRef = useRef<string | null>(null);
  const requestRef = useRef(0);
  const noticeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dragDepthRef = useRef(0);
  const modeRef = useRef<Mode>("balanced");

  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);

  const [mode, setMode] = useState<Mode>("balanced");
  const [colors, setColors] = useState<string[]>([]);
  const [selected, setSelected] = useState(0);

  const [point, setPoint] = useState<Point>({
    x: 0.5,
    y: 0.5,
  });

  const [sample, setSample] = useState("");
  const [filename, setFilename] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    return () => {
      requestRef.current++;

      if (imageUrlRef.current) {
        URL.revokeObjectURL(imageUrlRef.current);
      }

      if (noticeTimerRef.current) {
        clearTimeout(noticeTimerRef.current);
      }
    };
  }, []);

  function flash(message: string) {
    setNotice(message);

    if (noticeTimerRef.current) {
      clearTimeout(noticeTimerRef.current);
    }

    noticeTimerRef.current = setTimeout(() => {
      setNotice("");
    }, 2400);
  }

  function openFiles() {
    fileInputRef.current?.click();
  }

  function load(file?: File) {
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("Please choose a JPG, PNG, WebP, GIF, or AVIF image.");
      return;
    }

    if (file.size > MAX_SIZE) {
      setError("Please choose an image smaller than 20 MB.");
      return;
    }

    const request = ++requestRef.current;

    if (imageUrlRef.current) {
      URL.revokeObjectURL(imageUrlRef.current);
      imageUrlRef.current = null;
    }

    setError("");
    setReady(false);
    setLoading(true);
    setDragging(false);
    setApplied(false);
    setColors([]);
    setSample("");
    setSelected(0);
    setFilename(file.name);

    const url = URL.createObjectURL(file);
    imageUrlRef.current = url;

    const image = new Image();

    function releaseURL() {
      URL.revokeObjectURL(url);

      if (imageUrlRef.current === url) {
        imageUrlRef.current = null;
      }
    }

    image.onerror = () => {
      releaseURL();

      if (request !== requestRef.current) return;

      setLoading(false);
      setError("This image couldn't be opened. Please try another file.");
    };

    image.onload = () => {
      if (request !== requestRef.current) {
        releaseURL();
        return;
      }

      const width = image.naturalWidth;
      const height = image.naturalHeight;

      if (!width || !height || width * height > MAX_PIXELS) {
        releaseURL();
        setLoading(false);
        setError("This image is too large to process. Try a smaller resolution.");
        return;
      }

      const canvas = canvasRef.current;

      if (!canvas) {
        releaseURL();
        setLoading(false);
        setError("Image processing is unavailable in this browser.");
        return;
      }

      const scale = Math.min(1, 960 / width, 700 / height);

      canvas.width = Math.max(1, Math.round(width * scale));
      canvas.height = Math.max(1, Math.round(height * scale));

      try {
        const ctx = canvas.getContext("2d", {
          willReadFrequently: true,
        });

        if (!ctx) {
          throw new Error("Canvas unavailable");
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

        const extracted = extractPalette(canvas, modeRef.current);

        if (!extracted.length) {
          setError("No visible colors found. Please try another image.");
          setLoading(false);
          return;
        }

        setColors(extracted);
        setPoint({ x: 0.5, y: 0.5 });
        setSelected(0);
        setReady(true);
        setLoading(false);
      } catch {
        setLoading(false);
        setError("Unable to analyze this image. Please try another file.");
      } finally {
        releaseURL();
      }
    };

    image.src = url;
  }

  function changeMode(nextMode: Mode) {
    modeRef.current = nextMode;
    setMode(nextMode);

    const canvas = canvasRef.current;

    if (!ready || !canvas) return;

    try {
      const extracted = extractPalette(canvas, nextMode);

      if (!extracted.length) {
        setError("No visible colors could be extracted.");
        return;
      }

      setColors(extracted);
      setSelected(0);
      setSample("");
      setApplied(false);
      setError("");
      flash(`Switched to ${nextMode} colors.`);
    } catch {
      setError("Unable to extract colors from this image.");
    }
  }

  function onDragEnter(event: DragEvent<HTMLButtonElement>) {
    event.preventDefault();
    dragDepthRef.current++;
    setDragging(true);
  }

  function onDragLeave(event: DragEvent<HTMLButtonElement>) {
    event.preventDefault();

    dragDepthRef.current = Math.max(
      0,
      dragDepthRef.current - 1,
    );

    if (dragDepthRef.current === 0) {
      setDragging(false);
    }
  }

  function onDrop(event: DragEvent<HTMLButtonElement>) {
    event.preventDefault();

    dragDepthRef.current = 0;
    setDragging(false);

    load(event.dataTransfer.files[0]);
  }

  function sampleAt(x: number, y: number) {
    const canvas = canvasRef.current;

    if (!canvas || !ready || !colors.length) return;

    const ctx = canvas.getContext("2d", {
      willReadFrequently: true,
    });

    if (!ctx) return;

    const px = Math.min(
      canvas.width - 1,
      Math.max(0, Math.floor(x * canvas.width)),
    );

    const py = Math.min(
      canvas.height - 1,
      Math.max(0, Math.floor(y * canvas.height)),
    );

    try {
      const data = ctx.getImageData(px, py, 1, 1).data;
      const alpha = data[3] / 255;

      setPoint({ x, y });

      if (alpha < 0.15) {
        flash("That's a transparent pixel. Try another spot.");
        return;
      }

      const values = [0, 1, 2].map((i) =>
        Math.round(data[i] * alpha + 255 * (1 - alpha)),
      );

      const color = hex(values).toUpperCase();

      setSample(color);
      setColors((current) =>
        current.map((item, index) =>
          index === selected ? color : item,
        ),
      );
      setApplied(false);

      flash(`${color} added to color ${selected + 1}.`);
    } catch {
      flash("This pixel could not be sampled.");
    }
  }

  function handleCanvasClick(event: MouseEvent<HTMLCanvasElement>) {
    const rect = event.currentTarget.getBoundingClientRect();

    if (!rect.width || !rect.height) return;

    const x = Math.max(
      0,
      Math.min(1, (event.clientX - rect.left) / rect.width),
    );

    const y = Math.max(
      0,
      Math.min(1, (event.clientY - rect.top) / rect.height),
    );

    sampleAt(x, y);
  }

  function handleCanvasKey(event: KeyboardEvent<HTMLCanvasElement>) {
    const directions: Record<string, [number, number]> = {
      ArrowLeft: [-0.02, 0],
      ArrowRight: [0.02, 0],
      ArrowUp: [0, -0.02],
      ArrowDown: [0, 0.02],
    };

    const direction = directions[event.key];

    if (direction) {
      event.preventDefault();

      setPoint((current) => ({
        x: Math.max(0, Math.min(1, current.x + direction[0])),
        y: Math.max(0, Math.min(1, current.y + direction[1])),
      }));
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      sampleAt(point.x, point.y);
    }
  }

  async function copy(text: string, message: string) {
    try {
      await navigator.clipboard.writeText(text);
      flash(message);
    } catch {
      flash("Clipboard access is unavailable.");
    }
  }

  function exportJSON() {
    if (!colors.length) return;

    const content = JSON.stringify(
      {
        name: "myColors Image Palette",
        source: filename,
        mode,
        colors,
      },
      null,
      2,
    );

    const blob = new Blob([content], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "mycolors-palette.json";

    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1000);

    flash("Palette exported as JSON.");
  }

  function usePalette() {
    if (!colors.length) return;

    const palette = Array.from(
      { length: 5 },
      (_, index) => colors[index % colors.length],
    );

    setPalette(palette);
    setApplied(true);

    flash("Palette applied successfully.");
  }

  return (
    <section className="relative space-y-5">
      {/* File input stays mounted for both upload and replacement */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        className="sr-only"
        onChange={(event) => {
          load(event.currentTarget.files?.[0]);
          event.currentTarget.value = "";
        }}
      />

      {/* Small workspace header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <span className="flex items-center gap-">
            {BRAND_COLORS.map((color) => (
              <span key={color} className="size-2 rounded-full" style={{ backgroundColor: color }} />
            ))}
          </span>

          <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
            Your image. Your colors.
          </span>
        </div>

        {ready && (
          <button
            type="button"
            onClick={openFiles}
            className="inline-flex min-h-10 items-center gap-2 rounded-full bg-soft px-4 text-xs font-semibold text-ink transition-colors hover:bg-ink/10 focus-visible:outline-none focus-visible:bg-ink/15"
          >
            <Icon name="image" size={15} />
            Change image
          </button>
        )}
      </div>

      {/* Full-width drag-and-drop area */}
      {!ready && (
        <button
          type="button"
          aria-label="Choose an image or drag and drop one here"
          aria-busy={loading}
          onClick={() => {
            if (!loading) openFiles();
          }}
          onDragEnter={onDragEnter}
          onDragLeave={onDragLeave}
          onDragOver={(event) => {
            event.preventDefault();
            event.dataTransfer.dropEffect = "copy";
          }}
          onDrop={onDrop}
          className={`group relative border border-dashed border-muted isolate flex min-h-110 w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-[30px] px-5 py-12 text-center transition-colors duration-300 sm:min-h-132.5 sm:px-8 ${dragging ? "bg-[#E7DFFC] dark:bg-[#383049]" : "bg-soft/75 hover:bg-soft"} focus-visible:outline-none focus-visible:bg-[#E7DFFC] dark:focus-visible:bg-[#383049]`}
        >
          {/* Dotted background */}
          <span aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle,currentColor_1px,transparent_1.5px)] bg-size-[22px_22px] text-black/5 dark:text-white/6" />

          {/* Ambient color */}
          <span aria-hidden="true" className="pointer-events-none absolute -left-28 -top-32 -z-10 size-80 rounded-full bg-[#FF795B]/10 blur-3xl" />
          <span aria-hidden="true" className="pointer-events-none absolute -bottom-36 -right-28 -z-10 size-80 rounded-full bg-[#7963CF]/10 blur-3xl" />

          {/* Eyebrow */}
          <span className="mb-7 inline-flex items-center gap-2.5 rounded-full bg-page/80 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-ink">
            <span className="size-2 rounded-full bg-[#FF795B]" />
            Image to colors
          </span>

          <UploadIllustration />

          {/* Headline */}
          <span className="max-w-2xl text-[clamp(2rem,3.6vw,3.4rem)] font-semibold leading-[1.1] tracking-[-0.055em] text-ink">
            {dragging ? (
              "Release to discover."
            ) : (
              <>
                Every image has a{" "}
                <span className="bg-linear-to-r from-[#FF795B] via-[#9AAAF0] to-[#7963CF] bg-clip-text text-transparent">
                  color story.
                </span>
              </>
            )}
          </span>

          {/* Description */}
          <span className="mt-4 max-w-md text-sm leading-[1.75] text-muted">
            {dragging
              ? "Drop your image here and discover its hidden palette."
              : "Drag and drop an image anywhere here, or choose a file to discover its hidden colors."}
          </span>

          {/* Visual button, inside the clickable surface */}
          <span className="mt-7 inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-ink px-6 text-sm font-semibold text-page transition-transform duration-200 group-hover:-translate-y-0.5 motion-reduce:transform-none">
            <Icon name="image" size={18} />

            {loading
              ? "Reading image..."
              : dragging
                ? "Drop image here"
                : "Choose an image"}

          </span>

          {/* Format details */}
          <span className="mt-5 text-[11px] leading-relaxed text-muted">
            JPG, PNG, WebP, GIF, AVIF · Up to 20 MB
          </span>

          <span className="mt-1 text-[10px] text-muted">
            Processed privately in your browser.
          </span>

          {/* Color ribbon */}
          <span aria-hidden="true" className="absolute inset-x-0 bottom-0 flex h-1.5 overflow-hidden">
            {BRAND_COLORS.map((color) => (
              <span key={color} className="flex-1" style={{ backgroundColor: color }} />
            ))}
          </span>
        </button>
      )}

      {/* Results: image left, editable palette right */}
      <div className={ready ? "grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)]" : "hidden"}>
        {/* Image canvas */}
        <div className="relative isolate flex min-w-0 flex-col overflow-hidden rounded-[28px] bg-soft/75 p-4 sm:p-6">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle,currentColor_1px,transparent_1.5px)] bg-size-[22px_22px] text-black/[0.04] dark:text-white/[0.045]" />

          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted">
                The color canvas
              </p>

              <p className="mt-1 max-w-[250px] truncate text-sm font-semibold text-ink" title={filename}>
                {filename}
              </p>
            </div>

            <span className="shrink-0 rounded-full bg-page px-3 py-2 text-[10px] font-medium text-ink">
              Click to sample ↗
            </span>
          </div>

          <div className="flex min-h-[310px] flex-1 items-center justify-center py-6 sm:min-h-[470px]">
            <div className="relative inline-block max-w-full">
              <canvas
                ref={canvasRef}
                role="button"
                tabIndex={ready ? 0 : -1}
                aria-label={`Image color picker. Editing color ${selected + 1}. Use arrow keys to move the sample point and Enter to sample.`}
                onClick={handleCanvasClick}
                onKeyDown={handleCanvasKey}
                className="block max-h-[540px] max-w-full cursor-crosshair rounded-[20px] bg-white object-contain shadow-[0_18px_50px_rgb(0_0_0/0.12)] outline-none focus-visible:shadow-[0_18px_50px_rgb(0_0_0/0.22)]"
              />

              {/* Pixel sample marker */}
              {ready && (
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute grid size-7 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/90 shadow-lg"
                  style={{
                    left: `${point.x * 100}%`,
                    top: `${point.y * 100}%`,
                  }}
                >
                  <span className="size-4 rounded-full" style={{ backgroundColor: sample || colors[selected] || BRAND_COLORS[0] }} />
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-[11px] leading-relaxed text-muted">
              Select a swatch, then click your image to replace it.
            </p>

            {sample && (
              <button
                type="button"
                onClick={() => copy(sample, `${sample} copied.`)}
                className="inline-flex min-h-9 items-center gap-2 rounded-full bg-page px-3 font-mono text-[11px] font-semibold text-ink transition-colors hover:bg-ink/10 focus-visible:outline-none focus-visible:bg-ink/15"
              >
                <span className="size-3 rounded-full" style={{ backgroundColor: sample }} />
                {sample}
                <Icon name="copy" size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Palette editor */}
        <aside className="flex min-w-0 flex-col rounded-[28px] bg-soft/75 p-5 sm:p-7">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted">
                Extracted from your image
              </p>

              <h3 className="mt-2 text-[26px] font-semibold tracking-[-0.055em] text-ink sm:text-[30px]">
                Your palette.
              </h3>
            </div>

            <span className="rounded-full bg-page px-3 py-2 text-[10px] font-semibold text-muted">
              {colors.length} colors
            </span>
          </div>

          {/* Extraction modes */}
          <div role="group" aria-label="Extraction style" className="mt-6 grid grid-cols-2 gap-1 rounded-full bg-page/70 p-1">
            {(["balanced", "vibrant"] as const).map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={mode === value}
                onClick={() => changeMode(value)}
                className={`min-h-10 rounded-full px-3 text-xs font-semibold capitalize transition-colors focus-visible:outline-none ${mode === value ? "bg-ink text-page" : "text-muted hover:bg-soft hover:text-ink"}`}
              >
                {value}
              </button>
            ))}
          </div>

          <p className="mt-3 text-[11px] leading-relaxed text-muted">
            {mode === "balanced"
              ? "Dominant colors with a mix of distinct shades."
              : "Favors more saturated colors found in your image."}
          </p>

          {/* Full palette strip */}
          <div className="mt-6 flex h-17 overflow-hidden rounded-2xl bg-page">
            {colors.map((color, index) => (
              <span key={index} className="flex-1 transition-colors duration-300" style={{ backgroundColor: color }} />
            ))}
          </div>

          {/* Editable individual colors */}
          <div role="group" aria-label="Select a palette color to edit" className="mt-5 space-y-1.5">
            {colors.map((color, index) => (
              <div key={index} className={`flex items-center gap-2 rounded-xl p-1.5 transition-colors ${selected === index ? "bg-page" : "hover:bg-page/60"}`}>
                <button
                  type="button"
                  aria-pressed={selected === index}
                  aria-label={`Edit color ${index + 1}, ${color}`}
                  onClick={() => setSelected(index)}
                  className="flex min-h-12 min-w-0 flex-1 items-center gap-3 rounded-lg text-left focus-visible:outline-none focus-visible:bg-ink/5"
                >
                  <span className="grid size-11 shrink-0 place-items-center rounded-lg" style={{ backgroundColor: color, color: ink(color) }}>
                    {selected === index && (
                      <span className="text-lg font-semibold">+</span>
                    )}
                  </span>

                  <span className="min-w-0">
                    <span className="block font-mono text-xs font-semibold text-ink">
                      {color.toUpperCase()}
                    </span>

                    <span className="mt-0.5 block text-[10px] text-muted">
                      {selected === index
                        ? "Editing this color"
                        : `Color ${String(index + 1).padStart(2, "0")}`}
                    </span>
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => copy(color, `${color} copied.`)}
                  aria-label={`Copy ${color}`}
                  title={`Copy ${color}`}
                  className="grid size-9 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-soft hover:text-ink focus-visible:outline-none focus-visible:bg-soft"
                >
                  <Icon name="copy" size={15} />
                </button>
              </div>
            ))}
          </div>

          {/* Palette actions */}
          <div className="mt-auto pt-7">
            <button
              type="button"
              disabled={!colors.length}
              onClick={usePalette}
              className="group flex min-h-12 w-full items-center justify-center gap-3 rounded-full bg-ink px-5 text-sm font-semibold text-page transition-all hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:opacity-80 disabled:opacity-40 motion-reduce:transform-none"
            >
              {applied ? "✓ Palette applied" : "Use this palette"}

              {!applied && (
                <span className="transition-transform group-hover:translate-x-1">
                  ↗
                </span>
              )}
            </button>

            {applied && (
              <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-ink">
                <Link href="/tools/palette-studio" className="hover:underline">
                  Palette Studio ↗
                </Link>

                <Link href="/tools/theme-studio" className="hover:underline">
                  Theme Studio ↗
                </Link>
              </div>
            )}

            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={!colors.length}
                onClick={() => copy(paletteCSS(colors), "Palette CSS copied.")}
                className="min-h-11 rounded-full bg-page px-3 text-xs font-semibold text-ink transition-colors hover:bg-page/70 focus-visible:outline-none focus-visible:bg-ink/10 disabled:opacity-40"
              >
                Copy CSS
              </button>

              <button
                type="button"
                disabled={!colors.length}
                onClick={exportJSON}
                className="min-h-11 rounded-full bg-page px-3 text-xs font-semibold text-ink transition-colors hover:bg-page/70 focus-visible:outline-none focus-visible:bg-ink/10 disabled:opacity-40"
              >
                Export JSON ↓
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* Error */}
      {error && (
        <p role="alert" className="rounded-xl bg-orange-500/10 px-4 py-3 text-sm text-orange-700 dark:text-orange-300">
          {error}
        </p>
      )}

      {/* Small toast */}
      <div aria-live="polite" aria-atomic="true" className="pointer-events-none fixed inset-x-0 bottom-5 z-50 flex justify-center px-4">
        {notice && (
          <span className="rounded-full bg-ink px-5 py-3 text-xs font-semibold text-page shadow-xl">
            {notice}
          </span>
        )}
      </div>
    </section>
  );
}
