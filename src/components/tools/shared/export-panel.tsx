"use client";
import { CopyButton, download } from "@/components/ui";
export default function Export({
  text,
  name = "mycolors-colors.css",
}: {
  text: string;
  name?: string;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface [&>div]:border-b [&>div]:border-line [&>div]:p-5 [&_pre]:max-h-80 [&_pre]:overflow-auto [&_pre]:bg-soft [&_pre]:p-6 [&_pre]:font-mono [&_pre]:text-xs [&_pre]:leading-7 [&_pre]:whitespace-pre-wrap [&_pre]:break-all">
      <div className="flex flex-wrap items-center justify-between gap-4 [&_h3]:text-sm [&_h3]:font-medium">
        <h3>Your colors, ready to go.</h3>
        <div className="flex flex-wrap items-center gap-3">
          <CopyButton text={text} />
          <button
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-line bg-surface px-4 py-2.5 text-xs font-medium text-ink transition hover:bg-soft"
            onClick={() => download(text, name)}
          >
            Download ↓
          </button>
        </div>
      </div>
      <pre>{text}</pre>
    </div>
  );
}
