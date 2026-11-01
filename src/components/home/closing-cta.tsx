import { BrandMark } from "@/components/ui";

const COLORS = ["#FF795B", "#F6C85F", "#D7E7A9", "#9AAAF0", "#7963CF"];

function ColorOrbit() {
  return (
    <svg
      viewBox="0 0 600 600"
      fill="none"
      aria-hidden="true"
      className="h-full w-full overflow-visible drop-shadow-[0_25px_45px_rgba(0,0,0,0.16)]"
    >
      <defs>
        <radialGradient id="closing-orbit-glow">
          <stop offset="0%" stopColor="#7963CF" stopOpacity=".25" />
          <stop offset="100%" stopColor="#7963CF" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx="300" cy="300" r="290" fill="url(#closing-orbit-glow)" />

      <g
        className="origin-center transition-transform duration-1000 ease-out group-hover:rotate-12 motion-reduce:transition-none"
        style={{ transformOrigin: "300px 300px" }}
      >
        <rect
          x="81"
          y="81"
          width="438"
          height="438"
          rx="145"
          stroke={COLORS[0]}
          strokeWidth="34"
          transform="rotate(-20 300 300)"
        />
        <rect
          x="126"
          y="126"
          width="348"
          height="348"
          rx="118"
          stroke={COLORS[1]}
          strokeWidth="32"
          transform="rotate(19 300 300)"
        />
        <rect
          x="170"
          y="170"
          width="260"
          height="260"
          rx="90"
          stroke={COLORS[2]}
          strokeWidth="30"
          transform="rotate(-28 300 300)"
        />
        <rect
          x="209"
          y="209"
          width="182"
          height="182"
          rx="66"
          stroke={COLORS[3]}
          strokeWidth="29"
          transform="rotate(30 300 300)"
        />
        <rect
          x="244"
          y="244"
          width="112"
          height="112"
          rx="42"
          stroke={COLORS[4]}
          strokeWidth="28"
          transform="rotate(-18 300 300)"
        />
        <circle cx="300" cy="300" r="16" fill="#FFFFFF" />
      </g>

      <g fill="white">
        <circle cx="76" cy="102" r="5" opacity=".85" />
        <circle cx="518" cy="470" r="4" opacity=".7" />
        <circle cx="95" cy="485" r="3" opacity=".5" />
        <circle cx="497" cy="113" r="3" opacity=".65" />
      </g>

      <g stroke="white" strokeWidth="4" strokeLinecap="round" opacity=".85">
        <path d="M480 60v30M465 75h30" />
        <path d="M96 395v20M86 405h20" />
      </g>
    </svg>
  );
}

function Arrow() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14m-6-6 6 6-6 6" />
    </svg>
  );
}

export default function ClosingCTA() {
  return (
    <section
      aria-labelledby="closing-cta-title"
      className="mx-auto w-[calc(100%-24px)] max-w-375 py-10 sm:w-[calc(100%-48px)] md:py-16 lg:w-[calc(100%-80px)]"
    >
      <div className="group relative isolate overflow-hidden rounded-4xl bg-[#171620] text-white shadow-[0_24px_60px_rgb(0_0_0/0.10)] sm:rounded-[40px]">
        {/* Subtle dotted texture */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle,currentColor_1px,transparent_1.5px)] bg-size-[22px_22px] text-white/6.5"
        />

        {/* Ambient color glows */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-32 -top-40 -z-10 size-130 rounded-full bg-[#7963CF]/20 blur-[110px]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-72 left-[10%] -z-10 size-137.5 rounded-full bg-[#FF795B]/10 blur-[120px]"
        />

        <div className="relative grid items-center lg:min-h-142.5 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Main content */}
          <div className="relative z-10 px-7 pb-8 pt-14 sm:px-12 sm:pt-20 lg:py-20 lg:pl-16 xl:pl-20">
            <div className="mb-8 inline-flex items-center gap-3 rounded-full bg-white/10 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-white/80 backdrop-blur-xl">
              <span className="flex items-center gap-1">
                {COLORS.map((color, index) => (
                  <span
                    key={index}
                    className="size-1.5 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </span>
              A little more imagination
            </div>

            <h2
              id="closing-cta-title"
              className="max-w-200 text-[clamp(3.3rem,6.2vw,7rem)] font-semibold leading-[0.94] tracking-[-0.075em]"
            >
              Go make a<br />
              <span className="bg-linear-to-r from-[#FF795B] via-[#F6C85F] via-45% to-[#9AAAF0] bg-clip-text text-transparent">
                beautiful mess.
              </span>
            </h2>

            <p className="mt-7 max-w-103.75 text-sm leading-[1.8] text-white/55 sm:text-base">
              You&apos;ve got the colors. Now see where they take you. Mix, match,
              break a few rules, and make something yours.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <a
                href="#playground"
                className="inline-flex min-h-13 items-center justify-center gap-4 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#171620] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_12px_35px_rgba(255,255,255,0.12)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white active:translate-y-0 motion-reduce:transform-none"
              >
                Open the playground
                <Arrow />
              </a>

              <a
                href="#tools"
                className="inline-flex min-h-13 items-center justify-center gap-2 rounded-full bg-white/10 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
              >
                Explore the tools
                <span aria-hidden="true">↗</span>
              </a>
            </div>

            <div className="mt-12 flex items-center gap-3 text-[10px] font-medium uppercase tracking-[0.14em] text-white/40 lg:mt-16">
              <span className="size-1.5 rounded-full bg-[#D7E7A9]" />
              The best ideas start somewhere
            </div>
          </div>

          {/* Abstract color artwork */}
          <div className="pointer-events-none relative mx-auto flex aspect-square w-[min(95%,480px)] items-center justify-center pb-5 sm:w-[min(85%,520px)] lg:w-full lg:max-w-142.5 lg:pb-0 lg:pr-8">
            <ColorOrbit />

            <div className="absolute right-[4%] top-[13%] -rotate-12 rounded-full bg-[#F6C85F] px-4 py-2 text-[10px] font-black tracking-[0.12em] text-[#282124] shadow-xl sm:right-[9%]">
              MAKE IT POP!
            </div>

            <div className="absolute bottom-[13%] left-[3%] rotate-9 rounded-full bg-[#9AAAF0] px-4 py-2 text-[10px] font-black tracking-[0.12em] text-[#242238] shadow-xl sm:left-[8%]">
              STAY CURIOUS
            </div>
          </div>
        </div>

        {/* Bottom signature */}
        <div className="relative flex flex-wrap items-center justify-between gap-4 px-7 pb-6 pt-2 sm:px-12 lg:px-16 lg:pb-8 xl:px-20">
          <div className="flex items-center gap-2.5 text-white/60">
            <BrandMark size={26} />
            <span className="text-xs font-semibold tracking-tight">
              myColors
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {COLORS.map((color, index) => (
              <span
                key={index}
                className="h-2 w-7 rounded-full sm:w-10"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
