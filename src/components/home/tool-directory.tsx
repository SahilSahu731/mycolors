"use client";
import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/ui";
import { toolsList } from "@/config/tools";
export default function ToolDirectory({
  palette,
  onSave,
}: {
  palette: string[];
  onSave: () => void;
}) {
  const [category, setCategory] = useState("All tools");
  const [query, setQuery] = useState("");
  const save = onSave;
  const shown = toolsList.filter(
    (t) =>
      (category === "All tools" || category === t.category) &&
      (t.name + " " + t.description)
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  return (
    <section
      id="tools"
      className="mx-auto w-[calc(100%-36px)] max-w-[1200px] md:w-[calc(100%-64px)] xl:w-[calc(100%-96px)] py-14 md:py-20"
    >
      <div className="mb-7 flex items-end justify-between gap-6 [&_h2]:mt-3 [&_h2]:text-3xl [&_h2]:font-medium [&_h2]:tracking-tight [&>p]:hidden [&>p]:text-xs [&>p]:leading-6 [&>p]:text-muted md:[&>p]:block">
        <div>
          <div className="flex items-center gap-2 text-[9px] font-semibold tracking-[0.15em]">
            THE WHOLE TOOLBOX
          </div>
          <h2>A good tool changes everything.</h2>
        </div>
        <p>
          Less fiddling. More making.
          <br />
          Pick a place to start.
        </p>
      </div>
      <div className="my-7 flex flex-wrap items-center justify-between gap-4 border-b border-line pb-5">
        <div
          className="flex flex-wrap gap-1 [&>button]:flex [&>button]:items-center [&>button]:gap-2 [&>button]:rounded-md [&>button]:px-3 [&>button]:py-2 [&>button]:text-xs [&>button]:text-muted [&_span]:text-[9px]"
          aria-label="Filter tools"
        >
          {["All tools", "Discover", "Create", "Improve", "Play"].map((c) => (
            <button
              key={c}
              className={category === c ? "bg-ink! text-page!" : ""}
              aria-pressed={category === c}
              onClick={() => setCategory(c)}
            >
              {c}
              {c === "All tools" && <span>12</span>}
            </button>
          ))}
        </div>
        <label className="flex w-full items-center gap-2 rounded-lg border border-line px-3 py-2.5 text-muted md:w-64 [&_input]:w-full [&_input]:min-w-0 [&_input]:bg-transparent [&_input]:text-xs [&_input]:outline-none">
          <Icon name="search" size={18} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Find your next favorite tool"
            aria-label="Search tools"
          />
        </label>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
        {shown.map((t, i) => (
          <Link
            key={t.slug}
            className={
              "flex min-h-52 flex-col rounded-xl border border-line bg-surface p-4 transition hover:-translate-y-1 hover:border-violet-300 md:p-6 [&>h3]:text-sm [&>h3]:font-medium md:[&>h3]:text-base [&>p]:mt-2 [&>p]:text-[11px] [&>p]:leading-6 [&>p]:text-muted"
            }
            href={`/tools/${t.slug}`}
            onClick={save}
          >
            <div className="mb-6 flex items-center justify-between">
              <span className="grid size-10 place-items-center rounded-xl bg-violet-100 text-violet-500 dark:bg-violet-400/15 dark:text-violet-300">
                <Icon name={t.icon} size={24} />
              </span>
              <span className="text-[9px] text-muted">{t.category}</span>
            </div>
            <h3>{t.name}</h3>
            <p>{t.description}</p>
            <div className="mt-auto flex items-center justify-between gap-2 pt-6 [&>span]:text-[9px] [&>span]:text-muted">
              <div className="flex [&>i]:-ml-1 [&>i]:size-3.5 [&>i]:rounded-full [&>i]:border-2 [&>i]:border-surface [&>i:first-child]:ml-0">
                {palette.slice(i % 2, (i % 2) + 4).map((c, j) => (
                  <i key={j} style={{ background: c }} />
                ))}
              </div>
              <span>
                Open tool <span>+</span>
              </span>
            </div>
          </Link>
        ))}
      </div>
      {shown.length === 0 && (
        <div className="rounded-xl border border-dashed border-line px-6 py-14 text-center [&_p]:my-5 [&_p]:text-muted">
          <h3>No matches just yet.</h3>
          <p>Try a different search or explore all tools.</p>
          <button
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-line bg-surface px-4 py-2.5 text-xs font-medium text-ink transition hover:bg-soft"
            onClick={() => {
              setQuery("");
              setCategory("All tools");
            }}
          >
            Show all tools
          </button>
        </div>
      )}
    </section>
  );
}
