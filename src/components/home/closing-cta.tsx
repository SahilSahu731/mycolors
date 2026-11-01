"use client";
import { BrandMark } from "@/components/ui";
export default function ClosingCTA() {
  return (
    <section className="py-16 text-center md:py-20 [&>svg]:mx-auto [&>h2]:my-6 [&>h2]:text-4xl [&>h2]:leading-tight [&>h2]:tracking-tight [&>a]:inline-flex [&>a]:items-center [&>a]:gap-4 [&>a]:border-b [&>a]:border-line [&>a]:pb-2 [&>a]:text-xs [&>p]:mt-5 [&>p]:text-[10px] [&>p]:text-muted mx-auto w-[calc(100%-36px)] max-w-[1200px] md:w-[calc(100%-64px)] xl:w-[calc(100%-96px)]">
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
  );
}
