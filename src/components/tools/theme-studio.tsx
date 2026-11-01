"use client";
import { useState } from "react";
import { accessible, contrast, ink, mix } from "@/lib/colors";
import Export from "@/components/tools/shared/export-panel";
export default function Theme({ base }: { base: string }) {
  const [previewDark, setPreviewDark] = useState(false);
  const make = (dark: boolean) => {
    const background = dark
      ? mix(base, "#111410", 0.94)
      : mix(base, "#ffffff", 0.96);
    const surface = dark ? mix(base, "#20241e", 0.9) : "#ffffff";
    const primary = accessible(base, background, 3);
    return {
      background,
      surface,
      foreground: dark ? "#f2f4ed" : "#22281d",
      muted: accessible(dark ? "#91998a" : "#72796d", background),
      primary,
      "primary-foreground": ink(primary),
      border: mix(base, dark ? "#33382f" : "#dce1d7", 0.85),
    };
  };
  const css = [false, true]
    .map(
      (d) =>
        `${d ? '[data-theme="dark"]' : ":root"} {\n${Object.entries(make(d))
          .map(([k, v]) => `  --${k}: ${v};`)
          .join("\n")}\n}`,
    )
    .join("\n\n");
  const tokens = make(previewDark);
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4 [&_h3]:text-sm [&_h3]:font-medium">
        <h3>Live interface preview</h3>
        <div className="flex gap-1 rounded-lg border border-line bg-soft p-1 [&>button]:rounded-md [&>button]:px-3 [&>button]:py-2 [&>button]:text-[11px]">
          <button
            className={!previewDark ? "bg-ink! text-page!" : ""}
            onClick={() => setPreviewDark(false)}
          >
            ☀ Light
          </button>
          <button
            className={previewDark ? "bg-ink! text-page!" : ""}
            onClick={() => setPreviewDark(true)}
          >
            ☾ Dark
          </button>
        </div>
      </div>
      <div
        className="flex min-h-80 overflow-hidden rounded-xl border [&_aside]:hidden md:[&_aside]:block [&_aside]:w-44 [&_aside]:shrink-0 [&_aside]:border-r [&_aside]:p-7 [&_aside]:text-xs [&_aside_b]:mb-8 [&_aside_b]:block [&_aside_b]:text-lg [&_aside_p]:mb-5 [&_aside_p]:opacity-60"
        style={{
          background: tokens.background,
          color: tokens.foreground,
          borderColor: tokens.border,
        }}
      >
        <aside style={{ borderColor: tokens.border }}>
          <b>✳ Studio</b>
          <p>Overview</p>
          <p>Projects</p>
          <p>Collections</p>
        </aside>
        <div className="flex-1 p-6 md:p-9 [&>span]:text-[9px] [&>span]:tracking-widest [&>h2]:my-3 [&>h2]:text-3xl [&>h2]:tracking-tight [&>p]:text-xs">
          <span style={{ color: tokens.muted }}>YOUR CREATIVE SPACE</span>
          <h2>Make room for good ideas.</h2>
          <p style={{ color: tokens.muted }}>
            A considered color system brings everything together.
          </p>
          <div
            className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-lg border p-5 [&_h3]:text-sm [&_p]:mt-2 [&_p]:text-xs [&_button]:rounded-md [&_button]:p-3 [&_button]:text-xs"
            style={{ background: tokens.surface, borderColor: tokens.border }}
          >
            <div>
              <h3>The next chapter</h3>
              <p style={{ color: tokens.muted }}>
                A fresh start, in your colors.
              </p>
            </div>
            <button
              onClick={() => setPreviewDark(!previewDark)}
              style={{
                background: tokens.primary,
                color: tokens["primary-foreground"],
              }}
            >
              Try {previewDark ? "light" : "dark"} mode{" "}
            </button>
          </div>
          <div className="mt-6 flex justify-between gap-4 [&_b]:text-2xl [&_p]:mt-2 [&_p]:text-[10px]">
            {[
              "Colors in harmony",
              "Ready for both modes",
              "Built around your brand",
            ].map((s, i) => (
              <div key={s}>
                <b style={{ color: tokens.primary }}>{["07", "02", "01"][i]}</b>
                <p style={{ color: tokens.muted }}>{s}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-5 [&>div]:flex [&>div]:items-center [&>div]:gap-2 [&_i]:size-7 [&_i]:rounded-md [&_i]:border [&_i]:border-line [&_span]:text-[9px] [&_small]:mt-1 [&_small]:block [&_small]:font-mono [&_small]:text-muted">
        {Object.entries(tokens).map(([name, c]) => (
          <div key={name}>
            <i style={{ background: c }} />
            <span>
              {name}
              <small>{c}</small>
            </span>
          </div>
        ))}
      </div>
      <p className="text-xs leading-7 text-muted">
        Body text: {contrast(tokens.foreground, tokens.background).toFixed(2)}:1
        · Button text:{" "}
        {contrast(tokens.primary, tokens["primary-foreground"]).toFixed(2)}:1
      </p>
      <Export text={css} />
    </>
  );
}
