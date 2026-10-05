"use client";

import { Loader2, ShieldCheck } from "lucide-react";
import dynamic from "next/dynamic";
import { useState } from "react";
import { SectionCardHeader } from "@/components/dashboard/profile/section-card-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  useConfirmTotp,
  useEnrollTotp,
  useMfaStatus,
} from "@/hooks/queries/use-security";
import { cn } from "@/lib/utils";
import { DisableMfaDialog } from "./disable-mfa-dialog";

const EnrollTotpDialog = dynamic(
  () => import("./enroll-totp-dialog").then((mod) => mod.EnrollTotpDialog),
  { ssr: false },
);

export function TwoFactorCard() {
  const status = useMfaStatus();
  const enrollment = useEnrollTotp();
  const confirmation = useConfirmTotp();
  const [enrollOpen, setEnrollOpen] = useState(false);
  const [disableOpen, setDisableOpen] = useState(false);

  const enabled = status.data?.enabled ?? false;

  function startEnrollment() {
    enrollment.reset();
    confirmation.reset();
    enrollment.mutate();
    setEnrollOpen(true);
  }

  function handleEnrollOpenChange(open: boolean) {
    setEnrollOpen(open);
    if (!open) {
      enrollment.reset();
      confirmation.reset();
    }
  }

  return (
    <Card className="overflow-hidden border-border/40 shadow-sm">
      <SectionCardHeader
        icon={ShieldCheck}
        title="Two-factor authentication"
        description="Require a code from an authenticator app when you sign in."
      />
      <CardContent className="flex flex-wrap items-center justify-between gap-4 py-6">
        {status.isPending ? (
          <Loader2 className="size-4 animate-spin text-muted-foreground" />
        ) : status.isError ? (
          <p className="text-sm text-danger">
            Couldn&apos;t load two-factor status.
          </p>
        ) : (
          <>
            <span
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium",
                enabled
                  ? "border-signal/30 bg-signal/10 text-signal"
                  : "border-border/60 text-muted-foreground",
              )}
            >
              <span
                className={cn(
                  "size-1.5 rounded-full",
                  enabled ? "bg-signal" : "bg-muted-foreground",
                )}
              />
              {enabled ? "Enabled" : "Not enabled"}
            </span>
            {enabled ? (
              <Button variant="outline" onClick={() => setDisableOpen(true)}>
                Turn off
              </Button>
            ) : (
              <Button onClick={startEnrollment}>Set up authenticator</Button>
            )}
          </>
        )}
      </CardContent>

      {enrollOpen && (
        <EnrollTotpDialog
          open
          onOpenChange={handleEnrollOpenChange}
          enrollment={enrollment}
          confirmation={confirmation}
        />
      )}
      <DisableMfaDialog open={disableOpen} onOpenChange={setDisableOpen} />
    </Card>
  );
}
