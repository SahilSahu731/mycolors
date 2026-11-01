"use client";
import ContrastTool from "../contrast-checker";
import { ToolPage, ToolHeading } from "../shared/page-parts";
export default function ContrastCheckerPage() {
  return (
    <ToolPage>
      <ToolHeading
        eyebrow="06 / IMPROVE · CONTRAST CHECKER"
        title="Make it"
        accent="crystal clear."
        description="Put your text and background to the test. Find a pair that reads as good as it looks."
      />
      <div className="flex flex-col gap-5 rounded-4xl bg-soft/50 p-3 sm:p-7">
        <ContrastTool />
      </div>
    </ToolPage>
  );
}
