import { Suspense } from "react";
import { Events } from "@/components/dash/views/Events";

export const metadata = { title: "Leagues & events" };

export default function Page() {
  return (
    <Suspense>
      <Events />
    </Suspense>
  );
}
