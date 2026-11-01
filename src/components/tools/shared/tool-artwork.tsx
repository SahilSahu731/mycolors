type ArtProps = { slug: string; colors: string[] };

export default function ToolArtwork({ slug, colors: c }: ArtProps) {
  const [a, b, d, e, f] = c;
  const paper = "#FAF8F1";
  const dark = "#25232B";

  return (
    <svg
      viewBox="0 0 340 190"
      fill="none"
      aria-hidden="true"
      className="h-full w-full overflow-visible transition-transform duration-700 ease-out group-hover:scale-[1.06] motion-reduce:transform-none"
    >
      <defs>
        <linearGradient id={`art-gradient-${slug}`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor={a} />
          <stop offset=".48" stopColor={d} />
          <stop offset="1" stopColor={f} />
        </linearGradient>
        <linearGradient id={`art-soft-${slug}`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor={b} />
          <stop offset="1" stopColor={e} />
        </linearGradient>
      </defs>

      {slug === "image-to-colors" && (
        <>
          <rect
            x="30"
            y="16"
            width="200"
            height="150"
            rx="17"
            fill={paper}
            transform="rotate(-8 130 91)"
          />
          <g transform="rotate(-8 130 91)">
            <rect x="43" y="29" width="174" height="114" rx="10" fill={d} />
            <circle cx="173" cy="58" r="22" fill={b} />
            <path d="M43 132 93 74l38 35 28-22 58 45v11H43Z" fill={f} />
            <path d="M43 142 108 101l48 41Z" fill={a} />
          </g>
          <rect
            x="195"
            y="90"
            width="110"
            height="76"
            rx="15"
            fill={paper}
            transform="rotate(7 250 128)"
          />
          {[a, b, d, e, f].map((color, i) => (
            <rect
              key={i}
              x={207 + i * 17}
              y="110"
              width="17"
              height="43"
              rx="8"
              fill={color}
              transform="rotate(7 250 128)"
            />
          ))}
          <path d="m252 45 8 8-8 8-8-8Z" fill={a} />
        </>
      )}

      {slug === "theme-studio" && (
        <>
          <rect
            x="45"
            y="28"
            width="153"
            height="125"
            rx="14"
            fill={paper}
            transform="rotate(-8 122 90)"
          />
          <g transform="rotate(-8 122 90)">
            <rect x="56" y="42" width="130" height="20" rx="7" fill={d} />
            <circle cx="66" cy="52" r="4" fill={a} />
            <rect x="58" y="78" width="62" height="56" rx="10" fill={a} />
            <rect x="129" y="78" width="53" height="12" rx="6" fill={f} />
            <rect x="129" y="100" width="45" height="7" rx="3.5" fill={e} />
            <rect x="129" y="117" width="35" height="7" rx="3.5" fill={b} />
          </g>
          <rect
            x="150"
            y="45"
            width="152"
            height="119"
            rx="15"
            fill={dark}
            transform="rotate(8 226 105)"
          />
          <g transform="rotate(8 226 105)">
            <rect
              x="164"
              y="58"
              width="125"
              height="14"
              rx="7"
              fill="#55505E"
            />
            <circle cx="177" cy="65" r="4" fill={b} />
            <rect x="164" y="86" width="58" height="62" rx="10" fill={f} />
            <rect x="232" y="89" width="43" height="8" rx="4" fill={d} />
            <rect x="232" y="105" width="37" height="7" rx="3.5" fill={e} />
            <rect x="232" y="122" width="47" height="7" rx="3.5" fill={a} />
          </g>
        </>
      )}

      {slug === "hue-match" && (
        <>
          <circle cx="138" cy="94" r="72" fill={a} opacity=".95" />
          <circle cx="202" cy="94" r="72" fill={e} opacity=".9" />
          <path
            d="M170 30a72 72 0 0 0 0 128 72 72 0 0 0 0-128Z"
            fill={b}
            opacity=".92"
          />
          <circle
            cx="138"
            cy="94"
            r="38"
            stroke={paper}
            strokeWidth="3"
            strokeDasharray="5 8"
          />
          <circle
            cx="202"
            cy="94"
            r="38"
            stroke={paper}
            strokeWidth="3"
            strokeDasharray="5 8"
          />
          <path
            d="m163 94 7 7 16-17"
            stroke={dark}
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      )}

      {slug === "palette-studio" && (
        <>
          {[a, b, d, e, f].map((color, i) => (
            <g key={i} transform={`rotate(${(i - 2) * 7} ${66 + i * 51} 98)`}>
              <rect
                x={42 + i * 51}
                y={29 + (i % 2) * 9}
                width="53"
                height="134"
                rx="23"
                fill={color}
              />
              <circle
                cx={68 + i * 51}
                cy="141"
                r="6"
                fill={paper}
                opacity=".55"
              />
            </g>
          ))}
        </>
      )}

      {slug === "gradient-lab" && (
        <>
          <rect
            x="32"
            y="26"
            width="276"
            height="139"
            rx="25"
            fill={`url(#art-gradient-${slug})`}
          />
          <path
            d="M33 124C98 38 150 206 222 106s64-53 85-35"
            stroke={paper}
            strokeWidth="12"
            strokeLinecap="round"
            opacity=".65"
          />
          <circle cx="92" cy="72" r="15" fill={paper} opacity=".7" />
          <circle cx="258" cy="121" r="10" fill={paper} opacity=".75" />
        </>
      )}

      {slug === "contrast-checker" && (
        <>
          <rect x="45" y="24" width="250" height="144" rx="22" fill={dark} />
          <path
            d="M170 24h103a22 22 0 0 1 22 22v100a22 22 0 0 1-22 22H170Z"
            fill={b}
          />
          <text
            x="108"
            y="118"
            textAnchor="middle"
            fontSize="71"
            fontWeight="750"
            fill={paper}
            fontFamily="Arial, sans-serif"
          >
            Aa
          </text>
          <text
            x="232"
            y="118"
            textAnchor="middle"
            fontSize="71"
            fontWeight="750"
            fill={dark}
            fontFamily="Arial, sans-serif"
          >
            Aa
          </text>
          <rect x="135" y="134" width="70" height="25" rx="12.5" fill={e} />
          <text
            x="170"
            y="151"
            textAnchor="middle"
            fontSize="12"
            fontWeight="700"
            fill={dark}
            fontFamily="Arial, sans-serif"
          >
            AA ✓
          </text>
        </>
      )}

      {slug === "color-fix" && (
        <>
          <rect
            x="39"
            y="42"
            width="110"
            height="108"
            rx="22"
            fill={a}
            transform="rotate(-9 94 96)"
          />
          <path
            d="m71 70 50 50m0-50-50 50"
            stroke={paper}
            strokeWidth="14"
            strokeLinecap="round"
            opacity=".8"
            transform="rotate(-9 94 96)"
          />
          <path
            d="M154 96h30m-10-11 11 11-11 11"
            stroke={dark}
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <rect
            x="189"
            y="29"
            width="114"
            height="131"
            rx="25"
            fill={e}
            transform="rotate(8 246 94)"
          />
          <path
            d="m219 93 20 19 35-41"
            stroke={dark}
            strokeWidth="13"
            strokeLinecap="round"
            strokeLinejoin="round"
            transform="rotate(8 246 94)"
          />
        </>
      )}

      {slug === "color-explorer" && (
        <>
          {[76, 56, 35].map((r, i) => (
            <circle
              key={r}
              cx="170"
              cy="95"
              r={r}
              stroke={[a, e, f][i]}
              strokeWidth="11"
              opacity={1 - i * 0.12}
            />
          ))}
          <circle cx="170" cy="95" r="19" fill={b} />
          {[
            [-76, 0],
            [76, 0],
            [0, -76],
            [0, 76],
          ].map(([x, y], i) => (
            <circle
              key={i}
              cx={170 + x}
              cy={95 + y}
              r="13"
              fill={[a, b, d, f][i]}
              stroke={paper}
              strokeWidth="4"
            />
          ))}
        </>
      )}

      {slug === "vision-simulator" && (
        <>
          <rect x="55" y="33" width="230" height="126" rx="23" fill={d} />
          <path d="M55 110 121 55l58 55 51-39 55 39v49H55Z" fill={a} />
          <circle cx="212" cy="62" r="23" fill={b} />
          <circle
            cx="178"
            cy="96"
            r="58"
            fill="#F7F6F0"
            fillOpacity=".18"
            stroke={paper}
            strokeWidth="10"
          />
          <path
            d="m217 136 34 28"
            stroke={paper}
            strokeWidth="13"
            strokeLinecap="round"
          />
          <path
            d="M178 39v114"
            stroke={paper}
            strokeWidth="4"
            strokeDasharray="7 7"
            opacity=".9"
          />
        </>
      )}

      {slug === "color-sense" && (
        <>
          {[a, e, a, a, a].map((color, i) => (
            <rect
              key={i}
              x={31 + i * 57}
              y={49 + (i % 2) * 9}
              width="51"
              height="90"
              rx="16"
              fill={color}
            />
          ))}
          <circle cx="170" cy="34" r="18" fill={b} />
          <path
            d="m163 34 5 5 10-11"
            stroke={dark}
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      )}

      {slug === "daily-color" && (
        <>
          <rect x="89" y="18" width="163" height="157" rx="27" fill={paper} />
          <path
            d="M89 45a27 27 0 0 1 27-27h109a27 27 0 0 1 27 27v23H89Z"
            fill={f}
          />
          <circle cx="124" cy="27" r="5" fill={paper} />
          <circle cx="216" cy="27" r="5" fill={paper} />
          <circle cx="170" cy="113" r="42" fill={a} />
          <text
            x="170"
            y="130"
            textAnchor="middle"
            fontSize="50"
            fontWeight="750"
            fill={paper}
            fontFamily="Arial, sans-serif"
          >
            ?
          </text>
          <circle cx="260" cy="144" r="14" fill={b} />
        </>
      )}

      {slug === "color-theory" && (
        <>
          {[a, b, d, e, f, a, b, d, e, f, a, b].map((color, i) => (
            <path
              key={i}
              d="M170 95 170 16 A79 79 0 0 1 209.5 26.6Z"
              fill={color}
              transform={`rotate(${i * 30} 170 95)`}
            />
          ))}
          <circle cx="170" cy="95" r="36" fill={paper} />
          <circle cx="170" cy="95" r="15" fill={dark} />
          <circle
            cx="253"
            cy="29"
            r="11"
            fill={a}
            stroke={paper}
            strokeWidth="4"
          />
        </>
      )}
    </svg>
  );
}
