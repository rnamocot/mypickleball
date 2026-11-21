import { Suspense } from "react";
import { Memberships } from "@/components/dash/views/Memberships";

export const metadata = { title: "Memberships" };

export default function Page() {
  return (
    <Suspense>
      <Memberships />
    </Suspense>
  );
}
