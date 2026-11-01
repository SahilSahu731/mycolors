"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Icon } from "@/components/ui";
import { contrast, ink, rgb } from "@/lib/colors";
import type { PalettePlaygroundState } from "@/hooks/use-palette-playground";

const HEX = /^#[0-9a-f]{6}$/i;

type HSV = { h: number; s: number; v: number };

function hexToHsv(hex: string): HSV {
  if (!HEX.test(hex)) return { h: 0, s: 0, v: 0 };

  const [r, g, b] = [1, 3, 5].map(
    (i) => parseInt(hex.slice(i, i + 2), 16) / 255,
  );
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;

  let h = 0;

  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
  }

  return {
    h: (h * 60 + 360) % 360,
    s: max === 0 ? 0 : (d / max) * 100,
    v: max * 100,
  };
}

function hsvToHex({ h, s, v }: HSV): string {
  const hue = ((h % 360) + 360) % 360;
  const c = (v / 100) * (s / 100);
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = v / 100 - c;

  const sectors = [
    [c, x, 0],
    [x, c, 0],
    [0, c, x],
    [0, x, c],
    [x, 0, c],
    [c, 0, x],
  ];

  const channels = sectors[Math.min(5, Math.floor(hue / 60))];

  return (
    "#" +
    channels
      .map((n) =>
        Math.round((n + m) * 255)
          .toString(16)
          .padStart(2, "0"),
      )
      .join("")
  );
}

function shade(hex: string, amount: number): string {
  if (!HEX.test(hex)) return hex;

  const [r, g, b] = [1, 3, 5].map(
    (i) => parseInt(hex.slice(i, i + 2), 16) / 255,
  );
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    h =
      max === r
        ? ((g - b) / d) % 6
        : max === g
          ? (b - r) / d + 2
          : (r - g) / d + 4;
    h = (h * 60 + 360) % 360;
  }

  const nextL = Math.max(0, Math.min(100, l * 100 + amount));
  return hsvToHex(hslToHsv(h, s * 100, nextL));
}

function hslToHsv(h: number, s: number, l: number): HSV {
  const lightness = l / 100;
  const saturation = s / 100;
  const v = lightness + saturation * Math.min(lightness, 1 - lightness);
  const sv = v === 0 ? 0 : 2 * (1 - lightness / v);

  return { h, s: sv * 100, v: v * 100 };
}

function wcag(ratio: number) {
  if (ratio >= 7) return "AAA";
  if (ratio >= 4.5) return "AA";
  if (ratio >= 3) return "Large";
  return "Low";
}

const controlClass =
  "grid size-8 shrink-0 place-items-center rounded-full bg-current/10 text-base transition-all duration-200 hover:bg-current/20 active:scale-90 focus-visible:outline-none focus-visible:bg-current/25 md:size-9";

/* Five abstract shapes instead of numbers */

function SwatchArtwork({ index }: { index: number }) {
  const shape = index % 5;

  return (
    <svg
      viewBox="0 0 100 100"
      fill="currentColor"
      aria-hidden="true"
      className="size-12 overflow-visible opacity-60 transition-transform duration-500 ease-out group-hover:scale-110 sm:size-16 lg:size-24 motion-reduce:transform-none"
    >
      {/* 1 — Flowing waves */}
      {shape === 0 && (
        <g
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          strokeLinecap="round"
        >
          <path d="M12 22C27 5 38 39 53 22S78 5 88 22" />
          <path d="M12 50C27 33 38 67 53 50S78 33 88 50" opacity=".7" />
          <path d="M12 78C27 61 38 95 53 78S78 61 88 78" opacity=".4" />
        </g>
      )}

      {/* 2 — Interwoven ribbon */}
      {shape === 1 && (
        <g
          fill="none"
          stroke="currentColor"
          strokeWidth="11"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M17 20H64C85 20 85 50 64 50H36C15 50 15 80 36 80H83" />
          <path
            d="M83 20H36C15 20 15 50 36 50H64C85 50 85 80 64 80H17"
            opacity=".45"
          />
        </g>
      )}

      {/* 3 — Checkerboard (unchanged) */}
      {shape === 2 && (
        <>
          <rect x="10" y="10" width="36" height="36" rx="5" />
          <rect x="54" y="10" width="36" height="36" rx="5" opacity=".45" />
          <rect x="10" y="54" width="36" height="36" rx="5" opacity=".45" />
          <rect x="54" y="54" width="36" height="36" rx="5" />
        </>
      )}

      {/* 4 — Organic spiral */}
      {shape === 3 && (
        <path
          d="M76 30C63 12 35 14 24 33C10 57 27 86 55 83C79 80 91 57 77 43C66 31 48 36 43 49C39 60 47 69 57 67"
          fill="none"
          stroke="currentColor"
          strokeWidth="12"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}

      {/* 5 — Overlapping petals (unchanged) */}
      {shape === 4 && (
        <>
          <ellipse
            cx="50"
            cy="50"
            rx="17"
            ry="43"
            transform="rotate(45 50 50)"
          />
          <ellipse
            cx="50"
            cy="50"
            rx="17"
            ry="43"
            transform="rotate(-45 50 50)"
            opacity=".6"
          />
          <circle cx="50" cy="50" r="10" />
        </>
      )}
    </svg>
  );
}

type Props = {
  color: string;
  index: number;
  controller: PalettePlaygroundState;
  format?: "hex" | "rgb";
};

export default function PaletteSwatch({
  color,
  index,
  controller,
  format = "hex",
}: Props) {
  const { locked, setLocked, change, setNotice } = controller;
  const isLocked = Boolean(locked[index]);
  const textColor = ink(color);
  const ratio = contrast(color, textColor);

  const [pickerOpen, setPickerOpen] = useState(false);
  const [draft, setDraft] = useState<HSV>(() => hexToHsv(color));
  const [hexInput, setHexInput] = useState(color.toUpperCase());
  const [position, setPosition] = useState({ top: 12, left: 12 });

  const triggerRef = useRef<HTMLButtonElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  const draftHex = hsvToHex(draft);
  const value = format === "rgb" ? rgb(color).join(", ") : color.toUpperCase();
  const copyValue =
    format === "rgb" ? `rgb(${rgb(color).join(", ")})` : color.toUpperCase();

  function toggleLock() {
    setLocked(locked.map((v, i) => (i === index ? !v : v)));
  }

  function updateDraft(next: HSV) {
    setDraft(next);
    setHexInput(hsvToHex(next).toUpperCase());
  }

  function updatePosition() {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const width = Math.min(320, window.innerWidth - 24);
    const height = pickerRef.current?.offsetHeight || 420;
    const left = Math.max(
      12,
      Math.min(
        rect.left + rect.width / 2 - width / 2,
        window.innerWidth - width - 12,
      ),
    );

    const below = window.innerHeight - rect.bottom;
    const top =
      below >= height + 12
        ? rect.bottom + 10
        : rect.top >= height + 12
          ? rect.top - height - 10
          : Math.max(12, (window.innerHeight - height) / 2);

    setPosition({ top, left });
  }

  function openPicker() {
    setDraft(hexToHsv(color));
    setHexInput(color.toUpperCase());
    setPickerOpen(true);
  }

  function closePicker() {
    setPickerOpen(false);
    triggerRef.current?.focus();
  }

  function applyColor() {
    if (!HEX.test(hexInput)) return;
    const next = hsvToHex(draft);
    if (next.toLowerCase() !== color.toLowerCase()) change(index, next);
    closePicker();
  }

  function updateSaturation(event: React.PointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const s = Math.max(
      0,
      Math.min(100, ((event.clientX - rect.left) / rect.width) * 100),
    );
    const v = Math.max(
      0,
      Math.min(100, (1 - (event.clientY - rect.top) / rect.height) * 100),
    );
    updateDraft({ ...draft, s, v });
  }

  async function copyColor() {
    try {
      await navigator.clipboard.writeText(copyValue);
      setNotice(`${copyValue} copied to clipboard.`);
    } catch {
      setNotice("Could not copy color.");
    }
  }

  useEffect(() => {
    if (!pickerOpen) return;

    updatePosition();

    const reposition = () => updatePosition();
    window.addEventListener("resize", reposition);
    window.addEventListener("scroll", reposition, true);

    return () => {
      window.removeEventListener("resize", reposition);
      window.removeEventListener("scroll", reposition, true);
    };
  }, [pickerOpen]);

  useEffect(() => {
    if (!pickerOpen) return;

    pickerRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        closePicker();
        return;
      }

      if (event.key !== "Tab" || !pickerRef.current) return;

      const elements = Array.from(
        pickerRef.current.querySelectorAll<HTMLElement>(
          'button, input, [tabindex="0"]',
        ),
      ).filter((el) => !el.hasAttribute("disabled"));
      const first = elements[0];
      const last = elements[elements.length - 1];

      if (
        event.shiftKey &&
        (document.activeElement === first ||
          document.activeElement === pickerRef.current)
      ) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [pickerOpen]);

  return (
    <>
      <div
        className="group relative flex min-w-0 flex-[1_1_0%] flex-col items-center bg-transparent px-1.5 pt-36 pb-28 transition-[flex-grow,background-color] duration-300 md:items-stretch md:px-5 md:pt-28 md:hover:flex-[1.15_1_0%] motion-reduce:transition-none"
        style={{ backgroundColor: color, color: textColor }}
      >
        {/* Lock button */}
        <div className="flex w-full justify-center md:justify-start">
          <button
            type="button"
            onClick={toggleLock}
            aria-label={`${isLocked ? "Unlock" : "Lock"} color ${index + 1}`}
            aria-pressed={isLocked}
            title={isLocked ? "Unlock color" : "Lock color"}
            className={`${controlClass} ${isLocked ? "shadow-sm" : ""}`}
            style={isLocked ? { backgroundColor: textColor, color } : undefined}
          >
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="5" y="10" width="14" height="11" rx="2.5" />
              <path
                d={
                  isLocked ? "M8 10V7a4 4 0 0 1 8 0v3" : "M8 10V7a4 4 0 0 1 8 0"
                }
              />
            </svg>
          </button>
        </div>

        {/* Custom picker trigger */}
        <button
          ref={triggerRef}
          type="button"
          onClick={openPicker}
          aria-label={`Edit color ${index + 1}`}
          aria-haspopup="dialog"
          aria-expanded={pickerOpen}
          className="relative flex min-h-24 w-full flex-1 flex-col items-center justify-center gap-5 rounded-xl bg-transparent py-5 transition-colors focus-visible:outline-none md:gap-6"
        >
          <SwatchArtwork index={index} />
          <span className="inline-flex items-center gap-1.5 rounded-full bg-current/10 px-3 py-1.5 text-[10px] font-medium transition-all duration-200 group-hover:bg-current/20 md:text-xs">
            <Icon name="edit-3" size={13} />
            <span className="hidden md:inline">Edit color</span>
          </span>
        </button>

        {/* Lighter and darker */}
        <div className="mt-2 flex flex-col items-center justify-center gap-1.5 transition-opacity duration-200 sm:flex-row md:opacity-0 md:group-hover:opacity-100 md:focus-within:opacity-100">
          <button
            type="button"
            className={controlClass}
            title="Darker"
            aria-label={`Make color ${index + 1} darker`}
            onClick={() => change(index, shade(color, -6))}
          >
            −
          </button>
          <button
            type="button"
            className={controlClass}
            title="Lighter"
            aria-label={`Make color ${index + 1} lighter`}
            onClick={() => change(index, shade(color, 6))}
          >
            +
          </button>
        </div>

        {/* Color information */}
        <div className="mt-auto flex w-full min-w-0 flex-col items-center gap-2.5 pt-5 md:items-start">
          <button
            type="button"
            onClick={copyColor}
            aria-label={`Copy ${copyValue}`}
            title={`Copy ${copyValue}`}
            className="flex max-w-full min-w-0 items-center gap-2 rounded-md px-1 py-1 text-center font-mono text-[10px] font-semibold leading-tight break-all transition-colors hover:bg-current/10 focus-visible:outline-none focus-visible:bg-current/20 sm:text-xs md:text-left lg:text-lg"
          >
            <span>{value}</span>
            <span className="hidden shrink-0 lg:inline-flex">
              <Icon name="copy" size={14} />
            </span>
          </button>

          <span
            className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-current/10 px-2.5 py-1 text-[10px] font-medium whitespace-nowrap"
            title={`Contrast ratio ${ratio.toFixed(2)}:1 with ${textColor}. Large means WCAG AA for large text only.`}
          >
            <span className="font-semibold">Aa</span>
            <span className="opacity-40">·</span>
            <span className="hidden lg:inline">{ratio.toFixed(1)}:1</span>
            <span>{wcag(ratio)}</span>
          </span>
        </div>
      </div>

      {/* Portal keeps the picker outside the clipped playground */}
      {pickerOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-999"
            onPointerDown={(event) => {
              if (event.target === event.currentTarget) closePicker();
            }}
          >
            <div
              ref={pickerRef}
              role="dialog"
              aria-modal="true"
              aria-label={`Edit color ${index + 1}`}
              tabIndex={-1}
              className="fixed w-[min(320px,calc(100vw-24px))] max-h-[calc(100dvh-24px)] overflow-y-auto rounded-3xl bg-surface p-4 text-ink shadow-[0_18px_70px_rgb(0_0_0/0.22)] outline-none"
              style={{ top: position.top, left: position.left }}
            >
              {/* Header */}
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span
                    className="size-7 rounded-lg shadow-sm"
                    style={{ backgroundColor: draftHex }}
                  />
                  <span className="text-sm font-semibold tracking-tight">
                    Edit color
                  </span>
                </div>
                <button
                  type="button"
                  onClick={closePicker}
                  aria-label="Close color picker"
                  className="grid size-8 place-items-center rounded-full bg-soft text-muted transition-colors hover:text-ink focus-visible:outline-none focus-visible:bg-ink/10"
                >
                  <Icon name="x" size={16} />
                </button>
              </div>

              {/* Saturation and brightness */}
              <div
                role="group"
                tabIndex={0}
                aria-label="Color saturation and brightness. Left and right arrows change saturation. Up and down arrows change brightness."
                className="relative h-44 cursor-crosshair touch-none overflow-hidden rounded-2xl outline-none focus-visible:shadow-[0_0_0_3px_rgb(128_128_128/0.3)]"
                style={{
                  background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, hsl(${draft.h} 100% 50%))`,
                }}
                onPointerDown={(event) => {
                  event.currentTarget.setPointerCapture(event.pointerId);
                  updateSaturation(event);
                }}
                onPointerMove={(event) => {
                  if (event.buttons & 1) updateSaturation(event);
                }}
                onPointerUp={(event) => {
                  if (event.currentTarget.hasPointerCapture(event.pointerId))
                    event.currentTarget.releasePointerCapture(event.pointerId);
                }}
                onKeyDown={(event) => {
                  const step = event.shiftKey ? 10 : 1;
                  if (event.key === "ArrowLeft") {
                    event.preventDefault();
                    updateDraft({ ...draft, s: Math.max(0, draft.s - step) });
                  }
                  if (event.key === "ArrowRight") {
                    event.preventDefault();
                    updateDraft({ ...draft, s: Math.min(100, draft.s + step) });
                  }
                  if (event.key === "ArrowUp") {
                    event.preventDefault();
                    updateDraft({ ...draft, v: Math.min(100, draft.v + step) });
                  }
                  if (event.key === "ArrowDown") {
                    event.preventDefault();
                    updateDraft({ ...draft, v: Math.max(0, draft.v - step) });
                  }
                }}
              >
                <span
                  className="pointer-events-none absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_0_3px_rgb(0_0_0/0.25),0_2px_8px_rgb(0_0_0/0.25)]"
                  style={{ left: `${draft.s}%`, top: `${100 - draft.v}%` }}
                />
              </div>

              {/* Hue slider */}
              <div className="mt-4">
                <label
                  htmlFor={`swatch-hue-${index}`}
                  className="mb-2 block text-[11px] font-medium text-muted"
                >
                  Hue
                </label>
                <input
                  id={`swatch-hue-${index}`}
                  type="range"
                  min={0}
                  max={360}
                  step={1}
                  value={draft.h}
                  onChange={(event) =>
                    updateDraft({ ...draft, h: Number(event.target.value) })
                  }
                  className="block h-3 w-full cursor-pointer appearance-none rounded-full outline-none [&::-webkit-slider-thumb]:size-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-[0_1px_6px_rgb(0_0_0/0.35)] [&::-moz-range-thumb]:size-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:bg-white"
                  style={{
                    background:
                      "linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)",
                  }}
                />
              </div>

              {/* HEX input and preview */}
              <div className="mt-5 flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <label
                    htmlFor={`swatch-hex-${index}`}
                    className="mb-1.5 block text-[11px] font-medium text-muted"
                  >
                    HEX
                  </label>
                  <input
                    id={`swatch-hex-${index}`}
                    type="text"
                    value={hexInput}
                    maxLength={7}
                    spellCheck={false}
                    autoComplete="off"
                    onChange={(event) => {
                      const next = event.target.value.toUpperCase();
                      setHexInput(next);
                      if (HEX.test(next)) setDraft(hexToHsv(next));
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && HEX.test(hexInput))
                        applyColor();
                    }}
                    aria-invalid={!HEX.test(hexInput)}
                    className="h-11 w-full rounded-xl bg-soft px-3 font-mono text-sm font-semibold uppercase text-ink outline-none focus-visible:bg-ink/10"
                  />
                </div>
                <div
                  className="mt-5 size-11 shrink-0 rounded-xl shadow-sm"
                  style={{ backgroundColor: draftHex }}
                  aria-label={`Preview ${draftHex}`}
                  role="img"
                />
              </div>

              {/* Actions */}
              <div className="mt-5 flex gap-2">
                <button
                  type="button"
                  onClick={closePicker}
                  className="min-h-11 flex-1 rounded-xl bg-soft px-4 text-xs font-semibold text-ink transition-colors hover:bg-ink/10 focus-visible:outline-none focus-visible:bg-ink/15"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={applyColor}
                  disabled={!HEX.test(hexInput)}
                  className="min-h-11 flex-1 rounded-xl bg-ink px-4 text-xs font-semibold text-page transition-transform hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Apply color
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
