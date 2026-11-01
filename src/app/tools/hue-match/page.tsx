import type { Metadata } from "next";
import HueMatchPage from "@/components/tools/pages/hue-match";
export const metadata: Metadata = {
  title: "HueMatch",
  description: "Find harmonious colors for your brand, room or outfit.",
};
export default function Page() {
  return <HueMatchPage />;
}
