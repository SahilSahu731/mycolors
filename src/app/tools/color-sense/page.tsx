import type { Metadata } from "next";
import ColorSensePage from "@/components/tools/pages/color-sense";
export const metadata: Metadata = {
  title: "ColorSense",
  description: "Train your eye by matching colors with HSL controls.",
};
export default function Page() {
  return <ColorSensePage />;
}
