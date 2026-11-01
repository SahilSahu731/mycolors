# myColors

A browser-local color toolkit built with Next.js 16, React 19, TypeScript and locally bundled Inter. Responsive layouts, persistent light/dark themes, and twelve tools with dedicated URLs.

## Run

```sh
npm install
npm run dev
```

Open http://localhost:3000. Production: `npm run build`, then `npm start`. If a restricted environment blocks Turbopack’s internal port binding, use `npm run build -- --webpack`; this production build has been verified.

## Tools

- Image to Colors: local image decoding, dominant-color extraction, pixel sampling, CSS export.
- HueMatch: complementary, analogous and triadic palettes with branding, interior and outfit guidance.
- Theme Studio: semantic light/dark tokens, live previews, contrast-checked text and CSS export.
- Palette Studio: editable colors, generation, locking, spacebar shortcut, CSS/JSON export.
- Gradient Lab: two to five editable stops, direction, linear/radial styles and CSS export.
- Contrast Checker: WCAG ratios, AA/AAA results and accessible foreground suggestions.
- ColorFix: analyzes explicit solid HEX foreground/background pairs within pasted CSS rules. This is a focused CSS checker, not a rendered website scanner; it does not resolve inheritance, variables, transparency or images.
- Color Explorer: HEX/RGB/HSL values, harmonies, tints and shades.
- Vision Simulator: approximate full-severity protanopia, deuteranopia, tritanopia and achromatopsia previews.
- ColorSense: unlimited color recreation practice with scoring and local personal best.
- Daily Color: deterministic UTC daily target, one saved result per day per browser, shareable score.
- Color Theory: interactive color relationships and guidance.

Saved palettes are shared through localStorage. Images stay in browser memory. No accounts or external API keys are required. Daily play and scores are local; they are not tamper-proof or a cross-device leaderboard.

## Verification

```sh
npx tsc --noEmit
node --experimental-strip-types --test tests/colors.test.mjs
npm run build
```

The color-engine tests cover known contrast ratios, input normalization, HSL round trips and accessibility corrections across multiple hues and backgrounds. Font licensing is in `src/app/fonts/LICENSE.txt`.
