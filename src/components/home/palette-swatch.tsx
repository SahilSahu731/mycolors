"use client";
import { BrandMark, Icon } from "@/components/ui";
import { contrast, ink, rgb } from "@/lib/colors";
import { paletteNames } from "@/config/site";
import type { PalettePlaygroundState } from "@/hooks/use-palette-playground";

/* ---- tiny HSL helpers for the lighter / darker buttons ---- */
const HEX = /^#[0-9a-f]{6}$/i;

function hexToHsl(hex: string): [number, number, number] {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b),
    l = (max + min) / 2;
  let h = 0,
    s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
    h *= 60;
  }
  return [h, s * 100, l * 100];
}

function hslToHex(h: number, s: number, l: number) {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return (
    "#" +
    [f(0), f(8), f(4)].map((x) => Math.round(x * 255).toString(16).padStart(2, "0")).join("")
  );
}

const shade = (hex: string, delta: number) => {
  if (!HEX.test(hex)) return hex;
  const [h, s, l] = hexToHsl(hex);
  return hslToHex(h, s, Math.max(4, Math.min(96, l + delta)));
};

const wcag = (ratio: number) => (ratio >= 7 ? "AAA" : ratio >= 4.5 ? "AA" : "Low");

const chip =
  "grid size-8 place-items-center rounded-full bg-current/10 text-base leading-none transition-colors hover:bg-current/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current";

export default function PaletteSwatch({
  color,
  index,
  controller,
  format = "hex",
}: {
  color: string;
  index: number;
  controller: PalettePlaygroundState;
  format?: "hex" | "rgb";
}) {
  const i = index;
  const { locked, setLocked, change, setNotice, generation } = controller;
  const textColor = ink(color);
  const ratio = contrast(color, textColor);
  const value = format === "rgb" ? rgb(color).join(", ") : color.toUpperCase();

  return (
    <div
      className={`group relative flex min-w-0 flex-[1_1_0%] flex-col px-1.5 pt-36 pb-28 transition-[flex-grow,background-color] duration-300 motion-reduce:transition-none md:px-5 md:pt-28 md:hover:flex-[1.25_1_0%] ${
        locked[i]
          ? "shadow-[inset_0_0_0_2px_color-mix(in_oklab,currentColor_28%,transparent)]"
          : ""
      }`}
      style={{ background: color, color: textColor }}
    >
      {/* top row: number + lock */}
      <div className="flex items-center justify-between text-xs">
        <button
          className={`${chip} ${locked[i] ? "bg-current! text-[var(--swatch-bg)]" : ""}`}
          style={{ "--swatch-bg": color } as React.CSSProperties}
          aria-label={`${locked[i] ? "Unlock" : "Lock"} color ${i + 1}`}
          aria-pressed={locked[i]}
          onClick={() => setLocked(locked.map((v, j) => (j === i ? !v : v)))}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            aria-hidden="true"
          >
            <rect x="5" y="10" width="14" height="11" rx="3" />
            <path d={locked[i] ? "M8 10V7a4 4 0 0 1 8 0v3" : "M8 10V7a4 4 0 0 1 8 0"} />
          </svg>
        </button>
      </div>

      {/* the shape is the color picker */}
      {/* <label
        className="relative grid min-h-28 flex-1 cursor-pointer place-items-center focus-within:outline-2 focus-within:outline-current md:[&>svg]:size-24 [&>:not(input,span)]:transition-transform [&>:not(input,span)]:duration-300 group-hover:[&>:not(input,span)]:scale-110 [&>input]:absolute [&>input]:inset-0 [&>input]:z-10 [&>input]:size-full [&>input]:cursor-pointer [&>input]:opacity-0 [&>svg]:size-12 [&>svg]:fill-current"
        title={`Edit color ${i + 1}`}
      >
        <input
          type="color"
          aria-label={`Edit playground color ${i + 1}`}
          value={color}
          onChange={(e) => change(i, e.target.value)}
        />
        {i === 0 ? (
          <svg viewBox="0 0 100 100" aria-hidden="true">
            <path d="M50 0 60 32 85 15 68 40 100 50 68 60 85 85 60 68 50 100 40 68 15 85 32 60 0 50 32 40 15 15 40 32Z" />
          </svg>
        ) : i === 1 ? (
          <div className="size-10 rounded-full bg-[repeating-radial-gradient(circle,currentColor_0_1px,transparent_2px_5px)] opacity-60 md:size-24" />
        ) : i === 2 ? (
          <div className="grid size-10 -rotate-12 grid-cols-4 opacity-50 md:size-24 [&>i]:bg-current [&>i:nth-child(8n+2)]:bg-transparent [&>i:nth-child(8n+4)]:bg-transparent [&>i:nth-child(8n+5)]:bg-transparent [&>i:nth-child(8n+7)]:bg-transparent">
            {Array.from({ length: 16 }, (_, j) => (
              <i key={j} />
            ))}
          </div>
        ) : i === 3 ? (
          <div className="relative size-10 opacity-60 md:size-24 [&>i]:absolute [&>i]:bottom-0 [&>i]:left-0 [&>i]:size-full [&>i]:rounded-t-full [&>i]:border-4 [&>i]:border-b-0 [&>i]:border-current md:[&>i]:border-8 [&>i:nth-child(2)]:left-[18%] [&>i:nth-child(2)]:h-[80%] [&>i:nth-child(2)]:w-[64%] [&>i:nth-child(3)]:left-[36%] [&>i:nth-child(3)]:h-[60%] [&>i:nth-child(3)]:w-[28%]">
            <i />
            <i />
            <i />
          </div>
        ) : (
          <BrandMark size={105} />
        )}
        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-current/15 px-2.5 py-1 text-[11px] font-medium whitespace-nowrap transition-opacity group-focus-within:opacity-100 md:opacity-0 md:group-hover:opacity-100">
          Edit color
        </span>
      </label> */}

      {/* lighter / darker */}
      <div className="mt-3 flex justify-center gap-1.5 transition-opacity focus-within:opacity-100 md:opacity-0 md:group-hover:opacity-100">
        <button
          className={chip}
          aria-label={`Make color ${i + 1} darker`}
          title="Darker"
          onClick={() => change(i, shade(color, -6))}
        >
          −
        </button>
        <button
          className={chip}
          aria-label={`Make color ${i + 1} lighter`}
          title="Lighter"
          onClick={() => change(i, shade(color, 6))}
        >
          +
        </button>
      </div>

      {/* value, name, contrast */}
      <div className="mt-auto pt-5">
        <button
          className="-mx-1 flex max-w-full items-center gap-2 rounded-md px-1 text-left text-xs leading-tight font-semibold break-all transition-colors hover:bg-current/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current md:text-lg"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(
                format === "rgb" ? `rgb(${rgb(color).join(", ")})` : color,
              );
              setNotice(`${color.toUpperCase()} copied to clipboard.`);
            } catch {
              setNotice("Use the color picker to select and copy this color.");
            }
          }}
          aria-label={`Copy ${color.toUpperCase()}`}
        >
          {value}
          <span className="max-md:hidden">
            <Icon name="copy" size={14} />
          </span>
        </button>
        <span
          className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-current/10 px-2 py-0.5 text-[11px] font-medium"
          title={`Text on this color has ${ratio.toFixed(1)}:1 contrast`}
        >
          Aa
          <span className="max-md:hidden">{ratio.toFixed(1)}:1</span>
          {wcag(ratio)}
        </span>
      </div>
    </div>
  );
}