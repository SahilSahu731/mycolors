import type { Metadata } from "next";
import GradientLabPage from "@/components/tools/pages/gradient-lab";
export const metadata: Metadata = {
  title: "Gradient Lab",
  description: "Create linear and radial gradients and export CSS.",
};
export default function Page() {
  return <GradientLabPage />;
}
