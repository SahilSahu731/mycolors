export function Icon({
  name = "arrow",
  size = 20,
}: {
  name?: string;
  size?: number;
}) {
  const paths: Record<string, React.ReactNode> = {
    arrow: (
      <>
        <path d="M5 12h14M13 6l6 6-6 6" />
      </>
    ),
    sun: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2" />
      </>
    ),
    moon: <path d="M20 14A8 8 0 0 1 10 4a8 8 0 1 0 10 10Z" />,
    search: (
      <>
        <circle cx="10" cy="10" r="6" />
        <path d="m15 15 5 5" />
      </>
    ),
    image: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="4" />
        <circle cx="8" cy="8" r="1" />
        <path d="m3 17 5-5 4 3 4-6 5 8" />
      </>
    ),
    circles: (
      <>
        <circle cx="9" cy="10" r="6" />
        <circle cx="15" cy="14" r="6" />
      </>
    ),
    theme: (
      <>
        <rect x="3" y="4" width="18" height="16" rx="3" />
        <path d="M12 4v16M3 9h9" />
      </>
    ),
    palette: (
      <>
        <rect x="3" y="4" width="18" height="16" rx="3" />
        <path d="M9 4v16M15 4v16" />
      </>
    ),
    gradient: (
      <>
        <rect x="3" y="4" width="18" height="16" rx="3" />
        <path d="m8 4-5 9m11-9L5 20m15-16-9 16m10-9-5 9" />
      </>
    ),
    contrast: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 3v18" />
        <path d="M12 3a9 9 0 0 1 0 18" fill="currentColor" />
      </>
    ),
    fix: (
      <>
        <path d="m12 3 8 4v6c0 5-8 8-8 8s-8-3-8-8V7Z" />
        <path d="m8 12 3 3 5-6" />
      </>
    ),
    explore: (
      <>
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="3" />
        <path d="M12 3v3m9 6h-3m-6 9v-3M3 12h3" />
      </>
    ),
    vision: (
      <>
        <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ),
    game: (
      <>
        <rect x="3" y="6" width="18" height="13" rx="5" />
        <path d="M8 10v5m-2-2h4m5-2h.1m3 4h.1" />
      </>
    ),
    daily: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="3" />
        <path d="M7 3v4m10-4v4M3 10h18m-13 5 3 3 5-5" />
      </>
    ),
    wheel: (
      <>
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="3" />
        <path d="M12 3v6m0 6v6M3 12h6m6 0h6" />
      </>
    ),
    close: <path d="m6 6 12 12M6 18 18 6" />,
    copy: (
      <>
        <rect x="8" y="8" width="12" height="13" rx="2" />
        <path d="M16 8V3H3v13h5" />
      </>
    ),
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name] || paths.arrow}
    </svg>
  );
}
