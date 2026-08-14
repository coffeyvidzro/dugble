import { Check } from "lucide-react";

export function LegalSummaryCard({ points }: { points: string[] }) {
    return (
        <div className="rounded-2xl border border-signal/30 bg-signal/4 p-6">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-signal">
                In plain English
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
                A quick summary - the full terms below are what actually governs
                your use of Dugble.
            </p>
            <ul className="mt-4 space-y-2.5">
                {points.map((point) => (
                    <li
                        key={point}
                        className="flex items-start gap-2.5 text-sm leading-6 text-muted-foreground"
                    >
                        <Check className="mt-0.5 size-3.5 shrink-0 text-signal" />
                        {point}
                    </li>
                ))}
            </ul>
        </div>
    );
}
