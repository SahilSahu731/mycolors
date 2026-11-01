"use client";
import Theory from "../color-theory";
import { ToolPage, ToolHeading } from "../shared/page-parts";
import { useToolPalette } from "@/hooks/use-tool-palette";
export default function ColorTheoryPage() {
  const { base, setBase } = useToolPalette();
  return (
    <ToolPage>
      <ToolHeading
        eyebrow="12 / DISCOVER · COLOR THEORY"
        title="Less guessing."
        accent="More feeling."
        description="Explore the relationships behind a great palette. A hands-on little lesson in color."
      />
      <Theory base={base} onChange={setBase} />
    </ToolPage>
  );
}
