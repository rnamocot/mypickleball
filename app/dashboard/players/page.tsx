import { Suspense } from "react";
import { Players } from "@/components/dash/views/Players";

export const metadata = { title: "Players" };

export default function Page() {
  return (
    <Suspense>
      <Players />
    </Suspense>
  );
}
