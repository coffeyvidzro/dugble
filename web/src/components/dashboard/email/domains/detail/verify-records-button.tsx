"use client";

import { RefreshCw } from "lucide-react";
import { useState } from "react";

import { useVerifySenderDomain } from "@/hooks/queries/use-sender-domains-api";
import { cn } from "@/lib/utils";

export function VerifyRecordsButton({ domainId }: { domainId: string }) {
  const verifyDomain = useVerifySenderDomain(domainId);
  const [justVerified, setJustVerified] = useState(false);

  function handleClick() {
    verifyDomain.mutate(undefined, {
      onSuccess: () => {
        setJustVerified(true);
        window.setTimeout(() => setJustVerified(false), 2000);
      },
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={verifyDomain.isPending}
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border border-border/60 px-3.5 py-2 text-sm font-medium text-foreground transition-colors hover:border-foreground/30 disabled:opacity-60",
        justVerified && "border-signal/40 text-signal",
      )}
    >
      <RefreshCw
        className={cn("size-3.5", verifyDomain.isPending && "animate-spin")}
      />
      {verifyDomain.isPending
        ? "Checking DNS…"
        : justVerified
          ? "Records updated"
          : "Verify records"}
    </button>
  );
}
