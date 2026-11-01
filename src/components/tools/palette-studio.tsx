
"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { download } from "@/components/ui";
import { contrast, fromHsl, harmony, ink, paletteCSS } from "@/lib/colors";
import Export from "./shared/export-panel";

type HarmonyMode = "Analogous" | "Complementary" | "Triadic";

type Snapshot = {
  colors: string[];
  locks: boolean[];
};

type EditorDraft = {
  index: number;
  original: string;
  value: string;
};

const FALLBACK = ["#FF795B", "#F6C85F", "#D7E7A9", "#9AAAF0", "#7963CF"];
const HEX = /^#[0-9a-f]{6}$/i;

const HARMONIES: {
  value: HarmonyMode;
  description: string;
  positions: number[];
}[] = [
  {
    value: "Analogous",
    description: "Neighboring hues. Calm, cohesive combinations.",
    positions: [235, 270, 305],
  },
  {
    value: "Complementary",
    description: "Opposite hues. Bold, striking contrast.",
    positions: [0, 180],
  },
  {
    value: "Triadic",
    description: "Three balanced hues. Vibrant and energetic.",
    positions: [0, 120, 240],
  },
];

function normalizeHex(value: string): string | null {
  const raw = value.trim().replace(/^#/, "");

  if (/^[0-9a-f]{3}$/i.test(raw)) {
    return `#${raw.split("").map((char) => char + char).join("")}`.toUpperCase();
  }

  if (/^[0-9a-f]{6}$/i.test(raw)) {
    return `#${raw.toUpperCase()}`;
  }

  return null;
}

function toHsl(value: string) {
  const color = normalizeHex(value) ?? FALLBACK[0];

  const r = parseInt(color.slice(1, 3), 16) / 255;
  const g = parseInt(color.slice(3, 5), 16) / 255;
  const b = parseInt(color.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;
  let s = 0;

  const l = (max + min) / 2;

  if (delta !== 0) {
    s = delta / (1 - Math.abs(2 * l - 1));

    switch (max) {
      case r:
        h = ((g - b) / delta) % 6;
        break;
      case g:
        h = (b - r) / delta + 2;
        break;
      default:
        h = (r - g) / delta + 4;
    }

    h *= 60;
    if (h < 0) h += 360;
  }

  return {
    h: Math.round(h) % 360,
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function HarmonyDiagram({
  positions,
  active,
}: {
  positions: number[];
  active?: boolean;
}) {
  return (
    <svg viewBox="0 0 54 54" fill="none" aria-hidden="true" className="size-12 shrink-0">
      <circle cx="27" cy="27" r="18" stroke="currentColor" strokeWidth="1.4" opacity=".2" />
      <circle cx="27" cy="27" r="3" fill="currentColor" opacity=".2" />

      {positions.map((degree, index) => {
        const radians = (degree * Math.PI) / 180;
        const x = 27 + Math.cos(radians) * 18;
        const y = 27 + Math.sin(radians) * 18;
        const color = ["#FF795B", "#9AAAF0", "#F6C85F"][index];

        return (
          <circle key={degree} cx={x} cy={y} r={active ? 6 : 5} fill={color} />
        );
      })}
    </svg>
  );
}

function LockIcon({ locked }: { locked: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="5" y="10" width="14" height="11" rx="2.5" />
      {locked ? <path d="M8 10V7a4 4 0 0 1 8 0v3" /> : <path d="M8 10V7a4 4 0 0 1 8 0" />}
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="8" y="8" width="12" height="12" rx="2" />
      <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
    </svg>
  );
}

export default function Palette({
  palette,
  setPalette,
}: {
  palette: string[];
  setPalette: (p: string[]) => void;
}) {
  const colors = useMemo(
    () => FALLBACK.map((fallback, index) => normalizeHex(palette[index] ?? "") ?? fallback),
    [palette],
  );

  const [locked, setLocked] = useState<boolean[]>(Array(5).fill(false));
  const [mode, setMode] = useState<HarmonyMode>("Analogous");
  const [menuOpen, setMenuOpen] = useState(false);
  const [selected, setSelected] = useState(0);
  const [editor, setEditor] = useState<EditorDraft | null>(null);
  const [undoStack, setUndoStack] = useState<Snapshot[]>([]);
  const [redoStack, setRedoStack] = useState<Snapshot[]>([]);
  const [notice, setNotice] = useState("");

  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropdownButtonRef = useRef<HTMLButtonElement>(null);
  const menuItemsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const noticeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentHarmony = HARMONIES.find((item) => item.value === mode)!;
  const lockedCount = locked.filter(Boolean).length;

  const draft =
    editor &&
    editor.index === selected &&
    editor.original === colors[selected]
      ? editor.value
      : colors[selected];

  const validDraft = normalizeHex(draft);
  const previewColor = validDraft ?? colors[selected];
  const hsl = toHsl(previewColor);
  const hasChanges = validDraft !== null && validDraft !== colors[selected];

  const displayColors = colors.map((color, index) =>
    index === selected ? previewColor : color,
  );

  const bestContrast = useMemo(() => {
    let best = {
      first: colors[0],
      second: colors[1],
      ratio: contrast(colors[0], colors[1]),
    };

    for (let i = 0; i < colors.length; i++) {
      for (let j = i + 1; j < colors.length; j++) {
        const ratio = contrast(colors[i], colors[j]);

        if (ratio > best.ratio) {
          best = {
            first: colors[i],
            second: colors[j],
            ratio,
          };
        }
      }
    }

    return best;
  }, [colors]);

  const commit = useCallback(
    (nextColors: string[], nextLocks: boolean[] = locked) => {
      const normalized = nextColors.map(
        (color, index) => normalizeHex(color) ?? colors[index],
      );

      const changed =
        normalized.some((color, index) => color !== colors[index]) ||
        nextLocks.some((value, index) => value !== locked[index]);

      if (!changed) return;

      setUndoStack((stack) => [
        ...stack.slice(-49),
        { colors: [...colors], locks: [...locked] },
      ]);

      setRedoStack([]);
      setLocked([...nextLocks]);
      setPalette(normalized);
      setEditor(null);
    },
    [colors, locked, setPalette],
  );

  const generate = useCallback(() => {
    if (locked.every(Boolean)) {
      setNotice("Unlock at least one color to generate a new palette.");
      return;
    }

    const seed = fromHsl(
      Math.random() * 360,
      48 + Math.random() * 36,
      43 + Math.random() * 22,
    );

    const generated = harmony(seed, mode);
    const next = colors.map((color, index) =>
      locked[index]
        ? color
        : generated[index % generated.length] ?? seed,
    );

    commit(next);
  }, [colors, locked, mode, commit]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.code !== "Space" ||
        event.repeat ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        menuOpen
      ) {
        return;
      }

      const target = event.target;

      if (!(target instanceof HTMLElement)) return;

      if (
        target.closest(
          'input, textarea, select, button, a, [contenteditable="true"], [role="menu"]',
        )
      ) {
        return;
      }

      event.preventDefault();
      generate();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [generate, menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;

    const handleOutside = (event: PointerEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        dropdownButtonRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", handleOutside);
    document.addEventListener("keydown", handleEscape);

    menuItemsRef.current[HARMONIES.findIndex((item) => item.value === mode)]?.focus();

    return () => {
      document.removeEventListener("pointerdown", handleOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [menuOpen, mode]);

  useEffect(() => {
    return () => {
      if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
    };
  }, []);

  function flash(message: string) {
    if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);

    setNotice(message);

    noticeTimerRef.current = setTimeout(() => {
      setNotice("");
    }, 2400);
  }

  async function copy(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value);
      flash(`${label} copied.`);
    } catch {
      flash("Clipboard access is unavailable.");
    }
  }

  function changeMode(value: HarmonyMode) {
    setMode(value);
    setMenuOpen(false);
    dropdownButtonRef.current?.focus();
  }

  function handleMenuKeys(event: ReactKeyboardEvent<HTMLDivElement>) {
    const keys = ["ArrowDown", "ArrowUp", "Home", "End"];
    if (!keys.includes(event.key)) return;

    event.preventDefault();

    const current = menuItemsRef.current.findIndex(
      (item) => item === document.activeElement,
    );

    let next = current;

    if (event.key === "Home") next = 0;
    if (event.key === "End") next = HARMONIES.length - 1;
    if (event.key === "ArrowDown") next = (current + 1) % HARMONIES.length;
    if (event.key === "ArrowUp") next = (current - 1 + HARMONIES.length) % HARMONIES.length;

    menuItemsRef.current[next]?.focus();
  }

  function toggleLock(index: number) {
    const next = locked.map((value, i) => i === index ? !value : value);
    commit(colors, next);
    flash(next[index] ? `Color ${index + 1} locked.` : `Color ${index + 1} unlocked.`);
  }

  function undo() {
    const previous = undoStack[undoStack.length - 1];
    if (!previous) return;

    setRedoStack((stack) => [
      ...stack.slice(-49),
      { colors: [...colors], locks: [...locked] },
    ]);

    setUndoStack((stack) => stack.slice(0, -1));
    setPalette([...previous.colors]);
    setLocked([...previous.locks]);
    setEditor(null);
    flash("Undone.");
  }

  function redo() {
    const next = redoStack[redoStack.length - 1];
    if (!next) return;

    setUndoStack((stack) => [
      ...stack.slice(-49),
      { colors: [...colors], locks: [...locked] },
    ]);

    setRedoStack((stack) => stack.slice(0, -1));
    setPalette([...next.colors]);
    setLocked([...next.locks]);
    setEditor(null);
    flash("Redone.");
  }

  function updateDraft(value: string) {
    setEditor({
      index: selected,
      original: colors[selected],
      value,
    });
  }

  function updateHsl(channel: "h" | "s" | "l", value: number) {
    const next = { ...hsl, [channel]: value };

    updateDraft(
      fromHsl(next.h, next.s, next.l).toUpperCase(),
    );
  }

  function applyDraft() {
    if (!validDraft || !hasChanges) return;

    commit(
      colors.map((color, index) =>
        index === selected ? validDraft : color,
      ),
    );

    flash(`Color ${selected + 1} updated.`);
  }

  function moveSelected(direction: -1 | 1) {
    const target = selected + direction;
    if (target < 0 || target >= colors.length) return;

    const nextColors = [...colors];
    const nextLocks = [...locked];

    [nextColors[selected], nextColors[target]] = [nextColors[target], nextColors[selected]];
    [nextLocks[selected], nextLocks[target]] = [nextLocks[target], nextLocks[selected]];

    commit(nextColors, nextLocks);
    setSelected(target);
    flash("Color moved.");
  }

  function reversePalette() {
    commit([...colors].reverse(), [...locked].reverse());
    setSelected(4 - selected);
    flash("Palette reversed.");
  }

  function exportJSON() {
    download(
      JSON.stringify(
        {
          name: "myColors Palette",
          harmony: mode,
          colors,
        },
        null,
        2,
      ),
      "mycolors-palette.json",
    );

    flash("Palette exported.");
  }

  return (
    <div className="space-y-6">
      {/* Compact workspace toolbar */}
      <div className="relative z-30 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Custom harmony dropdown */}
          <div ref={dropdownRef} className="relative">
            <button
              ref={dropdownButtonRef}
              type="button"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-controls="palette-harmony-menu"
              onClick={() => setMenuOpen((value) => !value)}
              className="group flex min-h-13 items-center gap-3 rounded-2xl bg-soft px-3.5 py-2 text-left transition-colors hover:bg-ink/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink sm:px-4"
            >
              <HarmonyDiagram positions={currentHarmony.positions} active />

              <span className="min-w-0">
                <span className="block text-[9px] font-semibold uppercase tracking-[0.14em] text-muted">Color harmony</span>
                <span className="mt-0.5 block text-xs font-semibold text-ink sm:text-sm">{mode}</span>
              </span>

              <span aria-hidden="true" className={`ml-2 text-sm text-muted transition-transform duration-200 ${menuOpen ? "rotate-180" : ""}`}>⌄</span>
            </button>

            {menuOpen && (
              <div id="palette-harmony-menu" role="menu" aria-label="Choose color harmony" onKeyDown={handleMenuKeys} className="absolute left-0 top-[calc(100%+10px)] z-50 w-[min(345px,calc(100vw-32px))] rounded-[22px] bg-page p-2 shadow-[0_18px_65px_rgb(0_0_0/0.18)]">
                <div className="px-3 pb-2 pt-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">Choose a color relationship</p>
                </div>

                {HARMONIES.map((item, index) => (
                  <button
                    key={item.value}
                    ref={(element) => { menuItemsRef.current[index] = element; }}
                    type="button"
                    role="menuitemradio"
                    aria-checked={mode === item.value}
                    onClick={() => changeMode(item.value)}
                    className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-colors focus-visible:outline-none focus-visible:bg-soft ${mode === item.value ? "bg-soft" : "hover:bg-soft/70"}`}
                  >
                    <HarmonyDiagram positions={item.positions} active={mode === item.value} />

                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-ink">{item.value}</span>
                      <span className="mt-1 block text-[11px] leading-relaxed text-muted">{item.description}</span>
                    </span>

                    {mode === item.value && (
                      <span aria-hidden="true" className="grid size-6 shrink-0 place-items-center rounded-full bg-ink text-xs text-page">✓</span>
                    )}
                  </button>
                ))}

                <p className="px-3 pb-3 pt-3 text-[10px] leading-relaxed text-muted">Select a harmony, then generate to apply it to your unlocked colors.</p>
              </div>
            )}
          </div>

          {/* History controls */}
          <div className="flex items-center gap-1 rounded-2xl bg-soft p-1">
            <button type="button" onClick={undo} disabled={!undoStack.length} aria-label="Undo" title="Undo" className="grid size-10 place-items-center rounded-xl text-xl text-ink transition-colors hover:bg-page focus-visible:outline-2 focus-visible:outline-ink disabled:cursor-not-allowed disabled:opacity-25">↶</button>
            <button type="button" onClick={redo} disabled={!redoStack.length} aria-label="Redo" title="Redo" className="grid size-10 place-items-center rounded-xl text-xl text-ink transition-colors hover:bg-page focus-visible:outline-2 focus-visible:outline-ink disabled:cursor-not-allowed disabled:opacity-25">↷</button>
          </div>

          <button type="button" onClick={reversePalette} className="min-h-11 rounded-full px-3 text-xs font-semibold text-muted transition-colors hover:bg-soft hover:text-ink">⇄ Reverse</button>

          {lockedCount > 0 && (
            <button type="button" onClick={() => commit(colors, Array(5).fill(false))} className="min-h-11 rounded-full px-3 text-xs font-semibold text-muted hover:bg-soft hover:text-ink">
              Unlock all ({lockedCount})
            </button>
          )}
        </div>

        <button type="button" onClick={generate} disabled={lockedCount === 5} className="group inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-ink px-6 text-sm font-semibold text-page transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:cursor-not-allowed disabled:opacity-35 motion-reduce:transform-none">
          <span aria-hidden="true" className="text-lg leading-none transition-transform duration-500 group-hover:rotate-180">↻</span>
          Generate
          <kbd className="hidden rounded-md bg-white/15 px-2 py-1 font-mono text-[10px] font-normal lg:inline">Space</kbd>
        </button>
      </div>

      {/* Color Workbench */}
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(335px,0.8fr)]">
        {/* Five horizontal color lanes */}
        <section aria-label="Your five palette colors" className="min-w-0 space-y-2.5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 px-1">
            <div>
              <h2 className="text-sm font-semibold text-ink">Your color lineup</h2>
              <p className="mt-1 text-[11px] text-muted">Select a color to customize it. Lock the shades you want to keep.</p>
            </div>
            <span className="font-mono text-[10px] text-muted">05 SLOTS</span>
          </div>

          {displayColors.map((color, index) => {
            const textColor = ink(color);
            const active = selected === index;

            return (
              <div key={index} className={`group relative flex min-h-[92px] items-stretch gap-2 overflow-hidden rounded-[20px] transition-transform duration-200 sm:min-h-[102px] ${active ? "translate-x-0 sm:translate-x-1" : "hover:translate-x-0.5"}`} style={{ backgroundColor: color, color: textColor }}>
                <button
                  type="button"
                  aria-label={`Edit color ${index + 1}, ${color}`}
                  aria-pressed={active}
                  onClick={() => { setSelected(index); setEditor(null); }}
                  className="flex min-w-0 flex-1 items-center gap-3 px-4 text-left focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-current sm:gap-5 sm:px-6"
                >
                  <span className="font-mono text-xs font-semibold opacity-55 sm:text-sm">{String(index + 1).padStart(2, "0")}</span>

                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-mono text-lg font-semibold tracking-[-0.055em] sm:text-2xl">{color.toUpperCase()}</span>
                    <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.13em] opacity-60">
                      {active ? "Selected for editing" : locked[index] ? "Locked color" : "Click to edit"}
                    </span>
                  </span>

                  {active && (
                    <span className="hidden rounded-full bg-current/10 px-3 py-1.5 text-[10px] font-bold sm:block">Editing ↗</span>
                  )}
                </button>

                <div className="flex shrink-0 items-center gap-1 pr-3 sm:pr-5">
                  <button type="button" onClick={() => copy(colors[index], colors[index])} aria-label={`Copy ${colors[index]}`} title={`Copy ${colors[index]}`} className="grid size-10 place-items-center rounded-full transition-colors hover:bg-current/10 focus-visible:outline-2 focus-visible:outline-current">
                    <CopyIcon />
                  </button>

                  <button type="button" onClick={() => toggleLock(index)} aria-pressed={locked[index]} aria-label={`${locked[index] ? "Unlock" : "Lock"} color ${index + 1}`} title={locked[index] ? "Unlock color" : "Lock color"} className="grid size-10 place-items-center rounded-full transition-colors hover:bg-current/10 focus-visible:outline-2 focus-visible:outline-current">
                    <LockIcon locked={locked[index]} />
                  </button>
                </div>
              </div>
            );
          })}

          <div className="flex flex-wrap items-center justify-between gap-3 px-1 pt-2">
            <p className="text-[11px] text-muted">Locking prevents replacement during generation, not manual editing.</p>
            <button type="button" onClick={() => copy(colors.join(", "), "All HEX values")} className="min-h-9 text-xs font-semibold text-ink transition-opacity hover:opacity-60">Copy all colors ↗</button>
          </div>
        </section>

        {/* Color inspector */}
        <aside aria-label="Color inspector" className="min-w-0 rounded-[26px] bg-soft/75 p-5 sm:p-7">
          <div className="flex items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">Color inspector</span>
              <h2 className="mt-1 text-xl font-semibold tracking-[-0.05em] text-ink">Edit color {String(selected + 1).padStart(2, "0")}</h2>
            </div>

            <span className="rounded-full bg-page px-3 py-2 font-mono text-[10px] font-semibold text-muted">{String(selected + 1).padStart(2, "0")} / 05</span>
          </div>

          {/* Functional color preview */}
          <div className="relative mt-6 flex h-36 items-center justify-between overflow-hidden rounded-[20px] px-6 transition-colors duration-200" style={{ backgroundColor: previewColor, color: ink(previewColor) }}>
            <span className="text-[64px] font-semibold leading-none tracking-[-0.1em]">Aa</span>

            <div className="text-right">
              <p className="font-mono text-sm font-bold">{previewColor}</p>
              <p className="mt-1 text-[10px] font-medium opacity-60">Live preview</p>
            </div>
          </div>

          {/* HEX input and native picker */}
          <div className="mt-6">
            <label htmlFor="palette-editor-hex" className="mb-2 block text-[11px] font-semibold text-muted">HEX color</label>

            <div className="flex items-center gap-2">
              <label className="relative grid size-12 shrink-0 cursor-pointer place-items-center overflow-hidden rounded-xl" style={{ backgroundColor: previewColor }}>
                <input type="color" aria-label="Choose color visually" value={previewColor} onChange={(event) => updateDraft(event.target.value.toUpperCase())} className="absolute inset-0 h-full w-full cursor-pointer opacity-0" />
                <span aria-hidden="true" className="pointer-events-none text-xl font-semibold" style={{ color: ink(previewColor) }}>+</span>
              </label>

              <input id="palette-editor-hex" value={draft} maxLength={7} spellCheck={false} autoComplete="off" aria-invalid={validDraft === null} onChange={(event) => updateDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") applyDraft(); if (event.key === "Escape") setEditor(null); }} className="min-h-12 min-w-0 flex-1 rounded-xl bg-page px-4 font-mono text-sm font-semibold uppercase text-ink outline-none focus-visible:bg-page/80" placeholder="#AABBCC" />

              <button type="button" onClick={() => copy(previewColor, "HEX color")} aria-label="Copy preview color" title="Copy HEX" className="grid size-12 shrink-0 place-items-center rounded-xl bg-page text-ink transition-colors hover:bg-page/60">
                <CopyIcon />
              </button>
            </div>

            {!validDraft && <p className="mt-2 text-[11px] text-orange-600 dark:text-orange-300">Enter a valid 3-digit or 6-digit HEX color.</p>}
          </div>

          {/* HSL controls */}
          <div className="mt-7 space-y-5">
            {([
              {
                key: "h" as const,
                name: "Hue",
                value: hsl.h,
                max: 360,
                suffix: "°",
                gradient: "linear-gradient(to right, #F66, #FFDF72, #83D991, #70CFEF, #9980EB, #F66)",
              },
              {
                key: "s" as const,
                name: "Saturation",
                value: hsl.s,
                max: 100,
                suffix: "%",
                gradient: `linear-gradient(to right, ${fromHsl(hsl.h, 0, hsl.l)}, ${fromHsl(hsl.h, 100, hsl.l)})`,
              },
              {
                key: "l" as const,
                name: "Lightness",
                value: hsl.l,
                max: 100,
                suffix: "%",
                gradient: `linear-gradient(to right, #000000, ${fromHsl(hsl.h, hsl.s, 50)}, #FFFFFF)`,
              },
            ]).map((control) => (
              <label key={control.key} className="block">
                <span className="mb-3 flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-ink">{control.name}</span>
                  <span className="font-mono text-[11px] font-medium tabular-nums text-muted">{control.value}{control.suffix}</span>
                </span>

                <input type="range" min={0} max={control.max} value={control.value} onChange={(event) => updateHsl(control.key, Number(event.target.value))} aria-label={control.name} className="h-3 w-full cursor-pointer rounded-full accent-ink" style={{ background: control.gradient }} />
              </label>
            ))}
          </div>

          {/* Tonal variations */}
          <div className="mt-7">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-xs font-semibold text-ink">Tonal variations</p>
              <span className="text-[10px] text-muted">Click to preview</span>
            </div>

            <div className="flex h-11 gap-1.5">
              {[-24, -12, 0, 12, 24].map((offset) => {
                const value = fromHsl(
                  hsl.h,
                  hsl.s,
                  Math.max(0, Math.min(100, hsl.l + offset)),
                ).toUpperCase();

                return (
                  <button key={offset} type="button" title={`${offset > 0 ? "+" : ""}${offset}% lightness: ${value}`} aria-label={`Preview ${offset > 0 ? "plus" : "minus"} ${Math.abs(offset)} percent lightness`} onClick={() => updateDraft(value)} className="min-w-0 flex-1 rounded-xl transition-transform hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink motion-reduce:transform-none" style={{ backgroundColor: value }} />
                );
              })}
            </div>
          </div>

          {/* Apply or discard */}
          <div className="mt-7 flex items-center gap-2">
            <button type="button" disabled={!hasChanges} onClick={applyDraft} className="min-h-11 flex-1 rounded-full bg-ink px-5 text-xs font-semibold text-page transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-35">
              Apply color ↗
            </button>

            <button type="button" disabled={!editor} onClick={() => setEditor(null)} className="min-h-11 rounded-full px-4 text-xs font-semibold text-muted transition-colors hover:bg-page hover:text-ink disabled:opacity-35">
              Reset
            </button>
          </div>

          {hasChanges && <p className="mt-2 text-center text-[10px] text-muted">Previewing changes. Apply to update the palette.</p>}

          {/* Reordering */}
          <div className="mt-6 flex items-center justify-between gap-3">
            <span className="text-[11px] font-medium text-muted">Change position</span>

            <div className="flex items-center gap-1">
              <button type="button" disabled={selected === 0} onClick={() => moveSelected(-1)} aria-label="Move selected color up" className="grid size-9 place-items-center rounded-full bg-page text-sm text-ink transition-colors hover:bg-ink/10 disabled:opacity-25">↑</button>
              <button type="button" disabled={selected === 4} onClick={() => moveSelected(1)} aria-label="Move selected color down" className="grid size-9 place-items-center rounded-full bg-page text-sm text-ink transition-colors hover:bg-ink/10 disabled:opacity-25">↓</button>
            </div>
          </div>
        </aside>
      </div>

      {/* Contrast utility */}
      <div className="flex flex-col justify-between gap-4 rounded-[22px] bg-soft/65 px-5 py-5 sm:flex-row sm:items-center sm:px-6">
        <div>
          <p className="text-xs font-semibold text-ink">Strongest contrast pair</p>
          <p className="mt-1 text-[11px] leading-relaxed text-muted">
            {bestContrast.ratio >= 4.5
              ? "This combination meets the WCAG AA contrast ratio for normal text."
              : "Your palette has no pair reaching 4.5:1 for normal text."}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <div className="flex min-h-14 items-center gap-3 rounded-xl px-5" style={{ backgroundColor: bestContrast.first, color: bestContrast.second }}>
            <span className="text-2xl font-semibold">Aa</span>
            <span className="font-mono text-[10px] font-semibold">TEXT SAMPLE</span>
          </div>

          <div>
            <p className="font-mono text-lg font-bold tabular-nums text-ink">{bestContrast.ratio.toFixed(2)}:1</p>
            <p className={`text-[10px] font-semibold ${bestContrast.ratio >= 4.5 ? "text-emerald-600 dark:text-emerald-400" : "text-orange-600 dark:text-orange-400"}`}>
              {bestContrast.ratio >= 4.5 ? "AA PASS" : "BELOW AA"}
            </p>
          </div>
        </div>
      </div>

      {/* Export actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        <div>
          <h3 className="text-sm font-semibold text-ink">Ready to use your colors?</h3>
          <p className="mt-1 text-xs text-muted">Export your palette or turn it into an interface theme.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={exportJSON} className="min-h-11 rounded-full bg-soft px-5 text-xs font-semibold text-ink transition-colors hover:bg-ink/10">Download JSON ↓</button>

          <Link href="/tools/theme-studio" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-ink px-5 text-xs font-semibold text-page transition-opacity hover:opacity-80">
            Open Theme Studio ↗
          </Link>
        </div>
      </div>

      <Export text={paletteCSS(colors)} />

      <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
        {notice && <span className="rounded-full bg-ink px-5 py-3 text-xs font-semibold text-page shadow-xl">{notice}</span>}
      </div>
    </div>
  );
}
