"use client";

import { useState } from "react";
import { Loader2, RotateCw } from "lucide-react";

export function ResendMessageButton({
    messageId,
    onResend,
}: {
    messageId: string;
    onResend: (id: string) => void;
}) {
    const [isResending, setIsResending] = useState(false);

    async function handleClick() {
        setIsResending(true);
        onResend(messageId);
        await new Promise((resolve) => window.setTimeout(resolve, 900));
        setIsResending(false);
    }

    return (
        <button
            type="button"
            onClick={handleClick}
            disabled={isResending}
            aria-label="Resend message"
            className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground disabled:opacity-60"
        >
            {isResending ? (
                <Loader2 className="size-3.5 animate-spin" />
            ) : (
                <RotateCw className="size-3.5" />
            )}
        </button>
    );
}
