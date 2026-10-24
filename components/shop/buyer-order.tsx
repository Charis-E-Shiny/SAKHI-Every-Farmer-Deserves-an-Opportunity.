// Buyer tracking page composition: order detail + (later) handover and
// feedback panels for this role.
"use client";

import { OrderDetail } from "./order-detail";

/** Buyer view of one order. */
export function BuyerOrder({ id, backHref }: { id: string; backHref?: string }) {
  return <OrderDetail id={id} backHref={backHref} />;
}
