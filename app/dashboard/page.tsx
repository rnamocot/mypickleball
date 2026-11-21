import { Suspense } from "react";
import { Overview } from "@/components/dash/views/Overview";

export const metadata = { title: "Overview" };

export default function Page() {
  return (
    <Suspense>
      <Overview />
    </Suspense>
  );
}
