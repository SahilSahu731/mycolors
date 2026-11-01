"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/shared/icon";
import { BrandMark } from "@/components/shared/brand-mark";

const TOOL_COUNT = 12;
const DEFAULT_DOTS = ["#ff795b", "#f6c85f", "#d7e7a9", "#9aaaf0", "#7963cf"];
const HEX = /^#[0-9a-f]{6}$/i;

function read(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function applyTheme(dark: boolean) {
  document.documentElement.dataset.theme = dark ? "dark" : "light";
}

function getSavedPalette(): string[] {
  try {
    const value = JSON.parse(read("kolivra-palette") ?? "null");
    if (
      Array.isArray(value) &&
      value.length === 5 &&
      value.every((c) => typeof c === "string" && HEX.test(c))
    )
      return value;
  } catch {}

  return DEFAULT_DOTS;
}

function PaletteDots({ colors }: { colors: string[] }) {
  return (
    <span aria-hidden="true" className="flex shrink-0 items-center -space-x-1">
      {colors.map((color, i) => (
        <span
          key={i}
          className="size-3.5 rounded-full shadow-[0_0_0_1.5px_var(--color-ink)] transition-transform duration-300 group-hover:-translate-y-0.5"
          style={{ backgroundColor: color, transitionDelay: `${i * 30}ms` }}
        />
      ))}
    </span>
  );
}

function ArrowIcon() {
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
      <path d="M5 12h14m-6-6 6 6-6 6" />
    </svg>
  );
}

export function Header() {
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const [dark, setDark] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dots, setDots] = useState<string[]>(DEFAULT_DOTS);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const sync = () => {
      const saved = read("kolivra-theme");
      const next =
        saved === "dark" ? true : saved === "light" ? false : media.matches;
      setDark(next);
      applyTheme(next);
    };

    const onStorage = (event: StorageEvent) => {
      if (event.key === "kolivra-theme" || event.key === null) sync();
    };

    sync();
    media.addEventListener("change", sync);
    window.addEventListener("storage", onStorage);

    return () => {
      media.removeEventListener("change", sync);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  useEffect(() => {
    const update = () => setDots(getSavedPalette());
    const onStorage = (event: StorageEvent) => {
      if (event.key === "kolivra-palette" || event.key === null) update();
    };

    update();
    window.addEventListener("storage", onStorage);
    window.addEventListener("kolivra:palette-updated", update);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("kolivra:palette-updated", update);
    };
  }, [pathname]);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 8);

    update();
    window.addEventListener("scroll", update, { passive: true });

    return () => window.removeEventListener("scroll", update);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    const onOutside = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node))
        setMenuOpen(false);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", onOutside);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerdown", onOutside);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    applyTheme(next);

    try {
      localStorage.setItem("kolivra-theme", next ? "dark" : "light");
    } catch {}
  }

  const links = [
    {
      href: "/#tools",
      label: "Tools",
      active:
        pathname === "/tools" ||
        (pathname.startsWith("/tools/") &&
          ![
            "/tools/palette-studio",
            "/tools/daily-color",
            "/tools/theme-studio",
          ].includes(pathname)),
    },
    {
      href: "/tools/palette-studio",
      label: "Palettes",
      active: pathname === "/tools/palette-studio",
    },
    {
      href: "/tools/daily-color",
      label: "Play",
      active: pathname === "/tools/daily-color",
    },
  ];

  return (
    <header
      ref={headerRef}
      className={`sticky top-0 z-50 w-full transition-[background-color,box-shadow] duration-300 ${scrolled ? "bg-page/90 shadow-[0_8px_32px_rgb(0_0_0/0.07)] backdrop-blur-xl" : "bg-page"}`}
    >
      <a
        href="#main"
        className="absolute left-4 top-3 z-70 -translate-y-20 rounded-xl bg-ink px-4 py-2 text-sm font-medium text-page focus:translate-y-0"
      >
        Skip to content
      </a>

      <div className="mx-auto grid h-17 w-[calc(100%-32px)] max-w-7xl grid-cols-[1fr_auto] items-center gap-3 sm:w-[calc(100%-48px)] md:h-18.5 md:grid-cols-[1fr_auto_1fr] lg:w-[calc(100%-80px)]">
        {/* Brand */}
        <Link
          href="/"
          aria-label="myColors home"
          onClick={() => setMenuOpen(false)}
          className="group flex w-fit shrink-0 items-center gap-2.5 rounded-lg text-ink focus-visible:outline-none focus-visible:opacity-60"
        >
          <span className="flex shrink-0 items-center justify-center transition-transform duration-300 group-hover:-rotate-12 [&>svg]:size-8">
            <BrandMark />
          </span>
          <span className="text-[23px] font-semibold tracking-[-1.4px] sm:text-[26px]">
            <span className="font-normal">my</span>
            <span className="bg-linear-to-r from-[#ff795b] via-[#7abfa7] to-[#7963cf] bg-clip-text text-transparent">
              Colors
            </span>
          </span>
        </Link>

        {/* Desktop navigation */}
        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-0.5 rounded-full bg-soft/70 p-1 md:flex"
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={link.active ? "page" : undefined}
              className={`flex h-10 items-center gap-2 rounded-full px-4 text-[13px] font-medium transition-all duration-200 focus-visible:outline-none focus-visible:bg-surface ${link.active ? "bg-surface text-ink shadow-sm" : "text-muted hover:bg-surface/70 hover:text-ink"}`}
            >
              {link.label}
              {link.label === "Tools" && (
                <span className="rounded-full bg-soft px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-muted">
                  {TOOL_COUNT}
                </span>
              )}
              {link.label === "Play" && (
                <span className="size-1.5 rounded-full bg-violet-400" />
              )}
            </Link>
          ))}
        </nav>

        {/* Header actions */}
        <div className="flex items-center justify-end gap-1.5 sm:gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
            aria-pressed={dark}
            title={dark ? "Switch to light mode" : "Switch to dark mode"}
            className="grid size-10 shrink-0 place-items-center rounded-full text-ink transition-all duration-200 hover:bg-soft active:scale-95 focus-visible:bg-soft focus-visible:outline-none"
          >
            {dark ? <Icon name="sun" /> : <Icon name="moon" />}
          </button>

          <Link
            href="/tools/theme-studio"
            aria-current={
              pathname === "/tools/theme-studio" ? "page" : undefined
            }
            className="group hidden h-10 shrink-0 items-center gap-2.5 rounded-full bg-ink pl-3.5 pr-3 text-page transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:opacity-80 md:inline-flex"
          >
            <PaletteDots colors={dots} />
            <span className="text-[12px] font-semibold whitespace-nowrap">
              Theme Studio
            </span>
            <span className="ml-0.5 transition-transform duration-200 group-hover:translate-x-0.5">
              <ArrowIcon />
            </span>
          </Link>

          {/* Mobile menu button */}
          <button
            ref={menuButtonRef}
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMenuOpen((v) => !v)}
            className={`grid size-10 place-items-center rounded-full text-ink transition-colors focus-visible:outline-none focus-visible:bg-soft md:hidden ${menuOpen ? "bg-soft" : "hover:bg-soft"}`}
          >
            <svg
              width="21"
              height="21"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              aria-hidden="true"
            >
              {menuOpen ? (
                <path d="M5 5 19 19M19 5 5 19" />
              ) : (
                <path d="M4 8h16M7 16h13" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile navigation */}
      {menuOpen && (
        <nav
          id="mobile-navigation"
          aria-label="Mobile navigation"
          className="absolute inset-x-3 top-[calc(100%+8px)] rounded-2xl bg-page p-3 text-ink shadow-[0_18px_55px_rgb(0_0_0/0.15)] sm:inset-x-6 md:hidden"
        >
          <div className="flex flex-col gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={link.active ? "page" : undefined}
                onClick={() => setMenuOpen(false)}
                className={`flex min-h-12 items-center justify-between rounded-xl px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:bg-soft ${link.active ? "bg-soft text-ink" : "text-muted hover:bg-soft hover:text-ink"}`}
              >
                <span className="flex items-center gap-2">
                  {link.label}
                  {link.label === "Play" && (
                    <span className="size-1.5 rounded-full bg-violet-400" />
                  )}
                </span>
                <span className="flex items-center gap-2">
                  {link.label === "Tools" && (
                    <span className="rounded-full bg-soft px-2 py-0.5 text-[11px] text-ink">
                      {TOOL_COUNT} tools
                    </span>
                  )}
                  <ArrowIcon />
                </span>
              </Link>
            ))}
          </div>

          <Link
            href="/tools/theme-studio"
            onClick={() => setMenuOpen(false)}
            className="group mt-3 flex min-h-12 items-center justify-between rounded-xl bg-ink px-4 text-page transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:opacity-80"
          >
            <span className="flex items-center gap-3">
              <PaletteDots colors={dots} />
              <span className="text-sm font-semibold">Theme Studio</span>
            </span>
            <ArrowIcon />
          </Link>
        </nav>
      )}
    </header>
  );
}
