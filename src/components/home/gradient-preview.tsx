"use client";
import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/ui";
export default function GradientPreview({
  palette,
  onSave,
}: {
  palette: string[];
  onSave: () => void;
}) {
  const [angle, setAngle] = useState(120);
  const save = onSave;
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-line bg-violet-50 px-5 pt-5 dark:bg-violet-400/5 md:px-7">
      <div className="flex min-h-8 items-center justify-between gap-4 [&>span]:text-[9px] [&>span]:tracking-widest [&>span]:text-muted">
        <span>02 / EXPERIMENT</span>
        <Icon name="gradient" size={20} />
      </div>
      <div
        className="mx-auto my-7 size-48 rounded-full shadow-[inset_-12px_-20px_30px_#291a6d18,inset_10px_10px_20px_#ffffff50,0_20px_36px_#72648619]"
        style={{
          background: `linear-gradient(${angle}deg, ${palette[0]}, ${palette[3]} 55%, ${palette[4]})`,
        }}
      />
      <div className="mx-auto mb-4 w-full max-w-60 [&_label]:flex [&_label]:justify-between [&_label]:text-[10px] [&_label]:text-muted [&_input]:mt-3">
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
      <div className="mt-auto flex flex-wrap items-center justify-between gap-4 py-6 [&_h3]:text-sm [&_h3]:font-medium [&_p]:mt-2 [&_p]:text-[10px] [&_p]:text-muted [&>a]:flex [&>a]:items-center [&>a]:gap-2 [&>a]:text-[10px]">
        <div>
          <h3>Go with the flow.</h3>
          <p>Good things happen in between.</p>
        </div>
        <Link href="/tools/gradient-lab" onClick={save}>
          Gradient Lab <Icon name="gradient" size={18} />
        </Link>
      </div>
    </article>
  );
}
