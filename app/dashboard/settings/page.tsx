import { Suspense } from "react";
import { Settings } from "@/components/dash/views/Settings";

export const metadata = { title: "Settings" };

export default function Page() {
  return (
    <Suspense>
      <Settings />
    </Suspense>
  );
}
