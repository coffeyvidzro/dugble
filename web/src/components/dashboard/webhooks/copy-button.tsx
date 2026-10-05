"use client";

import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { cn } from "@/lib/utils";

export function CopyButton({
  value,
  label = "Copy",
  copiedLabel = "Copied",
  className,
}: {
  value: string;
  label?: string;
  copiedLabel?: string;
  className?: string;
}) {
  const { copied, copy } = useCopyToClipboard(2000);

  return (
    <Button
      type="button"
      variant={copied ? "default" : "secondary"}
      onClick={() => void copy(value)}
      className={cn(
        "shrink-0 transition-all",
        copied && "bg-signal text-white hover:bg-signal/90",
        className,
      )}
    >
      {copied ? (
        <Check className="mr-2 size-4" />
      ) : (
        <Copy className="mr-2 size-4" />
      )}
      {copied ? copiedLabel : label}
    </Button>
  );
}
