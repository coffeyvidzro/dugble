// src/components/dashboard/billing/wallet/top-up-dialog.tsx

"use client";

import { AlertCircle, ExternalLink, Loader2 } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTopUpWallet } from "@/hooks/queries/use-billing-api";
import type { TopUpResponse } from "@/types/billing-api";

export function TopUpDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const topUp = useTopUpWallet();
  const [amountInput, setAmountInput] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [checkout, setCheckout] = useState<TopUpResponse | null>(null);

  function reset() {
    setAmountInput("");
    setDescription("");
    setError(null);
    setCheckout(null);
    topUp.reset();
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const amountUnits = Math.round(parseFloat(amountInput || "0") * 100);
    if (!amountUnits || amountUnits <= 0) {
      setError("Enter an amount greater than zero.");
      return;
    }
    setError(null);

    topUp.mutate(
      {
        amount_units: amountUnits,
        description: description.trim() || undefined,
      },
      {
        onSuccess: (result) => {
          setCheckout(result);
          window.open(result.checkout_url, "_blank", "noopener,noreferrer");
        },
        onError: (err) => {
          setError(
            err instanceof Error ? err.message : "Couldn't start checkout.",
          );
        },
      },
    );
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) reset();
      }}
    >
      <DialogContent className="sm:max-w-sm border-border/40 shadow-xl">
        {checkout ? (
          <>
            <DialogHeader>
              <DialogTitle>Complete your payment</DialogTitle>
              <DialogDescription>
                We opened a secure checkout in a new tab. Your balance updates
                automatically once payment is confirmed.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-4">
              <a
                href={checkout.checkout_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary underline underline-offset-2"
              >
                Open checkout again
                <ExternalLink className="size-3.5" />
              </a>
              <p className="text-xs text-muted-foreground">
                Reference:{" "}
                <span className="font-mono">{checkout.client_reference}</span>
              </p>
            </div>
            <DialogFooter className="border-t border-border/40 pt-4">
              <Button type="button" onClick={() => onOpenChange(false)}>
                Done
              </Button>
            </DialogFooter>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Top up wallet</DialogTitle>
              <DialogDescription>
                You&apos;ll be redirected to a secure checkout to complete
                payment.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-6">
              {error && (
                <div className="flex items-start gap-2 rounded-lg border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
                  <AlertCircle className="mt-0.5 size-4 shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="topup-amount">Amount</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    $
                  </span>
                  <Input
                    id="topup-amount"
                    inputMode="decimal"
                    value={amountInput}
                    onChange={(event) =>
                      setAmountInput(event.target.value.replace(/[^0-9.]/g, ""))
                    }
                    placeholder="0.00"
                    className="pl-7"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="topup-description">
                  Description (optional)
                </Label>
                <Input
                  id="topup-description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Wallet top-up"
                />
              </div>
            </div>

            <DialogFooter className="border-t border-border/40 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={topUp.isPending}>
                {topUp.isPending ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : null}
                {topUp.isPending ? "Starting checkout…" : "Continue"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
