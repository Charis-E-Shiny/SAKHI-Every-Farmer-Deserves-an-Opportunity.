// Buyer tracking page composition: order detail + the handover code panel
// while a rider is on the way / the order is ready for pickup.
"use client";

import { HandoverPanel, needsHandover } from "./handover-panel";
import { OrderDetail } from "./order-detail";

/** Buyer view of one order. */
export function BuyerOrder({ id, backHref }: { id: string; backHref?: string }) {
  return (
    <OrderDetail
      id={id}
      backHref={backHref}
      handover={(order, refresh) => (needsHandover(order) ? <HandoverPanel order={order} onChange={refresh} /> : null)}
    />
  );
}
