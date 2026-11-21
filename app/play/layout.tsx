import type { Metadata } from "next";
import "../dashboard/dashboard.css";
import "./play.css";
import { PlayShell } from "@/components/play/PlayShell";

export const metadata: Metadata = {
  title: { default: "Book & play", template: "%s · Dink District | MyPickleball" },
  description: "Book courts, join open play, sign up for clinics and register for events.",
  robots: { index: false, follow: false },
};

export default function PlayLayout({ children }: { children: React.ReactNode }) {
  return <PlayShell>{children}</PlayShell>;
}
