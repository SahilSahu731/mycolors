import Link from "next/link";
import { BrandMark } from "@/components/shared/brand-mark";
export function Footer() {
  return (
    <footer className="flex flex-wrap items-center gap-6 border-t border-line px-5 py-7 text-[10px] text-muted md:px-8 lg:px-[max(48px,calc((100vw-1200px)/2))] [&>span:last-child]:ml-auto">
      <Link
        href="/"
        className="inline-flex shrink-0 items-center gap-2 text-[23px] font-normal tracking-[-1px] [&>svg]:size-8 md:text-[27px]"
      >
        <BrandMark size={29} />
        <span>
          my<span className="font-semibold">Colors</span>
        </span>
      </Link>
      <span>A little color goes a long way.</span>
      <span>Made for your creative side. © {2026}</span>
    </footer>
  );
}
