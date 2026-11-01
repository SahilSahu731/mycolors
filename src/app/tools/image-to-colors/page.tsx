import type { Metadata } from "next";
import ImageToColorsPage from "@/components/tools/pages/image-to-colors";
export const metadata: Metadata = {
  title: "Image to Colors",
  description: "Find a palette in any photo.",
};
export default function Page() {
  return <ImageToColorsPage />;
}
