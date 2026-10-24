// Printable invoice for an order (bulk buyers download it as PDF via the
// browser's print dialog). Items stack on phones, become a table on wider
// screens; app chrome is hidden when printing.
"use client";

import { ArrowLeft, Download } from "lucide-react";
import Link from "next/link";
import { LogoMark } from "@/components/brand/logo";
import { StatusBadge } from "@/components/common/status-badge";
import { useI18n } from "@/components/providers/i18n-provider";
import { Button } from "@/components/ui/button";
import { formatDate, formatDateTime, formatINR, formatQty } from "@/lib/format";
import { localizeTitle } from "@/lib/i18n/titles";
import type { SerializedOrder } from "@/lib/orders/queries";

/**
 * @param order - serialized order (buyer / farmer / admin view)
 * @param buyerAddress - billing address line
 */
export function Invoice({ order, backHref, buyerAddress }: { order: SerializedOrder; backHref: string; buyerAddress: string | null }) {
  const { tx, lang } = useI18n();
  const number = `INV-${order.code.replace("FF-", "")}`;
  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 print:hidden">
        <Link href={backHref} className="inline-flex min-h-9 items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> {tx("Order")}
        </Link>
        <Button onClick={() => window.print()} variant="brand">
          <Download /> {tx("Download PDF")}
        </Button>
      </div>

      <article className="rounded-3xl border bg-card p-5 sm:p-8 print:rounded-none print:border-0 print:p-0">
        <header className="flex flex-wrap items-start justify-between gap-4 border-b pb-5">
          <div className="flex items-center gap-2">
            <LogoMark className="size-9" />
            <div>
              <p className="text-lg font-semibold">FoodFlow</p>
              <p className="text-xs text-muted-foreground">{tx("Farm-to-table marketplace · Bengaluru pilot")}</p>
            </div>
          </div>
          <div className="sm:text-right">
            <p className="text-2xl font-semibold tracking-tight">{tx("Invoice")}</p>
            <p className="font-mono text-sm">{number}</p>
            <p className="text-sm text-muted-foreground">{formatDate(order.createdAt, lang)}</p>
          </div>
        </header>

        <section className="grid gap-5 border-b py-5 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{tx("Sold by")}</p>
            <p className="mt-1 font-semibold">{order.farmer.farmName ?? order.farmer.name}</p>
            <p className="text-sm">{order.farmer.name}</p>
            <p className="text-sm text-muted-foreground">{order.farmer.village && tx(order.farmer.village)}, {tx("Bengaluru Rural")}</p>
            {order.farmer.phone && <p className="text-sm text-muted-foreground">{order.farmer.phone}</p>}
          </div>
          <div className="sm:text-right">
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{tx("Billed to")}</p>
            <p className="mt-1 font-semibold">{order.buyer.name}</p>
            <p className="text-sm text-muted-foreground break-words">{buyerAddress ?? order.addressLine}</p>
            <p className="text-sm text-muted-foreground">{tx(order.area)}, {tx("Bengaluru")}</p>
          </div>
        </section>

        <section className="py-5">
          <div className="hidden grid-cols-[1fr_100px_100px_110px] gap-3 border-b pb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase sm:grid print:grid">
            <span>{tx("Item")}</span>
            <span className="text-right">{tx("Qty")}</span>
            <span className="text-right">{tx("Rate")}</span>
            <span className="text-right">{tx("Amount")}</span>
          </div>
          <ul className="divide-y">
            {order.items.map((it) => (
              <li key={it.id} className="grid grid-cols-2 gap-x-3 gap-y-1 py-3 sm:grid-cols-[1fr_100px_100px_110px] print:grid-cols-[1fr_100px_100px_110px]">
                <span className="col-span-2 font-medium sm:col-span-1 print:col-span-1">{localizeTitle(it.title, lang)}</span>
                <span className="tabular text-sm text-muted-foreground sm:text-right sm:text-foreground print:text-right">{formatQty(it.qty, it.unit, lang)}</span>
                <span className="tabular text-right text-sm text-muted-foreground sm:text-foreground print:text-foreground">
                  {formatINR(it.unitPrice, true)}
                  <span className="sm:hidden print:hidden"> /{tx(it.unit === "litre" ? "L" : it.unit)}</span>
                </span>
                <span className="tabular col-span-2 text-right font-medium sm:col-span-1 print:col-span-1">{formatINR(it.qty * it.unitPrice, true)}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="ml-auto max-w-xs space-y-1.5 border-t pt-4 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{tx("Subtotal")}</span>
            <span className="tabular">{formatINR(order.subtotal, true)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{tx("Delivery")}</span>
            <span className="tabular">{order.deliveryFee ? formatINR(order.deliveryFee, true) : "-"}</span>
          </div>
          <div className="flex justify-between border-t pt-2 text-base font-semibold">
            <span>{tx("Total")}</span>
            <span className="tabular">{formatINR(order.total, true)}</span>
          </div>
        </section>

        <footer className="mt-6 grid gap-3 border-t pt-4 text-xs text-muted-foreground sm:grid-cols-2">
          <div>
            <p>
              {tx("Order")} <span className="font-mono">{order.code}</span> · {tx(order.type === "BULK" ? "Bulk procurement" : "Retail")} · {tx(order.fulfilment === "PICKUP" ? "Self-pickup" : "Doorstep delivery")}
            </p>
            {order.payment && (
              <p className="mt-1 flex flex-wrap items-center gap-1.5">
                {tx("Payment")} <StatusBadge status={order.payment.status} className="print:border print:bg-transparent" /> {tx(order.payment.method)} · {tx("ref")} {order.payment.ref}
                {order.payment.capturedAt ? ` · ${formatDateTime(order.payment.capturedAt, lang)}` : ""}
              </p>
            )}
          </div>
          <p className="sm:text-right">{tx("FoodFlow's 5% platform commission is withheld from the seller's payout and is not charged to the buyer. Prices are inclusive of applicable taxes for fresh produce.")}</p>
        </footer>
      </article>
    </div>
  );
}
