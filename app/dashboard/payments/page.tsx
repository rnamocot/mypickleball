import { Suspense } from "react";
import { Payments } from "@/components/dash/views/Payments";

export const metadata = { title: "Payments" };

export default function Page() {
  return (
    <Suspense>
      <Payments />
    </Suspense>
  );
}
