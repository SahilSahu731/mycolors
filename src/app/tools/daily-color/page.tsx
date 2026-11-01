import type { Metadata } from "next";
import DailyColorPage from "@/components/tools/pages/daily-color";
export const metadata: Metadata = {
  title: "Daily Color",
  description: "One daily color matching challenge, with shareable results.",
};
export default function Page() {
  return <DailyColorPage />;
}
