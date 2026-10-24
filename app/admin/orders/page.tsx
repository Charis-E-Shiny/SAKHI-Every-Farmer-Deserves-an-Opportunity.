// /admin/orders — order monitoring, disputes and refunds.
import type { Metadata } from "next";
import { Suspense } from "react";
import { OrdersMonitor } from "@/components/admin/orders-monitor";

export const metadata: Metadata = { title: "Orders" };

/** Admin orders (Suspense for the ?status= filter). */
export default function AdminOrdersPage() {
  return (
    <Suspense>
      <OrdersMonitor />
    </Suspense>
  );
}
