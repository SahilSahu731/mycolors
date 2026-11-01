"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Icon } from "@/components/shared/icon";
import { BrandMark } from "@/components/shared/brand-mark";

const TOOL_COUNT = 12; // update when you add or remove tools
const DEFAULT_DOTS = ["#ff795b", "#f6c85f", "#d7e7a9", "#9aaaf0", "#7963cf"];
const focus =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink";

const read = (key: string) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};
const apply = (dark: boolean) => {
  document.documentElement.dataset.theme = dark ? "dark" : "light";
};

export function Header() {
  const pathname = usePathname();
  const [dark, setDark] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dots, setDots] = useState(DEFAULT_DOTS);

  // Theme: saved choice, else OS preference; follows OS until the user chooses.
  useEffect(() => {
    const saved = read("kolivra-theme");
    const media = matchMedia("(prefers-color-scheme: dark)");
    const d = saved ? saved === "dark" : media.matches;
    setDark(d);
    apply(d);
    const onChange = (e: MediaQueryListEvent) => {
      if (read("kolivra-theme")) return;
      setDark(e.matches);
      apply(e.matches);
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  // The visitor's saved palette appears inside the CTA.
  useEffect(() => {
    try {
      const p = JSON.parse(read("kolivra-palette") ?? "null");
      if (Array.isArray(p) && p.length === 5 && p.every((c) => /^#[0-9a-f]{6}$/i.test(c)))
        setDots(p);
    } catch {}
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function toggle() {
    const d = !dark;
    setDark(d);
    apply(d);
    try {
      localStorage.setItem("kolivra-theme", d ? "dark" : "light");
    } catch {}
  }

  const links = [
    {
      href: "/#tools",
      label: "Tools",
      active:
        pathname.startsWith("/tools/") &&
        pathname !== "/tools/palette-studio" &&
        pathname !== "/tools/daily-color",
    },
    { href: "/tools/palette-studio", label: "Palettes", active: pathname === "/tools/palette-studio" },
    { href: "/tools/daily-color", label: "Play", active: pathname === "/tools/daily-color" },
  ];

  return (
    <header
      className={`sticky top-0 z-50 h-18 border-b transition-colors duration-200 ${
        scrolled
          ? "border-line bg-page/80 backdrop-blur-lg"
          : "border-transparent bg-page"
      }`}
    >
      <a
        href="#main"
        className="absolute left-4 top-4 z-[60] -translate-y-20 rounded-lg bg-ink px-4 py-2 text-sm font-medium text-page focus:translate-y-0"
      >
        Skip to content
      </a>

      <div className="mx-auto flex h-full w-[calc(100%-36px)] max-w-330 items-center justify-between gap-2 md:w-[calc(100%-64px)] md:gap-4">
        <Link
          href="/"
          aria-label="myColors home"
          className={`inline-flex shrink-0 items-center gap-2 rounded-lg text-[23px] font-normal tracking-[-1px] md:text-[27px] [&>svg]:size-8 ${focus}`}
        >
          <BrandMark />
          <span>
            my
            <span className="bg-linear-to-r from-red-500 via-green-500 to-blue-500 bg-clip-text font-semibold text-transparent">
              Colors
            </span>
          </span>
        </Link>

        <nav
          aria-label="Main navigation"
          className="flex items-center gap-0.5 text-[15px] font-medium md:gap-1.5 md:text-base"
        >
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={l.active ? "page" : undefined}
              className={`flex items-center gap-2 rounded-full px-2.5 py-1.5 transition-colors md:px-4 ${
                l.active ? "bg-soft text-ink" : "text-muted hover:bg-soft hover:text-ink"
              } ${focus}`}
            >
              {l.label}
              {l.label === "Tools" && (
                <span className="rounded-full border border-line bg-soft px-1.5 py-0.5 text-xs text-ink max-sm:hidden">
                  {TOOL_COUNT}
                </span>
              )}
              {l.label === "Play" && (
                <span className="size-1.5 shrink-0 animate-pulse rounded-full bg-violet-400 motion-reduce:animate-none" />
              )}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 md:gap-3">
          <button
            onClick={toggle}
            aria-pressed={dark}
            aria-label="Dark mode"
            className={`grid size-9 place-items-center rounded-full transition-colors hover:bg-soft ${focus}`}
          >
            {/* Both icons render; the dark: variant picks one, so no icon flash. */}
            <span className="inline-flex dark:hidden">
              <Icon name="moon" />
            </span>
            <span className="hidden dark:inline-flex">
              <Icon name="sun" />
            </span>
          </button>

          <Link
            href="/tools/theme-studio"
            className={`group hidden h-10 items-center gap-2.5 rounded-full bg-ink pl-2 pr-4 font-medium text-page transition-transform hover:-translate-y-px motion-reduce:transform-none md:inline-flex ${focus}`}
          >
            <span
              aria-hidden="true"
              className="flex -space-x-1.5 transition-all duration-200 group-hover:-space-x-0.5"
            >
              {dots.map((c, i) => (
                <i
                  key={i}
                  style={{ background: c }}
                  className="size-4.5 rounded-full border-2 border-ink"
                />
              ))}
            </span>
            Open Theme Studio
          </Link>
        </div>
      </div>
    </header>
  );
}