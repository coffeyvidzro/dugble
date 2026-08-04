"use client";

import { useState, useTransition } from "react";

import { RefreshCw } from "lucide-react";

import { verifyDomainAction } from "@/components/dashboard/email/domains/utils/actions";
import { cn } from "@/lib/utils";

export function VerifyRecordsButton({ domainId }: { domainId: string }) {
    const [isPending, startTransition] = useTransition();
    const [justVerified, setJustVerified] = useState(false);

    function handleClick() {
        startTransition(async () => {
            await verifyDomainAction(domainId);
            setJustVerified(true);
            setTimeout(() => setJustVerified(false), 2000);
        });
    }

    return (
        <button
            type="button"
            onClick={handleClick}
            disabled={isPending}
            className={cn(
                "inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border border-border/60 px-3.5 py-2 text-sm font-medium text-foreground transition-colors hover:border-foreground/30 disabled:opacity-60",
                justVerified && "border-signal/40 text-signal",
            )}
        >
            <RefreshCw
                className={cn("size-3.5", isPending && "animate-spin")}
            />
            {isPending
                ? "Checking DNS…"
                : justVerified
                  ? "Records updated"
                  : "Verify records"}
        </button>
    );
}
