import type { Metadata } from "next";
import ColorExplorerPage from "@/components/tools/pages/color-explorer";
export const metadata: Metadata = {
  title: "Color Explorer",
  description: "Explore color values, tints, shades and harmonies.",
};
export default function Page() {
  return <ColorExplorerPage />;
}
