import type { Metadata } from "next";
import VisionSimulatorPage from "@/components/tools/pages/vision-simulator";
export const metadata: Metadata = {
  title: "Vision Simulator",
  description:
    "Compare your palette across simulated color vision differences.",
};
export default function Page() {
  return <VisionSimulatorPage />;
}
