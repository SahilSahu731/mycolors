export function BrandMark({ size = 36 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M8 36V20a8 8 0 0 1 16 0v16"
        stroke="#ff784f"
        strokeWidth="9"
        strokeLinecap="round"
      />
      <path
        d="M24 36V20a8 8 0 0 1 16 0v16"
        stroke="#7560e8"
        strokeWidth="9"
        strokeLinecap="round"
      />
      <path
        d="M24 27v9"
        stroke="#f7b64c"
        strokeWidth="9"
        strokeLinecap="round"
      />
    </svg>
  );
}
