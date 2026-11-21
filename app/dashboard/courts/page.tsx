import { Suspense } from "react";
import { Courts } from "@/components/dash/views/Courts";

export const metadata = { title: "Courts" };

export default function Page() {
  return (
    <Suspense>
      <Courts />
    </Suspense>
  );
}
