// POST /api/orders/[id]/call — "Call me about this order": rings the
// farmer with Sakhi's order call again (the farmer of the order, or admin).
import { handler, HttpError } from "@/lib/api";
import { loadOrderFor } from "@/lib/orders/queries";
import { callsEnabled, placeOrderCall } from "@/lib/voice-call";

export const POST = handler<undefined, undefined, { id: string }>({ roles: ["FARMER", "ADMIN"] }, async ({ user, params }) => {
  const order = await loadOrderFor(user, params.id);
  if (user.role === "FARMER" && order.farmerId !== user.id) throw new HttpError(403, "This isn't your order");
  if (!callsEnabled()) throw new HttpError(503, "Order calls aren't switched on for this server.");
  const r = await placeOrderCall(order.id);
  if (!r.placed) throw new HttpError(502, r.reason ?? "We couldn't place the call.");
  return { ok: true };
});
