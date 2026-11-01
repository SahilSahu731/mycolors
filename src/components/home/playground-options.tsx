"use client";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { CopyButton, download } from "@/components/ui";
import { paletteCSS, rgb } from "@/lib/colors";
import type { PalettePlaygroundState } from "@/hooks/use-palette-playground";

const focus =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink";

/* ---------- custom dropdown (replaces native <select>) ---------- */
type Option = { value: string; label: string; hint?: string; icon?: ReactNode };

function Dropdown({
  label,
  value,
  options,
  onChange,
  showLabel = false,
}: {
  label: string;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  showLabel?: boolean;
}) {
  const id = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const selected = Math.max(0, options.findIndex((o) => o.value === value));
  const [active, setActive] = useState(selected);
  const current = options[selected];

  // Close on outside press.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  function openList() {
    setActive(selected);
    setOpen(true);
  }
  function choose(i: number) {
    onChange(options[i].value);
    setOpen(false);
    triggerRef.current?.focus();
  }
  function onKeyDown(e: React.KeyboardEvent) {
    const last = options.length - 1;
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
        e.preventDefault();
        openList();
      }
      return;
    }
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActive((a) => (a >= last ? 0 : a + 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActive((a) => (a <= 0 ? last : a - 1));
        break;
      case "Home":
        e.preventDefault();
        setActive(0);
        break;
      case "End":
        e.preventDefault();
        setActive(last);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        choose(active);
        break;
      case "Escape":
        e.preventDefault();
        setOpen(false);
        break;
      case "Tab":
        setOpen(false);
        break;
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        role="combobox"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        aria-activedescendant={open ? `${id}-opt-${active}` : undefined}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={onKeyDown}
        className={`inline-flex h-9 items-center gap-2 rounded-lg border border-line bg-soft/60 px-3 text-xs font-medium transition-colors hover:bg-soft ${focus}`}
      >
        {showLabel && <span className="hidden text-muted md:inline">{label}</span>}
        {current.icon}
        <span>{current.label}</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          aria-hidden="true"
          className={`transition-transform duration-200 motion-reduce:transition-none ${open ? "rotate-180" : ""}`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <ul
          id={`${id}-list`}
          role="listbox"
          aria-label={label}
          className="absolute top-full left-0 z-30 mt-2 min-w-60 origin-top rounded-xl border border-line bg-surface p-1 text-ink shadow-xl shadow-black/10 transition duration-150 starting:-translate-y-1 starting:opacity-0 motion-reduce:transition-none"
        >
          {options.map((o, i) => (
            <li
              key={o.value}
              id={`${id}-opt-${i}`}
              role="option"
              aria-selected={i === selected}
              onMouseDown={(e) => e.preventDefault()}
              onMouseEnter={() => setActive(i)}
              onClick={() => choose(i)}
              className={`flex cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 ${
                i === active ? "bg-soft" : ""
              }`}
            >
              {o.icon && (
                <span className="grid size-8 shrink-0 place-items-center rounded-md border border-line bg-page">
                  {o.icon}
                </span>
              )}
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-medium">{o.label}</span>
                {o.hint && (
                  <span className="block truncate text-[11px] text-muted">{o.hint}</span>
                )}
              </span>
              {i === selected && (
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  aria-hidden="true"
                >
                  <path d="m5 12 5 5L20 7" />
                </svg>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* tiny diagrams of how each harmony picks colors on the wheel */
const DOTS: Record<string, [number, number][]> = {
  Analogous: [
    [7, 14],
    [12, 9],
    [17, 14],
  ],
  Complementary: [
    [5, 12],
    [19, 12],
  ],
  Triadic: [
    [12, 5],
    [5, 18],
    [19, 18],
  ],
};
const HarmonyIcon = ({ kind }: { kind: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    {(DOTS[kind] ?? []).map(([x, y], i) => (
      <circle key={i} cx={x} cy={y} r="3" />
    ))}
  </svg>
);

/** Palette-wide options float over the swatches. Color editing lives on each swatch. */
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

  function reverse() {
    const unlocked = palette.filter((_, i) => !locked[i]).reverse();
    let next = 0;
    setHistory([...history.slice(-19), palette]);
    setPalette(palette.map((c, i) => (locked[i] ? c : unlocked[next++])));
    setGeneration((value) => value + 1);
    setNotice("Unlocked colors reversed.");
  }

  const harmonyOptions: Option[] = [
    { value: "Analogous", label: "Analogous", hint: "Neighbors on the wheel. Calm and cohesive.", icon: <HarmonyIcon kind="Analogous" /> },
    { value: "Complementary", label: "Complementary", hint: "Opposites. High contrast and energy.", icon: <HarmonyIcon kind="Complementary" /> },
    { value: "Triadic", label: "Triadic", hint: "Three evenly spaced. Bold and balanced.", icon: <HarmonyIcon kind="Triadic" /> },
  ];
  const formatOptions: Option[] = [
    { value: "hex", label: "HEX", hint: palette[0]?.toUpperCase() },
    { value: "rgb", label: "RGB", hint: palette[0] ? `rgb(${rgb(palette[0]).join(", ")})` : undefined },
  ];

  const action = `rounded-lg text-xs font-medium transition-colors hover:bg-soft disabled:pointer-events-none disabled:opacity-40 ${focus}`;

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-white/50 bg-surface/85 p-2.5 text-ink shadow-lg shadow-black/5 backdrop-blur-xl md:gap-3 md:px-4 dark:border-white/10 [&>button]:min-h-9 [&>button]:px-3 [&>button]:py-2 [&>button]:text-xs">
      <Dropdown
        label="Harmony"
        showLabel
        value={harmonyMode}
        options={harmonyOptions}
        onChange={(v) => {
          setHarmonyMode(v);
          setNotice(`${v} harmony selected. Generate a palette to apply it.`);
        }}
      />
      <Dropdown
        label="Format"
        value={format}
        options={formatOptions}
        onChange={(v) => setFormat(v as "hex" | "rgb")}
      />
      <span className="hidden h-5 w-px bg-line md:block" />
      <button className={`${action} min-h-9 px-3 py-2`} onClick={reverse}>
        ⇄ Reverse
      </button>
      <button
        className={`${action} min-h-9 px-3 py-2`}
        disabled={!lockedCount}
        onClick={() => {
          setLocked(Array(5).fill(false));
          setNotice("All colors unlocked.");
        }}
      >
        Unlock all{lockedCount ? ` (${lockedCount})` : ""}
      </button>
      <CopyButton text={paletteCSS(palette)} label="Copy CSS" />
      <button
        className={`${action} min-h-9 px-3 py-2`}
        onClick={() => download(JSON.stringify(palette, null, 2), "mycolors-palette.json")}
      >
        Export JSON ↓
      </button>
    </div>
  );
}