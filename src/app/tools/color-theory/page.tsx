import type { Metadata } from "next";
import ColorTheoryPage from "@/components/tools/pages/color-theory";
export const metadata: Metadata = {
  title: "Color Theory",
  description: "Learn color harmonies with an interactive color wheel.",
};
export default function Page() {
  return <ColorTheoryPage />;
}
