"use client";
import { useState } from "react";
import { ink } from "@/lib/colors";
export default function Swatches({
  colors,
  onChange,
}: {
  colors: string[];
  onChange?: (c: string) => void;
}) {
  const [copied, setCopied] = useState(-1);
  return (
    <div className="flex min-h-36 overflow-hidden rounded-xl md:min-h-44 [&>button]:flex [&>button]:min-w-0 [&>button]:flex-1 [&>button]:items-end [&>button]:justify-center [&>button]:px-1 [&>button]:py-5 [&_span]:font-mono [&_span]:text-[9px] md:[&_span]:text-xs">
      {colors.map((c, i) => (
        <button
          key={i}
          style={{ background: c, color: ink(c) }}
          onClick={async () => {
            if (onChange) onChange(c);
            else {
              try {
                await navigator.clipboard.writeText(c);
                setCopied(i);
                setTimeout(() => setCopied(-1), 1800);
              } catch {
                setCopied(-1);
              }
            }
          }}
          title={`${onChange ? "Select" : "Copy"} ${c}`}
        >
          <span>{copied === i ? "COPIED!" : c.toUpperCase()}</span>
        </button>
      ))}
    </div>
  );
}
