"use client";

export default function TrustNote() {
  return (
    <div className="flex justify-center gap-5 py-6 text-[10px] text-muted md:justify-between [&>span]:flex [&>span]:items-center [&>span]:gap-2 [&>span:last-child]:hidden md:[&>span:last-child]:block [&_i]:size-1.5 [&_i]:rounded-full [&_i]:bg-emerald-400 mx-auto w-[calc(100%-36px)] max-w-[1200px] md:w-[calc(100%-64px)] xl:w-[calc(100%-96px)]">
      <span>
        <i />
        No sign-up. No paywall. Just color.
      </span>
      <span>Made for designers, developers & curious minds.</span>
    </div>
  );
}
