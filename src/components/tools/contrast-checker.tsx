"use client";
import { useState } from "react";
import { ColorInput, Icon } from "@/components/ui";
import { accessible, contrast, normalize } from "@/lib/colors";
import Export from "@/components/tools/shared/export-panel";
export default function ContrastTool({ fix = false }: { fix?: boolean }) {
  const [fg, setFg] = useState("#898e77");
  const [bg, setBg] = useState("#f3f4ed");
  const [css, setCss] = useState(
    ".card {\n  color: #898e77;\n  background-color: #f3f4ed;\n}\n\n.button {\n  color: #ffffff;\n  background-color: #a3be88;\n}",
  );
  const [audit, setAudit] = useState<
    | {
        selector: string;
        fg: string;
        bg: string;
      }[]
    | null
  >(null);
  const ratio = contrast(fg, bg);
  const fixed = accessible(fg, bg);
  function analyze() {
    const found = [];
    for (const match of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
      const color = match[2].match(
        /(?:^|;)\s*color\s*:\s*(#[a-f\d]{3,6})\s*(?:;|$)/i,
      );
      const background = match[2].match(
        /(?:^|;)\s*background(?:-color)?\s*:\s*(#[a-f\d]{3,6})\s*(?:;|$)/i,
      );
      if (color && background) {
        const a = normalize(color[1]),
          b = normalize(background[1]);
        if (a && b) found.push({ selector: match[1].trim(), fg: a, bg: b });
      }
    }
    setAudit(found);
  }
  return (
    <>
      {fix && (
        <section className="rounded-[28px] border border-line bg-surface p-5 md:p-7 [&>h3]:mb-4 [&_h3]:text-base [&_h3]:font-medium [&>p]:text-xs [&>p]:leading-7 [&>p]:text-muted [&>label]:mb-4 [&>textarea]:my-5">
          <h3>Check explicit CSS color pairs</h3>
          <p className="text-xs leading-7 text-muted">
            Paste rules with solid HEX text and background colors in the same
            block. Inherited colors, variables, images, alpha and rendered
            layouts need a browser audit.
          </p>
          <textarea
            aria-label="CSS to analyze"
            value={css}
            onChange={(e) => {
              setCss(e.target.value);
              setAudit(null);
            }}
            rows={9}
          />
          <button
            className="inline-flex min-h-11 items-center justify-center gap-3 rounded-lg border border-ink bg-ink px-5 py-3 text-xs font-medium text-page transition hover:-translate-y-0.5 motion-reduce:transform-none disabled:transform-none"
            onClick={analyze}
          >
            Analyze CSS <Icon name="fix" size={18} />
          </button>
          {audit && (
            <div className="mt-6">
              {!audit.length ? (
                <p>
                  No supported pairs found. Add color and background-color as
                  HEX values to the same rule.
                </p>
              ) : (
                audit.map((a, i) => (
                  <div
                    className="flex flex-wrap items-center gap-5 border-t border-line py-3 text-xs [&>code]:mr-auto"
                    key={i}
                  >
                    <code>{a.selector}</code>
                    <span>{contrast(a.fg, a.bg).toFixed(2)}:1</span>
                    <span
                      className={
                        contrast(a.fg, a.bg) >= 4.5
                          ? "text-emerald-700 dark:text-emerald-300"
                          : "text-orange-700 dark:text-orange-300"
                      }
                    >
                      {contrast(a.fg, a.bg) >= 4.5 ? "Pass AA" : "Needs a fix"}
                    </span>
                    <button
                      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-line bg-surface px-4 py-2.5 text-xs font-medium text-ink transition hover:bg-soft"
                      onClick={() => {
                        setFg(a.fg);
                        setBg(a.bg);
                      }}
                    >
                      Inspect pair{" "}
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </section>
      )}
      <div className="grid gap-6 md:grid-cols-[1fr_1.5fr]">
        <section className="rounded-[28px] border border-line bg-surface p-5 md:p-7 [&>h3]:mb-4 [&_h3]:text-base [&_h3]:font-medium [&>p]:text-xs [&>p]:leading-7 [&>p]:text-muted [&>label]:mb-4 [&>textarea]:my-5">
          <h3>Choose your pair</h3>
          <ColorInput label="Text color" value={fg} onChange={setFg} />
          <ColorInput label="Background color" value={bg} onChange={setBg} />
          <button
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-line bg-surface px-4 py-2.5 text-xs font-medium text-ink transition hover:bg-soft"
            onClick={() => {
              setFg(bg);
              setBg(fg);
            }}
          >
            ⇄ Swap colors
          </button>
        </section>
        <div
          className="flex min-h-72 flex-col items-center justify-center rounded-[28px] border border-line p-7 text-center [&>span]:text-[9px] [&>span]:tracking-widest [&>strong]:text-8xl [&>strong]:font-medium [&>strong]:tracking-tighter [&>h3]:text-base [&>p]:mt-3 [&>p]:text-xs"
          style={{ background: bg, color: fg }}
        >
          <span>THE QUICK BROWN FOX</span>
          <strong>Aa</strong>
          <h3>Good design speaks clearly.</h3>
          <p>This is how your normal body text will look.</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-6 rounded-[28px] border border-line bg-surface p-6 md:grid-cols-4 [&>div]:flex [&>div]:flex-col [&>div]:gap-3 [&_span]:text-[10px] [&_span]:text-muted [&_strong]:text-4xl [&_strong]:font-medium [&_small]:text-xl [&_b]:text-sm">
        <div>
          <span>CONTRAST RATIO</span>
          <strong>
            {ratio.toFixed(2)}
            <small>:1</small>
          </strong>
        </div>
        {[
          ["AA normal text", 4.5],
          ["AA large text", 3],
          ["AAA normal text", 7],
        ].map(([s, n]) => (
          <div key={s}>
            <span>{s}</span>
            <b
              className={
                ratio >= Number(n)
                  ? "text-emerald-700 dark:text-emerald-300"
                  : "text-orange-700 dark:text-orange-300"
              }
            >
              {ratio >= Number(n) ? "✓ Pass" : "× Fail"}
            </b>
          </div>
        ))}
      </div>
      {ratio < 4.5 && (
        <div className="flex flex-wrap items-center justify-between gap-5 rounded-[28px] bg-soft p-5 text-xs">
          <span>
            Make text readable with <b>{fixed}</b> (
            {contrast(fixed, bg).toFixed(2)}:1)
          </span>
          <button
            className="inline-flex min-h-11 items-center justify-center gap-3 rounded-lg border border-ink bg-ink px-5 py-3 text-xs font-medium text-page transition hover:-translate-y-0.5 motion-reduce:transform-none disabled:transform-none"
            onClick={() => setFg(fixed)}
          >
            Apply accessible color{" "}
          </button>
        </div>
      )}
      <Export
        text={`.accessible-pair {\n  color: ${fg};\n  background-color: ${bg};\n}`}
      />
    </>
  );
}
