"use client";
import { useState } from "react";
import { Icon } from "@/components/shared/icon";
export function CopyButton({
  text,
  label = "Copy CSS",
}: {
  text: string;
  label?: string;
}) {
  const [status, setStatus] = useState("");
  return (
    <button
      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-line bg-surface px-4 py-2.5 text-xs font-medium text-ink transition hover:bg-soft"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setStatus("Copied!");
        } catch {
          setStatus("Clipboard unavailable");
        }
        setTimeout(() => setStatus(""), 2200);
      }}
    >
      <Icon name="copy" size={16} />
      {status || label}
    </button>
  );
}
