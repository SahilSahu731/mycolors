import ThemePreview from "./theme-preview";
import GradientPreview from "./gradient-preview";
export default function PalettePreviews({
  palette,
  onSave,
}: {
  palette: string[];
  onSave: () => void;
}) {
  return (
    <section className="pt-14 md:pt-20 mx-auto w-[calc(100%-36px)] max-w-[1200px] md:w-[calc(100%-64px)] xl:w-[calc(100%-96px)]">
      <div className="mb-7 flex items-end justify-between gap-6 [&_h2]:mt-3 [&_h2]:text-3xl [&_h2]:font-medium [&_h2]:tracking-tight [&>p]:hidden [&>p]:text-xs [&>p]:leading-6 [&>p]:text-muted md:[&>p]:block">
        <div>
          <div className="flex items-center gap-2 text-[9px] font-semibold tracking-[0.15em]">
            A LITTLE INSPIRATION
          </div>
          <h2>See what your colors can do.</h2>
        </div>
        <p>
          Your palette isn’t just a row of swatches.
          <br />
          It’s the start of something.
        </p>
      </div>
      <div className="grid gap-5 md:grid-cols-[1.35fr_1fr]">
        <ThemePreview palette={palette} onSave={onSave} />
        <GradientPreview palette={palette} onSave={onSave} />
      </div>
    </section>
  );
}
