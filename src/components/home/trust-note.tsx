const COLORS = ["#FF795B", "#F6C85F", "#D7E7A9", "#9AAAF0", "#7963CF"];

const benefits = [
  {
    title: "No sign-up",
    subtitle: "Start in seconds",
    color: COLORS[0],
    mark: "01",
  },
  {
    title: "No paywall",
    subtitle: "Create freely",
    color: COLORS[1],
    mark: "02",
  },
  {
    title: "Made for everyone",
    subtitle: "Curiosity welcome",
    color: COLORS[4],
    mark: "03",
  },
];

function ColorSculpture() {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      aria-hidden="true"
      className="size-18 shrink-0 overflow-visible transition-transform duration-700 ease-out group-hover:rotate-12 sm:size-20 motion-reduce:transition-none"
    >
      <rect
        x="8"
        y="14"
        width="46"
        height="46"
        rx="15"
        fill={COLORS[0]}
        transform="rotate(-18 31 37)"
      />
      <circle cx="69" cy="34" r="23" fill={COLORS[1]} />
      <rect
        x="26"
        y="48"
        width="49"
        height="43"
        rx="14"
        fill={COLORS[3]}
        transform="rotate(13 50 69)"
      />
      <circle cx="62" cy="62" r="21" fill={COLORS[4]} />
      <circle cx="46" cy="48" r="12" fill={COLORS[2]} />
      <circle cx="46" cy="48" r="4" fill="#FFFFFF" />
    </svg>
  );
}

export default function TrustNote() {
  return (
    <section
      aria-label="Why myColors"
      className="mx-auto w-[calc(100%-24px)] max-w-375 py-7 sm:w-[calc(100%-48px)] lg:w-[calc(100%-80px)] lg:py-10"
    >
      <div className="group relative isolate overflow-hidden rounded-[28px] bg-soft/80 px-5 py-6 sm:px-8 lg:px-10 lg:py-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle,currentColor_1px,transparent_1.5px)] bg-size-[22px_22px] text-black/[0.035] dark:text-white/4.5"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-16 -top-28 -z-10 size-72 rounded-full bg-[#FF795B]/10 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-12 -bottom-32 -z-10 size-72 rounded-full bg-[#7963CF]/10 blur-3xl"
        />

        <div className="flex flex-col items-start justify-between gap-7 xl:flex-row xl:items-center xl:gap-12">
          <div className="flex min-w-0 items-center gap-4 sm:gap-5">
            <ColorSculpture />

            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted">
                A SMALL PROMISE FROM US
              </span>
              <h2 className="mt-2 text-[clamp(1.5rem,2.5vw,2.25rem)] font-semibold leading-[1.1] tracking-[-0.055em] text-ink">
                Good colors.{" "}
                <span className="bg-linear-to-r from-[#FF795B] via-[#9AAAF0] to-[#7963CF] bg-clip-text text-transparent">
                  Zero gatekeeping.
                </span>
              </h2>
              <p className="mt-2 max-w-md text-xs leading-relaxed text-muted sm:text-sm">
                All the freedom to experiment, without the unnecessary hoops.
              </p>
            </div>
          </div>

          <div className="grid w-full grid-cols-3 gap-2 sm:gap-5 xl:w-auto xl:gap-8">
            {benefits.map((benefit) => (
              <div
                key={benefit.title}
                className="relative flex min-w-0 flex-col items-start gap-2 py-1"
              >
                <span className="flex items-center gap-2">
                  <span
                    className="size-2.5 shrink-0 rounded-full shadow-sm"
                    style={{ backgroundColor: benefit.color }}
                  />
                  <span className="font-mono text-[9px] font-medium text-muted">
                    {benefit.mark}
                  </span>
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold leading-tight text-ink sm:text-sm">
                    {benefit.title}
                  </p>
                  <p className="mt-1 text-[10px] leading-snug text-muted sm:text-xs">
                    {benefit.subtitle}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 flex h-1"
        >
          {COLORS.map((color, index) => (
            <span
              key={index}
              className="flex-1"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
