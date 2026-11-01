# Editing myColors

Start with `src/components/home.tsx`. This small file lists the landing-page sections in the order they appear. Move or remove a component there to change the page structure.

## Landing page

| What you want to change | Component | Styles |
| --- | --- | --- |
| Headline, description, hero buttons and decorations | `src/components/home/hero.tsx` | Tailwind classes in the component |
| Left/right gravity containers, drag and release | `src/components/home/gravity-container.tsx` | Tailwind classes in the component |
| Palette toolbar, shuffle and undo controls | `src/components/home/palette-playground.tsx` | Tailwind classes in the component |
| Expanded palette options and exports | `src/components/home/playground-options.tsx` | Tailwind classes in the component |
| Individual color tiles, shapes, locks and copying | `src/components/home/palette-swatch.tsx` | Tailwind classes in the component |
| Small message below the palette | `src/components/home/trust-note.tsx` | Tailwind classes in the component |
| Preview section heading and arrangement | `src/components/home/palette-previews.tsx` | Tailwind classes in the component |
| Light/dark interface preview | `src/components/home/theme-preview.tsx` | Tailwind classes in the component |
| Gradient preview and angle slider | `src/components/home/gradient-preview.tsx` | Tailwind classes in the component |
| Tool search, categories and cards | `src/components/home/tool-directory.tsx` | Tailwind classes in the component |
| Homepage color game | `src/components/home/color-game.tsx` | Tailwind classes in the component |
| Closing headline and link | `src/components/home/closing-cta.tsx` | Tailwind classes in the component |

All component styling uses Tailwind utility classes directly in JSX. Change spacing, sizing, colors and responsive variants in the component you are editing. `dark:` utilities follow the existing `data-theme` setting.

## Defaults and shared behavior

- **Starting palette and color names:** `src/config/site.ts`. Keep both arrays at five items.
- **Tool names, descriptions and categories:** `src/config/tools.ts`. Changing a slug also requires renaming its explicit folder in `src/app/tools/` and updating links.
- **Scroll-driven playground expansion:** `src/hooks/use-scroll-expansion.ts`. The page uses normal scrolling and supports reduced motion.
- **Palette generation, locks, undo, saving and the spacebar shortcut:** `src/hooks/use-palette-playground.ts`.
- **Color calculations and accessibility logic:** `src/lib/colors.ts`.
- **Site-wide light/dark tokens:** `src/app/globals.css`.
- **Gravity, collision bodies and container boundaries:** `src/lib/gravity.ts`.
- **Physics controls and rendering:** `src/components/home/gravity-container.tsx`. Each container is independent; its shapes support drag/release, keyboard bounce, toss and pause.
- **Font and page metadata:** `src/app/layout.tsx`; font files are in `src/app/fonts/`.

The homepage owns one shared palette through its hook. The hero, previews and tool cards receive that palette through props. Preview toggles, the gradient angle, search filters and the game keep their state inside their own components.

## Header, footer and reusable controls

- `src/components/layout/header.tsx` — navigation and the theme toggle.
- `src/components/layout/footer.tsx` — footer copy and links.
- `src/components/shared/brand-mark.tsx` — the SVG logo mark.
- `src/components/shared/icon.tsx` — the icon collection.
- `src/components/shared/color-input.tsx` — color picker and HEX field.
- `src/components/shared/copy-button.tsx` — clipboard button and feedback.
- Header, footer and control styling lives in each component’s `className` attributes.

`src/components/ui.tsx` only re-exports these components, so existing imports still work. If changing the brand mark, also update `src/app/icon.svg` and the downloadable SVG files in `public/`.

## Tool workspaces

Each of the 12 tools has its own `src/app/tools/<tool-name>/page.tsx` with metadata, and its own layout in `src/components/tools/pages/<tool-name>.tsx`. There is no dynamic `[slug]` route or tool dispatcher. Edit that layout to change one page independently.

`src/hooks/use-tool-palette.ts` restores and saves palette data. Shared heading, artwork, color control and note components live in `src/components/tools/shared/page-parts.tsx`. The homepage and tool pages share `tool-artwork.tsx`.

Interactive tool implementations:

| Tool | File in `src/components/tools/` |
| --- | --- |
| Theme Studio | `theme-studio.tsx` |
| Palette Studio | `palette-studio.tsx` |
| Gradient Lab | `gradient-lab.tsx` |
| Image to Colors | `image-to-colors.tsx` |
| HueMatch | `hue-match.tsx` |
| Contrast Checker / ColorFix | `contrast-checker.tsx` (`fix` enables CSS analysis) |
| Color Explorer | `color-explorer.tsx` |
| Color Theory | `color-theory.tsx` — keyboard-accessible wheel, hue slider and harmony lessons |
| Vision Simulator | `vision-simulator.tsx` |
| ColorSense / Daily Color | `color-game.tsx` (`daily` selects the daily challenge) |

Reusable swatches and the export panel live in `src/components/tools/shared/`. Workspace styling uses Tailwind classes inside the tool components.

## Tailwind setup

`postcss.config.mjs` uses `@tailwindcss/postcss` for both development and production. `src/app/globals.css` contains the Tailwind import, theme tokens, dark-mode variant and a few base defaults. There are no custom section stylesheets or legacy stylesheet imports.

Inline styles are limited to runtime values such as user-picked colors, scroll progress, and physics positions/dimensions. Those values cannot be known when Tailwind builds the stylesheet.

## Check your changes

```sh
npx tsc --noEmit
node --experimental-strip-types --test tests/colors.test.mjs tests/gravity.test.mjs
npm run build -- --webpack
```
