"use client";
import { useEffect, useState, type CSSProperties } from "react";
import { Icon } from "@/components/ui";
import GravityContainer from "./gravity-container";

const toCssVars = (p: string[]) =>
  `:root {\n${p.map((c, i) => `  --color-${i + 1}: ${c};`).join("\n")}\n}`;

export default function Hero({
  palette,
  onPick,
}: {
  palette: string[];
  onPick: (index: number, color: string) => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState("");

  // One orchestrated entrance, no CSS or config changes needed.
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  async function copy(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
    } catch {
      setCopied("Copy failed. Select the color manually.");
    }
    setTimeout(() => setCopied(""), 1800);
  }

  const reveal = (delay: number) => ({
    className: `transition duration-700 ease-out motion-reduce:transition-none ${
      mounted ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"
    }`,
    style: { transitionDelay: mounted ? `${delay}ms` : "0ms" } as CSSProperties,
  });

  return (
    <section
      className="relative isolate h-[calc(100svh-80px)] min-h-155 w-full overflow-hidden border-b border-line"
      aria-label="Full-screen color playground"
    >
      <div className="absolute inset-0 grid grid-cols-2">
        <GravityContainer palette={palette} side="warm" onPick={onPick} />
        <GravityContainer palette={palette} side="cool" onPick={onPick} />
      </div>

      {/* seam between warm and cool, tinted by the live palette */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-1/2 z-[5] w-0.5 -translate-x-1/2 opacity-70 transition-[background] duration-700"
        style={{
          backgroundImage: `linear-gradient(to bottom, transparent, ${palette[0]}, ${palette[4]}, transparent)`,
        }}
      />

      <div className="pointer-events-none relative z-10 flex h-full flex-col items-center justify-center px-5 pb-28 text-center md:pb-36">
        <p
          {...reveal(0)}
          className={`${reveal(0).className} mb-6 inline-flex items-center gap-2 rounded-full border border-black/5 bg-white/60 px-3.5 py-1.5 text-xs font-medium text-ink backdrop-blur-md dark:border-white/10 dark:bg-black/30 md:text-sm`}
        >
          <span
            className="size-2 animate-pulse rounded-full motion-reduce:animate-none"
            style={{ background: palette[0] }}
          />
          Drag the shapes. Click one to add its color.
        </p>

        <h1 className="max-w-4xl text-[48px] leading-[1.04] font-medium tracking-[-2.8px] sm:text-[72px] lg:text-[94px] lg:tracking-[-5px]">
          <span {...reveal(120)} className={`${reveal(120).className} block`}>
            Life is too short.
          </span>
          <span {...reveal(240)} className={`${reveal(240).className} block`}>
            For{" "}
            <span className="line-through decoration-[0.07em] opacity-40">boring</span>{" "}
            {"Colors.".split("").map((ch, i) => (
              <span
                key={i}
                className="inline-block transition-colors duration-700 [--mix:78%] dark:[--mix:100%]"
                style={
                  {
                    "--c": palette[i % palette.length],
                    color: "color-mix(in oklab, var(--c) var(--mix), black)",
                  } as CSSProperties
                }
              >
                {ch}
              </span>
            ))}
          </span>
        </h1>

        <div {...reveal(380)} className={`${reveal(380).className} mt-8 flex flex-col items-center`}>
          <a
            href="#playground"
            className="pointer-events-auto inline-flex items-center justify-center gap-3 rounded-lg bg-ink px-6 py-3.5 font-medium text-page transition hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink motion-reduce:transform-none"
          >
            <Icon name="palette" size={17} />
            Find your colors
          </a>

          {/* live palette: updates as you pick colors from the shapes */}
          <div className="pointer-events-auto mt-6 flex items-center gap-3 rounded-full border border-black/5 bg-white/60 p-1.5 pr-4 backdrop-blur-md dark:border-white/10 dark:bg-black/30">
            <div className="flex gap-1.5">
              {palette.map((c, i) => (
                <button
                  key={i}
                  onClick={() => copy(c.toUpperCase(), `${c.toUpperCase()} copied`)}
                  aria-label={`Copy color ${i + 1}, ${c.toUpperCase()}`}
                  title={c.toUpperCase()}
                  style={{ background: c }}
                  className="size-9 rounded-full border border-black/10 transition duration-200 hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink motion-reduce:transition-none md:size-11"
                />
              ))}
            </div>
            <button
              onClick={() => copy(toCssVars(palette), "CSS variables copied")}
              className="rounded-md px-1 text-sm font-medium text-ink opacity-80 transition-opacity hover:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            >
              Copy CSS
            </button>
          </div>
          <p role="status" className="mt-2 h-5 text-xs text-muted">
            {copied}
          </p>
        </div>
      </div>
    </section>
  );
}