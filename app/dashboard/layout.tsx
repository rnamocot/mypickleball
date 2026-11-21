import type { Metadata } from "next";
import "./dashboard.css";
import { DashShell } from "@/components/dash/Shell";

export const metadata: Metadata = {
  title: { default: "Dashboard", template: "%s · Dashboard | MyPickleball" },
  robots: { index: false, follow: false },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashShell>{children}</DashShell>;
}
