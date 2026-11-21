import { Suspense } from "react";
import { Staff } from "@/components/dash/views/Staff";

export const metadata = { title: "Staff" };

export default function Page() {
  return (
    <Suspense>
      <Staff />
    </Suspense>
  );
}
