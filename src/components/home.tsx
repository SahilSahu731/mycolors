"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { BrandMark, Icon } from "./ui";
import { toolsList, fromHsl, harmony, ink, contrast } from "@/lib/colors";
const launchPalette = ["#ff795b", "#f6c85f", "#d7e7a9", "#9aaaf0", "#7963cf"];
const paletteNames = [
  "Apricot hour",
  "Golden ticket",
  "Fresh perspective",
  "Daydream blue",
  "A little violet",
];
export default function Home() {
  const [palette, setPalette] = useState(launchPalette);
  const [locked, setLocked] = useState<boolean[]>(Array(5).fill(false));
  const [history, setHistory] = useState<string[][]>([]);
  const [category, setCategory] = useState("All tools");
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("");
  const [previewDark, setPreviewDark] = useState(false);
  const [found, setFound] = useState(false);
  const [attempt, setAttempt] = useState(false);
  const [angle, setAngle] = useState(120);
  const [generation, setGeneration] = useState(0);
  const shuffle = useCallback(() => {
    const next = harmony(
      fromHsl(Math.random() * 360, 55 + Math.random() * 25, 64),
      "Analogous",
    );
    setHistory((h) => [...h.slice(-19), palette]);
    setPalette(palette.map((c, i) => (locked[i] ? c : next[i])));
    setGeneration((v) => v + 1);
    setNotice("Fresh colors, fresh possibilities.");
  }, [palette, locked]);
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (e.code === "Space" && e.target === document.body) {
        e.preventDefault();
        shuffle();
      }
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [shuffle]);
  const shown = toolsList.filter(
    (t) =>
      (category === "All tools" || category === t.category) &&
      `${t.name} ${t.description}`.toLowerCase().includes(query.toLowerCase()),
  );
  const save = () =>
    localStorage.setItem("kolivra-palette", JSON.stringify(palette));
  const change = (index: number, color: string) => {
    setHistory((h) => [...h.slice(-19), palette]);
    setPalette(palette.map((c, i) => (i === index ? color : c)));
    setGeneration((v) => v + 1);
  };
  return (
    <main id="main" className="new-home">
      <section className="color-intro container">
        <div className="intro-kicker">
          <span className="status-dot" /> A playground for your creative side
        </div>
        <h1>
          Life’s too short
          <br />
          for{" "}
          <span style={{ color: palette[4] }}>
            boring colors
            <span className="headline-dot" style={{ background: palette[0] }} />
          </span>
        </h1>
        <p>
          Find your palette. Build something beautiful. Have a little fun.
          <br />
          Your favorite color tools, all in one happy place.
        </p>
        <div className="intro-actions">
          <a className="button" href="#playground">
            <Icon name="palette" size={18} />
            Make some colors
          </a>
          <a href="#tools" className="intro-secondary">
            Explore all 12 tools <span>↓</span>
          </a>
        </div>
        <div
          className="intro-orbit orbit-one"
          style={{ background: palette[0] }}
        />
        <div
          className="intro-orbit orbit-two"
          style={{ background: palette[2] }}
        />
        <div className="intro-doodle" aria-hidden="true">
          <svg viewBox="0 0 100 100">
            <path d="M25 66C-5 25 80 0 74 46S4 90 35 53s58-3 39 27" />
          </svg>
        </div>
      </section>
      <section
        id="playground"
        className="live-palette container"
        aria-label="Interactive palette playground"
      >
        <div className="playground-heading">
          <div>
            <span className="live-badge">
              <i />
              LIVE PLAYGROUND
            </span>
            <span className="playground-hint">Go on. Make it yours.</span>
          </div>
          <span className="keyboard-tip">
            Press <kbd>space</kbd> for a fresh palette
          </span>
        </div>
        <div className="big-swatches">
          {palette.map((color, i) => (
            <div
              className="big-swatch"
              style={{ background: color, color: ink(color) }}
              key={i}
            >
              <div className="swatch-toolbar">
                <span>0{i + 1}</span>
                <button
                  className={locked[i] ? "is-locked" : ""}
                  aria-label={`${locked[i] ? "Unlock" : "Lock"} color ${i + 1}`}
                  aria-pressed={locked[i]}
                  onClick={() =>
                    setLocked(locked.map((v, j) => (j === i ? !v : v)))
                  }
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  >
                    <rect x="5" y="10" width="14" height="11" rx="3" />
                    <path
                      d={
                        locked[i]
                          ? "M8 10V7a4 4 0 0 1 8 0v3"
                          : "M8 10V7a4 4 0 0 1 8 0"
                      }
                    />
                  </svg>
                </button>
              </div>
              <label
                className={`color-sculpture sculpture-${i}`}
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
                  <div className="sculpture-disc" />
                ) : i === 2 ? (
                  <div className="sculpture-checker">
                    {Array.from({ length: 16 }, (_, j) => (
                      <i key={j} />
                    ))}
                  </div>
                ) : i === 3 ? (
                  <div className="sculpture-arches">
                    <i />
                    <i />
                    <i />
                  </div>
                ) : (
                  <BrandMark size={105} />
                )}
                <span className="edit-chip">Edit color</span>
              </label>
              <div className="swatch-caption">
                <button
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(color);
                      setNotice(`${color.toUpperCase()} copied to clipboard.`);
                    } catch {
                      setNotice(
                        "Use the color picker to select and copy this color.",
                      );
                    }
                  }}
                >
                  {color.toUpperCase()} <Icon name="copy" size={13} />
                </button>
                <span>
                  {generation === 0 ? paletteNames[i] : `Your color ${i + 1}`}
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="playground-footer">
          <div className="playground-buttons">
            <button className="button shuffle-button" onClick={shuffle}>
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
              >
                <path d="M4 7h3c5 0 5 10 10 10h3M4 17h3c2 0 3-2 4-4m2-2c1-2 2-4 4-4h3M17 4l3 3-3 3m0 4 3 3-3 3" />
              </svg>
              Shuffle palette
            </button>
            <button
              className="undo-button"
              disabled={!history.length}
              aria-label="Undo palette change"
              onClick={() => {
                setPalette(history[history.length - 1]);
                setHistory(history.slice(0, -1));
                setGeneration((v) => v + 1);
                setNotice("Previous palette restored.");
              }}
            >
              ↶
            </button>
            <span className="palette-status" role="status">
              {notice || "Click a shape to edit. Lock a color to keep it."}
            </span>
          </div>
          <Link
            href="/tools/palette-studio"
            onClick={save}
            className="use-palette"
          >
            Take it to the studio <Icon name="palette" size={17} />
          </Link>
        </div>
      </section>
      <div className="home-reassurance container">
        <span>
          <i />
          No sign-up. No paywall. Just color.
        </span>
        <span>Made for designers, developers & curious minds.</span>
      </div>
      <section className="possibility-section container">
        <div className="new-section-heading">
          <div>
            <div className="eyebrow">A LITTLE INSPIRATION</div>
            <h2>See what your colors can do.</h2>
          </div>
          <p>
            Your palette isn’t just a row of swatches.
            <br />
            It’s the start of something.
          </p>
        </div>
        <div className="feature-bento">
          <article className="theme-feature">
            <div className="feature-top">
              <span>01 / BUILD</span>
              <div className="feature-toggle">
                <button
                  aria-pressed={!previewDark}
                  className={!previewDark ? "selected" : ""}
                  onClick={() => setPreviewDark(false)}
                >
                  <Icon name="sun" size={14} />
                  Light
                </button>
                <button
                  aria-pressed={previewDark}
                  className={previewDark ? "selected" : ""}
                  onClick={() => setPreviewDark(true)}
                >
                  <Icon name="moon" size={14} />
                  Dark
                </button>
              </div>
            </div>
            <div className={`landing-ui ${previewDark ? "preview-dark" : ""}`}>
              <div className="landing-ui-nav">
                <span>
                  <BrandMark size={24} />
                  Your next big thing
                </span>
                <span className="mock-dots">•••</span>
              </div>
              <div className="landing-ui-body">
                <span className="mock-overline">MAKE SPACE FOR GOOD IDEAS</span>
                <h3>A fresh perspective.</h3>
                <p>Small beginnings. Colorful possibilities.</p>
                <div className="mock-chart">
                  {[48, 70, 55, 86, 68, 100, 82].map((v, i) => (
                    <i
                      key={i}
                      style={{ height: `${v}%`, background: palette[i % 5] }}
                    />
                  ))}
                </div>
                <button
                  style={{ background: palette[4], color: ink(palette[4]) }}
                  onClick={() => setPreviewDark(!previewDark)}
                >
                  Try {previewDark ? "light" : "dark"} mode
                </button>
                <span className="mock-contrast">
                  {contrast(palette[4], ink(palette[4])).toFixed(1)}:1 button
                  contrast
                </span>
              </div>
            </div>
            <div className="feature-bottom">
              <div>
                <h3>One palette. A whole personality.</h3>
                <p>Bring your colors to life in light and dark.</p>
              </div>
              <Link href="/tools/theme-studio" onClick={save}>
                Theme Studio <Icon name="theme" size={18} />
              </Link>
            </div>
          </article>
          <article className="gradient-feature">
            <div className="feature-top">
              <span>02 / EXPERIMENT</span>
              <Icon name="gradient" size={20} />
            </div>
            <div
              className="gradient-orb"
              style={{
                background: `linear-gradient(${angle}deg, ${palette[0]}, ${palette[3]} 55%, ${palette[4]})`,
              }}
            />
            <div className="gradient-slider">
              <label htmlFor="home-gradient">
                A different angle <span>{angle}°</span>
              </label>
              <input
                id="home-gradient"
                type="range"
                min="0"
                max="360"
                value={angle}
                onChange={(e) => setAngle(+e.target.value)}
              />
            </div>
            <div className="feature-bottom">
              <div>
                <h3>Go with the flow.</h3>
                <p>Good things happen in between.</p>
              </div>
              <Link href="/tools/gradient-lab" onClick={save}>
                Gradient Lab <Icon name="gradient" size={18} />
              </Link>
            </div>
          </article>
        </div>
      </section>
      <section id="tools" className="container new-tools-section">
        <div className="new-section-heading">
          <div>
            <div className="eyebrow">THE WHOLE TOOLBOX</div>
            <h2>A good tool changes everything.</h2>
          </div>
          <p>
            Less fiddling. More making.
            <br />
            Pick a place to start.
          </p>
        </div>
        <div className="filter-row">
          <div className="tabs" aria-label="Filter tools">
            {["All tools", "Discover", "Create", "Improve", "Play"].map((c) => (
              <button
                key={c}
                className={category === c ? "active" : ""}
                aria-pressed={category === c}
                onClick={() => setCategory(c)}
              >
                {c}
                {c === "All tools" && <span>12</span>}
              </button>
            ))}
          </div>
          <label className="search">
            <Icon name="search" size={18} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Find your next favorite tool"
              aria-label="Search tools"
            />
          </label>
        </div>
        <div className="new-tool-grid">
          {shown.map((t, i) => (
            <Link
              key={t.slug}
              className={`new-tool-card tool-family-${t.category.toLowerCase()}`}
              href={`/tools/${t.slug}`}
              onClick={save}
            >
              <div className="new-tool-top">
                <span className="new-tool-symbol">
                  <Icon name={t.icon} size={24} />
                </span>
                <span className="tool-category">{t.category}</span>
              </div>
              <h3>{t.name}</h3>
              <p>{t.description}</p>
              <div className="tool-card-foot">
                <div className="tiny-palette">
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
          <div className="empty-state">
            <h3>No matches just yet.</h3>
            <p>Try a different search or explore all tools.</p>
            <button
              className="button secondary"
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
      <section className="container play-section">
        <div className="play-copy">
          <span className="play-pill">
            <Icon name="game" size={16} /> A LITTLE LESS WORK, A LITTLE MORE
            PLAY
          </span>
          <h2>
            Got an eye
            <br />
            for color?
          </h2>
          <p>
            One of these colors doesn’t quite belong.
            <br />
            Find the odd one out. We’ll wait.
          </p>
          <div className="play-feedback" aria-live="polite">
            {found
              ? "You found it. That’s a good eye."
              : attempt
                ? "Close! Look for the slightly lighter tile."
                : "A tiny warm-up for your creative brain."}
          </div>
          <Link href="/tools/daily-color" className="button">
            Try the daily challenge <Icon name="game" size={18} />
          </Link>
        </div>
        <div className="mini-game">
          <div className="mini-game-label">
            <span>SPOT THE DIFFERENCE</span>
            <span>{found ? "COMPLETE" : "01 / 01"}</span>
          </div>
          <div className="odd-grid">
            {Array.from({ length: 9 }, (_, i) => (
              <button
                key={i}
                aria-label={`Choose tile ${i + 1}`}
                style={{ background: i === 5 ? "#b29bd5" : "#a68acb" }}
                className={found && i === 5 ? "correct-tile" : ""}
                onClick={() => {
                  if (i === 5) setFound(true);
                  else setAttempt(true);
                }}
              >
                {found && i === 5 ? "✓" : ""}
              </button>
            ))}
          </div>
          <div className="game-bottom">
            <span>
              {found ? "Nicely spotted." : "Same, same… but different."}
            </span>
            <span>myColors / play</span>
          </div>
        </div>
      </section>
      <section className="closing-section container">
        <BrandMark size={54} />
        <h2>
          Your ideas deserve
          <br />a little more color.
        </h2>
        <a href="#playground">
          Make something you love <span>↑</span>
        </a>
        <p>Always free. Always a little playful.</p>
      </section>
    </main>
  );
}
