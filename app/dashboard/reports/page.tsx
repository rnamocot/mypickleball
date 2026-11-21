import { Suspense } from "react";
import { Reports } from "@/components/dash/views/Reports";

export const metadata = { title: "Reports" };

export default function Page() {
  return (
    <Suspense>
      <Reports />
    </Suspense>
  );
}
