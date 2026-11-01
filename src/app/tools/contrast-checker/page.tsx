import type { Metadata } from "next";
import ContrastCheckerPage from "@/components/tools/pages/contrast-checker";
export const metadata: Metadata = {
  title: "Contrast Checker",
  description: "Check color contrast and find readable alternatives.",
};
export default function Page() {
  return <ContrastCheckerPage />;
}
