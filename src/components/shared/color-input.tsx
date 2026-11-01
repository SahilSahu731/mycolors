"use client";
import { useEffect, useState } from "react";
import { normalize } from "@/lib/colors";
export function ColorInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);
  return (
    <label className="block min-w-28 [&>span]:mb-2 [&>span]:block [&>span]:text-[10px] [&>span]:text-muted [&>div]:flex [&>div]:items-center [&>div]:gap-2 [&>div]:rounded-lg [&>div]:border [&>div]:border-line [&>div]:bg-surface [&>div]:p-2 [&_input[type=color]]:size-7 [&_input[type=color]]:shrink-0 [&_input[type=color]]:cursor-pointer [&_input]:min-w-0 [&_input]:border-0 [&_input]:bg-transparent [&_input:not([type=color])]:w-20 [&_input:not([type=color])]:font-mono [&_input:not([type=color])]:text-xs">
      <span>{label}</span>
      <div>
        <input
          aria-label={`${label} picker`}
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <input
          aria-label={`${label} HEX`}
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            const c = normalize(e.target.value);
            if (c) onChange(c);
          }}
          onBlur={() => setDraft(value)}
          maxLength={7}
        />
      </div>
    </label>
  );
}
