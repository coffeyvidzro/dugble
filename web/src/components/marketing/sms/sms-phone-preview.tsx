"use client";

import { useEffect, useState } from "react";

import { Reveal } from "@/components/marketing/reveal";
import { cn } from "@/lib/utils";

type Status = "queued" | "sent" | "delivered";

const sequence: Status[] = ["queued", "sent", "delivered"];

const copy: Record<Status, string> = {
  queued: "Sending…",
  sent: "Sent",
  delivered: "Delivered",
};

const dotClass: Record<Status, string> = {
  queued: "bg-pending",
  sent: "bg-foreground/50",
  delivered: "bg-signal",
};

const textClass: Record<Status, string> = {
  queued: "text-pending",
  sent: "text-foreground/70",
  delivered: "text-signal",
};

export function SmsPhonePreview() {
  const [step, setStep] = useState(-1);
  const [_cycle, setCycle] = useState(0);

  useEffect(() => {
    setStep(-1);
    const timers = [
      setTimeout(() => setStep(0), 500),
      setTimeout(() => setStep(1), 1500),
      setTimeout(() => setStep(2), 2600),
      setTimeout(() => setCycle((c) => c + 1), 5400),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const status = step >= 0 ? sequence[step] : null;

  return (
    <Reveal className="relative mx-auto w-full max-w-70">
      <div className="relative overflow-hidden rounded-[2.5rem] border-10 border-border dark:border-muted bg-background shadow-lg shadow-black/5 dark:shadow-2xl dark:shadow-black/40">
        <div className="absolute left-1/2 top-0 z-10 h-5 w-28 -translate-x-1/2 rounded-b-2xl bg-border dark:bg-muted" />
        <div className="flex flex-col gap-10 px-5 pb-8 pt-11">
          <div className="flex items-center gap-2.5 border-b pb-3">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted font-heading text-xs font-semibold">
              D
            </div>
            <div>
              <p className="text-sm font-medium leading-tight">Dugble</p>
              <p className="font-mono text-[10px] leading-tight text-muted-foreground">
                SMS · shortcode 33482
              </p>
            </div>
          </div>

          <div
            className={cn(
              "max-w-[88%] rounded-2xl rounded-tl-sm bg-muted px-4 py-2.5 text-sm leading-6 transition-all duration-500 motion-reduce:transition-none",
              step >= 0
                ? "translate-y-0 opacity-100"
                : "translate-y-2 opacity-0",
            )}
          >
            Your Dugble code is{" "}
            <span className="font-mono font-semibold text-signal">482 193</span>
            . Expires in 5 minutes.
          </div>

          <div className="flex h-4 items-center gap-2 pl-1 font-mono text-[11px]">
            <span
              className={cn(
                "size-1.5 rounded-full transition-colors duration-300",
                status ? dotClass[status] : "bg-muted-foreground/30",
              )}
            />
            <span
              className={cn(
                "transition-colors duration-300",
                status ? textClass[status] : "text-transparent",
              )}
            >
              {status ? copy[status] : "—"}
            </span>
          </div>
        </div>
      </div>
    </Reveal>
  );
}
