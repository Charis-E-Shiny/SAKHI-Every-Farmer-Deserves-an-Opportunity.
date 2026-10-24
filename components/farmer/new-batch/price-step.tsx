// Wizard step 3: the farmer sets their price per unit. The indicative
// price advisor panel renders above the input when available.
"use client";

import { QtyStepper } from "@/components/common/qty-stepper";
import { useI18n } from "@/components/providers/i18n-provider";
import { Label } from "@/components/ui/label";
import type { DraftFields } from "./types";

/**
 * @param advisor - optional advisor panel (suggested price, range, trend)
 */
export function PriceStep({
  fields,
  set,
  advisor,
}: {
  fields: DraftFields;
  set: (patch: Partial<DraftFields>) => void;
  advisor?: React.ReactNode;
}) {
  const { t } = useI18n();
  return (
    <div className="space-y-6">
      {advisor}
      <div className="space-y-2">
        <Label htmlFor="price" className="text-[15px]">
          {t("batch.price")} · ₹ / {fields.unit}
        </Label>
        <QtyStepper id="price" size="lg" value={fields.price} onChange={(price) => set({ price })} step={1} min={1} suffix={`/${fields.unit}`} />
        <p className="text-xs text-muted-foreground">
          Buyers see this price. A 5% platform fee is deducted from your payout, never added to the buyer&apos;s bill.
        </p>
      </div>
    </div>
  );
}
