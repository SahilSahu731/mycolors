"use client";

import { useEffect, useRef, useState } from "react";
import { ColorInput } from "@/components/ui";
import { accessible, contrast, normalize } from "@/lib/colors";
import Export from "@/components/tools/shared/export-panel";

type PreviewMode = "editorial" | "interface";
type Target = 4.5 | 7;

type AuditPair = {
  selector: string;
  fg: string;
  bg: string;
  ratio: number;
};

const DEFAULT_CSS = `.card {
  color: #898e77;
  background-color: #f3f4ed;
}

.button {
  color: #ffffff;
  background-color: #a3be88;
}`;

const CRITERIA = [
  { name: "AA · Normal text", minimum: 4.5 },
  { name: "AA · Large text", minimum: 3 },
  { name: "AAA · Normal text", minimum: 7 },
  { name: "AAA · Large text", minimum: 4.5 },
];

function getAccessibleFix(
  change: "text" | "background",
  fg: string,
  bg: string,
  target: number,
): string | null {
  const source = change === "text" ? fg : bg;
  const against = change === "text" ? bg : fg;

  const suggested = normalize(accessible(source, against, target));

  if (suggested && contrast(suggested, against) >= target) {
    return suggested.toUpperCase();
  }

  const extremes = ["#000000", "#FFFFFF"].sort(
    (a, b) => contrast(b, against) - contrast(a, against),
  );

  return contrast(extremes[0], against) >= target ? extremes[0] : null;
}

function analyzeCSS(source: string): AuditPair[] {
  const cleaned = source.replace(/\/\*[\s\S]*?\*\//g, "");
  const found: AuditPair[] = [];

  for (const match of cleaned.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    if (found.length >= 100) break;

    const selector = match[1].trim();
    const declarations = match[2].split(";");

    let fg: string | null = null;
    let bg: string | null = null;

    for (const declaration of declarations) {
      const colon = declaration.indexOf(":");
      if (colon === -1) continue;

      const property = declaration.slice(0, colon).trim().toLowerCase();
      const value = declaration
        .slice(colon + 1)
        .replace(/\s*!important\s*$/i, "")
        .trim();

      const supported = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(value);
      const color = supported ? normalize(value) : null;

      if (property === "color") fg = color;

      if (property === "background" || property === "background-color") {
        bg = color;
      }
    }

    if (fg && bg && selector) {
      found.push({
        selector,
        fg,
        bg,
        ratio: contrast(fg, bg),
      });
    }
  }

  return found;
}

function SwapIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M7 4v16M3 8l4-4 4 4M17 20V4m-4 12 4 4 4-4" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="8" y="8" width="12" height="12" rx="2" />
      <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
    </svg>
  );
}

function LivePreview({
  fg,
  bg,
  mode,
  sampleText,
}: {
  fg: string;
  bg: string;
  mode: PreviewMode;
  sampleText: string;
}) {
  return (
    <div
      className="flex min-h-100 flex-col justify-between overflow-hidden rounded-[26px] p-6 transition-colors duration-200 sm:min-h-120 sm:p-10 lg:min-h-135"
      style={{ backgroundColor: bg, color: fg }}
    >
      {mode === "editorial" ? (
        <>
          <div className="flex items-center justify-between gap-3 text-[10px] font-semibold uppercase tracking-[0.16em]">
            <span>THE TYPE EXPERIMENT</span>
            <span>NO. 001</span>
          </div>

          <div className="my-auto py-12">
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.2em]">
              A study in readability
            </p>

            <h2 className="max-w-175 text-[clamp(2.9rem,5.5vw,6rem)] font-semibold leading-[0.98] tracking-[-0.075em]">
              {sampleText || "Make every word count."}
            </h2>

            <p className="mt-7 max-w-lg text-[15px] leading-[1.9]">
              Color can make a beautiful first impression. But great design goes
              further: every word should be comfortable to read, not just
              beautiful to look at.
            </p>

            <p className="mt-4 max-w-lg text-xs leading-[1.8]">
              This is small text. It can be harder to read when foreground and
              background colors are too similar.
            </p>
          </div>

          <div className="flex items-end justify-between gap-3">
            <span className="font-mono text-[10px]">
              {fg.toUpperCase()} / {bg.toUpperCase()}
            </span>
            <span className="text-[11px] font-semibold">
              Readability matters. ↗
            </span>
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <span className="grid size-8 grid-cols-2 gap-1">
                <span
                  className="rounded-[5px]"
                  style={{ backgroundColor: fg }}
                />
                <span
                  className="rounded-[5px]"
                  style={{ backgroundColor: fg, opacity: 0.55 }}
                />
                <span
                  className="rounded-[5px]"
                  style={{ backgroundColor: fg, opacity: 0.55 }}
                />
                <span
                  className="rounded-[5px]"
                  style={{ backgroundColor: fg }}
                />
              </span>
              <span className="text-lg font-bold tracking-[-0.075em]">
                clarity.
              </span>
            </div>

            <span className="text-xs font-medium">Workspace / 01</span>
          </div>

          <div className="my-auto py-12">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em]">
              Your creative workspace
            </span>

            <h2 className="mt-5 max-w-xl text-[clamp(2.8rem,5vw,5.5rem)] font-semibold leading-none tracking-[-0.07em]">
              {sampleText || "Make every word count."}
            </h2>

            <p className="mt-5 max-w-107.5 text-sm leading-[1.8]">
              A clear interface helps people focus on what matters. Try your
              color pair on headings, body copy, and interactive elements.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <span
                className="inline-flex min-h-11 items-center justify-center gap-3 rounded-full px-5 text-xs font-semibold"
                style={{ backgroundColor: fg, color: bg }}
              >
                Primary action <span aria-hidden="true">↗</span>
              </span>

              <span className="inline-flex min-h-11 items-center justify-center px-4 text-xs font-semibold">
                Secondary action →
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 text-[11px] font-medium">
            <span>Made to be understood.</span>
            <span>UI SAMPLE / 01</span>
          </div>
        </>
      )}
    </div>
  );
}

export default function ContrastTool({ fix = false }: { fix?: boolean }) {
  const [fg, setFg] = useState("#898E77");
  const [bg, setBg] = useState("#F3F4ED");
  const [preview, setPreview] = useState<PreviewMode>("editorial");
  const [sampleText, setSampleText] = useState("Make every word count.");
  const [target, setTarget] = useState<Target>(4.5);

  const [css, setCss] = useState(DEFAULT_CSS);
  const [audit, setAudit] = useState<AuditPair[] | null>(null);
  const [notice, setNotice] = useState("");

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const workspaceRef = useRef<HTMLDivElement>(null);

  const foreground = normalize(fg) ?? "#898E77";
  const background = normalize(bg) ?? "#F3F4ED";

  const ratio = contrast(foreground, background);
  const passesTarget = ratio >= target;

  const textFix = passesTarget
    ? null
    : getAccessibleFix("text", foreground, background, target);

  const backgroundFix = passesTarget
    ? null
    : getAccessibleFix("background", foreground, background, target);

  const status =
    ratio >= 7
      ? "Excellent contrast"
      : ratio >= 4.5
        ? "AA normal text"
        : ratio >= 3
          ? "Large text only"
          : "Needs improvement";

  const cssExport = `.accessible-pair {\n  color: ${foreground};\n  background-color: ${background};\n}`;

  const scoreColor =
    ratio >= 4.5
      ? "bg-emerald-500"
      : ratio >= 3
        ? "bg-amber-500"
        : "bg-rose-500";

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  function flash(message: string) {
    if (timerRef.current) clearTimeout(timerRef.current);

    setNotice(message);
    timerRef.current = setTimeout(() => setNotice(""), 2500);
  }

  function swap() {
    setFg(background);
    setBg(foreground);
  }

  function inspectPair(pair: AuditPair) {
    setFg(pair.fg);
    setBg(pair.bg);
    workspaceRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

    flash(`Inspecting ${pair.selector}`);
  }

  async function copy(text: string, successMessage: string) {
    try {
      await navigator.clipboard.writeText(text);
      flash(successMessage);
    } catch {
      flash("Clipboard access is unavailable.");
    }
  }

  function copyFixedRule(pair: AuditPair) {
    const suggested = getAccessibleFix("text", pair.fg, pair.bg, 4.5);

    if (!suggested) {
      flash("This background needs changing to achieve AA contrast.");
      return;
    }

    const rule = `${pair.selector} {\n  color: ${suggested};\n  background-color: ${pair.bg};\n}`;

    void copy(rule, "Corrected CSS rule copied.");
  }

  return (
    <div ref={workspaceRef} className="scroll-mt-24 space-y-7">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className={`size-2.5 rounded-full ${scoreColor}`} />
            <h2 className="text-sm font-semibold tracking-tight text-ink">
              Live contrast workspace
            </h2>
          </div>
          <p className="mt-1 text-xs text-muted">
            Choose two colors. See how they really read.
          </p>
        </div>

        <div
          role="group"
          aria-label="Preview type"
          className="inline-flex items-center gap-1 rounded-full bg-soft p-1"
        >
          {(
            [
              ["editorial", "Typography"],
              ["interface", "Interface"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              aria-pressed={preview === value}
              onClick={() => setPreview(value)}
              className={`min-h-10 rounded-full px-4 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${preview === value ? "bg-ink text-page" : "text-muted hover:bg-page hover:text-ink"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Main workspace */}
      <div className="grid items-stretch gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)]">
        <LivePreview
          fg={foreground}
          bg={background}
          mode={preview}
          sampleText={sampleText}
        />

        {/* Color inspector */}
        <section
          aria-labelledby="contrast-inspector-title"
          className="flex min-w-0 flex-col rounded-[26px] bg-soft/70 p-5 sm:p-7"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.17em] text-muted">
                Color inspector
              </span>
              <h3
                id="contrast-inspector-title"
                className="mt-2 text-2xl font-semibold tracking-[-0.06em] text-ink"
              >
                Your color pair.
              </h3>
            </div>

            <span className="rounded-full bg-page px-3 py-2 font-mono text-[10px] font-semibold text-muted">
              WCAG 2.2
            </span>
          </div>

          {/* Foreground/background swatches */}
          <div className="mt-6 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
            <div className="min-w-0">
              <div
                className="h-15 rounded-2xl"
                style={{ backgroundColor: foreground }}
              />
              <p className="mt-2 text-[10px] font-semibold text-muted">Text</p>
              <p className="mt-1 truncate font-mono text-[11px] font-semibold text-ink">
                {foreground.toUpperCase()}
              </p>
            </div>

            <button
              type="button"
              onClick={swap}
              aria-label="Swap text and background colors"
              title="Swap colors"
              className="grid size-10 place-items-center rounded-full bg-page text-ink transition-transform duration-200 hover:rotate-180 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink motion-reduce:transform-none"
            >
              <SwapIcon />
            </button>

            <div className="min-w-0">
              <div
                className="h-15 rounded-2xl"
                style={{ backgroundColor: background }}
              />
              <p className="mt-2 text-[10px] font-semibold text-muted">
                Background
              </p>
              <p className="mt-1 truncate font-mono text-[11px] font-semibold text-ink">
                {background.toUpperCase()}
              </p>
            </div>
          </div>

          <div className="mt-7 space-y-5">
            <ColorInput label="Text color" value={fg} onChange={setFg} />
            <ColorInput label="Background color" value={bg} onChange={setBg} />
          </div>

          <label className="mt-6 block">
            <span className="mb-2 block text-[11px] font-semibold text-muted">
              Your preview text
            </span>
            <input
              type="text"
              value={sampleText}
              maxLength={80}
              onChange={(event) => setSampleText(event.target.value)}
              placeholder="Enter something to preview"
              className="min-h-12 w-full rounded-xl bg-page px-4 text-sm text-ink outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            />
          </label>

          {/* Contrast score */}
          <div className="mt-auto pt-8">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
                  Contrast ratio
                </p>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="font-mono text-[clamp(2.8rem,4vw,4rem)] font-semibold leading-none tracking-[-0.08em] tabular-nums text-ink">
                    {ratio.toFixed(2)}
                  </span>
                  <span className="font-mono text-lg text-muted">:1</span>
                </div>
              </div>

              <span
                className={`mb-1 rounded-full px-3 py-2 text-[10px] font-semibold ${ratio >= 4.5 ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : "bg-orange-500/10 text-orange-700 dark:text-orange-300"}`}
              >
                {status}
              </span>
            </div>

            {/* Readability meter, scaled to 7:1 */}
            <div
              aria-hidden="true"
              className="relative mt-5 h-2.5 overflow-hidden rounded-full bg-ink/10"
            >
              <div
                className={`h-full rounded-full transition-[width] duration-300 ${scoreColor}`}
                style={{ width: `${Math.min(100, (ratio / 7) * 100)}%` }}
              />
              <span className="absolute inset-y-0 left-[42.857%] w-px bg-page/80" />
              <span className="absolute inset-y-0 left-[64.286%] w-px bg-page/80" />
            </div>

            <div className="mt-2 flex justify-between font-mono text-[10px] text-muted">
              <span>1:1</span>
              <span>3:1</span>
              <span>4.5:1</span>
              <span>7:1+</span>
            </div>
          </div>
        </section>
      </div>

      {/* Criteria results */}
      <section aria-label="WCAG text contrast results">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold tracking-tight text-ink">
              Accessibility results
            </h3>
            <p className="mt-1 text-xs text-muted">
              See which text contrast thresholds your colors meet.
            </p>
          </div>

          <a
            href="https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-semibold text-muted transition-colors hover:text-ink"
          >
            About WCAG ↗
          </a>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {CRITERIA.map((item) => {
            const pass = ratio >= item.minimum;

            return (
              <div
                key={item.name}
                className="rounded-[20px] bg-soft/65 p-4 sm:p-5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`grid size-7 place-items-center rounded-full text-sm font-semibold ${pass ? "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300" : "bg-orange-500/12 text-orange-700 dark:text-orange-300"}`}
                  >
                    {pass ? "✓" : "×"}
                  </span>
                  <span className="font-mono text-[10px] text-muted">
                    {item.minimum}:1
                  </span>
                </div>

                <p className="mt-5 text-xs font-semibold leading-relaxed text-ink">
                  {item.name}
                </p>
                <p
                  className={`mt-2 text-[11px] font-medium ${pass ? "text-emerald-700 dark:text-emerald-300" : "text-orange-700 dark:text-orange-300"}`}
                >
                  {pass ? "Pass" : "Below threshold"}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Intelligent color correction */}
      <section
        aria-labelledby="contrast-fix-title"
        className="rounded-3xl bg-soft/70 p-5 sm:p-7"
      >
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="size-2 rounded-full bg-[#9AAAF0]" />
              <h3
                id="contrast-fix-title"
                className="text-base font-semibold tracking-tight text-ink"
              >
                Make it readable.
              </h3>
            </div>
            <p className="mt-2 max-w-lg text-xs leading-[1.8] text-muted">
              Keep the color you love. Adjust only the text or the background to
              reach your desired contrast.
            </p>
          </div>

          <div
            role="group"
            aria-label="Contrast correction target"
            className="inline-flex shrink-0 items-center gap-1 rounded-full bg-page p-1"
          >
            {(
              [
                [4.5, "AA · 4.5"],
                [7, "AAA · 7"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                aria-pressed={target === value}
                onClick={() => setTarget(value)}
                className={`min-h-10 rounded-full px-4 text-xs font-semibold transition-colors ${target === value ? "bg-ink text-page" : "text-muted hover:bg-soft hover:text-ink"}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {passesTarget ? (
          <div className="mt-6 flex items-center gap-3 rounded-2xl bg-emerald-500/8 px-4 py-4">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
              ✓
            </span>
            <div>
              <p className="text-sm font-semibold text-ink">
                This pair meets your target.
              </p>
              <p className="mt-1 text-xs text-muted">
                No changes needed for the selected text contrast ratio.
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col justify-between rounded-[20px] bg-page p-4 sm:p-5">
              <div>
                <p className="text-xs font-semibold text-ink">
                  Adjust text color
                </p>
                <p className="mt-1 text-[11px] text-muted">
                  Keep your background unchanged.
                </p>
              </div>

              {textFix ? (
                <>
                  <div className="mt-5 flex items-center gap-3">
                    <span
                      className="grid size-12 place-items-center rounded-xl text-xl font-semibold"
                      style={{ backgroundColor: background, color: textFix }}
                    >
                      Aa
                    </span>
                    <div>
                      <p className="font-mono text-xs font-semibold text-ink">
                        {textFix}
                      </p>
                      <p className="mt-1 font-mono text-[11px] text-muted">
                        {contrast(textFix, background).toFixed(2)}:1
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setFg(textFix);
                      flash("Text color corrected.");
                    }}
                    className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-ink px-5 text-xs font-semibold text-page transition-opacity hover:opacity-80"
                  >
                    Apply text fix ↗
                  </button>
                </>
              ) : (
                <p className="mt-5 text-xs leading-relaxed text-muted">
                  This target isn&apos;t achievable by changing the text alone. Try
                  adjusting the background.
                </p>
              )}
            </div>

            <div className="flex flex-col justify-between rounded-[20px] bg-page p-4 sm:p-5">
              <div>
                <p className="text-xs font-semibold text-ink">
                  Adjust background color
                </p>
                <p className="mt-1 text-[11px] text-muted">
                  Keep your text color unchanged.
                </p>
              </div>

              {backgroundFix ? (
                <>
                  <div className="mt-5 flex items-center gap-3">
                    <span
                      className="grid size-12 place-items-center rounded-xl text-xl font-semibold"
                      style={{
                        backgroundColor: backgroundFix,
                        color: foreground,
                      }}
                    >
                      Aa
                    </span>
                    <div>
                      <p className="font-mono text-xs font-semibold text-ink">
                        {backgroundFix}
                      </p>
                      <p className="mt-1 font-mono text-[11px] text-muted">
                        {contrast(foreground, backgroundFix).toFixed(2)}:1
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setBg(backgroundFix);
                      flash("Background color corrected.");
                    }}
                    className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-ink px-5 text-xs font-semibold text-page transition-opacity hover:opacity-80"
                  >
                    Apply background fix ↗
                  </button>
                </>
              ) : (
                <p className="mt-5 text-xs leading-relaxed text-muted">
                  This target isn&apos;t achievable by changing the background alone.
                  Try adjusting the text.
                </p>
              )}
            </div>
          </div>
        )}
      </section>

      {/* CSS analysis: only when fix=true */}
      {fix && (
        <section aria-labelledby="css-audit-title" className="space-y-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-[#FF795B]" />
                <h3
                  id="css-audit-title"
                  className="text-base font-semibold tracking-tight text-ink"
                >
                  CSS contrast audit
                </h3>
              </div>
              <p className="mt-2 max-w-xl text-xs leading-relaxed text-muted">
                Paste CSS with explicit HEX foreground and background colors in
                the same rule to check each combination.
              </p>
            </div>

            {audit && (
              <span className="rounded-full bg-soft px-4 py-2 text-[11px] font-semibold text-muted">
                {audit.length} pairs found
              </span>
            )}
          </div>

          <div className="rounded-3xl bg-soft/70 p-4 sm:p-6">
            <label
              htmlFor="contrast-css-editor"
              className="mb-3 block text-[10px] font-bold uppercase tracking-[0.14em] text-muted"
            >
              CSS to analyze
            </label>

            <textarea
              id="contrast-css-editor"
              value={css}
              onChange={(event) => {
                setCss(event.target.value);
                setAudit(null);
              }}
              rows={9}
              spellCheck={false}
              className="min-h-50 w-full resize-y rounded-2xl bg-page p-4 font-mono text-xs leading-6 text-ink outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            />

            <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
              <p className="max-w-xl text-[11px] leading-[1.7] text-muted">
                Checks simple solid HEX declarations. Variables, transparency,
                inheritance, images, and computed styles require a browser
                audit.
              </p>

              <button
                type="button"
                onClick={() => setAudit(analyzeCSS(css))}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-ink px-6 text-xs font-semibold text-page transition-opacity hover:opacity-80"
              >
                Analyze CSS <span aria-hidden="true">↗</span>
              </button>
            </div>
          </div>

          {audit && (
            <div aria-live="polite" className="space-y-3">
              {audit.length === 0 ? (
                <div className="rounded-2xl bg-soft/70 px-5 py-6">
                  <p className="text-sm font-semibold text-ink">
                    No supported pairs found.
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-muted">
                    Add both `color` and `background-color` as solid HEX values
                    inside the same CSS rule.
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xs font-semibold text-ink">
                      Found color pairs
                    </p>
                    <p className="text-[11px] text-muted">
                      {audit.filter((item) => item.ratio < 4.5).length} below AA
                      normal-text contrast
                    </p>
                  </div>

                  {audit.map((pair, index) => {
                    const passes = pair.ratio >= 4.5;
                    const suggestion = passes
                      ? null
                      : getAccessibleFix("text", pair.fg, pair.bg, 4.5);

                    return (
                      <div
                        key={`${pair.selector}-${index}`}
                        className="flex flex-col gap-4 rounded-[20px] bg-soft/65 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:p-5"
                      >
                        <div className="flex min-w-0 items-center gap-4">
                          <div
                            className="grid size-13 shrink-0 place-items-center rounded-xl text-xl font-semibold"
                            style={{ backgroundColor: pair.bg, color: pair.fg }}
                          >
                            Aa
                          </div>

                          <div className="min-w-0">
                            <code
                              className="block truncate text-xs font-semibold text-ink"
                              title={pair.selector}
                            >
                              {pair.selector}
                            </code>
                            <p className="mt-1 font-mono text-[10px] text-muted">
                              {pair.fg} on {pair.bg}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                          <div className="mr-2">
                            <p className="font-mono text-sm font-semibold text-ink">
                              {pair.ratio.toFixed(2)}:1
                            </p>
                            <p
                              className={`mt-1 text-[10px] font-semibold ${passes ? "text-emerald-700 dark:text-emerald-300" : "text-orange-700 dark:text-orange-300"}`}
                            >
                              {passes ? "AA pass" : "Needs a fix"}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => inspectPair(pair)}
                            className="min-h-10 rounded-full bg-page px-4 text-[11px] font-semibold text-ink transition-colors hover:bg-page/70"
                          >
                            Inspect
                          </button>

                          {!passes && (
                            <button
                              type="button"
                              disabled={!suggestion}
                              onClick={() => copyFixedRule(pair)}
                              className="inline-flex min-h-10 items-center gap-2 rounded-full bg-ink px-4 text-[11px] font-semibold text-page transition-opacity hover:opacity-80 disabled:opacity-35"
                            >
                              <CopyIcon />
                              Copy fix
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          )}
        </section>
      )}

      {/* Original export component */}
      <Export text={cssExport} />

      {/* Notification */}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4"
      >
        {notice && (
          <span className="rounded-full bg-ink px-5 py-3 text-xs font-semibold text-page shadow-xl">
            {notice}
          </span>
        )}
      </div>
    </div>
  );
}
