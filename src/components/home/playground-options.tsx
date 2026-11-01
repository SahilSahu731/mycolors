
"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { Icon, download } from "@/components/ui";
import { ink, paletteCSS } from "@/lib/colors";
import type { PalettePlaygroundState } from "@/hooks/use-palette-playground";

type MenuItem = {
  id: string;
  label: string;
  hint?: string;
  icon?: ReactNode;
  selected?: boolean;
  onSelect: () => void;
};

type MenuProps = {
  label: string;
  trigger: ReactNode;
  items: MenuItem[];
  align?: "left" | "right";
  className?: string;
};

const control = "inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-xl px-2.5 text-xs font-medium transition-colors hover:bg-soft focus-visible:bg-soft focus-visible:outline-none disabled:pointer-events-none disabled:opacity-30 sm:h-10 sm:px-3";

function ToolbarMenu({ label, trigger, items, align = "left", className = "" }: MenuProps) {
  const id = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const selectedIndex = items.findIndex((item) => item.selected);

  useEffect(() => {
    if (!open) return;

    const buttons = menuRef.current?.querySelectorAll<HTMLButtonElement>("button");
    buttons?.[Math.max(0, selectedIndex)]?.focus();
  }, [open, selectedIndex]);

  useEffect(() => {
    if (!open) return;

    const closeOutside = (event: Event) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };

    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("focusin", closeOutside);

    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("focusin", closeOutside);
    };
  }, [open]);

  function choose(item: MenuItem) {
    item.onSelect();
    setOpen(false);
    triggerRef.current?.focus();
  }

  function handleMenuKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
      return;
    }

    const buttons = Array.from(menuRef.current?.querySelectorAll<HTMLButtonElement>("button") ?? []);
    const current = buttons.indexOf(document.activeElement as HTMLButtonElement);

    if (event.key === "ArrowDown") {
      event.preventDefault();
      buttons[(current + 1) % buttons.length]?.focus();
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      buttons[(current - 1 + buttons.length) % buttons.length]?.focus();
    }

    if (event.key === "Home") {
      event.preventDefault();
      buttons[0]?.focus();
    }

    if (event.key === "End") {
      event.preventDefault();
      buttons[buttons.length - 1]?.focus();
    }
  }

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        ref={triggerRef}
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        onClick={() => setOpen((value) => !value)}
        onKeyDown={(event) => {
          if (!open && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
            event.preventDefault();
            setOpen(true);
          }
        }}
        className={`${control} ${open ? "bg-soft" : ""} ${className}`}
      >
        {trigger}
      </button>

      {open && (
        <div
          ref={menuRef}
          id={id}
          role="menu"
          aria-label={label}
          onKeyDown={handleMenuKeyDown}
          className={`absolute top-full z-50 mt-3 w-67.5 max-w-[calc(100vw-28px)] rounded-2xl bg-surface p-1.5 text-ink shadow-[0_18px_65px_rgb(0_0_0/0.18)] ${align === "right" ? "right-0" : "left-0"}`}
        >
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              role={item.selected === undefined ? "menuitem" : "menuitemradio"}
              aria-checked={item.selected}
              onClick={() => choose(item)}
              className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition-colors hover:bg-soft focus-visible:bg-soft focus-visible:outline-none"
            >
              {item.icon && (
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-soft text-ink">
                  {item.icon}
                </span>
              )}

              <span className="min-w-0 flex-1">
                <span className="block text-xs font-semibold">{item.label}</span>
                {item.hint && <span className="mt-0.5 block text-[11px] leading-relaxed text-muted">{item.hint}</span>}
              </span>

              {item.selected && (
                <span className="shrink-0 text-ink">
                  <Icon name="check" size={15} />
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* Small color-theory diagrams */
const HARMONY_DOTS: Record<string, [number, number][]> = {
  Analogous: [[12, 3], [17, 5], [21, 10]],
  Complementary: [[12, 3], [12, 21]],
  Triadic: [[12, 3], [4, 17], [20, 17]],
};

function HarmonyIcon({ kind, size = 20 }: { kind: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity=".25" strokeWidth="1.5" />
      {(HARMONY_DOTS[kind] ?? []).map(([x, y], index) => (
        <circle key={index} cx={x} cy={y} r="3" fill="currentColor" />
      ))}
    </svg>
  );
}

/* Export a real vector image of the entire palette */
function createPaletteSvg(colors: string[]) {
  const safeColors = colors.map((color) => /^#[0-9a-f]{6}$/i.test(color) ? color : "#888888");
  const width = 1000;
  const height = 560;
  const barWidth = width / Math.max(1, safeColors.length);
  const fontSize = Math.min(25, Math.max(12, barWidth / 7));

  const columns = safeColors.map((color, index) => {
    const x = index * barWidth;
    const textColor = ink(color);

    return `
      <rect x="${x}" y="0" width="${barWidth + 0.5}" height="${height}" fill="${color}"/>
      <text x="${x + barWidth / 2}" y="${height - 38}" fill="${textColor}" font-family="Arial, sans-serif" font-weight="700" font-size="${fontSize}" text-anchor="middle">${color.toUpperCase()}</text>
    `;
  }).join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${columns}</svg>`;
}

export default function PlaygroundOptions({
  controller,
  format,
  setFormat,
}: {
  controller: PalettePlaygroundState;
  format: "hex" | "rgb";
  setFormat: (format: "hex" | "rgb") => void;
}) {
  const {
    palette,
    locked,
    setLocked,
    history,
    setHistory,
    setPalette,
    setGeneration,
    setNotice,
    harmonyMode,
    setHarmonyMode,
  } = controller;

  const lockedCount = locked.filter(Boolean).length;
  const canReverse = palette.length - lockedCount > 1;

  function reverse() {
    if (!canReverse) return;

    const unlocked = palette.filter((_, index) => !locked[index]).reverse();
    let cursor = 0;
    const nextPalette = palette.map((color, index) => locked[index] ? color : unlocked[cursor++]);

    setHistory([...history.slice(-19), palette]);
    setPalette(nextPalette);
    setGeneration((value) => value + 1);
    setNotice("Unlocked colors reversed.");
  }

  function unlockAll() {
    if (!lockedCount) return;

    setLocked(locked.map(() => false));
    setNotice("All colors unlocked.");
  }

  async function copyHexValues() {
    try {
      await navigator.clipboard.writeText(palette.map((color) => color.toUpperCase()).join(", "));
      setNotice("Palette HEX values copied.");
    } catch {
      setNotice("Clipboard access is unavailable.");
    }
  }

  const harmonyDetails = {
    Analogous: "Neighboring hues. Soft and cohesive.",
    Complementary: "Opposite hues. Strong and striking.",
    Triadic: "Three evenly spaced hues. Vibrant and balanced.",
  };

  const harmonyItems: MenuItem[] = (["Analogous", "Complementary", "Triadic"] as const).map((mode) => ({
    id: mode,
    label: mode,
    hint: harmonyDetails[mode],
    icon: <HarmonyIcon kind={mode} size={22} />,
    selected: harmonyMode === mode,
    onSelect: () => {
      setHarmonyMode(mode);
      setNotice(`${mode} selected. Generate a new palette to apply it.`);
    },
  }));

  const exportItems: MenuItem[] = [
    {
      id: "svg",
      label: "Download SVG",
      hint: "Scalable palette image for design work.",
      icon: <Icon name="image" size={17} />,
      onSelect: () => {
        download(createPaletteSvg(palette), "palette.svg");
        setNotice("SVG palette downloaded.");
      },
    },
    {
      id: "json",
      label: "Download JSON",
      hint: "Structured color values for your projects.",
      icon: <Icon name="file-json" size={17} />,
      onSelect: () => {
        download(JSON.stringify(palette, null, 2), "palette.json");
        setNotice("JSON palette downloaded.");
      },
    },
    {
      id: "css",
      label: "Download CSS",
      hint: "Ready-to-use CSS color variables.",
      icon: <Icon name="code-2" size={17} />,
      onSelect: () => {
        download(paletteCSS(palette), "palette.css");
        setNotice("CSS palette downloaded.");
      },
    },
    {
      id: "hex",
      label: "Copy HEX values",
      hint: "Copy every color to your clipboard.",
      icon: <Icon name="copy" size={17} />,
      onSelect: () => { void copyHexValues(); },
    },
  ];

  return (
    <div className="mx-auto flex w-full max-w-full items-center justify-between gap-0.5 rounded-2xl bg-surface/90 p-1.5 text-ink shadow-[0_12px_45px_rgb(0_0_0/0.12)] backdrop-blur-2xl sm:w-fit sm:justify-center sm:gap-1.5 md:p-2">
      {/* Harmony */}
      <ToolbarMenu
        label={`Harmony: ${harmonyMode}. Changes the next generated palette.`}
        items={harmonyItems}
        className="bg-soft/80"
        trigger={
          <>
            <HarmonyIcon kind={harmonyMode} size={17} />
            <span className="min-[390px]:hidden">Mode</span>
            <span className="hidden min-[390px]:inline">{harmonyMode}</span>
            <Icon name="chevron-down" size={13} />
          </>
        }
      />

      {/* Format switch */}
      <div role="group" aria-label="Color value format" className="flex shrink-0 items-center gap-0.5 rounded-xl bg-soft/80 p-1">
        {(["hex", "rgb"] as const).map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={format === value}
            onClick={() => setFormat(value)}
            className={`h-7 rounded-lg px-2 text-[10px] font-semibold uppercase transition-all focus-visible:outline-none focus-visible:bg-ink/15 sm:px-2.5 sm:text-[11px] ${format === value ? "bg-ink text-page shadow-sm" : "text-muted hover:text-ink"}`}
          >
            {value}
          </button>
        ))}
      </div>

      {/* Reverse */}
      <button
        type="button"
        onClick={reverse}
        disabled={!canReverse}
        aria-label="Reverse unlocked colors"
        title="Reverse unlocked colors"
        className={`${control} px-2!`}
      >
        <Icon name="arrow-left-right" size={17} />
      </button>

      {/* Unlock all */}
      <button
        type="button"
        onClick={unlockAll}
        disabled={!lockedCount}
        aria-label={`Unlock all colors. ${lockedCount} currently locked.`}
        title={`Unlock all (${lockedCount} locked)`}
        className={`${control} gap-1 px-2!`}
      >
        <Icon name="lock-open" size={17} />
        {lockedCount > 0 && <span className="text-[10px] font-bold tabular-nums">{lockedCount}</span>}
      </button>

      {/* Export */}
      <ToolbarMenu
        label="Export palette"
        items={exportItems}
        align="right"
        className="bg-ink text-page hover:bg-ink/85 hover:text-white focus-visible:bg-ink/85"
        trigger={
          <>
            <Icon name="download" size={16} />
            <span className="hidden md:inline">Export</span>
            {/* <Icon name="chevron-down" size={12} /> */}
          </>
        }
      />
    </div>
  );
}
