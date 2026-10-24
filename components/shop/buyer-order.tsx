// Buyer tracking page composition: order detail + the handover code panel
// while a rider is on the way / the order is ready for pickup.
"use client";

import type { SerializedOrder } from "@/lib/orders/queries";
import { HandoverPanel, needsHandover } from "./handover-panel";
import { OrderDetail } from "./order-detail";

/** Buyer view of one order. */
export function BuyerOrder({ id, backHref, actions }: { id: string; backHref?: string; actions?: (o: SerializedOrder) => React.ReactNode }) {
  return (
    <OrderDetail
      id={id}
      backHref={backHref}
      actions={actions}
      handover={(order, refresh) => (needsHandover(order) ? <HandoverPanel order={order} onChange={refresh} /> : null)}
    />
  );
}
