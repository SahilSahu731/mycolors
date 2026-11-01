import type { Metadata } from "next";
import ColorFixPage from "@/components/tools/pages/color-fix";
export const metadata: Metadata = {
  title: "ColorFix",
  description: "Inspect explicit CSS color pairs and improve readability.",
};
export default function Page() {
  return <ColorFixPage />;
}
