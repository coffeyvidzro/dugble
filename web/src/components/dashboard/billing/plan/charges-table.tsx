import { Receipt } from "lucide-react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { SubscriptionCharge } from "@/types/billing-api";
import { formatDate, formatMinorUnits } from "../shared/format";

const STATUS_TONE: Record<string, string> = {
  applied: "text-signal",
  failed: "text-danger",
  pending: "text-pending",
};

export function ChargesTable({ charges }: { charges: SubscriptionCharge[] }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b pb-4">
        <CardTitle>Billing history</CardTitle>
        <CardDescription>
          Every charge applied to your subscription.
        </CardDescription>
      </CardHeader>

      {charges.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <div className="flex size-11 items-center justify-center rounded-full border border-dashed border-border bg-muted/40">
            <Receipt className="size-4.5 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">No charges yet.</p>
        </div>
      ) : (
        <ul className="divide-y divide-border/40">
          {charges.map((charge) => (
            <li
              key={charge.id}
              className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium capitalize text-foreground">
                  {charge.plan_code}
                </p>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {formatDate(charge.period_start)} –{" "}
                  {formatDate(charge.period_end)}
                  {" · "}
                  <span className="font-mono">{charge.reference_id}</span>
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-4">
                <span
                  className={cn(
                    "text-xs font-medium capitalize",
                    STATUS_TONE[charge.status] ?? "text-muted-foreground",
                  )}
                >
                  {charge.status}
                </span>
                <span className="font-mono text-red-600 text-sm font-semibold text-foreground">
                  {formatMinorUnits(charge.amount_units, charge.currency)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
