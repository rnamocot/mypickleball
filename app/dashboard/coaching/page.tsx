import { Suspense } from "react";
import { Coaching } from "@/components/dash/views/Coaching";

export const metadata = { title: "Coaching" };

export default function Page() {
  return (
    <Suspense>
      <Coaching />
    </Suspense>
  );
}
