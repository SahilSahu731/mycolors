export const initialPalette = [
  "#d9f279",
  "#a9c4f5",
  "#b8a0db",
  "#f5a88f",
  "#f3d681",
];
export function rgb(hex: string): number[] {
  const h = hex.replace("#", "");
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
}
export function hex(values: number[]) {
  return (
    "#" +
    values
      .map((v) =>
        Math.max(0, Math.min(255, Math.round(v)))
          .toString(16)
          .padStart(2, "0"),
      )
      .join("")
  );
}
export function normalize(value: string) {
  const v = value.trim();
  if (/^#?[0-9a-f]{6}$/i.test(v)) return "#" + v.replace("#", "").toLowerCase();
  if (/^#?[0-9a-f]{3}$/i.test(v))
    return (
      "#" +
      v
        .replace("#", "")
        .split("")
        .map((x) => x + x)
        .join("")
        .toLowerCase()
    );
  return null;
}
export function hsl(color: string): number[] {
  const [r, g, b] = rgb(color).map((v) => v / 255),
    max = Math.max(r, g, b),
    min = Math.min(r, g, b),
    d = max - min,
    l = (max + min) / 2;
  let h = 0;
  if (d) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
  }
  return [
    (h * 60 + 360) % 360,
    d === 0 ? 0 : (d / (1 - Math.abs(2 * l - 1))) * 100,
    l * 100,
  ];
}
export function fromHsl(h: number, s: number, l: number) {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  return hex(
    [0, 8, 4].map((n) => {
      const k = (n + h / 30) % 12;
      return 255 * (l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)));
    }),
  );
}
export function luminance(color: string) {
  const v = rgb(color)
    .map((x) => x / 255)
    .map((x) => (x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4));
  return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
}
export function contrast(a: string, b: string) {
  const x = luminance(a),
    y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}
export function ink(c: string) {
  return contrast(c, "#ffffff") > contrast(c, "#000000")
    ? "#ffffff"
    : "#000000";
}
export function mix(a: string, b: string, t: number) {
  return hex(rgb(a).map((v, i) => v * (1 - t) + rgb(b)[i] * t));
}
export function accessible(fg: string, bg: string, target = 4.5) {
  if (contrast(fg, bg) >= target) return fg;
  const end = ink(bg);
  for (let i = 1; i <= 100; i++) {
    const c = mix(fg, end, i / 100);
    if (contrast(c, bg) >= target) return c;
  }
  return end;
}
export function harmony(c: string, mode: string) {
  const [h, s, l] = hsl(c);
  const offsets =
    mode === "Complementary"
      ? [0, 15, 180, 195, 210]
      : mode === "Triadic"
        ? [0, 120, 240, 135, 255]
        : [0, 25, 50, 335, 310];
  return offsets.map((o, i) =>
    fromHsl(
      (h + o) % 360,
      s,
      Math.max(20, Math.min(85, l + ((i % 3) - 1) * 12)),
    ),
  );
}
export function paletteCSS(p: string[]) {
  return (
    ":root {\n" +
    p.map((c, i) => `  --color-${i + 1}: ${c};`).join("\n") +
    "\n}"
  );
}
