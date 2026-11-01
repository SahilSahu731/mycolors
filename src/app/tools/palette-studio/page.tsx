import type { Metadata } from "next";
import PaletteStudioPage from "@/components/tools/pages/palette-studio";
export const metadata: Metadata = {
  title: "Palette Studio",
  description: "Generate, lock, edit and export your color palette.",
};
export default function Page() {
  return <PaletteStudioPage />;
}
