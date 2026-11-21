import { Suspense } from "react";
import { OpenPlay } from "@/components/dash/views/OpenPlay";

export const metadata = { title: "Open play" };

export default function Page() {
  return (
    <Suspense>
      <OpenPlay />
    </Suspense>
  );
}
