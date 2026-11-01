"use client";
import ContrastTool from "../contrast-checker";
import { ToolPage, ToolHeading, Note } from "../shared/page-parts";
export default function ColorFixPage() {
  return (
    <ToolPage>
      <ToolHeading
        eyebrow="07 / IMPROVE · COLORFIX"
        title="Small fixes."
        accent="Big difference."
        description="Give your stylesheet a little care. Find hard-to-read pairs and explore clearer alternatives."
      />
      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_280px]">
        <div className="flex min-w-0 flex-col gap-5">
          <ContrastTool fix />
        </div>
        <aside className="grid gap-4 xl:sticky xl:top-24">
          <Note number="01 / SCAN" title="Bring your CSS.">
            Paste rules with explicit HEX text and background colors. Run the
            analysis to see each pair.
          </Note>
          <Note number="02 / REPAIR" title="Keep the character.">
            Inspect a result and apply a readable foreground. Copy the repaired
            pair back into your stylesheet.
          </Note>
          <Note number="SCOPE" title="A focused check.">
            This checks solid HEX pairs in the same rule. It does not resolve
            CSS variables or audit a rendered website.
          </Note>
        </aside>
      </div>
    </ToolPage>
  );
}
