import { cn } from "@/lib/utils";

export function CodePanel({
    label,
    tone = "muted",
    code,
}: {
    label: string;
    tone?: "muted" | "signal";
    code: string;
}) {
    return (
        <div className="group overflow-hidden rounded-2xl border bg-card transition-colors duration-300 hover:border-foreground/20">
            <div
                className={cn(
                    "flex items-center justify-between border-b px-4 py-2.5 font-mono text-[11px]",
                    tone === "signal" ? "text-signal" : "text-muted-foreground",
                )}
            >
                <span>{label}</span>
                {tone === "signal" && (
                    <span className="relative flex size-1.5">
                        <span className="absolute inline-flex size-full animate-ping rounded-full bg-signal opacity-60" />
                        <span className="relative inline-flex size-1.5 rounded-full bg-signal" />
                    </span>
                )}
            </div>
            <pre className="overflow-x-auto p-4 font-mono text-[13px] leading-6 text-foreground/90">
                {code}
            </pre>
        </div>
    );
}
