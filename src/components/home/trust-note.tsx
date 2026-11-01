
"use client";

const benefits = [
  { title: "No sign-up", description: "Jump right in", color: "#FF795B" },
  { title: "No paywall", description: "Explore freely", color: "#F6C85F" },
  { title: "Made for makers", description: "Design. Build. Play.", color: "#7963CF" },
];

function ColorSymbol() {
  return (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden="true" className="size-12 shrink-0 transition-transform duration-500 group-hover:rotate-12 md:size-14">
      <rect x="8" y="8" width="26" height="26" rx="9" fill="#FF795B" />
      <rect x="30" y="8" width="26" height="26" rx="13" fill="#F6C85F" />
      <rect x="8" y="30" width="26" height="26" rx="13" fill="#9AAAF0" />
      <rect x="30" y="30" width="26" height="26" rx="9" fill="#7963CF" />
      <circle cx="32" cy="32" r="9" fill="#D7E7A9" />
    </svg>
  );
}

export default function TrustNote() {
  return (
    <section aria-label="Why myColors" className="mx-auto w-[calc(100%-36px)] max-w-[1200px] py-7 md:w-[calc(100%-64px)] md:py-10 xl:w-[calc(100%-96px)]">
      <div className="group relative isolate overflow-hidden rounded-[26px] bg-soft/70 px-5 py-6 sm:px-7 md:px-9 md:py-8">
        {/* Subtle dotted texture */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle,currentColor_1px,transparent_1.5px)] bg-size-[22px_22px] text-black/[0.035] dark:text-white/[0.05]" />

        {/* Soft ambient color */}
        <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-24 -z-10 size-64 rounded-full bg-[#9AAAF0]/10 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-28 left-10 -z-10 size-52 rounded-full bg-[#FF795B]/10 blur-3xl" />

        <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
          {/* Main message */}
          <div className="flex min-w-0 items-center gap-4">
            <ColorSymbol />

            <div className="min-w-0">
              <h2 className="text-[19px] font-semibold leading-tight tracking-[-0.7px] text-ink sm:text-[23px]">
                Less friction. <span className="bg-linear-to-r from-[#FF795B] via-[#9AAAF0] to-[#7963CF] bg-clip-text text-transparent">More color.</span>
              </h2>

              <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-muted sm:text-sm">
                Everything you need to explore, experiment, and create. Nothing standing in your way.
              </p>
            </div>
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="flex min-w-0 flex-col gap-2 rounded-2xl bg-page/85 px-3 py-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:bg-page hover:shadow-sm sm:min-w-32 sm:px-4">
                <span className="size-2 rounded-full" style={{ backgroundColor: benefit.color }} />

                <div className="min-w-0">
                  <p className="text-[11px] font-semibold leading-tight text-ink sm:text-xs">{benefit.title}</p>
                  <p className="mt-1 text-[10px] leading-snug text-muted sm:text-[11px]">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
