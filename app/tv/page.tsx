import type { Metadata } from "next";
import "../dashboard/dashboard.css";
import { TvBoard } from "@/components/dash/views/TvBoard";

export const metadata: Metadata = {
  title: "TV court board",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <TvBoard />;
}
