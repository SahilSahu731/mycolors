import type { Metadata } from "next";
import ThemeStudioPage from "@/components/tools/pages/theme-studio";
export const metadata: Metadata = {
  title: "Theme Studio",
  description: "Create and export a light and dark color system.",
};
export default function Page() {
  return <ThemeStudioPage />;
}
