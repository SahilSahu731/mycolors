"use client";
import Link from "next/link";
import { useState } from "react";
import { BrandMark, Icon } from "@/components/ui";
import { ink, contrast } from "@/lib/colors";
export default function ThemePreview({
  palette,
  onSave,
}: {
  palette: string[];
  onSave: () => void;
}) {
  const [previewDark, setPreviewDark] = useState(false);
  const save = onSave;
  const buttonRatio = contrast(palette[4], ink(palette[4]));
  const wcag = (ratio: number) =>
    ratio >= 7 ? "AAA" : ratio >= 4.5 ? "AA" : "Low";
  return (
    <article className="overflow-hidden rounded-2xl border border-line bg-soft px-5 pt-5 md:px-7">
      <div className="flex min-h-8 items-center justify-between gap-4 [&>span]:text-[9px] [&>span]:tracking-widest [&>span]:text-muted">
        <span>01 / BUILD</span>
        <div className="flex gap-1 rounded-full bg-black/5 p-1 [&>button]:flex [&>button]:items-center [&>button]:gap-1 [&>button]:rounded-full [&>button]:px-2 [&>button]:py-1 [&>button]:text-[10px]">
          <button
            aria-pressed={!previewDark}
            className={
              !previewDark
                ? "outline-2 outline-offset-2 outline-violet-400"
                : ""
            }
            onClick={() => setPreviewDark(false)}
          >
            <Icon name="sun" size={14} />
            Light
          </button>
          <button
            aria-pressed={previewDark}
            className={
              previewDark ? "outline-2 outline-offset-2 outline-violet-400" : ""
            }
            onClick={() => setPreviewDark(true)}
          >
            <Icon name="moon" size={14} />
            Dark
          </button>
        </div>
      </div>
      <div
        className={`mx-0 mt-5 overflow-hidden rounded-xl border border-black/10 bg-white text-zinc-800 shadow-lg shadow-black/5 lg:mx-5 ${previewDark ? "bg-zinc-800! text-zinc-100!" : ""}`}
      >
        <div className="flex items-center justify-between border-b border-black/5 px-4 py-3 text-[10px] [&>span:first-child]:flex [&>span:first-child]:items-center [&>span:first-child]:gap-2">
          <span>
            <BrandMark size={24} />
            Your next big thing
          </span>
          <span className="tracking-widest opacity-50">•••</span>
        </div>
        <div className="p-6 [&>h3]:mt-3 [&>h3]:text-2xl [&>h3]:font-medium [&>h3]:tracking-tight [&>p]:mt-2 [&>p]:text-[10px] [&>p]:opacity-60 [&>button]:rounded-md [&>button]:px-3 [&>button]:py-2 [&>button]:text-[10px]">
          <span className="text-[8px] tracking-widest opacity-50">
            MAKE SPACE FOR GOOD IDEAS
          </span>
          <h3>A fresh perspective.</h3>
          <p>Small beginnings. Colorful possibilities.</p>
          <div className="my-5 flex h-20 items-end gap-2 [&>i]:flex-1 [&>i]:rounded-t-md">
            {[48, 70, 55, 86, 68, 100, 82].map((v, i) => (
              <i
                key={i}
                style={{ height: `${v}%`, background: palette[i % 5] }}
              />
            ))}
          </div>
          <button
            style={{ background: palette[4], color: ink(palette[4]) }}
            onClick={() => setPreviewDark(!previewDark)}
          >
            Try {previewDark ? "light" : "dark"} mode
          </button>
          <span className="ml-3 text-[8px] opacity-60">
            {contrast(palette[4], ink(palette[4])).toFixed(1)}:1 button contrast
          </span>
        </div>
      </div>
      <div className="mt-auto flex flex-wrap items-center justify-between gap-4 py-6 [&_h3]:text-sm [&_h3]:font-medium [&_p]:mt-2 [&_p]:text-[10px] [&_p]:text-muted [&>a]:flex [&>a]:items-center [&>a]:gap-2 [&>a]:text-[10px]">
        <div>
          <h3>One palette. A whole personality.</h3>
          <p>Bring your colors to life in light and dark.</p>
        </div>
        <Link href="/tools/theme-studio" onClick={save}>
          Theme Studio <Icon name="theme" size={18} />
        </Link>
      </div>
    </article>
  );
}
