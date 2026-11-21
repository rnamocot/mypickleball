import { Suspense } from "react";
import { Bookings } from "@/components/dash/views/Bookings";

export const metadata = { title: "Bookings" };

export default function Page() {
  return (
    <Suspense>
      <Bookings />
    </Suspense>
  );
}
