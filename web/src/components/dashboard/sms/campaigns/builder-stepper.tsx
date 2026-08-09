import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = ["Details", "Audience", "Schedule", "Review"] as const;

export function BuilderStepper({ currentStep }: { currentStep: number }) {
    return (
        <ol className="flex items-center gap-2 sm:gap-4">
            {STEPS.map((label, index) => {
                const isComplete = index < currentStep;
                const isCurrent = index === currentStep;

                return (
                    <li key={label} className="flex flex-1 items-center gap-2 sm:gap-3">
                        <div className="flex items-center gap-2">
                            <span
                                className={cn(
                                    "flex size-7 shrink-0 items-center justify-center rounded-full border font-mono text-xs font-medium transition-colors",
                                    isComplete
                                        ? "border-signal bg-signal text-white"
                                        : isCurrent
                                          ? "border-primary bg-primary text-primary-foreground"
                                          : "border-border/60 bg-muted/30 text-muted-foreground",
                                )}
                            >
                                {isComplete ? <Check className="size-3.5" /> : index + 1}
                            </span>
                            <span
                                className={cn(
                                    "hidden text-sm font-medium sm:inline",
                                    isCurrent ? "text-foreground" : "text-muted-foreground",
                                )}
                            >
                                {label}
                            </span>
                        </div>
                        {index < STEPS.length - 1 && (
                            <span
                                aria-hidden="true"
                                className={cn(
                                    "h-px flex-1 transition-colors",
                                    isComplete ? "bg-signal" : "bg-border/60",
                                )}
                            />
                        )}
                    </li>
                );
            })}
        </ol>
    );
}
